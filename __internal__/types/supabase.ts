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
      candidates: {
        Row: {
          id: string
          email: string
          token: string
          status: 'invited' | 'downloaded' | 'completed'
          created_at: string
          downloaded_at: string | null
          download_count: number
        }
        Insert: {
          id?: string
          email: string
          token: string
          status?: 'invited' | 'downloaded' | 'completed'
          created_at?: string
          downloaded_at?: string | null
          download_count?: number
        }
        Update: {
          id?: string
          email?: string
          token?: string
          status?: 'invited' | 'downloaded' | 'completed'
          created_at?: string
          downloaded_at?: string | null
          download_count?: number
        }
        Relationships: []
      }
      releases: {
        Row: {
          id: string
          tag_name: string
          name: string
          download_url: string
          zip_asset_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          tag_name: string
          name: string
          download_url: string
          zip_asset_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          tag_name?: string
          name?: string
          download_url?: string
          zip_asset_url?: string | null
          created_at?: string
        }
        Relationships: []
      }
    }
    Views: {}
    Functions: {}
    Enums: {}
    CompositeTypes: {}
  }
}