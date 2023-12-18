'use client';

import {FunctionComponent, useEffect} from 'react';
import croct from '@croct/plug';

/*
 * NOTE
 *
 * This component makes the `croct` instance available on the `window`
 * object so tools like Google Tag Manager can use it.
 *
 * Although functional, we do not recommend this approach as it can
 * lead to problems like race conditions where Google Tag Manager may
 * run before the `useEffect` hook.
 *
 * For more reliable and efficient event tracking, use the `useCroct`
 * hook directly in your application.
 */

export const GlobalCroct: FunctionComponent = () => {
    useEffect(
        () => {
            if (!('croct' in window)) {
                Object.assign(window, {croct: croct});
            }
        },
        [],
    );

    return null;
};
