import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {v4 as uuidv4} from 'uuid';
import {
    CLIENT_ID_COOKIE,
    CLIENT_IP_HEADER,
    PREVIEW_TOKEN_COOKIE,
    PREVIEW_PARAMETER,
    CLIENT_ID_HEADER,
    PREVIEW_TOKEN_HEADER,
} from '@/lib/constants';

// 1 year
const CLIENT_ID_COOKIE_EXPIRATION = 60 * 60 * 24 * 365;

export function middleware(request: NextRequest): NextResponse {
    const headers = new Headers(request.headers);

    const clientIp = request.ip
        ?? headers.get('x-forwarded-for')
        ?? headers.get('x-real-ip')
        ?? null;

    if (clientIp !== null) {
        headers.set(CLIENT_IP_HEADER, clientIp);
    }

    const clientIdCookie = request.cookies.get(CLIENT_ID_COOKIE);
    const clientId = clientIdCookie?.value ?? uuidv4().replaceAll('-', '');

    headers.set(CLIENT_ID_HEADER, clientId);

    const previewToken = request.nextUrl
        .searchParams
        .get(PREVIEW_PARAMETER);

    if (previewToken !== null && previewToken !== 'exit') {
        headers.set(PREVIEW_TOKEN_HEADER, previewToken);
    }

    const response = NextResponse.next({
        request: {
            headers: headers,
        },
    });

    response.cookies.set(CLIENT_ID_COOKIE, clientId, {
        maxAge: CLIENT_ID_COOKIE_EXPIRATION,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });

    if (previewToken === 'exit') {
        // Delete the cookie
        response.cookies.set(PREVIEW_TOKEN_COOKIE, '', {maxAge: 0});
    } else if (previewToken !== null) {
        // Do not set a max age to expire the cookie when the browser is closed (non-persistent)
        response.cookies.set(PREVIEW_TOKEN_COOKIE, previewToken, {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });
    }

    return response;
}
