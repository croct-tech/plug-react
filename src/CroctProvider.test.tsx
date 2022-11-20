import '@testing-library/jest-dom/extend-expect';
import {render} from '@testing-library/react';
import {Plug} from '@croct/plug';
import {croct} from './ssr-polyfills';
import {CroctContext, CroctProvider, CroctProviderProps} from './CroctProvider';

jest.mock(
    './ssr-polyfills',
    () => ({
        ...jest.requireActual('./ssr-polyfills'),
        croct: {
            plug: jest.fn(),
            unplug: jest.fn(),
        },
    }),
);

// eslint-disable-next-line no-console -- Needed to test console output.
const consoleError = console.error;

describe('<CroctProvider />', () => {
    afterEach(() => {
        // eslint-disable-next-line no-console -- Needed to restore the original console.error.
        console.error = consoleError;
    });

    it('should fail if nested', () => {
        // eslint-disable-next-line no-console -- Testing error output
        jest.spyOn(console, 'error').mockImplementation();

        expect(
            () => render(
                <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                    <CroctProvider appId="00000000-0000-0000-0000-000000000000" />
                </CroctProvider>,
            ),
        ).toThrow('You cannot render <CroctProvider> inside another <CroctProvider>');
    });

    it('should initialize the Plug when accessed', () => {
        const options: CroctProviderProps = {
            appId: '00000000-0000-0000-0000-000000000000',
            debug: true,
            track: true,
        };

        let initialized = false;

        Object.defineProperty(croct, 'initialized', {
            get: jest.fn().mockImplementation(() => initialized),
        });

        jest.mocked(croct.plug).mockImplementation(() => {
            initialized = true;
        });

        const callback = jest.fn((context: {plug: Plug}|null) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- Trigger initialization.
            context?.plug;

            return 'foo';
        });

        render(
            <CroctProvider {...options}>
                <CroctContext.Consumer>{callback}</CroctContext.Consumer>
            </CroctProvider>,
        );

        expect(callback).toHaveBeenCalledTimes(1);
        expect(callback).toHaveBeenCalledWith({plug: croct});

        expect(croct.plug).toHaveBeenCalledTimes(2);
        expect(croct.plug).toHaveBeenNthCalledWith(1, options);
        expect(croct.plug).toHaveBeenNthCalledWith(2, options);
    });

    it('should unplug on unmount', () => {
        const {unmount} = render(<CroctProvider appId="00000000-0000-0000-0000-000000000000" />);

        unmount();

        expect(croct.unplug).toHaveBeenCalled();
    });
});
