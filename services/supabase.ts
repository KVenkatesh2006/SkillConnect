/// <reference types="vite/client" />
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.1';

// Replace with your actual environment variables config
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://tnicoearfahpplklltmn.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRuaWNvZWFyZmFocHBsa2xsdG1uIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ3NDg5MjgsImV4cCI6MjA5MDMyNDkyOH0.9E0po5vUqQDRfVZGWtDKKdbKT0O8WptfB0--Alx1ifs';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
