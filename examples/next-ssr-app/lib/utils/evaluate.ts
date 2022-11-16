import 'server-only';
import {evaluate as evaluateQuery, EvaluationOptions as BaseOptions} from '@croct/plug-react/api';
import type {JsonValue} from '@croct/plug-react';
import {headers as getHeaders} from 'next/headers';
import {CLIENT_ID_HEADER, CLIENT_IP_HEADER, USER_AGENT_HEADER} from '../constants';

type EvaluationOptions<T extends JsonValue> = Omit<BaseOptions<T>, 'apiKey'>;

export function evaluate<T extends JsonValue>(query: string, options: EvaluationOptions<T> = {}): Promise<T> {
    const headers = getHeaders();

    return evaluateQuery<T>(query, {
        apiKey: process.env.CROCT_API_KEY!,
        clientId: headers.get(CLIENT_ID_HEADER) ?? undefined,
        userAgent: headers.get(USER_AGENT_HEADER) ?? undefined,
        clientIp: headers.get(CLIENT_IP_HEADER) ?? undefined,
        timeout: 100,
        ...options,
    });
}
