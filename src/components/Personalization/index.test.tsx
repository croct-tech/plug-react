import {render} from '@testing-library/react';
import {Personalization, PersonalizationProps} from './index';
import {useEvaluation} from '../../hooks';

jest.mock('../../hooks/useEvaluation', () => ({
    useEvaluation: jest.fn(),
}));

describe('<Personalization/>', () => {
    it('should evaluate and render an expression', () => {
        const {expression, children, ...options}: PersonalizationProps<string> = {
            expression: '"example"',
            children: jest.fn(result => result),
            fallback: 'fallback',
        };

        const result = 'result';

        (useEvaluation as jest.Mock).mockReturnValue(result);

        const {getByText} = render(
            <Personalization expression={expression} {...options}>
                {children}
            </Personalization>,
        );

        expect(useEvaluation).toHaveBeenCalledWith(expression, options);
        expect(children).toHaveBeenCalledWith(result);
        expect(getByText(result)).not.toBeNull();
    });
});
