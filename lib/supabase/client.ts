import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/**
 * Cliente Supabase para uso no browser (frontend).
 * Usa NEXT_PUBLIC_SUPABASE_ANON_KEY — chave pública, pode ser exposta.
 * Esta chave só tem acesso de LEITURA conforme as políticas RLS configuradas.
 *
 * NUNCA use SUPABASE_SERVICE_ROLE_KEY no frontend.
 *
 * O cliente é inicializado de forma lazy para evitar erro durante o build estático.
 */

let _client: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient {
  if (_client) return _client;

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      "Variáveis de ambiente Supabase não configuradas.\n" +
      "Verifique NEXT_PUBLIC_SUPABASE_URL e NEXT_PUBLIC_SUPABASE_ANON_KEY no .env.local"
    );
  }

  _client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      // Desabilita autenticação — este MVP usa dados públicos via RLS
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  return _client;
}

// Alias para compatibilidade com código existente que importe `supabase`
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    return getSupabaseClient()[prop as keyof SupabaseClient];
  },
});
