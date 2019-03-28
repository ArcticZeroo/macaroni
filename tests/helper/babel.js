const babel = require('babel-core');
const { default: plugin } = require('../../dist/babel-plugin');

module.exports = function babelHelper() {
    babel.transform(source, { plugins: [[plugin, { importType: 'import' }]] });
};