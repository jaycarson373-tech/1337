export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

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
        Relationships: [
          {
            foreignKeyName: "user_wallets_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "chats_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "messages_chat_id_fkey";
            columns: ["chat_id"];
            isOneToOne: false;
            referencedRelation: "chats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "messages_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };
      query_charges: {
        Row: {
          id: string;
          user_id: string | null;
          chat_id: string | null;
          message_id: string | null;
          status: string;
          actual_llm_usd: number | null;
          charged_usd: number | null;
          token_price_usd: number | null;
          burn_amount_ui: number | null;
          burn_amount_raw: string | null;
          burn_signature: string | null;
          error: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          chat_id?: string | null;
          message_id?: string | null;
          status: string;
          actual_llm_usd?: number | null;
          charged_usd?: number | null;
          token_price_usd?: number | null;
          burn_amount_ui?: number | null;
          burn_amount_raw?: string | null;
          burn_signature?: string | null;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          chat_id?: string | null;
          message_id?: string | null;
          status?: string;
          actual_llm_usd?: number | null;
          charged_usd?: number | null;
          token_price_usd?: number | null;
          burn_amount_ui?: number | null;
          burn_amount_raw?: string | null;
          burn_signature?: string | null;
          error?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "query_charges_chat_id_fkey";
            columns: ["chat_id"];
            isOneToOne: false;
            referencedRelation: "chats";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "query_charges_message_id_fkey";
            columns: ["message_id"];
            isOneToOne: false;
            referencedRelation: "messages";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "query_charges_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Relationships: [
          {
            foreignKeyName: "balance_snapshots_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
