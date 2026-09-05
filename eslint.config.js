// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoFlatConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([...expoFlatConfig]);