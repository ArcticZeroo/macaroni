const babel = require('babel-core');
const { default: plugin } = require('../../dist/babel-plugin');

module.exports = function babelHelper(source, noPlugins = false) {
    if (noPlugins) {
        return babel.transform(source).code;
    }

    return babel.transform(source, { plugins: [[plugin, { skipImport: true }]] }).code;
};