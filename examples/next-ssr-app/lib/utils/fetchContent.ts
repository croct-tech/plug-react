import 'server-only';
import {DynamicContentOptions, fetchContent as fetchSlotContent} from '@croct/plug-react/api';
import type {SlotContent, VersionedSlotId, JsonObject} from '@croct/plug-react';
import {headers as getHeaders} from 'next/headers';
import {
    CLIENT_ID_HEADER,
    CLIENT_IP_HEADER,
    PREVIEW_TOKEN_HEADER,
    REFERRER_HEADER,
    REQUEST_URL_HEADER,
    USER_AGENT_HEADER,
} from '../constants';

type FetchOptions<T extends JsonObject> = Omit<DynamicContentOptions<T>, 'apiKey'>;

export function fetchContent<I extends VersionedSlotId, C extends JsonObject>(
    slotId: I,
    options: FetchOptions<SlotContent<I, C>> = {},
): Promise<SlotContent<I, C>> {
    const headers = getHeaders();
    const promise = fetchSlotContent<I, C>(slotId, {
        apiKey: process.env.CROCT_API_KEY!,
        timeout: 100,
        previewToken: headers.get(PREVIEW_TOKEN_HEADER) ?? undefined,
        clientId: headers.get(CLIENT_ID_HEADER) ?? undefined,
        userAgent: headers.get(USER_AGENT_HEADER) ?? undefined,
        clientIp: headers.get(CLIENT_IP_HEADER) ?? undefined,
        context: {
            page: {
                url: headers.get(REQUEST_URL_HEADER)!,
                referrer: headers.get(REFERRER_HEADER) ?? undefined,
            },
        },
        ...options,
    });

    return promise.then(({content}) => content);
}
