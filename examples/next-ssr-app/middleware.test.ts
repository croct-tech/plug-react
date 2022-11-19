import {NextRequest, NextResponse} from 'next/server';
import {middleware} from './middleware';
import {Cookie, Header, QueryParameter} from '@/lib/constants';

jest.mock(
    'next/server',
    () => ({
        __esModule: true,
        NextResponse: {
            next: jest.fn(),
        },
    }),
);

describe('middleware', () => {
    const RequestMock = jest.fn<NextRequest, []>(
        () => {
            const cookies: Record<string, string> = {};

            return {
                get nextUrl() {
                    return new URL('https://example.com/');
                },
                get ip() {
                    return undefined;
                },
                headers: new Headers(),
                cookies: {
                    get: jest.fn(name => {
                        if (cookies[name] === undefined) {
                            return null;
                        }

                        return {
                            name: name,
                            value: cookies[name],
                        };
                    }),
                    set: jest.fn((name, value) => {
                        cookies[name] = value;
                    }),
                },
            } as unknown as NextRequest;
        },
    );
    const ResponseMock = jest.fn<NextResponse, []>(
        () => ({
            cookies: {
                set: jest.fn(),
                delete: jest.fn(),
            },
        } as unknown as NextResponse),
    );

    const nextResponse = jest.spyOn(NextResponse, 'next');

    afterEach(() => {
        jest.clearAllMocks();
    });

    const previewToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJub25lIn0.eyJpc3MiOiJodHRwczovL2Nyb2N0LmlvIiwi'
        + 'YXVkIjoiaHR0cHM6Ly9jcm9jdC5pbyIsImlhdCI6MTQ0MDk3OTEwMCwiZXhwIjoxNDQwOTc5M'
        + 'jAwLCJtZXRhZGF0YSI6eyJleHBlcmllbmNlTmFtZSI6IkRldmVsb3BlcnMgZXhwZXJpZW5jZS'
        + 'IsImV4cGVyaW1lbnROYW1lIjoiRGV2ZWxvcGVycyBleHBlcmltZW50IiwiYXVkaWVuY2VOYW1l'
        + 'IjoiRGV2ZWxvcGVycyBhdWRpZW5jZSIsInZhcmlhbnROYW1lIjoiSmF2YVNjcmlwdCBEZXZlbG'
        + '9wZXJzIn19.';

    it('should assign a new client ID if none is present', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        nextResponse.mockReturnValue(response);

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.CLIENT_ID)).toEqual(expect.stringMatching(/^[0-9a-f]{32}$/));

        expect(response.cookies.set).toHaveBeenCalledWith(Cookie.CLIENT_ID, expect.stringMatching(/^[0-9a-f]{32}$/), {
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
            maxAge: expect.any(Number),
        });
    });

    it('should forward the URL through the request headers', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        nextResponse.mockReturnValue(response);

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.REQUEST_URI)).toEqual(request.nextUrl.toString());
    });

    it('should forward the URL without the preview token through the request headers', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        const baseUrl = 'https://example.com/';
        const url = new URL(baseUrl);

        url.searchParams.set(QueryParameter.PREVIEW_TOKEN, '1234');

        jest.spyOn(request, 'nextUrl', 'get').mockReturnValue(url as NextRequest['nextUrl']);

        nextResponse.mockReturnValue(response);

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.REQUEST_URI)).toEqual(baseUrl);
    });

    it('should extend the client ID cookie', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        const clientId = '1234567890abcdef1234567890abcdef';

        request.cookies.set(Cookie.CLIENT_ID, clientId);

        nextResponse.mockReturnValue(response);

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.CLIENT_ID)).toBe(clientId);

        expect(response.cookies.set).toHaveBeenCalledWith(
            Cookie.CLIENT_ID,
            clientId,
            expect.objectContaining({
                maxAge: expect.any(Number),
            }),
        );
    });

    it('should forward the user-agent through the request headers', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        const userAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';

        request.headers.set('user-agent', userAgent);

        nextResponse.mockReturnValue(response);

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.USER_AGENT)).toBe(userAgent);
    });

    it('should forward the client IP through the request headers', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        const ip = '127.0.0.1';

        jest.spyOn(request, 'ip', 'get').mockReturnValue(ip);

        nextResponse.mockReturnValue(response);

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.CLIENT_IP)).toBe(ip);
    });

    it('should store preview tokens in cookies and forward them through the request headers', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        const url = new URL('https://example.com/');

        url.searchParams.set(QueryParameter.PREVIEW_TOKEN, previewToken);

        jest.spyOn(request, 'nextUrl', 'get').mockReturnValue(url as NextRequest['nextUrl']);

        jest.useFakeTimers({now: 0});

        nextResponse.mockReturnValue(response);

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.PREVIEW_TOKEN)).toEqual(previewToken);

        expect(response.cookies.set).toHaveBeenCalledWith(Cookie.PREVIEW_TOKEN, previewToken, {
            maxAge: 0,
            httpOnly: true,
            secure: true,
            sameSite: 'strict',
        });
    });

    it('should forward the preview token through the request headers', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        request.cookies.set(Cookie.PREVIEW_TOKEN, previewToken);

        nextResponse.mockReturnValue(response);

        jest.useFakeTimers({now: 0});

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.PREVIEW_TOKEN)).toEqual(previewToken);

        expect(response.cookies.set).toHaveBeenCalledWith(
            Cookie.PREVIEW_TOKEN,
            previewToken,
            expect.objectContaining({
                maxAge: expect.any(Number),
            }),
        );
    });

    it('should remove the preview token cookie when leaving the preview', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        const url = new URL('https://example.com/');

        url.searchParams.set(QueryParameter.PREVIEW_TOKEN, 'exit');

        jest.spyOn(request, 'nextUrl', 'get').mockReturnValue(url as NextRequest['nextUrl']);

        nextResponse.mockReturnValue(response);

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.PREVIEW_TOKEN)).toBeNull();

        expect(response.cookies.delete).toHaveBeenCalledWith(Cookie.PREVIEW_TOKEN);
    });

    it('should ignore expired preview tokens', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        const url = new URL('https://example.com/');

        url.searchParams.set(QueryParameter.PREVIEW_TOKEN, previewToken);

        jest.spyOn(request, 'nextUrl', 'get').mockReturnValue(url as NextRequest['nextUrl']);

        nextResponse.mockReturnValue(response);

        jest.useFakeTimers({now: Number.MAX_SAFE_INTEGER});

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.PREVIEW_TOKEN)).toBeNull();

        expect(response.cookies.delete).toHaveBeenCalledWith(Cookie.PREVIEW_TOKEN);
    });

    it('should ignore invalid preview tokens', () => {
        const request = new RequestMock();
        const response = new ResponseMock();

        const url = new URL('https://example.com/');

        url.searchParams.set(QueryParameter.PREVIEW_TOKEN, 'invalid');

        jest.spyOn(request, 'nextUrl', 'get').mockReturnValue(url as NextRequest['nextUrl']);

        nextResponse.mockReturnValue(response);

        expect(middleware(request)).toBe(response);

        const forwardedHeaders = nextResponse.mock.calls[0][0]?.request?.headers as Headers;

        expect(forwardedHeaders.get(Header.PREVIEW_TOKEN)).toBeNull();

        expect(response.cookies.delete).toHaveBeenCalledWith(Cookie.PREVIEW_TOKEN);
    });
});
