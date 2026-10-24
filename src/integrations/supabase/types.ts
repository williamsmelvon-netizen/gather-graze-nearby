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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      cuisines: {
        Row: {
          description: string | null
          id: string
          name: string
          sort_order: number | null
        }
        Insert: {
          description?: string | null
          id?: string
          name: string
          sort_order?: number | null
        }
        Update: {
          description?: string | null
          id?: string
          name?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      produce: {
        Row: {
          category: string | null
          est_price_per_unit: number | null
          id: string
          name: string
          notes: string | null
          season_months: number[] | null
          typical_unit: string | null
        }
        Insert: {
          category?: string | null
          est_price_per_unit?: number | null
          id?: string
          name: string
          notes?: string | null
          season_months?: number[] | null
          typical_unit?: string | null
        }
        Update: {
          category?: string | null
          est_price_per_unit?: number | null
          id?: string
          name?: string
          notes?: string | null
          season_months?: number[] | null
          typical_unit?: string | null
        }
        Relationships: []
      }
      program_rules: {
        Row: {
          created_at: string | null
          effective_date: string
          id: string
          program: string
          rule_key: string
          rule_value: string
          source_url: string
        }
        Insert: {
          created_at?: string | null
          effective_date: string
          id?: string
          program: string
          rule_key: string
          rule_value: string
          source_url: string
        }
        Update: {
          created_at?: string | null
          effective_date?: string
          id?: string
          program?: string
          rule_key?: string
          rule_value?: string
          source_url?: string
        }
        Relationships: []
      }
      recipe_ingredients: {
        Row: {
          est_cost: number | null
          id: string
          is_double_up_eligible: boolean | null
          is_pantry: boolean | null
          name: string
          produce_id: string | null
          quantity: number | null
          recipe_id: string | null
          unit: string | null
        }
        Insert: {
          est_cost?: number | null
          id?: string
          is_double_up_eligible?: boolean | null
          is_pantry?: boolean | null
          name: string
          produce_id?: string | null
          quantity?: number | null
          recipe_id?: string | null
          unit?: string | null
        }
        Update: {
          est_cost?: number | null
          id?: string
          is_double_up_eligible?: boolean | null
          is_pantry?: boolean | null
          name?: string
          produce_id?: string | null
          quantity?: number | null
          recipe_id?: string | null
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "recipe_ingredients_produce_id_fkey"
            columns: ["produce_id"]
            isOneToOne: false
            referencedRelation: "produce"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "recipe_ingredients_recipe_id_fkey"
            columns: ["recipe_id"]
            isOneToOne: false
            referencedRelation: "recipes"
            referencedColumns: ["id"]
          },
        ]
      }
      recipes: {
        Row: {
          contributor_name: string | null
          cook_minutes: number | null
          created_at: string | null
          cuisine_id: string | null
          description: string | null
          id: string
          prep_minutes: number | null
          servings: number
          source_type: string | null
          status: string | null
          steps: Json
          tags: string[] | null
          title: string
        }
        Insert: {
          contributor_name?: string | null
          cook_minutes?: number | null
          created_at?: string | null
          cuisine_id?: string | null
          description?: string | null
          id?: string
          prep_minutes?: number | null
          servings: number
          source_type?: string | null
          status?: string | null
          steps: Json
          tags?: string[] | null
          title: string
        }
        Update: {
          contributor_name?: string | null
          cook_minutes?: number | null
          created_at?: string | null
          cuisine_id?: string | null
          description?: string | null
          id?: string
          prep_minutes?: number | null
          servings?: number
          source_type?: string | null
          status?: string | null
          steps?: Json
          tags?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "recipes_cuisine_id_fkey"
            columns: ["cuisine_id"]
            isOneToOne: false
            referencedRelation: "cuisines"
            referencedColumns: ["id"]
          },
        ]
      }
      shopping_lists: {
        Row: {
          created_at: string | null
          device_id: string
          id: string
          recipe_ids: string[] | null
        }
        Insert: {
          created_at?: string | null
          device_id: string
          id?: string
          recipe_ids?: string[] | null
        }
        Update: {
          created_at?: string | null
          device_id?: string
          id?: string
          recipe_ids?: string[] | null
        }
        Relationships: []
      }
      source_produce: {
        Row: {
          produce_id: string
          source_id: string
        }
        Insert: {
          produce_id: string
          source_id: string
        }
        Update: {
          produce_id?: string
          source_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_produce_produce_id_fkey"
            columns: ["produce_id"]
            isOneToOne: false
            referencedRelation: "produce"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_produce_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "sources"
            referencedColumns: ["id"]
          },
        ]
      }
      sources: {
        Row: {
          accepts_snap: boolean | null
          address: string | null
          contact_name: string | null
          created_at: string | null
          double_up: boolean | null
          email: string | null
          hours_note: string | null
          id: string
          lat: number | null
          lng: number | null
          name: string
          phone: string | null
          season_note: string | null
          source_url: string | null
          type: string
          verification_notes: string | null
          verified_on: string | null
          website: string | null
        }
        Insert: {
          accepts_snap?: boolean | null
          address?: string | null
          contact_name?: string | null
          created_at?: string | null
          double_up?: boolean | null
          email?: string | null
          hours_note?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name: string
          phone?: string | null
          season_note?: string | null
          source_url?: string | null
          type: string
          verification_notes?: string | null
          verified_on?: string | null
          website?: string | null
        }
        Update: {
          accepts_snap?: boolean | null
          address?: string | null
          contact_name?: string | null
          created_at?: string | null
          double_up?: boolean | null
          email?: string | null
          hours_note?: string | null
          id?: string
          lat?: number | null
          lng?: number | null
          name?: string
          phone?: string | null
          season_note?: string | null
          source_url?: string | null
          type?: string
          verification_notes?: string | null
          verified_on?: string | null
          website?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
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
      get_shopping_list: {
        Args: { _device_id: string }
        Returns: {
          created_at: string | null
          device_id: string
          id: string
          recipe_ids: string[] | null
        }[]
        SetofOptions: {
          from: "*"
          to: "shopping_lists"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      save_shopping_list: {
        Args: { _device_id: string; _recipe_ids: string[] }
        Returns: {
          created_at: string | null
          device_id: string
          id: string
          recipe_ids: string[] | null
        }
        SetofOptions: {
          from: "*"
          to: "shopping_lists"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "user"],
    },
  },
} as const
