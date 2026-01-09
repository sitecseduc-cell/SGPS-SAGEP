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
            const val = parts.slice(1).join('=').trim().replace(/^["']|["']$/g, '');
            process.env[key] = val;
        }
    });
} catch (e) {
    console.error("⚠️ Could not read .env file");
}

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
// NOTE: For updating roles, usually you need SERVICE_ROLE_KEY if RLS blocks updates.
// However, since we are doing this client-side for now or if anon key allows it via special policy, let's try.
// Ideally, use VITE_SUPABASE_SERVICE_ROLE_KEY if available in .env, otherwise this might fail if RLS is strict.

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ Missing Supabase Environment Variables!");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const TARGET_EMAIL = 'luiz.henrique@seduc.pa.gov.br';
const NEW_ROLE = 'admin';

async function updateUserRole() {
    console.log(`🔍 Searching for user: ${TARGET_EMAIL}...`);

    // 1. Find User by Email
    const { data: users, error: searchError } = await supabase
        .from('profiles') // Assuming profiles table stores email and role
        .select('*')
        .ilike('email', TARGET_EMAIL);

    if (searchError) {
        console.error("❌ Error searching user:", searchError.message);
        return;
    }

    if (!users || users.length === 0) {
        console.error("❌ User not found!");
        return;
    }

    const user = users[0];
    console.log(`✅ Found user: ${user.full_name || 'No Name'} (ID: ${user.id}) - Current Role: ${user.role}`);

    // 2. Update Role
    const { error: updateError } = await supabase
        .from('profiles')
        .update({ role: NEW_ROLE })
        .eq('id', user.id);

    if (updateError) {
        console.error("❌ Failed to update role:", updateError.message);
    } else {
        console.log(`🎉 Successfully updated role to '${NEW_ROLE}' for ${TARGET_EMAIL}`);
    }
}

updateUserRole();
