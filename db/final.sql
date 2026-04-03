create table public.sys_users
(
    id             bigserial
        primary key,
    username       varchar(50) not null
        unique,
    password       varchar(255),
    email          varchar(100)
        unique,
    phone          varchar(20),
    nickname       varchar(100),
    display_name   varchar(100),
    avatar_name    varchar(255),
    avatar_url     text,
    avatar_size    bigint,
    bio            text,
    online_status  varchar(20)              default 'offline'::character varying
        constraint sys_users_online_status_check
            check ((online_status)::text = ANY
                   ((ARRAY ['online'::character varying, 'offline'::character varying, 'busy'::character varying, 'away'::character varying])::text[])),
    account_status integer                  default 1,
    last_login_at  timestamp with time zone,
    last_seen_at   timestamp with time zone default now(),
    create_time    timestamp with time zone default now(),
    update_time    timestamp with time zone default now(),
    deleted        integer                  default 0
);

comment on table public.sys_users is '系统用户表';

comment on column public.sys_users.id is '用户ID';

comment on column public.sys_users.username is '用户名';

comment on column public.sys_users.password is '密码';

comment on column public.sys_users.email is '邮箱';

comment on column public.sys_users.phone is '手机号';

comment on column public.sys_users.nickname is '昵称';

comment on column public.sys_users.display_name is '显示名称';

comment on column public.sys_users.avatar_name is '头像文件名称';

comment on column public.sys_users.avatar_url is '头像URL（MinIO）';

comment on column public.sys_users.avatar_size is '头像文件大小（字节）';

comment on column public.sys_users.bio is '个人简介';

comment on column public.sys_users.online_status is '在线状态';

comment on column public.sys_users.account_status is '账号状态（0-禁用，1-启用）';

comment on column public.sys_users.last_login_at is '最后登录时间';

comment on column public.sys_users.last_seen_at is '最后活跃时间';

comment on column public.sys_users.create_time is '创建时间';

comment on column public.sys_users.update_time is '更新时间';

comment on column public.sys_users.deleted is '逻辑删除（0-未删除，1-已删除）';


create index idx_sys_users_username
    on public.sys_users (username);

create index idx_sys_users_email
    on public.sys_users (email);

create index idx_sys_users_account_status
    on public.sys_users (account_status);

create index idx_sys_users_online_status
    on public.sys_users (online_status);

create table public.chat_rooms
(
    id              bigserial
        primary key,
    name            varchar(200),
    description     text,
    type            varchar(20) not null
        constraint chat_rooms_type_check
            check ((type)::text = ANY ((ARRAY ['direct'::character varying, 'group'::character varying])::text[])),
    avatar_url      text,
    created_by      bigint,
    last_message_at timestamp with time zone default now(),
    create_time     timestamp with time zone default now(),
    update_time     timestamp with time zone default now(),
    deleted         integer                  default 0,
    status          varchar(20)              default 'ACTIVE'::character varying,
    is_system       boolean                  default false
);

comment on table public.chat_rooms is '聊天室表';

comment on column public.chat_rooms.id is '聊天室ID';

comment on column public.chat_rooms.name is '聊天室名称';

comment on column public.chat_rooms.description is '聊天室描述';

comment on column public.chat_rooms.type is '类型（direct-私聊，group-群聊）';

comment on column public.chat_rooms.avatar_url is '头像URL';

comment on column public.chat_rooms.created_by is '创建者ID';

comment on column public.chat_rooms.last_message_at is '最后消息时间';

comment on column public.chat_rooms.create_time is '创建时间';

comment on column public.chat_rooms.update_time is '更新时间';

comment on column public.chat_rooms.deleted is '逻辑删除';

comment on column public.chat_rooms.status is '状态：ACTIVE-正常，DISABLED-禁用，ARCHIVED-已归档';

comment on column public.chat_rooms.is_system is '是否系统聊天室';


create index idx_chat_rooms_type
    on public.chat_rooms (type);

create index idx_chat_rooms_last_message
    on public.chat_rooms (last_message_at desc);

create index idx_chat_rooms_created_by
    on public.chat_rooms (created_by);

create table public.room_members
(
    id          bigserial
        primary key,
    room_id     bigint not null,
    user_id     bigint not null,
    role        varchar(20)              default 'member'::character varying
        constraint room_members_role_check
            check ((role)::text = ANY
                   ((ARRAY ['owner'::character varying, 'admin'::character varying, 'member'::character varying])::text[])),
    joined_at   timestamp with time zone default now(),
    left_at     timestamp with time zone,
    create_time timestamp with time zone default now(),
    update_time timestamp with time zone default now(),
    deleted     integer                  default 0,
    unique (room_id, user_id)
);

comment on table public.room_members is '聊天室成员表';

comment on column public.room_members.id is '成员记录ID';

comment on column public.room_members.room_id is '聊天室ID';

comment on column public.room_members.user_id is '用户ID';

comment on column public.room_members.role is '角色（owner-所有者，admin-管理员，member-成员）';

comment on column public.room_members.joined_at is '加入时间';

comment on column public.room_members.left_at is '离开时间';

comment on column public.room_members.create_time is '创建时间';

comment on column public.room_members.update_time is '更新时间';

comment on column public.room_members.deleted is '逻辑删除';


create index idx_room_members_room
    on public.room_members (room_id);

create index idx_room_members_user
    on public.room_members (user_id);

create table public.messages
(
    id              bigserial
        primary key,
    room_id         bigint not null,
    sender_id       bigint,
    content         text,
    message_type    varchar(20)              default 'text'::character varying
        constraint messages_message_type_check
            check ((message_type)::text = ANY
                   ((ARRAY ['text'::character varying, 'image'::character varying, 'file'::character varying, 'system'::character varying])::text[])),
    file_url        text,
    file_name       text,
    file_size       bigint,
    image_width     integer,
    image_height    integer,
    reply_to_id     bigint,
    mentioned_users bigint[]                 default '{}'::bigint[],
    is_edited       boolean                  default false,
    is_deleted      boolean                  default false,
    create_time     timestamp with time zone default now(),
    update_time     timestamp with time zone default now(),
    deleted         integer                  default 0
);

comment on table public.messages is '消息表';

comment on column public.messages.id is '消息ID';

comment on column public.messages.room_id is '聊天室ID';

comment on column public.messages.sender_id is '发送者ID';

comment on column public.messages.content is '消息内容';

comment on column public.messages.message_type is '消息类型（text-文本，image-图片，file-文件，system-系统）';

comment on column public.messages.file_url is '文件URL';

comment on column public.messages.file_name is '文件名';

comment on column public.messages.file_size is '文件大小';

comment on column public.messages.image_width is '图片宽度';

comment on column public.messages.image_height is '图片高度';

comment on column public.messages.reply_to_id is '回复的消息ID';

comment on column public.messages.mentioned_users is '@提及的用户ID数组';

comment on column public.messages.is_edited is '是否已编辑';

comment on column public.messages.is_deleted is '是否已删除';

comment on column public.messages.create_time is '创建时间';

comment on column public.messages.update_time is '更新时间';

comment on column public.messages.deleted is '逻辑删除';

create index idx_messages_room
    on public.messages (room_id asc, create_time desc);

create index idx_messages_sender
    on public.messages (sender_id);

create index idx_messages_reply_to
    on public.messages (reply_to_id);

create index idx_messages_create_time
    on public.messages (create_time desc);

create table public.message_reads
(
    id          bigserial
        primary key,
    message_id  bigint not null,
    user_id     bigint not null,
    read_at     timestamp with time zone default now(),
    create_time timestamp with time zone default now(),
    update_time timestamp with time zone default now(),
    deleted     integer                  default 0,
    unique (message_id, user_id)
);

comment on table public.message_reads is '消息已读状态表';

comment on column public.message_reads.id is '记录ID';

comment on column public.message_reads.message_id is '消息ID';

comment on column public.message_reads.user_id is '用户ID';

comment on column public.message_reads.read_at is '已读时间';

comment on column public.message_reads.create_time is '创建时间';

comment on column public.message_reads.update_time is '更新时间';

comment on column public.message_reads.deleted is '逻辑删除';

create index idx_message_reads_user
    on public.message_reads (user_id);

create index idx_message_reads_message
    on public.message_reads (message_id);

create table public.friend_requests
(
    id          bigserial
        primary key,
    sender_id   bigint not null,
    receiver_id bigint not null,
    status      varchar(20)              default 'pending'::character varying
        constraint friend_requests_status_check
            check ((status)::text = ANY
                   ((ARRAY ['pending'::character varying, 'accepted'::character varying, 'rejected'::character varying])::text[])),
    message     text,
    create_time timestamp with time zone default now(),
    update_time timestamp with time zone default now(),
    deleted     integer                  default 0,
    unique (sender_id, receiver_id)
);

comment on table public.friend_requests is '好友请求表';

comment on column public.friend_requests.id is '请求ID';

comment on column public.friend_requests.sender_id is '发送者ID';

comment on column public.friend_requests.receiver_id is '接收者ID';

comment on column public.friend_requests.status is '状态（pending-待处理，accepted-已接受，rejected-已拒绝）';

comment on column public.friend_requests.message is '请求消息';

comment on column public.friend_requests.create_time is '创建时间';

comment on column public.friend_requests.update_time is '更新时间';

comment on column public.friend_requests.deleted is '逻辑删除';

create index idx_friend_requests_sender
    on public.friend_requests (sender_id);

create index idx_friend_requests_receiver
    on public.friend_requests (receiver_id);

create index idx_friend_requests_status
    on public.friend_requests (status);

create table public.friends
(
    id          bigserial
        primary key,
    user_id     bigint not null,
    friend_id   bigint not null,
    create_time timestamp with time zone default now(),
    update_time timestamp with time zone default now(),
    deleted     integer                  default 0,
    unique (user_id, friend_id)
);

comment on table public.friends is '好友关系表';

comment on column public.friends.id is '关系ID';

comment on column public.friends.user_id is '用户ID';

comment on column public.friends.friend_id is '好友ID';

comment on column public.friends.create_time is '创建时间';

comment on column public.friends.update_time is '更新时间';

comment on column public.friends.deleted is '逻辑删除';


create index idx_friends_user
    on public.friends (user_id);

create index idx_friends_friend
    on public.friends (friend_id);

create table public.sys_menu
(
    id          bigserial
        primary key,
    parent_id   bigint                   default 0                 not null,
    menu_type   varchar(20)                                        not null,
    menu_name   varchar(100)                                       not null,
    path        varchar(200),
    component   varchar(200),
    permission  varchar(100),
    icon        varchar(100),
    sort_order  integer                  default 0                 not null,
    is_visible  boolean                  default true              not null,
    is_system   boolean                  default false             not null,
    create_time timestamp with time zone default CURRENT_TIMESTAMP not null,
    update_time timestamp with time zone default CURRENT_TIMESTAMP not null,
    deleted     integer                  default 0                 not null
);

comment on table public.sys_menu is '菜单表';

comment on column public.sys_menu.id is '菜单ID';

comment on column public.sys_menu.parent_id is '父菜单ID，0表示根节点';

comment on column public.sys_menu.menu_type is '菜单类型：directory-目录，menu-菜单，button-按钮';

comment on column public.sys_menu.menu_name is '菜单名称';

comment on column public.sys_menu.path is '路由路径';

comment on column public.sys_menu.component is '组件路径';

comment on column public.sys_menu.permission is '权限标识';

comment on column public.sys_menu.icon is '菜单图标';

comment on column public.sys_menu.sort_order is '排序';

comment on column public.sys_menu.is_visible is '是否显示';

comment on column public.sys_menu.is_system is '是否系统内置，不可删除';

comment on column public.sys_menu.create_time is '创建时间';

comment on column public.sys_menu.update_time is '更新时间';

comment on column public.sys_menu.deleted is '逻辑删除标志';


create table public.sys_role
(
    id          bigserial
        primary key,
    role_name   varchar(100)                                                 not null,
    role_code   varchar(100)                                                 not null
        unique,
    data_scope  varchar(20)              default 'SELF'::character varying   not null,
    description varchar(500),
    is_system   boolean                  default false                       not null,
    sort_order  integer                  default 0                           not null,
    status      varchar(20)              default 'ACTIVE'::character varying not null,
    create_time timestamp with time zone default CURRENT_TIMESTAMP           not null,
    update_time timestamp with time zone default CURRENT_TIMESTAMP           not null,
    deleted     integer                  default 0                           not null
);

comment on table public.sys_role is '角色表';

comment on column public.sys_role.id is '角色ID';

comment on column public.sys_role.role_name is '角色名称';

comment on column public.sys_role.role_code is '角色编码';

comment on column public.sys_role.data_scope is '数据权限范围：ALL-全部数据，SELF-仅本人数据';

comment on column public.sys_role.description is '角色描述';

comment on column public.sys_role.is_system is '是否系统内置，不可删除';

comment on column public.sys_role.sort_order is '排序';

comment on column public.sys_role.status is '状态：ACTIVE-启用，DISABLED-禁用';

comment on column public.sys_role.create_time is '创建时间';

comment on column public.sys_role.update_time is '更新时间';

comment on column public.sys_role.deleted is '逻辑删除标志';


create table public.sys_role_menu
(
    id          bigserial
        primary key,
    role_id     bigint                                             not null,
    menu_id     bigint                                             not null,
    create_time timestamp with time zone default CURRENT_TIMESTAMP not null,
    unique (role_id, menu_id)
);

comment on table public.sys_role_menu is '角色-菜单关联表';

comment on column public.sys_role_menu.id is '主键ID';

comment on column public.sys_role_menu.role_id is '角色ID';

comment on column public.sys_role_menu.menu_id is '菜单ID';

comment on column public.sys_role_menu.create_time is '创建时间';

create index idx_sys_role_menu_role_id
    on public.sys_role_menu (role_id);

create index idx_sys_role_menu_menu_id
    on public.sys_role_menu (menu_id);

create table public.sys_user_role
(
    id          bigserial
        primary key,
    user_id     bigint                                             not null,
    role_id     bigint                                             not null,
    create_time timestamp with time zone default CURRENT_TIMESTAMP not null,
    unique (user_id, role_id)
);

comment on table public.sys_user_role is '用户-角色关联表';

comment on column public.sys_user_role.id is '主键ID';

comment on column public.sys_user_role.user_id is '用户ID';

comment on column public.sys_user_role.role_id is '角色ID';

comment on column public.sys_user_role.create_time is '创建时间';


create index idx_sys_user_role_user_id
    on public.sys_user_role (user_id);

create index idx_sys_user_role_role_id
    on public.sys_user_role (role_id);

create table public.sys_dict_type
(
    id          bigserial
        primary key,
    dict_name   varchar(100)                                                 not null,
    dict_code   varchar(100)                                                 not null
        unique,
    description varchar(500),
    is_system   boolean                  default false                       not null,
    status      varchar(20)              default 'ACTIVE'::character varying not null,
    create_time timestamp with time zone default CURRENT_TIMESTAMP           not null,
    update_time timestamp with time zone default CURRENT_TIMESTAMP           not null,
    deleted     integer                  default 0                           not null
);

comment on table public.sys_dict_type is '数据字典类型表';

comment on column public.sys_dict_type.id is '字典类型ID';

comment on column public.sys_dict_type.dict_name is '字典名称';

comment on column public.sys_dict_type.dict_code is '字典编码';

comment on column public.sys_dict_type.description is '描述';

comment on column public.sys_dict_type.is_system is '是否系统内置，不可删除';

comment on column public.sys_dict_type.status is '状态：ACTIVE-启用，DISABLED-禁用';

comment on column public.sys_dict_type.create_time is '创建时间';

comment on column public.sys_dict_type.update_time is '更新时间';


create table public.sys_dict_item
(
    id           bigserial
        primary key,
    dict_type_id bigint                                                       not null,
    dict_label   varchar(100)                                                 not null,
    dict_value   varchar(100)                                                 not null,
    sort_order   integer                  default 0                           not null,
    status       varchar(20)              default 'ACTIVE'::character varying not null,
    is_default   boolean                  default false                       not null,
    css_class    varchar(100),
    list_class   varchar(100),
    create_time  timestamp with time zone default CURRENT_TIMESTAMP           not null,
    update_time  timestamp with time zone default CURRENT_TIMESTAMP           not null,
    deleted      integer                  default 0                           not null
);

comment on table public.sys_dict_item is '数据字典项表';

comment on column public.sys_dict_item.id is '字典项ID';

comment on column public.sys_dict_item.dict_type_id is '字典类型ID';

comment on column public.sys_dict_item.dict_label is '字典标签';

comment on column public.sys_dict_item.dict_value is '字典值';

comment on column public.sys_dict_item.sort_order is '排序';

comment on column public.sys_dict_item.status is '状态：ACTIVE-启用，DISABLED-禁用';

comment on column public.sys_dict_item.is_default is '是否默认';

comment on column public.sys_dict_item.css_class is '样式属性';

comment on column public.sys_dict_item.list_class is '表格回显样式';

comment on column public.sys_dict_item.create_time is '创建时间';

comment on column public.sys_dict_item.update_time is '更新时间';

create index idx_sys_dict_item_type_id
    on public.sys_dict_item (dict_type_id);

create table public.sys_operation_log
(
    id              bigserial
        primary key,
    user_id         bigint,
    username        varchar(100),
    module          varchar(100),
    operation       varchar(100),
    method          varchar(200),
    request_method  varchar(20),
    request_url     varchar(500),
    request_params  text,
    response_result text,
    ip_address      varchar(50),
    location        varchar(200),
    browser         varchar(200),
    os              varchar(200),
    status          varchar(20)              default 'SUCCESS'::character varying not null,
    error_msg       text,
    execution_time  bigint,
    operation_time  timestamp with time zone default CURRENT_TIMESTAMP            not null
);

comment on table public.sys_operation_log is '操作日志表';

comment on column public.sys_operation_log.id is '日志ID';

comment on column public.sys_operation_log.user_id is '用户ID';

comment on column public.sys_operation_log.username is '用户名';

comment on column public.sys_operation_log.module is '模块名称';

comment on column public.sys_operation_log.operation is '操作描述';

comment on column public.sys_operation_log.method is '方法名称';

comment on column public.sys_operation_log.request_method is '请求方式';

comment on column public.sys_operation_log.request_url is '请求URL';

comment on column public.sys_operation_log.request_params is '请求参数';

comment on column public.sys_operation_log.response_result is '响应结果';

comment on column public.sys_operation_log.ip_address is 'IP地址';

comment on column public.sys_operation_log.location is '地理位置';

comment on column public.sys_operation_log.browser is '浏览器';

comment on column public.sys_operation_log.os is '操作系统';

comment on column public.sys_operation_log.status is '状态：SUCCESS-成功，FAIL-失败';

comment on column public.sys_operation_log.error_msg is '错误信息';

comment on column public.sys_operation_log.execution_time is '执行时间(毫秒)';

comment on column public.sys_operation_log.operation_time is '操作时间';

create index idx_sys_operation_log_user_id
    on public.sys_operation_log (user_id);

create index idx_sys_operation_log_time
    on public.sys_operation_log (operation_time);

create table public.sys_online_user
(
    id                 bigserial
        primary key,
    user_id            bigint                                             not null,
    username           varchar(100)                                       not null,
    nickname           varchar(100),
    token              varchar(500)                                       not null,
    ip_address         varchar(50),
    location           varchar(200),
    browser            varchar(200),
    os                 varchar(200),
    login_time         timestamp with time zone default CURRENT_TIMESTAMP not null,
    last_activity_time timestamp with time zone default CURRENT_TIMESTAMP not null,
    expired            boolean                  default false             not null
);

comment on table public.sys_online_user is '在线用户表';

comment on column public.sys_online_user.id is '主键ID';

comment on column public.sys_online_user.user_id is '用户ID';

comment on column public.sys_online_user.username is '用户名';

comment on column public.sys_online_user.nickname is '昵称';

comment on column public.sys_online_user.token is 'Token';

comment on column public.sys_online_user.ip_address is 'IP地址';

comment on column public.sys_online_user.location is '地理位置';

comment on column public.sys_online_user.browser is '浏览器';

comment on column public.sys_online_user.os is '操作系统';

comment on column public.sys_online_user.login_time is '登录时间';

comment on column public.sys_online_user.last_activity_time is '最后活动时间';

comment on column public.sys_online_user.expired is '是否已过期';

create index idx_sys_online_user_user_id
    on public.sys_online_user (user_id);

create index idx_sys_online_user_token
    on public.sys_online_user (token);

create index idx_sys_online_user_expired
    on public.sys_online_user (expired);

create table public.blog_category
(
    id            bigserial
        primary key,
    parent_id     bigint                   default 0                           not null,
    category_name varchar(100)                                                 not null,
    slug          varchar(100),
    description   varchar(500),
    icon          varchar(100),
    sort_order    integer                  default 0                           not null,
    article_count integer                  default 0                           not null,
    status        varchar(20)              default 'ACTIVE'::character varying not null,
    create_time   timestamp with time zone default CURRENT_TIMESTAMP           not null,
    update_time   timestamp with time zone default CURRENT_TIMESTAMP           not null,
    create_by     bigint,
    deleted       integer                  default 0                           not null
);

comment on table public.blog_category is '文章分类表';

comment on column public.blog_category.id is '分类ID';

comment on column public.blog_category.parent_id is '父分类ID';

comment on column public.blog_category.category_name is '分类名称';

comment on column public.blog_category.slug is '分类别名';

comment on column public.blog_category.description is '描述';

comment on column public.blog_category.icon is '图标';

comment on column public.blog_category.sort_order is '排序';

comment on column public.blog_category.article_count is '文章数量';

comment on column public.blog_category.status is '状态：ACTIVE-启用，DISABLED-禁用';

comment on column public.blog_category.create_time is '创建时间';

comment on column public.blog_category.update_time is '更新时间';

comment on column public.blog_category.create_by is '创建者ID';

comment on column public.blog_category.deleted is '逻辑删除标志';

create table public.blog_tag
(
    id            bigserial
        primary key,
    tag_name      varchar(100)                                                 not null
        unique,
    slug          varchar(100),
    description   varchar(500),
    icon          varchar(100),
    color         varchar(20),
    article_count integer                  default 0                           not null,
    sort_order    integer                  default 0                           not null,
    status        varchar(20)              default 'ACTIVE'::character varying not null,
    create_time   timestamp with time zone default CURRENT_TIMESTAMP           not null,
    update_time   timestamp with time zone default CURRENT_TIMESTAMP           not null,
    create_by     bigint,
    deleted       integer                  default 0                           not null
);

comment on table public.blog_tag is '文章标签表';

comment on column public.blog_tag.id is '标签ID';

comment on column public.blog_tag.tag_name is '标签名称';

comment on column public.blog_tag.slug is '标签别名';

comment on column public.blog_tag.description is '描述';

comment on column public.blog_tag.icon is '图标';

comment on column public.blog_tag.color is '颜色';

comment on column public.blog_tag.article_count is '文章数量';

comment on column public.blog_tag.sort_order is '排序';

comment on column public.blog_tag.status is '状态：ACTIVE-启用，DISABLED-禁用';

comment on column public.blog_tag.create_time is '创建时间';

comment on column public.blog_tag.update_time is '更新时间';

comment on column public.blog_tag.create_by is '创建者ID';

comment on column public.blog_tag.deleted is '逻辑删除标志';

create table public.blog_article
(
    id                 bigserial
        primary key,
    title              varchar(200)                                                not null,
    slug               varchar(200),
    summary            text,
    content            text                                                        not null,
    content_html       text,
    cover_image        varchar(500),
    category_id        bigint,
    author_id          bigint                                                      not null,
    author_name        varchar(100),
    view_count         bigint                   default 0                          not null,
    like_count         bigint                   default 0                          not null,
    comment_count      bigint                   default 0                          not null,
    status             varchar(20)              default 'DRAFT'::character varying not null,
    is_top             boolean                  default false                      not null,
    is_recommended     boolean                  default false                      not null,
    is_comment_enabled boolean                  default true                       not null,
    word_count         integer,
    publish_time       timestamp with time zone,
    create_time        timestamp with time zone default CURRENT_TIMESTAMP          not null,
    update_time        timestamp with time zone default CURRENT_TIMESTAMP          not null,
    deleted            integer                  default 0                          not null
);

comment on table public.blog_article is '文章表';

comment on column public.blog_article.id is '文章ID';

comment on column public.blog_article.title is '文章标题';

comment on column public.blog_article.slug is '文章别名';

comment on column public.blog_article.summary is '文章摘要';

comment on column public.blog_article.content is '文章内容(Markdown)';

comment on column public.blog_article.content_html is '文章内容(HTML)';

comment on column public.blog_article.cover_image is '封面图片';

comment on column public.blog_article.category_id is '分类ID';

comment on column public.blog_article.author_id is '作者ID';

comment on column public.blog_article.author_name is '作者名称';

comment on column public.blog_article.view_count is '浏览次数';

comment on column public.blog_article.like_count is '点赞次数';

comment on column public.blog_article.comment_count is '评论次数';

comment on column public.blog_article.status is '状态：DRAFT-草稿，PENDING-待审核，PUBLISHED-已发布，REJECTED-已拒绝';

comment on column public.blog_article.is_top is '是否置顶';

comment on column public.blog_article.is_recommended is '是否推荐';

comment on column public.blog_article.is_comment_enabled is '是否允许评论';

comment on column public.blog_article.word_count is '字数';

comment on column public.blog_article.publish_time is '发布时间';

comment on column public.blog_article.create_time is '创建时间';

comment on column public.blog_article.update_time is '更新时间';

comment on column public.blog_article.deleted is '逻辑删除标志';


create index idx_blog_article_author_id
    on public.blog_article (author_id);

create index idx_blog_article_category_id
    on public.blog_article (category_id);

create index idx_blog_article_status
    on public.blog_article (status);

create index idx_blog_article_create_time
    on public.blog_article (create_time);

create table public.blog_article_tag
(
    id          bigserial
        primary key,
    article_id  bigint                                             not null,
    tag_id      bigint                                             not null,
    create_time timestamp with time zone default CURRENT_TIMESTAMP not null,
    unique (article_id, tag_id)
);

comment on table public.blog_article_tag is '文章-标签关联表';

comment on column public.blog_article_tag.id is '主键ID';

comment on column public.blog_article_tag.article_id is '文章ID';

comment on column public.blog_article_tag.tag_id is '标签ID';

comment on column public.blog_article_tag.create_time is '创建时间';

create index idx_blog_article_tag_article_id
    on public.blog_article_tag (article_id);

create index idx_blog_article_tag_tag_id
    on public.blog_article_tag (tag_id);

create table public.blog_comment
(
    id          bigserial
        primary key,
    article_id  bigint                                                        not null,
    parent_id   bigint                   default 0                            not null,
    user_id     bigint                                                        not null,
    username    varchar(100),
    nickname    varchar(100),
    avatar_url  varchar(500),
    content     text                                                          not null,
    ip_address  varchar(50),
    location    varchar(200),
    like_count  bigint                   default 0                            not null,
    status      varchar(20)              default 'PENDING'::character varying not null,
    create_time timestamp with time zone default CURRENT_TIMESTAMP            not null,
    update_time timestamp with time zone default CURRENT_TIMESTAMP            not null,
    deleted     integer                  default 0                            not null
);

comment on table public.blog_comment is '评论表';

comment on column public.blog_comment.id is '评论ID';

comment on column public.blog_comment.article_id is '文章ID';

comment on column public.blog_comment.parent_id is '父评论ID';

comment on column public.blog_comment.user_id is '用户ID';

comment on column public.blog_comment.username is '用户名';

comment on column public.blog_comment.nickname is '昵称';

comment on column public.blog_comment.avatar_url is '头像URL';

comment on column public.blog_comment.content is '评论内容';

comment on column public.blog_comment.ip_address is 'IP地址';

comment on column public.blog_comment.location is '地理位置';

comment on column public.blog_comment.like_count is '点赞次数';

comment on column public.blog_comment.status is '状态：PENDING-待审核，APPROVED-已通过，REJECTED-已拒绝';

comment on column public.blog_comment.create_time is '创建时间';

comment on column public.blog_comment.update_time is '更新时间';

comment on column public.blog_comment.deleted is '逻辑删除标志';

create index idx_blog_comment_article_id
    on public.blog_comment (article_id);

create index idx_blog_comment_user_id
    on public.blog_comment (user_id);

create index idx_blog_comment_status
    on public.blog_comment (status);

create table public.im_sensitive_word
(
    id          bigserial
        primary key,
    word        varchar(200)                                                 not null
        unique,
    word_type   varchar(20)              default 'NORMAL'::character varying not null,
    replace_str varchar(200)             default '***'::character varying,
    is_enabled  boolean                  default true                        not null,
    create_time timestamp with time zone default CURRENT_TIMESTAMP           not null,
    update_time timestamp with time zone default CURRENT_TIMESTAMP           not null,
    create_by   bigint
);

comment on table public.im_sensitive_word is '敏感词表';

comment on column public.im_sensitive_word.id is '敏感词ID';

comment on column public.im_sensitive_word.word is '敏感词';

comment on column public.im_sensitive_word.word_type is '敏感词类型：NORMAL-普通，POLITICAL-政治，PORN-色情，VIOLENCE-暴力';

comment on column public.im_sensitive_word.replace_str is '替换字符';

comment on column public.im_sensitive_word.is_enabled is '是否启用';

comment on column public.im_sensitive_word.create_time is '创建时间';

comment on column public.im_sensitive_word.update_time is '更新时间';

comment on column public.im_sensitive_word.create_by is '创建者ID';

create table public.im_message_archive
(
    id             bigserial
        primary key,
    message_id     bigint                                             not null,
    room_id        bigint                                             not null,
    sender_id      bigint                                             not null,
    sender_name    varchar(100),
    message_type   varchar(20)                                        not null,
    content        text,
    is_sensitive   boolean                  default false             not null,
    sensitive_hits text,
    is_recalled    boolean                  default false             not null,
    recall_time    timestamp with time zone,
    create_time    timestamp with time zone default CURRENT_TIMESTAMP not null
);

comment on table public.im_message_archive is '消息归档表';

comment on column public.im_message_archive.id is '归档ID';

comment on column public.im_message_archive.message_id is '消息ID';

comment on column public.im_message_archive.room_id is '聊天室ID';

comment on column public.im_message_archive.sender_id is '发送者ID';

comment on column public.im_message_archive.sender_name is '发送者名称';

comment on column public.im_message_archive.message_type is '消息类型';

comment on column public.im_message_archive.content is '消息内容';

comment on column public.im_message_archive.is_sensitive is '是否包含敏感词';

comment on column public.im_message_archive.sensitive_hits is '命中的敏感词(JSON数组)';

comment on column public.im_message_archive.is_recalled is '是否已撤回';

comment on column public.im_message_archive.recall_time is '撤回时间';

comment on column public.im_message_archive.create_time is '创建时间';


create index idx_im_message_archive_message_id
    on public.im_message_archive (message_id);

create index idx_im_message_archive_room_id
    on public.im_message_archive (room_id);

create index idx_im_message_archive_sender_id
    on public.im_message_archive (sender_id);

create index idx_im_message_archive_create_time
    on public.im_message_archive (create_time);

create table public.im_user_ban
(
    id            bigserial
        primary key,
    user_id       bigint                                             not null,
    username      varchar(100)                                       not null,
    ban_type      varchar(20)                                        not null,
    reason        varchar(500),
    ban_time      timestamp with time zone default CURRENT_TIMESTAMP not null,
    expire_time   timestamp with time zone,
    is_permanent  boolean                  default false             not null,
    operator_id   bigint,
    operator_name varchar(100),
    is_active     boolean                  default true              not null,
    unban_time    timestamp with time zone,
    unban_reason  varchar(500),
    create_time   timestamp with time zone default CURRENT_TIMESTAMP not null,
    update_time   timestamp with time zone default CURRENT_TIMESTAMP not null
);

comment on table public.im_user_ban is '用户封禁表';

comment on column public.im_user_ban.id is '封禁ID';

comment on column public.im_user_ban.user_id is '用户ID';

comment on column public.im_user_ban.username is '用户名';

comment on column public.im_user_ban.ban_type is '封禁类型：CHAT-禁言，LOGIN-禁止登录，FULL-全封禁';

comment on column public.im_user_ban.reason is '封禁原因';

comment on column public.im_user_ban.ban_time is '封禁时间';

comment on column public.im_user_ban.expire_time is '过期时间';

comment on column public.im_user_ban.is_permanent is '是否永久封禁';

comment on column public.im_user_ban.operator_id is '操作者ID';

comment on column public.im_user_ban.operator_name is '操作者名称';

comment on column public.im_user_ban.is_active is '是否有效';

comment on column public.im_user_ban.unban_time is '解封时间';

comment on column public.im_user_ban.unban_reason is '解封原因';

comment on column public.im_user_ban.create_time is '创建时间';

comment on column public.im_user_ban.update_time is '更新时间';

create index idx_im_user_ban_user_id
    on public.im_user_ban (user_id);

create index idx_im_user_ban_active
    on public.im_user_ban (is_active);


-- ============================================
-- NebulaHub Memo 动态表（补充缺失的 3 张表 + 评论审核调整）
-- ============================================

-- 1. 评论默认状态改为已通过（评论无需审核）
ALTER TABLE public.blog_comment
    ALTER COLUMN status SET DEFAULT 'APPROVED';

-- 2. blog_memo 动态表
CREATE TABLE IF NOT EXISTS public.blog_memo (
                                                id              bigserial primary key,
                                                user_id         bigint not null,
                                                username        varchar(100),
    nickname        varchar(100),
    avatar_url      varchar(500),
    content         text not null,
    visibility      varchar(20) default 'PUBLIC' check (visibility in ('PUBLIC', 'FRIENDS', 'PRIVATE')),
    parent_memo_id  bigint  default 0,
    image_urls      text[],
    link_url        varchar(500),
    link_title      varchar(200),
    link_description text,
    link_image_url  varchar(500),
    like_count      bigint  default 0,
    comment_count   bigint  default 0,
    is_pinned       boolean default false,
    create_time     timestamp with time zone default CURRENT_TIMESTAMP not null,
    update_time     timestamp with time zone default CURRENT_TIMESTAMP not null,
                                  deleted         integer default 0 not null
                                  );

comment on table public.blog_memo is 'Memo 动态表';
comment on column public.blog_memo.user_id is '发布用户ID';
comment on column public.blog_memo.content is '动态内容';
comment on column public.blog_memo.visibility is '可见性：PUBLIC-公开，FRIENDS-仅好友，PRIVATE-仅自己';
comment on column public.blog_memo.parent_memo_id is '父动态ID（0=原创，>0=回复）';
comment on column public.blog_memo.image_urls is '图片URL数组';
comment on column public.blog_memo.link_url is '分享链接URL';
comment on column public.blog_memo.link_title is '链接标题';
comment on column public.blog_memo.link_description is '链接描述';
comment on column public.blog_memo.link_image_url is '链接缩略图URL';
comment on column public.blog_memo.like_count is '点赞数';
comment on column public.blog_memo.comment_count is '评论数';
comment on column public.blog_memo.is_pinned is '是否置顶';

create index idx_blog_memo_user        on public.blog_memo (user_id);
create index idx_blog_memo_create_time on public.blog_memo (create_time desc);
create index idx_blog_memo_visibility  on public.blog_memo (visibility);
create index idx_blog_memo_parent      on public.blog_memo (parent_memo_id);

-- 3. blog_memo_comment 动态评论表（无需审核）
CREATE TABLE IF NOT EXISTS public.blog_memo_comment (
                                                        id          bigserial primary key,
                                                        memo_id     bigint not null,
                                                        user_id     bigint,
                                                        username    varchar(100),
    nickname    varchar(100),
    avatar_url  varchar(500),
    parent_id   bigint  default 0,
    content     text    not null,
    ip_address  varchar(50),
    location    varchar(200),
    like_count  bigint  default 0,
    create_time timestamp with time zone default CURRENT_TIMESTAMP not null,
    update_time timestamp with time zone default CURRENT_TIMESTAMP not null,
                              deleted     integer default 0 not null
                              );

comment on table public.blog_memo_comment is 'Memo 评论表';
comment on column public.blog_memo_comment.memo_id is 'Memo 动态ID';
comment on column public.blog_memo_comment.user_id is '评论用户ID';
comment on column public.blog_memo_comment.parent_id is '父评论ID（0=一级评论，>0=回复）';

create index idx_blog_memo_comment_memo   on public.blog_memo_comment (memo_id);
create index idx_blog_memo_comment_user   on public.blog_memo_comment (user_id);
create index idx_blog_memo_comment_create on public.blog_memo_comment (create_time desc);
create index idx_blog_memo_comment_parent on public.blog_memo_comment (parent_id);

-- 4. blog_memo_like 点赞表（唯一约束防重复）
CREATE TABLE IF NOT EXISTS public.blog_memo_like (
                                                     id          bigserial primary key,
                                                     memo_id     bigint not null,
                                                     user_id     bigint not null,
                                                     create_time timestamp with time zone default CURRENT_TIMESTAMP not null,
                                                     unique (memo_id, user_id)
    );

comment on table public.blog_memo_like is 'Memo 点赞表';

create index idx_blog_memo_like_memo on public.blog_memo_like (memo_id);
create index idx_blog_memo_like_user on public.blog_memo_like (user_id);

-- 5. 自动更新 blog_memo.like_count
CREATE OR REPLACE FUNCTION update_memo_like_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
UPDATE public.blog_memo
SET like_count = like_count + 1, update_time = CURRENT_TIMESTAMP
WHERE id = NEW.memo_id;
ELSIF TG_OP = 'DELETE' THEN
UPDATE public.blog_memo
SET like_count = GREATEST(like_count - 1, 0), update_time = CURRENT_TIMESTAMP
WHERE id = OLD.memo_id;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memo_like_insert ON public.blog_memo_like;
CREATE TRIGGER trg_memo_like_insert
    AFTER INSERT ON public.blog_memo_like
    FOR EACH ROW EXECUTE FUNCTION update_memo_like_count();

DROP TRIGGER IF EXISTS trg_memo_like_delete ON public.blog_memo_like;
CREATE TRIGGER trg_memo_like_delete
    AFTER DELETE ON public.blog_memo_like
    FOR EACH ROW EXECUTE FUNCTION update_memo_like_count();

-- 6. 自动更新 blog_memo.comment_count
CREATE OR REPLACE FUNCTION update_memo_comment_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
UPDATE public.blog_memo
SET comment_count = comment_count + 1, update_time = CURRENT_TIMESTAMP
WHERE id = NEW.memo_id;
ELSIF TG_OP = 'DELETE' THEN
UPDATE public.blog_memo
SET comment_count = GREATEST(comment_count - 1, 0), update_time = CURRENT_TIMESTAMP
WHERE id = OLD.memo_id;
END IF;
RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_memo_comment_insert ON public.blog_memo_comment;
CREATE TRIGGER trg_memo_comment_insert
    AFTER INSERT ON public.blog_memo_comment
    FOR EACH ROW EXECUTE FUNCTION update_memo_comment_count();

DROP TRIGGER IF EXISTS trg_memo_comment_delete ON public.blog_memo_comment;
CREATE TRIGGER trg_memo_comment_delete
    AFTER DELETE ON public.blog_memo_comment
    FOR EACH ROW EXECUTE FUNCTION update_memo_comment_count();

-- 验证
SELECT 'Memo 表创建完成!' AS status;
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('blog_memo', 'blog_memo_comment', 'blog_memo_like')
ORDER BY table_name;


