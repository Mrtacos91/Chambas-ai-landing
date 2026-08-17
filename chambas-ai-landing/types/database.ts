export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type UserType = "usuario" | "admin";
export type CompanyRole = "admin" | "usuario";
export type SignupStatus = "pending" | "approved" | "rejected";
export type ActivationSource = "manual" | "stripe";
export type ActivationStatus = "pending" | "completed" | "failed" | "refunded";

export interface Database {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          user_type: UserType;
          is_active: boolean;
          last_login_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          user_type?: UserType;
          is_active?: boolean;
          last_login_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["user_profiles"]["Insert"]>;
        Relationships: [];
      };
      company_users: {
        Row: {
          id: string;
          company_id: string;
          user_id: string;
          role: CompanyRole;
          invited_by: string | null;
          accepted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id: string;
          role: CompanyRole;
          invited_by?: string | null;
          accepted_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["company_users"]["Insert"]>;
        Relationships: [];
      };
      company_signups: {
        Row: {
          id: string;
          user_id: string;
          company_name: string;
          contact_name: string | null;
          contact_phone: string | null;
          industry: string | null;
          expected_volume: string | null;
          status: SignupStatus;
          reviewed_by: string | null;
          reviewed_at: string | null;
          rejection_reason: string | null;
          created_company_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_name: string;
          contact_name?: string | null;
          contact_phone?: string | null;
          industry?: string | null;
          expected_volume?: string | null;
          status?: SignupStatus;
        };
        Update: Partial<Database["public"]["Tables"]["company_signups"]["Insert"]> & {
          reviewed_by?: string | null;
          reviewed_at?: string | null;
          rejection_reason?: string | null;
          created_company_id?: string | null;
        };
        Relationships: [];
      };
      company_invitations: {
        Row: {
          id: string;
          company_id: string;
          email: string;
          role: CompanyRole;
          invited_by: string;
          token: string;
          expires_at: string;
          accepted_at: string | null;
          accepted_by: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          email: string;
          role: CompanyRole;
          invited_by: string;
          token: string;
          expires_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["company_invitations"]["Insert"]> & {
          accepted_at?: string | null;
          accepted_by?: string | null;
        };
        Relationships: [];
      };
      company_activation_records: {
        Row: {
          id: string;
          company_id: string;
          user_id: string | null;
          source: ActivationSource;
          status: ActivationStatus;
          amount_cents: number | null;
          currency: string | null;
          stripe_session_id: string | null;
          stripe_payment_intent_id: string | null;
          activated_by: string | null;
          completed_at: string | null;
          metadata: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          user_id?: string | null;
          source: ActivationSource;
          status: ActivationStatus;
          amount_cents?: number | null;
          currency?: string | null;
          stripe_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          activated_by?: string | null;
          completed_at?: string | null;
          metadata?: Json;
        };
        Update: Partial<Database["public"]["Tables"]["company_activation_records"]["Insert"]>;
        Relationships: [];
      };
      auth_events: {
        Row: {
          id: string;
          user_id: string | null;
          email: string | null;
          event_type: string;
          metadata: Json;
          ip_address: string | null;
          user_agent: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          email?: string | null;
          event_type: string;
          metadata?: Json;
          ip_address?: string | null;
          user_agent?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["auth_events"]["Insert"]>;
        Relationships: [];
      };
      companies: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          contact_name: string | null;
          contact_phone: string | null;
          contact_email: string | null;
          active: boolean | null;
          activated_at: string | null;
          activation_source: ActivationSource | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          contact_name?: string | null;
          contact_phone?: string | null;
          contact_email?: string | null;
          active?: boolean | null;
          activated_at?: string | null;
          activation_source?: ActivationSource | null;
        };
        Update: Partial<Database["public"]["Tables"]["companies"]["Insert"]>;
        Relationships: [];
      };
      vacancies: {
        Row: {
          id: string;
          company_id: string | null;
          title: string;
          description: string | null;
          location: string | null;
          schedule: string | null;
          salary_min: number | null;
          salary_max: number | null;
          preferred_shift: string | null;
          experience_required: string | null;
          benefits: string | null;
          requirements: string | null;
          interview_at: string | null;
          interview_address: string | null;
          interview_details: string | null;
          work_start_on: string | null;
          active: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          company_id?: string | null;
          title: string;
          description?: string | null;
          location?: string | null;
          schedule?: string | null;
          salary_min?: number | null;
          salary_max?: number | null;
          preferred_shift?: string | null;
          experience_required?: string | null;
          benefits?: string | null;
          requirements?: string | null;
          interview_at?: string | null;
          interview_address?: string | null;
          interview_details?: string | null;
          work_start_on?: string | null;
          active?: boolean | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["vacancies"]["Insert"]>;
        Relationships: [];
      };
      candidates: {
        Row: {
          id: string;
          telefono: string;
          nombre_completo: string | null;
          edad: number | null;
          ubicacion: string | null;
          ultimo_empleo: string | null;
          puesto_buscado: string | null;
          experiencia: string | null;
          disponibilidad: string | null;
          turno_preferido: string | null;
          expectativa_salarial: string | null;
          documentacion: string | null;
          curp: string | null;
          source: string | null;
          campaign: string | null;
          medium: string | null;
          status: string | null;
          created_at: string | null;
          updated_at: string | null;
          profile_completed_at: string | null;
          last_seen_at: string | null;
          last_profile_update_at: string | null;
        };
        Insert: { telefono: string };
        Update: Partial<Database["public"]["Tables"]["candidates"]["Insert"]>;
        Relationships: [];
      };
      candidate_sessions: {
        Row: {
          id: string;
          telefono: string;
          current_step: string;
          data: Json;
          last_message_id: string | null;
          last_interaction_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: { telefono: string };
        Update: Partial<Database["public"]["Tables"]["candidate_sessions"]["Insert"]>;
        Relationships: [];
      };
      whatsapp_messages: {
        Row: {
          id: string;
          telefono: string;
          whatsapp_message_id: string | null;
          direction: string;
          message_type: string | null;
          payload: Json | null;
          created_at: string | null;
        };
        Insert: { telefono: string; direction: string };
        Update: Partial<Database["public"]["Tables"]["whatsapp_messages"]["Insert"]>;
        Relationships: [];
      };
      candidate_vacancy_matches: {
        Row: {
          id: string;
          candidate_phone: string;
          vacancy_id: string | null;
          match_status: string | null;
          created_at: string | null;
        };
        Insert: { candidate_phone: string };
        Update: Partial<Database["public"]["Tables"]["candidate_vacancy_matches"]["Insert"]>;
        Relationships: [];
      };
      candidate_selected_vacancies: {
        Row: {
          id: string;
          candidate_phone: string;
          vacancy_id: string | null;
          status: string | null;
          created_at: string | null;
        };
        Insert: { candidate_phone: string };
        Update: Partial<Database["public"]["Tables"]["candidate_selected_vacancies"]["Insert"]>;
        Relationships: [];
      };
      vacancy_candidate_pipeline: {
        Row: {
          id: string;
          vacancy_id: string;
          candidate_phone: string;
          stage: string;
          notes: string;
          has_interest: boolean;
          source: string;
          last_activity_at: string;
          updated_by: string | null;
          confirmation_status: string;
          confirmation_sent_at: string | null;
          reminder_sent_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          vacancy_id: string;
          candidate_phone: string;
          stage?: string;
          notes?: string;
          has_interest?: boolean;
          source?: string;
          last_activity_at?: string;
          updated_by?: string | null;
          confirmation_status?: string;
          confirmation_sent_at?: string | null;
          reminder_sent_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["vacancy_candidate_pipeline"]["Insert"]>;
        Relationships: [];
      };
      company_hiring_message_templates: {
        Row: {
          id: string;
          company_id: string;
          stage: string;
          body: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          stage: string;
          body?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["company_hiring_message_templates"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: {
      current_user_type: { Args: Record<string, never>; Returns: string };
      is_executive: { Args: Record<string, never>; Returns: boolean };
      is_admin: { Args: Record<string, never>; Returns: boolean };
      user_belongs_to_company: { Args: { target_company: string }; Returns: boolean };
      get_access_context: {
        Args: { p_user_id: string };
        Returns: {
          user_id: string;
          platform_role: string;
          company_role: string | null;
          phase: string;
          company_id: string | null;
          company_name: string | null;
          company_active: boolean;
          redirect_path: string;
        }[];
      };
    };
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
