import {Plug} from '@croct/plug';
import {useContext} from 'react';
import {CroctContext} from '../CroctProvider';

export function useCroct(): Plug {
    const context = useContext(CroctContext);

    if (context === null) {
        throw new Error('useCroct() can only be used in the context of a <CroctProvider> component.');
    }

    return context.plug;
}
