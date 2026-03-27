-- ============================================
-- Supabase auth.users 同步到 sys_users (简化版)
-- ============================================

-- 先检查 sys_users 表是否存在必需字段
DO $$
BEGIN
    -- 确保 email 字段有唯一约束
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraints
        WHERE conname = 'sys_users_email_key'
    ) THEN
        ALTER TABLE sys_users ADD CONSTRAINT sys_users_email_key UNIQUE (email);
    END IF;
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Constraint may already exist';
END $$;

-- 创建触发器函数：当新用户注册时自动创建 sys_users 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    v_username TEXT;
    v_nickname TEXT;
    v_display_name TEXT;
BEGIN
    -- 提取元数据，确保不为 NULL
    v_username := COALESCE(
        NEW.raw_user_meta_data->>'username',
        NEW.raw_user_meta_data->>'login',
        split_part(NEW.email, '@', 1),
        'user_' || SUBSTRING(NEW.id::text FROM 1 FOR 8)
    );

    v_nickname := COALESCE(
        NEW.raw_user_meta_data->>'nickname',
        NEW.raw_user_meta_data->>'name',
        v_username
    );

    v_display_name := COALESCE(
        NEW.raw_user_meta_data->>'name',
        NEW.raw_user_meta_data->>'nickname',
        v_username
    );

    -- 在 sys_users 中创建用户记录
    INSERT INTO public.sys_users (
        username,
        email,
        nickname,
        display_name,
        avatar_url,
        online_status,
        account_status,
        last_login_at,
        last_seen_at
    )
    VALUES (
        v_username,
        NEW.email,
        v_nickname,
        v_display_name,
        NEW.raw_user_meta_data->>'avatar_url',
        'offline',
        1,
        NOW(),
        NOW()
    )
    ON CONFLICT (email) DO UPDATE SET
        username = EXCLUDED.username,
        nickname = EXCLUDED.nickname,
        display_name = EXCLUDED.display_name,
        avatar_url = EXCLUDED.avatar_url,
        last_login_at = NOW(),
        last_seen_at = NOW();

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 创建触发器：新用户注册时自动调用
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 验证触发器已创建
SELECT
    '触发器创建成功' as status,
    EXISTS(SELECT 1 FROM pg_trigger WHERE tgname = 'on_auth_user_created') as trigger_exists;
