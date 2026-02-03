import type {EapFeatures} from '@croct/plug/eap';

declare global {
    interface Window {
        croctEap?: Partial<EapFeatures>;
    }
}
