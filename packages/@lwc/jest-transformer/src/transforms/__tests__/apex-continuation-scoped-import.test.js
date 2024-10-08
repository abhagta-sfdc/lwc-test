/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const test = require('./utils/test-transform').test(require('../apex-continuation-scoped-import'));

describe('@salesforce/apexContinuation import', () => {
    test(
        'does default transformation',
        `
        import myMethod from '@salesforce/apexContinuation/FooController.fooMethod';
    `,
        `
        import { jest } from '@jest/globals';
        let myMethod;

        try {
          myMethod = require("@salesforce/apexContinuation/FooController.fooMethod").default;
        } catch (e) {
          global.__lwcJestMock_myMethod = global.__lwcJestMock_myMethod || jest.fn(Promise.resolve());

          myMethod = global.__lwcJestMock_myMethod;
        }
    `
    );

    test(
        'allows non-@salesforce/apexContinuation named imports',
        `
        import { otherNamed } from './something-valid';
        import myMethod from '@salesforce/apexContinuation/FooController.fooMethod';
    `,
        `
        import { otherNamed } from './something-valid';
        import { jest } from '@jest/globals';
        let myMethod;

        try {
          myMethod = require("@salesforce/apexContinuation/FooController.fooMethod").default;
        } catch (e) {
          global.__lwcJestMock_myMethod = global.__lwcJestMock_myMethod || jest.fn(Promise.resolve());

          myMethod = global.__lwcJestMock_myMethod;
        }
    `
    );
});
