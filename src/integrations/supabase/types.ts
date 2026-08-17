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
    PostgrestVersion: "14.15"
  }
  public: {
    Tables: {
      emails: {
        Row: {
          body: string
          call_to_action: string
          context: string
          created_at: string
          id: string
          length: string
          purpose: string
          recipient: string
          subject: string
          tone: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body?: string
          call_to_action?: string
          context?: string
          created_at?: string
          id?: string
          length?: string
          purpose?: string
          recipient?: string
          subject?: string
          tone?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          call_to_action?: string
          context?: string
          created_at?: string
          id?: string
          length?: string
          purpose?: string
          recipient?: string
          subject?: string
          tone?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      meetings: {
        Row: {
          action_items: Json
          created_at: string
          decisions: Json
          id: string
          key_points: Json
          meeting_date: string | null
          next_steps: Json
          open_questions: Json
          participants: string
          summary: string
          title: string
          transcript: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_items?: Json
          created_at?: string
          decisions?: Json
          id?: string
          key_points?: Json
          meeting_date?: string | null
          next_steps?: Json
          open_questions?: Json
          participants?: string
          summary?: string
          title?: string
          transcript?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_items?: Json
          created_at?: string
          decisions?: Json
          id?: string
          key_points?: Json
          meeting_date?: string | null
          next_steps?: Json
          open_questions?: Json
          participants?: string
          summary?: string
          title?: string
          transcript?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string
          created_at: string
          default_depth: string
          default_length: string
          default_tone: string
          full_name: string
          id: string
          job_title: string
          language: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          company?: string
          created_at?: string
          default_depth?: string
          default_length?: string
          default_tone?: string
          full_name?: string
          id: string
          job_title?: string
          language?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          company?: string
          created_at?: string
          default_depth?: string
          default_length?: string
          default_tone?: string
          full_name?: string
          id?: string
          job_title?: string
          language?: string
          updated_at?: string
        }
        Relationships: []
      }
      research: {
        Row: {
          analysis: string
          benefits: Json
          created_at: string
          depth: string
          findings: Json
          format: string
          id: string
          messages: Json
          question: string
          recommendations: Json
          risks: Json
          sources: Json
          summary: string
          updated_at: string
          user_id: string
        }
        Insert: {
          analysis?: string
          benefits?: Json
          created_at?: string
          depth?: string
          findings?: Json
          format?: string
          id?: string
          messages?: Json
          question?: string
          recommendations?: Json
          risks?: Json
          sources?: Json
          summary?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          analysis?: string
          benefits?: Json
          created_at?: string
          depth?: string
          findings?: Json
          format?: string
          id?: string
          messages?: Json
          question?: string
          recommendations?: Json
          risks?: Json
          sources?: Json
          summary?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
