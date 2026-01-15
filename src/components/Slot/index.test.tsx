import {render, screen} from '@testing-library/react';
import {Slot, SlotProps} from './index';
import {FetchResponse, useContent} from '../../hooks';
import '@testing-library/jest-dom';

jest.mock(
    '../../hooks/useContent',
    () => ({
        useContent: jest.fn(),
    }),
);

describe('<Slot />', () => {
    it('should fetch and render a slot', () => {
        const {id, children, ...options}: SlotProps<{title: string}> = {
            id: 'home-banner',
            children: jest.fn(({content: {title}}) => title),
            fallback: {title: 'fallback'},
        };

        const result = {content: {title: 'result'}} satisfies FetchResponse;

        jest.mocked(useContent).mockReturnValue(result);

        render(
            <Slot id={id} {...options}>
                {children}
            </Slot>,
        );

        expect(useContent).toHaveBeenCalledWith(id, options);
        expect(children).toHaveBeenCalledWith(result);
        expect(screen.getByText(result.content.title)).toBeInTheDocument();
    });
});
