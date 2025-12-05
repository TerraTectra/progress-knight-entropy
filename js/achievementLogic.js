// achievementLogic.js
// Evaluation and unlocking helpers for achievements.

function ensureAchievementsState() {
    if (!gameData.achievements) {
        gameData.achievements = { unlocked: {}, lastUnlockedId: null };
    } else {
        if (!gameData.achievements.unlocked) gameData.achievements.unlocked = {};
        if (gameData.achievements.lastUnlockedId === undefined) gameData.achievements.lastUnlockedId = null;
    }
}

function evaluateCondition(condition) {
    if (!condition) return false;
    var type = condition.type;
    var value = condition.value;
    switch (type) {
        case "universe_at_least":
            return (gameData.universeIndex || 1) >= (value || 0);
        case "seeds_total_at_least":
            return (gameData.entropy && (gameData.entropy.seeds || 0)) >= (value || 0);
        case "entropy_total_at_least":
            return (gameData.entropy && (gameData.entropy.EP || 0)) >= (value || 0);
        case "evil_current_at_least":
            return (gameData.evil || 0) >= (value || 0);
        case "embrace_evil_times_at_least":
            return ((gameData.rebirthTwoCount || 0)) >= (value || 0);
        case "pattern_levels_sum_at_least":
            if (typeof getTotalPatternLevels === "function") {
                return getTotalPatternLevels() >= (value || 0);
            }
            return false;
        case "rebirths_at_least":
            return ((gameData.rebirthOneCount || 0) + (gameData.rebirthTwoCount || 0)) >= (value || 0);
        case "owns_any_u2_artifact":
            if (!gameData.entropyArtifacts) return false;
            for (var key in gameData.entropyArtifacts) {
                if (!gameData.entropyArtifacts.hasOwnProperty(key)) continue;
                if (key.indexOf("u2_") === 0 && gameData.entropyArtifacts[key]) return true;
            }
            return false;
        case "made_perfect_short_life":
            return !!gameData.lastLifeShort;
        default:
            return false;
    }
}

function checkAchievements() {
    if (!Array.isArray(ACHIEVEMENTS)) return;
    ensureAchievementsState();
    var unlockedAny = false;
    ACHIEVEMENTS.forEach(function (achv) {
        if (gameData.achievements.unlocked[achv.id]) return;
        if (evaluateCondition(achv.condition)) {
            gameData.achievements.unlocked[achv.id] = true;
            gameData.achievements.lastUnlockedId = achv.id;
            unlockedAny = true;
        }
    });
    if (unlockedAny && typeof saveGameData === "function") {
        saveGameData();
    }
}

if (typeof window !== "undefined") {
    window.checkAchievements = checkAchievements;
    window.evaluateCondition = evaluateCondition;
}
