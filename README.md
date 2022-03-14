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
- **Server-side rendering**: seamless integration with server-side frameworks like Next.js.
- **Zero configuration**: no setup steps are required.
- **Type-safety**: Typescript typings are included for improved development experience.
- **Blazing-fast queries**: double-digit millisecond latency for real-time evaluations.
- **Playground integration**: one-click to connect, no configuration needed.

Check out the [Storybook](https://croct-tech.github.io/plug-react) to see some minimal examples in action,
or the [example folder](examples) for full code examples.

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

You connect Croct to React with the `<CroctProvider />` component. The `<CroctProvider />` uses a regular React's
`<Context.Provider />` to wrap your React app and make the SDK available anywhere in your component tree.

We suggest putting the `<CroctProvider />` somewhere high in your app, above any component that might be personalized,
ideally in the top-level `<App/>` component.

```tsx
import {render} from 'react-dom';
import {CroctProvider} from '@croct/plug-react';

function App() {
  return (
    <CroctProvider appId="<APP_ID>">
      <div>
        <h1>My first personalized app 🚀</h1>
      </div>
    </CroctProvider>
  );
}

render(<App />, document.getElementById('root'));
```

> Replace `<APP_ID>` with your public app ID that you can find at Workspaces > Applications > Setup.
> In case you don't have an account yet, you can use the sandbox application ID `00000000-0000-0000-0000-000000000000`

### Evaluating expressions

Once your application is plugged in, you're ready to start personalizing your components using the `<Personalization />`
component or the `useEvaluation` hook.

We'll go through a simple example that shows how  you can implement feature flags (also known as feature toggles)
to conditionally renders a different button depending on the user's persona.

![Evaluation Example](https://user-images.githubusercontent.com/943036/116588852-6a114200-a8f2-11eb-9d88-c346f002e2a1.png)

Let's first implement the use-case using the `<Personalization />` component. It takes an expression (e.g. `user's persona`)
and a render function, which tells the component how to render the UI, depending on the evaluation result.

This is what our component would look like:

```tsx
import {ReactElement, Suspense} from 'react';
import {Personalization} from '@croct/plug-react';

function OnboardingPage(): ReactElement {
    return (
        <Suspense fallback="✨ Personalizing...">
            <Personalization expression="user's persona is not 'developer'">
                {(isDeveloper: boolean) => isDeveloper
                    ? <a href="/docs">View docs</a>
                    : <a href="/share">Share with your developer</a>
                }
            </Personalization>
        </Suspense>
    )
}
```

If you don't want your component to suspend while loading, you can provide an `initial` state to be rendered instead:

```tsx
import {ReactElement} from 'react';
import {Personalization} from '@croct/plug-react';

function OnboardingPage(): ReactElement {
    return (
        <Personalization expression="user's persona is not 'developer'" initial={false}>
            {(isDeveloper: boolean) => isDeveloper
                ? <a href="/docs">View docs</a>
                : <a href="/share">Share with your developer</a>
            }
        </Personalization>
    )
}
```

Now, let's create a `ViewDocsLink` component to see the `useEvaluation` hook in action:

```tsx
import {ReactElement, Suspense} from 'react';
import {useEvaluation} from '@croct/plug-react';

function ViewDocsLink(): ReactElement {
    const isDeveloper = useEvaluation<boolean>("user's persona is 'developer'");

    return (
        isDeveloper
            ? <a href="/docs">View docs</a>
            : <a href="/share">Share with your developer</a>
    );
}

export default function OnboardingPage(): ReactElement {
    return (
        <Suspense fallback="✨ Personalizing...">
            <ViewDocsLink />
        </Suspense>
    )
}
```

If you run the application and there is no persona assigned to your profile, you will see the button for non-developers
— otherwise, the button for sharing the code with developers.
Check out [Accessing the Plug instance](#accessing-the-plug-instance) for an example of how to save information in a
user's profile.

#### Fault tolerance

We strongly recommend specifying the `fallback` property in client-side rendered applications to ensure your app behaves 
the same way regardless of the personalization. In this way, the UI will still be fully functional even in maintenance 
windows. **Specifying a `fallback` is required for server-side rendering (SSR).**

The following example shows how you can specify a fallback behaviour for the docs link:

```tsx
import {ReactElement, Fragment, Suspense} from 'react';
import {Personalization, useEvaluation} from '@croct/plug-react';

function ViewDocsLink(): ReactElement {
    const isDeveloper = useEvaluation<boolean>("user's persona is 'developer'", {fallback: false});

    return <Fragment>{isDeveloper && <a href="/docs">View docs</a>}</Fragment>
}

export default function OnboardingPage(): ReactElement {
    return (
        <Suspense fallback="✨ Personalizing...">
            {/* Using the <Personalization /> component */}
            <Personalization expression="user's persona is 'developer'" fallback={false}>
                {(isDeveloper: boolean) => (
                    <Fragment>
                        {isDeveloper && <a href="/docs">View docs</a>}
                    </Fragment>
                )}
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

![Slot Example](https://user-images.githubusercontent.com/943036/116586841-44833900-a8f0-11eb-8d32-acec2eacee01.png)

To render a slot, all you need to do is provide the `id` you configured in your Croct workspace. Based on the
slot's personalization rules and the user's context, the component will decide which content show to that user.
Notice that there's no logic on the client-side, meaning that your marketing or product team can freely change the
slot content as they need without requiring an update to your React app.

For the next example, we assume that you have already defined a slot with id `home-banner` in your Croct workspace
with the following structure:

```ts
type HomeBannerContent = {
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
import {ReactElement, Suspense} from 'react';
import {Slot} from '@croct/plug-react';

type HomeBannerContent = {
  title: string,
  subtitle: string,
  cta: {
      label: string,
      link: string,
  },
};

export default function OnboardingPage(): ReactElement {
    return (
        <Suspense fallback="✨ Personalizing content...">
            <Slot id="home-banner">
                {({title, subtitle, cta}: HomeBannerContent) => (
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

To avoid the component from suspending while loading, you can provide an `initial` state to be rendered instead:

```tsx
import {ReactElement} from 'react';
import {Slot} from '@croct/plug-react';

type HomeBannerContent = {
  title: string,
  subtitle: string,
  cta: {
      label: string,
      link: string,
  },
};

export default function OnboardingPage(): ReactElement {
    return (
        <Slot id="home-banner" initial={null}>
            {(props: HomeBannerContent|null) => (
                props === null 
                    ? '✨ Personalizing...'
                    : (
                        <div>
                            <strong>{props.title}</strong>
                            <p>{props.subtitle}</p>
                            <a href={props.cta.link}>{props.cta.label}</a>
                        </div>    
                    )
            )}
        </Slot>
    )
}
```

And here's an example using the `useContent` hook:

```tsx
import {ReactElement, Suspense} from 'react';
import {useContent} from '@croct/plug-react';

type HomeBannerContent = {
  title: string,
  subtitle: string,
  cta: {
      label: string,
      link: string,
  },
};

function HomeBanner(): ReactElement {
    const {title, subtitle, cta} = useContent<HomeBannerContent>('home-banner');

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

#### Fault tolerance

The following example shows how you can specify a fallback state for the `home-banner` slot:

```tsx
import {ReactElement, Suspense} from 'react';
import {Slot, useContent} from '@croct/plug-react';

type HomeBannerContent = {
  title: string,
  subtitle: string,
  cta: {
      label: string,
      link: string,
  },
};

const fallbackBanner: HomeBannerContent = {
    title: 'Default title',
    subtitle: 'Default subtitle',
    cta: {
        label: 'Try now',
        link: 'https://croct.com',
    }
};

function HomeBanner(): ReactElement {
    const {title, subtitle, cta} = useContent<HomeBannerContent>('home-banner', {fallback: fallbackBanner});

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
            <Slot id="home-banner" fallback={fallbackBanner}>
                {({title, subtitle, cta}: HomeBannerContent) => (
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

### Server-side rendering

You can use the same components and hooks on the server-side by simply providing an `initial` state which is used to
pre-render on the server - the personalization happens transparently on the client during the initial render.
That means it's SEO friendly and can be cached with no performance overhead.

Notice that the methods exposed by the Plug work only on the client-side. Therefore, if you are using [`useCroct`](#usecroct),
the operations have to be executed inside the `useEffect` hook or client-side callbacks, such as `onClick` or `onChange`, for example.

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
        <CroctProvider appId="<APP_ID>">
            <div>
                <h1>My first personalized app 🚀</h1>
            </div>
        </CroctProvider>
    );
}
```

> Replace "<APP_ID>" with your public app ID that you can find at Workspaces > Applications > API Keys.

### &lt;Personalization /&gt;

The `<Personalization />` component evaluates and renders a CQL query.

#### Properties

The component takes the followings properties:

| Option       | Type     | Required | Description
|--------------|----------|----------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
| `expression` | string   | Yes      | The CQL query to evaluate.
| `children`   | Function | Yes      | A callback to render the result.
| `fallback`   | Result   | No       | A value to render when the evaluation fails. If not specified, the hook will throw an exception in case of failures.
| `initial`    | Result   | SSR only | A value to render while loading, required for server-side rendering. If not specified, the rendering will suspend.
| `timeout`    | number   | No       | The maximum evaluation time in milliseconds. Once reached, the evaluation will fail.
| `attributes` | JSON     | No       | A map of attributes to inject in the evaluation context. For example, passing the attributes `{cities: ['New York', 'San Francisco']}` you can reference them in expressions like `context's cities include location's city`.
| `cacheKey`   | string   | No       | An identifier that allows keeping the cached result separate from other cached items. By default, the cache key is formed from the expression and attributes.
| `expiration` | number   | No       | The cache expiration time in milliseconds, extended on every render. If negative, the cache never expires. By default, the cache lifespan is set to 60000 (1 minute).

#### Code Sample

Here's a simple example showing how to evaluate the user's persona:

```tsx
import {ReactElement} from 'react';
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
| `fallback`   | Result   | No       | A value to render when the fetch fails. If not specified, the hook will throw an exception in case of failures.
| `initial`    | Result   | SSR only | A value to render while loading, required for server-side rendering. If not specified, the rendering will suspend.
| `cacheKey`   | string   | No       | An identifier that allows keeping the cached result separate from other cached items. By default, the cache key is formed from the expression and attributes.
| `expiration` | number   | No       | The cache expiration time in milliseconds, extended on every render. If negative, the cache never expires. By default, the cache lifespan is set to 60000 (1 minute).

#### Code Sample

Here's a simple example showing how to render a banner in a slot:

```tsx
import {ReactElement} from 'react';
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
| `fallback`   | Result  | The value returned when the evaluation fails. If not specified, the hook will throw an exception in case of failures.
| `timeout`    | number  | The maximum evaluation time in milliseconds. Once reached, the evaluation will fail.
| `attributes` | JSON    | The map of attributes to inject in the evaluation context. For example, passing the attributes `{cities: ['New York', 'San Francisco']}` you can reference them in expressions like `context's cities include location's city`.
| `cacheKey`   | string  | An identifier that allows keeping the cached result separate from other cached items. By default, the cache key is formed from the expression and attributes.
| `expiration` | number  | The cache expiration time in milliseconds, extended on every render. If negative, the cache never expires. By default, the cache lifespan is set to 60000 (1 minute).

#### Code Sample

Here's a simple example showing how to evaluate the user's persona:

```tsx
import {ReactElement} from 'react';
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
| `fallback`   | Content | The content returned when the fetch fails. If not specified, the hook will throw an exception in case of failures.
| `cacheKey`   | string  | An identifier that allows keeping the cached content separate from other cached items. By default, the cache key is formed from the slot ID.
| `expiration` | number  | The cache expiration time in milliseconds, extended on every render. If negative, the cache never expires. By default, the cache lifespan is set to 60000 (1 minute).

#### Code Sample

Here's a simple example showing how to fetch the content for a banner:

```tsx
import {ReactElement} from 'react';
import {useContent} from '@croct/plug-react';

type HomeBannerContent = {
    title: string,
    subtitle: string,
    cta: {
        label: string,
        link: string,
    },
};

export default function HeroBanner(): ReactElement {
    const {title, subtitle} = useContent<HomeBannerContent>('hero');

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
please [ask a new one](https://stackoverflow.com/questions/ask?tags=croct%20plug-react%20react).

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
