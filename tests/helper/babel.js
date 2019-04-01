const babel = require('babel-core');
const { default: plugin } = require('../../dist/babel-plugin');

module.exports = function babelHelper(source) {
    return babel.transform(source, { plugins: [[plugin, { skipImport: true }]] }).code;
};