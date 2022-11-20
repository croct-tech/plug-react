import {render, screen} from '@testing-library/react';
import croct from '@croct/plug';
import userEvent from '@testing-library/user-event';
import {CroctProvider} from '@croct/plug-react';
import PersonaSelector from '@/components/PersonaSelector';

jest.mock(
    'server-only',
    () => ({__esModule: true}),
);

jest.mock(
    '../lib/utils/evaluate',
    () => ({
        __esModule: true,
        evaluate: jest.fn(),
    }),
);

describe('<PersonaSeelctor />', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should select the current persona by default on success', () => {
        render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <PersonaSelector persona="developer" />
            </CroctProvider>,
        );

        expect(screen.getByDisplayValue('🦸‍♂ Developer')).toBeInTheDocument();
    });

    it('should save the selected persona', async () => {
        render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <PersonaSelector persona="default" />
            </CroctProvider>,
        );

        expect(screen.getByDisplayValue('👤 Default')).toBeInTheDocument();

        const listener = jest.fn();

        croct.tracker.addListener(listener);

        await userEvent.selectOptions(screen.getByRole('combobox'), 'developer');

        expect(screen.getByDisplayValue('🦸‍♂ Developer')).toBeInTheDocument();

        expect(listener).toHaveBeenCalledWith(
            expect.objectContaining({
                event: {
                    type: 'userProfileChanged',
                    patch: {
                        operations: [
                            {
                                path: 'custom.persona',
                                type: 'set',
                                value: 'developer',
                            },
                        ],
                    },
                },
            }),
        );
    });
});
