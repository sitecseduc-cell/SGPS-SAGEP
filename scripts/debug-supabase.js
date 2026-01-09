import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Load .env manually
try {
    const envPath = path.resolve(process.cwd(), '.env');
    const envConfig = fs.readFileSync(envPath, 'utf-8');
    envConfig.split('\n').forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, ''); // strip quotes
            process.env[key] = val;
        }
    });
} catch (e) {
    console.error("⚠️ Could not read .env file");
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Environment Variables!");
    process.exit(1);
}

console.log(`Connecting to Supabase: ${supabaseUrl.substring(0, 15)}...`);

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
    console.log("\n1. Testing Connection & Public Table Access...");
    const { data: rules, error: rulesError } = await supabase.from('access_rules').select('count', { count: 'exact', head: true });

    if (rulesError) {
        console.error("❌ Failed to access 'access_rules':", rulesError.message);
        if (rulesError.code === '42P01') console.error("   └─ Table 'access_rules' does not exist? (Did you run schema.sql?)");
    } else {
        console.log("✅ Successfully connected. 'access_rules' exists.");
    }

    console.log("\n2. Testing 'profiles' Table Access (Anonymous)...");
    // Anonymous user tries to read profiles
    const { data: profiles, error: profileError } = await supabase.from('profiles').select('count', { count: 'exact', head: true });

    if (profileError) {
        console.error("❌ Failed to query 'profiles':", profileError.message);
    } else {
        // If we count 0 but no error, RLS might be hiding rows or table is empty
        // If we count N, then RLS allows anonymous reading? (Wait, my policy was 'TO authenticated USING (true)')
        // So anonymous should see NOTHING or 0 rows if RLS works.
        console.log(`ℹ️ Anonymous query returned ${profiles?.length ?? 0} rows (count header: ${profiles}). (Should be blocked or empty for anonymous if RLS is strict)`);
    }

    console.log("\nDiagnosis Complete.");
}

testConnection();
