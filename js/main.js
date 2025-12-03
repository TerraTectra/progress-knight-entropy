var gameData = {
    universeIndex: 1,
    universeTokens: 0,
    taskData: {},
    itemData: {},
    purchasedItems: {},
    categoryPurchaseCounts: {},

    coins: 0,
    days: 365 * 14,
    evil: 0,
    paused: false,
    timeWarpingEnabled: true,

    rebirthOneCount: 0,
    rebirthTwoCount: 0,

    currentJob: null,
    currentSkill: null,
    currentProperty: null,
    currentMisc: null,

    hasAnsweredFirstTimePrompt: false,
    autoSwitchJobs: false,
    autoSwitchSkills: false,
    settings: {autoPickShop: false},

    entropy: {
        unlocked: false,
        seeds: 0,
        insight: 0,
        EP: 0,
        maxInsightEver: 0,
        overseer: false,
        focusTask: null,
        unifiedArchitecture: false,
    },

    entropyUpgrades: {
        velocity: {
            temporalMomentum: 0,
            earlyCompression: 0,
            chainProgression: 0,
            momentumPersistence: 0,
            wealthFocus: 0,
            masteryFocus: 0,
        },
        stability: {
            entropyStability: 0,
            lifeContinuity: 0,
            balancedGrowth: 0,
            shortBrilliantLife: 0,
            longSteadyLife: 0,
            earlyPeak: 0,
            lateBloom: 0,
            smoothing: 0,
            quietMind: 0,
            patternAttunement: 0,
        },
        meta: {
            unifiedArchitecture: 0,
        },
    },

    entropyPatterns: {
        lifeStats: {
            ticksInJobs: 0,
            ticksInSkills: 0,
            rebirthCount: 0,
            currentLifeTicks: 0,
            autoSwitchUsed: false,
            totalIncomeThisLife: 0,
            totalXpThisLife: 0,
        },
        patterns: {
            laborCycle: {xp: 0, level: 0},
            scholarLoop: {xp: 0, level: 0},
            compressedLife: {xp: 0, level: 0},
            stableCycle: {xp: 0, level: 0},
            opportunist: {xp: 0, level: 0},
        },
    },

    entropyArtifacts: {
        sigilMomentum: false,
        chainConductor: false,
        loopAnchor: false,
        patternResonator: false,
    },
}

var tempData = {}

var skillWithLowestMaxXp = null
var realityArchitectureEffect = null
var baseInitialized = false
var entropyInitialized = false
var autoSwitchFlagsPresentInSave = false
var autoSwitchDefaultsApplied = false
var lastEntropyUnlockedState = false
var universeSwitchPenalty = 0
var lastJobName = null
var lastSkillName = null

var burnoutLevel = 0
var lifeCompressionState = {activity: "idle"}
var majorChoicesUsed = 0
var majorChoicesChosen = {}
var meaningMilestones = {}
var cycleStrain = 0
var metaAwareness = 0
var metaWeights = {patterns: 1, aging: 1, burnout: 1, compression: 1, meaning: 1, cycle: 1}
var metaTunesSpent = 0
var observerData = null
var debugMode = false
var autoPickShopElement = null
var recommendedShopItem = null
var shopAutoPickLabelElement = null

const observerIntellectConfigs = {
    1: {name: "Fool", performanceFactor: 0.7, existenceFactor: 0.5},
    2: {name: "Clumsy", performanceFactor: 0.8, existenceFactor: 0.7},
    3: {name: "Average", performanceFactor: 1.0, existenceFactor: 1.0},
    4: {name: "Reasonable", performanceFactor: 1.1, existenceFactor: 1.2},
    5: {name: "Smart", performanceFactor: 1.2, existenceFactor: 1.5},
    6: {name: "Very Smart", performanceFactor: 1.3, existenceFactor: 1.8},
    7: {name: "Talented", performanceFactor: 1.5, existenceFactor: 2.2},
    8: {name: "Genius", performanceFactor: 1.7, existenceFactor: 2.8},
    9: {name: "Supermind", performanceFactor: 2.0, existenceFactor: 3.5},
    10: {name: "Singularity", performanceFactor: 2.5, existenceFactor: 5.0},
}

function isObserverMode() {
    return !!gameData && gameData.universeIndex >= 10
}

function formatNumberShort(value) {
    var num = Number(value) || 0
    var abs = Math.abs(num)
    var suffixes = ["", "k", "M", "B", "T"]
    if (abs < 1000) return num.toFixed(0)
    var tier = Math.min(Math.floor(Math.log10(abs) / 3), suffixes.length - 1)
    var scaled = num / Math.pow(10, tier * 3)
    return scaled.toFixed(1) + suffixes[tier]
}

function initObserverDataIfNeeded() {
    if (!observerData || !observerData.initialized) {
        observerData = {initialized: true, students: [], nextStudentId: 1, existence: 0, existencePerSecond: 0, existenceBoostLevel: 0}
    } else {
        if (!observerData.students) observerData.students = []
        if (observerData.nextStudentId === undefined || observerData.nextStudentId === null) {
            observerData.nextStudentId = observerData.students.length + 1
        }
        if (observerData.existence === undefined || observerData.existence === null) {
            observerData.existence = 0
        }
        if (observerData.existencePerSecond === undefined || observerData.existencePerSecond === null) {
            observerData.existencePerSecond = 0
        }
        if (observerData.existenceBoostLevel === undefined || observerData.existenceBoostLevel === null) {
            observerData.existenceBoostLevel = 0
        }
        for (var i = 0; i < observerData.students.length; i++) {
            var s = observerData.students[i]
            if (s.intellectGrade === undefined || s.intellectGrade === null) {
                s.intellectGrade = rollObserverIntellectGrade()
            }
            if (s.displayAge === undefined || s.displayAge === null) {
                s.displayAge = 14
            }
        }
    }
}

function toggleDebugMode() {
    debugMode = !debugMode
    updateDebugPanelVisibility()
    updateDebugPanel()
}

function updateDebugPanelVisibility() {
    var panel = document.getElementById("debug-panel")
    if (!panel) return
    panel.classList.toggle("hidden", !debugMode)
}

function updateDebugPanel() {
    if (!debugMode) return
    var el = document.getElementById("debug-panel-content")
    if (!el) return
    var lines = []

    lines.push("Universe: " + (gameData ? gameData.universeIndex : "?"))
    lines.push("Observer: " + (isObserverMode() ? "yes" : "no"))
    if (gameData) {
        var totalRebirths = (gameData.rebirthOneCount || 0) + (gameData.rebirthTwoCount || 0)
        lines.push("Rebirths: " + totalRebirths)
        lines.push("Coins: " + formatNumberShort(gameData.coins || 0))
    }

    if (gameData && gameData.entropy) {
        lines.push("")
        lines.push("Entropy")
        lines.push("Seeds: " + (gameData.entropy.seeds || 0))
        lines.push("EP: " + (gameData.entropy.EP || 0))
        lines.push("Insight: " + (gameData.entropy.insight || 0))
        lines.push("Max insight: " + (gameData.entropy.maxInsightEver || 0))
    }

    if (gameData && gameData.entropyPatterns && gameData.entropyPatterns.patterns) {
        lines.push("")
        lines.push("Patterns")
        var patt = gameData.entropyPatterns.patterns
        for (var key in patt) {
            if (!patt.hasOwnProperty(key)) continue
            var p = patt[key]
            lines.push(key + ": lvl " + (p.level || 0) + ", xp " + formatNumberShort(p.xp || 0))
        }
    }

    if (gameData && gameData.universeIndex >= 7) {
        lines.push("")
        lines.push("Late Systems")
        if (typeof gameData.meaning === "number") {
            lines.push("Meaning: " + gameData.meaning.toFixed(2))
        }
        if (typeof gameData.cycleStrain === "number") {
            lines.push("Cycle strain: " + gameData.cycleStrain.toFixed(2))
        }
        if (gameData.metaWeights) {
            lines.push("Meta weights:")
            for (var mk in gameData.metaWeights) {
                if (!gameData.metaWeights.hasOwnProperty(mk)) continue
                lines.push("  " + mk + ": " + (gameData.metaWeights[mk] || 0).toFixed(3))
            }
        }
    }

    if (isObserverMode() && observerData) {
        lines.push("")
        lines.push("Observer")
        lines.push("Existence: " + observerData.existence.toFixed(2))
        lines.push("Existence/sec: " + observerData.existencePerSecond.toFixed(3))
        var count = observerData.students ? observerData.students.length : 0
        lines.push("Students: " + count)
        if (count > 0) {
            var maxShow = Math.min(count, 5)
            lines.push("Top " + maxShow + " students:")
            for (var i = 0; i < maxShow; i++) {
                var s = observerData.students[i]
                lines.push("  " + s.id + " age=" + (s.displayAge ? s.displayAge.toFixed(1) : "?") + " IQgrade=" + (s.intellectGrade || "?"))
            }
        }
    }

    el.textContent = lines.join("\n")
}

function initDebugUI() {
    var btn = document.getElementById("debug-toggle-button")
    if (btn) {
        btn.addEventListener("click", function() {
            toggleDebugMode()
        })
    }
    var close = document.getElementById("debug-panel-close")
    if (close) {
        close.addEventListener("click", function() {
            debugMode = false
            updateDebugPanelVisibility()
        })
    }
    document.addEventListener("keydown", function(e) {
        if (e.shiftKey && (e.key === "D" || e.key === "d")) {
            toggleDebugMode()
        }
    })
    updateDebugPanelVisibility()
}

function createStubStudent() {
    initObserverDataIfNeeded()
    var id = observerData.nextStudentId++
    var intellect = rollObserverIntellectGrade()
    return {
        id: id,
        name: "Student " + id,
        intellectGrade: intellect,
        displayAge: 14,
        displaySummary: "A new student in the Observer's world",
    }
}

function observerAddNewStudent() {
    initObserverDataIfNeeded()
    var count = observerData.students.length
    if (count > 0) {
        var cost = observerGetNewStudentCost()
        if (observerData.existence < cost) return
        observerData.existence -= cost
    }
    var student = createStubStudent()
    observerData.students.push(student)
}

function rollObserverIntellectGrade() {
    var r = Math.random()
    if (r <= 0.30) return 1
    if (r <= 0.55) return 2
    if (r <= 0.75) return 3
    if (r <= 0.87) return 4
    if (r <= 0.94) return 5
    if (r <= 0.97) return 6
    if (r <= 0.985) return 7
    if (r <= 0.995) return 8
    if (r <= 0.999) return 9
    return 10
}

function observerGetNewStudentCost() {
    initObserverDataIfNeeded()
    var count = observerData.students ? observerData.students.length : 0
    if (count === 0) return 0
    return 50 * Math.pow(count + 1, 1.4)
}

function observerGetIntellectUpgradeCost(student) {
    if (!student) return Infinity
    var grade = student.intellectGrade || 1
    if (grade >= 10) return Infinity
    return 100 * grade * grade
}

function observerGetExistenceBoostCost() {
    initObserverDataIfNeeded()
    var level = observerData.existenceBoostLevel || 0
    if (level >= 5) return Infinity
    return 100 * Math.pow(2, level)
}

function observerUpgradeStudentIntellect(studentId) {
    initObserverDataIfNeeded()
    if (!observerData.students) return
    for (var i = 0; i < observerData.students.length; i++) {
        var s = observerData.students[i]
        if (s.id === studentId) {
            var grade = s.intellectGrade || 1
            if (grade >= 10) return
            var cost = observerGetIntellectUpgradeCost(s)
            if (observerData.existence < cost) return
            observerData.existence -= cost
            s.intellectGrade = grade + 1
            return
        }
    }
}

function markItemDiscoveredIfKnown(requirementKey) {
    if (!gameData || !gameData.itemData) return
    var item = gameData.itemData[requirementKey]
    if (!item) return
    item.discovered = true
}

function observerBuyExistenceBoost() {
    initObserverDataIfNeeded()
    var level = observerData.existenceBoostLevel || 0
    if (level >= 5) return
    var cost = observerGetExistenceBoostCost()
    if (observerData.existence < cost) return
    observerData.existence -= cost
    observerData.existenceBoostLevel = level + 1
}

function updateObserverStudentsAges(deltaTime) {
    if (!observerData || !observerData.students) return
    var yearsPerSecond = 0.1
    var ageDelta = deltaTime * yearsPerSecond
    if (ageDelta <= 0) return
    for (var i = 0; i < observerData.students.length; i++) {
        var s = observerData.students[i]
        if (typeof s.displayAge !== "number") {
            s.displayAge = 14
        }
        s.displayAge += ageDelta
        if (s.displayAge > 100) {
            s.displayAge = 100
        }
    }
}

function computeObserverExistencePerSecond() {
    initObserverDataIfNeeded()
    var total = 0
    for (var i = 0; i < observerData.students.length; i++) {
        var s = observerData.students[i]
        var age = s.displayAge || 14
        var grade = s.intellectGrade || 1
        var cfg = observerIntellectConfigs[grade] || observerIntellectConfigs[1]
        var ageFactor = Math.min(1 + (age - 14) * 0.02, 3)
        var baseRate = 0.05
        var studentRate = baseRate * ageFactor * cfg.existenceFactor
        total += studentRate
    }
    var level = observerData.existenceBoostLevel || 0
    var boostMult = 1 + 0.2 * level
    observerData.existencePerSecond = total * boostMult
}

function updateObserverMode(deltaTime) {
    initObserverDataIfNeeded()
    updateObserverStudentsAges(deltaTime)
    computeObserverExistencePerSecond()
    if (observerData.existencePerSecond > 0 && deltaTime > 0) {
        observerData.existence += observerData.existencePerSecond * deltaTime
    }
}

const autoPromoteElement = document.getElementById("autoPromote")
const autoLearnElement = document.getElementById("autoLearn")
autoPromoteElement.addEventListener("change", function() {
    if (autoPromoteElement.disabled) return
    gameData.autoSwitchJobs = autoPromoteElement.checked
})
autoLearnElement.addEventListener("change", function() {
    if (autoLearnElement.disabled) return
    gameData.autoSwitchSkills = autoLearnElement.checked
})

const updateSpeed = 20

const baseLifespan = 365 * 70

const baseGameSpeed = 4
const PASSIVE_JOB_INCOME_MULTIPLIER = 0.25
const PASSIVE_JOB_XP_MULTIPLIER = 0.5
const PASSIVE_SKILL_XP_MULTIPLIER = 0.5
const BASE_AUTO_SWITCH_THRESHOLD = 0.2
const ENTROPY_EARLY_LIFE_MAX_AGE = 25
const ENTROPY_EARLY_XP_MULT = 1.5
const ENTROPY_EARLY_MONEY_MULT = 1.5
const entropyEarlyJobs = ["Beggar", "Farmer", "Fisherman", "Miner"]
const ENTROPY_PATTERN_MAX_LEVEL = 10
const ENTROPY_ARTIFACT_COST_EP = {
    sigilMomentum: 10,
    chainConductor: 10,
    loopAnchor: 12,
    patternResonator: 20,
}
const ENTROPY_UPGRADE_MAX_LEVELS = {
    temporalMomentum: 5,
    earlyCompression: 5,
    chainProgression: 5,
    momentumPersistence: 5,
    entropyStability: 5,
    lifeContinuity: 5,
    balancedGrowth: 5,
    shortBrilliantLife: 1,
    longSteadyLife: 1,
    wealthFocus: 1,
    masteryFocus: 1,
    earlyPeak: 1,
    lateBloom: 1,
    smoothing: 3,
    quietMind: 3,
    patternAttunement: 3,
    unifiedArchitecture: 1,
}

const ENTROPY_UPGRADE_BASE_COST_EP = {
    temporalMomentum: 5,
    earlyCompression: 5,
    chainProgression: 5,
    momentumPersistence: 8,
    entropyStability: 5,
    lifeContinuity: 8,
    balancedGrowth: 10,
    shortBrilliantLife: 12,
    longSteadyLife: 12,
    wealthFocus: 10,
    masteryFocus: 10,
    earlyPeak: 12,
    lateBloom: 12,
    smoothing: 20,
    quietMind: 22,
    patternAttunement: 24,
    unifiedArchitecture: 40,
}

const ENTROPY_UPGRADE_COST_GROWTH = 1.5
const ENTROPY_UPGRADE_BRANCH_SOFT_CAP = 6
const ROMAN_NUMERALS = ["I","II","III","IV","V","VI","VII","VIII","IX","X"]

const universeConfigs = {
    1: {
        name: "Universe I",
        description: "The original world.",
        moneyFactor: 1.0,
        xpFactor: 1.0,
        happinessFactor: 1.0,
        extraTimeWarpFactor: 1.0,
        costFactor: 1.0,
        patternResonance: 1,
    },
    2: {
        name: "Universe II",
        description: "Sharper: gains and costs rise; happiness is brittle.",
        moneyFactor: 1.15,
        xpFactor: 1.15,
        happinessFactor: 0.95,
        extraTimeWarpFactor: 1.05,
        costFactor: 1.05,
        patternResonance: 1.02,
    },
    3: {
        name: "Universe III",
        description: "Deep patterns: consistency is power; chaos bleeds momentum.",
        moneyFactor: 1.10,
        xpFactor: 1.20,
        happinessFactor: 1.0,
        extraTimeWarpFactor: 1.05,
        costFactor: 1.05,
        patternResonance: 1.15,
    },
    4: {
        name: "Universe IV",
        description: "Fragile Human: youth is bright, age erodes and overwork drains.",
        moneyFactor: 1.20,
        xpFactor: 1.20,
        happinessFactor: 0.9,
        extraTimeWarpFactor: 1.05,
        costFactor: 1.05,
        patternResonance: 1.1,
        agingFragility: true,
    },
    5: {
        name: "Universe V",
        description: "Compressed Life: idle years rush by; focused moments carry more weight.",
        moneyFactor: 1.25,
        xpFactor: 1.25,
        happinessFactor: 1.0,
        extraTimeWarpFactor: 1.10,
        costFactor: 1.05,
        patternResonance: 1.12,
        lifeCompressionEnabled: true,
    },
    6: {
        name: "Universe VI",
        description: "World of Choice: limited major paths and exclusivity.",
        moneyFactor: 1.30,
        xpFactor: 1.30,
        happinessFactor: 1.0,
        extraTimeWarpFactor: 1.10,
        costFactor: 1.05,
        patternResonance: 1.1,
        choiceLimitEnabled: true,
        exclusivePathsEnabled: true,
    },
    7: {
        name: "Universe VII",
        description: "Death of Meaning: numbers alone are hollow; seek purpose.",
        moneyFactor: 1.35,
        xpFactor: 1.35,
        happinessFactor: 1.0,
        extraTimeWarpFactor: 1.10,
        costFactor: 1.05,
        patternResonance: 1.05,
        meaningSystemEnabled: true,
    },
    8: {
        name: "Universe VIII",
        description: "Distorted Cycle: instability may force rebirth under pressure.",
        moneyFactor: 1.40,
        xpFactor: 1.40,
        happinessFactor: 1.0,
        extraTimeWarpFactor: 1.15,
        costFactor: 1.05,
        patternResonance: 1.08,
        distortedCycleEnabled: true,
    },
    9: {
        name: "Universe IX",
        description: "Meta Reality: systems are visible; their weights can be nudged.",
        moneyFactor: 1.45,
        xpFactor: 1.45,
        happinessFactor: 1.05,
        extraTimeWarpFactor: 1.15,
        costFactor: 1.05,
        patternResonance: 1.1,
        metaAwarenessEnabled: true,
    },
}

function getUniverseConfig() {
    var u = gameData.universeIndex || 1
    return universeConfigs[u] || universeConfigs[1]
}

const ENTROPY_UPGRADE_DEFINITIONS = {
    velocity: {
        temporalMomentum: {name: "Temporal Momentum", description: "Extends early-life window and strengthens early gains."},
        earlyCompression: {name: "Early Compression", description: "Front-loads XP for early levels and early window gains."},
        chainProgression: {name: "Chain Progression", description: "Lowers the auto-switch threshold for faster promotion."},
        momentumPersistence: {name: "Momentum Persistence", description: "Keeps early income surging a bit longer."},
        wealthFocus: {name: "Wealth Focus", description: "Emphasize income and jobs over study.", exclusiveGroupId: "focus"},
        masteryFocus: {name: "Mastery Focus", description: "Prioritize learning over raw income.", exclusiveGroupId: "focus"},
    },
    stability: {
        entropyStability: {name: "Entropy Stability", description: "Subtle steadiness for all pursuits."},
        lifeContinuity: {name: "Life Continuity", description: "Rewards long, uninterrupted lives."},
        balancedGrowth: {name: "Balanced Growth", description: "Small across-the-board growth bonus."},
        shortBrilliantLife: {name: "Short Brilliant Life", description: "Bright early-life gains, gentler late years.", exclusiveGroupId: "lifeArc"},
        longSteadyLife: {name: "Long Steady Life", description: "Slow rise, stronger later-life footing.", exclusiveGroupId: "lifeArc"},
        earlyPeak: {name: "Early Peak", description: "Fast start, early plateau.", exclusiveGroupId: "bloom"},
        lateBloom: {name: "Late Bloom", description: "Slow opening, richer mid-to-late growth.", exclusiveGroupId: "bloom"},
        smoothing: {name: "Entropy Smoothing", description: "Minor smoothing of income swings at high cost."},
        quietMind: {name: "Quiet Mind", description: "Slight comfort boost with diminishing returns."},
        patternAttunement: {name: "Pattern Attunement", description: "Tiny uplift to pattern effects, heavily capped."},
    },
    meta: {
        unifiedArchitecture: {name: "Unified Architecture", description: "Finalize entropy; freeze further growth once stabilized."},
    },
}

const permanentUnlocks = ["Scheduling", "Shop", "Automation", "Quick task display"]

const jobBaseData = {
    "Beggar": {name: "Beggar", maxXp: 50, income: 5},
    "Farmer": {name: "Farmer", maxXp: 100, income: 9},
    "Fisherman": {name: "Fisherman", maxXp: 200, income: 15},
    "Miner": {name: "Miner", maxXp: 400, income: 40},
    "Blacksmith": {name: "Blacksmith", maxXp: 800, income: 80},
    "Merchant": {name: "Merchant", maxXp: 1600, income: 150},

    "Squire": {name: "Squire", maxXp: 100, income: 5},
    "Footman": {name: "Footman", maxXp: 1000, income: 50},
    "Veteran footman": {name: "Veteran footman", maxXp: 10000, income: 120},
    "Knight": {name: "Knight", maxXp: 100000, income: 300},
    "Veteran knight": {name: "Veteran knight", maxXp: 1000000, income: 1000},
    "Elite knight": {name: "Elite knight", maxXp: 7500000, income: 3000},
    "Holy knight": {name: "Holy knight", maxXp: 40000000, income: 15000},
    "Legendary knight": {name: "Legendary knight", maxXp: 150000000, income: 50000},

    "Student": {name: "Student", maxXp: 100000, income: 100},
    "Apprentice mage": {name: "Apprentice mage", maxXp: 1000000, income: 1000},
    "Mage": {name: "Mage", maxXp: 10000000, income: 7500},
    "Wizard": {name: "Wizard", maxXp: 100000000, income: 50000},
    "Master wizard": {name: "Master wizard", maxXp: 10000000000, income: 250000},
    "Chairman": {name: "Chairman", maxXp: 1000000000000, income: 1000000, meaningTag: "utilitarian"},
    "Archmage Consultant": {name: "Archmage Consultant", maxXp: 3000000000000, income: 2200000, meaningTag: "utilitarian"},
    "Elder Advisor": {name: "Elder Advisor", maxXp: 2000000000, income: 400000, meaningTag: "meaningful"},
}

const entropyJobBaseData = {
    "Work with Entropy": {name: "Work with Entropy", maxXp: 3000, income: 150},
    "Chronicle Keeper": {name: "Chronicle Keeper", maxXp: 5000, income: 250},
    "Fate Analyst": {name: "Fate Analyst", maxXp: 25000, income: 1500},
    "Flow Regulator": {name: "Flow Regulator", maxXp: 150000, income: 8000},
    "Reality Architect": {name: "Reality Architect", maxXp: 750000, income: 25000},
} 

const skillBaseData = {
    "Concentration": {name: "Concentration", maxXp: 100, effect: 0.01, description: "Skill xp"},
    "Productivity": {name: "Productivity", maxXp: 100, effect: 0.01, description: "Job xp"},
    "Bargaining": {name: "Bargaining", maxXp: 100, effect: -0.01, description: "Expenses"},
    "Meditation": {name: "Meditation", maxXp: 100, effect: 0.01, description: "Happiness"},

    "Strength": {name: "Strength", maxXp: 100, effect: 0.01, description: "Military pay"},
    "Battle tactics": {name: "Battle tactics", maxXp: 100, effect: 0.01, description: "Military xp"},
    "Muscle memory": {name: "Muscle memory", maxXp: 100, effect: 0.01, description: "Strength xp"},

    "Mana control": {name: "Mana control", maxXp: 100, effect: 0.01, description: "T.A.A. xp"},
    "Immortality": {name: "Immortality", maxXp: 100, effect: 0.01, description: "Longer lifespan"},
    "Time warping": {name: "Time warping", maxXp: 100, effect: 0.01, description: "Gamespeed"},
    "Super immortality": {name: "Super immortality", maxXp: 100, effect: 0.01, description: "Longer lifespan"},

    "Dark influence": {name: "Dark influence", maxXp: 100, effect: 0.01, description: "All xp"},
    "Evil control": {name: "Evil control", maxXp: 100, effect: 0.01, description: "Evil gain"},
    "Intimidation": {name: "Intimidation", maxXp: 100, effect: -0.01, description: "Expenses"},
    "Demon training": {name: "Demon training", maxXp: 100, effect: 0.01, description: "All xp"},
    "Blood meditation": {name: "Blood meditation", maxXp: 100, effect: 0.01, description: "Evil gain"},
    "Demon's wealth": {name: "Demon's wealth", maxXp: 100, effect: 0.002, description: "Job pay"},
    "Pattern Weaving": {name: "Pattern Weaving", maxXp: 1500, effect: 0.004, description: "Deep pattern synergy", meaningTag: "meaningful"},
    "Body Maintenance": {name: "Body Maintenance", maxXp: 1200, effect: 0.003, description: "Ease aging strain", meaningTag: "meaningful"},
    "Life Orchestration": {name: "Life Orchestration", maxXp: 1800, effect: 0.004, description: "Focus compressed life", meaningTag: "meaningful"},
    "Life Decision": {name: "Life Decision", maxXp: 1600, effect: 0.004, description: "Major choices resonate", meaningTag: "meaningful"},
    "Career Obsession": {name: "Career Obsession", maxXp: 800, effect: 0.003, description: "Career-first outlook", isMajorChoice: true, exclusiveGroupId: "careerPath", meaningTag: "utilitarian"},
    "Inner Mastery": {name: "Inner Mastery", maxXp: 800, effect: 0.003, description: "Inner focus outlook", isMajorChoice: true, exclusiveGroupId: "careerPath", meaningTag: "meaningful"},
    "Wanderer": {name: "Wanderer", maxXp: 800, effect: 0.003, description: "Keeps moving", isMajorChoice: true, exclusiveGroupId: "mobilityPath", meaningTag: "neutral"},
    "Rooted Citizen": {name: "Rooted Citizen", maxXp: 800, effect: 0.003, description: "Stays in place", isMajorChoice: true, exclusiveGroupId: "mobilityPath", meaningTag: "neutral"},
    "Existential Insight": {name: "Existential Insight", maxXp: 2000, effect: 0.004, description: "See beyond numbers", meaningTag: "meaningful"},
    "Cycle Steward": {name: "Cycle Steward", maxXp: 1600, effect: 0.003, description: "Stabilize a distorted cycle", meaningTag: "meaningful"},
    "Meta Tuning": {name: "Meta Tuning", maxXp: 1800, effect: 0.003, description: "Nudge how systems weigh in."},
}

const entropySkillBaseData = {
    "Read Almanach": {name: "Read Almanach", maxXp: 200, effect: 0.005, description: "Insight gain", meaningTag: "meaningful"},
    "Study Entropy": {name: "Study Entropy", maxXp: 400, effect: 0.004, description: "Entropy understanding"},
    "Pattern Comprehension": {name: "Pattern Comprehension", maxXp: 400, effect: 0.004, description: "Max level bonus"},
    "Time Manipulation": {name: "Time Manipulation", maxXp: 800, effect: 0.004, description: "Longevity efficiency"},
    "Reality Architecture": {name: "Reality Architecture", maxXp: 1600, effect: 0.006, description: "High-tier job xp"},
    "Self-Awareness of the Cycle": {name: "Self-Awareness of the Cycle", maxXp: 2000, effect: 0.002, description: "All xp"},
} 

const itemBaseData = {
    "Homeless": {name: "Homeless", expense: 0, effect: 1},
    "Tent": {name: "Tent", expense: 15, effect: 1.4},
    "Wooden hut": {name: "Wooden hut", expense: 100, effect: 2},
    "Cottage": {name: "Cottage", expense: 750, effect: 3.5},
    "House": {name: "House", expense: 3000, effect: 6},
    "Large house": {name: "Large house", expense: 25000, effect: 12},
    "Small palace": {name: "Small palace", expense: 300000, effect: 25},
    "Grand palace": {name: "Grand palace", expense: 5000000, effect: 60},

    "Book": {name: "Book", expense: 10, effect: 1.5, description: "Skill xp"},
    "Dumbbells": {name: "Dumbbells", expense: 50, effect: 1.5, description: "Strength xp"},
    "Personal squire": {name: "Personal squire", expense: 200, effect: 2, description: "Job xp"},
    "Steel longsword": {name: "Steel longsword", expense: 1000, effect: 2, description: "Military xp"},
    "Butler": {name: "Butler", expense: 7500, effect: 1.5, description: "Happiness"},
    "Sapphire charm": {name: "Sapphire charm", expense: 50000, effect: 3, description: "Magic xp"},
    "Study desk": {name: "Study desk", expense: 1000000, effect: 2, description: "Skill xp"},
    "Library": {name: "Library", expense: 10000000, effect: 1.5, description: "Skill xp"},
}

const jobCategories = {
    "Common work": ["Beggar", "Farmer", "Fisherman", "Miner", "Blacksmith", "Merchant"],
    "Military" : ["Squire", "Footman", "Veteran footman", "Knight", "Veteran knight", "Elite knight", "Holy knight", "Legendary knight"],
    "The Arcane Association" : ["Student", "Apprentice mage", "Mage", "Wizard", "Master wizard", "Chairman", "Archmage Consultant", "Elder Advisor"]
}

const skillCategories = {
    "Fundamentals": ["Concentration", "Productivity", "Bargaining", "Meditation"],
    "Combat": ["Strength", "Battle tactics", "Muscle memory"],
    "Magic": ["Mana control", "Immortality", "Time warping", "Super immortality"],
    "Dark magic": ["Dark influence", "Evil control", "Intimidation", "Demon training", "Blood meditation", "Demon's wealth"],
    "Deep Studies": ["Pattern Weaving"],
    "Longevity": ["Body Maintenance"],
    "Orchestration": ["Life Orchestration"],
    "Commitments": ["Life Decision", "Career Obsession", "Inner Mastery", "Wanderer", "Rooted Citizen", "Existential Insight", "Meta Tuning"],
    "Cycle": ["Cycle Steward"],
}

const entropyJobCategories = {
    "Entropy Work": ["Work with Entropy", "Chronicle Keeper", "Fate Analyst", "Flow Regulator", "Reality Architect"],
} 

const entropySkillCategories = {
    "Entropy Studies": ["Read Almanach", "Study Entropy", "Pattern Comprehension", "Time Manipulation", "Reality Architecture", "Self-Awareness of the Cycle"],
} 

// Чисто энтропийные ветки, скрываются до полной разблокировки энтропии
const entropyOnlySkillCategories = ["Entropy Studies", "Deep Studies", "Longevity", "Orchestration", "Commitments", "Cycle"]

const itemCategories = {
    "Properties": ["Homeless", "Tent", "Wooden hut", "Cottage", "House", "Large house", "Small palace", "Grand palace"],
    "Misc": ["Book", "Dumbbells", "Personal squire", "Steel longsword", "Butler", "Sapphire charm", "Study desk", "Library"]
}

const headerRowColors = {
    "Common work": "#55a630",
    "Military": "#e63946",
    "The Arcane Association": "#C71585",
    "Fundamentals": "#4a4e69",
    "Combat": "#ff704d",
    "Magic": "#875F9A",
    "Dark magic": "#73000f",
    "Properties": "#219ebc",
    "Misc": "#b56576",
    "Entropy Work": "#204051",
    "Entropy Studies": "#52616b",
}

const tooltips = {
    "Beggar": "Struggle day and night for a couple of copper coins. It feels like you are at the brink of death each day.",
    "Farmer": "Plow the fields and grow the crops. It's not much but it's honest work.",
    "Fisherman": "Reel in various fish and sell them for a handful of coins. A relaxing but still a poor paying job.",
    "Miner": "Delve into dangerous caverns and mine valuable ores. The pay is quite meager compared to the risk involved.",
    "Blacksmith": "Smelt ores and carefully forge weapons for the military. A respectable and OK paying commoner job.",
    "Merchant": "Travel from town to town, bartering fine goods. The job pays decently well and is a lot less manually-intensive.",

    "Squire": "Carry around your knight's shield and sword along the battlefield. Very meager pay but the work experience is quite valuable.",
    "Footman": "Put down your life to battle with enemy soldiers. A courageous, respectable job but you are still worthless in the grand scheme of things.",
    "Veteran footman": "More experienced and useful than the average footman, take out the enemy forces in battle with your might. The pay is not that bad.",
    "Knight": "Slash and pierce through enemy soldiers with ease, while covered in steel from head to toe. A decently paying and very respectable job.",
    "Veteran knight": "Utilising your unmatched combat ability, slaugher enemies effortlessly. Most footmen in the military would never be able to acquire such a well paying job like this.",
    "Elite knight": "Obliterate squadrons of enemy soldiers in one go with extraordinary proficiency, while equipped with the finest gear. Such a feared unit on the battlefield is paid extremely well.",
    "Holy knight": "Collapse entire armies in mere seconds with your magically imbued blade. The handful of elite knights who attain this level of power are showered with coins.",
    "Legendary knight": "Feared worldwide, obliterate entire nations in a blink of an eye. Roughly every century, only one holy knight is worthy of receiving such an esteemed title.",

    "Student": "Study the theory of mana and practice basic spells. There is minor pay to cover living costs, however, this is a necessary stage in becoming a mage.",
    "Apprentice mage": "Under the supervision of a mage, perform basic spells against enemies in battle. Generous pay will be provided to cover living costs.",
    "Mage": "Turn the tides of battle through casting intermediate spells and mentor other apprentices. The pay for this particular job is extremely high.",
    "Wizard": "Utilise advanced spells to ravage and destroy entire legions of enemy soldiers. Only a small percentage of mages deserve to attain this role and are rewarded with an insanely high pay.",
    "Master wizard": "Blessed with unparalleled talent, perform unbelievable feats with magic at will. It is said that a master wizard has enough destructive power to wipe an empire off the map.",
    "Chairman": "Spend your days administrating The Arcane Association and investigate the concepts of true immortality. The chairman receives ludicrous amounts of pay daily.",
    "Archmage Consultant": "Advise realities themselves on arcane structure. Lucrative but demands deep magical experience; best suited for sharper universes.",

    "Concentration": "Improve your learning speed through practising intense concentration activities.",
    "Productivity": "Learn to procrastinate less at work and receive more job experience per day.",
    "Bargaining": "Study the tricks of the trade and persuasive skills to lower any type of expense.",
    "Meditation": "Fill your mind with peace and tranquility to tap into greater happiness from within.",

    "Strength": "Condition your body and strength through harsh training. Stronger individuals are paid more in the military.",
    "Battle tactics": "Create and revise battle strategies, improving experience gained in the military.",
    "Muscle memory": "Strengthen your neurons through habit and repetition, improving strength gains throughout the body.",

    "Mana control": "Strengthen your mana channels throughout your body, aiding you in becoming a more powerful magical user.",
    "Immortality": "Lengthen your lifespan through the means of magic. However, is this truly the immortality you have tried seeking for...?",
    "Time warping": "Bend space and time through forbidden techniques, resulting in a faster gamespeed.",
    "Super immortality": "Through harnessing ancient, forbidden techniques, lengthen your lifespan drastically beyond comprehension.",

    "Dark influence": "Encompass yourself with formidable power bestowed upon you by evil, allowing you to pick up and absorb any job or skill with ease.",
    "Evil control": "Tame the raging and growing evil within you, improving evil gain in-between rebirths.",
    "Intimidation": "Learn to emit a devilish aura which strikes extreme fear into other merchants, forcing them to give you heavy discounts.",
    "Demon training": "A mere human body is too feeble and weak to withstand evil. Train with forbidden methods to slowly manifest into a demon, capable of absorbing knowledge rapidly.",
    "Blood meditation": "Grow and culture the evil within you through the sacrifise of other living beings, drastically increasing evil gain.",
    "Demon's wealth": "Through the means of dark magic, multiply the raw matter of the coins you receive from your job.",

    "Chronicle Keeper": "Record every fleeting shift in fate. Pays modestly but builds long-term insight when focused.",
    "Fate Analyst": "Dissect complex destiny patterns and extract their lessons. Generates income only while active.",
    "Flow Regulator": "Steady the stream of time, trading effort for controlled progress. Income requires active focus.",
    "Reality Architect": "Redesigns realities for high-tier roles, boosting their mastery when focused.",

    "Read Almanach": "Study the Almanach. Early reading calms the mind; after your first rebirth its pages yield Insight and subtle entropy understanding.",
    "Pattern Comprehension": "See recurring motifs between lives, enhancing the strength of your max level bonuses.",
    "Time Manipulation": "Ease the burden of aging and stretch each day a bit further.",
    "Reality Architecture": "Apply entropy principles to make elite jobs learn faster without altering their income rules.",
    "Self-Awareness of the Cycle": "A quiet, passive understanding gained from every entropy rebirth. Boosts all learning.",
    "Pattern Weaving": "Interlace patterns into daily life. In deeper universes it subtly amplifies pattern effects and calms entropy drift.",
    "Body Maintenance": "Mindful care of body and mind. In fragile universes, it cushions aging and burnout.",
    "Life Orchestration": "Compose compressed moments into meaningful gains. Stronger when life is dense and focused.",
    "Life Decision": "Commit to the paths that matter. In the World of Choice, each major decision hits harder.",
    "Career Obsession": "Laser focus on career outcomes—other paths fade. Mutually exclusive.",
    "Inner Mastery": "Prioritize inner growth over career ladders. Mutually exclusive.",
    "Wanderer": "Embrace movement and varied paths. Locks you out of rooted stability.",
    "Rooted Citizen": "Stay planted; depth in one place at the cost of mobility.",
    "Existential Insight": "Find value beyond numbers. Raises meaning gains and steadies happiness in the World without meaning.",
    "Cycle Steward": "Anchor an unstable loop. Slightly slows cycle strain and softens distortions in Universe VIII.",
    "Meta Tuning": "See the levers behind the world. Slowly unlocks small adjustments to system weights in Meta Reality.",

    "Homeless": "Sleep on the uncomfortable, filthy streets while almost freezing to death every night. It cannot get any worse than this.",
    "Tent": "A thin sheet of tattered cloth held up by a couple of feeble, wooden sticks. Horrible living conditions but at least you have a roof over your head.",
    "Wooden hut": "Shabby logs and dirty hay glued together with horse manure. Much more sturdy than a tent, however, the stench isn't very pleasant.",
    "Cottage": "Structured with a timber frame and a thatched roof. Provides decent living conditions for a fair price.",
    "House": "A building formed from stone bricks and sturdy timber, which contains a few rooms. Although quite expensive, it is a comfortable abode.",
    "Large house": "Much larger than a regular house, which boasts even more rooms and multiple floors. The building is quite spacious but comes with a hefty price tag.",
    "Small palace": "A very rich and meticulously built structure rimmed with fine metals such as silver. Extremely high expenses to maintain for a lavish lifestyle.",
    "Grand palace": "A grand residence completely composed of gold and silver. Provides the utmost luxurious and comfortable living conditions possible for a ludicrous price.",

    "Book": "A place to write down all your thoughts and discoveries, allowing you to learn a lot more quickly.",
    "Dumbbells": "Heavy tools used in strenuous exercise to toughen up and accumulate strength even faster than before. ",
    "Personal squire": "Assists you in completing day to day activities, giving you more time to be productive at work.",
    "Steel longsword": "A fine blade used to slay enemies even quicker in combat and therefore gain more experience.",
    "Butler": "Keeps your household clean at all times and also prepares three delicious meals per day, leaving you in a happier, stress-free mood.",
    "Sapphire charm": "Embedded with a rare sapphire, this charm activates more mana channels within your body, providing a much easier time learning magic.",
    "Study desk": "A dedicated area which provides many fine stationary and equipment designed for furthering your progress in research.",
    "Library": "Stores a collection of books, each containing vast amounts of information from basic life skills to complex magic spells.",
}

const units = ["", "k", "M", "B", "T", "q", "Q", "Sx", "Sp", "Oc"];

const jobTabButton = document.getElementById("jobTabButton")
const cycleOverseerCost = 50
const highTierJobs = ["Holy knight", "Legendary knight", "Wizard", "Master wizard", "Chairman", "Reality Architect", "Flow Regulator"]

function getPatternComprehensionBoost() {
    var pattern = gameData.taskData["Pattern Comprehension"]
    if (!pattern) return 1
    return 1 + 0.05 * Math.log(1 + pattern.level)
}

function getEntropyLongevityBoost() {
    var timeManipulation = gameData.taskData["Time Manipulation"]
    if (!timeManipulation) return 1
    return 1 + 0.02 * Math.log(1 + timeManipulation.level)
}

function getEntropySynergy() {
    if (!isEntropyUnlocked()) return 1
    var pattern = gameData.taskData["Pattern Comprehension"]
    var timeManipulation = gameData.taskData["Time Manipulation"]
    var patternLevel = pattern ? pattern.level : 0
    var timeLevel = timeManipulation ? timeManipulation.level : 0
    var base = 1 + 0.05 * Math.log(1 + patternLevel) + 0.05 * Math.log(1 + timeLevel)
    var almanach = gameData.taskData["Read Almanach"]
    if (almanach) {
        base *= 1 + 0.02 * Math.log(1 + almanach.level)
    }
    base *= getPatternAttunementFactor()
    var uniResonance = getUniverseConfig().patternResonance || 1
    if (gameData.taskData["Pattern Weaving"] && gameData.universeIndex >= 3) {
        base *= 1 + 0.02 * Math.log(1 + gameData.taskData["Pattern Weaving"].level)
    }
    base *= uniResonance
    var compression = getLifeCompressionFactors(true)
    var jitter = 1
    if ((gameData.universeIndex || 1) >= 8) {
        var strain = gameData.cycleStrain || 0
        if (strain > 5) {
            jitter += (Math.random() * 0.05 - 0.025) * Math.min((strain - 5) / 5, 1)
        }
    }
    base *= compression.pattern * jitter
    return base
}

function getPassiveAgeFactor() {
    var age = daysToYears(gameData.days)
    var factor = 0.2
    if (age < 25) factor = 0.2
    else if (age < 35) factor = 0.5
    else if (age < 55) factor = 1
    else factor = 1.2
    factor *= getEntropyLongevityBoost()
    return factor
}

function getFocusMultiplier(activeTask) {
    if (!activeTask) return 1
    var totalLevel = 0
    var count = 0
    for (key in gameData.taskData) {
        var task = gameData.taskData[key]
        if (task == activeTask) continue
        var requirement = gameData.requirements[task.name]
        if (requirement && !requirement.isCompleted()) continue
        totalLevel += task.level
        count += 1
    }
    if (count == 0) return 1
    var avg = totalLevel / count
    return 1 / (1 + Math.log(1 + activeTask.level / (avg + 1)))
}

function getFocusedTask() {
    if (!gameData.entropy.overseer) return null
    if (gameData.entropy.focusTask && gameData.taskData[gameData.entropy.focusTask]) {
        return gameData.taskData[gameData.entropy.focusTask]
    }
    return gameData.currentJob
}

function isCycleOverseerActive() {
    return gameData.entropy.overseer
}

function getBaseLog(x, y) {
    return Math.log(y) / Math.log(x);
}

function isEntropyUnlocked() {
    return gameData.entropy && gameData.entropy.entropyUnlocked
}

function isEntropyFullyUnlocked() {
    return !!(gameData.entropy && gameData.entropy.entropyUnlocked === true)
}

function isEntropyOnlySkill(taskOrName) {
    var name = null
    if (taskOrName) {
        name = taskOrName.name || taskOrName
    }
    if (!name) return false
    for (var i = 0; i < entropyOnlySkillCategories.length; i++) {
        var categoryName = entropyOnlySkillCategories[i]
        var list = skillCategories[categoryName] || entropySkillCategories[categoryName] || []
        if (list.indexOf(name) !== -1) return true
    }
    return false
}

function getEntropyUpgradeLevel(branch, key) {
    if (!gameData.entropyUpgrades || !gameData.entropyUpgrades[branch]) return 0
    return gameData.entropyUpgrades[branch][key] || 0
}

function getEntropyUpgradeMaxLevel(key) {
    return ENTROPY_UPGRADE_MAX_LEVELS[key] || 0
}

function getEntropyUpgradeBaseCost(key) {
    return ENTROPY_UPGRADE_BASE_COST_EP[key] || 0
}

function getEntropyUpgradeCost(branch, key) {
    var currentLevel = getEntropyUpgradeLevel(branch, key)
    var baseCost = getEntropyUpgradeBaseCost(key)
    return Math.floor(baseCost * Math.pow(ENTROPY_UPGRADE_COST_GROWTH, currentLevel))
}

function getEntropyUpgradeBranchTotal(branch) {
    if (!gameData.entropyUpgrades || !gameData.entropyUpgrades[branch]) return 0
    var total = 0
    for (key in gameData.entropyUpgrades[branch]) {
        total += gameData.entropyUpgrades[branch][key] || 0
    }
    return total
}

function getTotalSpentEpOnUpgrades() {
    var total = 0
    var upgradesRoot = gameData.entropyUpgrades || {}
    for (branch in upgradesRoot) {
        var upgrades = upgradesRoot[branch]
        if (!upgrades) continue
        for (key in upgrades) {
            var level = upgrades[key] || 0
            for (var i = 0; i < level; i++) {
                total += Math.floor(getEntropyUpgradeBaseCost(key) * Math.pow(ENTROPY_UPGRADE_COST_GROWTH, i))
            }
        }
    }
    return total
}

function getEffectiveUpgradeMaxLevel(branch, key) {
    var uaLevel = getEntropyUpgradeLevel("meta", "unifiedArchitecture")
    if (key == "unifiedArchitecture") {
        return getEntropyUpgradeMaxLevel(key)
    }
    if (uaLevel > 0) {
        return getEntropyUpgradeMaxLevel(key)
    }
    return Math.min(3, getEntropyUpgradeMaxLevel(key))
}

function canIncreaseEntropyUpgrade(branch, key) {
    var currentLevel = getEntropyUpgradeLevel(branch, key)
    var effectiveMax = getEffectiveUpgradeMaxLevel(branch, key)
    if (currentLevel >= effectiveMax) return false
    if (getEntropyUpgradeLevel("meta", "unifiedArchitecture") === 0 && branch !== "meta") {
        var branchTotal = getEntropyUpgradeBranchTotal(branch)
        if (branchTotal >= ENTROPY_UPGRADE_BRANCH_SOFT_CAP) return false
    }
    return true
}

function getEntropyEarlyLifeMaxAge() {
    if (!isEntropyUnlocked()) return ENTROPY_EARLY_LIFE_MAX_AGE
    var level = getEntropyUpgradeLevel("velocity", "temporalMomentum")
    var compressedFactor = getPatternFactor_CompressedLife_forEarlyWindow()
    return (ENTROPY_EARLY_LIFE_MAX_AGE + level * 2) * compressedFactor
}

function isEntropyEarlyLifeActive() {
    if (!isEntropyUnlocked()) return false
    return daysToYears(gameData.days) <= getEntropyEarlyLifeMaxAge()
}

function getEntropyEarlyXpMult() {
    if (!isEntropyUnlocked()) return 1
    var base = ENTROPY_EARLY_XP_MULT
    var tmLevel = getEntropyUpgradeLevel("velocity", "temporalMomentum")
    var ecLevel = getEntropyUpgradeLevel("velocity", "earlyCompression")
    var tmFactor = 1 + 0.1 * tmLevel
    var ecFactor = 1 + 0.05 * ecLevel
    var mult = base * tmFactor * ecFactor
    if (gameData.entropyArtifacts && gameData.entropyArtifacts.sigilMomentum) {
        mult *= 1.2
    }
    var age = daysToYears(gameData.days)
    var group = getExclusiveGroupChoice("lifeArc")
    if (group === "shortBrilliantLife") mult *= 1.05
    if (group === "longSteadyLife" && age < 40) mult *= 0.95
    var bloom = getExclusiveGroupChoice("bloom")
    if (bloom === "earlyPeak") mult *= 1.05
    if (bloom === "lateBloom") mult *= 0.9
    return mult
}

function isEarlyJob(job) {
    return job instanceof Job && entropyEarlyJobs.includes(job.name)
}

function getEntropyEarlyMoneyMult(jobName) {
    if (!isEntropyUnlocked()) return 1
    if (!entropyEarlyJobs.includes(jobName)) return 1
    var base = ENTROPY_EARLY_MONEY_MULT
    var tmLevel = getEntropyUpgradeLevel("velocity", "temporalMomentum")
    var tmFactor = 1 + 0.1 * tmLevel
    var mult = base * tmFactor
    if (gameData.entropyArtifacts && gameData.entropyArtifacts.sigilMomentum) {
        mult *= 1.2
    }
    return mult
}

function getEntropyEarlyIncomeMultiplier(job) {
    if (!isEntropyEarlyLifeActive()) return 1
    if (!isEarlyJob(job)) return 1
    var mpLevel = getEntropyUpgradeLevel("velocity", "momentumPersistence")
    var mpFactor = 1 + 0.05 * mpLevel
    if (mpLevel > 0 && gameData.entropyArtifacts && gameData.entropyArtifacts.loopAnchor) {
        mpFactor *= 1.5
    }
    return getEntropyEarlyMoneyMult(job.name) * mpFactor
}

function getEntropySkillLevelCompressionMult(task) {
    if (!isEntropyUnlocked()) return 1
    if (!(task instanceof Skill)) return 1
    var levelEC = getEntropyUpgradeLevel("velocity", "earlyCompression")
    if (levelEC == 0) return 1
    var BASE_CAP = 20
    var cap = BASE_CAP + levelEC * 2
    if (task.level >= cap) return 1
    var progress = task.level / cap
    var maxBonus = 0.5
    var bonus = maxBonus * (1 - progress)
    return 1 + bonus
}

function getSpecializationIncomeMultiplier(age) {
    if (!isEntropyUnlocked()) return 1
    var mult = 1
    var lifeArc = getExclusiveGroupChoice("lifeArc")
    if (lifeArc === "shortBrilliantLife") {
        if (age < 40) mult *= 1.08
        else mult *= 0.92
    } else if (lifeArc === "longSteadyLife") {
        if (age < 40) mult *= 0.95
        else mult *= 1.08
    }
    var focus = getExclusiveGroupChoice("focus")
    if (focus === "wealthFocus") mult *= 1.12
    if (focus === "masteryFocus") mult *= 0.92
    var bloom = getExclusiveGroupChoice("bloom")
    if (bloom === "earlyPeak") {
        if (age < 30) mult *= 1.08
        else mult *= 0.92
    } else if (bloom === "lateBloom") {
        if (age < 30) mult *= 0.92
        else if (age > 55) mult *= 1.08
    }
    return mult
}

function getSpecializationXpMultiplier(task, age) {
    if (!isEntropyUnlocked()) return 1
    var mult = 1
    var lifeArc = getExclusiveGroupChoice("lifeArc")
    if (lifeArc === "shortBrilliantLife") {
        if (age < 40) mult *= 1.06
        else mult *= 0.93
    } else if (lifeArc === "longSteadyLife") {
        if (age < 40) mult *= 0.95
        else mult *= 1.07
    }
    var focus = getExclusiveGroupChoice("focus")
    if (focus === "wealthFocus" && task instanceof Skill) mult *= 0.9
    if (focus === "masteryFocus" && task instanceof Skill) mult *= 1.12
    var bloom = getExclusiveGroupChoice("bloom")
    if (bloom === "earlyPeak") {
        if (age < 30) mult *= 1.08
        else mult *= 0.9
    } else if (bloom === "lateBloom") {
        if (age < 30) mult *= 0.9
        else if (age > 55) mult *= 1.1
    }
    return mult
}

function getEntropySwitchThresholdModifier() {
    if (!isEntropyUnlocked()) return 1
    var cpLevel = getEntropyUpgradeLevel("velocity", "chainProgression")
    if (cpLevel == 0) return 1
    return 1 - 0.1 * cpLevel
}

function getArtifactIncomeMultiplier(age) {
    if (!isEntropyUnlocked()) return 1
    var mult = 1
    if (gameData.entropyArtifacts && gameData.entropyArtifacts.sigilMomentum) {
        if (age < 40) mult *= 1.15
        else if (age > 65) mult *= 0.9
    }
    if (gameData.entropyArtifacts && gameData.entropyArtifacts.chainConductor) {
        mult *= 1.02
    }
    if (gameData.entropyArtifacts && gameData.entropyArtifacts.loopAnchor) {
        mult *= 1.05
    }
    return mult
}

function getArtifactXpMultiplier(age) {
    if (!isEntropyUnlocked()) return 1
    var mult = 1
    if (gameData.entropyArtifacts && gameData.entropyArtifacts.sigilMomentum) {
        if (age < 40) mult *= 1.1
        else if (age > 65) mult *= 0.92
    }
    if (gameData.entropyArtifacts && gameData.entropyArtifacts.chainConductor) {
        mult *= 1.02
    }
    if (gameData.entropyArtifacts && gameData.entropyArtifacts.loopAnchor) {
        mult *= 0.98
    }
    return mult
}

function getPassiveArtifactPenalty() {
    if (!isEntropyUnlocked()) return 1
    if (gameData.entropyArtifacts && gameData.entropyArtifacts.loopAnchor) return 0.9
    return 1
}

function getEntropyLongLifeBonusFactor(age) {
    if (!isEntropyUnlocked()) return 1
    var lcLevel = getEntropyUpgradeLevel("stability", "lifeContinuity")
    if (lcLevel == 0) return 1
    var START_AGE = 40
    if (age < START_AGE) return 1
    var maxBonus = 0.3
    var progress = Math.min(Math.max((age - START_AGE) / 40, 0), 1)
    var factor = 1 + maxBonus * (lcLevel / ENTROPY_UPGRADE_MAX_LEVELS["lifeContinuity"]) * progress
    return factor
}

function getEntropyBalancedGrowthFactor() {
    if (!isEntropyUnlocked()) return 1
    var bgLevel = getEntropyUpgradeLevel("stability", "balancedGrowth")
    if (bgLevel == 0) return 1
    var maxBonus = 0.1
    return 1 + maxBonus * (bgLevel / ENTROPY_UPGRADE_MAX_LEVELS["balancedGrowth"])
}

function getEntropySpeedPenaltyFactor() {
    return 1
}

function getPatternLevel(name) {
    if (!gameData.entropyPatterns || !gameData.entropyPatterns.patterns) return 0
    var pattern = gameData.entropyPatterns.patterns[name]
    return pattern && pattern.level ? pattern.level : 0
}

function getPatternFactor_LaborCycle_forMoney() {
    if (!isEntropyUnlocked()) return 1
    var lvl = getPatternLevel("laborCycle")
    var maxBonus = 0.15
    var factor = 1 + maxBonus * (lvl / ENTROPY_PATTERN_MAX_LEVEL)
    factor = 1 + (factor - 1) * getPatternResonatorFactor() * getPatternAttunementFactor() * getUniversePatternAmplification()
    factor *= getDominantPatternBoost("laborCycle")
    return factor
}

function getPatternFactor_ScholarLoop_forXp() {
    if (!isEntropyUnlocked()) return 1
    var lvl = getPatternLevel("scholarLoop")
    var maxBonus = 0.15
    var factor = 1 + maxBonus * (lvl / ENTROPY_PATTERN_MAX_LEVEL)
    factor = 1 + (factor - 1) * getPatternResonatorFactor() * getPatternAttunementFactor() * getUniversePatternAmplification()
    factor *= getDominantPatternBoost("scholarLoop")
    return factor
}

function getPatternFactor_CompressedLife_forEarlyWindow() {
    if (!isEntropyUnlocked()) return 1
    var lvl = getPatternLevel("compressedLife")
    var maxBonus = 0.25
    var factor = 1 + maxBonus * (lvl / ENTROPY_PATTERN_MAX_LEVEL)
    factor = 1 + (factor - 1) * getPatternResonatorFactor() * getPatternAttunementFactor() * getUniversePatternAmplification()
    factor *= getDominantPatternBoost("compressedLife")
    return factor
}

function getPatternFactor_StableCycle_forStability() {
    if (!isEntropyUnlocked()) return 1
    var lvl = getPatternLevel("stableCycle")
    var maxBonus = 0.15
    var factor = 1 + maxBonus * (lvl / ENTROPY_PATTERN_MAX_LEVEL)
    factor = 1 + (factor - 1) * getPatternResonatorFactor() * getPatternAttunementFactor() * getUniversePatternAmplification()
    factor *= getDominantPatternBoost("stableCycle")
    return factor
}

function getPatternFactor_Opportunist_forAutoSwitch() {
    if (!isEntropyUnlocked()) return 1
    var lvl = getPatternLevel("opportunist")
    var maxReduction = 0.3
    var factor = 1 - maxReduction * (lvl / ENTROPY_PATTERN_MAX_LEVEL)
    if (factor < 0.05) factor = 0.05
    factor = 1 - (1 - factor) * getPatternResonatorFactor() * getPatternAttunementFactor() * getUniversePatternAmplification()
    factor *= getDominantPatternBoost("opportunist")
    return factor
}

function getLifeStats() {
    ensureEntropyPatternsState()
    return gameData.entropyPatterns.lifeStats
}

function recordXpGainForPatterns(amount, task) {
    if (gameData.entropy && gameData.entropy.unifiedArchitecture) return
    if (!task || !(task instanceof Skill)) return
    var modifier = getInertiaPenalty()
    var lifeStats = getLifeStats()
    lifeStats.totalXpThisLife += Math.max(0, amount * modifier || 0)
}

function recordIncomeForPatterns(amount) {
    if (gameData.entropy && gameData.entropy.unifiedArchitecture) return
    var modifier = getInertiaPenalty()
    var lifeStats = getLifeStats()
    lifeStats.totalIncomeThisLife += Math.max(0, amount * modifier || 0)
    if ((gameData.universeIndex || 1) >= 4) {
        addBurnout(0.01)
    }
    if ((gameData.universeIndex || 1) >= 8) {
        var strain = gameData.cycleStrain || 0
        if (strain > 10) {
            gameData.cycleStrain = Math.min(20, gameData.cycleStrain + 0.05)
        }
    }
}

function checkForcedRebirth() {
    if (isObserverMode()) return
    if ((gameData.universeIndex || 1) < 8) return
    var strain = gameData.cycleStrain || 0
    if (strain >= 18) {
        alert(tUi("story_cycle_collapse"))
        rebirthOne()
    }
}

function recordLifeTickParticipation() {
    if (gameData.entropy && gameData.entropy.unifiedArchitecture) return
    var lifeStats = getLifeStats()
    lifeStats.currentLifeTicks += 1
    if (gameData.autoSwitchJobs || gameData.autoSwitchSkills) {
        lifeStats.autoSwitchUsed = true
    }
    if (gameData.currentJob instanceof Job) {
        lifeStats.ticksInJobs += 1
        if ((gameData.universeIndex || 1) >= 4 && highTierJobs.includes(gameData.currentJob.name)) {
            addBurnout(0.003)
        }
    }
    if (gameData.currentSkill instanceof Skill) {
        lifeStats.ticksInSkills += 1
    }
}

function getEntropyStabilityFactor() {
    if (!isEntropyUnlocked()) return 1
    var esLevel = getEntropyUpgradeLevel("stability", "entropyStability")
    return 1 + 0.02 * esLevel
}

function getStabilizationSmoothingFactor() {
    if (!isEntropyUnlocked()) return 1
    var level = getEntropyUpgradeLevel("stability", "smoothing")
    if (level <= 0) return 1
    return 1 + 0.005 * Math.pow(level, 0.7)
}

function getQuietMindComfortBoost() {
    if (!isEntropyUnlocked()) return 1
    var level = getEntropyUpgradeLevel("stability", "quietMind")
    if (level <= 0) return 1
    return 1 + 0.01 * Math.pow(level, 0.7)
}

function getPatternAttunementFactor() {
    if (!isEntropyUnlocked()) return 1
    var level = getEntropyUpgradeLevel("stability", "patternAttunement")
    if (level <= 0) return 1
    return 1 + 0.01 * Math.pow(level, 0.7)
}

function getPatternResonatorFactor() {
    if (!isEntropyUnlocked()) return 1
    if (!gameData.entropyUpgrades || !gameData.entropyUpgrades.meta || !gameData.entropyUpgrades.meta.unifiedArchitecture) return 1
    if (!gameData.entropyArtifacts || !gameData.entropyArtifacts.patternResonator) return 1
    return 1.2
}

function getEntropyUpgradeDefinition(branch, key) {
    return ENTROPY_UPGRADE_DEFINITIONS[branch] && ENTROPY_UPGRADE_DEFINITIONS[branch][key] ? ENTROPY_UPGRADE_DEFINITIONS[branch][key] : null
}

function getExclusiveGroupId(branch, key) {
    var def = getEntropyUpgradeDefinition(branch, key)
    return def && def.exclusiveGroupId ? def.exclusiveGroupId : null
}

function getExclusiveGroupChoice(groupId, skipKey) {
    if (!groupId) return null
    for (var branch in ENTROPY_UPGRADE_DEFINITIONS) {
        var upgrades = ENTROPY_UPGRADE_DEFINITIONS[branch]
        for (var key in upgrades) {
            if (key === skipKey) continue
            var def = upgrades[key]
            if (def && def.exclusiveGroupId === groupId) {
                if (getEntropyUpgradeLevel(branch, key) > 0) return key
            }
        }
    }
    return null
}

function meetsUnifiedArchitectureRequirements() {
    var hasVelocity = getEntropyUpgradeBranchTotal("velocity") > 0
    var hasStability = getEntropyUpgradeBranchTotal("stability") > 0
    var spent = getTotalSpentEpOnUpgrades()
    return hasVelocity && hasStability && spent >= 20
}

function meetsExtraEntropyUpgradeRequirements(branch, key) {
    var totalRebirths = gameData.rebirthOneCount + gameData.rebirthTwoCount
    if (key === "smoothing" || key === "quietMind" || key === "patternAttunement") {
        if (totalRebirths < 4) return false
        if (getEntropyUpgradeBranchTotal("stability") < 3) return false
    }
    if (key === "patternAttunement") {
        var totalPatternLevel = getPatternLevel("laborCycle") + getPatternLevel("scholarLoop") + getPatternLevel("compressedLife") + getPatternLevel("stableCycle") + getPatternLevel("opportunist")
        if (totalPatternLevel < 8) return false
    }
    return true
}

function getOwnedArtifactCount() {
    ensureEntropyArtifactsState()
    var count = 0
    for (var key in gameData.entropyArtifacts) {
        if (gameData.entropyArtifacts[key]) count += 1
    }
    return count
}

function buyEntropyArtifact(key) {
    if (!isEntropyUnlocked()) return false
    if (gameData.entropy && gameData.entropy.unifiedArchitecture) return false
    ensureEntropyArtifactsState()
    var valid = ["sigilMomentum", "chainConductor", "loopAnchor", "patternResonator"]
    if (valid.indexOf(key) === -1) return false
    if (gameData.entropyArtifacts[key]) return false
    if (getOwnedArtifactCount() >= 2) return false
    if (key == "patternResonator") {
        if (!gameData.entropyUpgrades || !gameData.entropyUpgrades.meta || gameData.entropyUpgrades.meta.unifiedArchitecture !== 1) return false
    }
    var totalRebirths = gameData.rebirthOneCount + gameData.rebirthTwoCount
    var totalPatternLevel = getPatternLevel("laborCycle") + getPatternLevel("scholarLoop") + getPatternLevel("compressedLife") + getPatternLevel("stableCycle") + getPatternLevel("opportunist")
    if (key === "sigilMomentum" && totalRebirths < 2) return false
    if (key === "chainConductor" && totalRebirths < 3) return false
    if (key === "loopAnchor" && totalPatternLevel < 6) return false
    if (key === "patternResonator" && totalPatternLevel < 10) return false
    var cost = ENTROPY_ARTIFACT_COST_EP[key]
    if (gameData.entropy.EP < cost) return false
    gameData.entropy.EP -= cost
    gameData.entropyArtifacts[key] = true
    saveGameData()
    updateArtifactUI()
    return true
}

function buyEntropyUpgrade(branch, key) {
    if (!isEntropyUnlocked()) return false
    if (gameData.entropy && gameData.entropy.unifiedArchitecture) return false
    ensureEntropyUpgradesState()
    if (!ENTROPY_UPGRADE_MAX_LEVELS[key]) return false
    if (!gameData.entropyUpgrades[branch] || gameData.entropyUpgrades[branch][key] === undefined) return false

    var currentLevel = getEntropyUpgradeLevel(branch, key)
    var absoluteMax = getEntropyUpgradeMaxLevel(key)
    if (currentLevel >= absoluteMax) return false

    if (key == "unifiedArchitecture") {
        if (currentLevel >= 1) return false
        if (!meetsUnifiedArchitectureRequirements()) return false
    }

    var groupId = getExclusiveGroupId(branch, key)
    var chosen = getExclusiveGroupChoice(groupId, key)
    if (groupId && chosen && chosen !== key) return false

    if (!meetsExtraEntropyUpgradeRequirements(branch, key)) return false

    if (!canIncreaseEntropyUpgrade(branch, key)) return false

    var cost = getEntropyUpgradeCost(branch, key)
    if (gameData.entropy.EP < cost) return false

    gameData.entropy.EP -= cost
    gameData.entropyUpgrades[branch][key] = currentLevel + 1
    if (key == "unifiedArchitecture") {
        gameData.entropy.unifiedArchitecture = true
        if (gameData.universeTokens === undefined) gameData.universeTokens = 0
        gameData.universeTokens += 1
        alert(tUi("story_stabilized"))
    }
    saveGameData()
    updateEntropyUpgradeUI()
    return true
}

function getBindedTaskEffect(taskName) {
    var task = gameData.taskData[taskName]
    return task.getEffect.bind(task)
}

function getBindedItemEffect(itemName) {
    var item = gameData.itemData[itemName]
    return item.getEffect.bind(item)
}

function addMultipliers() {
    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]

        task.xpMultipliers = []
        if (task instanceof Job) task.incomeMultipliers = []

        task.xpMultipliers.push(task.getMaxLevelMultiplier.bind(task))
        task.xpMultipliers.push(getHappiness)
        task.xpMultipliers.push(getBindedTaskEffect("Dark influence"))
        task.xpMultipliers.push(getBindedTaskEffect("Demon training"))
        if (gameData.taskData["Self-Awareness of the Cycle"]) {
            task.xpMultipliers.push(getBindedTaskEffect("Self-Awareness of the Cycle"))
        }
        task.xpMultipliers.push(function() {
            return isEntropyEarlyLifeActive() ? getEntropyEarlyXpMult() : 1
        })
        task.xpMultipliers.push(function() {
            var age = daysToYears(gameData.days)
            return getSpecializationXpMultiplier(task, age) * getArtifactXpMultiplier(age)
        })
        task.xpMultipliers.push(getInertiaPenalty)
        task.xpMultipliers.push(function() {
            var age = daysToYears(gameData.days)
            return getAgePerformanceFactor(age) * getAgeSkillFactor(age) * getBurnoutPenalty()
        })
        task.xpMultipliers.push(getMeaningEfficiencyFactor)
        task.xpMultipliers.push(function() { return getUniverseConfig().xpFactor })
        task.xpMultipliers.push(getUniverseModifier)
        task.xpMultipliers.push(function() { return getEntropySkillLevelCompressionMult(task) })
        task.xpMultipliers.push(function() { return getEntropyLongLifeBonusFactor(daysToYears(gameData.days)) })
        task.xpMultipliers.push(getEntropyStabilityFactor)
        task.xpMultipliers.push(getEntropyBalancedGrowthFactor)
        task.xpMultipliers.push(getPatternFactor_ScholarLoop_forXp)
        task.xpMultipliers.push(getPatternFactor_StableCycle_forStability)

        if (task instanceof Job) {
            task.incomeMultipliers.push(task.getLevelMultiplier.bind(task))
            task.incomeMultipliers.push(getBindedTaskEffect("Demon's wealth"))
            task.incomeMultipliers.push(function() { return getEntropyEarlyIncomeMultiplier(task) })
            task.incomeMultipliers.push(function() {
                var age = daysToYears(gameData.days)
                return getSpecializationIncomeMultiplier(age) * getArtifactIncomeMultiplier(age) * getStabilizationSmoothingFactor() * getAgePerformanceFactor(age) * getBurnoutPenalty()
            })
            task.incomeMultipliers.push(getInertiaPenalty)
            task.incomeMultipliers.push(getMeaningEfficiencyFactor)
            task.incomeMultipliers.push(function() { return getUniverseConfig().moneyFactor })
            task.incomeMultipliers.push(getUniverseModifier)
            task.incomeMultipliers.push(getPatternFactor_LaborCycle_forMoney)
            task.xpMultipliers.push(getBindedTaskEffect("Productivity"))
            task.xpMultipliers.push(getBindedItemEffect("Personal squire"))    
        } else if (task instanceof Skill) {
            task.xpMultipliers.push(getBindedTaskEffect("Concentration"))
            task.xpMultipliers.push(getBindedItemEffect("Book"))
            task.xpMultipliers.push(getBindedItemEffect("Study desk"))
            task.xpMultipliers.push(getBindedItemEffect("Library"))
        }

        if (jobCategories["Military"].includes(task.name)) {
            task.incomeMultipliers.push(getBindedTaskEffect("Strength"))
            task.xpMultipliers.push(getBindedTaskEffect("Battle tactics"))
            task.xpMultipliers.push(getBindedItemEffect("Steel longsword"))
        } else if (task.name == "Strength") {
            task.xpMultipliers.push(getBindedTaskEffect("Muscle memory"))
            task.xpMultipliers.push(getBindedItemEffect("Dumbbells"))
        } else if (skillCategories["Magic"].includes(task.name)) {
            task.xpMultipliers.push(getBindedItemEffect("Sapphire charm"))
        } else if (jobCategories["The Arcane Association"].includes(task.name)) {
            task.xpMultipliers.push(getBindedTaskEffect("Mana control"))
        } else if (skillCategories["Dark magic"].includes(task.name)) {
            task.xpMultipliers.push(getEvil)
        }

        if (task instanceof Job && highTierJobs.includes(task.name) && gameData.taskData["Reality Architecture"]) {
            if (!realityArchitectureEffect) {
                realityArchitectureEffect = getBindedTaskEffect("Reality Architecture")
            }
            task.xpMultipliers.push(realityArchitectureEffect)
        }
    }

    for (itemName in gameData.itemData) {
        var item = gameData.itemData[itemName]
        item.expenseMultipliers = []
        item.expenseMultipliers.push(getBindedTaskEffect("Bargaining"))
        item.expenseMultipliers.push(getBindedTaskEffect("Intimidation"))
    }
}

function setCustomEffects() {
    var bargaining = gameData.taskData["Bargaining"]
    bargaining.getEffect = function() {
        var multiplier = 1 - getBaseLog(7, bargaining.level + 1) / 10
        if (multiplier < 0.1) {multiplier = 0.1}
        return multiplier
    }

    var intimidation = gameData.taskData["Intimidation"]
    intimidation.getEffect = function() {
        var multiplier = 1 - getBaseLog(7, intimidation.level + 1) / 10
        if (multiplier < 0.1) {multiplier = 0.1}
        return multiplier
    }

    var timeWarping = gameData.taskData["Time warping"]
    timeWarping.getEffect = function() {
        var multiplier = 1 + getBaseLog(13, timeWarping.level + 1)
        // Temporary testing override: force a baseline warp speed
        if (multiplier < 100) multiplier = 100
        return multiplier
    }

    var immortality = gameData.taskData["Immortality"]
    immortality.getEffect = function() {
        var multiplier = 1 + getBaseLog(33, immortality.level + 1) 
        return multiplier
    }

    var readAlmanach = gameData.taskData["Read Almanach"]
    if (readAlmanach) {
        readAlmanach.getEffect = function() {
            return 1 + 0.01 * Math.pow(this.level + 1, 0.6)
        }
    }

    var patternComprehension = gameData.taskData["Pattern Comprehension"]
    if (patternComprehension) {
        patternComprehension.getEffect = function() {
            return 1 + 0.02 * Math.log(1 + this.level)
        }
    }

    var patternWeaving = gameData.taskData["Pattern Weaving"]
    if (patternWeaving) {
        patternWeaving.getEffect = function() {
            var base = 1 + 0.02 * Math.log(1 + this.level)
            if ((gameData.universeIndex || 1) >= 3) {
                base *= 1.05
            }
            return base
        }
    }

    var lifeDecision = gameData.taskData["Life Decision"]
    if (lifeDecision) {
        lifeDecision.getEffect = function() {
            var choices = gameData.majorChoicesUsed || 0
            return 1 + 0.01 * Math.log(1 + this.level) + 0.01 * Math.log(1 + choices)
        }
    }

    var entropyTimeManipulation = gameData.taskData["Time Manipulation"]
    if (entropyTimeManipulation) {
        entropyTimeManipulation.getEffect = function() {
            return 1 + 0.02 * Math.log(1 + this.level)
        }
    }

    var realityArchitecture = gameData.taskData["Reality Architecture"]
    if (realityArchitecture) {
        realityArchitecture.getEffect = function() {
            return 1 + 0.03 * Math.log(1 + this.level)
        }
    }

    var selfAwareness = gameData.taskData["Self-Awareness of the Cycle"]
    if (selfAwareness) {
        selfAwareness.getEffect = function() {
            var rebirths = gameData.rebirthOneCount + gameData.rebirthTwoCount + gameData.entropy.seeds
            var awareness = 1 + this.baseData.effect * this.level
            return awareness * (1 + 0.01 * Math.log(1 + rebirths))
        }
    }
}

function getHappiness() {
    var meditationEffect = getBindedTaskEffect("Meditation")
    var butlerEffect = getBindedItemEffect("Butler")
    var happiness = meditationEffect() * butlerEffect() * gameData.currentProperty.getEffect()
    var almanach = gameData.taskData["Read Almanach"]
    if (almanach && !isEntropyUnlocked()) {
        var calmBonus = 1 + 0.01 * Math.log(1 + almanach.level)
        if (calmBonus > 1.05) calmBonus = 1.05
        happiness *= calmBonus
    }
    happiness *= getQuietMindComfortBoost()
    if (gameData.entropyArtifacts && gameData.entropyArtifacts.chainConductor) {
        happiness *= 1.05
    }
    happiness *= getUniverseConfig().happinessFactor
    happiness *= getAgeHappinessFactor(daysToYears(gameData.days))
    happiness *= getBurnoutPenalty()
    happiness *= getMeaningHappinessFactor()
    return happiness
}

function getEvil() {
    return gameData.evil
}

function applyMultipliers(value, multipliers) {
    var finalMultiplier = 1
    multipliers.forEach(function(multiplierFunction) {
        var multiplier = multiplierFunction()
        finalMultiplier *= multiplier
    })
    var finalValue = Math.round(value * finalMultiplier)
    return finalValue
}

function applySpeed(value) {
    finalValue = value * getGameSpeed() / updateSpeed
    return finalValue
}

function registerTaskSwitch(type, oldName, newName) {
    if ((gameData.universeIndex || 1) < 3) return
    if (!oldName || !newName || oldName == newName) return
    universeSwitchPenalty = Math.min(universeSwitchPenalty + 1, 12)
    if (type == "job") lastJobName = newName
    if (type == "skill") lastSkillName = newName
}

function decaySwitchPenalty() {
    if (universeSwitchPenalty > 0) {
        universeSwitchPenalty -= 0.02
        if (universeSwitchPenalty < 0) universeSwitchPenalty = 0
    }
}

function getInertiaPenalty() {
    if ((gameData.universeIndex || 1) < 3) return 1
    var penalty = 1 - 0.03 * universeSwitchPenalty
    if (penalty < 0.7) penalty = 0.7
    var weave = gameData.taskData["Pattern Weaving"]
    var buffer = weave ? 0.02 * Math.log(1 + weave.level) : 0
    penalty = penalty * (1 + buffer)
    if (penalty > 1) penalty = 1
    var orchestrate = gameData.taskData["Life Orchestration"]
    if (orchestrate && (gameData.universeIndex || 1) >= 5) {
        penalty *= 1 + 0.02 * Math.log(1 + orchestrate.level)
        if (penalty > 1) penalty = 1
    }
    return penalty
}

function decayBurnout() {
    if ((gameData.universeIndex || 1) < 4) return
    if (gameData.burnoutLevel > 0) {
        gameData.burnoutLevel -= 0.015
        if (gameData.burnoutLevel < 0) gameData.burnoutLevel = 0
    }
}

function addBurnout(amount) {
    if ((gameData.universeIndex || 1) < 4) return
    gameData.burnoutLevel = Math.min(gameData.burnoutLevel + amount, 10)
}

function getBurnoutPenalty() {
    if ((gameData.universeIndex || 1) < 4) return 1
    var penalty = 1 - 0.02 * gameData.burnoutLevel
    if (penalty < 0.75) penalty = 0.75
    var maintenance = gameData.taskData["Body Maintenance"]
    if (maintenance) {
        penalty *= 1 + 0.02 * Math.log(1 + maintenance.level)
        if (penalty > 1) penalty = 1
    }
    if ((gameData.universeIndex || 1) >= 9) penalty *= (gameData.metaWeights ? gameData.metaWeights.burnout || 1 : 1)
    return penalty
}

function getLifeCompressionFactors(isActive) {
    if ((gameData.universeIndex || 1) < 5) return {age: 1, xp: 1, money: 1, pattern: 1}
    var cfg = getUniverseConfig()
    if (!cfg.lifeCompressionEnabled) return {age: 1, xp: 1, money: 1, pattern: 1}
    var age = daysToYears(gameData.days)
    var phase = getLifePhase(age)
    var phaseBoost = phase == "early" ? 1.05 : phase == "mid" ? 1 : 0.95
    var idleAge = 1.2
    var idleGain = 0.7
    var activeAge = 1
    var activeGain = 1.12
    var ageFactor = isActive ? activeAge : idleAge
    var xpFactor = (isActive ? activeGain : idleGain) * phaseBoost
    var moneyFactor = (isActive ? activeGain : idleGain) * phaseBoost
    var patternFactor = (isActive ? activeGain : idleGain) * phaseBoost
    var orchestrate = gameData.taskData["Life Orchestration"]
    if (orchestrate && isActive) {
        var boost = 1 + 0.02 * Math.log(1 + orchestrate.level)
        xpFactor *= boost
        moneyFactor *= boost
        patternFactor *= boost
    }
    var metaCompression = (gameData.universeIndex || 1) >= 9 ? (gameData.metaWeights ? gameData.metaWeights.compression || 1 : 1) : 1
    return {age: ageFactor * metaCompression, xp: xpFactor * metaCompression, money: moneyFactor * metaCompression, pattern: patternFactor * metaCompression}
}

function getUniversePatternAmplification() {
    var cfg = getUniverseConfig()
    var u = gameData.universeIndex || 1
    if (u < 3) return 1
    var total = getPatternLevel("laborCycle") + getPatternLevel("scholarLoop") + getPatternLevel("compressedLife") + getPatternLevel("stableCycle") + getPatternLevel("opportunist")
    var avg = total / (ENTROPY_PATTERN_MAX_LEVEL * 5)
    var resonance = cfg.patternResonance || 1
    var factor = 1 + (resonance - 1) * avg
    if ((gameData.universeIndex || 1) >= 9) factor *= (gameData.metaWeights ? gameData.metaWeights.patterns || 1 : 1)
    return factor
}

function getDominantPatternBoost(name) {
    if ((gameData.universeIndex || 1) < 3) return 1
    if (!gameData.entropyPatterns || !gameData.entropyPatterns.dominantMemory) return 1
    var mem = gameData.entropyPatterns.dominantMemory
    if (!mem.name || mem.name !== name) return 1
    var ticks = gameData.entropyPatterns.lifeStats ? (gameData.entropyPatterns.lifeStats.currentLifeTicks || 0) : 0
    var window = 2000
    if (ticks > window) return 1
    var strength = (window - ticks) / window
    return 1 + 0.1 * strength
}

function updateDominantPatternMemory() {
    if (!gameData.entropyPatterns || !gameData.entropyPatterns.patterns) return
    var dominant = null
    var highest = -1
    for (var key in gameData.entropyPatterns.patterns) {
        var lvl = gameData.entropyPatterns.patterns[key].level || 0
        if (lvl > highest) {
            highest = lvl
            dominant = key
        }
    }
    gameData.entropyPatterns.dominantMemory = {name: dominant, level: highest}
}

function getUniverseModifier() {
    var u = gameData.universeIndex ? gameData.universeIndex : 1
    var delta = u - 1
    return 1 + 0.05 * delta * delta
}

function formatUniverseIndex() {
    var idx = gameData.universeIndex || 1
    if (idx - 1 < ROMAN_NUMERALS.length) {
        return ROMAN_NUMERALS[idx - 1]
    }
    return idx.toString()
}

function getUniverseTimeWarpFactor() {
    return getUniverseModifier() * getUniverseConfig().extraTimeWarpFactor
}

function getLifePhase(age) {
    if (age < 18) return "childhood"
    if (age < 30) return "early"
    if (age < 50) return "mid"
    return "late"
}

function getMajorChoiceLimit() {
    if ((gameData.universeIndex || 1) < 6) return Infinity
    return gameData.majorChoiceSlotsTotal || 4
}

function isMajorChoiceTask(taskName) {
    var task = gameData.taskData[taskName]
    return task && task.isMajorChoice === true
}

function isTaskExclusiveAvailable(taskName) {
    if ((gameData.universeIndex || 1) < 6) return true
    var task = gameData.taskData[taskName]
    if (!task || !task.exclusiveGroupId) return true
    var chosen = gameData.majorChoicesChosen && gameData.majorChoicesChosen[task.exclusiveGroupId]
    if (chosen && chosen !== taskName) return false
    return true
}

function isMajorChoiceAvailableForTask(taskName) {
    if ((gameData.universeIndex || 1) < 6) return true
    if (!isMajorChoiceTask(taskName)) return true
    if (gameData.majorChoicesChosen && gameData.majorChoicesChosen[taskName]) return true
    return (gameData.majorChoicesUsed || 0) < getMajorChoiceLimit()
}

function registerMajorChoice(task) {
    if (!task) return true
    if ((gameData.universeIndex || 1) < 6) return true
    if (!isMajorChoiceTask(task.name)) return true
    if (!isTaskExclusiveAvailable(task.name)) return false
    if (gameData.majorChoicesChosen && gameData.majorChoicesChosen[task.name]) return true
    var used = gameData.majorChoicesUsed || 0
    if (used >= getMajorChoiceLimit()) return false
    if (!gameData.majorChoicesChosen) gameData.majorChoicesChosen = {}
    if (task.exclusiveGroupId) {
        var chosen = gameData.majorChoicesChosen[task.exclusiveGroupId]
        if (chosen && chosen !== task.name) return false
        gameData.majorChoicesChosen[task.exclusiveGroupId] = task.name
    }
    gameData.majorChoicesChosen[task.name] = true
    gameData.majorChoicesUsed = used + 1
    return true
}

function getMeaningTag(entity) {
    if (!entity) return "neutral"
    return entity.meaningTag || "neutral"
}

function getMeaningEfficiencyFactor() {
    if ((gameData.universeIndex || 1) < 7) return 1
    var m = gameData.meaning || 0
    var low = 0.85 + 0.15 * Math.min(m, 50) / 50
    var weight = (gameData.universeIndex || 1) >= 9 ? (gameData.metaWeights ? gameData.metaWeights.meaning || 1 : 1) : 1
    return low * weight
}

function getMeaningHappinessFactor() {
    if ((gameData.universeIndex || 1) < 7) return 1
    var m = gameData.meaning || 0
    var base = 0.9 + 0.2 * Math.min(m, 60) / 60
    if ((gameData.universeIndex || 1) >= 9) base *= (gameData.metaWeights ? gameData.metaWeights.meaning || 1 : 1)
    return base
}

function getMeaningGainMultiplier() {
    if ((gameData.universeIndex || 1) < 7) return 0
    var mult = 1
    var insight = gameData.taskData["Existential Insight"]
    if (insight) {
        mult += 0.02 * Math.log(1 + insight.level)
    }
    var meta = gameData.taskData["Meta Tuning"]
    if (meta && (gameData.universeIndex || 1) >= 9) {
        mult += 0.01 * Math.log(1 + meta.level)
    }
    return mult
}

function updateMeaning() {
    if ((gameData.universeIndex || 1) < 7) return
    var jobTag = getMeaningTag(gameData.currentJob)
    var skillTag = getMeaningTag(gameData.currentSkill)
    var meaningful = jobTag === "meaningful" || skillTag === "meaningful"
    var utilitarian = jobTag === "utilitarian" || skillTag === "utilitarian"
    var delta = 0
    var mult = getMeaningGainMultiplier()
    if (meaningful) {
        delta += 0.05 * mult
    } else if (utilitarian) {
        delta -= 0.03
    } else {
        delta -= 0.01
    }
    gameData.meaning = Math.max(0, Math.min(100, gameData.meaning + delta))
    if (gameData.meaning >= 10 && !gameData.meaningMilestones["10"]) {
        gameData.meaningMilestones["10"] = true
        alert(tUi("story_meaning_spark"))
    }
    if (gameData.meaning >= 30 && !gameData.meaningMilestones["30"]) {
        gameData.meaningMilestones["30"] = true
        alert(tUi("story_meaning_anchored"))
    }

    if ((gameData.universeIndex || 1) >= 9) {
        var stable = universeSwitchPenalty < 2 && (burnoutLevel || 0) < 2 && (gameData.cycleStrain || 0) < 5
        if (stable) {
            gameData.metaAwareness = Math.min(100, gameData.metaAwareness + 0.02 * getMeaningGainMultiplier())
        } else if ((gameData.cycleStrain || 0) > 12) {
            gameData.metaAwareness = Math.max(0, gameData.metaAwareness - 0.05)
        }
    }
}

function getCycleStewardEffect() {
    var steward = gameData.taskData["Cycle Steward"]
    if (!steward || (gameData.universeIndex || 1) < 8) return 0
    return 0.02 * Math.log(1 + steward.level)
}

function getMetaTuningEffect() {
    var tuning = gameData.taskData["Meta Tuning"]
    if (!tuning || (gameData.universeIndex || 1) < 9) return 0
    return 0.01 * Math.log(1 + tuning.level)
}

function updateCycleStrain() {
    if ((gameData.universeIndex || 1) < 8) return
    var age = daysToYears(gameData.days)
    var happiness = getHappiness()
    var burn = burnoutLevel || 0
    var meaning = gameData.meaning || 0
    var delta = 0
    if (age > 60) delta += 0.05 * (age - 60) / 10
    if (happiness < 0.9) delta += 0.1 * (0.9 - happiness)
    if (burn > 3) delta += 0.03 * (burn - 3)
    if ((gameData.universeIndex || 1) >= 7 && meaning < 5 && (gameData.coins || 0) > 1e6) {
        delta += 0.05
    }
    if (delta < 0) delta = 0
    var decay = 0.05
    if (happiness > 1.1) decay += 0.05
    if (burn < 1) decay += 0.02
    decay += getCycleStewardEffect()
    decay += getMetaTuningEffect()
    gameData.cycleStrain = Math.max(0, Math.min(20, gameData.cycleStrain + delta - decay * 0.1))
}

function getMetaWeight(key) {
    if ((gameData.universeIndex || 1) < 9) return 1
    return gameData.metaWeights && gameData.metaWeights[key] ? gameData.metaWeights[key] : 1
}

function getMetaTuningChargeLimit() {
    if ((gameData.universeIndex || 1) < 9) return 0
    var base = 1
    base += Math.floor((gameData.metaAwareness || 0) / 20)
    var tuning = gameData.taskData["Meta Tuning"]
    if (tuning) base += Math.floor(tuning.level / 10)
    if (base > 3) base = 3
    return base
}

function tryMetaTune() {
    if ((gameData.universeIndex || 1) < 9) return
    var limit = getMetaTuningChargeLimit()
    if (gameData.metaTunesSpent >= limit) return
    var step = 0.05
    var maxWeight = 1.3
    var minWeight = 0.7
    var adjust = function(key, delta) {
        var current = getMetaWeight(key)
        var next = Math.min(maxWeight, Math.max(minWeight, current + delta))
        gameData.metaWeights[key] = next
    }
    adjust("patterns", step)
    adjust("meaning", step)
    adjust("aging", -step)
    adjust("burnout", -step)
    adjust("cycle", -step / 2)
    gameData.metaTunesSpent += 1
}

function getAgePerformanceFactor(age) {
    if ((gameData.universeIndex || 1) < 4) return 1
    var youthBoost = age < 30 ? 1 + (30 - age) * 0.01 : 1
    if (youthBoost > 1.2) youthBoost = 1.2
    var midDrop = age > 45 ? Math.max(0.85, 1 - (age - 45) * 0.01) : 1
    var lateDrop = age > 65 ? Math.max(0.65, 1 - (age - 65) * 0.02) : 1
    var factor = youthBoost * Math.min(midDrop, lateDrop)
    if ((gameData.universeIndex || 1) >= 9) factor *= (gameData.metaWeights ? gameData.metaWeights.aging || 1 : 1)
    return factor
}

function getAgeSkillFactor(age) {
    if ((gameData.universeIndex || 1) < 4) return 1
    var factor = age < 50 ? 1 : Math.max(0.7, 1 - (age - 50) * 0.01)
    var maintenance = gameData.taskData["Body Maintenance"]
    if (maintenance) {
        factor *= 1 + 0.02 * Math.log(1 + maintenance.level)
        if (factor > 1) factor = 1
    }
    if ((gameData.universeIndex || 1) >= 9) factor *= (gameData.metaWeights ? gameData.metaWeights.aging || 1 : 1)
    return factor
}

function getAgeHappinessFactor(age) {
    if ((gameData.universeIndex || 1) < 4) return 1
    if (age < 40) return 1
    var f = Math.max(0.8, 1 - (age - 40) * 0.005)
    if ((gameData.universeIndex || 1) >= 9) f *= (gameData.metaWeights ? gameData.metaWeights.aging || 1 : 1)
    return f
}

function getEvilGain() {
    var evilControl = gameData.taskData["Evil control"]
    var bloodMeditation = gameData.taskData["Blood meditation"]
    var evil = evilControl.getEffect() * bloodMeditation.getEffect()
    return evil
}

function getGameSpeed() {
    var timeWarping = gameData.taskData["Time warping"]
    var timeWarpingSpeed = gameData.timeWarpingEnabled ? timeWarping.getEffect() * getUniverseTimeWarpFactor() : 1
    var gameSpeed = baseGameSpeed * +!gameData.paused * +isAlive() * timeWarpingSpeed
    return gameSpeed
}

function applyExpenses() {
    var coins = applySpeed(getExpense())
    gameData.coins -= coins
    if (gameData.coins < 0) {    
        goBankrupt()
    }
}

function getExpense() {
    var expense = 0
    expense += gameData.currentProperty.getExpense()
    for (misc of gameData.currentMisc) {
        expense += misc.getExpense()
    }
    return expense * getUniverseConfig().costFactor
}

function goBankrupt() {
    gameData.coins = 0
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []
}

function setTab(element, selectedTab) {

    var tabs = Array.prototype.slice.call(document.getElementsByClassName("tab"))
    tabs.forEach(function(tab) {
        tab.style.display = "none"
    })
    document.getElementById(selectedTab).style.display = "block"
    if (selectedTab === "shop") {
        updateItemRows()
        updateShopRecommendation()
    }

    var tabButtons = document.getElementsByClassName("tabButton")
    for (tabButton of tabButtons) {
        tabButton.classList.remove("w3-blue-gray")
    }
    element.classList.add("w3-blue-gray")
}

function setPause() {
    gameData.paused = !gameData.paused
}

function setTimeWarping() {
    gameData.timeWarpingEnabled = !gameData.timeWarpingEnabled
}

function moveToNextUniverse() {
    if (!gameData.entropy || !gameData.entropy.unifiedArchitecture) return
    if (!gameData.universeTokens || gameData.universeTokens < 1) return
    var confirmMove = confirm("You have stabilized this universe. Spend your token to travel to the next one?")
    if (!confirmMove) return
    gameData.universeTokens -= 1
    var nextIndex = (gameData.universeIndex || 1) + 1
    var answeredPrompt = !!gameData.hasAnsweredFirstTimePrompt
    if (nextIndex == 2) {
        alert(tUi("story_universe_2"))
    } else if (nextIndex == 3) {
        alert(tUi("story_universe_3"))
    } else if (nextIndex == 4) {
        alert(tUi("story_universe_4"))
    } else if (nextIndex == 5) {
        alert(tUi("story_universe_5"))
    } else if (nextIndex == 6) {
        alert(tUi("story_universe_6"))
    } else if (nextIndex == 7) {
        alert(tUi("story_universe_7"))
    } else if (nextIndex == 8) {
        alert(tUi("story_universe_8"))
    }
    resetForNextUniverse(nextIndex, gameData.universeTokens, answeredPrompt)
}

function setTask(taskName) {
    var task = gameData.taskData[taskName]
    if (!task) return
    attemptSelectTask(task)
    if (isCycleOverseerActive()) {
        gameData.entropy.focusTask = task.name
    }
}

function unlockCycleOverseer() {
    if (gameData.entropy.overseer) return
    if (gameData.entropy.EP < cycleOverseerCost) return
    gameData.entropy.EP -= cycleOverseerCost
    gameData.entropy.overseer = true
    gameData.entropy.focusTask = gameData.currentJob.name
}

function setProperty(propertyName) {
    var property = gameData.itemData[propertyName]
    if (!property) return
    if (!purchaseItemIfNeeded(property)) return
    gameData.currentProperty = property
}

function setMisc(miscName) {
    var misc = gameData.itemData[miscName]
    if (!misc) return
    if (!purchaseItemIfNeeded(misc)) return
    if (gameData.currentMisc.includes(misc)) {
        for (i = 0; i < gameData.currentMisc.length; i++) {
            if (gameData.currentMisc[i] == misc) {
                gameData.currentMisc.splice(i, 1)
            }
        }
    } else {
        gameData.currentMisc.push(misc)
    }
}

function getItemCategoryName(itemName) {
    for (var category in itemCategories) {
        if (!itemCategories.hasOwnProperty(category)) continue
        if (itemCategories[category].indexOf(itemName) !== -1) {
            return category
        }
    }
    return null
}

function isFreeStarterItem(itemName) {
    return itemName === "Homeless"
}

function getCategoryPurchaseCount(categoryName) {
    if (!categoryName) return 0
    if (!gameData.categoryPurchaseCounts) return 0
    return gameData.categoryPurchaseCounts[categoryName] || 0
}

function isItemPurchased(itemName) {
    if (!gameData.purchasedItems) return false
    return !!gameData.purchasedItems[itemName]
}

function getEffectiveItemCost(item) {
    if (!item) return 0
    var categoryName = getItemCategoryName(item.name)
    var alreadyPurchased = getCategoryPurchaseCount(categoryName) > 0
    return alreadyPurchased ? item.getExpense() : 0
}

function purchaseItemIfNeeded(item) {
    if (!item) return false
    ensureShopState()
    if (isItemPurchased(item.name)) return true
    var cost = getEffectiveItemCost(item)
    if (gameData.coins < cost) return false
    if (cost > 0) {
        gameData.coins -= cost
    }
    gameData.purchasedItems[item.name] = true
    var categoryName = getItemCategoryName(item.name)
    if (categoryName && !isFreeStarterItem(item.name)) {
        var current = getCategoryPurchaseCount(categoryName)
        gameData.categoryPurchaseCounts[categoryName] = current + 1
    }
    return true
}

function createData(data, baseData) {
    for (key in baseData) {
        var entity = baseData[key]
        createEntity(data, entity)
    }
}

function createEntity(data, entity) {
    if ("income" in entity) {data[entity.name] = new Job(entity)}
    else if ("maxXp" in entity) {data[entity.name] = new Skill(entity)}
    else {data[entity.name] = new Item(entity)}
    data[entity.name].id = "row " + entity.name
    if (data[entity.name].skip === undefined) {
        data[entity.name].skip = false
    }
}

function createRequiredRow(categoryName) {
    var requiredRow = document.getElementsByClassName("requiredRowTemplate")[0].content.firstElementChild.cloneNode(true)
    requiredRow.classList.add("requiredRow")
    requiredRow.classList.add(removeSpaces(categoryName))
    requiredRow.id = "required " + categoryName
    var td = requiredRow.querySelector("td")
    if (td && td.childNodes.length > 0) {
        var label = td.querySelector(".required-label")
        if (label) {
            label.textContent = (tUi("requiredPrefix") || "Required:") + " "
        }
    }
    return requiredRow
}

function createHeaderRow(templates, categoryType, categoryName) {
    var headerRow = templates.headerRow.content.firstElementChild.cloneNode(true)
    if (headerRow.getElementsByClassName("category")[0]) {
        headerRow.getElementsByClassName("category")[0].textContent = tCategory(categoryName)
    }
    if (categoryType != itemCategories) {
        headerRow.getElementsByClassName("valueType")[0].textContent = categoryType == jobCategories ? (tUi("headerIncomePerDay") || "Income/day") : (tUi("headerEffect") || "Effect")
        var ths = headerRow.getElementsByTagName("th")
        if (ths[1]) ths[1].textContent = tUi("columnLevel") || "Level"
        if (ths[3]) ths[3].textContent = tUi("columnXpPerDay") || "Xp/day"
        if (ths[4]) ths[4].textContent = tUi("columnXpLeft") || "Xp left"
        if (ths[5]) ths[5].textContent = tUi("columnMaxLevel") || "Max level"
        if (ths[6]) ths[6].textContent = tUi("columnSkip") || "Skip"
    } else {
        var thsItems = headerRow.getElementsByTagName("th")
        if (thsItems[0]) thsItems[0].textContent = tUi("headerItem") || "Item"
        if (thsItems[1]) thsItems[1].textContent = tUi("headerActive") || "Active"
        if (thsItems[2]) thsItems[2].textContent = tUi("headerEffect") || "Effect"
        if (thsItems[3]) thsItems[3].textContent = tUi("headerExpensePerDay") || "Expense/day"
    }

    headerRow.style.backgroundColor = headerRowColors[categoryName]
    headerRow.style.color = "#ffffff"
    headerRow.classList.add(removeSpaces(categoryName))
    headerRow.classList.add("headerRow")
    if (categoryType === skillCategories) {
        headerRow.classList.add("skillCategory")
        headerRow.setAttribute("data-category-name", categoryName)
    }
    
    return headerRow
}

function createRow(templates, name, categoryName, categoryType) {
    var row = templates.row.content.firstElementChild.cloneNode(true)
    var nameCell = row.getElementsByClassName("name")[0]
    if (nameCell) {
        nameCell.textContent = tName(name)
        nameCell.classList.add("pk-name-cell")
    }
    row.getElementsByClassName("tooltipText")[0].textContent = getTooltipText(name)
    row.id = "row " + name
    if (categoryType != itemCategories) {
        row.getElementsByClassName("progressBar")[0].onclick = function() {setTask(name)}
    } else {
        row.getElementsByClassName("button")[0].onclick = categoryName == "Properties" ? function() {setProperty(name)} : function() {setMisc(name)}
    }

    return row
}

function createAllRows(categoryType, tableId) {
    var templates = {
        headerRow: document.getElementsByClassName(categoryType == itemCategories ? "headerRowItemTemplate" : "headerRowTaskTemplate")[0],
        row: document.getElementsByClassName(categoryType == itemCategories ? "rowItemTemplate" : "rowTaskTemplate")[0],
    }

    var table = document.getElementById(tableId)

    for (categoryName in categoryType) {
        var headerRow = createHeaderRow(templates, categoryType, categoryName)
        table.appendChild(headerRow)
        
        var category = categoryType[categoryName]
        category.forEach(function(name) {
            var row = createRow(templates, name, categoryName, categoryType)
            table.appendChild(row)       
        })

        var requiredRow = createRequiredRow(categoryName)
        table.append(requiredRow)
    }
}

function updateQuickTaskDisplay(taskType) {
    var currentTask = taskType == "job" ? gameData.currentJob : gameData.currentSkill
    var quickTaskDisplayElement = document.getElementById("quickTaskDisplay")
    var progressBar = quickTaskDisplayElement.getElementsByClassName(taskType)[0]
    progressBar.getElementsByClassName("name")[0].textContent = tName(currentTask.name) + " lvl " + currentTask.level
    progressBar.getElementsByClassName("progressFill")[0].style.width = currentTask.xp / currentTask.getMaxXp() * 100 + "%"
}

function updateRequiredRows(data, categoryType) {
    var requiredRows = document.getElementsByClassName("requiredRow")
    for (requiredRow of requiredRows) {
        var nextEntity = null
        var catName = requiredRow.id && requiredRow.id.startsWith("required ") ? requiredRow.id.substring(9) : requiredRow.id
        var label = requiredRow.querySelector(".required-label")
        if (label) {
            label.textContent = (tUi("requiredPrefix") || "Required:") + " "
        }
        var category = categoryType[catName]
        if (category == null) {continue}
        for (i = 0; i < category.length; i++) {
            var entityName = category[i]
            var entityRow = document.getElementById("row " + entityName)
            if (!entityRow) continue
            if (i >= category.length - 1) break
            var requirements = gameData.requirements[entityName]
            if (requirements && i == 0) {
                if (!requirements.isCompleted()) {
                    nextEntity = data[entityName]
                    break
                }
            }

            var nextIndex = i + 1
            if (nextIndex >= category.length) {break}
            var nextEntityName = category[nextIndex]
            var nextEntityRequirements = gameData.requirements[nextEntityName]

            if (nextEntityRequirements && !nextEntityRequirements.isCompleted()) {
                nextEntity = data[nextEntityName]
                break
            }       
        }

        if (nextEntity && !document.getElementById("row " + nextEntity.name)) {
            requiredRow.classList.add("hiddenTask")
            continue
        }

        if (nextEntity == null) {
            requiredRow.classList.add("hiddenTask")
        } else {
            requiredRow.classList.remove("hiddenTask")
            var requirementObject = gameData.requirements[nextEntity.name]
            var requirements = requirementObject ? requirementObject.requirements : null

            var coinElement = requiredRow.getElementsByClassName("coins")[0]
            var levelElement = requiredRow.getElementsByClassName("levels")[0]
            var evilElement = requiredRow.getElementsByClassName("evil")[0]

            coinElement.classList.add("hiddenTask")
            levelElement.classList.add("hiddenTask")
            evilElement.classList.add("hiddenTask")

            if (!requirementObject || !requirements || requirements.length === 0) {
                coinElement.classList.add("hiddenTask")
                levelElement.classList.add("hiddenTask")
                evilElement.classList.add("hiddenTask")
                levelElement.textContent = ""
                continue
            }

            var messages = []
            if (data == gameData.taskData) {
                if (requirementObject instanceof EvilRequirement) {
                    evilElement.classList.remove("hiddenTask")
                    evilElement.textContent = format(requirements[0].requirement) + " evil"
                } else if (requirementObject instanceof EntropyRequirement) {
                    levelElement.classList.remove("hiddenTask")
                    var needSeeds = requirements[0] && requirements[0].seeds ? requirements[0].seeds : 1
                    levelElement.textContent = "Find the Almanach (" + format(gameData.entropy.seeds) + "/" + format(needSeeds) + " seed)"
                } else {
                    levelElement.classList.remove("hiddenTask")
                    for (requirement of requirements) {
                        if (requirement.task) {
                            var task = gameData.taskData[requirement.task]
                            if (!task || typeof task.level !== "number") {
                                continue
                            }
                            if (task.level >= requirement.requirement) continue
                            var levelWord = tUi("columnLevel") || "Level"
                            messages.push(tName(requirement.task) + " " + levelWord + " " + format(task.level) + "/" + format(requirement.requirement))
                        }
                    }
                    levelElement.textContent = messages.join(", ")
                }
            } else if (data == gameData.itemData) {
                coinElement.classList.remove("hiddenTask")
                formatCoins(requirements[0].requirement, coinElement)
            }
        }   
    }
}

function updateTaskRows() {
    for (key in gameData.taskData) {
        var task = gameData.taskData[key]
        var row = document.getElementById("row " + task.name)
        if (!row) continue
        row.getElementsByClassName("level")[0].textContent = task.level
        row.getElementsByClassName("xpGain")[0].textContent = format(task.getXpGain())
        row.getElementsByClassName("xpLeft")[0].textContent = format(task.getXpLeft())

        var maxLevel = row.getElementsByClassName("maxLevel")[0]
        maxLevel.textContent = task.maxLevel
        gameData.rebirthOneCount > 0 ? maxLevel.classList.remove("hidden") : maxLevel.classList.add("hidden")

        var progressFill = row.getElementsByClassName("progressFill")[0]
        progressFill.style.width = task.xp / task.getMaxXp() * 100 + "%"
        task == gameData.currentJob || task == gameData.currentSkill ? progressFill.classList.add("current") : progressFill.classList.remove("current")

        var valueElement = row.getElementsByClassName("value")[0]
        valueElement.getElementsByClassName("income")[0].style.display = task instanceof Job
        valueElement.getElementsByClassName("effect")[0].style.display = task instanceof Skill

        var skipSkillElement = row.getElementsByClassName("skipSkill")[0]
        if (skipSkillElement) {
            skipSkillElement.style.display =
                task instanceof Skill && autoLearnElement.checked ? "block" : "none"
            var checkbox = skipSkillElement.getElementsByClassName("checkbox")[0]
            if (checkbox) {
                checkbox.checked = !!task.skip
                if (!checkbox.dataset.bound) {
                    (function(name) {
                        checkbox.addEventListener("change", function() {
                            ensureSkipSkillsState()
                            var t = gameData.taskData[name]
                            if (t) {
                                t.skip = !!this.checked
                                gameData.skipSkills[name] = t.skip
                                saveGameData()
                            }
                        })
                    })(task.name)
                    checkbox.dataset.bound = "true"
                }
            }
        }

        var focusTag = row.getElementsByClassName("focusTag")[0]
        if (focusTag) {
            focusTag.classList.remove("job-tag", "job-tag-passive", "job-tag-active")
            focusTag.textContent = ""
            var nameCell = row.querySelector(".name")
            if (nameCell) {
                nameCell.classList.add("job-name-cell")
                var title = nameCell.querySelector(".progress-text")
                if (title) title.classList.add("job-title")
            }
            if (isCycleOverseerActive()) {
                var focusTask = getFocusedTask()
                if (focusTask && task == focusTask) {
                    focusTag.textContent = tUi("tagActive") || "ACTIVE"
                    focusTag.classList.add("job-tag", "job-tag-active")
                } else if (focusTask) {
                    focusTag.textContent = tUi("tagPassive") || "PASSIVE"
                    focusTag.classList.add("job-tag", "job-tag-passive")
                }
            }
        }

        if (task instanceof Job) {
            formatCoins(task.getIncome(), valueElement.getElementsByClassName("income")[0])
        } else {
            valueElement.getElementsByClassName("effect")[0].textContent = task.getEffectDescription()
        }
    }
}

function updateItemRows() {
    for (key in gameData.itemData) {
        var item = gameData.itemData[key]
        var row = document.getElementById("row " + item.name)
        if (!row) continue
        var button = row.getElementsByClassName("button")[0]
        var requirement = gameData.requirements[item.name]
        var unlocked = !requirement || requirement.isCompleted()
        var purchased = isItemPurchased(item.name)
        var effectiveCost = purchased ? item.getExpense() : getEffectiveItemCost(item)
        var canAffordPurchase = gameData.coins >= (purchased ? item.getExpense() : effectiveCost)
        var canAffordExpense = gameData.coins >= item.getExpense()
        var stateClass = "shop-btn-available"
        var disableButton = false
        if (!unlocked) {
            stateClass = "shop-btn-locked"
            disableButton = true
        } else if (!purchased && !canAffordPurchase) {
            stateClass = "shop-btn-unaffordable"
            disableButton = true
        } else if (purchased && !canAffordExpense) {
            stateClass = "shop-btn-unaffordable"
            disableButton = true
        }
        if (button) {
            button.disabled = disableButton
            button.classList.remove("shop-btn-locked", "shop-btn-unaffordable", "shop-btn-available")
            button.classList.add(stateClass)
        }
        var active = row.getElementsByClassName("active")[0]
        var color = itemCategories["Properties"].includes(item.name) ? headerRowColors["Properties"] : headerRowColors["Misc"]
        active.style.backgroundColor = gameData.currentMisc.includes(item) || item == gameData.currentProperty ? color : "white"
        row.getElementsByClassName("effect")[0].textContent = item.getEffectDescription()
        formatCoins(effectiveCost, row.getElementsByClassName("expense")[0])
    }
}

function updateShopAutoPickState() {
    if (!autoPickShopElement) autoPickShopElement = document.getElementById("autoPickShopCheckbox")
    if (!shopAutoPickLabelElement) shopAutoPickLabelElement = document.getElementById("autoPickShopLabel")

    var labelText = tUi("autoPickShopLabel") || "Auto-pick shop items"
    var tooltip = tUi("autoPickShopTooltip") || ""

    if (shopAutoPickLabelElement) {
        shopAutoPickLabelElement.textContent = labelText
        shopAutoPickLabelElement.title = tooltip
    }
    if (autoPickShopElement) {
        autoPickShopElement.title = tooltip
        autoPickShopElement.checked = !!(gameData.settings && gameData.settings.autoPickShop)
        if (!autoPickShopElement.dataset.bound) {
            autoPickShopElement.addEventListener("change", function() {
                if (!gameData.settings) gameData.settings = {}
                gameData.settings.autoPickShop = !!autoPickShopElement.checked
                saveGameData()
                updateShopRecommendation()
            })
            autoPickShopElement.dataset.bound = "1"
        }
    }
}

function updateShopRecommendation() {
    if (!autoPickShopElement) autoPickShopElement = document.getElementById("autoPickShopCheckbox")
    var table = document.getElementById("itemTable")
    if (!table) return

    var rows = table.getElementsByTagName("tr")
    for (var i = 0; i < rows.length; i++) {
        rows[i].classList.remove("shop-row-auto-picked")
    }
    recommendedShopItem = null

    if (!gameData || !gameData.settings || !gameData.settings.autoPickShop) return
    var shouldAutoBuy = gameData.settings.autoPickShop && (!autoPickShopElement || autoPickShopElement.checked)

    ensureShopState()

    var incomePerDay = getIncome()
    var baseExpenses = getExpense()
    var costFactor = getUniverseConfig().costFactor || 1
    var currentPropertyExpense = (gameData.currentProperty ? gameData.currentProperty.getExpense() : 0) * costFactor

    var bestCandidate = null
    var bestCandidateCategory = null
    var bestCandidateCost = 0
    var bestNet = -Infinity

    for (var itemName in gameData.itemData) {
        if (!gameData.itemData.hasOwnProperty(itemName)) continue
        var item = gameData.itemData[itemName]
        if (!item) continue

        var categoryName = getItemCategoryName(itemName)
        if (!categoryName || !itemCategories[categoryName]) continue

        var requirement = gameData.requirements[itemName]
        if (requirement) {
            if (typeof requirement.isCompleted === "function") {
                if (!requirement.isCompleted()) continue
            } else if (requirement.completed === false) {
                continue
            }
        }
        if (isItemPurchased(itemName)) continue

        var effectiveCost = getEffectiveItemCost(item)
        if (gameData.coins < effectiveCost) continue

        var candidateExpense = item.getExpense() * costFactor
        var candidateExpenses = baseExpenses

        if (categoryName === "Properties") {
            candidateExpenses = baseExpenses - currentPropertyExpense + candidateExpense
        } else if (categoryName === "Misc") {
            candidateExpenses = baseExpenses + candidateExpense
        } else {
            continue
        }

        var candidateNet = incomePerDay - candidateExpenses
        if (candidateNet < 0) continue

        if (candidateNet > bestNet) {
            bestNet = candidateNet
            bestCandidate = item
            bestCandidateCategory = categoryName
            bestCandidateCost = effectiveCost
        }
    }

    if (bestCandidate) {
        recommendedShopItem = bestCandidate.name
        var row = document.getElementById("row " + bestCandidate.name)
        if (row) {
            row.classList.add("shop-row-auto-picked")
        }
        if (shouldAutoBuy && gameData.coins >= bestCandidateCost) {
            if (bestCandidateCategory === "Properties") {
                setProperty(bestCandidate.name)
            } else if (bestCandidateCategory === "Misc") {
                setMisc(bestCandidate.name)
            }
            updateItemRows()
            updateShopRecommendation()
            return
        }
    }
}

function refreshCategoryHeaders() {
    var categorySets = [jobCategories, skillCategories, entropyJobCategories, entropySkillCategories]
    categorySets.forEach(function(set) {
        for (var categoryName in set) {
            var className = removeSpaces(categoryName)
            var headerRow = document.getElementsByClassName(className)[0]
            if (headerRow && headerRow.getElementsByClassName("category")[0]) {
                headerRow.getElementsByClassName("category")[0].textContent = tCategory(categoryName)
                // Refresh column headers
                var categoryType = (jobCategories[categoryName] ? jobCategories : (skillCategories[categoryName] ? skillCategories : (entropyJobCategories[categoryName] ? entropyJobCategories : entropySkillCategories)))
                var ths = headerRow.getElementsByTagName("th")
                if (categoryType && categoryType != itemCategories) {
                    if (ths[1]) ths[1].textContent = tUi("columnLevel") || "Level"
                    if (ths[2]) ths[2].textContent = categoryType == jobCategories ? (tUi("headerIncomePerDay") || "Income/day") : (tUi("headerEffect") || "Effect")
                    if (ths[3]) ths[3].textContent = tUi("columnXpPerDay") || "Xp/day"
                    if (ths[4]) ths[4].textContent = tUi("columnXpLeft") || "Xp left"
                    if (ths[5]) ths[5].textContent = tUi("columnMaxLevel") || "Max level"
                    if (ths[6]) ths[6].textContent = tUi("columnSkip") || "Skip"
                } else if (categoryType == itemCategories) {
                    if (ths[0]) ths[0].textContent = tUi("headerItem") || "Item"
                    if (ths[1]) ths[1].textContent = tUi("headerActive") || "Active"
                    if (ths[2]) ths[2].textContent = tUi("headerEffect") || "Effect"
                    if (ths[3]) ths[3].textContent = tUi("headerExpensePerDay") || "Expense/day"
                }
            }
        }
    })
}

function getUiTextWithFallback(key, fallbackKey) {
    var text = tUi(key)
    if (text === key && fallbackKey) {
        var fallback = tUi(fallbackKey)
        if (fallback !== fallbackKey) {
            text = fallback
        }
    }
    return text === key ? "" : text
}

function setElementText(id, key, fallbackKey) {
    var element = document.getElementById(id)
    if (!element) return
    element.textContent = getUiTextWithFallback(key, fallbackKey)
}

function setElementHtml(id, key, fallbackKey) {
    var element = document.getElementById(id)
    if (!element) return
    element.innerHTML = getUiTextWithFallback(key, fallbackKey)
}

function setElementPlaceholder(id, key, fallbackKey) {
    var element = document.getElementById(id)
    if (!element) return
    element.placeholder = getUiTextWithFallback(key, fallbackKey)
}

function setEntropyUpgradeText(branch, key) {
    var nameId = "upgrade-" + branch + "-" + key + "-name"
    var descId = "upgrade-" + branch + "-" + key + "-desc"
    var nameKey = "entropy_upgrade_" + branch + "_" + key + "_name"
    var descKey = "entropy_upgrade_" + branch + "_" + key + "_desc"
    setElementText(nameId, nameKey)
    var nameEl = document.getElementById(nameId)
    var def = (ENTROPY_UPGRADE_DEFINITIONS[branch] || {})[key] || {}
    if (nameEl && !nameEl.textContent) {
        nameEl.textContent = def.name || ""
    }
    var descEl = document.getElementById(descId)
    if (descEl) {
        var text = getUiTextWithFallback(descKey) || def.description || ""
        descEl.textContent = text
    }
}

function setEntropyArtifactText(key) {
    setElementText("artifact-" + key + "-name", "entropy_artifact_" + key + "_name")
    var descEl = document.getElementById("artifact-" + key + "-desc")
    if (descEl) descEl.textContent = getUiTextWithFallback("entropy_artifact_" + key + "_desc")
}

function setEntropyPatternText(key) {
    setElementText("pattern-" + key + "-name", "entropy_pattern_" + key + "_name")
    var descEl = document.getElementById("pattern-" + key + "-desc")
    if (descEl) descEl.textContent = getUiTextWithFallback("entropy_pattern_" + key + "_desc")
}

function initSettingsUI() {
    var select = document.getElementById("languageSelect")
    if (select) {
        select.innerHTML = ""
        var optionRu = document.createElement("option")
        optionRu.value = LANG.RU
        optionRu.textContent = getUiTextWithFallback("settings_language_ru", "settingsLanguageRu")
        var optionEn = document.createElement("option")
        optionEn.value = LANG.EN
        optionEn.textContent = getUiTextWithFallback("settings_language_en", "settingsLanguageEn")
        select.appendChild(optionRu)
        select.appendChild(optionEn)
        select.value = getCurrentLanguage()
        select.onchange = function() {
            setCurrentLanguage(this.value)
        }
    }
    setElementText("languageLabel", "settings_language_label", "settingsLanguageLabel")
}

function refreshTabLabels() {
    var tabs = [
        { id: "jobTabButton", key: "tab_jobs", legacyKey: "tabJobs" },
        { id: "skillsTabButton", key: "tab_skills", legacyKey: "tabSkills" },
        { id: "shopTabButton", key: "tab_shop", legacyKey: "tabShop" },
        { id: "entropyTabButton", key: "tab_entropy", legacyKey: "tabEntropy" },
        { id: "rebirthTabButton", key: "tab_amulet", legacyKey: "tabRebirth" },
        { id: "settingsTabButton", key: "tab_settings", legacyKey: "tabSettings" },
    ]
    tabs.forEach(function(tab) {
        var element = document.getElementById(tab.id)
        if (!element) return
        var text = tUi(tab.key)
        if (text === tab.key && tab.legacyKey) {
            var fallback = tUi(tab.legacyKey)
            if (fallback !== tab.legacyKey) {
                text = fallback
            }
        }
        element.textContent = text
    })
}

function refreshSettingsLabels() {
    setElementText("importExportTitle", "settings_import_title")
    setElementText("importButton", "settings_import_button")
    setElementText("exportButton", "settings_export_button")
    setElementPlaceholder("importExportBox", "settings_import_placeholder")
    setElementText("themeTitle", "settings_theme_title")
    setElementText("themeToggleButton", "settings_theme_button")
    setElementText("discordTitle", "settings_discord_title")
    setElementText("resetTitle", "settings_reset_title")
    setElementText("resetButton", "settings_reset_button")
    setElementText("resetModalTitle", "settings_reset_modal_title")
    setElementHtml("resetModalBody", "settings_reset_modal_body")
    setElementText("resetModalCancel", "settings_reset_modal_cancel")
    setElementText("resetModalConfirm", "settings_reset_modal_confirm")
}

function refreshEntropyLabels() {
    setElementText("entropyLedgerTitle", "entropy_section_ledger")
    setElementText("entropyLedgerNote", "entropy_ledger_note")
    setElementText("entropySeedLabel", "entropy_seeds_label")
    setElementText("entropyInsightLabel", "entropy_insight_label")
    setElementText("entropyMaxInsightLabel", "entropy_max_insight_label")
    setElementText("entropyEPLabel", "entropy_ep_label")
    setElementText("entropyFocusLabel", "entropy_focus_label")
    setElementText("entropyFocusDisplay", "entropy_focus_disabled")
    setElementText("cycleOverseerButton", "entropy_overseer_button_unlock")
    setElementText("entropyOverseerNote", "entropy_overseer_note")

    setElementText("entropyWorkTitle", "entropy_section_work")
    setElementText("entropyStudiesTitle", "entropy_section_studies")
    setElementText("entropyVelocityTitle", "entropy_section_velocity")
    setElementText("entropyStabilityTitle", "entropy_section_stability")
    setElementText("entropyMetaTitle", "entropy_section_meta")
    setElementText("entropyArtifactTitle", "entropy_section_artifacts")
    setElementText("entropyPatternTitle", "entropy_section_patterns")

    setElementText("entropyVelocityHeaderUpgrade", "entropy_col_upgrade")
    setElementText("entropyVelocityHeaderLevel", "entropy_col_level")
    setElementText("entropyVelocityHeaderCost", "entropy_col_cost")
    setElementText("entropyStabilityHeaderUpgrade", "entropy_col_upgrade")
    setElementText("entropyStabilityHeaderLevel", "entropy_col_level")
    setElementText("entropyStabilityHeaderCost", "entropy_col_cost")
    setElementText("entropyMetaHeaderUpgrade", "entropy_col_upgrade")
    setElementText("entropyMetaHeaderLevel", "entropy_col_level")
    setElementText("entropyMetaHeaderCost", "entropy_col_cost")
    setElementText("entropyArtifactHeaderName", "entropy_col_artifact")
    setElementText("entropyArtifactHeaderStatus", "entropy_col_status")
    setElementText("entropyArtifactHeaderCost", "entropy_col_cost")
    setElementText("entropyPatternHeaderName", "entropy_col_pattern")
    setElementText("entropyPatternHeaderLevel", "entropy_col_level")

    var velocityUpgrades = ["temporalMomentum", "earlyCompression", "chainProgression", "momentumPersistence", "wealthFocus", "masteryFocus"]
    var stabilityUpgrades = ["entropyStability", "lifeContinuity", "balancedGrowth", "shortBrilliantLife", "longSteadyLife", "earlyPeak", "lateBloom", "smoothing", "quietMind", "patternAttunement"]
    var metaUpgrades = ["unifiedArchitecture"]
    velocityUpgrades.forEach(function(key) { setEntropyUpgradeText("velocity", key) })
    stabilityUpgrades.forEach(function(key) { setEntropyUpgradeText("stability", key) })
    metaUpgrades.forEach(function(key) { setEntropyUpgradeText("meta", key) });

    ["sigilMomentum", "chainConductor", "loopAnchor", "patternResonator"].forEach(setEntropyArtifactText);
    ["laborCycle", "scholarLoop", "compressedLife", "stableCycle", "opportunist"].forEach(setEntropyPatternText);
}

function refreshNarrativeTexts() {
    setElementHtml("amuletStory25", "story_amulet_intro_25")
    setElementHtml("rebirthNote1", "story_amulet_note_45")
    setElementHtml("rebirthNote2Text", "story_amulet_note_65")
    setElementHtml("rebirthNote2Hint", "story_amulet_hint_65")
    setElementHtml("rebirthNote3Text", "story_amulet_note_200")
    setElementHtml("rebirthNote3Hint", "story_amulet_hint_200")
    setElementText("rebirthOneButton", "story_amulet_btn_touch_eye")
    setElementText("rebirthTwoButton", "story_amulet_btn_accept_evil")
    setElementText("deathTitle", "death_title")
    setElementText("deathSubtitle", "death_subtitle")

    setElementText("introTitle", "intro_title")
    setElementHtml("introBody", "intro_body")
    setElementHtml("introHint", "intro_hint")
    setElementText("introContinueButton", "intro_continue")

    var debugTitle = document.getElementById("debug-panel-title")
    if (debugTitle) debugTitle.textContent = tUi("debug_panel_title")
    var debugClose = document.getElementById("debug-panel-close")
    if (debugClose) debugClose.textContent = tUi("debug_panel_close") || "X"
}

function refreshUI() {
    ensureEntropyBackfills()
    refreshTabLabels()

    refreshCategoryHeaders()
    refreshRowNames()
    refreshRowTooltips()
    updateUniverseUI()
    initSettingsUI()
    refreshSettingsLabels()
    refreshEntropyLabels()
    refreshNarrativeTexts()

    var observerTitle = document.querySelector("#observerPanel h3")
    if (observerTitle) observerTitle.textContent = tUi("observerTitle")
    var observerRootTitle = document.querySelector("#observer-root h3")
    if (observerRootTitle) observerRootTitle.textContent = tUi("observerTitle")

    var titleHeader = document.getElementById("titleHeader")
    if (titleHeader) titleHeader.textContent = tUi("title")
    var titleTag = document.getElementById("titleText")
    if (titleTag) titleTag.textContent = tUi("title")

    // Sidebar labels
    var pauseBtn = document.getElementById("pauseButton")
    if (pauseBtn) pauseBtn.textContent = tUi("sidebarPause")
    var debugBtn = document.getElementById("debug-toggle-button")
    if (debugBtn) debugBtn.textContent = tUi("sidebarDebug")
    var travelBtn = document.getElementById("universeAdvanceButton")
    if (travelBtn) travelBtn.textContent = tUi("sidebarTravelNextUniverse")
    var universeLabel = document.getElementById("universeDisplay")
    if (universeLabel) updateUniverseUI()
    var ageRow = document.querySelector("#life-root div[style*='font-size: large']:not(#universeDisplay)")
    // Age/day string and lifespan label handled directly below in updateSidebarText

    // Automation labels
    var autoPromoteLabel = document.querySelector("#automation .inline:nth-child(1) div.inline")
    if (autoPromoteLabel) autoPromoteLabel.textContent = tUi("automationAutoPromote")
    var autoLearnLabel = document.querySelector("#automation span:nth-child(3) div.inline")
    if (autoLearnLabel) autoLearnLabel.textContent = tUi("automationAutoLearn")

    // Current job/skill labels
    var currentJobLabel = document.getElementById("currentJobLabel")
    if (currentJobLabel) currentJobLabel.textContent = tUi("sidebarCurrentJob")
    var currentSkillLabel = document.getElementById("currentSkillLabel")
    if (currentSkillLabel) currentSkillLabel.textContent = tUi("sidebarCurrentSkill")

    // Balance labels
    var balanceLabel = document.getElementById("balanceLabel")
    if (balanceLabel) balanceLabel.textContent = tUi("sidebarBalance")
    var netLabel = document.getElementById("netLabel")
    if (netLabel) netLabel.textContent = tUi("sidebarNetPerDay")
    var incomeLabel = document.getElementById("incomeLabel")
    if (incomeLabel) incomeLabel.textContent = tUi("sidebarIncomePerDay")
    var expenseLabel = document.getElementById("expenseLabel")
    if (expenseLabel) expenseLabel.textContent = tUi("sidebarExpensePerDay")

    // Age / day / lifespan
    var ageLabel = document.getElementById("ageLabel")
    if (ageLabel) ageLabel.textContent = tUi("sidebarAge")
    var dayLabel = document.getElementById("dayLabel")
    if (dayLabel) dayLabel.textContent = tUi("sidebarDay")
    var lifespanLabel = document.getElementById("lifespanLabel")
    if (lifespanLabel) lifespanLabel.textContent = tUi("sidebarLifespan")
    var lifespanYears = document.getElementById("lifespanYearsLabel")
    if (lifespanYears) lifespanYears.textContent = ""

    var happinessLabel = document.getElementById("happinessLabel")
    if (happinessLabel) happinessLabel.textContent = tUi("sidebarHappinessLabel")
    var happinessHint = document.getElementById("happinessHint")
    if (happinessHint) happinessHint.textContent = tUi("sidebarHappinessHint")
    var evilLabel = document.getElementById("evilLabel")
    if (evilLabel) evilLabel.textContent = tUi("sidebarEvilLabel")
    var evilHint = document.getElementById("evilHint")
    if (evilHint) evilHint.textContent = tUi("sidebarEvilHint")
    var timeWarpLabel = document.getElementById("timeWarpingLabel")
    if (timeWarpLabel) timeWarpLabel.textContent = tUi("sidebarTimeWarpingLabel")
    var timeWarpHint = document.getElementById("timeWarpingHint")
    if (timeWarpHint) timeWarpHint.textContent = tUi("sidebarTimeWarpingHint")
    var timeWarpBtn = document.getElementById("timeWarpingButton")
    if (timeWarpBtn) {
        timeWarpBtn.textContent = gameData.timeWarpingEnabled ? (tUi("sidebarTimeWarpingButtonDisable") || timeWarpBtn.textContent) : (tUi("sidebarTimeWarpingButtonEnable") || timeWarpBtn.textContent)
    }

    // Pause button
    var pauseButton = document.getElementById("pauseButton")
    if (pauseButton) {
        pauseButton.textContent = gameData.paused ? (tUi("sidebarPlay") || "Resume") : (tUi("sidebarPause") || "Pause")
    }

    // Debug button
    var debugButton = document.getElementById("debug-toggle-button")
    if (debugButton) debugButton.textContent = tUi("sidebarDebug")
}

// Проверка видимости строки: учёт hiddenTask и display:none
function isRowVisible(row) {
    if (!row) return false
    if (row.classList.contains("hiddenTask")) return false
    if (row.style.display === "none") return false
    return true
}

// Переключение видимости категории навыков (шапка, требование, строки)
function setSkillCategoryVisibility(categoryName, visible) {
    var table = document.getElementById("skillTable")
    if (!table) return
    var headerRow = table.querySelector("tr.skillCategory[data-category-name=\"" + categoryName + "\"]")
    var requiredRow = document.getElementById("required " + categoryName)
    var skillNames = skillCategories[categoryName] || []

    var rows = []
    if (headerRow) rows.push(headerRow)
    if (requiredRow) rows.push(requiredRow)
    skillNames.forEach(function(name) {
        var r = document.getElementById("row " + name)
        if (r) rows.push(r)
    })

    rows.forEach(function(row) {
        if (!row) return
        row.style.display = visible ? "" : "none"
    })
}

function enforceEntropySkillVisibility() {
    var entropyUnlocked = isEntropyUnlocked()
    var entropyFullyUnlocked = isEntropyFullyUnlocked()

    for (var categoryName in skillCategories) {
        if (!skillCategories.hasOwnProperty(categoryName)) continue
        var isEntropyOnly = entropyOnlySkillCategories.indexOf(categoryName) !== -1

        // поздние энтропийные ветки — только при полной разблокировке
        if (isEntropyOnly && !entropyFullyUnlocked) {
            setSkillCategoryVisibility(categoryName, false)
            continue
        }

        var skillNames = skillCategories[categoryName] || []
        var anyVisible = false

        for (var i = 0; i < skillNames.length; i++) {
            var row = document.getElementById("row " + skillNames[i])
            if (isRowVisible(row)) {
                anyVisible = true
                break
            }
        }

        if (!anyVisible) {
            var reqRow = document.getElementById("required " + categoryName)
            if (isRowVisible(reqRow)) anyVisible = true
        }

        setSkillCategoryVisibility(categoryName, anyVisible)
    }
}

function refreshRowNames() {
    var rows = document.querySelectorAll(".rowTask, .rowItem")
    rows.forEach(function(row) {
        var nameCell = row.getElementsByClassName("name")[0]
        if (!nameCell) return
        var id = row.id && row.id.startsWith("row ") ? row.id.substring(4) : null
        if (!id) return
        nameCell.textContent = tName(id)
    })
}

function refreshRowTooltips() {
    var rows = document.querySelectorAll(".rowTask, .rowItem")
    rows.forEach(function(row) {
        var tooltip = row.getElementsByClassName("tooltipText")[0]
        if (!tooltip) return
        var id = row.id && row.id.startsWith("row ") ? row.id.substring(4) : null
        if (!id) return
        tooltip.textContent = getTooltipText(id)
    })
}

function updateHeaderRows(categories) {
    for (categoryName in categories) {
        var className = removeSpaces(categoryName);
        var headerRow = document.getElementsByClassName(className)[0];
        if (!headerRow) continue; // no header row for this category

        var maxLevelElement = headerRow.getElementsByClassName("maxLevel")[0];
        if (maxLevelElement) {
            if (gameData.rebirthOneCount > 0) {
                maxLevelElement.classList.remove("hidden");
            } else {
                maxLevelElement.classList.add("hidden");
            }
        }

        var skipSkillElement = headerRow.getElementsByClassName("skipSkill")[0];
        var isSkillCategory = (categories === skillCategories || categories === entropySkillCategories);
        if (skipSkillElement) {
            skipSkillElement.style.display =
                isSkillCategory && autoLearnElement.checked ? "block" : "none";
        }
    }
}

function updateEntropyUpgradeUI() {
    var upgradesContainer = document.getElementById("entropyUpgradeSection")
    if (!upgradesContainer) return
    var unlocked = isEntropyUnlocked()
    upgradesContainer.style.display = unlocked ? "block" : "none"
    if (!unlocked) return
    var ep = gameData.entropy ? gameData.entropy.EP : 0
    var uaFinal = gameData.entropy && gameData.entropy.unifiedArchitecture

    for (branch in ENTROPY_UPGRADE_DEFINITIONS) {
        var upgrades = ENTROPY_UPGRADE_DEFINITIONS[branch]
        for (key in upgrades) {
            var levelElement = document.getElementById("upgrade-" + branch + "-" + key + "-level")
            var costElement = document.getElementById("upgrade-" + branch + "-" + key + "-cost")
            var buttonElement = document.getElementById("upgrade-" + branch + "-" + key + "-buy")
            if (!levelElement || !costElement || !buttonElement) continue

            var level = getEntropyUpgradeLevel(branch, key)
            var absoluteMax = getEntropyUpgradeMaxLevel(key)
            var effectiveMax = getEffectiveUpgradeMaxLevel(branch, key)
            var canIncrease = canIncreaseEntropyUpgrade(branch, key)
            var atAbsoluteMax = level >= absoluteMax
            var atEffectiveMax = level >= effectiveMax
            var cost = getEntropyUpgradeCost(branch, key)
            var meetsUAReq = key != "unifiedArchitecture" || meetsUnifiedArchitectureRequirements()
            var groupId = getExclusiveGroupId(branch, key)
            var groupChosen = getExclusiveGroupChoice(groupId, key)
            var exclusiveBlocked = groupId && groupChosen && groupChosen !== key

            levelElement.textContent = level + "/" + absoluteMax
            costElement.style.color = "inherit"

            if (!unlocked) {
                costElement.textContent = "-"
                buttonElement.disabled = true
                buttonElement.textContent = tUi("status_locked")
                continue
            }

            if (uaFinal && key != "unifiedArchitecture") {
                costElement.textContent = "-"
                buttonElement.disabled = true
                buttonElement.textContent = tUi("status_frozen")
                continue
            }

            if (!meetsUAReq && key == "unifiedArchitecture") {
                costElement.textContent = cost
                buttonElement.disabled = true
                buttonElement.textContent = tUi("status_req")
                continue
            }

            if (exclusiveBlocked) {
                costElement.textContent = tUi("status_locked")
                buttonElement.disabled = true
                buttonElement.textContent = tUi("status_taken")
                continue
            }

            if (atAbsoluteMax) {
                costElement.textContent = tUi("status_max")
                buttonElement.disabled = true
                buttonElement.textContent = tUi("status_max")
                continue
            }

            if (!canIncrease) {
                costElement.textContent = tUi("status_capped")
                buttonElement.disabled = true
                buttonElement.textContent = tUi("status_capped")
                continue
            }

            if (atEffectiveMax) {
                costElement.textContent = tUi("status_max")
                buttonElement.disabled = true
                buttonElement.textContent = tUi("status_max")
                continue
            }

            var extraReqMet = meetsExtraEntropyUpgradeRequirements(branch, key)
            costElement.textContent = cost
            costElement.style.color = ep >= cost ? "inherit" : "red"
            if (!extraReqMet) {
                buttonElement.disabled = true
                buttonElement.textContent = tUi("status_req")
                continue
            }
            buttonElement.disabled = ep < cost
            buttonElement.textContent = tUi("action_buy")
        }
    }
}

function updateArtifactUI() {
    var section = document.getElementById("entropyArtifactSection")
    if (!section) return
    var unlocked = isEntropyUnlocked()
    section.style.display = unlocked ? "block" : "none"
    if (!unlocked) return
    var artifactKeys = ["sigilMomentum", "chainConductor", "loopAnchor", "patternResonator"]
    var uaFinal = gameData.entropy && gameData.entropy.unifiedArchitecture
    var ownedCount = getOwnedArtifactCount()
    for (var key of artifactKeys) {
        var levelElement = document.getElementById("artifact-" + key + "-status")
        var costElement = document.getElementById("artifact-" + key + "-cost")
        var buttonElement = document.getElementById("artifact-" + key + "-buy")
        if (!levelElement || !costElement || !buttonElement) continue
        var owned = gameData.entropyArtifacts && gameData.entropyArtifacts[key]
        var cost = ENTROPY_ARTIFACT_COST_EP[key]
        var hasUA = gameData.entropyUpgrades && gameData.entropyUpgrades.meta && gameData.entropyUpgrades.meta.unifiedArchitecture
        var requirementMet = key != "patternResonator" || hasUA
        var totalPatternLevel = getPatternLevel("laborCycle") + getPatternLevel("scholarLoop") + getPatternLevel("compressedLife") + getPatternLevel("stableCycle") + getPatternLevel("opportunist")
        if (key === "loopAnchor" && totalPatternLevel < 6) requirementMet = false
        if (key === "sigilMomentum" && (gameData.rebirthOneCount + gameData.rebirthTwoCount) < 2) requirementMet = false
        if (key === "chainConductor" && (gameData.rebirthOneCount + gameData.rebirthTwoCount) < 3) requirementMet = false
        if (uaFinal) requirementMet = false

        if (!requirementMet) {
            levelElement.textContent = tUi("status_locked_requirements")
            costElement.textContent = cost
            buttonElement.disabled = true
            continue
        }

        if (owned) {
            levelElement.textContent = tUi("status_owned")
            costElement.textContent = "-"
            buttonElement.disabled = true
            continue
        }

        if (ownedCount >= 2) {
            levelElement.textContent = tUi("status_blocked_limit")
            costElement.textContent = cost
            buttonElement.disabled = true
            continue
        }

        levelElement.textContent = tUi("status_not_owned")
        costElement.textContent = cost
        costElement.style.color = (gameData.entropy.EP >= cost) ? "inherit" : "red"
        buttonElement.disabled = gameData.entropy.EP < cost
    }
}

function updatePatternUI() {
    var section = document.getElementById("entropyPatternSection")
    if (!section) return
    var unlocked = isEntropyUnlocked()
    section.style.display = unlocked ? "block" : "none"
    var patternList = ["laborCycle", "scholarLoop", "compressedLife", "stableCycle", "opportunist"]
    patternList.forEach(function(name) {
        var levelElement = document.getElementById("pattern-" + name + "-level")
        if (!levelElement) return
        var level = unlocked ? getPatternLevel(name) : 0
        levelElement.textContent = level + "/" + ENTROPY_PATTERN_MAX_LEVEL
    })
}

function updateUniverseUI() {
    var indicator = document.getElementById("universeDisplay")
    var button = document.getElementById("universeAdvanceButton")
    if (!indicator) return
    var uIndex = gameData.universeIndex || 1
    var cfg = getUniverseConfig()
    indicator.textContent = tUniverseName(uIndex) + " - " + (tUniverseDesc(uIndex) || cfg.description || "")
    var choices = ""
    if ((gameData.universeIndex || 1) >= 6) {
        choices = " | Choices: " + (gameData.majorChoicesUsed || 0) + "/" + getMajorChoiceLimit()
    }
    var meaningText = ""
    if ((gameData.universeIndex || 1) >= 7) {
        meaningText = " | Meaning: " + (gameData.meaning || 0).toFixed(1)
    }
    indicator.textContent += choices + meaningText
    var csDisplay = document.getElementById("cycleStrainDisplay")
    if (csDisplay) {
        if ((gameData.universeIndex || 1) >= 8) {
            csDisplay.textContent = "Cycle strain: " + (gameData.cycleStrain || 0).toFixed(1)
        } else {
            csDisplay.textContent = ""
        }
    }
    var metaPanel = document.getElementById("metaPanel")
    if (metaPanel) {
        if ((gameData.universeIndex || 1) >= 9) {
            var awareness = gameData.metaAwareness || 0
            var approx = awareness < 10
            var mw = gameData.metaWeights || {}
            var formatWeight = function(val) {
                return approx ? "~" + val.toFixed(1) : val.toFixed(2)
            }
            metaPanel.textContent = "Meta: " + awareness.toFixed(1) +
                " | Patterns " + formatWeight(mw.patterns || 1) +
                " | Aging " + formatWeight(mw.aging || 1) +
                " | Burnout " + formatWeight(mw.burnout || 1) +
                " | Compression " + formatWeight(mw.compression || 1) +
                " | Meaning " + formatWeight(mw.meaning || 1) +
                " | Cycle " + formatWeight(mw.cycle || 1)
        } else {
            metaPanel.textContent = ""
        }
    }
    if (button) {
        var canAdvance = gameData.entropy && gameData.entropy.unifiedArchitecture && gameData.universeTokens >= 1
        button.classList.toggle("hidden", !canAdvance)
        button.disabled = !canAdvance
    }
}

function updateText() {
    //Sidebar
    document.getElementById("ageDisplay").textContent = daysToYears(gameData.days)
    document.getElementById("dayDisplay").textContent = getDay()
    document.getElementById("lifespanDisplay").textContent = daysToYears(getLifespan())
    var pauseLabel = gameData.paused ? (tUi("sidebarPlay") || "Play") : (tUi("sidebarPause") || "Pause")
    document.getElementById("pauseButton").textContent = pauseLabel

    formatCoins(gameData.coins, document.getElementById("coinDisplay"))
    setSignDisplay()
    formatCoins(getNet(), document.getElementById("netDisplay"))
    formatCoins(getIncome(), document.getElementById("incomeDisplay"))
    formatCoins(getExpense(), document.getElementById("expenseDisplay"))

    document.getElementById("happinessDisplay").textContent = getHappiness().toFixed(1)

    document.getElementById("evilDisplay").textContent = gameData.evil.toFixed(1)
    var evilGainEl = document.getElementById("evilGainDisplay")
    if (evilGainEl) {
        evilGainEl.textContent = getEvilGain().toFixed(1)
    }

    document.getElementById("timeWarpingDisplay").textContent = "x" + gameData.taskData["Time warping"].getEffect().toFixed(2)
    var warpBtn = document.getElementById("timeWarpingButton")
    if (warpBtn) {
        warpBtn.textContent = gameData.timeWarpingEnabled ? (tUi("sidebarTimeWarpingButtonDisable") || "Disable warp") : (tUi("sidebarTimeWarpingButtonEnable") || "Enable warp")
    }

    if (document.getElementById("entropySeedDisplay")) {
        document.getElementById("entropySeedDisplay").textContent = format(gameData.entropy.seeds)
        document.getElementById("entropyInsightDisplay").textContent = format(gameData.entropy.insight)
        document.getElementById("entropyMaxInsightDisplay").textContent = format(gameData.entropy.maxInsightEver)
        document.getElementById("entropyEPDisplay").textContent = format(gameData.entropy.EP)
        var overseerButton = document.getElementById("cycleOverseerButton")
        if (overseerButton) {
            overseerButton.disabled = gameData.entropy.overseer || gameData.entropy.EP < cycleOverseerCost
            if (gameData.entropy.overseer) {
                overseerButton.textContent = tUi("entropy_overseer_button_unlocked")
            } else {
                var unlockText = tUi("entropy_overseer_button_unlock")
                if (unlockText && typeof unlockText === "string" && unlockText.indexOf("{cost}") !== -1) {
                    unlockText = unlockText.replace("{cost}", cycleOverseerCost)
                } else {
                    unlockText = unlockText || ("Unlock Cycle Overseer (" + cycleOverseerCost + " EP)")
                }
                overseerButton.textContent = unlockText
            }
        }
        var focusLabel = document.getElementById("entropyFocusDisplay")
        if (focusLabel) {
            var focusTask = getFocusedTask()
            if (!gameData.entropy.overseer) {
                focusLabel.textContent = tUi("entropy_focus_disabled")
            } else if (focusTask) {
                var suffix = tUi("entropy_focus_suffix_full_power")
                focusLabel.textContent = focusTask.name + (suffix ? " " + suffix : "")
            } else {
                focusLabel.textContent = tUi("entropy_focus_none")
            }
        }
    }

    updateUniverseUI()
}

function renderObserverScaffold() {
    var box = document.getElementById("observerScaffoldBox")
    var observerMain = document.getElementById("observerContent")
    if (!box && !observerMain) return
    if (box) box.classList.remove("hidden")
    if (observerMain) observerMain.classList.remove("hidden")
    initObserverDataIfNeeded()
    var existenceText = formatNumberShort(observerData.existence || 0)
    var existencePerSecondText = (observerData.existencePerSecond || 0).toFixed(2)
    var content = "<div><strong>Observer Mode</strong>: Universe 10 active.</div>"
    content += "<div>Existence: <strong>" + existenceText + "</strong></div>"
    content += "<div>Existence/sec: <strong>" + existencePerSecondText + "</strong></div>"

    // Upgrades
    var boostLevel = observerData.existenceBoostLevel || 0
    var boostCost = observerGetExistenceBoostCost()
    var boostMaxed = !isFinite(boostCost)
    content += "<div style='margin-top:6px;'><strong>Observer Upgrades</strong></div>"
    content += "<div id='observerBoostRow'>Existence Boost: level " + boostLevel + (boostMaxed ? " (maxed)" : " (+" + (boostLevel * 20) + "%)");
    if (!boostMaxed) {
        content += " | Cost: " + formatNumberShort(boostCost) + " Existence "
        content += "<button class='w3-button button' id='observerBoostBtn'>Buy</button>"
    }
    content += "</div>"

    // Add student section
    var addCost = observerGetNewStudentCost()
    var addCostText = addCost === 0 ? "First student is free." : "Cost: " + formatNumberShort(addCost) + " Existence"
    content += "<div style='margin-top:8px;'><button class='w3-button button' id='observerAddStudentBtn'>Add student</button> <span id='observerAddStudentInfo'>" + addCostText + "</span></div>"

    // Students list
    if (observerData.students && observerData.students.length > 0) {
        content += "<ul id='observerStudentsList'>"
        for (var i = 0; i < observerData.students.length; i++) {
            var s = observerData.students[i]
            var grade = s.intellectGrade || 1
            var cfg = observerIntellectConfigs[grade] || observerIntellectConfigs[1]
            var ageText = (s.displayAge || 0).toFixed(1)
            var upCost = observerGetIntellectUpgradeCost(s)
            var canUpgrade = isFinite(upCost)
            content += "<li>"
            content += s.name + " (Intellect: " + grade + " - " + tObserverIntellect(cfg.name) + ", Age: " + ageText + ") - " + s.displaySummary
            if (canUpgrade) {
                content += " <button class='w3-button button observerUpgradeIntellectBtn' data-id='" + s.id + "'>Upgrade intellect (" + formatNumberShort(upCost) + ")</button>"
            } else {
                content += " <span style='color: gray'>(Intellect maxed)</span>"
            }
            content += "</li>"
        }
        content += "</ul>"
    } else {
        content += "<div>No students yet.</div>"
    }
    if (box) box.innerHTML = content
    if (observerMain) observerMain.innerHTML = content
    var addButtons = document.querySelectorAll("#observerAddStudentBtn")
    addButtons.forEach(function(btn) {
        btn.disabled = observerData.existence < addCost && addCost > 0
        btn.onclick = function() {
            observerAddNewStudent()
            renderObserverScaffold()
        }
    })
    var boostButtons = document.querySelectorAll("#observerBoostBtn")
    boostButtons.forEach(function(btn) {
        btn.disabled = observerData.existence < boostCost
        btn.onclick = function() {
            observerBuyExistenceBoost()
            renderObserverScaffold()
        }
    })
    var upgradeButtons = document.querySelectorAll(".observerUpgradeIntellectBtn")
    upgradeButtons.forEach(function(btn) {
        var id = parseInt(btn.getAttribute("data-id"), 10)
        var student = observerData.students.find(function(s) { return s.id === id })
        var cost = observerGetIntellectUpgradeCost(student)
        if (student && isFinite(cost)) {
            btn.disabled = observerData.existence < cost
            btn.onclick = function() {
                observerUpgradeStudentIntellect(id)
                renderObserverScaffold()
            }
        } else {
            btn.disabled = true
        }
    })
}

function setSignDisplay() {
    var signDisplay = document.getElementById("signDisplay")
    if (getIncome() > getExpense()) {
        signDisplay.textContent = "+"
        signDisplay.style.color = "green"
    } else if (getExpense() > getIncome()) {
        signDisplay.textContent = "-"
        signDisplay.style.color = "red"
    } else {
        signDisplay.textContent = ""
        signDisplay.style.color = "gray"
    }
}

function isAutomationUnlocked() {
    var req = gameData && gameData.requirements ? gameData.requirements["Automation"] : null
    if (!req) return true
    if (typeof req.isCompleted === "function") return req.isCompleted()
    return req.completed !== false
}

function applyAutoSwitchDefaults(entropyUnlocked, automationUnlocked) {
    if (!entropyUnlocked || !automationUnlocked || autoSwitchDefaultsApplied) return
    var unlockedThisSession = entropyUnlocked && !lastEntropyUnlockedState
    var needsBackfill = entropyUnlocked && !autoSwitchFlagsPresentInSave
    if (unlockedThisSession || needsBackfill) {
        gameData.autoSwitchJobs = true
        gameData.autoSwitchSkills = true
        autoSwitchDefaultsApplied = true
        saveGameData()
    }
}

function syncAutomationCheckboxes(entropyUnlocked, automationUnlocked) {
    if (!automationUnlocked) {
        gameData.autoSwitchJobs = false
        gameData.autoSwitchSkills = false
        autoPromoteElement.disabled = true
        autoLearnElement.disabled = true
        autoPromoteElement.checked = false
        autoLearnElement.checked = false
        return
    }
    autoPromoteElement.disabled = false
    autoLearnElement.disabled = false
    autoPromoteElement.checked = !!gameData.autoSwitchJobs
    autoLearnElement.checked = !!gameData.autoSwitchSkills
}

function updateAutoSwitchState() {
    var entropyUnlocked = isEntropyUnlocked()
    var automationUnlocked = isAutomationUnlocked()
    applyAutoSwitchDefaults(entropyUnlocked, automationUnlocked)
    syncAutomationCheckboxes(entropyUnlocked, automationUnlocked)
    lastEntropyUnlockedState = entropyUnlocked
}

function getNet() {
    var net = Math.abs(getIncome() - getExpense())
    return net
}

function showIntroModal() {
    var modal = document.getElementById("introModal");
    if (!modal) return;
    modal.style.display = "block";
}

function hideIntroModal() {
    var modal = document.getElementById("introModal");
    if (!modal) return;
    modal.style.display = "none";
    if (window.gameData) {
        if (!gameData.meta) gameData.meta = {};
        gameData.meta.introSeen = true;
        if (typeof saveGameData === "function") {
            saveGameData();
        }
    }
}

function enforceEntropyTabVisibility() {
    var entropyTabButton = document.getElementById("entropyTabButton");
    var entropyTabSection = document.getElementById("entropy");
    var entropyRequirementSection = document.getElementById("entropy-requirement-section");
    var entropyBlock = document.getElementById("entropy-block");
    var tabRow = document.getElementById("tabRow");
    var tabContainer = tabRow && tabRow.parentElement ? tabRow.parentElement : null;

    if (!entropyTabButton || !entropyTabSection) {
        return;
    }

    // Entropy tab is visible only after Entropy is unlocked and at least one seed exists.
    var unlocked = typeof isEntropyUnlocked === "function"
        ? isEntropyUnlocked()
        : !!(gameData && gameData.entropy && gameData.entropy.entropyUnlocked);
    var hasSeeds = !!(gameData && gameData.entropy && gameData.entropy.seeds && gameData.entropy.seeds > 0);

    // Also respect the "Entropy tab" Requirement, if present.
    var tabReq = gameData && gameData.requirements && gameData.requirements["Entropy tab"];
    var requirementAllowsTab = true;
    if (tabReq && typeof tabReq.isCompleted === "function") {
        requirementAllowsTab = tabReq.isCompleted();
    }

    var visible = unlocked && hasSeeds && requirementAllowsTab;

    if (visible) {
        // Flag on body: can be used for styling, but no longer forces visibility.
        if (document && document.body && document.body.classList) {
            document.body.classList.add("entropy-visible");
        }

        // Show Entropy tab button and content by removing the .hidden gate.
        entropyTabButton.classList.remove("hidden");
        entropyTabSection.classList.remove("hidden");

        if (tabContainer && tabContainer.classList) {
            tabContainer.classList.remove("entropy-hidden");
        }

        if (entropyBlock && entropyBlock.classList) {
            entropyBlock.classList.remove("hidden");
        }

        if (entropyRequirementSection) {
            entropyRequirementSection.classList.remove("hidden");
        }

        if (tabReq && typeof tabReq.completed !== "undefined") {
            tabReq.completed = true;
        }
    } else {
        if (document && document.body && document.body.classList) {
            document.body.classList.remove("entropy-visible");
        }

        // Hide Entropy tab button and content by applying the .hidden gate.
        entropyTabButton.classList.add("hidden");
        entropyTabSection.classList.add("hidden");

        if (tabContainer && tabContainer.classList) {
            tabContainer.classList.add("entropy-hidden");
        }

        if (entropyBlock && entropyBlock.classList) {
            entropyBlock.classList.add("hidden");
        }

        if (entropyRequirementSection) {
            entropyRequirementSection.classList.add("hidden");
        }

        if (tabReq && typeof tabReq.completed !== "undefined") {
            tabReq.completed = false;
        }

        // Safety: if the current active tab is Entropy while it becomes locked again,
        // bump the player back to the jobs tab so they don't stare at a locked panel.
        if (typeof currentTab !== "undefined" && currentTab === "entropy" && typeof setTab === "function") {
            var jobsTabButton = document.getElementById("jobsTabButton");
            if (jobsTabButton) {
                setTab(jobsTabButton, "jobs");
            }
        }
    }
}

function hideEntities() {
    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        if (!requirement || !requirement.elements) continue
        if (key === "Entropy tab") {
            var unlockedEntropy = typeof isEntropyUnlocked === "function" ? isEntropyUnlocked() : (gameData && gameData.entropy && gameData.entropy.entropyUnlocked);
            var hasEntropySeeds = !!(gameData && gameData.entropy && gameData.entropy.seeds && gameData.entropy.seeds > 0);
            if (!unlockedEntropy || !hasEntropySeeds) {
                requirement.completed = false;
                for (element of requirement.elements) {
                    if (!element) continue
                    element.classList.add("hidden")
                }
                continue
            }
        }
        var completed = requirement.isCompleted()
        if (key == "Automation" && isEntropyUnlocked()) {
            completed = true
        }
        if (!completed && gameData.itemData && gameData.itemData[key]) {
            var item = gameData.itemData[key]
            if (item && item.discovered) {
                completed = true
                requirement.completed = true
            }
        }
        for (element of requirement.elements) {
            if (!element) continue
            if (completed) {
                element.classList.remove("hidden")
            } else {
                element.classList.add("hidden")
            }
        }
    }
}

function allStandardContentUnlocked() {
    for (categoryName in jobCategories) {
        var category = jobCategories[categoryName]
        for (entityName of category) {
            var requirement = gameData.requirements[entityName]
            if (requirement && !requirement.isCompleted()) return false
        }
    }
    for (categoryName in skillCategories) {
        var category = skillCategories[categoryName]
        for (entityName of category) {
            var requirement = gameData.requirements[entityName]
            if (requirement && !requirement.isCompleted()) return false
        }
    }
    return true
}

function showAlmanacDiscoveryDialog() {
    alert(tUi("story_almanach_found"))
}

function showEntropyUnlockedDialogOnce() {
    alert(tUi("story_almanach_bound"))
}

function maybeUnlockAlmanac() {
    if (!gameData.entropy) return
    if (gameData.entropy.hasAlmanac) return
    var ageYears = Math.floor(gameData.days / 365)
    if (ageYears < 55) return
    gameData.entropy.hasAlmanac = true
    showAlmanacDiscoveryDialog()
}

function getInsightGain(task) {
    if (!task || task.name != "Read Almanach") return 0
    // No Insight before entropy is permanently unlocked
    if (!isEntropyFullyUnlocked()) return 0
    var depth = Math.pow(Math.max(task.level, 1), 0.85)
    var happinessMult = getHappiness()
    // Apply life compression XP factor when available; fall back to neutral
    var compression = typeof getLifeCompressionFactors === "function" ? getLifeCompressionFactors(true) : { xp: 1 }
    return depth * happinessMult * (compression.xp || 1)
}

function addInsight(task, isActive) {
    var gain = getInsightGain(task)
    if (!gain || !isActive) return
    gameData.entropy.insight += applySpeed(gain)
}

function addXpFlat(task, amount) {
    task.xp += amount
    recordXpGainForPatterns(amount, task)
    while (task.xp >= task.getMaxXp()) {
        task.xp -= task.getMaxXp()
        task.level += 1
    }
}

function applyPassiveXp(task, focusTask) {
    if (task == focusTask) return
    var requirement = gameData.requirements[task.name]
    if (requirement && !requirement.isCompleted()) return
    var baseXp = task.getXpGain()
    if (task instanceof Job && highTierJobs.includes(task.name) && gameData.taskData["Reality Architecture"]) {
        baseXp /= gameData.taskData["Reality Architecture"].getEffect()
    }
    var compression = getLifeCompressionFactors(false)
    var passiveGain = baseXp * 0.2 * getFocusMultiplier(focusTask) * getPassiveAgeFactor() * getEntropySynergy() * compression.xp
    passiveGain *= getPassiveArtifactPenalty()
    addXpFlat(task, applySpeed(passiveGain))
    if (task.name == "Read Almanach" && isEntropyFullyUnlocked()) {
        var insightGain = getInsightGain(task) * 0.2 * getFocusMultiplier(focusTask) * getPassiveAgeFactor() * getEntropySynergy()
        gameData.entropy.insight += applySpeed(insightGain)
    }
}

function doCurrentTask(task) {
    task.increaseXp()
    if (task instanceof Job) {
        increaseCoins()
    }
    addInsight(task, true)
}

function tickTasks() {
    var focusJob = gameData.currentJob
    var focusSkill = gameData.currentSkill
    var overseerFocus = isCycleOverseerActive() ? getFocusedTask() : null
    if (overseerFocus instanceof Job) {
        focusJob = overseerFocus
    } else if (overseerFocus instanceof Skill) {
        focusSkill = overseerFocus
    }

    for (key in gameData.taskData) {
        var task = gameData.taskData[key]
        var requirement = gameData.requirements[task.name]
        if (requirement && !requirement.isCompleted()) continue
        var isJob = task instanceof Job
        var isSkill = task instanceof Skill
        var isFocus = (isJob && focusJob && task.name == focusJob.name) || (isSkill && focusSkill && task.name == focusSkill.name)
        var xpMult = isFocus ? 1 : (isJob ? PASSIVE_JOB_XP_MULTIPLIER : PASSIVE_SKILL_XP_MULTIPLIER)
        var compression = getLifeCompressionFactors(isFocus)
        var baseXp = task.getXpGain()
        if (isJob && !isFocus && highTierJobs.includes(task.name) && gameData.taskData["Reality Architecture"]) {
            baseXp /= gameData.taskData["Reality Architecture"].getEffect()
        }
        var xpGain = baseXp * xpMult * (compression.xp || 1)
        addXpFlat(task, applySpeed(xpGain))
        if (task.name == "Read Almanach" && isEntropyFullyUnlocked()) {
            gameData.entropy.insight += applySpeed(getInsightGain(task) * xpMult)
        }
    }

    increaseCoins()
}

function ensureActiveSelections() {
    if (!gameData || !gameData.taskData) return
    if (!gameData.currentJob || !gameData.taskData[gameData.currentJob.name]) {
        gameData.currentJob = gameData.taskData["Beggar"]
    }
    if (!gameData.currentSkill || !gameData.taskData[gameData.currentSkill.name]) {
        gameData.currentSkill = gameData.taskData["Concentration"]
    }
}

function getIncome() {
    var compression = getLifeCompressionFactors(true)
    var jitter = 1
    if ((gameData.universeIndex || 1) >= 8) {
        var strain = gameData.cycleStrain || 0
        if (strain > 5) {
            jitter += (Math.random() * 0.08 - 0.04) * Math.min((strain - 5) / 5, 1)
        }
    }
    var focusJobName = null
    if (isCycleOverseerActive()) {
        var focusTask = getFocusedTask()
        if (focusTask && focusTask instanceof Job) {
            focusJobName = focusTask.name
        }
    }
    if (!focusJobName && gameData.currentJob) {
        focusJobName = gameData.currentJob.name
    }
    var income = 0
    for (key in gameData.taskData) {
        var task = gameData.taskData[key]
        if (!(task instanceof Job)) continue
        var requirement = gameData.requirements[task.name]
        var unlocked = (!requirement) || requirement.isCompleted()
        if (!unlocked) continue
        var mult = task.name === focusJobName ? 1 : PASSIVE_JOB_INCOME_MULTIPLIER
        var baseIncome = task.getIncome() || 0
        income += baseIncome * mult
    }
    return income * compression.money * jitter
}

function increaseCoins() {
    var coins = applySpeed(getIncome())
    gameData.coins += coins
    recordIncomeForPatterns(coins)
}

function daysToYears(days) {
    var years = Math.floor(days / 365)
    return years
}

function getCategoryFromEntityName(categoryType, entityName) {
    for (categoryName in categoryType) {
        var category = categoryType[categoryName]
        if (category.includes(entityName)) {
            return category
        }
    }
}

function getNextEntity(data, categoryType, entityName) {
    var category = getCategoryFromEntityName(categoryType, entityName)
    if (!category) return null
    var nextIndex = category.indexOf(entityName) + 1
    if (nextIndex > category.length - 1) return null
    var nextEntityName = category[nextIndex]
    var nextEntity = data[nextEntityName]
    return nextEntity
}

function getAutoSwitchThreshold() {
    var threshold = BASE_AUTO_SWITCH_THRESHOLD
    if (isEntropyUnlocked()) {
        threshold *= getEntropySwitchThresholdModifier()
        threshold *= getPatternFactor_Opportunist_forAutoSwitch()
        if (gameData.entropyArtifacts && gameData.entropyArtifacts.chainConductor) {
            threshold *= 0.85
        }
    }
    if (threshold < 0.05) threshold = 0.05
    return threshold
}

function shouldAutoSwitch(currentTask, nextTask) {
    if (!nextTask || !currentTask) return false
    if (nextTask == currentTask) return false
    if (!isEntropyFullyUnlocked()) {
        if (isEntropyOnlySkill(currentTask) || isEntropyOnlySkill(nextTask)) return false
    }
    var threshold = getAutoSwitchThreshold()
    if (currentTask instanceof Job && nextTask instanceof Job) {
        var currentScore = currentTask.baseData.income || currentTask.baseData.maxXp || 1
        var candidateScore = nextTask.baseData.income || nextTask.baseData.maxXp || 1
        return candidateScore >= currentScore * (1 + threshold)
    }
    if (currentTask instanceof Skill && nextTask instanceof Skill) {
        var currentScoreSkill = currentTask.level + 1
        var candidateScoreSkill = nextTask.level + 1
        // Для навыков переключаемся на более низкий уровень, чтобы выравнивать прокачку
        return candidateScoreSkill < currentScoreSkill * (1 - threshold / 2)
    }
    return true
}

function autoPromote() {
    if (!gameData.autoSwitchJobs) return
    var nextEntity = getNextEntity(gameData.taskData, jobCategories, gameData.currentJob.name)
    if (nextEntity == null) {
        nextEntity = getNextEntity(gameData.taskData, entropyJobCategories, gameData.currentJob.name)
    }
    if (nextEntity == null) return
    var requirement = gameData.requirements[nextEntity.name]
    var unlocked = !requirement || (typeof requirement.isCompleted === "function" ? requirement.isCompleted() : requirement.completed !== false)
    if (!unlocked) return
    if (!shouldAutoSwitch(gameData.currentJob, nextEntity)) return
    if (!attemptSelectTask(nextEntity)) return
    if (isCycleOverseerActive()) {
        gameData.entropy.focusTask = nextEntity.name
    }
}

function checkSkillSkipped(skill) {
    if (!skill) return false
    return !!skill.skip
}

function isSkillUnlockedForAutoLearn(skill) {
    if (!(skill instanceof Skill)) return false

    // Use the same row visibility as UI (hiddenTask / display:none)
    var row = document.getElementById("row " + skill.name)
    if (row && typeof isRowVisible === "function" && !isRowVisible(row)) {
        return false
    }

    var requirement = null
    if (gameData && gameData.requirements) {
        requirement = gameData.requirements[skill.name]
    }

    if (requirement) {
        if (typeof requirement.isCompleted === "function") {
            if (!requirement.isCompleted()) return false
        } else if (requirement.completed === false) {
            return false
        }
    }

    if (checkSkillSkipped(skill)) return false
    return true
}

function setSkillWithLowestMaxXp() {
    var xpDict = {}

    for (skillName in gameData.taskData) {
        var skill = gameData.taskData[skillName]
        if (!isSkillUnlockedForAutoLearn(skill)) continue
        xpDict[skill.name] = skill.level // original metric
    }

    var keys = Object.keys(xpDict)
    if (keys.length === 0) {
        skillWithLowestMaxXp = gameData.taskData["Concentration"]
        return
    }

    var skillName = getKeyOfLowestValueFromDict(xpDict)
    skillWithLowestMaxXp = gameData.taskData[skillName]
}

function getKeyOfLowestValueFromDict(dict) {
    var values = []
    for (key in dict) {
        var value = dict[key]
        values.push(value)
    }

    values.sort(function(a, b){return a - b})

    for (key in dict) {
        var value = dict[key]
        if (value == values[0]) {
            return key
        }
    }
}

function autoLearn() {
    if (!gameData.autoSwitchSkills) return
    if (!skillWithLowestMaxXp) {
        setSkillWithLowestMaxXp()
        if (!skillWithLowestMaxXp) return
    }
    if (!attemptSelectTask(skillWithLowestMaxXp)) return
    if (isCycleOverseerActive()) {
        gameData.entropy.focusTask = gameData.currentSkill.name
    }
}

function yearsToDays(years) {
    var days = years * 365
    return days
}
 
function getDay() {
    var day = Math.floor(gameData.days - daysToYears(gameData.days) * 365)
    return day
}

function increaseDays() {
    var compression = getLifeCompressionFactors(true)
    var jitter = 1
    if ((gameData.universeIndex || 1) >= 8) {
        var strain = gameData.cycleStrain || 0
        if (strain > 5) {
            jitter += (Math.random() * 0.1 - 0.05) * Math.min((strain - 5) / 5, 1)
        }
    }
    var increase = applySpeed(1 * compression.age * jitter)
    gameData.days += increase
}

function format(number) {

    // what tier? (determines SI symbol)
    var tier = Math.log10(number) / 3 | 0;

    // if zero, we don't need a suffix
    if(tier == 0) return number;

    // get suffix and determine scale
    var suffix = units[tier];
    var scale = Math.pow(10, tier * 3);

    // scale the number
    var scaled = number / scale;

    // format number and add suffix
    return scaled.toFixed(1) + suffix;
}

function formatCoins(coins, element) {
    var tiers = ["p", "g", "s"]
    var colors = {
        "p": "#79b9c7",
        "g": "#E5C100",
        "s": "#a8a8a8",
        "c": "#a15c2f"
    }
    var leftOver = coins
    var i = 0
    for (tier of tiers) {
        var x = Math.floor(leftOver / Math.pow(10, (tiers.length - i) * 2))
        var leftOver = Math.floor(leftOver - x * Math.pow(10, (tiers.length - i) * 2))
        var text = format(String(x)) + tier + " "
        element.children[i].textContent = x > 0 ? text : ""
        element.children[i].style.color = colors[tier]
        i += 1
    }
    if (leftOver == 0 && coins > 0) {element.children[3].textContent = ""; return}
    var text = String(Math.floor(leftOver)) + "c"
    element.children[3].textContent = text
    element.children[3].style.color = colors["c"]
}

function getTaskElement(taskName) {
    var task = gameData.taskData[taskName]
    var element = task && task.id ? document.getElementById(task.id) : null
    if (!element) {
        element = document.getElementById("row " + taskName)
    }
    return element
}

function getItemElement(itemName) {
    var item = gameData.itemData[itemName]
    var element = document.getElementById(item.id)
    return element
}

function getElementsByClass(className) {
    var elements = document.getElementsByClassName(removeSpaces(className))
    return elements
}

function setLightDarkMode() {
    var body = document.getElementById("body")
    body.classList.contains("dark") ? body.classList.remove("dark") : body.classList.add("dark")
}

function removeSpaces(string) {
    var string = string.replace(/ /g, "")
    return string
}

function performRebirth(hardReset) {
    updateEntropyPatternsOnRebirth()
    if (hardReset) {
        rebirthReset()
        return
    }
    rebirthReset()
}

function ensureEntropyState() {
    var defaults = {
        entropyUnlocked: false,
        hasAlmanac: false,
        seeds: 0,
        insight: 0,
        EP: 0,
        maxInsightEver: 0,
        overseer: false,
        focusTask: null,
        unifiedArchitecture: false,
    }
    if (!gameData.entropy) {
        gameData.entropy = Object.assign({}, defaults)
    } else {
        if (gameData.entropy.unlocked && gameData.entropy.entropyUnlocked === undefined) {
            gameData.entropy.entropyUnlocked = true
        }
        for (key in defaults) {
            if (gameData.entropy[key] === undefined) {
                gameData.entropy[key] = defaults[key]
            }
        }
    }
}

function ensureEntropyUpgradesState() {
    var defaults = {
        velocity: {
            temporalMomentum: 0,
            earlyCompression: 0,
            chainProgression: 0,
            momentumPersistence: 0,
        },
        stability: {
            entropyStability: 0,
            lifeContinuity: 0,
            balancedGrowth: 0,
        },
        meta: {
            unifiedArchitecture: 0,
        },
    }
    if (!gameData.entropyUpgrades) {
        gameData.entropyUpgrades = JSON.parse(JSON.stringify(defaults))
        return
    }
    for (branch in defaults) {
        if (!gameData.entropyUpgrades[branch]) {
            gameData.entropyUpgrades[branch] = JSON.parse(JSON.stringify(defaults[branch]))
            continue
        }
        for (key in defaults[branch]) {
            if (gameData.entropyUpgrades[branch][key] === undefined) {
                gameData.entropyUpgrades[branch][key] = defaults[branch][key]
            }
        }
    }
}

function ensureEntropyPatternsState() {
    var defaults = {
        lifeStats: {
            ticksInJobs: 0,
            ticksInSkills: 0,
            rebirthCount: 0,
            currentLifeTicks: 0,
            autoSwitchUsed: false,
            totalIncomeThisLife: 0,
            totalXpThisLife: 0,
        },
        patterns: {
            laborCycle: {xp: 0, level: 0},
            scholarLoop: {xp: 0, level: 0},
            compressedLife: {xp: 0, level: 0},
            stableCycle: {xp: 0, level: 0},
            opportunist: {xp: 0, level: 0},
        },
    }
    if (!gameData.entropyPatterns) {
        gameData.entropyPatterns = JSON.parse(JSON.stringify(defaults))
        return
    }
    if (!gameData.entropyPatterns.lifeStats) {
        gameData.entropyPatterns.lifeStats = JSON.parse(JSON.stringify(defaults.lifeStats))
    } else {
        for (key in defaults.lifeStats) {
            if (gameData.entropyPatterns.lifeStats[key] === undefined) {
                gameData.entropyPatterns.lifeStats[key] = defaults.lifeStats[key]
            }
        }
    }
    if (!gameData.entropyPatterns.patterns) {
        gameData.entropyPatterns.patterns = JSON.parse(JSON.stringify(defaults.patterns))
    } else {
        for (key in defaults.patterns) {
            if (!gameData.entropyPatterns.patterns[key]) {
                gameData.entropyPatterns.patterns[key] = {xp: 0, level: 0}
            } else {
                if (gameData.entropyPatterns.patterns[key].xp === undefined) gameData.entropyPatterns.patterns[key].xp = 0
                if (gameData.entropyPatterns.patterns[key].level === undefined) gameData.entropyPatterns.patterns[key].level = 0
            }
        }
    }
    if (!gameData.entropyPatterns.dominantMemory) {
        gameData.entropyPatterns.dominantMemory = {name: null, level: 0}
    }
}

function ensureEntropyArtifactsState() {
    var defaults = {
        sigilMomentum: false,
        chainConductor: false,
        loopAnchor: false,
        patternResonator: false,
    }
    if (!gameData.entropyArtifacts) {
        gameData.entropyArtifacts = Object.assign({}, defaults)
        return
    }
    for (key in defaults) {
        if (gameData.entropyArtifacts[key] === undefined) {
            gameData.entropyArtifacts[key] = defaults[key]
        }
    }
}

function ensureShopState() {
    if (!gameData.purchasedItems) gameData.purchasedItems = {}
    if (!gameData.categoryPurchaseCounts) gameData.categoryPurchaseCounts = {}

    // Ensure currently equipped items are treated as purchased so legacy saves remain usable.
    var activeNames = []
    if (gameData.currentProperty && gameData.currentProperty.name) activeNames.push(gameData.currentProperty.name)
    if (Array.isArray(gameData.currentMisc)) {
        gameData.currentMisc.forEach(function(m) {
            if (m && m.name) activeNames.push(m.name)
        })
    }
    activeNames.forEach(function(name) {
        if (isFreeStarterItem(name)) return
        gameData.purchasedItems[name] = true
    })

    // Rebuild per-category counters based on purchased items.
    var rebuiltCounts = {}
    for (var itemName in gameData.purchasedItems) {
        if (!gameData.purchasedItems[itemName]) continue
        if (isFreeStarterItem(itemName)) continue
        var categoryName = getItemCategoryName(itemName)
        if (!categoryName) continue
        rebuiltCounts[categoryName] = (rebuiltCounts[categoryName] || 0) + 1
    }
    gameData.categoryPurchaseCounts = rebuiltCounts
}

function ensureEntropyBackfills() {
    ensureEntropyState()
    ensureEntropyUpgradesState()
    ensureEntropyPatternsState()
    ensureEntropyArtifactsState()
}

function ensureAutoSwitchState() {
    if (gameData.autoSwitchJobs === undefined) {
        gameData.autoSwitchJobs = false
    }
    if (gameData.autoSwitchSkills === undefined) {
        gameData.autoSwitchSkills = false
    }
}

function ensureRequirementsBackfill() {
    if (!tempData["requirements"]) return
    if (!gameData.requirements) {
        gameData.requirements = {}
    }

    // Add any missing requirement entries from the current templates
    for (var key in tempData["requirements"]) {
        if (!tempData["requirements"].hasOwnProperty(key)) continue
        if (!gameData.requirements[key]) {
            gameData.requirements[key] = tempData["requirements"][key]
        }
    }
}

function ensureSkipSkillsState() {
    if (!gameData.skipSkills) {
        gameData.skipSkills = {}
    }
    if (!gameData.taskData) return
    for (var key in gameData.taskData) {
        if (!gameData.taskData.hasOwnProperty(key)) continue
        var task = gameData.taskData[key]
        if (task.skip === undefined) {
            if (gameData.skipSkills.hasOwnProperty(task.name)) {
                task.skip = !!gameData.skipSkills[task.name]
            } else {
                task.skip = false
            }
        }
        gameData.skipSkills[task.name] = !!task.skip
    }
}

function ensureUniverseState() {
    if (gameData.universeIndex === undefined) {
        gameData.universeIndex = 1
    }
    if (gameData.universeTokens === undefined) {
        gameData.universeTokens = 0
    }
    if (gameData.burnoutLevel === undefined) {
        gameData.burnoutLevel = 0
    }
    if (gameData.majorChoiceSlotsTotal === undefined) {
        gameData.majorChoiceSlotsTotal = 4
    }
    if (gameData.majorChoicesUsed === undefined) {
        gameData.majorChoicesUsed = 0
    }
    if (!gameData.majorChoicesChosen) {
        gameData.majorChoicesChosen = {}
    }
    if (gameData.meaning === undefined) {
        gameData.meaning = 0
    }
    if (!gameData.meaningMilestones) {
        gameData.meaningMilestones = {}
    }
    if (gameData.cycleStrain === undefined) {
        gameData.cycleStrain = 0
    }
    if (gameData.metaAwareness === undefined) {
        gameData.metaAwareness = 0
    }
    if (!gameData.metaWeights) {
        gameData.metaWeights = {patterns: 1, aging: 1, burnout: 1, compression: 1, meaning: 1, cycle: 1}
    }
    if (gameData.metaTunesSpent === undefined) {
        gameData.metaTunesSpent = 0
    }
    if (observerData === null) {
        observerData = {initialized: false}
    }
}

function universeGatedRequirementMet(requiredUniverse) {
    return (gameData.universeIndex || 1) >= requiredUniverse
}

function ensureFirstTimePromptState() {
    if (gameData.hasAnsweredFirstTimePrompt === undefined) {
        gameData.hasAnsweredFirstTimePrompt = false
    }
}

function ensureLanguageState() {
    if (!gameData.language) {
        gameData.language = LANG.RU
    }
}

function ensureMetaState() {
    if (!gameData.meta) {
        gameData.meta = {}
    }
    if (typeof gameData.meta.introSeen !== "boolean") {
        gameData.meta.introSeen = false
    }
}

function ensureCoinRequirementKeys() {
    if (!gameData || !gameData.requirements) return
    for (var key in gameData.requirements) {
        if (!gameData.requirements.hasOwnProperty(key)) continue
        var req = gameData.requirements[key]
        if (req && req.type === "coins" && !req.key) {
            req.key = key
        }
    }
}

function handleFirstTimePrompt() {
    if (gameData.hasAnsweredFirstTimePrompt === true) return
    gameData.hasAnsweredFirstTimePrompt = true
    saveGameData()
}

function applyEntropyRebirthGain() {
    var gain = Math.floor(Math.pow(gameData.entropy.insight, 0.6))
    gameData.entropy.EP += gain
    gameData.entropy.maxInsightEver = Math.max(gameData.entropy.maxInsightEver, gameData.entropy.insight)
    gameData.entropy.insight = 0
}

function updateEntropyPatternsOnRebirth() {
    if (gameData.entropy && gameData.entropy.unifiedArchitecture) return
    ensureEntropyPatternsState()
    var lifeStats = gameData.entropyPatterns.lifeStats
    var patterns = gameData.entropyPatterns.patterns
    var totalTicks = Math.max(0, lifeStats.currentLifeTicks || 0)
    var fractionJobs = totalTicks > 0 ? lifeStats.ticksInJobs / totalTicks : 0
    var fractionSkills = totalTicks > 0 ? lifeStats.ticksInSkills / totalTicks : 0
    var fractionMixed = 1 - Math.abs(fractionJobs - fractionSkills)
    if (fractionMixed < 0) fractionMixed = 0
    var ageEnd = daysToYears(gameData.days)
    var shortLife = ageEnd <= 30
    var longLife = ageEnd >= 60

    function clamp01(x) {
        if (x < 0) return 0
        if (x > 1) return 1
        return x
    }

    function addPatternXp(name, score) {
        if (!patterns[name]) return
        patterns[name].xp += Math.max(0, score || 0)
        var level = Math.floor(Math.pow(patterns[name].xp, 0.5))
        if (level > ENTROPY_PATTERN_MAX_LEVEL) level = ENTROPY_PATTERN_MAX_LEVEL
        patterns[name].level = level
    }

    var laborScore = clamp01(fractionJobs - 0.3)
    var scholarScore = clamp01(fractionSkills - 0.3)
    var compressedScore = shortLife ? 1 : 0
    var stableScore = longLife ? clamp01(fractionMixed) : 0
    var opportunistScore = lifeStats.autoSwitchUsed ? clamp01(fractionMixed) : 0

    addPatternXp("laborCycle", laborScore)
    addPatternXp("scholarLoop", scholarScore)
    addPatternXp("compressedLife", compressedScore)
    addPatternXp("stableCycle", stableScore)
    addPatternXp("opportunist", opportunistScore)

    lifeStats.rebirthCount = (lifeStats.rebirthCount || 0) + 1
    lifeStats.ticksInJobs = 0
    lifeStats.ticksInSkills = 0
    lifeStats.currentLifeTicks = 0
    lifeStats.autoSwitchUsed = false
    lifeStats.totalIncomeThisLife = 0
    lifeStats.totalXpThisLife = 0
    if ((gameData.universeIndex || 1) >= 3) {
        updateDominantPatternMemory()
    }
    if ((gameData.universeIndex || 1) >= 7) {
        gameData.meaning = 0
        gameData.meaningMilestones = {}
    }
    if ((gameData.universeIndex || 1) >= 8) {
        gameData.cycleStrain = 0
    }
    if ((gameData.universeIndex || 1) >= 9) {
        gameData.metaAwareness = 0
        gameData.metaWeights = {patterns: 1, aging: 1, burnout: 1, compression: 1, meaning: 1, cycle: 1}
        gameData.metaTunesSpent = 0
    }
}

function bindEntropyOnFirstRebirth() {
    if (!gameData.entropy) return
    if (!gameData.entropy.hasAlmanac) return
    if (gameData.entropy.entropyUnlocked) return

    gameData.entropy.entropyUnlocked = true
    gameData.entropy.seeds = Math.max(gameData.entropy.seeds || 0, 1)
    initEntropyGame()
    alert(tUi("story_almanach_bound"))
}

function maybeUnlockEntropyOnRebirth() {
    if (!gameData.entropy) return
    if (!gameData.entropy.hasAlmanac) return
    if (gameData.entropy.entropyUnlocked) return
    bindEntropyOnFirstRebirth()
}

function rebirthOne() {
    updateEntropyPatternsOnRebirth()
    gameData.rebirthOneCount += 1
    applyEntropyRebirthGain()

    maybeUnlockEntropyOnRebirth()
    rebirthReset()
}

function rebirthTwo() {
    updateEntropyPatternsOnRebirth()
    gameData.rebirthTwoCount += 1
    gameData.evil += getEvilGain()
    applyEntropyRebirthGain()

    rebirthReset()

    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]
        task.maxLevel = 0
    }    
}

function entropyHardReset() {
    updateEntropyPatternsOnRebirth()
    rebirthReset()
    gameData.days = 0
    gameData.coins = 0
}

function rebirthReset() {
    setTab(jobTabButton, "jobs")
    gameData.entropy.focusTask = null
    universeSwitchPenalty = 0
    lastJobName = null
    lastSkillName = null
    gameData.majorChoicesUsed = 0
    gameData.majorChoicesChosen = {}

    gameData.coins = 0
    gameData.days = 365 * 14
    gameData.currentJob = gameData.taskData["Beggar"]
    gameData.currentSkill = gameData.taskData["Concentration"]
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []
    gameData.purchasedItems = {}
    gameData.categoryPurchaseCounts = {}

    for (taskName in gameData.taskData) {
        var task = gameData.taskData[taskName]
        if (task.level > task.maxLevel) task.maxLevel = task.level
        task.level = 0
        task.xp = 0
    }

    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        if (requirement.completed && permanentUnlocks.includes(key)) continue
        requirement.completed = false
    }
}

function getLifespan() {
    var immortality = gameData.taskData["Immortality"]
    var superImmortality = gameData.taskData["Super immortality"]
    var lifespan = baseLifespan * immortality.getEffect() * superImmortality.getEffect() * getEntropyLongevityBoost()
    return lifespan
}

function isAlive() {
    var condition = gameData.days < getLifespan()
    var deathText = document.getElementById("deathText")
    if (!condition) {
        gameData.days = getLifespan()
        deathText.classList.remove("hidden")
    }
    else {
        deathText.classList.add("hidden")
    }
    return condition
}

function assignMethods() {

    for (key in gameData.taskData) {
        var task = gameData.taskData[key]
        var baseData = jobBaseData[task.name] || entropyJobBaseData[task.name] || skillBaseData[task.name] || entropySkillBaseData[task.name]
        if (baseData.income) {
            task.baseData = baseData
            task = Object.assign(new Job(baseData), task)
            
        } else {
            task.baseData = baseData
            task = Object.assign(new Skill(baseData), task)
        } 
        gameData.taskData[key] = task
    }

    for (key in gameData.itemData) {
        var item = gameData.itemData[key]
        item.baseData = itemBaseData[item.name]
        item = Object.assign(new Item(itemBaseData[item.name]), item)
        gameData.itemData[key] = item
    }

    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        if (requirement.type == "task") {
            requirement = Object.assign(new TaskRequirement(requirement.elements, requirement.requirements), requirement)
        } else if (requirement.type == "coins") {
            requirement = Object.assign(new CoinRequirement(requirement.elements, requirement.requirements), requirement)
        } else if (requirement.type == "age") {
            requirement = Object.assign(new AgeRequirement(requirement.elements, requirement.requirements), requirement)
        } else if (requirement.type == "evil") {
            requirement = Object.assign(new EvilRequirement(requirement.elements, requirement.requirements), requirement)
        } else if (requirement.type == "entropy") {
            requirement = Object.assign(new EntropyRequirement(requirement.elements, requirement.requirements), requirement)
        }

        var tempRequirement = tempData["requirements"][key]
        requirement.elements = tempRequirement.elements
        requirement.requirements = tempRequirement.requirements
        gameData.requirements[key] = requirement
    }

    // Rebind current selections to the new task/item objects.
    // Be defensive: saved data may contain nulls or outdated names.

    if (gameData.currentJob && gameData.taskData[gameData.currentJob.name]) {
        gameData.currentJob = gameData.taskData[gameData.currentJob.name]
    } else {
        gameData.currentJob = gameData.taskData["Beggar"]
    }

    if (gameData.currentSkill && gameData.taskData[gameData.currentSkill.name]) {
        gameData.currentSkill = gameData.taskData[gameData.currentSkill.name]
    } else {
        gameData.currentSkill = gameData.taskData["Concentration"]
    }

    if (gameData.currentProperty && gameData.itemData[gameData.currentProperty.name]) {
        gameData.currentProperty = gameData.itemData[gameData.currentProperty.name]
    } else {
        gameData.currentProperty = gameData.itemData["Homeless"]
    }

    var newArray = []
    if (Array.isArray(gameData.currentMisc)) {
        for (var misc of gameData.currentMisc) {
            if (misc && misc.name && gameData.itemData[misc.name]) {
                newArray.push(gameData.itemData[misc.name])
            }
        }
    }
    gameData.currentMisc = newArray
}

function replaceSaveDict(dict, saveDict) {
    for (key in dict) {
        if (!(key in saveDict)) {
            saveDict[key] = dict[key]
        } else if (dict == gameData.requirements) {
            if (saveDict[key].type != tempData["requirements"][key].type) {
                saveDict[key] = tempData["requirements"][key]
            }
        }
    }

    for (key in saveDict) {
        if (!(key in dict)) {
            delete saveDict[key]
        }
    }
}

function saveGameData() {
    gameData.observerData = observerData
    localStorage.setItem("gameDataSave", JSON.stringify(gameData))
}

function getSavedGameData() {
    var raw = localStorage.getItem("gameDataSave")
    if (!raw) return null
    try {
        return JSON.parse(raw)
    } catch (e) {
        return null
    }
}

function loadGameData() {
    var gameDataSave = JSON.parse(localStorage.getItem("gameDataSave"))

    if (gameDataSave !== null) {
        replaceSaveDict(gameData, gameDataSave)
        replaceSaveDict(gameData.requirements, gameDataSave.requirements)
        replaceSaveDict(gameData.taskData, gameDataSave.taskData)
        replaceSaveDict(gameData.itemData, gameDataSave.itemData)

        gameData = gameDataSave
        if (!gameData.settings) gameData.settings = {autoPickShop: false}
        if (gameData.settings.autoPickShop === undefined) gameData.settings.autoPickShop = false
        observerData = gameData.observerData || observerData || {initialized: false}
        initObserverDataIfNeeded()
    }

    ensureEntropyBackfills()
    ensureRequirementsBackfill()
    ensureAutoSwitchState()
    ensureSkipSkillsState()
    ensureUniverseState()
    ensureFirstTimePromptState()
    ensureShopState()
    assignMethods()
    ensureCoinRequirementKeys()
}

function updateUI() {
    enforceEntropyTabVisibility()
    updateTaskRows()
    updateItemRows()
    updateRequiredRows(gameData.taskData, jobCategories)
    updateRequiredRows(gameData.taskData, skillCategories)
    updateRequiredRows(gameData.taskData, entropyJobCategories)
    updateRequiredRows(gameData.taskData, entropySkillCategories)
    updateRequiredRows(gameData.itemData, itemCategories)
    updateHeaderRows(jobCategories)
    updateHeaderRows(skillCategories)
    updateHeaderRows(entropyJobCategories)
    updateHeaderRows(entropySkillCategories)
    hideEntities()
    enforceEntropySkillVisibility()
    updateQuickTaskDisplay("job")
    updateQuickTaskDisplay("skill")
    var entropyJobSection = document.getElementById("entropyJobsSection")
    if (entropyJobSection) entropyJobSection.style.display = isEntropyUnlocked() ? "block" : "none"
    var entropySkillSection = document.getElementById("entropySkillsSection")
    if (entropySkillSection) entropySkillSection.style.display = isEntropyUnlocked() ? "block" : "none"
    updateShopAutoPickState()
    updateShopRecommendation()
    updateText()
    if (isObserverMode()) {
        initObserverDataIfNeeded()
        renderObserverScaffold()
        var lifeRoot = document.getElementById("life-root")
        var lifeRootTabs = document.getElementById("life-root-tabs")
        var lifeRootContent = document.getElementById("life-root-content")
        var observerRoot = document.getElementById("observer-root")
        if (lifeRoot) lifeRoot.classList.add("hidden")
        if (lifeRootTabs) lifeRootTabs.classList.add("hidden")
        if (lifeRootContent) lifeRootContent.classList.add("hidden")
        if (observerRoot) observerRoot.classList.remove("hidden")
    } else {
        var lifeRoot = document.getElementById("life-root")
        var lifeRootTabs = document.getElementById("life-root-tabs")
        var lifeRootContent = document.getElementById("life-root-content")
        var observerRoot = document.getElementById("observer-root")
        if (lifeRoot) lifeRoot.classList.remove("hidden")
        if (lifeRootTabs) lifeRootTabs.classList.remove("hidden")
        if (lifeRootContent) lifeRootContent.classList.remove("hidden")
        if (observerRoot) observerRoot.classList.add("hidden")
    }
    updateDebugPanel()
}

function showSettingsMessage(text, type) {
    var el = document.getElementById("settingsMessage")
    if (!el) return
    el.textContent = text || ""
    el.classList.remove("success", "error", "info")
    if (type) el.classList.add(type)
}

function update() {
    if (isObserverMode()) {
        initObserverDataIfNeeded()
        if (observerData.students.length === 0) {
            observerAddNewStudent()
        }
        updateObserverMode(1 / updateSpeed)
    } else {
        ensureActiveSelections()
        updateAutoSwitchState()
        decaySwitchPenalty()
        decayBurnout()
        updateMeaning()
        updateCycleStrain()
        tryMetaTune()
        recordLifeTickParticipation()
        increaseDays()
        maybeUnlockAlmanac()
        autoPromote()
        autoLearn()
        tickTasks()
        applyExpenses()
    }
    updateUI()
    checkForcedRebirth()
}

function resetGameData() {
    localStorage.clear()
    try {
        sessionStorage.clear()
    } catch (e) {}
    gameData = {
        universeIndex: 1,
        universeTokens: 0,
        majorChoiceSlotsTotal: 4,
        majorChoicesUsed: 0,
        majorChoicesChosen: {},
        meaning: 0,
        meaningMilestones: {},
        cycleStrain: 0,
        settings: {autoPickShop: false},
        metaAwareness: 0,
        metaWeights: {patterns: 1, aging: 1, burnout: 1, compression: 1, meaning: 1, cycle: 1},
        metaTunesSpent: 0,
        language: LANG.RU,
        observerData: {initialized: false},
        taskData: {},
        itemData: {},
        purchasedItems: {},
        categoryPurchaseCounts: {},
        coins: 0,
        days: 365 * 14,
        evil: 0,
        paused: false,
        timeWarpingEnabled: true,
        rebirthOneCount: 0,
        rebirthTwoCount: 0,
        currentJob: null,
        currentSkill: null,
        currentProperty: null,
        currentMisc: null,
        hasAnsweredFirstTimePrompt: false,
        autoSwitchJobs: false,
        autoSwitchSkills: false,
        entropyUpgrades: {
            velocity: {
                temporalMomentum: 0,
                earlyCompression: 0,
                chainProgression: 0,
                momentumPersistence: 0,
                wealthFocus: 0,
                masteryFocus: 0,
            },
            stability: {
                entropyStability: 0,
                lifeContinuity: 0,
                balancedGrowth: 0,
                shortBrilliantLife: 0,
                longSteadyLife: 0,
                earlyPeak: 0,
                lateBloom: 0,
                smoothing: 0,
                quietMind: 0,
                patternAttunement: 0,
            },
            meta: {
                unifiedArchitecture: 0,
            },
        },
        entropyPatterns: {
            lifeStats: {
                ticksInJobs: 0,
                ticksInSkills: 0,
                rebirthCount: 0,
                currentLifeTicks: 0,
                autoSwitchUsed: false,
                totalIncomeThisLife: 0,
                totalXpThisLife: 0,
            },
            patterns: {
                laborCycle: {xp: 0, level: 0},
                scholarLoop: {xp: 0, level: 0},
                compressedLife: {xp: 0, level: 0},
                stableCycle: {xp: 0, level: 0},
                opportunist: {xp: 0, level: 0},
            },
        },
        entropyArtifacts: {
            sigilMomentum: false,
            chainConductor: false,
            loopAnchor: false,
            patternResonator: false,
        },
        entropy: {
            unlocked: false,
            seeds: 0,
            insight: 0,
            EP: 0,
            maxInsightEver: 0,
            overseer: false,
            focusTask: null,
            unifiedArchitecture: false,
        },
    }
    baseInitialized = false
    entropyInitialized = false
    autoSwitchFlagsPresentInSave = false
    autoSwitchDefaultsApplied = false
    lastEntropyUnlockedState = false

    var reloadWithCacheBust = function() {
        var href = window.location && window.location.href ? window.location.href : ""
        var base = href.split("#")[0].split("?")[0]
        var sep = base.indexOf("?") === -1 ? "?" : "&"
        window.location.replace(base + sep + "reset=" + Date.now())
    }

    var cachePromises = []
    try {
        if (typeof caches !== "undefined" && typeof caches.keys === "function") {
            cachePromises.push(caches.keys().then(function(keys) {
                return Promise.all(keys.map(function(key) { return caches.delete(key) }))
            }))
        }
    } catch (e) {}

    try {
        if (navigator && navigator.serviceWorker && typeof navigator.serviceWorker.getRegistrations === "function") {
            cachePromises.push(navigator.serviceWorker.getRegistrations().then(function(regs) {
                return Promise.all(regs.map(function(reg) { return reg.unregister() }))
            }))
        }
    } catch (e) {}

    if (cachePromises.length > 0) {
        Promise.all(cachePromises).finally(reloadWithCacheBust)
    } else {
        reloadWithCacheBust()
    }
}

function resetForNextUniverse(universeIndex, universeTokens, hasAnsweredPrompt) {
    gameData = {
        universeIndex: universeIndex,
        universeTokens: universeTokens,
        majorChoiceSlotsTotal: 4,
        majorChoicesUsed: 0,
        majorChoicesChosen: {},
        meaning: 0,
        meaningMilestones: {},
        cycleStrain: 0,
        metaAwareness: 0,
        metaWeights: {patterns: 1, aging: 1, burnout: 1, compression: 1, meaning: 1, cycle: 1},
        metaTunesSpent: 0,
        observerData: {initialized: false},
        taskData: {},
        itemData: {},
        coins: 0,
        days: 365 * 14,
        evil: 0,
        paused: false,
        timeWarpingEnabled: true,
        rebirthOneCount: 0,
        rebirthTwoCount: 0,
        currentJob: null,
        currentSkill: null,
        currentProperty: null,
        currentMisc: null,
        hasAnsweredFirstTimePrompt: hasAnsweredPrompt,
        autoSwitchJobs: false,
        autoSwitchSkills: false,
        entropyUpgrades: {
            velocity: {
                temporalMomentum: 0,
                earlyCompression: 0,
                chainProgression: 0,
                momentumPersistence: 0,
                wealthFocus: 0,
                masteryFocus: 0,
            },
            stability: {
                entropyStability: 0,
                lifeContinuity: 0,
                balancedGrowth: 0,
                shortBrilliantLife: 0,
                longSteadyLife: 0,
                earlyPeak: 0,
                lateBloom: 0,
                smoothing: 0,
                quietMind: 0,
                patternAttunement: 0,
            },
            meta: {
                unifiedArchitecture: 0,
            },
        },
        entropyPatterns: {
            lifeStats: {
                ticksInJobs: 0,
                ticksInSkills: 0,
                rebirthCount: 0,
                currentLifeTicks: 0,
                autoSwitchUsed: false,
                totalIncomeThisLife: 0,
                totalXpThisLife: 0,
            },
            patterns: {
                laborCycle: {xp: 0, level: 0},
                scholarLoop: {xp: 0, level: 0},
                compressedLife: {xp: 0, level: 0},
                stableCycle: {xp: 0, level: 0},
                opportunist: {xp: 0, level: 0},
            },
        },
        entropyArtifacts: {
            sigilMomentum: false,
            chainConductor: false,
            loopAnchor: false,
            patternResonator: false,
        },
        entropy: {
            unlocked: false,
            seeds: 0,
            insight: 0,
            EP: 0,
            maxInsightEver: 0,
            overseer: false,
            focusTask: null,
            unifiedArchitecture: false,
        },
    }
    baseInitialized = false
    entropyInitialized = false
    autoSwitchFlagsPresentInSave = false
    autoSwitchDefaultsApplied = false
    lastEntropyUnlockedState = false
    saveGameData()
    location.reload(true)
}

function openResetConfirm() {
    var modal = document.getElementById("resetModal")
    if (modal) modal.style.display = "block"
}

function closeResetConfirm() {
    var modal = document.getElementById("resetModal")
    if (modal) modal.style.display = "none"
}

function confirmResetGameData() {
    closeResetConfirm()
    resetGameData()
}

function importGameData() {
    var importExportBox = document.getElementById("importExportBox")
    var raw = (importExportBox.value || "").trim()
    if (!raw) {
        showSettingsMessage(tUi("settings_msg_no_data"), "error")
        return
    }
    try {
        var decoded = window.atob(raw)
        var parsed = JSON.parse(decoded)
        if (!parsed || typeof parsed !== "object" || !parsed.taskData || !parsed.itemData) {
            throw new Error("Invalid structure")
        }
        gameData = parsed
        saveGameData()
        showSettingsMessage(tUi("settings_msg_import_success"), "success")
        setTimeout(function() { location.reload() }, 200)
    } catch (e) {
        console.error("Import failed:", e)
        showSettingsMessage(tUi("settings_msg_invalid_save"), "error")
    }
}

function exportGameData() {
    var importExportBox = document.getElementById("importExportBox")
    importExportBox.value = window.btoa(JSON.stringify(gameData))
    if (typeof importExportBox.select === "function") {
        importExportBox.select()
    }
    showSettingsMessage(tUi("settings_msg_export_success"), "info")
}

function initBaseGame() {
    if (baseInitialized) return
    document.getElementById("jobTable").innerHTML = ""
    document.getElementById("skillTable").innerHTML = ""
    document.getElementById("itemTable").innerHTML = ""

    gameData.taskData = {}
    gameData.itemData = {}

    createAllRows(jobCategories, "jobTable")
    createAllRows(skillCategories, "skillTable")
    createAllRows(itemCategories, "itemTable") 

    createData(gameData.taskData, jobBaseData)
    createData(gameData.taskData, skillBaseData)
    createData(gameData.taskData, {"Read Almanach": entropySkillBaseData["Read Almanach"]})
    createData(gameData.itemData, itemBaseData) 

    gameData.currentJob = gameData.taskData["Beggar"]
    gameData.currentSkill = gameData.taskData["Concentration"]
    gameData.currentProperty = gameData.itemData["Homeless"]
    gameData.currentMisc = []

    gameData.requirements = {
        //Other
        "The Arcane Association": new TaskRequirement(getElementsByClass("The Arcane Association"), [{task: "Concentration", requirement: 200}, {task: "Meditation", requirement: 200}]),
        "Dark magic": new EvilRequirement(getElementsByClass("Dark magic"), [{requirement: 1}]),
        "Shop": new CoinRequirement([document.getElementById("shopTabButton")], [{requirement: gameData.itemData["Tent"].getExpense() * 50}]),
        "Rebirth tab": new AgeRequirement([document.getElementById("rebirthTabButton")], [{requirement: 25}]),
        "Rebirth note 1": new AgeRequirement([document.getElementById("rebirthNote1")], [{requirement: 45}]),
        "Rebirth note 2": new AgeRequirement([document.getElementById("rebirthNote2")], [{requirement: 65}]),
        "Rebirth note 3": new AgeRequirement([document.getElementById("rebirthNote3")], [{requirement: 200}]),
        "Evil info": new EvilRequirement([document.getElementById("evilInfo")], [{requirement: 1}]),
        "Read Almanach": new EntropyRequirement([], [{seeds: 1}]),
        "Time warping info": new TaskRequirement([document.getElementById("timeWarping")], [{task: "Mage", requirement: 10}]),
        "Automation": new AgeRequirement([document.getElementById("automation")], [{requirement: 20}]),
        "Quick task display": new AgeRequirement([document.getElementById("quickTaskDisplay")], [{requirement: 20}]),
        "Body Maintenance": new AgeRequirement([getTaskElement("Body Maintenance")], [{requirement: 50}]),
        "Life Decision": new AgeRequirement([getTaskElement("Life Decision")], [{requirement: 35}]),
        "Cycle Steward": new AgeRequirement([getTaskElement("Cycle Steward")], [{requirement: 40}]),

        //Common work
        "Beggar": new TaskRequirement([getTaskElement("Beggar")], []),
        "Farmer": new TaskRequirement([getTaskElement("Farmer")], [{task: "Beggar", requirement: 10}]),
        "Fisherman": new TaskRequirement([getTaskElement("Fisherman")], [{task: "Farmer", requirement: 10}]),
        "Miner": new TaskRequirement([getTaskElement("Miner")], [{task: "Strength", requirement: 10}, {task: "Fisherman", requirement: 10}]),
        "Blacksmith": new TaskRequirement([getTaskElement("Blacksmith")], [{task: "Strength", requirement: 30}, {task: "Miner", requirement: 10}]),
        "Merchant": new TaskRequirement([getTaskElement("Merchant")], [{task: "Bargaining", requirement: 50}, {task: "Blacksmith", requirement: 10}]),

        //Military 
        "Squire": new TaskRequirement([getTaskElement("Squire")], [{task: "Strength", requirement: 5}]),
        "Footman": new TaskRequirement([getTaskElement("Footman")], [{task: "Strength", requirement: 20}, {task: "Squire", requirement: 10}]),
        "Veteran footman": new TaskRequirement([getTaskElement("Veteran footman")], [{task: "Battle tactics", requirement: 40}, {task: "Footman", requirement: 10}]),
        "Knight": new TaskRequirement([getTaskElement("Knight")], [{task: "Strength", requirement: 100}, {task: "Veteran footman", requirement: 10}]),
        "Veteran knight": new TaskRequirement([getTaskElement("Veteran knight")], [{task: "Battle tactics", requirement: 150}, {task: "Knight", requirement: 10}]),
        "Elite knight": new TaskRequirement([getTaskElement("Elite knight")], [{task: "Strength", requirement: 300}, {task: "Veteran knight", requirement: 10}]),
        "Holy knight": new TaskRequirement([getTaskElement("Holy knight")], [{task: "Mana control", requirement: 500}, {task: "Elite knight", requirement: 10}]),
        "Legendary knight": new TaskRequirement([getTaskElement("Legendary knight")], [{task: "Mana control", requirement: 1000}, {task: "Battle tactics", requirement: 1000}, {task: "Holy knight", requirement: 10}]),

        //The Arcane Association
        "Student": new TaskRequirement([getTaskElement("Student")], [{task: "Concentration", requirement: 200}, {task: "Meditation", requirement: 200}]),
        "Apprentice mage": new TaskRequirement([getTaskElement("Apprentice mage")], [{task: "Mana control", requirement: 400}, {task: "Student", requirement: 10}]),
        "Mage": new TaskRequirement([getTaskElement("Mage")], [{task: "Mana control", requirement: 700}, {task: "Apprentice mage", requirement: 10}]),
        "Wizard": new TaskRequirement([getTaskElement("Wizard")], [{task: "Mana control", requirement: 1000}, {task: "Mage", requirement: 10}]),
        "Master wizard": new TaskRequirement([getTaskElement("Master wizard")], [{task: "Mana control", requirement: 1500}, {task: "Wizard", requirement: 10}]),
        "Chairman": new TaskRequirement([getTaskElement("Chairman")], [{task: "Mana control", requirement: 2000}, {task: "Master wizard", requirement: 10}]),
        "Archmage Consultant": new TaskRequirement([getTaskElement("Archmage Consultant")], [{task: "Chairman", requirement: 25}, {task: "Time warping", requirement: 75}, {universe: 2}]),
        "Elder Advisor": new TaskRequirement([getTaskElement("Elder Advisor")], [{task: "Archmage Consultant", requirement: 10}, {age: 60}, {universe: 4}]),

        //Fundamentals
        "Concentration": new TaskRequirement([getTaskElement("Concentration")], []),
        "Productivity": new TaskRequirement([getTaskElement("Productivity")], [{task: "Concentration", requirement: 5}]),
        "Bargaining": new TaskRequirement([getTaskElement("Bargaining")], [{task: "Concentration", requirement: 20}]),
        "Meditation": new TaskRequirement([getTaskElement("Meditation")], [{task: "Concentration", requirement: 30}, {task: "Productivity", requirement: 20}]),

        //Combat
        "Strength": new TaskRequirement([getTaskElement("Strength")], []),
        "Battle tactics": new TaskRequirement([getTaskElement("Battle tactics")], [{task: "Concentration", requirement: 20}]),
        "Muscle memory": new TaskRequirement([getTaskElement("Muscle memory")], [{task: "Concentration", requirement: 30}, {task: "Strength", requirement: 30}]),

        //Magic
        "Mana control": new TaskRequirement([getTaskElement("Mana control")], [{task: "Concentration", requirement: 200}, {task: "Meditation", requirement: 200}]),
        "Immortality": new TaskRequirement([getTaskElement("Immortality")], [{task: "Apprentice mage", requirement: 10}]),
        "Time warping": new TaskRequirement([getTaskElement("Time warping")], [{task: "Mage", requirement: 10}]),
        "Super immortality": new TaskRequirement([getTaskElement("Super immortality")], [{task: "Chairman", requirement: 1000}]),

        //Dark magic
        "Dark influence": new EvilRequirement([getTaskElement("Dark influence")], [{requirement: 1}]),
        "Evil control": new EvilRequirement([getTaskElement("Evil control")], [{requirement: 1}]),
        "Intimidation": new EvilRequirement([getTaskElement("Intimidation")], [{requirement: 1}]),
        "Demon training": new EvilRequirement([getTaskElement("Demon training")], [{requirement: 25}]),
        "Blood meditation": new EvilRequirement([getTaskElement("Blood meditation")], [{requirement: 75}]),
        "Demon's wealth": new EvilRequirement([getTaskElement("Demon's wealth")], [{requirement: 500}]),

        //Properties
        "Homeless": new CoinRequirement([getItemElement("Homeless")], [{requirement: 0}]),
        "Tent": new CoinRequirement([getItemElement("Tent")], [{requirement: 0}]),
        "Wooden hut": new CoinRequirement([getItemElement("Wooden hut")], [{requirement: gameData.itemData["Wooden hut"].getExpense() * 100}]),
        "Cottage": new CoinRequirement([getItemElement("Cottage")], [{requirement: gameData.itemData["Cottage"].getExpense() * 100}]),
        "House": new CoinRequirement([getItemElement("House")], [{requirement: gameData.itemData["House"].getExpense() * 100}]),
        "Large house": new CoinRequirement([getItemElement("Large house")], [{requirement: gameData.itemData["Large house"].getExpense() * 100}]),
        "Small palace": new CoinRequirement([getItemElement("Small palace")], [{requirement: gameData.itemData["Small palace"].getExpense() * 100}]),
        "Grand palace": new CoinRequirement([getItemElement("Grand palace")], [{requirement: gameData.itemData["Grand palace"].getExpense() * 100}]),

        //Misc
        "Book": new CoinRequirement([getItemElement("Book")], [{requirement: 0}]),
        "Dumbbells": new CoinRequirement([getItemElement("Dumbbells")], [{requirement: gameData.itemData["Dumbbells"].getExpense() * 100}]),
        "Personal squire": new CoinRequirement([getItemElement("Personal squire")], [{requirement: gameData.itemData["Personal squire"].getExpense() * 100}]),
        "Steel longsword": new CoinRequirement([getItemElement("Steel longsword")], [{requirement: gameData.itemData["Steel longsword"].getExpense() * 100}]),
        "Butler": new CoinRequirement([getItemElement("Butler")], [{requirement: gameData.itemData["Butler"].getExpense() * 100}]),
        "Sapphire charm": new CoinRequirement([getItemElement("Sapphire charm")], [{requirement: gameData.itemData["Sapphire charm"].getExpense() * 100}]),
        "Study desk": new CoinRequirement([getItemElement("Study desk")], [{requirement: gameData.itemData["Study desk"].getExpense() * 100}]),
        "Library": new CoinRequirement([getItemElement("Library")], [{requirement: gameData.itemData["Library"].getExpense() * 100}]), 
    }

    tempData["requirements"] = {}
    for (key in gameData.requirements) {
        var requirement = gameData.requirements[key]
        tempData["requirements"][key] = requirement
    }

    var anyLocked = false
    for (categoryName in jobCategories) {
        var category = jobCategories[categoryName]
        for (entityName of category) {
            var requirement = gameData.requirements[entityName]
            if (requirement && !requirement.completed) {
                anyLocked = true
                break
            }
        }
        if (anyLocked) break
    }
    var requirementsActive = Object.keys(gameData.requirements).length > 0
    if (!anyLocked || !requirementsActive || (gameData.entropy && gameData.entropy.entropyUnlocked)) {
        console.error("Base init assertion failed: requirements missing or entropy unlocked too early.")
    }

    baseInitialized = true
}

function initEntropyGame() {
    if (entropyInitialized) return
    document.getElementById("entropyJobTable").innerHTML = ""
    document.getElementById("entropySkillTable").innerHTML = ""

    createAllRows(entropyJobCategories, "entropyJobTable")
    createAllRows(entropySkillCategories, "entropySkillTable")

    createData(gameData.taskData, entropyJobBaseData)
    createData(gameData.taskData, entropySkillBaseData)

    var entropyRequirements = {
        "Entropy tab": new EntropyRequirement([document.getElementById("entropyTabButton"), document.getElementById("entropy")], [{seeds: 1}]),
        "Read Almanach": new EntropyRequirement([getTaskElement("Read Almanach")], [{seeds: 1}]),
        "Work with Entropy": new TaskRequirement([getTaskElement("Work with Entropy")], [{task: "Read Almanach", requirement: 5}]),
        "Study Entropy": new TaskRequirement([getTaskElement("Study Entropy")], [{task: "Read Almanach", requirement: 25}]),
        "Pattern Comprehension": new TaskRequirement([getTaskElement("Pattern Comprehension")], [{task: "Study Entropy", requirement: 1}]),
        "Time Manipulation": new TaskRequirement([getTaskElement("Time Manipulation")], [{task: "Pattern Comprehension", requirement: 50}]),
        "Reality Architecture": new TaskRequirement([getTaskElement("Reality Architecture")], [{task: "Time Manipulation", requirement: 75}]),
        "Self-Awareness of the Cycle": new TaskRequirement([getTaskElement("Self-Awareness of the Cycle")], [{task: "Study Entropy", requirement: 25}]),
        "Pattern Weaving": new TaskRequirement([getTaskElement("Pattern Weaving")], [{task: "Pattern Comprehension", requirement: 50}, {universe: 3}]),
        "Body Maintenance": new TaskRequirement([getTaskElement("Body Maintenance")], [{task: "Meditation", requirement: 150}, {universe: 4}]),
        "Life Orchestration": new TaskRequirement([getTaskElement("Life Orchestration")], [{task: "Pattern Weaving", requirement: 30}, {age: 35}, {universe: 5}]),
        "Life Decision": new TaskRequirement([getTaskElement("Life Decision")], [{task: "Life Orchestration", requirement: 20}, {age: 35}, {universe: 6}]),
        "Career Obsession": new TaskRequirement([getTaskElement("Career Obsession")], [{task: "Life Decision", requirement: 5}, {universe: 6}]),
        "Inner Mastery": new TaskRequirement([getTaskElement("Inner Mastery")], [{task: "Life Decision", requirement: 5}, {universe: 6}]),
        "Wanderer": new TaskRequirement([getTaskElement("Wanderer")], [{task: "Life Decision", requirement: 5}, {universe: 6}]),
        "Rooted Citizen": new TaskRequirement([getTaskElement("Rooted Citizen")], [{task: "Life Decision", requirement: 5}, {universe: 6}]),
        "Existential Insight": new TaskRequirement([getTaskElement("Existential Insight")], [{task: "Life Decision", requirement: 10}, {meaning: 5}, {age: 40}, {universe: 7}]),
        "Cycle Steward": new TaskRequirement([getTaskElement("Cycle Steward")], [{task: "Body Maintenance", requirement: 50}, {task: "Life Orchestration", requirement: 20}, {age: 45}, {universe: 8}]),
        "Meta Tuning": new TaskRequirement([getTaskElement("Meta Tuning")], [{task: "Existential Insight", requirement: 10}, {task: "Cycle Steward", requirement: 10}, {age: 50}, {universe: 9}]),
        "Chronicle Keeper": new TaskRequirement([getTaskElement("Chronicle Keeper")], [{task: "Work with Entropy", requirement: 10}]),
        "Fate Analyst": new TaskRequirement([getTaskElement("Fate Analyst")], [{task: "Pattern Comprehension", requirement: 30}]),
        "Flow Regulator": new TaskRequirement([getTaskElement("Flow Regulator")], [{task: "Time Manipulation", requirement: 50}]),
        "Reality Architect": new TaskRequirement([getTaskElement("Reality Architect")], [{task: "Reality Architecture", requirement: 30}]),
    }

    if (!gameData.requirements) gameData.requirements = {}
    for (key in entropyRequirements) {
        gameData.requirements[key] = entropyRequirements[key]
    }

    if (!tempData["requirements"]) tempData["requirements"] = {}
    for (key in entropyRequirements) {
        tempData["requirements"][key] = entropyRequirements[key]
    }

    entropyInitialized = true

    // Annotate coin requirements with their key for discovery tracking
    for (key in gameData.requirements) {
        var req = gameData.requirements[key]
        if (req && req.type === "coins") {
            req.key = key
        }
    }
}

function startGame() {
    var savedGameData = getSavedGameData()
    autoSwitchFlagsPresentInSave = !!(savedGameData && savedGameData.hasOwnProperty("autoSwitchJobs") && savedGameData.hasOwnProperty("autoSwitchSkills"))

    ensureUniverseState()
    ensureEntropyBackfills()
    ensureFirstTimePromptState()
    ensureLanguageState()
    ensureMetaState()
    ensureShopState()

    if (savedGameData && savedGameData.hasAnsweredFirstTimePrompt === true) {
        gameData.hasAnsweredFirstTimePrompt = true
    }

    var shouldUnlockEntropy = savedGameData && savedGameData.entropy && savedGameData.entropy.entropyUnlocked

    if (!gameData.hasAnsweredFirstTimePrompt) {
        handleFirstTimePrompt()
        savedGameData = getSavedGameData()
    }

    if (gameData.entropy) {
        gameData.entropy.entropyUnlocked = false
    }

    initBaseGame()
    // Re-run entropy setup after base init to ensure all DOM elements are bound
    ensureEntropyState()
    ensureEntropyUpgradesState()
    ensureEntropyPatternsState()
    ensureEntropyArtifactsState()
    ensureCoinRequirementKeys()

    if (shouldUnlockEntropy || (gameData.entropy && gameData.entropy.entropyUnlocked)) {
        gameData.entropy.entropyUnlocked = true
        initEntropyGame()
    }

    loadGameData()
    ensureEntropyBackfills()

    if (gameData.entropy.entropyUnlocked) {
        gameData.entropy.seeds = Math.max(gameData.entropy.seeds || 0, 1)
        initEntropyGame()
    }
    if (gameData.entropyUpgrades && gameData.entropyUpgrades.meta && gameData.entropyUpgrades.meta.unifiedArchitecture > 0) {
        gameData.entropy.unifiedArchitecture = true
        if (!gameData.universeTokens || gameData.universeTokens < 1) {
            gameData.universeTokens = 1
        }
    }

    lastEntropyUnlockedState = isEntropyUnlocked()

    setCustomEffects()
    addMultipliers()

    refreshUI()
    if (gameData.meta && gameData.meta.introSeen === false) {
        showIntroModal()
    }
    enforceEntropyTabVisibility()
    setTab(jobTabButton, "jobs")
    initDebugUI()

    update()
    setInterval(update, 1000 / updateSpeed)
    setInterval(saveGameData, 3000)
    setInterval(setSkillWithLowestMaxXp, 1000)
}

startGame()

document.addEventListener("DOMContentLoaded", function () {
    var btn = document.getElementById("introContinueButton");
    if (btn) {
        btn.addEventListener("click", hideIntroModal);
    }
});

// Debug helper to inspect auto-learn choice in console
if (typeof window !== "undefined") {
    window.__debugAutoLearnOnce = function() {
        var allSkills = []
        for (key in gameData.taskData) {
            var s = gameData.taskData[key]
            if (s instanceof Skill) allSkills.push(s)
        }
        var xpDict = {}
        allSkills.forEach(function(s) {
            var req = gameData.requirements[s.name]
            var unlocked = !req || (typeof req.isCompleted === "function" ? req.isCompleted() : req && req.completed === true)
            var skipped = checkSkillSkipped(s)
            if (unlocked && !skipped) {
                xpDict[s.name] = s.level
            }
            console.log(s.name, "lvl", s.level, "xp", s.xp || 0, "unlocked", unlocked, "skipped", skipped)
        })
        var targetName = Object.keys(xpDict).length ? getKeyOfLowestValueFromDict(xpDict) : null
        var target = targetName ? gameData.taskData[targetName] : null
        console.log("Chosen target:", target ? target.name : "(none) -> fallback Concentration")
    }
}

if (typeof window !== "undefined") {
    window.__debugEntropy = function() {
        console.log("Entropy state:", gameData.entropy)
        var read = gameData.taskData["Read Almanach"]
        var workReq = gameData.requirements["Work with Entropy"]
        var studyReq = gameData.requirements["Study Entropy"]
        console.log("Read Almanach lvl:", read ? read.level : "n/a")
        console.log("Work with Entropy unlocked:", workReq ? workReq.isCompleted() : "no req")
        console.log("Study Entropy unlocked:", studyReq ? studyReq.isCompleted() : "no req")
    }
}
function attemptSelectTask(task) {
    if (!task) return false
    if (!isTaskExclusiveAvailable(task.name)) return false
    if (!isMajorChoiceAvailableForTask(task.name)) return false
    if (task instanceof Job) {
        if (gameData.currentJob && gameData.currentJob.name !== task.name) {
            registerTaskSwitch("job", gameData.currentJob.name, task.name)
        }
        if (!registerMajorChoice(task)) return false
        gameData.currentJob = task
        lastJobName = task.name
    } else {
        if (gameData.currentSkill && gameData.currentSkill.name !== task.name) {
            registerTaskSwitch("skill", gameData.currentSkill.name, task.name)
        }
        if (!registerMajorChoice(task)) return false
        gameData.currentSkill = task
        lastSkillName = task.name
    }
    return true
}
