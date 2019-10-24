/* eslint-disable no-useless-escape */
/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const BASE_CONFIG = require('../../../scripts/jest/base.config');

module.exports = {
    ...BASE_CONFIG,

    displayName: '@lwc/ssr',

    roots: ['<rootDir>/src'],

    transform: {
        '^.+\\.ts?$': 'ts-jest',
    },

    // Ignore jest custom setup scripts from the code coverage.
    coveragePathIgnorePatterns: ['<rootDir>/scripts/'],
};
