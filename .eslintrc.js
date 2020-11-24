module.exports = {
    "env": {
        "es6": true
    },
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.json",
        "sourceType": "module"
    },
    "plugins": [
        "@typescript-eslint",
        "import",
        "ban"
    ],
    "rules": {
        "@typescript-eslint/array-type": ["error", {"default": "array-simple"}],
        "@typescript-eslint/ban-ts-comment": "error",
        "@typescript-eslint/ban-types": "error",
        "@typescript-eslint/naming-convention": "error",
        "@typescript-eslint/consistent-type-assertions": "error",
        "@typescript-eslint/consistent-type-definitions": "error",
        "@typescript-eslint/explicit-member-accessibility": ["error", {
            "accessibility": "no-public"
        }],
        "@typescript-eslint/member-delimiter-style": ["error", {
            "multiline": {
                "delimiter": "semi",
                "requireLast": true
            },
            "singleline": {
                "delimiter": "semi",
                "requireLast": false
            }
        }],
        "@typescript-eslint/no-explicit-any": "error",
        "@typescript-eslint/quotes": ["error", "single", {"avoidEscape": true}],
        "@typescript-eslint/semi": ["error", "always"],
        "@typescript-eslint/triple-slash-reference": "error",
        "ban/ban": ["error",
            {"name": ["it", "skip"]},
            {"name": ["it", "only"]},
            {"name": ["it", "async", "skip"]},
            {"name": ["it", "async", "only"]},
            {"name": ["describe", "skip"]},
            {"name": ["describe", "only"]},
            {"name": "parseInt", "message": "tsstyle#type-coercion"},
            {"name": "parseFloat", "message": "tsstyle#type-coercion"},
            {"name": "Array", "message": "tsstyle#array-constructor"},
        ],
        "camelcase": "error",
        "comma-dangle": ["error", {
            "objects": "always-multiline",
            "arrays": "always-multiline",
            "imports": "always-multiline",
            "functions": "never",
        }],
        "curly": ["error", "multi-line"],
        "default-case": "error",
        "eqeqeq": ["error", "smart"],
        "guard-for-in": "error",
        "import/no-default-export": "error",
        "import/no-deprecated": "error",
        "new-parens": "error",
        "no-caller": "error",
        "no-cond-assign": "error",
        "no-debugger": "error",
        "no-new-wrappers": "error",
        "no-redeclare": "error",
        "no-return-await": "error",
        "no-throw-literal": "error",
        "no-underscore-dangle": "error",
        "no-unsafe-finally": "error",
        "no-unused-expressions": "error",
        "no-unused-labels": "error",
        "no-var": "error",
        "object-shorthand": "error",
        "prefer-const": "error",
        "radix": "error",
        "use-isnan": "error",
    }
};
