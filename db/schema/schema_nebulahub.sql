-- ============================================
-- NebulaHub 数据库 Schema (PostgreSQL)
-- 支持: IM聊天、群组/私聊、文件上传、好友关系
-- 适配: Spring Boot 3.2.2 + MyBatis-Plus 3.5.5
-- ============================================

-- ⚠️ 重要：执行前请先备份现有数据
-- ⚠️ 如果已有表，请先删除（按依赖顺序倒序删除）:
-- DROP TABLE IF EXISTS friends CASCADE;
-- DROP TABLE IF EXISTS friend_requests CASCADE;
-- DROP TABLE IF EXISTS message_reads CASCADE;
-- DROP TABLE IF EXISTS messages CASCADE;
-- DROP TABLE IF EXISTS room_members CASCADE;
-- DROP TABLE IF EXISTS chat_rooms CASCADE;
-- DROP TABLE IF EXISTS user_profiles CASCADE;
-- DROP TABLE IF EXISTS sys_users CASCADE;
-- DROP FUNCTION IF EXISTS update_updated_at_column() CASCADE;

-- ============================================
-- 第一部分：通用函数
-- ============================================

-- 自动更新 update_time 字段的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.update_time = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 第二部分：系统用户表 (MyBatis-Plus 使用 BIGSERIAL)
-- ============================================

CREATE TABLE IF NOT EXISTS sys_users (
    id BIGSERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255),
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    nickname VARCHAR(100),
    status INTEGER DEFAULT 1,
    last_login_at TIMESTAMP WITH TIME ZONE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_sys_users_username ON sys_users(username);
CREATE INDEX IF NOT EXISTS idx_sys_users_email ON sys_users(email);
CREATE INDEX IF NOT EXISTS idx_sys_users_status ON sys_users(status);

COMMENT ON TABLE sys_users IS '系统用户表';
COMMENT ON COLUMN sys_users.id IS '用户ID';
COMMENT ON COLUMN sys_users.username IS '用户名';
COMMENT ON COLUMN sys_users.password IS '密码';
COMMENT ON COLUMN sys_users.email IS '邮箱';
COMMENT ON COLUMN sys_users.phone IS '手机号';
COMMENT ON COLUMN sys_users.nickname IS '昵称';
COMMENT ON COLUMN sys_users.status IS '状态（0-禁用，1-启用）';
COMMENT ON COLUMN sys_users.last_login_at IS '最后登录时间';
COMMENT ON COLUMN sys_users.create_time IS '创建时间';
COMMENT ON COLUMN sys_users.update_time IS '更新时间';
COMMENT ON COLUMN sys_users.deleted IS '逻辑删除（0-未删除，1-已删除）';

DROP TRIGGER IF EXISTS update_sys_users_updated_at ON sys_users;
CREATE TRIGGER update_sys_users_updated_at
    BEFORE UPDATE ON sys_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 第三部分：用户档案表
-- ============================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    username VARCHAR(50) NOT NULL,
    display_name VARCHAR(100),
    avatar_name VARCHAR(255),
    avatar_url TEXT,
    avatar_size BIGINT,
    bio TEXT,
    status VARCHAR(20) DEFAULT 'offline' CHECK (status IN ('online', 'offline', 'busy', 'away')),
    last_seen_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_profiles_username ON user_profiles(username);
CREATE INDEX IF NOT EXISTS idx_user_profiles_status ON user_profiles(status);

COMMENT ON TABLE user_profiles IS '用户档案表';
COMMENT ON COLUMN user_profiles.id IS '档案ID';
COMMENT ON COLUMN user_profiles.user_id IS '关联用户ID';
COMMENT ON COLUMN user_profiles.username IS '用户名';
COMMENT ON COLUMN user_profiles.display_name IS '显示名称';
COMMENT ON COLUMN user_profiles.avatar_name IS '头像文件名称';
COMMENT ON COLUMN user_profiles.avatar_url IS '头像URL（MinIO）';
COMMENT ON COLUMN user_profiles.avatar_size IS '头像文件大小（字节）';
COMMENT ON COLUMN user_profiles.bio IS '个人简介';
COMMENT ON COLUMN user_profiles.status IS '在线状态';
COMMENT ON COLUMN user_profiles.last_seen_at IS '最后活跃时间';
COMMENT ON COLUMN user_profiles.create_time IS '创建时间';
COMMENT ON COLUMN user_profiles.update_time IS '更新时间';
COMMENT ON COLUMN user_profiles.deleted IS '逻辑删除';

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 第四部分：聊天室表
-- ============================================

CREATE TABLE IF NOT EXISTS chat_rooms (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200),
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('direct', 'group')),
    avatar_url TEXT,
    created_by BIGINT REFERENCES sys_users(id) ON DELETE SET NULL,
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_chat_rooms_type ON chat_rooms(type);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_last_message ON chat_rooms(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_rooms_created_by ON chat_rooms(created_by);

COMMENT ON TABLE chat_rooms IS '聊天室表';
COMMENT ON COLUMN chat_rooms.id IS '聊天室ID';
COMMENT ON COLUMN chat_rooms.name IS '聊天室名称';
COMMENT ON COLUMN chat_rooms.description IS '聊天室描述';
COMMENT ON COLUMN chat_rooms.type IS '类型（direct-私聊，group-群聊）';
COMMENT ON COLUMN chat_rooms.avatar_url IS '头像URL';
COMMENT ON COLUMN chat_rooms.created_by IS '创建者ID';
COMMENT ON COLUMN chat_rooms.last_message_at IS '最后消息时间';
COMMENT ON COLUMN chat_rooms.create_time IS '创建时间';
COMMENT ON COLUMN chat_rooms.update_time IS '更新时间';
COMMENT ON COLUMN chat_rooms.deleted IS '逻辑删除';

DROP TRIGGER IF EXISTS update_chat_rooms_updated_at ON chat_rooms;
CREATE TRIGGER update_chat_rooms_updated_at
    BEFORE UPDATE ON chat_rooms
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 第五部分：聊天室成员表
-- ============================================

CREATE TABLE IF NOT EXISTS room_members (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    left_at TIMESTAMP WITH TIME ZONE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted INTEGER DEFAULT 0,
    UNIQUE(room_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_room_members_room ON room_members(room_id);
CREATE INDEX IF NOT EXISTS idx_room_members_user ON room_members(user_id);

COMMENT ON TABLE room_members IS '聊天室成员表';
COMMENT ON COLUMN room_members.id IS '成员记录ID';
COMMENT ON COLUMN room_members.room_id IS '聊天室ID';
COMMENT ON COLUMN room_members.user_id IS '用户ID';
COMMENT ON COLUMN room_members.role IS '角色（owner-所有者，admin-管理员，member-成员）';
COMMENT ON COLUMN room_members.joined_at IS '加入时间';
COMMENT ON COLUMN room_members.left_at IS '离开时间';
COMMENT ON COLUMN room_members.create_time IS '创建时间';
COMMENT ON COLUMN room_members.update_time IS '更新时间';
COMMENT ON COLUMN room_members.deleted IS '逻辑删除';

DROP TRIGGER IF EXISTS update_room_members_updated_at ON room_members;
CREATE TRIGGER update_room_members_updated_at
    BEFORE UPDATE ON room_members
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 第六部分：消息表
-- ============================================

CREATE TABLE IF NOT EXISTS messages (
    id BIGSERIAL PRIMARY KEY,
    room_id BIGINT NOT NULL REFERENCES chat_rooms(id) ON DELETE CASCADE,
    sender_id BIGINT REFERENCES sys_users(id) ON DELETE SET NULL,
    content TEXT,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    file_url TEXT,
    file_name TEXT,
    file_size BIGINT,
    image_width INTEGER,
    image_height INTEGER,
    reply_to_id BIGINT REFERENCES messages(id) ON DELETE SET NULL,
    mentioned_users BIGINT[] DEFAULT '{}',
    is_edited BOOLEAN DEFAULT FALSE,
    is_deleted BOOLEAN DEFAULT FALSE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted INTEGER DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_messages_room ON messages(room_id, create_time DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_reply_to ON messages(reply_to_id);
CREATE INDEX IF NOT EXISTS idx_messages_create_time ON messages(create_time DESC);

COMMENT ON TABLE messages IS '消息表';
COMMENT ON COLUMN messages.id IS '消息ID';
COMMENT ON COLUMN messages.room_id IS '聊天室ID';
COMMENT ON COLUMN messages.sender_id IS '发送者ID';
COMMENT ON COLUMN messages.content IS '消息内容';
COMMENT ON COLUMN messages.message_type IS '消息类型（text-文本，image-图片，file-文件，system-系统）';
COMMENT ON COLUMN messages.file_url IS '文件URL';
COMMENT ON COLUMN messages.file_name IS '文件名';
COMMENT ON COLUMN messages.file_size IS '文件大小';
COMMENT ON COLUMN messages.image_width IS '图片宽度';
COMMENT ON COLUMN messages.image_height IS '图片高度';
COMMENT ON COLUMN messages.reply_to_id IS '回复的消息ID';
COMMENT ON COLUMN messages.mentioned_users IS '@提及的用户ID数组';
COMMENT ON COLUMN messages.is_edited IS '是否已编辑';
COMMENT ON COLUMN messages.is_deleted IS '是否已删除';
COMMENT ON COLUMN messages.create_time IS '创建时间';
COMMENT ON COLUMN messages.update_time IS '更新时间';
COMMENT ON COLUMN messages.deleted IS '逻辑删除';

DROP TRIGGER IF EXISTS update_messages_updated_at ON messages;
CREATE TRIGGER update_messages_updated_at
    BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 更新聊天室最后消息时间的触发器
CREATE OR REPLACE FUNCTION update_room_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE chat_rooms
    SET last_message_at = NEW.create_time, update_time = NOW()
    WHERE id = NEW.room_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_room_last_message ON messages;
CREATE TRIGGER trigger_update_room_last_message
    AFTER INSERT ON messages
    FOR EACH ROW EXECUTE FUNCTION update_room_last_message();

-- ============================================
-- 第七部分：消息已读状态表
-- ============================================

CREATE TABLE IF NOT EXISTS message_reads (
    id BIGSERIAL PRIMARY KEY,
    message_id BIGINT NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
    user_id BIGINT NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted INTEGER DEFAULT 0,
    UNIQUE(message_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_message_reads_user ON message_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_message ON message_reads(message_id);

COMMENT ON TABLE message_reads IS '消息已读状态表';
COMMENT ON COLUMN message_reads.id IS '记录ID';
COMMENT ON COLUMN message_reads.message_id IS '消息ID';
COMMENT ON COLUMN message_reads.user_id IS '用户ID';
COMMENT ON COLUMN message_reads.read_at IS '已读时间';
COMMENT ON COLUMN message_reads.create_time IS '创建时间';
COMMENT ON COLUMN message_reads.update_time IS '更新时间';
COMMENT ON COLUMN message_reads.deleted IS '逻辑删除';

DROP TRIGGER IF EXISTS update_message_reads_updated_at ON message_reads;
CREATE TRIGGER update_message_reads_updated_at
    BEFORE UPDATE ON message_reads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 第八部分：好友请求表
-- ============================================

CREATE TABLE IF NOT EXISTS friend_requests (
    id BIGSERIAL PRIMARY KEY,
    sender_id BIGINT NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    receiver_id BIGINT NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
    message TEXT,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted INTEGER DEFAULT 0,
    UNIQUE(sender_id, receiver_id)
);

CREATE INDEX IF NOT EXISTS idx_friend_requests_sender ON friend_requests(sender_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_receiver ON friend_requests(receiver_id);
CREATE INDEX IF NOT EXISTS idx_friend_requests_status ON friend_requests(status);

COMMENT ON TABLE friend_requests IS '好友请求表';
COMMENT ON COLUMN friend_requests.id IS '请求ID';
COMMENT ON COLUMN friend_requests.sender_id IS '发送者ID';
COMMENT ON COLUMN friend_requests.receiver_id IS '接收者ID';
COMMENT ON COLUMN friend_requests.status IS '状态（pending-待处理，accepted-已接受，rejected-已拒绝）';
COMMENT ON COLUMN friend_requests.message IS '请求消息';
COMMENT ON COLUMN friend_requests.create_time IS '创建时间';
COMMENT ON COLUMN friend_requests.update_time IS '更新时间';
COMMENT ON COLUMN friend_requests.deleted IS '逻辑删除';

DROP TRIGGER IF EXISTS update_friend_requests_updated_at ON friend_requests;
CREATE TRIGGER update_friend_requests_updated_at
    BEFORE UPDATE ON friend_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 第九部分：好友关系表
-- ============================================

CREATE TABLE IF NOT EXISTS friends (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    friend_id BIGINT NOT NULL REFERENCES sys_users(id) ON DELETE CASCADE,
    create_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    update_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted INTEGER DEFAULT 0,
    UNIQUE(user_id, friend_id)
);

CREATE INDEX IF NOT EXISTS idx_friends_user ON friends(user_id);
CREATE INDEX IF NOT EXISTS idx_friends_friend ON friends(friend_id);

COMMENT ON TABLE friends IS '好友关系表';
COMMENT ON COLUMN friends.id IS '关系ID';
COMMENT ON COLUMN friends.user_id IS '用户ID';
COMMENT ON COLUMN friends.friend_id IS '好友ID';
COMMENT ON COLUMN friends.create_time IS '创建时间';
COMMENT ON COLUMN friends.update_time IS '更新时间';
COMMENT ON COLUMN friends.deleted IS '逻辑删除';

DROP TRIGGER IF EXISTS update_friends_updated_at ON friends;
CREATE TRIGGER update_friends_updated_at
    BEFORE UPDATE ON friends
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 第十部分：辅助函数
-- ============================================

-- 创建私聊房间
CREATE OR REPLACE FUNCTION create_direct_room(
    p_user1_id BIGINT,
    p_user2_id BIGINT
) RETURNS BIGINT AS $$
DECLARE
    v_existing_room_id BIGINT;
    v_new_room_id BIGINT;
BEGIN
    -- 检查是否已存在两人的私聊房间
    SELECT r.id INTO v_existing_room_id
    FROM chat_rooms r
    WHERE r.type = 'direct'
    AND r.deleted = 0
    AND EXISTS (SELECT 1 FROM room_members m WHERE m.room_id = r.id AND m.user_id = p_user1_id AND m.left_at IS NULL AND m.deleted = 0)
    AND EXISTS (SELECT 1 FROM room_members m WHERE m.room_id = r.id AND m.user_id = p_user2_id AND m.left_at IS NULL AND m.deleted = 0)
    AND (SELECT COUNT(*) FROM room_members WHERE room_id = r.id AND left_at IS NULL AND deleted = 0) = 2
    LIMIT 1;

    IF v_existing_room_id IS NOT NULL THEN
        RETURN v_existing_room_id;
    END IF;

    -- 创建新的私聊房间
    INSERT INTO chat_rooms (name, type, created_by)
    VALUES ('Direct Chat', 'direct', p_user1_id)
    RETURNING id INTO v_new_room_id;

    -- 添加成员
    INSERT INTO room_members (room_id, user_id, role)
    VALUES (v_new_room_id, p_user1_id, 'owner'),
           (v_new_room_id, p_user2_id, 'member');

    RETURN v_new_room_id;
END;
$$ LANGUAGE plpgsql;

-- 创建群组房间
CREATE OR REPLACE FUNCTION create_group_room(
    p_room_name TEXT,
    p_creator_id BIGINT,
    p_member_ids BIGINT[]
) RETURNS BIGINT AS $$
DECLARE
    v_new_room_id BIGINT;
BEGIN
    -- 创建群组
    INSERT INTO chat_rooms (name, type, created_by)
    VALUES (p_room_name, 'group', p_creator_id)
    RETURNING id INTO v_new_room_id;

    -- 添加创建者为所有者
    INSERT INTO room_members (room_id, user_id, role)
    VALUES (v_new_room_id, p_creator_id, 'owner');

    -- 添加其他成员
    INSERT INTO room_members (room_id, user_id, role)
    SELECT v_new_room_id, unnest(p_member_ids), 'member'
    WHERE unnest(p_member_ids) != p_creator_id;

    RETURN v_new_room_id;
END;
$$ LANGUAGE plpgsql;

-- 离开房间
CREATE OR REPLACE FUNCTION leave_room(
    p_room_id BIGINT,
    p_user_id BIGINT
) RETURNS void AS $$
BEGIN
    UPDATE room_members
    SET left_at = NOW(), update_time = NOW()
    WHERE room_id = p_room_id AND user_id = p_user_id;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 验证安装
-- ============================================

SELECT 'Schema 安装完成！' AS status;

SELECT table_name,
       (SELECT COUNT(*) FROM information_schema.columns c WHERE c.table_name = t.table_name AND c.table_schema = 'public') AS column_count
FROM information_schema.tables t
WHERE table_schema = 'public'
AND table_type = 'BASE TABLE'
ORDER BY table_name;
