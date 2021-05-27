import {NullableJsonObject} from '@croct/plug/sdk/json';

declare module '@croct/plug/fetch' {
    type SlotProps = {
        title: string,
        subtitle: string,
        cta: {
            label: string,
            link: string,
        },
    };

    type SlotProps2 = {
        bar: string,
    };

    interface SlotMap extends Record<string, NullableJsonObject> {
        'home-banner': SlotProps;
        'home-banner2': SlotProps2;
    }
}
