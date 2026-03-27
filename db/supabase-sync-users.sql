-- ============================================
-- Supabase auth.users 同步到 sys_users
-- 包含：新用户自动分配 role_id = 3 (普通用户角色)
-- ============================================

-- 1. 创建触发器函数：当新用户注册时自动创建 sys_users 记录并分配角色
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
new_user_id bigint;
BEGIN
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
           COALESCE(NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'login',
    split_part(NEW.email, '@', 1),
    'user_' || LEFT(NEW.id::text, 8)),
           NEW.email,
           COALESCE(NEW.raw_user_meta_data->>'nickname',
    NEW.raw_user_meta_data->>'name',
    COALESCE(NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'login',
    split_part(NEW.email, '@', 1))),
           COALESCE(NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'nickname',
    COALESCE(NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'login',
    split_part(NEW.email, '@', 1))),
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
                               last_seen_at = NOW()
                               RETURNING id INTO new_user_id;

-- 为新用户分配默认角色 (role_id = 3 - 普通用户)
IF new_user_id IS NOT NULL THEN
    INSERT INTO public.sys_user_role (user_id, role_id, create_time)
    VALUES (new_user_id, 3, NOW())
   ON CONFLICT DO NOTHING;
END IF;

RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. 创建触发器：新用户注册时自动调用
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- 3. 为现有用户创建 sys_users 记录并分配默认角色（如果还没有）
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
SELECT
    COALESCE(u.raw_user_meta_data->>'username',
  u.raw_user_meta_data->>'login',
  split_part(u.email, '@', 1),
  'user_' || LEFT(u.id::text, 8)) as username,
    u.email,
    COALESCE(u.raw_user_meta_data->>'nickname',
  u.raw_user_meta_data->>'name',
  COALESCE(u.raw_user_meta_data->>'username',
  u.raw_user_meta_data->>'login',
  split_part(u.email, '@', 1))) as nickname,
    COALESCE(u.raw_user_meta_data->>'name',
  u.raw_user_meta_data->>'nickname',
  COALESCE(u.raw_user_meta_data->>'username',
  u.raw_user_meta_data->>'login',
  split_part(u.email, '@', 1))) as display_name,
    u.raw_user_meta_data->>'avatar_url' as avatar_url,
    'offline' as online_status,
    1 as account_status,
    NOW() as last_login_at,
    NOW() as last_seen_at
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.sys_users s WHERE s.email = u.email
    )
ON CONFLICT (email) DO NOTHING;

-- 4. 为现有用户分配默认角色 (role_id = 3)
INSERT INTO public.sys_user_role (user_id, role_id, create_time)
SELECT
    s.id as user_id,
    3 as role_id,
    NOW() as create_time
FROM public.sys_users s
WHERE NOT EXISTS (
    SELECT 1 FROM public.sys_user_role ur WHERE ur.user_id = s.id
)
   ON CONFLICT DO NOTHING;

-- 5. 验证执行结果
SELECT
    '同步完成！' as status,
    (SELECT COUNT(*) FROM auth.users) as total_auth_users,
    (SELECT COUNT(*) FROM sys_users) as total_sys_users,
    (SELECT COUNT(*) FROM sys_user_role WHERE role_id = 3) as users_with_default_role;
