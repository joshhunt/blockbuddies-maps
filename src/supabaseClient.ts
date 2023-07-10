import {
  PostgrestSingleResponse,
  RealtimePostgresChangesPayload,
  createClient,
} from "@supabase/supabase-js";
import { Database } from "./supabase";
import { useEffect, useState } from "react";
import { WorldRow } from "./types";

function getEnvVar(key: string): string {
  const value: unknown = import.meta.env[key];

  if (!value || typeof value !== "string") {
    throw new Error(`Environment variable ${key} is not defined`);
  }

  return value;
}

const supabaseUrl = "https://aolkuuzpqnuodyufkogt.supabase.co";

export const DONT_QUERY: unique symbol = Symbol("Don't query :)");

export const supabase = createClient<Database>(
  supabaseUrl,
  getEnvVar("VITE_SUPABASE_KEY")
);

export function createSubscription(
  tableName: string,
  filter: string | undefined,
  onEvent: (payload: RealtimePostgresChangesPayload<any>) => void
) {
  const channel = supabase
    .channel("schema-db-changes")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: tableName,
        filter,
      },
      onEvent
    )
    .subscribe();

  return channel;
}

interface EqFilter {
  column: string;
  value: string | number;
}

export function useSubscription<T extends { id: any }>(
  tableName: string,
  filter?: EqFilter | typeof DONT_QUERY
): T[] {
  const [items, setItems] = useState<T[]>([]);

  useEffect(() => {
    if (filter === DONT_QUERY) {
      return;
    }

    let initialQuery = supabase.from(tableName).select();

    if (filter) {
      initialQuery = initialQuery.eq(filter.column, filter.value);
    }

    const initialLoadPromise = initialQuery.then(({ data }) => {
      if (data) {
        setItems(data);
      }
    });

    console.log("subscribing");
    const subscriptionFilter = filter
      ? `${filter.column}=eq.${filter.value}`
      : undefined;
    const channel = createSubscription(
      tableName,
      subscriptionFilter,
      async (payload) => {
        await initialLoadPromise;

        if (payload.eventType === "INSERT") {
          setItems((oldItems) => [...oldItems, payload.new]);
        }

        if (payload.eventType === "UPDATE") {
          setItems((oldItems) =>
            oldItems.map((v) => {
              if (v.id === payload.new.id) {
                return payload.new;
              }

              return v;
            })
          );
        }

        if (payload.eventType === "DELETE") {
          setItems((oldItems) => oldItems.filter((v) => v !== payload.old.id));
        }
      }
    );

    return () => {
      console.log("unsubscribing");
      channel.unsubscribe();
    };
  }, [filter, tableName]);

  return items;
}

export function useWorlds() {
  const [worlds, setWorlds] = useState<WorldRow[]>([]);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    function onFulfilled({ data }: PostgrestSingleResponse<WorldRow[]>) {
      if (data) {
        setWorlds(data);
        setError(null);
      }
    }

    function onRejected(err: unknown) {
      setError(err);
    }

    supabase.from("World").select().then(onFulfilled, onRejected);
  }, []);

  return [worlds, error] as const;
}

export function useWorld(worldSlug: string) {
  const [world, setWorld] = useState<WorldRow | null>(null);
  const [error, setError] = useState<unknown | null>(null);

  useEffect(() => {
    function onFulfilled({ data }: PostgrestSingleResponse<WorldRow | null>) {
      if (data) {
        setWorld(data);
        setError(null);
      }
    }

    function onRejected(err: unknown) {
      setError(err);
    }

    supabase
      .from("World")
      .select()
      .eq("slug", worldSlug)
      .maybeSingle()
      .then(onFulfilled, onRejected);
  }, [worldSlug]);

  return [world, error] as const;
}
