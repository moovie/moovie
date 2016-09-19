module.exports = {
    root: true,

    parserOptions: {
        ecmaVersion: 6,
        sourceType: 'module'
    },

    env: { es6: true },

    rules: {
        /* Possible Errors */
        'no-cond-assign': ['error', 'always'],
        'no-console': ['error'],
        'no-constant-condition': ['error', { checkLoops: true }],
        'no-control-regex': ['error'],
        'no-debugger': ['error'],
        'no-dupe-args': ['error'],
        'no-dupe-keys': ['error'],
        'no-duplicate-case': ['error'],
        'no-empty-character-class': ['error'],
        'no-empty': ['error', { allowEmptyCatch: false }],
        'no-ex-assign': ['error'],
        'no-extra-boolean-cast': ['error'],
        'no-extra-parens': ['error', 'all', { nestedBinaryExpressions: false }],
        'no-extra-semi': ['error'],
        'no-func-assign': ['error'],
        'no-inner-declarations': ['error', 'both'],
        'no-invalid-regexp': ['error'],
        'no-irregular-whitespace': ['error'],
        'no-obj-calls': ['error'],
        'no-prototype-builtins': ['error'],
        'no-regex-spaces': ['error'],
        'no-sparse-arrays': ['error'],
        'no-template-curly-in-string': ['error'],
        'no-unexpected-multiline': ['error'],
        'no-unreachable': ['error'],
        'no-unsafe-finally': ['error'],
        'no-unsafe-negation': ['error'],
        'use-isnan': ['error'],
        'valid-jsdoc': ['warn', {
            requireReturn: false,
            requireReturnType: true
        }],
        'valid-typeof': ['error', { requireStringLiterals: true }],

        /* Best Practices */
        'array-callback-return': ['error'],
        'block-scoped-var': ['error'],
        'class-methods-use-this': 'error',
        'complexity': ['warn', 6],  // Probably time to start refactoring if this shows
        'consistent-return': ['error'],
        'curly': ['error', 'all'],  // If only this option was smarter...
        'default-case': ['error'],
        'dot-location': ['error', 'property'],
        'dot-notation': ['error'],
        'eqeqeq': ['error', 'always'],
        'guard-for-in': ['error'],
        'no-alert': ['error'],
        'no-caller': ['error'],
        'no-case-declarations': ['error'],
        'no-div-regex': ['error'],
        'no-else-return': ['error'],
        'no-empty-function': ['error'],
        'no-empty-pattern': ['error'],
        'no-eq-null': ['off'],  // Not needed when using "eqeqeq" set to "always"
        'no-eval': ['error'],
        'no-extend-native': ['error'],
        'no-extra-bind': ['error'],
        'no-extra-label': ['error'],
        'no-fallthrough': ['error'],
        'no-floating-decimal': ['error'],
        'no-global-assign': ['error'],
        'no-implicit-coercion': ['error'],
        'no-implicit-globals': ['error'],
        'no-implied-eval': ['error'],
        'no-invalid-this': ['off'],
        'no-iterator': ['error'],
        'no-labels': ['error'],
        'no-lone-blocks': ['error'],
        'no-loop-func': ['error'],
        'no-magic-numbers': ['off'],
        'no-multi-spaces': ['error'],
        'no-multi-str': ['error'],
        'no-new-func': ['error'],
        'no-new-wrappers': ['error'],
        'no-new': ['error'],
        'no-octal-escape': ['error'],
        'no-octal': ['error'],
        'no-param-reassign': ['warn', { props: true }],
        'no-proto': ['error'],
        'no-redeclare': ['warn', { builtinGlobals: true }],
        'no-return-assign': ['error', 'always'],
        'no-script-url': ['error'],
        'no-self-assign': ['error', { props: true }],
        'no-self-compare': ['error'],
        'no-sequences': ['error'],
        'no-throw-literal': ['error'],
        'no-unmodified-loop-condition': ['error'],
        'no-unused-expressions': ['error'],
        'no-unused-labels': ['error'],
        'no-useless-call': ['error'],
        'no-useless-concat': ['error'],
        'no-useless-escape': ['error'],
        'no-void': ['error'],
        'no-warning-comments': ['warn', {
            terms: ['@fixme', '@todo', '@bug', 'fixme', 'todo', 'bug']
        }],
        'no-with': ['error'],
        'radix': ['error', 'as-needed'],
        'vars-on-top': ['off'], // Not needed when using "const" and "let"
        'wrap-iife': ['error', 'inside'],
        'yoda': ['error', 'never'],

        /* Variables */
        'init-declarations': ['error', 'always'],
        'no-catch-shadow': ['error'],   // Rule for IE8 and lower
        'no-delete-var': ['error'],
        'no-label-var': ['error'],
        'no-restricted-globals': ['off'],
        'no-shadow-restricted-names': ['error'],
        'no-shadow': ['off'],
        'no-undef-init': ['error'],
        'no-undef': ['error'],
        'no-undefined': ['error'],
        'no-unused-vars': ['error'],
        'no-use-before-define': ['error'],

        /* Node.js and CommonJS */
        'callback-return': ['off'],
        'global-require': ['error'],
        'handle-callback-err': ['error', 'error'],
        'no-mixed-requires': ['off'],
        'no-new-require': ['error'],
        'no-path-concat': ['error'],
        'no-process-env': ['off'],
        'no-process-exit': ['error'],
        'no-restricted-modules': ['off'],
        'no-sync': ['error'],

        /* Stylistic Issues */
        'array-bracket-spacing': ['error', 'never'],
        'block-spacing': ['off'],   // Not really needed with the "brace-style" rule
        'brace-style': ['error', '1tbs'],
        'camelcase': ['error'],
        'comma-dangle': ['error', 'never'],
        'comma-spacing': ['error', {
            before: false,
            after: true
        }],
        'comma-style': ['error', 'last'],
        'computed-property-spacing': ['error', 'never'],
        'consistent-this': ['error', 'self'],
        'eol-last': ['error', 'unix'],
        'func-call-spacing': ['error', 'never'],
        'func-names': ['off'],  // I've never needed it before...
        'func-style': ['off'],
        'id-blacklist': ['off'],
        'id-length': ['warn', {     // Time to refactor names
            properties: 'never',
            exceptions: ['i', 'l', 'e'],
            min: 3,
            max: 25
        }],
        'id-match': ['off'],
        'indent': ['error', 4, { SwitchCase: 1 }],
        'jsx-quotes': ['off'],
        'key-spacing': ['error', {
            beforeColon: false,
            afterColon: true,
            mode: 'strict'
        }],
        'keyword-spacing': ['error', {
            before: true,
            after: true
        }],
        'line-comment-position': ['off', 'above'],  // Rule not recognized by ESLint
        'linebreak-style': ['error', 'unix'],
        'lines-around-comment': ['error', {
            beforeBlockComment: true,
            afterBlockComment: false,
            beforeLineComment: true,
            afterLineComment: false,
            allowBlockStart: true,
            allowBlockEnd: false,
            allowObjectStart: true,
            allowObjectEnd: true,
            allowArrayStart: true,
            allowArrayEnd: false
        }],
        'lines-around-directive': ['off', { // Rule not recognized by ESLint
            before: 'never',
            after: 'always'
        }],
        'max-depth': ['error', 3],
        'max-len': ['error', 120],
        'max-lines': ['warn', 300], // Time to refactor
        'max-nested-callbacks': ['error', 3],
        'max-params': ['warn', 3],
        'max-statements-per-line': ['error', { max: 1 }],
        'max-statements': ['warn', 10],
        'multiline-ternary': ['error', 'never'],
        'new-cap': ['error', {
            newIsCap: true,
            capIsNew: false     // Allow namespacing
        }],
        'new-parens': ['error'],
        'newline-after-var': ['error', 'always'],
        'newline-before-return': ['error'],
        'newline-per-chained-call': ['off'],
        'no-array-constructor': ['error'],
        'no-bitwise': ['error'],
        'no-continue': ['off'],
        'no-inline-comments': ['warn'],
        'no-lonely-if': ['error'],
        'no-mixed-operators': ['error', { allowSamePrecedence: true }],
        'no-mixed-spaces-and-tabs': ['error'],
        'no-multiple-empty-lines': ['error', {
            max: 1,
            maxBOF: 0,
            maxEOF: 1
        }],
        'no-negated-condition': ['error'],
        'no-nested-ternary': ['error'],
        'no-new-object': ['error'],
        'no-plusplus': ['off'],
        'no-restricted-syntax': ['error', 'WithStatement'],
        'no-tabs': ['error'],
        'no-ternary': ['off'],
        'no-trailing-spaces': ['error'],
        'no-underscore-dangle': ['error'],
        'no-unneeded-ternary': ['error', {
            // Use the `||` operator instead
            defaultAssignment: false
        }],
        'no-whitespace-before-property': ['error'],
        'object-curly-newline': ['error', { multiline: true }],
        'object-curly-spacing': ['error', 'always', {
            arraysInObjects: false,
            objectsInObjects: false
        }],
        'object-property-newline': ['error'],
        'one-var-declaration-per-line': ['error', 'always'],
        'one-var': ['error', 'never'],
        'operator-assignment': ['error', 'never'],
        'operator-linebreak': ['error', 'after'],
        'padded-blocks': ['error', 'never'],
        'quote-props': ['error', 'consistent-as-needed'],
        'quotes': ['error', 'single', { avoidEscape: true }],
        'require-jsdoc': ['off'],
        'semi-spacing': ['error', { before: false }],
        'semi': ['error', 'always'],
        'sort-keys': ['off'],
        'sort-vars': ['off'],
        'space-before-blocks': ['error', 'always'],
        'space-before-function-paren': ['error', {
            anonymous: 'always',
            named: 'never'
        }],
        'space-in-parens': ['error', 'never'],
        'space-infix-ops': ['error'],
        'space-unary-ops': ['error', {
            words: true,
            nonwords: false
        }],
        'spaced-comment': ['error', 'always'],
        'unicode-bom': ['error', 'never'],
        'wrap-regex': ['off'],

        /* ECMAScript 6 */
        'arrow-body-style': ['error', 'always'],
        'arrow-parens': ['error', 'always'],
        'arrow-spacing': ['error', {
            before: true,
            after: true
        }],
        'constructor-super': ['error'],
        'generator-star-spacing': ['off'],  // I want to allow: `function* name() {}` or `*shorthand() {}`
        'no-class-assign': ['error'],
        'no-confusing-arrow': ['error'],
        'no-const-assign': ['error'],
        'no-dupe-class-members': ['error'],
        'no-duplicate-imports': ['error', { includeExports: true }],
        'no-new-symbol': ['error'],
        'no-restricted-imports': ['off'],
        'no-this-before-super': ['error'],
        'no-useless-computed-key': ['error'],
        'no-useless-constructor': ['error'],
        'no-useless-rename': ['error'],
        'no-var': ['error'],
        'object-shorthand': ['error', 'consistent'],
        'prefer-arrow-callback': ['off'],   // Not smart enough yet
        'prefer-const': ['error', {
            destructuring: 'all',
            ignoreReadBeforeAssign: true
        }],
        'prefer-reflect': ['off'],
        'prefer-rest-params': ['error'],
        'prefer-spread': ['error'],
        'prefer-template': ['off'],   // Until this becomes more intuitive, this stays off
        'require-yield': ['error'],
        'rest-spread-spacing': ['error', 'never'],
        'sort-imports': ['off'],    // I don't want to sort alphabetically
        'symbol-description': ['error'],
        'template-curly-spacing': ['error', 'never'],
        'yield-star-spacing': ['error', 'before']   // See "generator-star-spacing"
    }
}
