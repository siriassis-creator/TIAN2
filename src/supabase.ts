// src/supabase.ts
import { createClient } from '@supabase/supabase-js';

// 🎯 ใส่ URL และ Key ของโปรเจกต์ Supabase คุณครูตรงนี้ครับ
const supabaseUrl = 'https://rgorrttanduagmkemugj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnb3JydHRhbmR1YWdta2VtdWdqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTAwOTA4NzQsImV4cCI6MjEwNTY2Njg3NH0.K5YsVa8juBEYC2JQYyK29hig_InlnntrV5RiWUsnKJE';

export const supabase = createClient(supabaseUrl, supabaseKey);