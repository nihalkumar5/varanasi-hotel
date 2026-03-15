import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    // Bypass middleware if Supabase is not configured (Demo Mode) or if Force Demo is active
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('your-project-id') || process.env.NEXT_PUBLIC_FORCE_DEMO === 'true') {
        return response;
    }

    const supabase = createServerClient(
        supabaseUrl,
        supabaseKey,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value;
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    });
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    });
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    });
                },
            },
        }
    );

    const {
        data: { session },
    } = await supabase.auth.getSession();

    const url = new URL(request.url);
    const pathSegments = url.pathname.split('/');

    // Check if the path matches /[hotel_slug]/admin/...
    // but ignore /[hotel_slug]/admin/login
    if (pathSegments.length >= 3 && pathSegments[2] === 'admin' && pathSegments[3] !== 'login') {
        const hotelSlug = pathSegments[1];

        // 1. Check if user is logged in
        if (!session) {
            console.log(`[Middleware] No session found for path: ${url.pathname}. Redirecting to login.`);
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login`, request.url));
        }

        console.log(`[Middleware] Authenticated user ${session.user.id} accessing ${hotelSlug}`);

        // 2. Verify hotel association via profiles table
        // We first fetch the profile and join with hotels to verify the slug
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('*, hotels!inner(slug)')
            .eq('user_id', session.user.id)
            .eq('hotels.slug', hotelSlug)
            .maybeSingle();

        if (error) {
            console.error(`[Middleware] Database error during authorization for ${session.user.id}:`, error.message);
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login?error=db_error`, request.url));
        }

        if (!profile) {
            console.warn(`[Middleware] No profile found for user ${session.user.id} at hotel ${hotelSlug}`);
            
            // Check if user has ANY profile to provide better feedback
            const { data: anyProfile } = await supabase
                .from('profiles')
                .select('*, hotels(slug)')
                .eq('user_id', session.user.id)
                .limit(1);
            
            if (anyProfile && anyProfile.length > 0) {
                console.log(`[Middleware] User has a profile for a different hotel: ${anyProfile[0].hotels?.slug}`);
            }

            // PROACTIVE FIX: Check if the slug was 'geeta-hotel' but should be 'geeta'
            if (hotelSlug.endsWith('-hotel')) {
                const altSlug = hotelSlug.replace(/-hotel$/, '');
                console.log(`[Middleware] Retrying with alternative slug: ${altSlug}`);
                const { data: altProfile } = await supabase
                    .from('profiles')
                    .select('*, hotels!inner(slug)')
                    .eq('user_id', session.user.id)
                    .eq('hotels.slug', altSlug)
                    .maybeSingle();

                if (altProfile) {
                    console.log(`[Middleware] Found profile for alternative slug. Redirecting.`);
                    return NextResponse.redirect(new URL(`/${altSlug}/admin/dashboard`, request.url));
                }
            }
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login?error=unauthorized`, request.url));
        }
        console.log(`[Middleware] Access granted to ${session.user.id} for hotel ${profile.hotel_id}`);
    }

    return response;
}

export const config = {
    matcher: ['/:hotel_slug/admin/:path*'],
};
