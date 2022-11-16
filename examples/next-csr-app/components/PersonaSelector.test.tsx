import {render, screen, waitFor} from '@testing-library/react';
import {CroctProvider} from '@croct/plug-react';
import croct from '@croct/plug';
import userEvent from '@testing-library/user-event';
import PersonaSelector from '@/components/PersonaSelector';

jest.mock(
    '@croct/plug',
    () => ({
        __esModule: true,
        default: {
            evaluate: jest.fn(),
        },
    }),
);

describe('<PersonaSelector />', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should select the current persona by default on success', async () => {
        const evaluate = jest.mocked(croct.evaluate);

        evaluate.mockResolvedValue('developer');

        render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <PersonaSelector cacheKey="persona-success" />
            </CroctProvider>,
        );

        expect(evaluate).toHaveBeenCalledWith("user's persona or else 'default'", expect.anything());

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByDisplayValue('🦸‍♂ Developer')).toBeInTheDocument();
        });
    });

    it('should render the default persona on error', async () => {
        const evaluate = jest.mocked(croct.evaluate);

        evaluate.mockRejectedValue(new Error('failure'));

        render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <PersonaSelector cacheKey="persona-fallback" />
            </CroctProvider>,
        );

        expect(evaluate).toHaveBeenCalledWith("user's persona or else 'default'", expect.anything());

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByDisplayValue('👤 Default')).toBeInTheDocument();
        });
    });

    it('should save the selected persona', async () => {
        const evaluate = jest.mocked(croct.evaluate);

        evaluate.mockResolvedValue('default');

        render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <PersonaSelector cacheKey="persona-save" />
            </CroctProvider>,
        );

        expect(evaluate).toHaveBeenCalledWith("user's persona or else 'default'", expect.anything());

        expect(screen.queryByRole('combobox')).not.toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByDisplayValue('👤 Default')).toBeInTheDocument();
        });

        const listener = jest.fn();

        croct.tracker.addListener(listener);

        await userEvent.selectOptions(screen.getByRole('combobox'), 'developer');

        await waitFor(() => {
            expect(screen.getByDisplayValue('🦸‍♂ Developer')).toBeInTheDocument();
        });

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
