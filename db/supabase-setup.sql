-- ============================================
-- NebulaHub Supabase 完整配置脚本
-- 包含：用户同步 Trigger + RLS 策略
-- ============================================

-- ============================================
-- 第一部分：自动同步 auth.users 到 sys_users
-- ============================================

-- 创建触发器函数：当新用户注册时自动创建 sys_users 记录
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- 在 sys_users 中创建用户记录
  INSERT INTO public.sys_users (
    username,
    email,
    nickname,
    display_name,
    online_status,
    account_status,
    last_seen_at
  )
  VALUES (
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email, 'user_' || SUBSTRING(NEW.id FROM 1 FOR 8)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.raw_user_meta_data->>'username'),
    COALESCE(NEW.raw_user_meta_data->>'nickname', NEW.raw_user_meta_data->>'username'),
    'offline',
    1,
    NOW()
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 创建触发器：新用户注册时自动调用
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- 第二部分：配置 Row Level Security (RLS)
-- ============================================

-- 启用 sys_users 表的 RLS
ALTER TABLE public.sys_users ENABLE ROW LEVEL SECURITY;

-- 创建策略：用户可以看到所有用户的基本信息（用于显示好友、提及等）
CREATE POLICY "Anyone can view users"
  ON public.sys_users FOR SELECT
  USING (true);

-- 创建策略：用户只能更新自己的记录
CREATE POLICY "Users can update own record"
  ON public.sys_users FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.email = sys_users.email
      AND auth.users.id = auth.uid()
    )
  );

-- 创建策略：允许插入（由 Trigger 自动处理）
CREATE POLICY "Enable insert for authenticated users"
  ON public.sys_users FOR INSERT
  WITH CHECK (true);

-- ============================================
-- 第三部分：聊天室相关表的 RLS
-- ============================================

-- 启用 chat_rooms 表的 RLS
ALTER TABLE public.chat_rooms ENABLE ROW LEVEL SECURITY;

-- 策略：用户可以查看自己所在的聊天室
CREATE POLICY "Users can view own chat rooms"
  ON public.chat_rooms FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = chat_rooms.id
      AND room_members.user_id = auth.uid()::bigint
      AND room_members.deleted = 0
    )
    OR created_by = auth.uid()::bigint
  );

-- 策略：用户可以创建聊天室
CREATE POLICY "Users can create chat rooms"
  ON public.chat_rooms FOR INSERT
  WITH CHECK (created_by = auth.uid()::bigint);

-- 启用 room_members 表的 RLS
ALTER TABLE public.room_members ENABLE ROW LEVEL SECURITY;

-- 策略：用户可以查看自己所在的房间成员
CREATE POLICY "Users can view own room members"
  ON public.room_members FOR SELECT
  USING (
    user_id = auth.uid()::bigint
    OR EXISTS (
      SELECT 1 FROM room_members rm
      WHERE rm.room_id = room_members.room_id
      AND rm.user_id = auth.uid()::bigint
      AND rm.deleted = 0
    )
  );

-- ============================================
-- 第四部分：消息相关表的 RLS
-- ============================================

-- 启用 messages 表的 RLS
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 策略：用户可以查看自己所在房间的消息
CREATE POLICY "Users can view own room messages"
  ON public.messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = messages.room_id
      AND room_members.user_id = auth.uid()::bigint
      AND room_members.deleted = 0
    )
  );

-- 策略：用户可以发送消息
CREATE POLICY "Users can insert messages"
  ON public.messages FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()::bigint
    AND EXISTS (
      SELECT 1 FROM room_members
      WHERE room_members.room_id = room_id
      AND room_members.user_id = auth.uid()::bigint
      AND room_members.deleted = 0
    )
  );

-- 启用 message_reads 表的 RLS
ALTER TABLE public.message_reads ENABLE ROW LEVEL SECURITY;

-- 策略：用户可以查看自己的已读状态
CREATE POLICY "Users can view own message reads"
  ON public.message_reads FOR SELECT
  USING (user_id = auth.uid()::bigint);

-- ============================================
-- 第五部分：好友关系表的 RLS
-- ============================================

-- 启用 friend_requests 表的 RLS
ALTER TABLE public.friend_requests ENABLE ROW LEVEL SECURITY;

-- 策略：用户可以查看自己的好友请求（发送或接收）
CREATE POLICY "Users can view own friend requests"
  ON public.friend_requests FOR SELECT
  USING (
    sender_id = auth.uid()::bigint
    OR receiver_id = auth.uid()::bigint
  );

-- 策略：用户可以发送好友请求
CREATE POLICY "Users can insert friend requests"
  ON public.friend_requests FOR INSERT
  WITH CHECK (sender_id = auth.uid()::bigint);

-- 启用 friends 表的 RLS
ALTER TABLE public.friends ENABLE ROW LEVEL SECURITY;

-- 策略：用户可以查看自己的好友关系
CREATE POLICY "Users can view own friends"
  ON public.friends FOR SELECT
  USING (
    user_id = auth.uid()::bigint
    OR friend_id = auth.uid()::bigint
  );

-- ============================================
-- 第六部分：博客相关表的 RLS（公开读，作者写）
-- ============================================

-- 启用 blog_category 表的 RLS
ALTER TABLE public.blog_category ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog categories"
  ON public.blog_category FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can insert blog categories"
  ON public.blog_category FOR INSERT
  WITH CHECK (true);

-- 启用 blog_tag 表的 RLS
ALTER TABLE public.blog_tag ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view blog tags"
  ON public.blog_tag FOR SELECT
  USING (true);

-- 启用 blog_article 表的 RLS
ALTER TABLE public.blog_article ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published articles"
  ON public.blog_article FOR SELECT
  USING (status = 'PUBLISHED' OR author_id = auth.uid()::bigint);

CREATE POLICY "Authors can manage own articles"
  ON public.blog_article FOR ALL
  USING (author_id = auth.uid()::bigint);

-- ============================================
-- 第七部分：管理相关表的 RLS（仅管理员）
-- ============================================

-- 注意：管理表（sys_role, sys_menu, sys_user_role 等）
-- 需要在应用层控制访问，或者添加更严格的 RLS 策略

-- 创建一个辅助函数来检查用户是否有管理员角色
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_id UUID;
  is_admin BOOLEAN;
BEGIN
  user_id := auth.uid();
  IF user_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- 简单实现：检查用户是否有 admin 相关的 nickname 或 metadata
  -- 实际项目中应该查询角色表
  RETURN EXISTS (
    SELECT 1 FROM sys_users
    WHERE sys_users.email = auth.email()
    AND (
      nickname ILIKE '%admin%'
      OR username ILIKE '%admin%'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 验证安装
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'NebulaHub Supabase 配置完成！';
  RAISE NOTICE '============================================';
  RAISE NOTICE '已配置：';
  RAISE NOTICE '1. 新用户自动同步到 sys_users';
  RAISE NOTICE '2. sys_users RLS 策略';
  RAISE NOTICE '3. 聊天室 RLS 策略';
  RAISE NOTICE '4. 消息 RLS 策略';
  RAISE NOTICE '5. 好友关系 RLS 策略';
  RAISE NOTICE '6. 博客 RLS 策略';
  RAISE NOTICE '============================================';
END $$;
