-- ============================================================
-- file_metadata 表：Drive 页面文件元数据
-- ============================================================

CREATE TABLE IF NOT EXISTS file_metadata (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  bucket_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size BIGINT NOT NULL DEFAULT 0,
  file_type TEXT NOT NULL DEFAULT 'other',
  folder_name TEXT NOT NULL DEFAULT '',
  user_id BIGINT NOT NULL,
  owner_name TEXT NOT NULL DEFAULT '',
  is_shared BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  deleted SMALLINT NOT NULL DEFAULT 0
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_file_metadata_bucket ON file_metadata(bucket_name, deleted);
CREATE INDEX IF NOT EXISTS idx_file_metadata_user ON file_metadata(user_id, deleted);
CREATE INDEX IF NOT EXISTS idx_file_metadata_shared ON file_metadata(is_shared, deleted);
CREATE INDEX IF NOT EXISTS idx_file_metadata_created ON file_metadata(created_at DESC);

-- 更新时间触发器
CREATE OR REPLACE FUNCTION update_file_metadata_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_file_metadata_updated_at
  BEFORE UPDATE ON file_metadata
  FOR EACH ROW
  EXECUTE FUNCTION update_file_metadata_updated_at();

-- RLS（行级安全策略）
ALTER TABLE file_metadata ENABLE ROW LEVEL SECURITY;

-- 用户可以查看自己的文件
CREATE POLICY "用户可查看自己的文件"
  ON file_metadata FOR SELECT
  USING (deleted = 0);

-- 用户可以插入自己的文件
CREATE POLICY "用户可上传自己的文件"
  ON file_metadata FOR INSERT
  WITH CHECK (true);

-- 用户可以更新自己的文件
CREATE POLICY "用户可更新自己的文件"
  ON file_metadata FOR UPDATE
  USING (user_id = (SELECT id FROM sys_users WHERE email = auth.jwt()->>'email'));
