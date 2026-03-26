/**
 * Supabase Database Types
 *
 * 基于 NebulaHub 的 final.sql 定义
 */

export interface Database {
 public: {
  Tables: {
   // 系统用户表（整合了用户档案信息）
   sys_users: {
    Row: {
     id: number
     username: string
     password: string | null
     email: string | null
     phone: string | null
     nickname: string | null
     display_name: string | null
     avatar_name: string | null
     avatar_url: string | null
     avatar_size: number | null
     bio: string | null
     online_status: string
     account_status: number
     last_login_at: string | null
     last_seen_at: string | null
     create_time: string
     update_time: string
     deleted: number
    }
    Insert: {
     id?: number
     username: string
     password?: string | null
     email?: string | null
     phone?: string | null
     nickname?: string | null
     display_name?: string | null
     avatar_name?: string | null
     avatar_url?: string | null
     avatar_size?: number | null
     bio?: string | null
     online_status?: string
     account_status?: number
     last_login_at?: string | null
     last_seen_at?: string | null
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Update: {
     id?: number
     username?: string
     password?: string | null
     email?: string | null
     phone?: string | null
     nickname?: string | null
     display_name?: string | null
     avatar_name?: string | null
     avatar_url?: string | null
     avatar_size?: number | null
     bio?: string | null
     online_status?: string
     account_status?: number
     last_login_at?: string | null
     last_seen_at?: string | null
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Relationships: []
   }
   // 聊天室表
   chat_rooms: {
    Row: {
     id: number
     name: string | null
     description: string | null
     type: string
     avatar_url: string | null
     created_by: number | null
     last_message_at: string | null
     create_time: string
     update_time: string
     deleted: number
     status: string
     is_system: boolean
    }
    Insert: {
     id?: number
     name?: string | null
     description?: string | null
     type: string
     avatar_url?: string | null
     created_by?: number | null
     last_message_at?: string | null
     create_time?: string
     update_time?: string
     deleted?: number
     status?: string
     is_system?: boolean
    }
    Update: {
     id?: number
     name?: string | null
     description?: string | null
     type?: string
     avatar_url?: string | null
     created_by?: number | null
     last_message_at?: string | null
     create_time?: string
     update_time?: string
     deleted?: number
     status?: string
     is_system?: boolean
    }
    Relationships: [
     {
      foreignKeyName: 'chat_rooms_created_by_fkey'
      columns: ['created_by']
      referencedRelation: 'sys_users'
      referencedColumns: ['id']
     }
    ]
   }
   // 聊天室成员表
   room_members: {
    Row: {
     id: number
     room_id: number
     user_id: number
     role: string
     joined_at: string | null
     left_at: string | null
     create_time: string
     update_time: string
     deleted: number
    }
    Insert: {
     id?: number
     room_id: number
     user_id: number
     role?: string
     joined_at?: string | null
     left_at?: string | null
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Update: {
     id?: number
     room_id?: number
     user_id?: number
     role?: string
     joined_at?: string | null
     left_at?: string | null
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Relationships: [
     {
      foreignKeyName: 'room_members_room_id_fkey'
      columns: ['room_id']
      referencedRelation: 'chat_rooms'
      referencedColumns: ['id']
     },
     {
      foreignKeyName: 'room_members_user_id_fkey'
      columns: ['user_id']
      referencedRelation: 'sys_users'
      referencedColumns: ['id']
     }
    ]
   }
   // 消息表
   messages: {
    Row: {
     id: number
     room_id: number
     sender_id: number | null
     content: string | null
     message_type: string
     file_url: string | null
     file_name: string | null
     file_size: number | null
     image_width: number | null
     image_height: number | null
     reply_to_id: number | null
     mentioned_users: number[] | null
     is_edited: boolean
     is_deleted: boolean
     create_time: string
     update_time: string
     deleted: number
    }
    Insert: {
     id?: number
     room_id: number
     sender_id?: number | null
     content?: string | null
     message_type?: string
     file_url?: string | null
     file_name?: string | null
     file_size?: number | null
     image_width?: number | null
     image_height?: number | null
     reply_to_id?: number | null
     mentioned_users?: number[] | null
     is_edited?: boolean
     is_deleted?: boolean
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Update: {
     id?: number
     room_id?: number
     sender_id?: number | null
     content?: string | null
     message_type?: string
     file_url?: string | null
     file_name?: string | null
     file_size?: number | null
     image_width?: number | null
     image_height?: number | null
     reply_to_id?: number | null
     mentioned_users?: number[] | null
     is_edited?: boolean
     is_deleted?: boolean
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Relationships: [
     {
      foreignKeyName: 'messages_room_id_fkey'
      columns: ['room_id']
      referencedRelation: 'chat_rooms'
      referencedColumns: ['id']
     },
     {
      foreignKeyName: 'messages_sender_id_fkey'
      columns: ['sender_id']
      referencedRelation: 'sys_users'
      referencedColumns: ['id']
     }
    ]
   }
   // 消息已读状态表
   message_reads: {
    Row: {
     id: number
     message_id: number
     user_id: number
     read_at: string | null
     create_time: string
     update_time: string
     deleted: number
    }
    Insert: {
     id?: number
     message_id: number
     user_id: number
     read_at?: string | null
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Update: {
     id?: number
     message_id?: number
     user_id?: number
     read_at?: string | null
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Relationships: [
     {
      foreignKeyName: 'message_reads_message_id_fkey'
      columns: ['message_id']
      referencedRelation: 'messages'
      referencedColumns: ['id']
     },
     {
      foreignKeyName: 'message_reads_user_id_fkey'
      columns: ['user_id']
      referencedRelation: 'sys_users'
      referencedColumns: ['id']
     }
    ]
   }
   // 好友请求表
   friend_requests: {
    Row: {
     id: number
     sender_id: number
     receiver_id: number
     status: string
     message: string | null
     create_time: string
     update_time: string
     deleted: number
    }
    Insert: {
     id?: number
     sender_id: number
     receiver_id: number
     status?: string
     message?: string | null
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Update: {
     id?: number
     sender_id?: number
     receiver_id?: number
     status?: string
     message?: string | null
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Relationships: [
     {
      foreignKeyName: 'friend_requests_sender_id_fkey'
      columns: ['sender_id']
      referencedRelation: 'sys_users'
      referencedColumns: ['id']
     },
     {
      foreignKeyName: 'friend_requests_receiver_id_fkey'
      columns: ['receiver_id']
      referencedRelation: 'sys_users'
      referencedColumns: ['id']
     }
    ]
   }
   // 好友关系表
   friends: {
    Row: {
     id: number
     user_id: number
     friend_id: number
     create_time: string
     update_time: string
     deleted: number
    }
    Insert: {
     id?: number
     user_id: number
     friend_id: number
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Update: {
     id?: number
     user_id?: number
     friend_id?: number
     create_time?: string
     update_time?: string
     deleted?: number
    }
    Relationships: [
     {
      foreignKeyName: 'friends_user_id_fkey'
      columns: ['user_id']
      referencedRelation: 'sys_users'
      referencedColumns: ['id']
     },
     {
      foreignKeyName: 'friends_friend_id_fkey'
      columns: ['friend_id']
      referencedRelation: 'sys_users'
      referencedColumns: ['id']
     }
    ]
   }
  }
  Views: Record<string, never>
  Functions: Record<string, never>
  Enums: Record<string, never>
 }
}
