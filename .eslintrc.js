// @ts-check
/** @type {import('eslint').Linter.Config} */
const config = {
  "extends": "next",
    "rules": {
        "react/react-in-jsx-scope": "off",
        "react/prop-types": "off",
        "react/no-children-prop": "off",
        "react/jsx-key": "off",
    }
}
module.exports = config;
