-- ============================================================
-- 社交媒体数据聚合面板 - 数据库表
-- ============================================================

-- 社交媒体平台配置表
CREATE TABLE IF NOT EXISTS social_media_accounts (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  platform VARCHAR(50) NOT NULL,  -- bilibili, xiaohongshu, douyin, weibo, youtube, twitter
  profile_url TEXT NOT NULL,
  display_name VARCHAR(255),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, platform)
);

-- 社交媒体数据快照表（历史记录）
CREATE TABLE IF NOT EXISTS social_media_snapshots (
  id BIGSERIAL PRIMARY KEY,
  account_id BIGINT NOT NULL REFERENCES social_media_accounts(id) ON DELETE CASCADE,
  followers_count BIGINT DEFAULT 0,    -- 粉丝数
  following_count BIGINT DEFAULT 0,    -- 关注数
  posts_count BIGINT DEFAULT 0,        -- 发帖数
  likes_count BIGINT DEFAULT 0,        -- 获赞数
  views_count BIGINT DEFAULT 0,        -- 播放/阅读量
  notes TEXT,                          -- 备注
  captured_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_social_accounts_user ON social_media_accounts(user_id);
CREATE INDEX IF NOT EXISTS idx_social_accounts_platform ON social_media_accounts(platform);
CREATE INDEX IF NOT EXISTS idx_social_snapshots_account ON social_media_snapshots(account_id, captured_at DESC);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_social_accounts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_social_accounts_updated_at
BEFORE UPDATE ON social_media_accounts
FOR EACH ROW
EXECUTE FUNCTION update_social_accounts_updated_at();

-- RLS 策略：用户只能看到自己的账号配置
ALTER TABLE social_media_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_media_snapshots ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "用户只能查看自己的社交账号" ON social_media_accounts;
DROP POLICY IF EXISTS "用户只能查看自己的社交数据快照" ON social_media_snapshots;
DROP POLICY IF EXISTS "用户只能插入自己的社交账号" ON social_media_accounts;
DROP POLICY IF EXISTS "用户只能更新自己的社交账号" ON social_media_accounts;
DROP POLICY IF EXISTS "用户只能删除自己的社交账号" ON social_media_accounts;
DROP POLICY IF EXISTS "用户只能插入自己的社交数据快照" ON social_media_snapshots;
DROP POLICY IF EXISTS "用户只能删除自己的社交数据快照" ON social_media_snapshots;

CREATE POLICY "用户只能查看自己的社交账号" ON social_media_accounts
FOR SELECT USING (user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "用户只能插入自己的社交账号" ON social_media_accounts
FOR INSERT WITH CHECK (user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "用户只能更新自己的社交账号" ON social_media_accounts
FOR UPDATE USING (user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "用户只能删除自己的社交账号" ON social_media_accounts
FOR DELETE USING (user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email'));

CREATE POLICY "用户只能查看自己的社交数据快照" ON social_media_snapshots
FOR SELECT USING (account_id IN (
  SELECT id FROM social_media_accounts
  WHERE user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email')
));

CREATE POLICY "用户只能插入自己的社交数据快照" ON social_media_snapshots
FOR INSERT WITH CHECK (account_id IN (
  SELECT id FROM social_media_accounts
  WHERE user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email')
));

CREATE POLICY "用户只能删除自己的社交数据快照" ON social_media_snapshots
FOR DELETE USING (account_id IN (
  SELECT id FROM social_media_accounts
  WHERE user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email')
));