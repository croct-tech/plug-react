import 'server-only';
import {evaluate as executeQuery, EvaluationOptions as BaseOptions} from '@croct/plug-react/api';
import type {JsonValue} from '@croct/plug-react';
import {headers as getHeaders} from 'next/headers';
import {Header} from '../constants';

export type EvaluationOptions<T extends JsonValue = JsonValue> = Omit<BaseOptions<T>, 'apiKey'>;

export function evaluate<T extends JsonValue>(query: string, options: EvaluationOptions<T> = {}): Promise<T> {
    const headers = getHeaders();
    const uri = headers.get(Header.REQUEST_URI);
    const referrer = headers.get(Header.REFERRER);
    const clientId = headers.get(Header.CLIENT_ID);
    const clientIp = headers.get(Header.CLIENT_IP);
    const userAgent = headers.get(Header.USER_AGENT);

    return executeQuery<T>(query, {
        apiKey: process.env.CROCT_API_KEY!,
        timeout: 100,
        ...(clientId !== null && {clientId: clientId}),
        ...(clientIp !== null && {clientIp: clientIp}),
        ...(userAgent !== null && {userAgent: userAgent}),
        ...(uri !== null
            ? {
                context: {
                    page: {
                        url: uri,
                        ...(referrer !== null ? {referrer: referrer} : {}),
                    },
                },
            }
            : {}
        ),
        extra: {
            cache: 'no-store',
        },
        ...options,
    });
}
