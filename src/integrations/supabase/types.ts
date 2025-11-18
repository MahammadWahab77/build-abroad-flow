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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      documents: {
        Row: {
          created_at: string
          document_type: string
          document_url: string | null
          id: number
          lead_id: number
          remarks: string | null
          updated_at: string
          uploaded_by: number | null
          uploaded_by_uuid: string | null
        }
        Insert: {
          created_at?: string
          document_type: string
          document_url?: string | null
          id?: number
          lead_id: number
          remarks?: string | null
          updated_at?: string
          uploaded_by?: number | null
          uploaded_by_uuid?: string | null
        }
        Update: {
          created_at?: string
          document_type?: string
          document_url?: string | null
          id?: number
          lead_id?: number
          remarks?: string | null
          updated_at?: string
          uploaded_by?: number | null
          uploaded_by_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "duplicate_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_normalized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_users_id_fk"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_uploaded_by_uuid_fkey"
            columns: ["uploaded_by_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          counsellors: string | null
          counselor_id: number | null
          counselor_uuid: string | null
          country: string | null
          course: string | null
          created_at: string
          current_stage: string
          email: string | null
          id: number
          instagram_post_id: string | null
          intake: string | null
          manager_id: number | null
          manager_uuid: string | null
          name: string
          passport_status: string | null
          phone: string
          prev_consultancy: string | null
          remarks: string | null
          source: string | null
          source_platform: string | null
          uid: string | null
          updated_at: string
        }
        Insert: {
          counsellors?: string | null
          counselor_id?: number | null
          counselor_uuid?: string | null
          country?: string | null
          course?: string | null
          created_at?: string
          current_stage?: string
          email?: string | null
          id?: number
          instagram_post_id?: string | null
          intake?: string | null
          manager_id?: number | null
          manager_uuid?: string | null
          name: string
          passport_status?: string | null
          phone: string
          prev_consultancy?: string | null
          remarks?: string | null
          source?: string | null
          source_platform?: string | null
          uid?: string | null
          updated_at?: string
        }
        Update: {
          counsellors?: string | null
          counselor_id?: number | null
          counselor_uuid?: string | null
          country?: string | null
          course?: string | null
          created_at?: string
          current_stage?: string
          email?: string | null
          id?: number
          instagram_post_id?: string | null
          intake?: string | null
          manager_id?: number | null
          manager_uuid?: string | null
          name?: string
          passport_status?: string | null
          phone?: string
          prev_consultancy?: string | null
          remarks?: string | null
          source?: string | null
          source_platform?: string | null
          uid?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_counselor_id_users_id_fk"
            columns: ["counselor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_counselor_uuid_fkey"
            columns: ["counselor_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_manager_id_users_id_fk"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leads_manager_uuid_fkey"
            columns: ["manager_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          is_active?: boolean
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      remarks: {
        Row: {
          content: string
          created_at: string
          id: number
          is_visible: boolean
          lead_id: number
          user_id: number
          user_uuid: string | null
        }
        Insert: {
          content: string
          created_at?: string
          id?: number
          is_visible?: boolean
          lead_id: number
          user_id: number
          user_uuid?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          id?: number
          is_visible?: boolean
          lead_id?: number
          user_id?: number
          user_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "remarks_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "duplicate_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remarks_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remarks_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_normalized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remarks_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remarks_user_uuid_fkey"
            columns: ["user_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stage_history: {
        Row: {
          created_at: string
          from_stage: string | null
          id: number
          lead_id: number
          reason: string | null
          to_stage: string
          user_id: number
          user_uuid: string | null
        }
        Insert: {
          created_at?: string
          from_stage?: string | null
          id?: number
          lead_id: number
          reason?: string | null
          to_stage: string
          user_id: number
          user_uuid?: string | null
        }
        Update: {
          created_at?: string
          from_stage?: string | null
          id?: number
          lead_id?: number
          reason?: string | null
          to_stage?: string
          user_id?: number
          user_uuid?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stage_history_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "duplicate_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_normalized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stage_history_user_uuid_fkey"
            columns: ["user_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          application_count: number | null
          application_process: string | null
          application_status: string | null
          call_status: string | null
          call_type: string | null
          commission_status: string | null
          connect_status: string | null
          created_at: string
          deposit_status: string | null
          id: number
          is_rescheduled: boolean | null
          lead_id: number
          offer_letter_status: string | null
          preferred_language: string | null
          reason_not_interested: string | null
          remarks: string | null
          session_date: string | null
          session_status: string | null
          shortlisting_initiated: string | null
          shortlisting_status: string | null
          task_type: string
          tracking_status: string | null
          tuition_status: string | null
          user_id: number
          user_uuid: string | null
          visa_status: string | null
        }
        Insert: {
          application_count?: number | null
          application_process?: string | null
          application_status?: string | null
          call_status?: string | null
          call_type?: string | null
          commission_status?: string | null
          connect_status?: string | null
          created_at?: string
          deposit_status?: string | null
          id?: number
          is_rescheduled?: boolean | null
          lead_id: number
          offer_letter_status?: string | null
          preferred_language?: string | null
          reason_not_interested?: string | null
          remarks?: string | null
          session_date?: string | null
          session_status?: string | null
          shortlisting_initiated?: string | null
          shortlisting_status?: string | null
          task_type: string
          tracking_status?: string | null
          tuition_status?: string | null
          user_id: number
          user_uuid?: string | null
          visa_status?: string | null
        }
        Update: {
          application_count?: number | null
          application_process?: string | null
          application_status?: string | null
          call_status?: string | null
          call_type?: string | null
          commission_status?: string | null
          connect_status?: string | null
          created_at?: string
          deposit_status?: string | null
          id?: number
          is_rescheduled?: boolean | null
          lead_id?: number
          offer_letter_status?: string | null
          preferred_language?: string | null
          reason_not_interested?: string | null
          remarks?: string | null
          session_date?: string | null
          session_status?: string | null
          shortlisting_initiated?: string | null
          shortlisting_status?: string | null
          task_type?: string
          tracking_status?: string | null
          tuition_status?: string | null
          user_id?: number
          user_uuid?: string | null
          visa_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "duplicate_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_normalized"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_users_id_fk"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_uuid_fkey"
            columns: ["user_uuid"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      university_applications: {
        Row: {
          created_at: string
          id: number
          lead_id: number
          password: string | null
          status: string | null
          university_name: string
          university_url: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          lead_id: number
          password?: string | null
          status?: string | null
          university_name: string
          university_url?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          lead_id?: number
          password?: string | null
          status?: string | null
          university_name?: string
          university_url?: string | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "university_applications_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "duplicate_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_applications_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "university_applications_lead_id_leads_id_fk"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads_normalized"
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
      users: {
        Row: {
          created_at: string
          email: string
          id: number
          is_active: boolean
          name: string
          password: string
          phone: string | null
          reset_password_expires: string | null
          reset_password_token: string | null
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: number
          is_active?: boolean
          name: string
          password: string
          phone?: string | null
          reset_password_expires?: string | null
          reset_password_token?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: number
          is_active?: boolean
          name?: string
          password?: string
          phone?: string | null
          reset_password_expires?: string | null
          reset_password_token?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      apps_submitted_daily: {
        Row: {
          applications: number | null
          day: string | null
        }
        Relationships: []
      }
      counselling_conversions_daily: {
        Row: {
          conversions: number | null
          day: string | null
        }
        Relationships: []
      }
      duplicate_leads: {
        Row: {
          created_at: string | null
          email_dupe_count: number | null
          email_norm: string | null
          id: number | null
          name: string | null
          phone_dupe_count: number | null
          phone_norm: string | null
          source: string | null
        }
        Relationships: []
      }
      followups_daily: {
        Row: {
          day: string | null
          followups: number | null
        }
        Relationships: []
      }
      leads_daily: {
        Row: {
          day: string | null
          leads: number | null
          source: string | null
        }
        Relationships: []
      }
      leads_instagram_daily: {
        Row: {
          day: string | null
          ig_source: string | null
          leads: number | null
        }
        Relationships: []
      }
      leads_monthly: {
        Row: {
          leads: number | null
          month: string | null
          source: string | null
        }
        Relationships: []
      }
      leads_normalized: {
        Row: {
          created_at: string | null
          email_norm: string | null
          id: number | null
          name: string | null
          phone_norm: string | null
          source: string | null
        }
        Insert: {
          created_at?: string | null
          email_norm?: never
          id?: number | null
          name?: string | null
          phone_norm?: never
          source?: string | null
        }
        Update: {
          created_at?: string | null
          email_norm?: never
          id?: number | null
          name?: string | null
          phone_norm?: never
          source?: string | null
        }
        Relationships: []
      }
      leads_weekly: {
        Row: {
          leads: number | null
          source: string | null
          week: string | null
        }
        Relationships: []
      }
      shortlisting_daily: {
        Row: {
          day: string | null
          shortlisted: number | null
        }
        Relationships: []
      }
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
      app_role: "admin" | "counselor"
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
      app_role: ["admin", "counselor"],
    },
  },
} as const
