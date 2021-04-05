<p align="center">
    <a href="https://croct.com">
        <img src="https://cdn.croct.io/brand/logo/repo-icon-green.svg" alt="Croct" height="80"/>
    </a>
    <br />
    <strong>Plug React</strong>
    <br />
    React components and hooks to plug your React applications into Croct.
</p>
<p align="center">
    <a href="https://www.npmjs.com/package/@croct/plug-react"><img alt="Version" src="https://img.shields.io/npm/v/@croct/plug-react"/></a>
    <a href="https://github.com/croct-tech/plug-react/actions?query=workflow%3AValidations"><img alt="Build" src="https://github.com/croct-tech/plug-react/workflows/Validations/badge.svg"/></a>
    <a href="https://codeclimate.com/repos/60665953e0608a018c001907/maintainability"><img alt="Maintainability" src="https://api.codeclimate.com/v1/badges/24f7d3e788ed2c66f2ab/maintainability"/></a>
    <a href="https://codeclimate.com/repos/60665953e0608a018c001907/test_coverage"><img alt="Coverage" src="https://api.codeclimate.com/v1/badges/24f7d3e788ed2c66f2ab/test_coverage"/></a>
    <br />
    <br />
    <a href="https://github.com/croct-tech/plug-react/releases">📦 Releases</a>
        ·
    <a href="https://github.com/croct-tech/plug-react/issues/new?labels=bug&template=bug-report.md">🐞 Report Bug</a>
        ·
    <a href="https://github.com/croct-tech/plug-react/issues/new?labels=enhancement&template=feature-request.md">✨ Request Feature</a>
</p>

## Introduction

The React Plug library provides components and hooks for personalizing applications in real-time that are easy for your marketing team to scale and maintain.

- **Easy integration**: personalize existing components without touching their code.
- **Suspense-ready**: take advantage of the latest React features to improve user experience.
- **Zero configuration**: no setup steps are required.
- **Type-safety**: Typescript typings are included for improved development experience.
- **Blazing-fast queries**: double-digit millisecond latency for real-time evaluations.
- **Playground integration**: one-click to connect, no configuration needed.

## Getting Started

The following steps will walk you through installing the library and integrating it into your application.

This guide assumes you're already familiar with some key concepts and tools around Croct, like 
Contextual Query Language (CQL) and the playground. If you're not, 
[this 15-minute quickstart](https://croct.link/plug-js/quick-start) that will give you a hands-on overview of 
all the terms and tools you need to get started.

### Installation

The recommended way to install the library is via [NPM](https://npmjs.com).

Run the following command to add the client as a dependency to your project and then install it:

```sh
npm install @croct/plug-react
```

### Plugging in

You connect Croct to React with the `<CroctProvider/ >` component. The `<CroctProvider/ >` uses a regular React's 
`<Context.Provider />` to wrap your React app and make the SDK available anywhere in your component tree.

We suggest putting the `<CroctProvider/ >` somewhere high in your app, above any component that might be personalized, 
ideally in the top-level `<App/>` component.

```tsx
import React from 'react';
import {render} from 'react-dom';
import {CroctProvider} from '@croct/plug-react';

function App() {
  return (
    <CroctProvider appId="00000000-0000-0000-0000-000000000000">
      <div>
        <h1>My first personalized app 🚀</h1>
      </div>
    </CroctProvider>
  );
}

render(<App />, document.getElementById('root'));
```

### Evaluating expressions

Once your application is plugged in, you're ready to start personalizing your components using the `<Personalization />`
component or the `useEvaluation` hook.

We'll go through a simple example that shows how  you can implement feature flags (also known as feature toggles)
to conditionally renders a link depending on the user's persona.

Let's first implement the use-case using the `<Personalization/>` component. It takes an expression (e.g. `user's persona`) 
and a render function, which tells the component how to render the UI, depending on the evaluation result.

This is what our component would look like:

```tsx
import {ReactElement} from 'react';
import {Personalization} from '@croct/plug-react';

export default function OnboardingPage(): ReactElement {
    return (
        <Suspense fallback="Loading...">
            <Personalization expression="user's persona is 'developer'">
                {isDeveloper => (isDeveloper && <a href="/docs">View docs</a>)}
            </Personalization>
        </Suspense>
    )
}
```

Now, let's create a `ViewDocsLink` component to see the `useEvaluation` hook in action:

```tsx
import {ReactElement, Fragment} from 'react';
import {useEvaluation} from '@croct/plug-react';

function ViewDocsLink(): ReactElement {
    const isDeveloper = useEvaluation<boolean>("user's persona is 'developer'", {initial: false});

    return <Fragment>{isDeveloper && <a href="/docs">View docs</a>}</Fragment>
}

export default function OnboardingPage(): ReactElement {
    return (
        <Suspense fallback="Loading...">
            <ViewDocsLink />
        </Suspense>
    )
}
```

As we don't provide an initial state in the previous examples, the component will suspend the rendering until the 
evaluation result is available. To prevent the UI from suspending, you can provide an initial state through the 
`initial` property. In this case, the component will render the initial state until the evaluation completes. 
Once the evaluation completes, the component will re-render to reflect the evaluation result.

We strongly recommend always specifying the `fallback` property to ensure your app behaves the same way regardless of 
the personalization. In this way, the UI will still be fully functional even in maintenance windows.

The following example shows how to specify a fallback behaviour for the docs link:

```tsx
import {ReactElement} from 'react';
import {Personalization, useEvaluation} from '@croct/plug-react';

function ViewDocsLink(): ReactElement {
    const isDeveloper = useEvaluation<boolean>("user's persona is 'developer'", {initial: false});

    return <Fragment>{isDeveloper && <a href="/docs">View docs</a>}</Fragment>
}

export default function OnboardingPage(): ReactElement {
    return (
        <Suspense fallback="Loading...">
            {/* Using the <Personalization /> component */}
            <Personalization expression="user's persona is 'developer'" falback={false}>
                {isDeveloper => (isDeveloper && <a href="/docs">View docs</a>)}
            </Personalization>

            {/* Using useEvaluation hook */}
            <ViewDocsLink />
        </Suspense>
    )
}
```

For a full list of the available options, please refer to the [API documentation](#component-api-reference).

### Using slots

Evaluating expression is a flexible and powerful way to customize your UI. However, for components whose content 
changes too often, this approach can be overkill. For those cases, we encourage you to use the Slots feature instead. 
Using slots gives your team the flexibility to change the content or personalization rules whenever needed without 
touching the component code.

To render a slot, all you need to do is provide the `id` you configured in your Croct workspace. Based on the 
slot's personalization rules and the user's context, the component will decide which content show to that user. 
Notice that there's no logic on the client-side, meaning that your marketing or product team can freely change the 
slot content as they need without requiring an update to your React app.

For the next example, we assume that you have already defined a slot with id `home-banner` in your Croct workspace 
with the following structure:

```ts
type HomeBanner = {
    title: string,
    subtitle: string,
    cta: {
        label: string,
        link: string,
    },
};
```

To render the content of the slot, you can either use the `<Slot />` component or the `useContent` hook.

Here's how to use the `<Slot />` component:

```tsx
import {Suspense, ReactElement} from 'react';
import {Slot} from '@croct/plug-react';

export default function OnboardingPage(): ReactElement {
    return (
        <Suspense fallback="Personalizing content...">
            <Slot id="home-banner">
                {({title, subtitle, cta}: HomeBanner) => (
                    <div>
                        <strong>{title}</strong>
                        <p>{subtitle}</p>
                        <a href={cta.link}>{cta.label}</a>
                    </div>
                )}
            </Slot>
        </Suspense>
    )
}
```

And here's an example using the `useContent` hook:

```tsx
import {ReactElement} from 'react';
import {useContent} from '@croct/plug-react';

function HomeBanner(): ReactElement {
    const {title, subtitle, cta} = useContent<HomeBanner>('home-banner');

    return (
        <div>
            <strong>{title}</strong>
            <p>{subtitle}</p>
            <a href={cta.link}>{cta.label}</a>
        </div>
    )
}

export default function HomePage(): ReactElement {
    return (
        <Suspense fallback="Personalizing content...">
            <HomeBanner/>
        </Suspense>
    )
}
```

As we don't provide an initial state in the previous examples, the component will suspend the rendering while the slot 
content is loading. To prevent the UI from suspending, you can provide an initial state through the `initial` property. 
In this case, the component will render the initial content while the slot content is loading. As soon as slot content 
is loaded, the hook will cause the component to be re-rendered with the personalized slot content.

The following example shows how to specify a fallback state for the `home-banner` slot:

```tsx
import {Suspense, ReactElement} from 'react';
import {Slot, useContent} from '@croct/plug-react';

const initialBanner: HomeBanner = {
    title: 'Default title',
    subtitle: 'Default subtitle',
    cta: {
        label: 'Try now',
        link: 'https://croct.com',
    }
};

function HomeBanner(): ReactElement {
    const {title, subtitle, cta} = useContent<HomeBanner>('home-banner', {initial: initialBanner});

    return (
        <div>
            <strong>{title}</strong>
            <p>{subtitle}</p>
            <a href={cta.link}>{cta.label}</a>
        </div>
    )
}

export default function HomePage(): ReactElement {
    return (
        <Suspense fallback="Personalizing content...">
            {/* Using the <Slot /> component */}
            <Slot id="home-banner" fallback={initialBanner}>
                {({title, subtitle, cta}: HomeBanner) => (
                    <div>
                        <strong>{title}</strong>
                        <p>{subtitle}</p>
                        <a href={cta.link}>{cta.label}</a>
                    </div>
                )}
            </Slot>

            {/* Using the useContent hook */}
            <HomeBanner />
        </Suspense>
    )
}
```

Again, we strongly recommend always providing a value for the `fallback` property. For a full list of the available options, 
please refer to the [API documentation](#component-api-reference).

#### 💡 ProTip

In the previous examples, you may have noticed that we specified the content type in the `userFetch` call and in the 
`<Slot />` component's render function to have the benefit of strong typing. 

For an even more robust approach, you can also declare the type of all available slots in a single declaration file 
using module augmentation as follows:

```ts
// slots.d.ts
import {NullableJsonObject} from '@croct/plug/sdk/json';
import {HomeBanner} from './HomePage';

declare module '@croct/plug/fetch' {
    interface SlotMap extends Record<string, NullableJsonObject> {
        'home-banner': HomeBanner;
    }
}
```

If you use an IDE with Typescript code completion support, you will get autocomplete suggestions for
slot IDs and content properties as a bonus:

![Autocomplete](https://user-images.githubusercontent.com/943036/113335703-b1101580-92fb-11eb-973d-3720ea133a95.gif)

### Accessing the Plug instance

This library is built on top of the PlugJS. You can access the Plug instance through the `useCroct` hook to track events, 
login and logout users, and more.

In the following example we use the `useCroct` to get the Plug instance and set an attribute to the user profile:

```tsx
import {ReactElement, useCallback} from 'react';
import {useCroct} from '@croct/plug-react';

export default function DeveloperButton(): ReactElement {
    const croct = useCroct();
    const setPersona = useCallback(
        () => croct.user.edit()
            .set('custom.persona', 'developer')
            .save(),
        [croct],
    );

    return (<button onClick={setPersona}>I'm a developer</button>);
}
```

## Component API reference

This reference documents all components available in the library.

### &lt;CroctProvider /&gt;

The `<CroctProvider />` component  leverages [React's Context API](https://reactjs.org/docs/context.html) to 
make a configured [Plug instance](https://github.com/croct-tech/plug-js/blob/master/docs/plug.md) available throughout 
a React component tree.

#### Properties

The component takes the followings properties:

| Option                  | Type         | Required | Default Value | Description                                                                                                                                                                                               |
|-------------------------|--------------|----------|---------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `appId`                 | string       | Yes      | None          | The ID of the application you set up on Croct.
| `debug`                 | boolean      | No       | `false`       | If `true`, turns on debug mode, which logs helpful messages to the console.                                                                                                                               |
| `track`                 | boolean      | No       | `true`        | If `true`, enables the automatic event tracking on initialization.
| `token`                 | string\|null | No       | None          | The JWT token issued by Croct. If `null`, clears any token specified on previous calls.
| `userId`                | string       | No       | None          | The ID of the user logged into the application. Internally, the SDK will issue a token using the specified ID as the subject claim of the token. The `token` and `userId` options are mutually exclusive.
| `tokenScope`            | string       | No       | `global`      | Defines how the SDK should synchronize the token across multiple tabs, see [token scopes](#token-scopes) for more details.
| `eventMetadata`         | JSON         | No       | None          | Any additional information that may be useful to include as part of the event metadata. A common use case is to record the version of the application for future reference.
| `logger`                | object       | No       | None          | A custom logger to handle log messages. By default, all logs are suppressed.
| `urlSanitizer`          | function     | No       | None          | A function to sanitize URLs that allows removing sensitive information from URLs, such as tokens, that should not be sent to the platform.
| `trackerEndpointUrl`    | string       | No       | None          | The URL of the tracker service, used by Croct's development team for testing purposes.
| `evaluationEndpointUrl` | string       | No       | None          | The URL of the evaluation service, used by Croct's development team for testing purposes.
| `bootstrapEndpointUrl`  | string       | No       | None          | The URL of the bootstrap service, used by Croct's development team for testing purposes.

#### Code Sample

Here's a simple example showing how to initialize the Plug instance:

```tsx
import {CroctProvider} from '@croct/plug-react';

function App() {
    return (
        <CroctProvider appId="00000000-0000-0000-0000-000000000000">
            <div>
                <h1>My first personalized app 🚀</h1>
            </div>
        </CroctProvider>
    );
}
```

### &lt;Personalization /&gt;

The `<Personalization />` component evaluates and renders a CQL query.

#### Properties

The component takes the followings properties:

| Option       | Type     | Required | Description
|--------------|----------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| `expression` | string   | Yes      | The CQL query to evaluate.
| `children`   | Function | Yes      | A callback to render the result.
| `initial`    | Result   | No       | A value to render while the evaluation is in progress. If not specified, the component will suspend.
| `fallback`   | Result   | No       | A value to render when the evaluation fails. If not specified, the hook will throw an exception in case of failures.
| `timeout`    | number   | No       | The maximum evaluation time in milliseconds. Once reached, the evaluation will fail.
| `attributes` | JSON     | No       | A map of attributes to inject in the evaluation context. For example, passing the attributes `{cities: ['New York', 'San Francisco']}` you can reference them in expressions like `context's cities include location's city`.
| `cacheKey`   | string   | No       | An identifier that allows keeping the cached result separate from other cached items. By default, the cache key is formed from the expression and attributes.
| `expiration` | number   | No       | The cache expiration time in milliseconds, extended on every render. If negative, the cache never expires. By default, the cache lifespan is set to 60000 (1 minute).

#### Code Sample

Here's a simple example showing how to evaluate the user's persona:

```tsx
import {ReactElement, Fragment} from 'react';
import {Personalization} from '@croct/plug-react';

function PersonaBadge(): ReactElement {
    return (
        <Personalization expression="user's persona or else 'unknown'">
            {persona => (<span>{persona}</span>)}
        </Personalization>
    );
}
```

### &lt;Slot /&gt;

The `<Slot />` component fetches and renders a slot.

#### Properties

The component takes the followings properties:

| Option       | Type     | Required | Description
|--------------|----------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| `id`         | string   | Yes      | The ID of the slot to fetch.
| `children`   | Function | Yes      | A callback to render the result.
| `initial`    | Result   | No       | A value to render while fetching the content. If not specified, the component will suspend.
| `fallback`   | Result   | No       | A value to render when the fetch fails. If not specified, the hook will throw an exception in case of failures.
| `cacheKey`   | string   | No       | An identifier that allows keeping the cached result separate from other cached items. By default, the cache key is formed from the expression and attributes.
| `expiration` | number   | No       | The cache expiration time in milliseconds, extended on every render. If negative, the cache never expires. By default, the cache lifespan is set to 60000 (1 minute).

#### Code Sample

Here's a simple example showing how to render a banner in a slot:

```tsx
import {ReactElement, Fragment} from 'react';
import {Slot} from '@croct/plug-react';

function HeroBanner(): ReactElement {
    return (
        <Slot id="hero">
            {({title, subtitle}) => (
                <div>
                    <h1>{title}</h1>
                    <p>{subtitle}</p>
                </div>
            )}
        </Slot>
    );
}
```

## Hook API reference

This reference documents all hooks available in the library.

### useCroct

The `useCroct` hook provides access to the Plug instance.

#### Signature

The hook has the following signature:

```ts
useCroct(): Plug
```

#### Code Sample

Here's a simple example showing how anonymize a user:

```tsx
import {ReactElement, useCallback} from 'react';
import {useCroct} from '@croct/plug-react';

function LogoutButton(): ReactElement {
    const croct = useCroct();
    const anonymize = useCallback(() => croct.anonymize(), [croct]);

    return <button type="button" onClick={anonymize}>Logout</button>
}
```

### useEvaluation

The `useEvaluation` hook evaluates a CQL query.

#### Signature

The hook has the following signature:

```ts
 function useEvaluation<Result extends JsonValue>(expression: string, options: Options = {}): Result
```

These are the currently supported options:

| Option       | Type    | Description
|--------------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| `initial`    | Result  | The value returned while the evaluation is in progress. If not specified, the component will suspend.
| `fallback`   | Result  | The value returned when the evaluation fails. If not specified, the hook will throw an exception in case of failures. 
| `timeout`    | number  | The maximum evaluation time in milliseconds. Once reached, the evaluation will fail.
| `attributes` | JSON    | The map of attributes to inject in the evaluation context. For example, passing the attributes `{cities: ['New York', 'San Francisco']}` you can reference them in expressions like `context's cities include location's city`.
| `cacheKey`   | string  | An identifier that allows keeping the cached result separate from other cached items. By default, the cache key is formed from the expression and attributes.
| `expiration` | number  | The cache expiration time in milliseconds, extended on every render. If negative, the cache never expires. By default, the cache lifespan is set to 60000 (1 minute).

#### Code Sample

Here's a simple example showing how to evaluate the user's persona:

```tsx
import {ReactElement, Fragment} from 'react';
import {useEvaluation} from '@croct/plug-react';

function PersonaBadge(): ReactElement {
    const persona = useEvaluation<string>("user's persona or else 'unknown'", {fallback: 'unknown'});

    return <span>{persona}</span>
}
```

### useContent

The `useContent` hook fetches the content of a slot.

#### Signature

The hook has the following signature:

```ts
function useContent<Content extends NullableJsonObject>(slotId: string, options: Options = {}): Content
```

These are the currently supported options:

| Option       | Type    | Description
|--------------|---------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| `initial`    | Content | The content returned while fetching the content. If not specified, the component will suspend.
| `fallback`   | Content | The content returned when the fetch fails. If not specified, the hook will throw an exception in case of failures.
| `cacheKey`   | string  | An identifier that allows keeping the cached content separate from other cached items. By default, the cache key is formed from the slot ID.
| `expiration` | number  | The cache expiration time in milliseconds, extended on every render. If negative, the cache never expires. By default, the cache lifespan is set to 60000 (1 minute).

#### Code Sample

Here's a simple example showing how to fetch the content for a banner:

```tsx
import {ReactElement, Fragment} from 'react';
import {useContent} from '@croct/plug-react';

function HeroBanner(): ReactElement {
    const {title, subtitle} = useContent<HeroBanner>('hero');

    return (
        <div>
            <h1>{title}</h1>
            <p>{subtitle}</p>
        </div>
    );
}
```

## Support

If this documentation has not answered all your questions, don't worry.
Here are some alternative ways to get help from the Croct community.

### Stack Overflow

Someone else from the community may have already asked a similar question or may be able to help with your problem.

The Croct team will also monitor posts with the "croct" tag. If there aren't any existing questions that help,
please [ask a new one](https://stackoverflow.com/questions/ask?tags=croct%20export).

### GitHub

If you have what looks like a bug, or you would like to make a feature request, please
[open a new issue on GitHub](https://github.com/croct-tech/plug-react/issues/new/choose).

Before you file an issue, a good practice is to search for issues to see whether others have the same or similar problems.
If you are unable to find an open issue addressing the problem, then feel free to open a new one.

### Slack Channel

Many people from the Croct community hang out on the Croct Slack Group.
Feel free to [join us and start a conversation](https://croct.link/community).

## License

This project is released under the [MIT License](LICENSE).
