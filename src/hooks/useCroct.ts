import {useContext} from 'react';
import {CroctContext, CroctState} from '../CroctProvider';

export function useCroct(): CroctState {
    const context = useContext(CroctContext);

    if (context === null) {
        throw new Error('useCroct() can only be used in the context of a <CroctProvider> component.');
    }

    return context;
}
