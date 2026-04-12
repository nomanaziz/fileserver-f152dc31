export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activity_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      ad_inquiries: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          placement: string
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          placement: string
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          placement?: string
          status?: string
        }
        Relationships: []
      }
      ad_slots: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          max_ads: number
          placement: string
          price_per_month: number
          size_label: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_ads?: number
          placement: string
          price_per_month?: number
          size_label?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          max_ads?: number
          placement?: string
          price_per_month?: number
          size_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      ads: {
        Row: {
          ad_source: string
          ad_type: string | null
          advertiser_email: string | null
          advertiser_name: string | null
          clicks: number | null
          content: string | null
          created_at: string
          device_target: string | null
          ends_at: string | null
          id: string
          image_url: string | null
          impressions: number | null
          is_active: boolean
          link_url: string | null
          placement: string | null
          position: string
          priority: number | null
          starts_at: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ad_source?: string
          ad_type?: string | null
          advertiser_email?: string | null
          advertiser_name?: string | null
          clicks?: number | null
          content?: string | null
          created_at?: string
          device_target?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          is_active?: boolean
          link_url?: string | null
          placement?: string | null
          position?: string
          priority?: number | null
          starts_at?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ad_source?: string
          ad_type?: string | null
          advertiser_email?: string | null
          advertiser_name?: string | null
          clicks?: number | null
          content?: string | null
          created_at?: string
          device_target?: string | null
          ends_at?: string | null
          id?: string
          image_url?: string | null
          impressions?: number | null
          is_active?: boolean
          link_url?: string | null
          placement?: string | null
          position?: string
          priority?: number | null
          starts_at?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      bdix_servers: {
        Row: {
          category: string
          created_at: string
          id: string
          is_active: boolean
          links: string[]
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          is_active?: boolean
          links?: string[]
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean
          links?: string[]
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          content: string | null
          created_at: string
          excerpt: string | null
          id: string
          is_published: boolean
          published_at: string | null
          slug: string
          thumbnail_url: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug: string
          thumbnail_url?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string | null
          content?: string | null
          created_at?: string
          excerpt?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          slug?: string
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      cart_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
          quantity: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          quantity?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          quantity?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          status: string
          subject: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          subject?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message: string
          sender_id: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message: string
          sender_id: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          is_read: boolean
          message: string
          name: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_read?: boolean
          message: string
          name: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_read?: boolean
          message?: string
          name?: string
          subject?: string | null
        }
        Relationships: []
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          discount_percent: number
          discount_type: string | null
          discount_value: number | null
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          discount_percent?: number
          discount_type?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          discount_percent?: number
          discount_type?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          used_count?: number
        }
        Relationships: []
      }
      download_history: {
        Row: {
          downloaded_at: string
          id: string
          product_id: string
          server_id: string | null
          user_id: string
        }
        Insert: {
          downloaded_at?: string
          id?: string
          product_id: string
          server_id?: string | null
          user_id: string
        }
        Update: {
          downloaded_at?: string
          id?: string
          product_id?: string
          server_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "download_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_history_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "download_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      download_servers: {
        Row: {
          base_url: string
          created_at: string
          id: string
          is_active: boolean
          label: string | null
          name: string
          priority: number
          server_type: string | null
        }
        Insert: {
          base_url: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          name: string
          priority?: number
          server_type?: string | null
        }
        Update: {
          base_url?: string
          created_at?: string
          id?: string
          is_active?: boolean
          label?: string | null
          name?: string
          priority?: number
          server_type?: string | null
        }
        Relationships: []
      }
      favorites: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "favorites_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      live_channels: {
        Row: {
          category: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          sort_order: number
          stream_url: string
          thumbnail_url: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          stream_url: string
          thumbnail_url?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          stream_url?: string
          thumbnail_url?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          label: string
          location: string
          parent_id: string | null
          sort_order: number
          url: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label: string
          location?: string
          parent_id?: string | null
          sort_order?: number
          url: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          label?: string
          location?: string
          parent_id?: string | null
          sort_order?: number
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "menu_items"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      pages: {
        Row: {
          content: string | null
          created_at: string
          id: string
          is_published: boolean
          slug: string
          title: string
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug: string
          title: string
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          is_published?: boolean
          slug?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          account_number: string | null
          account_type: string | null
          bank_name: string | null
          branch_name: string | null
          color: string | null
          created_at: string | null
          id: string
          instructions: string | null
          is_active: boolean | null
          logo_url: string | null
          name: string
          routing_number: string | null
          slug: string
          sort_order: number | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          branch_name?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          routing_number?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          account_type?: string | null
          bank_name?: string | null
          branch_name?: string | null
          color?: string | null
          created_at?: string | null
          id?: string
          instructions?: string | null
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          routing_number?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          currency: string
          gateway_response: Json | null
          id: string
          payment_method: string | null
          product_id: string | null
          status: string
          subscription_id: string | null
          transaction_id: string | null
          user_id: string
          vendor_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          gateway_response?: Json | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          status?: string
          subscription_id?: string | null
          transaction_id?: string | null
          user_id: string
          vendor_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          gateway_response?: Json | null
          id?: string
          payment_method?: string | null
          product_id?: string | null
          status?: string
          subscription_id?: string | null
          transaction_id?: string | null
          user_id?: string
          vendor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          category_id: string
          product_id: string
        }
        Insert: {
          category_id: string
          product_id: string
        }
        Update: {
          category_id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_categories_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_downloads: {
        Row: {
          created_at: string
          download_url: string
          file_name: string | null
          file_size: string | null
          id: string
          product_id: string
          server_id: string
        }
        Insert: {
          created_at?: string
          download_url: string
          file_name?: string | null
          file_size?: string | null
          id?: string
          product_id: string
          server_id: string
        }
        Update: {
          created_at?: string
          download_url?: string
          file_name?: string | null
          file_size?: string | null
          id?: string
          product_id?: string
          server_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_downloads_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_downloads_server_id_fkey"
            columns: ["server_id"]
            isOneToOne: false
            referencedRelation: "download_servers"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          affiliate_link: string | null
          category_id: string | null
          content_type: Database["public"]["Enums"]["content_type"]
          created_at: string
          created_by: string | null
          description: string | null
          developer: string | null
          discount_price: number | null
          download_count: number
          file_size: string | null
          file_type: string | null
          git_url: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_featured: boolean
          is_paid: boolean
          is_trending: boolean | null
          is_vendor_product: boolean
          is_verified: boolean | null
          license_type: string | null
          os_type: Database["public"]["Enums"]["os_type"] | null
          price: number
          programming_language: string | null
          release_date: string | null
          screenshots: string[] | null
          slug: string
          source_url: string | null
          status: Database["public"]["Enums"]["product_status"]
          tags: string[] | null
          thumbnail_icon: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          vendor_id: string | null
          vendor_status: string
          version: string | null
          video_duration: string | null
          video_url: string | null
          view_count: number
        }
        Insert: {
          affiliate_link?: string | null
          category_id?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          developer?: string | null
          discount_price?: number | null
          download_count?: number
          file_size?: string | null
          file_type?: string | null
          git_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean
          is_paid?: boolean
          is_trending?: boolean | null
          is_vendor_product?: boolean
          is_verified?: boolean | null
          license_type?: string | null
          os_type?: Database["public"]["Enums"]["os_type"] | null
          price?: number
          programming_language?: string | null
          release_date?: string | null
          screenshots?: string[] | null
          slug: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[] | null
          thumbnail_icon?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          vendor_id?: string | null
          vendor_status?: string
          version?: string | null
          video_duration?: string | null
          video_url?: string | null
          view_count?: number
        }
        Update: {
          affiliate_link?: string | null
          category_id?: string | null
          content_type?: Database["public"]["Enums"]["content_type"]
          created_at?: string
          created_by?: string | null
          description?: string | null
          developer?: string | null
          discount_price?: number | null
          download_count?: number
          file_size?: string | null
          file_type?: string | null
          git_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_featured?: boolean
          is_paid?: boolean
          is_trending?: boolean | null
          is_vendor_product?: boolean
          is_verified?: boolean | null
          license_type?: string | null
          os_type?: Database["public"]["Enums"]["os_type"] | null
          price?: number
          programming_language?: string | null
          release_date?: string | null
          screenshots?: string[] | null
          slug?: string
          source_url?: string | null
          status?: Database["public"]["Enums"]["product_status"]
          tags?: string[] | null
          thumbnail_icon?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          vendor_id?: string | null
          vendor_status?: string
          version?: string | null
          video_duration?: string | null
          video_url?: string | null
          view_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          is_active: boolean
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          is_active?: boolean
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id: string
          rating?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_queue: {
        Row: {
          content_type: string | null
          created_at: string | null
          error_message: string | null
          id: string
          source_site: string | null
          status: string | null
          url: string
        }
        Insert: {
          content_type?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          source_site?: string | null
          status?: string | null
          url: string
        }
        Update: {
          content_type?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          source_site?: string | null
          status?: string | null
          url?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: string | null
        }
        Relationships: []
      }
      software_request_subscribers: {
        Row: {
          created_at: string
          id: string
          request_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          request_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          request_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "software_request_subscribers_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "software_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      software_requests: {
        Row: {
          admin_note: string | null
          created_at: string
          description: string | null
          fulfilled_product_id: string | null
          id: string
          is_notified: boolean
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          admin_note?: string | null
          created_at?: string
          description?: string | null
          fulfilled_product_id?: string | null
          id?: string
          is_notified?: boolean
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          admin_note?: string | null
          created_at?: string
          description?: string | null
          fulfilled_product_id?: string | null
          id?: string
          is_notified?: boolean
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "software_requests_fulfilled_product_id_fkey"
            columns: ["fulfilled_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          daily_download_limit: number | null
          description: string | null
          duration_days: number
          features: string[] | null
          id: string
          is_active: boolean
          name: string
          price: number
          total_download_limit: number | null
        }
        Insert: {
          created_at?: string
          daily_download_limit?: number | null
          description?: string | null
          duration_days?: number
          features?: string[] | null
          id?: string
          is_active?: boolean
          name: string
          price: number
          total_download_limit?: number | null
        }
        Update: {
          created_at?: string
          daily_download_limit?: number | null
          description?: string | null
          duration_days?: number
          features?: string[] | null
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          total_download_limit?: number | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          plan_id: string
          starts_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          plan_id: string
          starts_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          plan_id?: string
          starts_at?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_saved_bdix_links: {
        Row: {
          id: string
          links: string[]
          updated_at: string
          user_id: string
        }
        Insert: {
          id?: string
          links?: string[]
          updated_at?: string
          user_id: string
        }
        Update: {
          id?: string
          links?: string[]
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      vendor_earnings: {
        Row: {
          commission_amount: number
          created_at: string
          id: string
          payment_id: string | null
          product_id: string | null
          sale_amount: number
          vendor_amount: number
          vendor_id: string
        }
        Insert: {
          commission_amount?: number
          created_at?: string
          id?: string
          payment_id?: string | null
          product_id?: string | null
          sale_amount?: number
          vendor_amount?: number
          vendor_id: string
        }
        Update: {
          commission_amount?: number
          created_at?: string
          id?: string
          payment_id?: string | null
          product_id?: string | null
          sale_amount?: number
          vendor_amount?: number
          vendor_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_earnings_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vendor_earnings_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_payouts: {
        Row: {
          account_details: Json | null
          admin_note: string | null
          amount: number
          created_at: string
          id: string
          payment_method: string | null
          processed_at: string | null
          status: string
          vendor_id: string
        }
        Insert: {
          account_details?: Json | null
          admin_note?: string | null
          amount: number
          created_at?: string
          id?: string
          payment_method?: string | null
          processed_at?: string | null
          status?: string
          vendor_id: string
        }
        Update: {
          account_details?: Json | null
          admin_note?: string | null
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string | null
          processed_at?: string | null
          status?: string
          vendor_id?: string
        }
        Relationships: []
      }
      vendor_profiles: {
        Row: {
          available_balance: number
          commission_rate: number
          created_at: string
          id: string
          is_active: boolean
          is_verified: boolean
          logo_url: string | null
          store_description: string | null
          store_name: string
          tier_id: string | null
          total_earnings: number
          updated_at: string
        }
        Insert: {
          available_balance?: number
          commission_rate?: number
          created_at?: string
          id: string
          is_active?: boolean
          is_verified?: boolean
          logo_url?: string | null
          store_description?: string | null
          store_name: string
          tier_id?: string | null
          total_earnings?: number
          updated_at?: string
        }
        Update: {
          available_balance?: number
          commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean
          is_verified?: boolean
          logo_url?: string | null
          store_description?: string | null
          store_name?: string
          tier_id?: string | null
          total_earnings?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vendor_profiles_tier_id_fkey"
            columns: ["tier_id"]
            isOneToOne: false
            referencedRelation: "vendor_tiers"
            referencedColumns: ["id"]
          },
        ]
      }
      vendor_tiers: {
        Row: {
          color: string
          commission_rate: number
          created_at: string
          id: string
          is_active: boolean
          min_sales_count: number
          min_total_earnings: number
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string
          commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean
          min_sales_count?: number
          min_total_earnings?: number
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string
          commission_rate?: number
          created_at?: string
          id?: string
          is_active?: boolean
          min_sales_count?: number
          min_total_earnings?: number
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
      content_type:
        | "software"
        | "android"
        | "game"
        | "movie"
        | "music"
        | "ebook"
        | "tutorial"
        | "other"
      os_type:
        | "windows"
        | "mac"
        | "linux"
        | "android"
        | "ios"
        | "cross_platform"
        | "other"
      product_status: "draft" | "published" | "archived"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
      content_type: [
        "software",
        "android",
        "game",
        "movie",
        "music",
        "ebook",
        "tutorial",
        "other",
      ],
      os_type: [
        "windows",
        "mac",
        "linux",
        "android",
        "ios",
        "cross_platform",
        "other",
      ],
      product_status: ["draft", "published", "archived"],
    },
  },
} as const
