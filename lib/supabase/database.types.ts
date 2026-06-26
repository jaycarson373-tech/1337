export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          email?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      user_wallets: {
        Row: {
          id: string;
          user_id: string | null;
          public_key: string;
          encrypted_private_key: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          public_key: string;
          encrypted_private_key: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          public_key?: string;
          encrypted_private_key?: string;
          created_at?: string;
        };
        Relationships: Relationship[];
      };
      chats: {
        Row: {
          id: string;
          user_id: string | null;
          title: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          title?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          title?: string | null;
          created_at?: string;
        };
        Relationships: Relationship[];
      };
      messages: {
        Row: {
          id: string;
          chat_id: string | null;
          user_id: string | null;
          role: string;
          content: string;
          cost_usd: number | null;
          burned_1337: number | null;
          burn_signature: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          chat_id?: string | null;
          user_id?: string | null;
          role: string;
          content: string;
          cost_usd?: number | null;
          burned_1337?: number | null;
          burn_signature?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string | null;
          user_id?: string | null;
          role?: string;
          content?: string;
          cost_usd?: number | null;
          burned_1337?: number | null;
          burn_signature?: string | null;
          created_at?: string;
        };
        Relationships: Relationship[];
      };
      query_charges: {
        Row: {
          id: string;
          user_id: string | null;
          chat_id: string | null;
          message_id: string | null;
          request_run_id: string | null;
          status: string;
          preflight_balance_raw: string | null;
          estimated_cost_usd: number | null;
          actual_llm_usd: number | null;
          charged_usd: number | null;
          token_price_usd: number | null;
          burn_amount_ui: number | null;
          burn_amount_raw: string | null;
          burn_destination: string | null;
          burn_signature: string | null;
          idempotency_key: string | null;
          pricing_inputs: Json;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          chat_id?: string | null;
          message_id?: string | null;
          request_run_id?: string | null;
          status: string;
          preflight_balance_raw?: string | null;
          estimated_cost_usd?: number | null;
          actual_llm_usd?: number | null;
          charged_usd?: number | null;
          token_price_usd?: number | null;
          burn_amount_ui?: number | null;
          burn_amount_raw?: string | null;
          burn_destination?: string | null;
          burn_signature?: string | null;
          idempotency_key?: string | null;
          pricing_inputs?: Json;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          chat_id?: string | null;
          message_id?: string | null;
          request_run_id?: string | null;
          status?: string;
          preflight_balance_raw?: string | null;
          estimated_cost_usd?: number | null;
          actual_llm_usd?: number | null;
          charged_usd?: number | null;
          token_price_usd?: number | null;
          burn_amount_ui?: number | null;
          burn_amount_raw?: string | null;
          burn_destination?: string | null;
          burn_signature?: string | null;
          idempotency_key?: string | null;
          pricing_inputs?: Json;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      balance_snapshots: {
        Row: {
          id: string;
          user_id: string | null;
          public_key: string;
          token_mint: string;
          raw_amount: string;
          ui_amount: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          public_key: string;
          token_mint: string;
          raw_amount: string;
          ui_amount: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          public_key?: string;
          token_mint?: string;
          raw_amount?: string;
          ui_amount?: number;
          created_at?: string;
        };
        Relationships: Relationship[];
      };
      request_runs: {
        Row: {
          id: string;
          user_id: string | null;
          chat_id: string | null;
          message_id: string | null;
          status: string;
          intent: string | null;
          degraded: boolean;
          failure_reason: string | null;
          idempotency_key: string;
          transitions: Json;
          metadata: Json;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          chat_id?: string | null;
          message_id?: string | null;
          status: string;
          intent?: string | null;
          degraded?: boolean;
          failure_reason?: string | null;
          idempotency_key: string;
          transitions?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          chat_id?: string | null;
          message_id?: string | null;
          status?: string;
          intent?: string | null;
          degraded?: boolean;
          failure_reason?: string | null;
          idempotency_key?: string;
          transitions?: Json;
          metadata?: Json;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      adapter_runs: {
        Row: {
          id: string;
          request_run_id: string | null;
          adapter_id: string;
          status: string;
          source_count: number;
          confidence: string | null;
          error: string | null;
          started_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          request_run_id?: string | null;
          adapter_id: string;
          status: string;
          source_count?: number;
          confidence?: string | null;
          error?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          request_run_id?: string | null;
          adapter_id?: string;
          status?: string;
          source_count?: number;
          confidence?: string | null;
          error?: string | null;
          started_at?: string;
          completed_at?: string | null;
        };
        Relationships: Relationship[];
      };
      burn_attempts: {
        Row: {
          id: string;
          request_run_id: string | null;
          user_id: string | null;
          status: string;
          burn_amount_raw: string;
          burn_amount_ui: number;
          token_mint: string;
          signature: string | null;
          idempotency_key: string;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          request_run_id?: string | null;
          user_id?: string | null;
          status: string;
          burn_amount_raw: string;
          burn_amount_ui: number;
          token_mint: string;
          signature?: string | null;
          idempotency_key: string;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          request_run_id?: string | null;
          user_id?: string | null;
          status?: string;
          burn_amount_raw?: string;
          burn_amount_ui?: number;
          token_mint?: string;
          signature?: string | null;
          idempotency_key?: string;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: Relationship[];
      };
      model_usage: {
        Row: {
          id: string;
          request_run_id: string | null;
          provider: string;
          model: string;
          provider_request_id: string | null;
          input_tokens: number | null;
          output_tokens: number | null;
          actual_cost_usd: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_run_id?: string | null;
          provider: string;
          model: string;
          provider_request_id?: string | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          actual_cost_usd?: number | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          request_run_id?: string | null;
          provider?: string;
          model?: string;
          provider_request_id?: string | null;
          input_tokens?: number | null;
          output_tokens?: number | null;
          actual_cost_usd?: number | null;
          created_at?: string;
        };
        Relationships: Relationship[];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
