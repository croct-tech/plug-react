import '@testing-library/jest-dom/extend-expect';
import {render} from '@testing-library/react';
import {croct} from './ssr-polyfills';
import {CroctContext, CroctProvider, CroctProviderProps} from './CroctProvider';

jest.mock('./ssr-polyfills', () => ({
    ...jest.requireActual('./ssr-polyfills'),
    croct: {
        plug: jest.fn(),
        unplug: jest.fn(),
    },
}));

// eslint-disable-next-line no-console
const consoleError = console.error;

afterEach(() => {
    // eslint-disable-next-line no-console
    console.error = consoleError;
});

describe('<CroctProvider/>', () => {
    it('should fail if nested', () => {
        // eslint-disable-next-line no-console
        console.error = jest.fn();

        expect(() => render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <CroctProvider appId="00000000-0000-0000-0000-000000000000" />
            </CroctProvider>,
        ))
            .toThrow('You cannot render <CroctProvider> inside another <CroctProvider>');
    });

    it('should provide the Plug instance and render the specified children', () => {
        const content = 'content';
        const callback = jest.fn().mockReturnValue(content);
        const options: CroctProviderProps = {
            appId: '00000000-0000-0000-0000-000000000000',
            debug: true,
            track: true,
        };

        const {getByText} = render(
            <CroctProvider {...options}>
                <CroctContext.Consumer>{callback}</CroctContext.Consumer>
            </CroctProvider>,
        );

        expect(getByText(content)).not.toBeNull();
        expect(croct.plug).toHaveBeenCalledWith(options);
        expect(callback).toHaveBeenCalledWith(croct);
    });

    it('provide unplug on unmount', () => {
        const {unmount} = render(<CroctProvider appId="00000000-0000-0000-0000-000000000000" />);

        unmount();

        expect(croct.unplug).toHaveBeenCalled();
    });
});
