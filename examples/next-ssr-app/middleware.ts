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
    REQUEST_URL_HEADER,
} from '@/lib/constants';

// 1 year
const CLIENT_ID_COOKIE_EXPIRATION = 60 * 60 * 24 * 365;

function isPreviewTokenValid(token: unknown): token is string {
    if (typeof token !== 'string' || token === 'exit') {
        return false;
    }

    try {
        const jwt = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        const now = Math.floor(Date.now() / 1000);

        return Number.isInteger(jwt.exp) && jwt.exp > now;
    } catch {
        return false;
    }
}

function getPreviewToken(request: NextRequest): string|null {
    const {searchParams} = request.nextUrl;
    const previewToken = searchParams.get(PREVIEW_PARAMETER)
        ?? request.cookies.get(PREVIEW_TOKEN_COOKIE)?.value;

    if (previewToken === undefined) {
        return null;
    }

    if (isPreviewTokenValid(previewToken)) {
        return previewToken;
    }

    return 'exit';
}

function getCurrentUrl(request: NextRequest): string {
    const url = new URL(request.url);

    url.searchParams.delete(PREVIEW_PARAMETER);

    return url.toString();
}

function getClientIp(request: NextRequest): string|null {
    const {headers} = request;

    return request.ip
        ?? headers.get('x-forwarded-for')
        ?? headers.get('x-real-ip')
        ?? null;
}

function getClientId(request: NextRequest): string {
    return request.cookies.get(CLIENT_ID_COOKIE)?.value
        ?? uuidv4().replaceAll('-', '');
}

export function middleware(request: NextRequest): NextResponse {
    const headers = new Headers(request.headers);

    headers.set(REQUEST_URL_HEADER, getCurrentUrl(request));

    const clientId = getClientId(request);

    if (clientId !== null) {
        headers.set(CLIENT_ID_HEADER, clientId);
    }

    const clientIp = getClientIp(request);

    if (clientIp !== null) {
        headers.set(CLIENT_IP_HEADER, clientIp);
    }

    const previewToken = getPreviewToken(request);

    if (previewToken !== null && previewToken !== 'exit') {
        headers.set(PREVIEW_TOKEN_HEADER, previewToken);
    }

    const response = NextResponse.next({
        request: {
            headers: headers,
        },
    });

    if (previewToken === 'exit') {
        response.cookies.delete(PREVIEW_TOKEN_COOKIE);
    } else if (previewToken !== null) {
        response.cookies.set(PREVIEW_TOKEN_COOKIE, '', {maxAge: 0});
    }

    response.cookies.set(CLIENT_ID_COOKIE, clientId, {
        maxAge: CLIENT_ID_COOKIE_EXPIRATION,
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
    });

    return response;
}

// Ignore static assets
export const config = {
    matcher: '/((?!.*\\.).*)',
};
