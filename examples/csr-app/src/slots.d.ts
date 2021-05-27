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

    interface SlotMap extends Record<string, NullableJsonObject> {
        'home-banner': SlotProps;
    }
}
