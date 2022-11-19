import {NextResponse} from 'next/server';
import type {NextRequest} from 'next/server';
import {v4 as uuidv4} from 'uuid';
import {Cookie, Header, QueryParameter} from '@/lib/constants';

// 1 year
const CLIENT_ID_DURATION = 60 * 60 * 24 * 365;

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
    const previewToken = searchParams.get(QueryParameter.PREVIEW_TOKEN)
        ?? request.cookies.get(Cookie.PREVIEW_TOKEN)?.value;

    if (previewToken === undefined) {
        return null;
    }

    if (isPreviewTokenValid(previewToken)) {
        return previewToken;
    }

    return 'exit';
}

function getCurrentUrl(request: NextRequest): string {
    const url = new URL(request.nextUrl.toString());

    url.searchParams.delete(QueryParameter.PREVIEW_TOKEN);

    return url.toString();
}

function getClientId(request: NextRequest): string {
    return request.cookies.get(Cookie.CLIENT_ID)?.value
        ?? uuidv4().replaceAll('-', '');
}

export function middleware(request: NextRequest): NextResponse {
    const headers = new Headers(request.headers);

    headers.set(Header.REQUEST_URI, getCurrentUrl(request));

    const clientId = getClientId(request);

    if (clientId !== null) {
        headers.set(Header.CLIENT_ID, clientId);
    }

    if (request.ip !== undefined) {
        headers.set(Header.CLIENT_IP, request.ip);
    }

    const previewToken = getPreviewToken(request);

    if (previewToken !== null && previewToken !== 'exit') {
        headers.set(Header.PREVIEW_TOKEN, previewToken);
    }

    const response = NextResponse.next({
        request: {
            headers: headers,
        },
    });

    if (previewToken === 'exit') {
        response.cookies.delete(Cookie.PREVIEW_TOKEN);
    } else if (previewToken !== null) {
        response.cookies.set(Cookie.PREVIEW_TOKEN, previewToken, {
            maxAge: 0,
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });
    }

    response.cookies.set(Cookie.CLIENT_ID, clientId, {
        maxAge: CLIENT_ID_DURATION,
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
