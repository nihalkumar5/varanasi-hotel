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
            const redirectUrl = new URL(`/${hotelSlug}/admin/login?error=no_session`, request.url);
            console.log(`[Middleware] No session found. Redirecting to: ${redirectUrl.toString()}`);
            return NextResponse.redirect(redirectUrl);
        }

        console.log(`[Middleware] Authenticated user ${session.user.id} accessing ${hotelSlug}`);

        // Fetch hotel ID first to simplify the query and avoid join issues
        const { data: hotel, error: hotelError } = await supabase
            .from('hotels')
            .select('id, slug')
            .eq('slug', hotelSlug)
            .maybeSingle();

        if (hotelError) {
            console.error(`[Middleware] Error fetching hotel for slug ${hotelSlug}:`, hotelError);
            const msg = encodeURIComponent(hotelError.message || 'Hotel fetch failed');
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login?error=db_error&detail=hotel_fetch_failed&msg=${msg}`, request.url));
        }

        if (!hotel) {
            console.warn(`[Middleware] Hotel not found for slug: ${hotelSlug}`);
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login?error=no_hotel`, request.url));
        }

        // Now fetch the profile associated with this user and hotel
        const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('hotel_id', hotel.id)
            .maybeSingle();

        if (profileError) {
            console.error(`[Middleware] Error fetching profile for user ${session.user.id} at hotel ${hotel.id}:`, profileError);
            const msg = encodeURIComponent(profileError.message || 'Profile fetch failed');
            return NextResponse.redirect(new URL(`/${hotelSlug}/admin/login?error=db_error&detail=profile_fetch_failed&msg=${msg}`, request.url));
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
                const { data: altHotel } = await supabase
                    .from('hotels')
                    .select('id')
                    .eq('slug', altSlug)
                    .maybeSingle();

                if (altHotel) {
                    const { data: altProfile } = await supabase
                        .from('profiles')
                        .select('id')
                        .eq('user_id', session.user.id)
                        .eq('hotel_id', altHotel.id)
                        .maybeSingle();

                    if (altProfile) {
                        console.log(`[Middleware] Found profile for alternative slug. Redirecting.`);
                        return NextResponse.redirect(new URL(`/${altSlug}/admin/dashboard`, request.url));
                    }
                }
            }
            const redirectUrl = new URL(`/${hotelSlug}/admin/login?error=no_profile`, request.url);
            console.log(`[Middleware] Access denied (no profile). Redirecting to: ${redirectUrl.toString()}`);
            return NextResponse.redirect(redirectUrl);
        }
        console.log(`[Middleware] Access granted to ${session.user.id} for hotel ${profile.hotel_id}`);
    }

    return response;
}

export const config = {
    matcher: ['/:hotel_slug/admin/:path*'],
};
