import { createClient } from '@supabase/supabase-js';

// Admin client con service_role key per operazioni privilegiate
const supabaseAdmin = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: false,
      detectSessionInUrl: false
    }
  }
);

export { supabaseAdmin }; 