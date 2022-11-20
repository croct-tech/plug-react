import React, {PropsWithChildren, ReactElement} from 'react';
import '../styles/globals.css';
import Providers from '@/components/Providers';

export default function RootLayout({children}: PropsWithChildren): ReactElement {
    return (
        <html lang="en">
            <head>
                <link rel="icon" href="/favicon.svg" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <meta
                    name="description"
                    content="Example of how to integrate Croct into React applications rendered on the server-side."
                />
                <title>Croct | Next.js Server-side Rendering Example</title>
            </head>
            <body>
                <div className="container">
                    <Providers>
                        {children}
                    </Providers>
                </div>
            </body>
        </html>
    );
}
