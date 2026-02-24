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
      products: {
        Row: {
          id: string
          model_number: string
          jan_code: string | null
          product_name: string
          manufacturer_name: string | null
          category: string | null
          image_url: string | null
          category_emoji: string | null
          default_warranty_months: number
          created_at: string
        }
        Insert: {
          id?: string
          model_number: string
          jan_code?: string | null
          product_name: string
          manufacturer_name?: string | null
          category?: string | null
          image_url?: string | null
          category_emoji?: string | null
          default_warranty_months?: number
          created_at?: string
        }
        Update: {
          id?: string
          model_number?: string
          jan_code?: string | null
          product_name?: string
          manufacturer_name?: string | null
          category?: string | null
          image_url?: string | null
          category_emoji?: string | null
          default_warranty_months?: number
          created_at?: string
        }
      }
      user_products: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          purchase_date: string | null
          purchase_store: string | null
          warranty_start: string | null
          warranty_end: string | null
          receipt_photo_url: string | null
          warranty_photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          purchase_date?: string | null
          purchase_store?: string | null
          warranty_start?: string | null
          warranty_end?: string | null
          receipt_photo_url?: string | null
          warranty_photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          purchase_date?: string | null
          purchase_store?: string | null
          warranty_start?: string | null
          warranty_end?: string | null
          receipt_photo_url?: string | null
          warranty_photo_url?: string | null
          created_at?: string
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          is_resolved: boolean
          is_escalated: boolean
          ai_summary: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          is_resolved?: boolean
          is_escalated?: boolean
          ai_summary?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          is_resolved?: boolean
          is_escalated?: boolean
          ai_summary?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          conversation_id: string | null
          role: 'user' | 'assistant'
          content: string
          source_reference: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          role: 'user' | 'assistant'
          content: string
          source_reference?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string | null
          role?: 'user' | 'assistant'
          content?: string
          source_reference?: string | null
          created_at?: string
        }
      }
      tickets: {
        Row: {
          id: string
          conversation_id: string | null
          user_product_id: string | null
          status: 'new' | 'in_progress' | 'resolved' | 'closed'
          symptom: string | null
          tried_solutions: string | null
          warranty_status: string | null
          photo_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          conversation_id?: string | null
          user_product_id?: string | null
          status?: 'new' | 'in_progress' | 'resolved' | 'closed'
          symptom?: string | null
          tried_solutions?: string | null
          warranty_status?: string | null
          photo_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          conversation_id?: string | null
          user_product_id?: string | null
          status?: 'new' | 'in_progress' | 'resolved' | 'closed'
          symptom?: string | null
          tried_solutions?: string | null
          warranty_status?: string | null
          photo_url?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// 便利な型エイリアス
export type Product = Database['public']['Tables']['products']['Row']
export type UserProduct = Database['public']['Tables']['user_products']['Row']
export type Conversation = Database['public']['Tables']['conversations']['Row']
export type Message = Database['public']['Tables']['messages']['Row']
export type Ticket = Database['public']['Tables']['tickets']['Row']
