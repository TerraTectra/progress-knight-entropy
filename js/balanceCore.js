// Shared balance helpers for income / XP calculations.
// Pure, Node-safe, and attachable to the browser window.

const BALANCE_CONSTANTS = {
    ACTIVE_JOB_INCOME_MULTIPLIER: 1.0,
    PASSIVE_JOB_INCOME_MULTIPLIER: 0.25,
    ACTIVE_XP_MULTIPLIER: 1.0,
    PASSIVE_XP_MULTIPLIER: 0.5,
}

function computeJobIncomeForTick(job, isActive, constants) {
    const cfg = constants || BALANCE_CONSTANTS
    if (!job || typeof job.getIncome !== "function") return 0
    const baseIncome = job.getIncome() || 0
    const mult = isActive ? cfg.ACTIVE_JOB_INCOME_MULTIPLIER : cfg.PASSIVE_JOB_INCOME_MULTIPLIER
    return baseIncome * mult
}

function computeTaskXpForTick(task, isActive, constants) {
    const cfg = constants || BALANCE_CONSTANTS
    if (!task || typeof task.getXpGain !== "function") return 0
    const baseXp = task.getXpGain() || 0
    const mult = isActive ? cfg.ACTIVE_XP_MULTIPLIER : cfg.PASSIVE_XP_MULTIPLIER
    return baseXp * mult
}

// Browser attach
if (typeof window !== "undefined") {
    window.BALANCE_CORE = {
        BALANCE_CONSTANTS,
        computeJobIncomeForTick,
        computeTaskXpForTick,
    }
}

// Node/CommonJS export
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        BALANCE_CONSTANTS,
        computeJobIncomeForTick,
        computeTaskXpForTick,
    }
}
