// challengeLogic.js
// Helpers for challenge state, modifiers, and completion.

function ensureChallengesState() {
    if (!gameData.challenges) {
        gameData.challenges = { activeId: null, completed: {}, lastCompletedId: null }
    } else {
        if (!gameData.challenges.completed) gameData.challenges.completed = {}
        if (gameData.challenges.activeId === undefined) gameData.challenges.activeId = null
        if (gameData.challenges.lastCompletedId === undefined) gameData.challenges.lastCompletedId = null
    }
}

function getActiveChallenge(state) {
    state = state || gameData
    if (!state || !state.challenges || !state.challenges.activeId) return null
    if (!Array.isArray(CHALLENGES)) return null
    return CHALLENGES.find(function (c) { return c.id === state.challenges.activeId }) || null
}

function getActiveChallengeModifiers(state) {
    state = state || gameData
    ensureChallengesState()
    var active = getActiveChallenge(state)
    if (!active || !active.modifiers) return {}
    return active.modifiers || {}
}

function evaluateChallengeCondition(challenge) {
    if (!challenge || !challenge.condition) return false
    var cond = challenge.condition
    var type = cond.type
    var value = cond.value || 0
    switch (type) {
        case "reach_universe_at_least":
            return (gameData.universeIndex || 1) >= value
        case "seeds_total_at_least":
            return (gameData.entropy && (gameData.entropy.seeds || 0)) >= value
        case "entropy_total_at_least":
            return (gameData.entropy && (gameData.entropy.EP || 0)) >= value
        case "evil_total_at_least":
            return (gameData.evil || 0) >= value
        case "pattern_levels_sum_at_least":
            return typeof getTotalPatternLevels === "function" ? getTotalPatternLevels() >= value : false
        case "perfect_short_life_times_at_least":
            return (gameData.perfectShortLifeCount || 0) >= value
        default:
            return false
    }
}

function applyChallengeReward(challenge) {
    if (!challenge || !challenge.reward) return
    var reward = challenge.reward
    if (reward.seeds && gameData.entropy) {
        gameData.entropy.seeds = (gameData.entropy.seeds || 0) + reward.seeds
    }
    if (reward.evil) {
        gameData.evil = (gameData.evil || 0) + reward.evil
    }
}

function checkChallenges() {
    ensureChallengesState()
    if (!gameData.challenges.activeId) return
    var challenge = getActiveChallenge()
    if (!challenge) {
        gameData.challenges.activeId = null
        return
    }
    var alreadyCompleted = !!gameData.challenges.completed[challenge.id]
    if (alreadyCompleted) {
        gameData.challenges.activeId = null
        return
    }
    if (!evaluateChallengeCondition(challenge)) return
    gameData.challenges.completed[challenge.id] = true
    gameData.challenges.activeId = null
    gameData.challenges.lastCompletedId = challenge.id
    applyChallengeReward(challenge)
    if (typeof saveGameData === "function") saveGameData()
}

if (typeof window !== "undefined") {
    window.checkChallenges = checkChallenges
    window.ensureChallengesState = ensureChallengesState
    window.getActiveChallengeModifiers = getActiveChallengeModifiers
}
