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
      build_partners: {
        Row: {
          category: string | null
          created_at: string
          id: string
          instagram: string | null
          logo_url: string | null
          name: string
          updated_at: string
          website: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name: string
          updated_at?: string
          website?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          instagram?: string | null
          logo_url?: string | null
          name?: string
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      feature_partners: {
        Row: {
          created_at: string
          feature_id: string
          partner_id: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          feature_id: string
          partner_id: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          feature_id?: string
          partner_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "feature_partners_feature_id_fkey"
            columns: ["feature_id"]
            isOneToOne: false
            referencedRelation: "features"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "feature_partners_partner_id_fkey"
            columns: ["partner_id"]
            isOneToOne: false
            referencedRelation: "build_partners"
            referencedColumns: ["id"]
          },
        ]
      }
      features: {
        Row: {
          build_specs: Json
          category: string | null
          created_at: string
          engine: string | null
          feature_number: number
          gallery_images: Json
          hero_image: string | null
          id: string
          instagram_post_url: string | null
          make: string
          model: string | null
          owner_instagram: string
          publish_date: string
          published: boolean
          seo_description: string | null
          seo_title: string | null
          slug: string | null
          sponsors: Json
          status: string
          story: string | null
          title: string
          truck_year: number | null
          updated_at: string
          view_count: number
        }
        Insert: {
          build_specs?: Json
          category?: string | null
          created_at?: string
          engine?: string | null
          feature_number: number
          gallery_images?: Json
          hero_image?: string | null
          id?: string
          instagram_post_url?: string | null
          make: string
          model?: string | null
          owner_instagram: string
          publish_date?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          sponsors?: Json
          status?: string
          story?: string | null
          title: string
          truck_year?: number | null
          updated_at?: string
          view_count?: number
        }
        Update: {
          build_specs?: Json
          category?: string | null
          created_at?: string
          engine?: string | null
          feature_number?: number
          gallery_images?: Json
          hero_image?: string | null
          id?: string
          instagram_post_url?: string | null
          make?: string
          model?: string | null
          owner_instagram?: string
          publish_date?: string
          published?: boolean
          seo_description?: string | null
          seo_title?: string | null
          slug?: string | null
          sponsors?: Json
          status?: string
          story?: string | null
          title?: string
          truck_year?: number | null
          updated_at?: string
          view_count?: number
        }
        Relationships: []
      }
      submissions: {
        Row: {
          build_list: string | null
          created_at: string
          email: string
          engine: string | null
          id: string
          instagram: string
          make: string
          model: string | null
          name: string
          photo_urls: Json
          status: Database["public"]["Enums"]["submission_status"]
          story: string | null
          suspension: string | null
          truck_year: number | null
          wheel_setup: string | null
        }
        Insert: {
          build_list?: string | null
          created_at?: string
          email: string
          engine?: string | null
          id?: string
          instagram: string
          make: string
          model?: string | null
          name: string
          photo_urls?: Json
          status?: Database["public"]["Enums"]["submission_status"]
          story?: string | null
          suspension?: string | null
          truck_year?: number | null
          wheel_setup?: string | null
        }
        Update: {
          build_list?: string | null
          created_at?: string
          email?: string
          engine?: string | null
          id?: string
          instagram?: string
          make?: string
          model?: string | null
          name?: string
          photo_urls?: Json
          status?: Database["public"]["Enums"]["submission_status"]
          story?: string | null
          suspension?: string | null
          truck_year?: number | null
          wheel_setup?: string | null
        }
        Relationships: []
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
          role: Database["public"]["Enums"]["app_role"]
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
      increment_feature_views: {
        Args: { _feature_number: number }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin"
      submission_status: "pending" | "approved" | "rejected"
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
      app_role: ["admin"],
      submission_status: ["pending", "approved", "rejected"],
    },
  },
} as const
