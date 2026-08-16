// Config Supabase — côté client.
// La clé "anon" est PUBLIQUE par design (protégée par les Row Level Security
// policies côté Supabase), ce n'est pas un secret à cacher.
//
// Récupère ces deux valeurs sur :
// Supabase → ton projet → Project Settings → API
//   - "Project URL"      → SUPABASE_URL
//   - "anon public" key  → SUPABASE_ANON_KEY

const SUPABASE_URL = 'https://fwpgmrevhngpmqcndwxi.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_hECATpn30tQxMfaqn0YX0A_K2A5uwhl';

const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
