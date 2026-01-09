
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testConnection() {
    console.log('Testing Supabase connection...')
    console.log('URL:', supabaseUrl)

    const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Manual Timeout 10s')), 10000)
    )

    try {
        // 1. Test basic connection (health check) or public table if any
        // We'll try to fetch the specific profile as user did
        const userId = '77f7262c-6c3a-4a31-8b2b-74a2ecd026de'
        console.log(`Fetching profile for ${userId} ...`)

        const profileQuery = supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()

        const { data, error } = await Promise.race([profileQuery, timeoutPromise])

        if (error) {
            console.error('Error fetching profile:', error)
        } else {
            console.log('Profile fetched successfully:', data)
        }

    } catch (err) {
        console.error('Exception during test:', err)
    }
}

testConnection()
