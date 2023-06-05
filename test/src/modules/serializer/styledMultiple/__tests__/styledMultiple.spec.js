/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { createElement } from 'lwc';
import StyledMultiple from '../styledMultiple';

it('serializes component with HTML - styled in shadow DOM - multiple attrs/classes/styles', () => {
    const elm = createElement('serializer-component', { is: StyledMultiple });
    document.body.appendChild(elm);

    if (global['lwc-jest'].nativeShadow) {
        expect(elm).toMatchInlineSnapshot(`
            <serializer-component
              class="x-test_styledMultiple-host"
            >
              #shadow-root(open)
                <style
                  type="text/css"
                >
                  :host {opacity: 0.5;}h1 {color: red;}.foo {background: azure;}
                </style>
                <style
                  type="text/css"
                >
                  :host {color: goldenrod;}h1.x-test_styledMultiple {background: blue;}.foo.x-test_styledMultiple {opacity: 0.7;}
                </style>
                <h1
                  class="foo bar x-test_styledMultiple"
                  data-bar="bar"
                  data-foo="foo"
                >
                  I am an LWC component with multiple classes, attributes, and styles
                </h1>
            </serializer-component>
        `);
    } else {
        expect(elm).toMatchInlineSnapshot(`
            <serializer-component
              class="x-test_styledMultiple-host"
              x-test_styledmultiple-host=""
            >
              #shadow-root(open)
                <h1
                  class="foo bar x-test_styledMultiple"
                  data-bar="bar"
                  data-foo="foo"
                  x-test_styledmultiple=""
                >
                  I am an LWC component with multiple classes, attributes, and styles
                </h1>
            </serializer-component>
        `);
    }
});
