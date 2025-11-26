export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          username: string
          email: string
          display_name: string | null
          is_admin: boolean
          is_banned: boolean
          created_at: string
          updated_at: string
          max_sites: number
          daily_deploy_limit: number
          max_upload_size_mb: number
        }
        Insert: {
          id: string
          username: string
          email: string
          display_name?: string | null
          is_admin?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
          max_sites?: number
          daily_deploy_limit?: number
          max_upload_size_mb?: number
        }
        Update: {
          id?: string
          username?: string
          email?: string
          display_name?: string | null
          is_admin?: boolean
          is_banned?: boolean
          created_at?: string
          updated_at?: string
          max_sites?: number
          daily_deploy_limit?: number
          max_upload_size_mb?: number
        }
      }
      sites: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          is_published: boolean
          storage_bytes: number
          total_views: number
          last_deployed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          description?: string | null
          is_published?: boolean
          storage_bytes?: number
          total_views?: number
          last_deployed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          is_published?: boolean
          storage_bytes?: number
          total_views?: number
          last_deployed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deployments: {
        Row: {
          id: string
          site_id: string
          user_id: string
          status: 'pending' | 'processing' | 'success' | 'failed'
          file_count: number
          size_bytes: number
          is_preview: boolean
          preview_id: string | null
          error_message: string | null
          deployed_at: string
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          user_id: string
          status?: 'pending' | 'processing' | 'success' | 'failed'
          file_count?: number
          size_bytes?: number
          is_preview?: boolean
          preview_id?: string | null
          error_message?: string | null
          deployed_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          user_id?: string
          status?: 'pending' | 'processing' | 'success' | 'failed'
          file_count?: number
          size_bytes?: number
          is_preview?: boolean
          preview_id?: string | null
          error_message?: string | null
          deployed_at?: string
          created_at?: string
        }
      }
      analytics: {
        Row: {
          id: string
          site_id: string
          page_path: string
          views: number
          date: string
          created_at: string
        }
        Insert: {
          id?: string
          site_id: string
          page_path: string
          views?: number
          date: string
          created_at?: string
        }
        Update: {
          id?: string
          site_id?: string
          page_path?: string
          views?: number
          date?: string
          created_at?: string
        }
      }
      rate_limits: {
        Row: {
          id: string
          user_id: string
          action_type: 'deploy' | 'upload' | 'api_call'
          action_count: number
          reset_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          action_type: 'deploy' | 'upload' | 'api_call'
          action_count?: number
          reset_at: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          action_type?: 'deploy' | 'upload' | 'api_call'
          action_count?: number
          reset_at?: string
          created_at?: string
        }
      }
      admin_logs: {
        Row: {
          id: string
          admin_id: string
          action: string
          target_user_id: string | null
          target_site_id: string | null
          details: Json | null
          ip_address: string | null
          created_at: string
        }
        Insert: {
          id?: string
          admin_id: string
          action: string
          target_user_id?: string | null
          target_site_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          admin_id?: string
          action?: string
          target_user_id?: string | null
          target_site_id?: string | null
          details?: Json | null
          ip_address?: string | null
          created_at?: string
        }
      }
    }
  }
}
