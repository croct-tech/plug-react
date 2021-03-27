import {Plug} from '@croct/plug';
import {useContext} from 'react';
import {CroctContext} from '../CroctProvider';

export function useCroct(): Plug {
    const plug = useContext(CroctContext);

    if (plug === null) {
        throw new Error('useCroct() can only be used in the context of a <Provider> component.');
    }

    return plug;
}
