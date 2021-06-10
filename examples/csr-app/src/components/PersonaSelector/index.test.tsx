import {render, waitFor} from '@testing-library/react';
import {CroctProvider} from '@croct/plug-react';
import croct from '@croct/plug';
import '@testing-library/jest-dom';
import userEvent from '@testing-library/user-event';
import PersonaSelector from './index';

describe('<PersonaSelector />', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should select the current persona by default on success', async () => {
        const evaluate = jest.spyOn(croct, 'evaluate');

        evaluate.mockResolvedValue('developer');

        const {queryByRole, getByDisplayValue} = render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <PersonaSelector cacheKey="persona-success" />
            </CroctProvider>,
        );

        expect(evaluate).toHaveBeenCalledWith("user's persona or else 'default'", expect.anything());

        expect(queryByRole('combobox')).not.toBeInTheDocument();

        await waitFor(() => {
            expect(getByDisplayValue('🦸‍♂ Developer')).toBeInTheDocument();
        });
    });

    it('should render the default persona on error', async () => {
        const evaluate = jest.spyOn(croct, 'evaluate');

        evaluate.mockRejectedValue(new Error('failure'));

        const {queryByRole, getByDisplayValue} = render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <PersonaSelector cacheKey="persona-fallback" />
            </CroctProvider>,
        );

        expect(evaluate).toHaveBeenCalledWith("user's persona or else 'default'", expect.anything());

        expect(queryByRole('combobox')).not.toBeInTheDocument();

        await waitFor(() => {
            expect(getByDisplayValue('👤 Default')).toBeInTheDocument();
        });
    });

    it('should save the selected persona', async () => {
        const evaluate = jest.spyOn(croct, 'evaluate');

        evaluate.mockResolvedValue('default');

        const {getByDisplayValue, queryByRole, getByRole} = render(
            <CroctProvider appId="00000000-0000-0000-0000-000000000000">
                <PersonaSelector cacheKey="persona-save" />
            </CroctProvider>,
        );

        expect(evaluate).toHaveBeenCalledWith("user's persona or else 'default'", expect.anything());

        expect(queryByRole('combobox')).not.toBeInTheDocument();

        await waitFor(() => {
            expect(getByDisplayValue('👤 Default')).toBeInTheDocument();
        });

        const listener = jest.fn();
        croct.tracker.addListener(listener);

        userEvent.selectOptions(getByRole('combobox'), 'developer');

        await waitFor(() => {
            expect(getByDisplayValue('🦸‍♂ Developer')).toBeInTheDocument();
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

