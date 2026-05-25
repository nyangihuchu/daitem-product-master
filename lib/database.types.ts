// supabase gen types 대신 수동 작성 (Supabase CLI 미설치 환경 대응)
// schema.md 및 lib/types.ts 기준으로 11개 테이블 타입 정의

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          email: string
          role: 'admin' | 'operator' | 'viewer'
          notification_settings: Json | null
          created_at: string
        }
        Insert: {
          id: string
          email: string
          role?: 'admin' | 'operator' | 'viewer'
          notification_settings?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          role?: 'admin' | 'operator' | 'viewer'
          notification_settings?: Json | null
          created_at?: string
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          id: string
          name: string
          contact_name: string | null
          contact_phone: string | null
          payment_term: 'prepaid' | 'postpaid' | 'monthly'
          lead_time_days: number | null
          memo: string | null
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          contact_name?: string | null
          contact_phone?: string | null
          payment_term?: 'prepaid' | 'postpaid' | 'monthly'
          lead_time_days?: number | null
          memo?: string | null
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          contact_name?: string | null
          contact_phone?: string | null
          payment_term?: 'prepaid' | 'postpaid' | 'monthly'
          lead_time_days?: number | null
          memo?: string | null
          deleted_at?: string | null
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          supplier_id: string | null
          sku: string
          supplier_item_no: string | null
          internal_code: string
          name: string
          brand: string | null
          model_name: string | null
          category_large: string | null
          category_medium: string | null
          category_small: string | null
          spec: string | null
          unit: string | null
          origin: string | null
          image_url: string | null
          price_list_image_url: string | null
          standard_price: number | null
          base_selling_price: number | null
          purchase_price: number
          shipping_fee: number | null
          lead_time_desc: string | null
          is_returnable: boolean
          status: 'selling' | 'out_of_stock' | 'discontinued' | 'pending' | 'reviewing'
          stock_quantity: number
          min_stock_quantity: number
          cafe24_product_id: string | null
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          supplier_id?: string | null
          sku: string
          supplier_item_no?: string | null
          internal_code: string
          name: string
          brand?: string | null
          model_name?: string | null
          category_large?: string | null
          category_medium?: string | null
          category_small?: string | null
          spec?: string | null
          unit?: string | null
          origin?: string | null
          image_url?: string | null
          price_list_image_url?: string | null
          standard_price?: number | null
          base_selling_price?: number | null
          purchase_price?: number
          shipping_fee?: number | null
          lead_time_desc?: string | null
          is_returnable?: boolean
          status?: 'selling' | 'out_of_stock' | 'discontinued' | 'pending' | 'reviewing'
          stock_quantity?: number
          min_stock_quantity?: number
          cafe24_product_id?: string | null
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string | null
          sku?: string
          supplier_item_no?: string | null
          internal_code?: string
          name?: string
          brand?: string | null
          model_name?: string | null
          category_large?: string | null
          category_medium?: string | null
          category_small?: string | null
          spec?: string | null
          unit?: string | null
          origin?: string | null
          image_url?: string | null
          price_list_image_url?: string | null
          standard_price?: number | null
          base_selling_price?: number | null
          purchase_price?: number
          shipping_fee?: number | null
          lead_time_desc?: string | null
          is_returnable?: boolean
          status?: 'selling' | 'out_of_stock' | 'discontinued' | 'pending' | 'reviewing'
          stock_quantity?: number
          min_stock_quantity?: number
          cafe24_product_id?: string | null
          deleted_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'products_supplier_id_fkey'
            columns: ['supplier_id']
            referencedRelation: 'suppliers'
            referencedColumns: ['id']
          },
        ]
      }
      market_listings: {
        Row: {
          id: string
          product_id: string
          market_name: 'cafe24' | 'naver' | 'coupang' | 'gmarket' | 'auction' | 'lotteon' | '11st'
          market_product_code: string | null
          listing_url: string | null
          selling_price: number
          registered_at: string
        }
        Insert: {
          id?: string
          product_id: string
          market_name: 'cafe24' | 'naver' | 'coupang' | 'gmarket' | 'auction' | 'lotteon' | '11st'
          market_product_code?: string | null
          listing_url?: string | null
          selling_price?: number
          registered_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          market_name?: 'cafe24' | 'naver' | 'coupang' | 'gmarket' | 'auction' | 'lotteon' | '11st'
          market_product_code?: string | null
          listing_url?: string | null
          selling_price?: number
          registered_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'market_listings_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      price_history: {
        Row: {
          id: string
          product_id: string
          previous_price: number
          new_price: number
          changed_at: string
        }
        Insert: {
          id?: string
          product_id: string
          previous_price: number
          new_price: number
          changed_at?: string
        }
        Update: {
          id?: string
          product_id?: string
          previous_price?: number
          new_price?: number
          changed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'price_history_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      orders: {
        Row: {
          id: string
          internal_order_no: string
          market_order_no: string | null
          channel: 'cafe24' | 'naver' | 'coupang' | 'gmarket' | 'auction' | 'lotteon' | '11st'
          source_type: 'manual' | 'api'
          status: 'received' | 'ordered' | 'shipping' | 'delivered' | 'settled' | 'cancelled' | 'returned'
          ordered_at: string
          created_at: string
        }
        Insert: {
          id?: string
          internal_order_no: string
          market_order_no?: string | null
          channel: 'cafe24' | 'naver' | 'coupang' | 'gmarket' | 'auction' | 'lotteon' | '11st'
          source_type?: 'manual' | 'api'
          status?: 'received' | 'ordered' | 'shipping' | 'delivered' | 'settled' | 'cancelled' | 'returned'
          ordered_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          internal_order_no?: string
          market_order_no?: string | null
          channel?: 'cafe24' | 'naver' | 'coupang' | 'gmarket' | 'auction' | 'lotteon' | '11st'
          source_type?: 'manual' | 'api'
          status?: 'received' | 'ordered' | 'shipping' | 'delivered' | 'settled' | 'cancelled' | 'returned'
          ordered_at?: string
          created_at?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string
          quantity: number
          selling_price: number
        }
        Insert: {
          id?: string
          order_id: string
          product_id: string
          quantity: number
          selling_price: number
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string
          quantity?: number
          selling_price?: number
        }
        Relationships: [
          {
            foreignKeyName: 'order_items_order_id_fkey'
            columns: ['order_id']
            referencedRelation: 'orders'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'order_items_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      purchases: {
        Row: {
          id: string
          supplier_id: string
          trigger_type: 'manual' | 'auto'
          status: 'pending' | 'ordered' | 'shipping' | 'received'
          total_amount: number
          ordered_at: string
          deleted_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          supplier_id: string
          trigger_type?: 'manual' | 'auto'
          status?: 'pending' | 'ordered' | 'shipping' | 'received'
          total_amount?: number
          ordered_at?: string
          deleted_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          supplier_id?: string
          trigger_type?: 'manual' | 'auto'
          status?: 'pending' | 'ordered' | 'shipping' | 'received'
          total_amount?: number
          ordered_at?: string
          deleted_at?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'purchases_supplier_id_fkey'
            columns: ['supplier_id']
            referencedRelation: 'suppliers'
            referencedColumns: ['id']
          },
        ]
      }
      purchase_items: {
        Row: {
          id: string
          purchase_id: string
          product_id: string
          quantity: number
          purchase_price: number
        }
        Insert: {
          id?: string
          purchase_id: string
          product_id: string
          quantity: number
          purchase_price: number
        }
        Update: {
          id?: string
          purchase_id?: string
          product_id?: string
          quantity?: number
          purchase_price?: number
        }
        Relationships: [
          {
            foreignKeyName: 'purchase_items_purchase_id_fkey'
            columns: ['purchase_id']
            referencedRelation: 'purchases'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'purchase_items_product_id_fkey'
            columns: ['product_id']
            referencedRelation: 'products'
            referencedColumns: ['id']
          },
        ]
      }
      market_fees: {
        Row: {
          id: string
          market_name: 'cafe24' | 'naver' | 'coupang' | 'gmarket' | 'auction' | 'lotteon' | '11st'
          fee_rate: number
          applied_at: string
          created_at: string
        }
        Insert: {
          id?: string
          market_name: 'cafe24' | 'naver' | 'coupang' | 'gmarket' | 'auction' | 'lotteon' | '11st'
          fee_rate: number
          applied_at: string
          created_at?: string
        }
        Update: {
          id?: string
          market_name?: 'cafe24' | 'naver' | 'coupang' | 'gmarket' | 'auction' | 'lotteon' | '11st'
          fee_rate?: number
          applied_at?: string
          created_at?: string
        }
        Relationships: []
      }
      schedules: {
        Row: {
          id: string
          type: 'supplier' | 'market' | 'internal' | 'customer'
          title: string
          description: string | null
          assigned_user_id: string | null
          scheduled_at: string
          notify_days_before: number[]
          is_completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type: 'supplier' | 'market' | 'internal' | 'customer'
          title: string
          description?: string | null
          assigned_user_id?: string | null
          scheduled_at: string
          notify_days_before?: number[]
          is_completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          type?: 'supplier' | 'market' | 'internal' | 'customer'
          title?: string
          description?: string | null
          assigned_user_id?: string | null
          scheduled_at?: string
          notify_days_before?: number[]
          is_completed?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'schedules_assigned_user_id_fkey'
            columns: ['assigned_user_id']
            referencedRelation: 'users'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}

export type Tables<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Row']

export type TablesInsert<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Insert']

export type TablesUpdate<T extends keyof Database['public']['Tables']> =
  Database['public']['Tables'][T]['Update']
