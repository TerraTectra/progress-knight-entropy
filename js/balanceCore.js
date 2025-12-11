// Shared balance helpers for income / XP calculations.
// Pure, Node-safe, and attachable to the browser window.

const BALANCE_CONSTANTS = {
    ACTIVE_JOB_INCOME_MULTIPLIER: 1.0,
    PASSIVE_JOB_INCOME_MULTIPLIER: 0.25,
    ACTIVE_XP_MULTIPLIER: 1.0,
    PASSIVE_XP_MULTIPLIER: 0.5,
}

const BalanceConfig = {
    universe: {
        // Baseline world
        1: { xp: 1.0, money: 1.0, entropy: 1.0, seeds: 1.0, cost: 1.0 },
        // Universe II: slightly harsher XP/money, faster Entropy/Seeds, pricier upgrades
        2: { xp: 0.9, money: 0.9, entropy: 1.2, seeds: 1.3, cost: 1.2 },
    },
    shortLife: {
        thresholdPercent: 0.3, // 30% of current lifespan counts as a short life
        thresholdBonusWithShortBrilliant: 1.15, // Short Brilliant Life widens the short-life window
        compressedLifeXpMultiplier: 1.0, // base; artifacts stack on top
    },
    artifacts: {
        echoOfSeedsMultiplier: 1.2, // Seeds gain boost when artifact owned
        fracturedTimelineCompressedXpMultiplier: 1.5, // Bonus XP for compressedLife on short lives
        evilResonatorXpMultiplier: 1.1, // Global XP while Evil > 0
        patternLatticeEntropyPerStack: 0.01, // +1% entropy/insight per pattern-level stack
    },
    synergy: {
        entropyPressurePerUpgrade: 0.25,
        entropyToEvilMultiplier: 0.002,
        evilToPatternRate: 0.0015,
        darkInsightCap: 0.25,
        patternToEntropyRate: 0.01,
    },
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
        BalanceConfig,
        computeJobIncomeForTick,
        computeTaskXpForTick,
    }
    window.BalanceConfig = BalanceConfig
}

// Node/CommonJS export
if (typeof module !== "undefined" && module.exports) {
    module.exports = {
        BALANCE_CONSTANTS,
        BalanceConfig,
        computeJobIncomeForTick,
        computeTaskXpForTick,
    }
}
