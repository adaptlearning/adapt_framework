module.exports = {
    src: [
        'src/**/*.js',
        '!src/core/js/libraries/*.js'
    ],
    options: {
        reporter: "unix",
        fix: true,
        // rules
        disallowMixedSpacesAndTabs: true,
        disallowMultipleVarDecl: "exceptUndefined",
        disallowNewlineBeforeBlockStatements: true,
        disallowQuotedKeysInObjects: true,
        disallowSpaceAfterObjectKeys: true,
        disallowSpaceAfterPrefixUnaryOperators: true,
        disallowSpacesInFunction: {
            beforeOpeningRoundBrace: true
        },
        disallowTrailingWhitespace: true,
        disallowTrailingComma: true,
        requireCamelCaseOrUpperCaseIdentifiers: true,
        requireCapitalizedConstructors: true,
        requireSpaceAfterLineComment: true,
        requireSpaceAfterBinaryOperators: true,
        requireSpaceBeforeBinaryOperators: true,
        requireSpaceBeforeBlockStatements: true,
        requireSpaceBeforeObjectValues: true,
        requireSpaceAfterKeywords: [
            "if",
            "else",
            "for",
            "while",
            "do",
            "switch",
            "case",
            "return",
            "try",
            "catch",
            "typeof"
        ],
        requireSpacesInFunction: {
            beforeOpeningCurlyBrace: true
        },
        validateIndentation: "\t",
        validateLineBreaks: "LF",
        validateQuoteMarks: "'"
    }
}
