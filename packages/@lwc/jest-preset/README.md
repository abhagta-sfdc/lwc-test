# @lwc/jest-preset

Tools to assist with testing Lightning Web Components (LWC) with Jest. This project provides: two jest presets covering project's base Jest configuration for testing Lightning web components rendered on the DOM/Server, and stubs for common external libraries used in Lightning web components.

## Usage

### Installation

```shell
yarn add --dev @lwc/jest-preset @lwc/compiler @lwc/engine-dom @lwc/engine-server @lwc/synthetic-shadow
```

If your project is using **Jest 28** and above, you will also need install `jest-environment-jsdom` separately:

```
yarn add --dev jest-environment-jsdom
```

### Configuration

`@lwc/jest-preset` comes with four presets: `@lwc/jest-preset` (default), `@lwc/jest-preset/ssr`, `@lwc/jest-preset/ssr-server` and `@lwc/jest-preset/ssr-for-hydration`.

#### Testing LWC components rendered on the DOM

To test how LWC components render in the DOM, add the `@lwc/jest-preset` preset to your [jest configuration](https://jestjs.io/docs/configuration):

```json
{
    "preset": "@lwc/jest-preset"
}
```

Then, update the [`moduleNameMapper`](https://jestjs.io/docs/configuration#modulenamemapper-objectstring-string--arraystring) entry of the Jest config to point to where your LWC components live. For example, use the following to map all components in the `example` and `other` namespaces:

```json
{
    "preset": "@lwc/jest-preset",
    "moduleNameMapper": {
        "^(example|other)/(.+)$": "<rootDir>/src/test/modules/$1/$2/$2"
    }
}
```

##### nativeShadow

By default, this preset is configured to run the tests with synthetic shadow DOM. Optionally, you can configure `@lwc/jest-preset` to use native shadow DOM rather than synthetic shadow DOM. To do so, add the following to `jest.config.js`:

```json
{
    "globals": {
        "lwc-jest": {
            "nativeShadow": true
        }
    }
}
```

#### LWC components rendered on the Server

Add the `@lwc/jest-preset/ssr` preset to the Jest configuration like so:

```json
{
    "preset": "@lwc/jest-preset/ssr"
}
```

#### SSR component Unit test setup

To ensure high-quality rendering for both server and client, separate test suites are necessary:

-   **Server-side tests:** Focus on rendering components to static HTML on the server side. These tests are executed in a Node environment, ensuring that server-side logic works as expected without client-side DOM interactions.
-   **Client-side tests:** Validate how components behave post-hydration in a browser-like environment. These tests are executed using JSDOM to simulate browser behavior.

Combining these tests in the same suite is complex and increases maintenance efforts. By separating them, we ensure better test reliability and coverage.

##### Jest configuration

Jest is the primary tool used for testing, and both "core" and "off-core" repositories rely on it for server-side and client-side tests. The test configuration differs for each environment.

**Server-side configuration** : In server-side testing, we focus on generating static HTML on the server. Below is a sample configuration file for server-side testing:

Example:

`jest.ssr-server.config.js`

```js
module.exports = {
    displayName: 'Server-side rendering',
    preset: '@lwc/jest-preset/ssr-server',
    testMatch: ['**/*.ssr-server.(spec|test).(js|ts)'],
    collectCoverage: true,
    collectCoverageFrom: ['**/*.ssr-server.(spec|test).(js|ts)'],
};
```

**Client-side configuration** : For client-side testing, we validate how the component behaves after the client-side hydration. Below is a sample configuration for client-side-rendering testing.

`jest.ssr-client.config.js`

```js
module.exports = {
    displayName: 'SSR with hydration',
    preset: '@lwc/jest-preset/ssr-for-hydration',
    testMatch: ['**/*.ssr-client.(spec|test).(js|ts)'],
    setupFilesAfterEnv: ['./jest.ssr-client.setup.js'],
    collectCoverage: true,
    collectCoverageFrom: ['**/*.ssr-client.(spec|test).(js|ts)'],
};
```

At present, hydration errors are tracked by monitoring the console.warn event.

`jest.ssr-client.setup.js`

```js
beforeEach(() => {
    // Spy on console.warn and intercept warnings
    jest.spyOn(console, 'warn').mockImplementation((message) => {
        if (message.includes('Hydration mismatch')) {
            throw new Error(`Test failed due to hydration mismatch: ${message}`);
        } else {
            // If it's not a hydration mismatch, print the warning as usual
            console.warn(message);
        }
    });
});

afterEach(() => {
    // Restore original console.warn after each test
    jest.restoreAllMocks();
});
```

**Main Jest configuration** : The main Jest configuration file combines both server-side and client-side test setups using the "projects" feature in Jest.

```js
module.exports = {
    projects: ['<rootDir>/jest.ssr-server.config.js', '<rootDir>/jest.ssr-client.config.js'],
};
```

To learn more about how to setup and write tests for SSR unit test please refer to this [doc](https://salesforce.quip.com/70uGAbzZ4Tg3)

### Testing

Create a `__tests__` inside the bundle of the LWC component under test.

Then, create a new test file in `__tests__` that follows the naming convention `<js-file-under-test>.test.js` for DOM tests and `<js-file-under-test>.ssr-test.js` for ssr tests. See an example in this projects `src/test` directory.

Now you can write and run the Jest tests!

#### @Salesforce/apex/ Method Mocks

Imports of `@Salesforce/apex/*` automatically resolve to `jest.fn()`, these can be optionally overwritten.

```js
import apexMethod from '@Salesforce/apex/apexClass.apexMethod';

it('test apex cal', async () => {
    apexMethod.mockResolvedValue({ foo: 'bar' });
});
```

Optional set function for method manually

```js
import apexMethod from '@Salesforce/apex/apexClass.apexMethod';

jest.mock(
    '@salesforce/apex/apexClass.apexMethod',
    () => ({
        default: jest.fn(),
    }),
    { virtual: true }
);

it('test apex callout', async () => {
    apexMethod.mockResolvedValue({ foo: 'bar' });
});
```

### Custom matchers

This package contains convenience functions to help test web components, including Lightning Web Components.

Note that, for these matchers to work properly in TypeScript, you must import this package from your `*.spec.ts` files:

```js
import '@lwc/jest-preset';
```

#### expect().toThrowInConnectedCallback

Allows you to test for an error thrown by the `connectedCallback` of a web component. `connectedCallback` [does not necessarily throw errors synchronously](https://github.com/salesforce/lwc/pull/3662), so this utility makes it easier to test for `connectedCallback` errors.

##### Example

```js
// Component
export default class Throws extends LightningElement {
    connectedCallback() {
        throw new Error('whee!');
    }
}
```

```js
// Test
import { createElement } from 'lwc';

it('Should throw in connectedCallback', () => {
    const element = createElement('x-throws', { is: Throws });
    expect(() => {
        document.body.appendChild(element);
    }).toThrowErrorInConnectedCallback(/whee!/);
});
```

##### Error matching

The argument passed in to `toThrowInConnectedCallback` behaves the same as for [Jest's built-in `toThrow`](https://jestjs.io/docs/expect#tothrowerror):

-   Regular expression: error message matches the pattern.
-   String: error message includes the substring.
-   Error object: error message is equal to the message property of the object.
-   Error class: error object is instance of class.

##### Best practices

Note that, to avoid false positives, you should try to include _only_ the `document.body.appendChild` call inside of your callback; otherwise you could get a false positive:

```js
expect(() => {
    document.body.appendChild(elm);
    throw new Error('false positive!');
}).toThrowInConnectedCallback();
```

The above Error will be successfully caught by `toThrowInConnectedCallback`, even though it doesn't really occur in the `connectedCallback`.

##### Web component support

This matcher works both with LWC components and with non-LWC custom elements that use standard
`connectedCallback` semantics (e.g. [Lit](https://lit.dev/) or [vanilla](https://developer.mozilla.org/en-US/docs/Web/API/Web_components/Using_custom_elements)).

It also works with LWC components regardless of whether they use the standard `connectedCallback` or the legacy [synthetic lifecycle](https://github.com/salesforce/lwc/issues/3198) `connectedCallback`.

#### expect().toThrowErrorInConnectedCallback

Equivalent to `toThrowInConnectedCallback`.
