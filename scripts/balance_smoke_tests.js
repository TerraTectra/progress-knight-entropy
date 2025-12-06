const {
    BALANCE_CONSTANTS,
    computeJobIncomeForTick,
    computeTaskXpForTick,
} = require("../js/balanceCore.js")

function assert(condition, message) {
    if (!condition) {
        throw new Error(message || "Assertion failed")
    }
}

function runIncomeTests() {
    const job = {
        getIncome: () => 200,
    }

    const incomeActive = computeJobIncomeForTick(job, true)
    const incomePassive = computeJobIncomeForTick(job, false)

    console.log("Income active:", incomeActive)
    console.log("Income passive:", incomePassive)

    assert(incomeActive > 0, "Active income must be > 0")
    assert(incomePassive > 0, "Passive income must be > 0")
    assert(
        Math.abs(incomePassive - incomeActive * BALANCE_CONSTANTS.PASSIVE_JOB_INCOME_MULTIPLIER) < 1e-9 ||
            incomeActive === 0,
        "Passive income should match the multiplier relationship"
    )
}

function runXpTests() {
    const task = {
        getXpGain: () => 50,
    }

    const xpActive = computeTaskXpForTick(task, true)
    const xpPassive = computeTaskXpForTick(task, false)

    console.log("XP active:", xpActive)
    console.log("XP passive:", xpPassive)

    assert(xpActive >= 0, "Active XP must be >= 0")
    assert(xpPassive >= 0, "Passive XP must be >= 0")
    assert(
        Math.abs(xpPassive - xpActive * BALANCE_CONSTANTS.PASSIVE_XP_MULTIPLIER) < 1e-9 ||
            xpActive === 0,
        "Passive XP should match the multiplier relationship"
    )
}

function main() {
    console.log("Running balance smoke tests...")
    runIncomeTests()
    runXpTests()
    console.log("All balance smoke tests passed.")
}

main()
