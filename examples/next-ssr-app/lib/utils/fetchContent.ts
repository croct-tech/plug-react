import 'server-only';
import {DynamicContentOptions, fetchContent as loadContent} from '@croct/plug-react/api';
import type {SlotContent, VersionedSlotId, JsonObject} from '@croct/plug-react';
import {headers as getHeaders} from 'next/headers';
import {Header} from '@/lib/constants';

export type FetchOptions<T extends JsonObject = JsonObject> = Omit<DynamicContentOptions<T>, 'apiKey'>;

export function fetchContent<I extends VersionedSlotId, C extends JsonObject>(
    slotId: I,
    options: FetchOptions<SlotContent<I, C>> = {},
): Promise<SlotContent<I, C>> {
    const headers = getHeaders();
    const uri = headers.get(Header.REQUEST_URI);
    const previewToken = headers.get(Header.PREVIEW_TOKEN);
    const referrer = headers.get(Header.REFERRER);
    const clientId = headers.get(Header.CLIENT_ID);
    const clientIp = headers.get(Header.CLIENT_IP);
    const userAgent = headers.get(Header.USER_AGENT);

    const promise = loadContent<I, C>(slotId, {
        apiKey: process.env.CROCT_API_KEY!,
        timeout: 100,
        ...(previewToken !== null && {previewToken: previewToken}),
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

    return promise.then(({content}) => content);
}
