const { translations } = require("../js/i18n.js")

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed")
    }
}

function runI18nTests() {
    console.log("Running i18n smoke tests...")

    const langs = Object.keys(translations || {})
    console.log("Detected languages:", langs)
    assert(langs.length >= 2, "Expected at least 2 languages.")

    const [langA, langB] = langs
    const keysA = Object.keys(translations[langA] || {})
    const keysB = Object.keys(translations[langB] || {})

    const setA = new Set(keysA)
    const setB = new Set(keysB)

    const missingInB = []
    const missingInA = []

    for (const key of keysA) {
        if (!setB.has(key)) missingInB.push(key)
    }
    for (const key of keysB) {
        if (!setA.has(key)) missingInA.push(key)
    }

    if (missingInB.length > 0) {
        console.warn(`Keys present in ${langA} but missing in ${langB}:`, missingInB)
    }
    if (missingInA.length > 0) {
        console.warn(`Keys present in ${langB} but missing in ${langA}:`, missingInA)
    }

    function checkNonEmptyStrings(lang) {
        const obj = translations[lang] || {}
        for (const key of Object.keys(obj)) {
            const value = obj[key]
            if (typeof value !== "string") {
                console.warn(`Non-string value for key "${key}" in lang "${lang}":`, value)
                continue
            }
            if (value.trim().length === 0) {
                console.warn(`Empty string for key "${key}" in lang "${lang}".`)
            }
        }
    }

    checkNonEmptyStrings(langA)
    checkNonEmptyStrings(langB)

    console.log("i18n smoke tests completed (see warnings above, if any).")
}

function main() {
    runI18nTests()
}

main()
