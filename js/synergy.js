// synergy.js
// Shared helpers for Entropy⇄Evil⇄Patterns synergy state.

function initSynergyState(state) {
    if (!state.synergy) {
        state.synergy = {entropyPressure: 0, darkInsight: 0, patternStabilityBonus: 1}
    } else {
        if (state.synergy.entropyPressure === undefined || state.synergy.entropyPressure === null) state.synergy.entropyPressure = 0
        if (state.synergy.darkInsight === undefined || state.synergy.darkInsight === null) state.synergy.darkInsight = 0
        if (state.synergy.patternStabilityBonus === undefined || state.synergy.patternStabilityBonus === null) state.synergy.patternStabilityBonus = 1
    }
    return state.synergy
}

function recomputeEntropyPressureFromUpgrades(state, totalUpgradeLevels) {
    initSynergyState(state)
    var per = (BalanceConfig && BalanceConfig.synergy) ? BalanceConfig.synergy.entropyPressurePerUpgrade : 0
    var total = Math.max(0, totalUpgradeLevels || 0) * per
    state.synergy.entropyPressure = total
    return total
}

function addEntropyPressureFromUpgrade(state, deltaLevels) {
    initSynergyState(state)
    var per = (BalanceConfig && BalanceConfig.synergy) ? BalanceConfig.synergy.entropyPressurePerUpgrade : 0
    var delta = Math.max(0, deltaLevels || 0) * per
    state.synergy.entropyPressure = (state.synergy.entropyPressure || 0) + delta
    return state.synergy.entropyPressure
}

function updateDarkInsightFromEvil(state) {
    initSynergyState(state)
    var rate = (BalanceConfig && BalanceConfig.synergy) ? BalanceConfig.synergy.evilToPatternRate : 0
    var cap = (BalanceConfig && BalanceConfig.synergy) ? BalanceConfig.synergy.darkInsightCap : 0
    var evil = state.evil || (state.resources && state.resources.evil) || 0
    var raw = Math.max(0, evil) * rate
    state.synergy.darkInsight = Math.min(cap, raw)
    return state.synergy.darkInsight
}

function recomputePatternStabilityBonus(state, totalPatternLevels) {
    initSynergyState(state)
    var rate = (BalanceConfig && BalanceConfig.synergy) ? BalanceConfig.synergy.patternToEntropyRate : 0
    var total = Math.max(0, totalPatternLevels || 0)
    state.synergy.patternStabilityBonus = 1 + total * rate
    return state.synergy.patternStabilityBonus
}
