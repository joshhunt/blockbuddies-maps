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
      Feature: {
        Row: {
          created_at: string | null
          created_by: string | null
          cross_dimension: boolean | null
          dimension: number
          icon: string | null
          id: number
          name: string
          pos_x: number | null
          pos_y: number | null
          world: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cross_dimension?: boolean | null
          dimension: number
          icon?: string | null
          id?: number
          name: string
          pos_x?: number | null
          pos_y?: number | null
          world: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cross_dimension?: boolean | null
          dimension?: number
          icon?: string | null
          id?: number
          name?: string
          pos_x?: number | null
          pos_y?: number | null
          world?: number
        }
        Relationships: [
          {
            foreignKeyName: "Feature_created_by_fkey"
            columns: ["created_by"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "Feature_world_fkey"
            columns: ["world"]
            referencedRelation: "World"
            referencedColumns: ["id"]
          }
        ]
      }
      World: {
        Row: {
          created_at: string | null
          id: number
          name: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          name?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          name?: string | null
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
