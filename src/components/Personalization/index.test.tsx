import {render, screen} from '@testing-library/react';
import {Personalization, PersonalizationProps} from './index';
import {useEvaluation} from '../../hooks';
import '@testing-library/jest-dom';

jest.mock(
    '../../hooks/useEvaluation',
    () => ({
        useEvaluation: jest.fn(),
    }),
);

describe('<Personalization />', () => {
    it('should evaluate and render an expression', () => {
        const {expression, children, ...options}: PersonalizationProps<string> = {
            expression: '"example"',
            children: jest.fn(result => result),
            fallback: 'fallback',
        };

        const result = 'result';

        jest.mocked(useEvaluation).mockReturnValue(result);

        render(
            <Personalization expression={expression} {...options}>
                {children}
            </Personalization>,
        );

        expect(useEvaluation).toHaveBeenCalledWith(expression, options);
        expect(children).toHaveBeenCalledWith(result);
        expect(screen.getByText(result)).toBeInTheDocument();
    });
});
