/**
 * Supabase Database Types
 *
 * 基于 NebulaHub 的 final.sql 定义
 */

export interface Database {
  public: {
    Tables: {
      // 系统用户表
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
      // 角色表
      sys_roles: {
        Row: {
          id: number
          role_name: string
          role_code: string
          data_scope?: string
          description?: string
          is_system?: boolean
          sort_order?: number
          status: string
          create_time: string
          update_time: string
        }
        Insert: {
          id?: number
          role_name: string
          role_code: string
          data_scope?: string
          description?: string
          is_system?: boolean
          sort_order?: number
          status: string
          create_time?: string
          update_time?: string
        }
        Update: {
          id?: number
          role_name?: string
          role_code?: string
          data_scope?: string
          description?: string
          is_system?: boolean
          sort_order?: number
          status?: string
          create_time?: string
          update_time?: string
        }
        Relationships: []
      }
      // 菜单表
      sys_menus: {
        Row: {
          id: number
          parent_id?: number | null
          menu_type: string
          menu_name: string
          path?: string
          component?: string
          permission?: string
          icon?: string
          sort_order?: number
          is_visible?: boolean
          is_system?: boolean
          create_time: string
          update_time: string
        }
        Insert: {
          id?: number
          parent_id?: number | null
          menu_type: string
          menu_name: string
          path?: string
          component?: string
          permission?: string
          icon?: string
          sort_order?: number
          is_visible?: boolean
          is_system?: boolean
          create_time?: string
          update_time?: string
        }
        Update: {
          id?: number
          parent_id?: number | null
          menu_type?: string
          menu_name?: string
          path?: string
          component?: string
          permission?: string
          icon?: string
          sort_order?: number
          is_visible?: boolean
          is_system?: boolean
          create_time?: string
          update_time?: string
        }
        Relationships: []
      }
      // 用户角色关联表
      sys_user_role: {
        Row: {
          id: number
          user_id: number
          role_id: number
          created_at: string
        }
        Insert: {
          id?: number
          user_id: number
          role_id: number
          created_at?: string
        }
        Update: {
          id?: number
          user_id?: number
          role_id?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sys_user_role_user_id_fkey'
            columns: ['user_id']
            referencedRelation: 'sys_users'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sys_user_role_role_id_fkey'
            columns: ['role_id']
            referencedRelation: 'sys_roles'
            referencedColumns: ['id']
          }
        ]
      }
      // 字典类型表
      sys_dict_type: {
        Row: {
          id: number
          dict_name: string
          dict_code: string
          status: string
          is_system?: boolean
          remark?: string
          sort_order?: number
          create_time: string
          update_time: string
        }
        Insert: {
          id?: number
          dict_name: string
          dict_code: string
          status: string
          is_system?: boolean
          remark?: string
          sort_order?: number
          create_time?: string
          update_time?: string
        }
        Update: {
          id?: number
          dict_name?: string
          dict_code?: string
          status?: string
          is_system?: boolean
          remark?: string
          sort_order?: number
          create_time?: string
          update_time?: string
        }
        Relationships: []
      }
      // 字典数据表
      sys_dict_data: {
        Row: {
          id: number
          dict_type_id: number
          dict_label: string
          dict_value: string
          sort_order: number
          status: string
          is_default?: boolean
          remark?: string
          create_time: string
          update_time: string
        }
        Insert: {
          id?: number
          dict_type_id: number
          dict_label: string
          dict_value: string
          sort_order: number
          status: string
          is_default?: boolean
          remark?: string
          create_time?: string
          update_time?: string
        }
        Update: {
          id?: number
          dict_type_id?: number
          dict_label?: string
          dict_value?: string
          sort_order?: number
          status?: string
          is_default?: boolean
          remark?: string
          create_time?: string
          update_time?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sys_dict_data_dict_type_id_fkey'
            columns: ['dict_type_id']
            referencedRelation: 'sys_dict_type'
            referencedColumns: ['id']
          }
        ]
      }
      // 角色菜单关联表
      sys_role_menu: {
        Row: {
          id: number
          role_id: number
          menu_id: number
          create_time: string
        }
        Insert: {
          id?: number
          role_id: number
          menu_id: number
          create_time?: string
        }
        Update: {
          id?: number
          role_id?: number
          menu_id?: number
          create_time?: string
        }
        Relationships: [
          {
            foreignKeyName: 'sys_role_menu_role_id_fkey'
            columns: ['role_id']
            referencedRelation: 'sys_roles'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'sys_role_menu_menu_id_fkey'
            columns: ['menu_id']
            referencedRelation: 'sys_menus'
            referencedColumns: ['id']
          }
        ]
      }
      // ======================
      // 管理系统补充表（单数名，与 DB 表名对齐）
      // ======================
      sys_role: {
        Row: {
          id: number
          role_name: string
          role_code: string
          data_scope?: string
          description?: string
          is_system?: boolean
          sort_order?: number
          status: string
          create_time: string
          update_time: string
          deleted?: number
        }
        Insert: {
          id?: number
          role_name?: string
          role_code?: string
          data_scope?: string
          description?: string
          is_system?: boolean
          sort_order?: number
          status?: string
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Update: {
          id?: number
          role_name?: string
          role_code?: string
          data_scope?: string
          description?: string
          is_system?: boolean
          sort_order?: number
          status?: string
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Relationships: []
      }
      sys_menu: {
        Row: {
          id: number
          parent_id?: number | null
          menu_type: string
          menu_name: string
          path?: string
          component?: string
          permission?: string
          icon?: string
          sort_order?: number
          is_visible?: boolean
          is_system?: boolean
          create_time: string
          update_time: string
          deleted?: number
        }
        Insert: {
          id?: number
          parent_id?: number | null
          menu_type?: string
          menu_name?: string
          path?: string
          component?: string
          permission?: string
          icon?: string
          sort_order?: number
          is_visible?: boolean
          is_system?: boolean
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Update: {
          id?: number
          parent_id?: number | null
          menu_type?: string
          menu_name?: string
          path?: string
          component?: string
          permission?: string
          icon?: string
          sort_order?: number
          is_visible?: boolean
          is_system?: boolean
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Relationships: []
      }
      sys_config: {
        Row: {
          id: number
          config_key: string
          config_value: string
          config_type?: string
          description?: string
          is_system?: boolean
          create_time: string
          update_time: string
        }
        Insert: {
          id?: number
          config_key?: string
          config_value?: string
          config_type?: string
          description?: string
          is_system?: boolean
          create_time?: string
          update_time?: string
        }
        Update: {
          id?: number
          config_key?: string
          config_value?: string
          config_type?: string
          description?: string
          is_system?: boolean
          create_time?: string
          update_time?: string
        }
        Relationships: []
      }
      // ======================
      // 博客系统表（与 final.sql 对齐）
      // ======================
      blog_category: {
        Row: {
          id: number
          parent_id: number
          category_name: string
          slug: string | null
          description: string | null
          icon: string | null
          sort_order: number
          article_count: number
          status: string
          create_time: string
          update_time: string
          create_by: number | null
          deleted: number
        }
        Insert: {
          id?: number
          parent_id?: number
          category_name: string
          slug?: string | null
          description?: string | null
          icon?: string | null
          sort_order?: number
          article_count?: number
          status?: string
          create_time?: string
          update_time?: string
          create_by?: number | null
          deleted?: number
        }
        Update: {
          id?: number
          parent_id?: number
          category_name?: string
          slug?: string | null
          description?: string | null
          icon?: string | null
          sort_order?: number
          article_count?: number
          status?: string
          create_time?: string
          update_time?: string
          create_by?: number | null
          deleted?: number
        }
        Relationships: []
      }
      blog_tag: {
        Row: {
          id: number
          tag_name: string
          slug: string | null
          description: string | null
          icon: string | null
          color: string | null
          article_count: number
          sort_order: number
          status: string
          create_time: string
          update_time: string
          create_by: number | null
          deleted: number
        }
        Insert: {
          id?: number
          tag_name: string
          slug?: string | null
          description?: string | null
          icon?: string | null
          color?: string | null
          article_count?: number
          sort_order?: number
          status?: string
          create_time?: string
          update_time?: string
          create_by?: number | null
          deleted?: number
        }
        Update: {
          id?: number
          tag_name?: string
          slug?: string | null
          description?: string | null
          icon?: string | null
          color?: string | null
          article_count?: number
          sort_order?: number
          status?: string
          create_time?: string
          update_time?: string
          create_by?: number | null
          deleted?: number
        }
        Relationships: []
      }
      blog_article: {
        Row: {
          id: number
          title: string
          slug: string | null
          summary: string | null
          content: string
          content_html: string | null
          cover_image: string | null
          category_id: number | null
          author_id: number
          author_name: string | null
          view_count: number
          like_count: number
          comment_count: number
          status: string
          is_top: boolean
          is_recommended: boolean
          is_comment_enabled: boolean
          word_count: number | null
          publish_time: string | null
          create_time: string
          update_time: string
          deleted: number
        }
        Insert: {
          id?: number
          title: string
          slug?: string | null
          summary?: string | null
          content: string
          content_html?: string | null
          cover_image?: string | null
          category_id?: number | null
          author_id: number
          author_name?: string | null
          view_count?: number
          like_count?: number
          comment_count?: number
          status?: string
          is_top?: boolean
          is_recommended?: boolean
          is_comment_enabled?: boolean
          word_count?: number | null
          publish_time?: string | null
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Update: {
          id?: number
          title?: string
          slug?: string | null
          summary?: string | null
          content?: string
          content_html?: string | null
          cover_image?: string | null
          category_id?: number | null
          author_id?: number
          author_name?: string | null
          view_count?: number
          like_count?: number
          comment_count?: number
          status?: string
          is_top?: boolean
          is_recommended?: boolean
          is_comment_enabled?: boolean
          word_count?: number | null
          publish_time?: string | null
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Relationships: []
      }
      blog_article_tag: {
        Row: {
          id: number
          article_id: number
          tag_id: number
          create_time: string
        }
        Insert: {
          id?: number
          article_id: number
          tag_id: number
          create_time?: string
        }
        Update: {
          id?: number
          article_id?: number
          tag_id?: number
          create_time?: string
        }
        Relationships: []
      }
      blog_comment: {
        Row: {
          id: number
          article_id: number
          parent_id: number
          user_id: number
          username: string | null
          nickname: string | null
          avatar_url: string | null
          content: string
          ip_address: string | null
          location: string | null
          like_count: number
          status: string
          create_time: string
          update_time: string
          deleted: number
        }
        Insert: {
          id?: number
          article_id: number
          parent_id?: number
          user_id: number
          username?: string | null
          nickname?: string | null
          avatar_url?: string | null
          content: string
          ip_address?: string | null
          location?: string | null
          like_count?: number
          status?: string
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Update: {
          id?: number
          article_id?: number
          parent_id?: number
          user_id?: number
          username?: string | null
          nickname?: string | null
          avatar_url?: string | null
          content?: string
          ip_address?: string | null
          location?: string | null
          like_count?: number
          status?: string
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Relationships: []
      }
      blog_memo: {
        Row: {
          id: number
          user_id: number
          username: string | null
          nickname: string | null
          avatar_url: string | null
          content: string
          visibility: string
          parent_memo_id: number
          image_urls: string[] | null
          link_url: string | null
          link_title: string | null
          link_description: string | null
          link_image_url: string | null
          like_count: number
          comment_count: number
          is_pinned: boolean
          create_time: string
          update_time: string
          deleted: number
        }
        Insert: {
          id?: number
          user_id: number
          username?: string | null
          nickname?: string | null
          avatar_url?: string | null
          content: string
          visibility?: string
          parent_memo_id?: number
          image_urls?: string[] | null
          link_url?: string | null
          link_title?: string | null
          link_description?: string | null
          link_image_url?: string | null
          like_count?: number
          comment_count?: number
          is_pinned?: boolean
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Update: {
          id?: number
          user_id?: number
          username?: string | null
          nickname?: string | null
          avatar_url?: string | null
          content?: string
          visibility?: string
          parent_memo_id?: number
          image_urls?: string[] | null
          link_url?: string | null
          link_title?: string | null
          link_description?: string | null
          link_image_url?: string | null
          like_count?: number
          comment_count?: number
          is_pinned?: boolean
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Relationships: []
      }
      blog_memo_comment: {
        Row: {
          id: number
          memo_id: number
          user_id: number | null
          username: string | null
          nickname: string | null
          avatar_url: string | null
          parent_id: number
          content: string
          ip_address: string | null
          location: string | null
          like_count: number
          create_time: string
          update_time: string
          deleted: number
        }
        Insert: {
          id?: number
          memo_id: number
          user_id?: number | null
          username?: string | null
          nickname?: string | null
          avatar_url?: string | null
          parent_id?: number
          content: string
          ip_address?: string | null
          location?: string | null
          like_count?: number
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Update: {
          id?: number
          memo_id?: number
          user_id?: number | null
          username?: string | null
          nickname?: string | null
          avatar_url?: string | null
          parent_id?: number
          content?: string
          ip_address?: string | null
          location?: string | null
          like_count?: number
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Relationships: []
      }
      blog_memo_like: {
        Row: {
          id: number
          memo_id: number
          user_id: number
          create_time: string
        }
        Insert: {
          id?: number
          memo_id: number
          user_id: number
          create_time?: string
        }
        Update: {
          id?: number
          memo_id?: number
          user_id?: number
          create_time?: string
        }
        Relationships: []
      }

      // 用户网站精选收藏表
      user_website_collection: {
        Row: {
          id: number
          user_id: number
          url: string
          title: string
          description: string | null
          icon_url: string | null
          category: string
          is_featured: boolean
          visit_count: number
          create_time: string
          update_time: string
          deleted: number
        }
        Insert: {
          id?: number
          user_id: number
          url: string
          title: string
          description?: string | null
          icon_url?: string | null
          category?: string
          is_featured?: boolean
          visit_count?: number
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Update: {
          id?: number
          user_id?: number
          url?: string
          title?: string
          description?: string | null
          icon_url?: string | null
          category?: string
          is_featured?: boolean
          visit_count?: number
          create_time?: string
          update_time?: string
          deleted?: number
        }
        Relationships: []
      }
      // 文件元数据表（Drive 页面）
      file_metadata: {
        Row: {
          id: number
          bucket_name: string
          file_path: string
          file_name: string
          file_size: number
          file_type: string
          folder_name: string
          user_id: number
          owner_name: string
          is_shared: boolean
          created_at: string
          updated_at: string
          deleted: number
        }
        Insert: {
          id?: number
          bucket_name: string
          file_path: string
          file_name: string
          file_size?: number
          file_type?: string
          folder_name?: string
          user_id: number
          owner_name?: string
          is_shared?: boolean
          created_at?: string
          updated_at?: string
          deleted?: number
        }
        Update: {
          id?: number
          bucket_name?: string
          file_path?: string
          file_name?: string
          file_size?: number
          file_type?: string
          folder_name?: string
          user_id?: number
          owner_name?: string
          is_shared?: boolean
          created_at?: string
          updated_at?: string
          deleted?: number
        }
        Relationships: []
      }
    }

    Views: Record<string, never>
    Functions: {
      increment_uwc_visit: {
        Args: { website_id_param: number }
        Returns: void
      }
      increment_blog_article_view_count: {
        Args: { article_id_param: number }
        Returns: void
      }
      get_drive_page_data: {
        Args: { p_bucket_name: string; p_folder_name?: string }
        Returns: {
          files_json: unknown[]
          recent_files_json: unknown[]
          folders_json: string[]
          stats_json: unknown[]
        }
      }
    }
    Enums: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row']
export type TablesInsert<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update']
