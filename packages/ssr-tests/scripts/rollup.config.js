/* eslint-env node */
const path = require('path');
const replace = require('rollup-plugin-replace');
const lwcCompiler = require('@lwc/rollup-plugin');

const input = path.resolve(__dirname, '../src/main.js');
const output = path.resolve(__dirname, `../public/cjs/main.js`);

const isProduction = process.env.NODE_ENV === 'production';

const plugins = [
    lwcCompiler({ resolveFromPackages: true, mapNamespaceFromPath: true }),
    //replace({ 'process.env.NODE_ENV': JSON.stringify('development') }),
    replace({
        'process.env.NODE_ENV': isProduction
            ? JSON.stringify('production')
            : JSON.stringify('development'),
    }),
];

module.exports = [
    {
        input,
        output: {
            file: output,
            format: 'cjs',
        },
        plugins,
    },
];
