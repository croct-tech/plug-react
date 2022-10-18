import {Plug} from '@croct/plug';
import {useContext} from 'react';
import {CroctContext} from '../CroctProvider';

export function useCroct(): Plug {
    const context = useContext(CroctContext);

    if (context === null) {
        throw new Error('Hook useCroct() must be used within a <CroctProvider />.');
    }

    return context.plug;
}
