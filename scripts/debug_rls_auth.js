
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    console.error('Missing Supabase URL or Key')
    process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testAuthFlow() {
    console.log('Testing Authenticated Profile Fetch...')

    const email = `test_debug_${Date.now()}@example.com`
    const password = 'password123'

    try {
        // 1. Sign Up
        console.log(`Signing up ${email}...`)
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password,
        })

        if (signUpError) {
            console.error('Sign up failed:', signUpError)
            return
        }

        const user = signUpData.user
        if (!user) {
            console.error('No user returned after signup (maybe email confirmation required?)')
            // If email confirmation is on, we can't easily proceed.
            // But usually local dev or some envs might have it off.
            // Or we can try signInAnonymously if enabled?
            return
        }

        console.log('User created:', user.id)

        // 2. Fetch Profile WITH session (supabase client automatically uses the session from signUp/signIn in the same instance usually, 
        // but in node we might need to be careful. supabase-js in node persists in memory by default for the instance)

        // Let's verify we have a session
        const { data: sessionData } = await supabase.auth.getSession()
        console.log('Has session:', !!sessionData.session)

        // 3. Try to fetch profile
        console.log('Fetching profile as authenticated user...')

        // Timeout for the fetch
        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Fetch timed out (possible RLS deadlock)')), 10000)
        )

        const profileQuery = supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single()

        const { data: profile, error: profileError } = await Promise.race([
            profileQuery,
            timeoutPromise
        ])

        if (profileError) {
            console.log('Profile fetch error (expected if trigger not running or no immediate insert):', profileError.message, profileError.code)
        } else {
            console.log('Profile fetched successfully:', profile)
        }

        // 4. Cleanup (Sign out is enough, deleting user requires admin key usually)
        await supabase.auth.signOut()
        console.log('Signed out.')

    } catch (err) {
        console.error('TEST FAILED:', err.message)
    }
}

testAuthFlow()
