import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lmwojzkjtrsypgbwzvgw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxtd29qemtqdHJzeXBnYnd6dmd3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0MDcxNDcsImV4cCI6MjA1NTk4MzE0N30.CpD61ZNwY77A9VaKVd3lSmlJBjwuGnWKA1OJWYMDG9I';

export const supabase = createClient(supabaseUrl, supabaseKey);