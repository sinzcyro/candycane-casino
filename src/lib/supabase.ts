import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://cwbakceemcylvnsdegad.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN3YmFrY2VlbWN5bHZuc2RlZ2FkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzODQxODUsImV4cCI6MjA5MDk2MDE4NX0.uFV-jA4OstFOHx9nDIFvaYLLjVZciBDXV-bMa3OuTR4'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)