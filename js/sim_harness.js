(function() {
    if (typeof window === "undefined") return

    var SIM_FLAG = "__EA_SIM_RUNNING"
    var requirementTemplates = null

    function wrapWithSimGuard(name) {
        var original = window[name]
        if (typeof original !== "function") return
        if (original.__eaSimWrapped) return
        var wrapped = function() {
            if (window[SIM_FLAG]) return
            return original.apply(this, arguments)
        }
        wrapped.__eaSimWrapped = true
        window[name] = wrapped
    }

    wrapWithSimGuard("update")
    wrapWithSimGuard("saveGameData")
    wrapWithSimGuard("setSkillWithLowestMaxXp")

    function clone(obj) {
        return JSON.parse(JSON.stringify(obj || {}))
    }

    function captureRequirementTemplates() {
        if (!window.gameData || !window.gameData.requirements) return {}
        var templates = {}
        Object.keys(window.gameData.requirements).forEach(function(key) {
            var req = window.gameData.requirements[key]
            if (!req) return
            templates[key] = {
                type: req.type,
                reqs: clone(req.requirements || []),
                key: req.key
            }
        })
        return templates
    }

    function getRequirementTemplates() {
        if (!requirementTemplates) {
            requirementTemplates = captureRequirementTemplates()
        }
        return requirementTemplates
    }

    function createRequirementInstance(key, template) {
        if (!template || !template.type) return null
        var ctorMap = {
            task: TaskRequirement,
            coins: CoinRequirement,
            age: AgeRequirement,
            evil: EvilRequirement,
            entropy: EntropyRequirement,
        }
        var ctor = ctorMap[template.type]
        if (!ctor) return null
        var inst = new ctor([], clone(template.reqs || []))
        if (template.type === "coins") {
            inst.key = template.key || key
        }
        return inst
    }

    function getDefaultEntropyState() {
        return {
            unlocked: false,
            seeds: 0,
            insight: 0,
            EP: 0,
            maxInsightEver: 0,
            overseer: false,
            focusTask: null,
            unifiedArchitecture: false,
        }
    }

    function getDefaultEntropyUpgrades() {
        return {
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
        }
    }

    function getDefaultEntropyPatterns() {
        return {
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
    }

    function getDefaultEntropyArtifacts() {
        return {
            sigilMomentum: false,
            chainConductor: false,
            loopAnchor: false,
            patternResonator: false,
        }
    }

    function getBaseGlobalsSnapshot() {
        return {
            gameData: window.gameData,
            realityArchitectureEffect: window.realityArchitectureEffect,
            skillWithLowestMaxXp: window.skillWithLowestMaxXp,
            lastJobName: window.lastJobName,
            lastSkillName: window.lastSkillName,
            universeSwitchPenalty: window.universeSwitchPenalty,
            burnoutLevel: window.burnoutLevel,
            lifeCompressionState: clone(window.lifeCompressionState),
            majorChoicesUsed: window.majorChoicesUsed,
            majorChoicesChosen: clone(window.majorChoicesChosen),
            meaningMilestones: clone(window.meaningMilestones),
            cycleStrain: window.cycleStrain,
            metaAwareness: window.metaAwareness,
            metaWeights: clone(window.metaWeights),
            metaTunesSpent: window.metaTunesSpent,
            observerData: clone(window.observerData),
            lastEntropyUnlockedState: window.lastEntropyUnlockedState,
            autoSwitchFlagsPresentInSave: window.autoSwitchFlagsPresentInSave,
            autoSwitchDefaultsApplied: window.autoSwitchDefaultsApplied,
        }
    }

    function restoreGlobals(snapshot) {
        if (!snapshot) return
        window.gameData = snapshot.gameData
        window.realityArchitectureEffect = snapshot.realityArchitectureEffect
        window.skillWithLowestMaxXp = snapshot.skillWithLowestMaxXp
        window.lastJobName = snapshot.lastJobName
        window.lastSkillName = snapshot.lastSkillName
        window.universeSwitchPenalty = snapshot.universeSwitchPenalty
        window.burnoutLevel = snapshot.burnoutLevel
        window.lifeCompressionState = snapshot.lifeCompressionState
        window.majorChoicesUsed = snapshot.majorChoicesUsed
        window.majorChoicesChosen = snapshot.majorChoicesChosen
        window.meaningMilestones = snapshot.meaningMilestones
        window.cycleStrain = snapshot.cycleStrain
        window.metaAwareness = snapshot.metaAwareness
        window.metaWeights = snapshot.metaWeights
        window.metaTunesSpent = snapshot.metaTunesSpent
        window.observerData = snapshot.observerData
        window.lastEntropyUnlockedState = snapshot.lastEntropyUnlockedState
        window.autoSwitchFlagsPresentInSave = snapshot.autoSwitchFlagsPresentInSave
        window.autoSwitchDefaultsApplied = snapshot.autoSwitchDefaultsApplied
    }

    function withSimState(data, fn) {
        var snapshot = getBaseGlobalsSnapshot()
        window[SIM_FLAG] = true
        window.gameData = data
        try {
            return fn()
        } finally {
            restoreGlobals(snapshot)
            window[SIM_FLAG] = false
        }
    }

    function buildScenario(options) {
        var opts = options || {}
        var gd = {
            universeIndex: opts.universeIndex || 1,
            universeTokens: opts.universeTokens || 0,
            taskData: {},
            itemData: {},
            purchasedItems: {},
            categoryPurchaseCounts: {},
            coins: opts.coins || 0,
            days: opts.days || (365 * 14),
            evil: opts.evil || 0,
            paused: false,
            timeWarpingEnabled: true,
            rebirthOneCount: opts.rebirthOneCount || 0,
            rebirthTwoCount: opts.rebirthTwoCount || 0,
            currentJob: null,
            currentSkill: null,
            currentProperty: null,
            currentMisc: [],
            hasAnsweredFirstTimePrompt: true,
            autoSwitchJobs: !!opts.autoSwitchJobs,
            autoSwitchSkills: !!opts.autoSwitchSkills,
            meaning: opts.meaning || 0,
            meaningMilestones: {},
            cycleStrain: opts.cycleStrain || 0,
            metaAwareness: opts.metaAwareness || 0,
            metaWeights: clone(opts.metaWeights || {patterns: 1, aging: 1, burnout: 1, compression: 1, meaning: 1, cycle: 1}),
            metaTunesSpent: opts.metaTunesSpent || 0,
            majorChoiceSlotsTotal: 4,
            majorChoicesUsed: 0,
            majorChoicesChosen: {},
            observerData: {initialized: false},
            entropyUpgrades: getDefaultEntropyUpgrades(),
            entropyPatterns: getDefaultEntropyPatterns(),
            entropyArtifacts: getDefaultEntropyArtifacts(),
            entropy: getDefaultEntropyState(),
            requirements: {},
        }

        createData(gd.taskData, jobBaseData)
        createData(gd.taskData, skillBaseData)
        createData(gd.taskData, {"Read Almanach": entropySkillBaseData["Read Almanach"]})
        createData(gd.itemData, itemBaseData)

        gd.currentJob = gd.taskData["Beggar"]
        gd.currentSkill = gd.taskData["Concentration"]
        gd.currentProperty = gd.itemData["Homeless"]
        gd.currentMisc = []

        var templates = getRequirementTemplates()
        Object.keys(templates).forEach(function(key) {
            var inst = createRequirementInstance(key, templates[key])
            if (inst) gd.requirements[key] = inst
        })

        if (opts.unlockAll === true) {
            Object.keys(gd.requirements).forEach(function(key) {
                gd.requirements[key].completed = true
            })
        }

        withSimState(gd, function() {
            setCustomEffects()
            addMultipliers()
        })

        return {
            data: gd,
            options: opts,
            ticks: 0,
            events: [],
        }
    }

    function simResetProgress(simData) {
        var gd = simData.data
        gd.entropy.focusTask = null
        gd.coins = 0
        gd.days = 365 * 14
        gd.currentJob = gd.taskData["Beggar"]
        gd.currentSkill = gd.taskData["Concentration"]
        gd.currentProperty = gd.itemData["Homeless"]
        gd.currentMisc = []
        gd.purchasedItems = {}
        gd.categoryPurchaseCounts = {}

        for (var taskName in gd.taskData) {
            var task = gd.taskData[taskName]
            if (task.level > task.maxLevel) task.maxLevel = task.level
            task.level = 0
            task.xp = 0
        }

        for (var key in gd.requirements) {
            var requirement = gd.requirements[key]
            if (requirement.completed && permanentUnlocks.includes(key)) continue
            requirement.completed = false
        }
    }

    function simRebirthOne(simData) {
        withSimState(simData.data, function() {
            updateEntropyPatternsOnRebirth()
            simData.data.rebirthOneCount += 1
            applyEntropyRebirthGain()
        })
        simResetProgress(simData)
    }

    function pickLowestLevelUnlockedSkill() {
        var best = null
        var bestLevel = Infinity
        for (var name in gameData.taskData) {
            var s = gameData.taskData[name]
            if (!(s instanceof Skill)) continue
            if (!isSkillUnlocked(s)) continue
            if (s.skip) continue
            if (s.level < bestLevel) {
                bestLevel = s.level
                best = s
            }
        }
        return best
    }

    function runSimTick(simData) {
        var gd = simData.data
        var autoRebirth = !!simData.options.autoRebirth

        ensureActiveSelections()
        decaySwitchPenalty()
        decayBurnout()
        updateMeaning()
        updateCycleStrain()
        tryMetaTune()
        recordLifeTickParticipation()
        increaseDays()
        maybeUnlockAlmanac()

        if (simData.options.autoPromote !== false) {
            autoPromote()
        }
        if (simData.options.autoLearn !== false) {
            var candidate = pickLowestLevelUnlockedSkill()
            if (candidate) {
                attemptSelectTask(candidate)
            }
        }

        if (gd.days >= getLifespan()) {
            if (autoRebirth) {
                simRebirthOne(simData)
                return
            }
        }

        if (isCycleOverseerActive()) {
            var focusTask = getFocusedTask()
            if (focusTask) {
                doCurrentTask(focusTask)
                for (key in gd.taskData) {
                    applyPassiveXp(gd.taskData[key], focusTask)
                }
            } else {
                doCurrentTask(gd.currentJob)
                doCurrentTask(gd.currentSkill)
            }
        } else {
            doCurrentTask(gd.currentJob)
            doCurrentTask(gd.currentSkill)
        }
        applyExpenses()
    }

    function runTicks(simData, maxTicks) {
        if (!simData) return null
        var limit = maxTicks || 0
        var result
        withSimState(simData.data, function() {
            for (var i = 0; i < limit; i++) {
                runSimTick(simData)
                simData.ticks += 1
            }
            result = simData
        })
        return result
    }

    function runUntil(simData, predicate, maxTicks) {
        if (!simData) return null
        var limit = maxTicks || 0
        var result
        withSimState(simData.data, function() {
            for (var i = 0; i < limit; i++) {
                runSimTick(simData)
                simData.ticks += 1
                if (predicate && predicate(simData)) {
                    break
                }
            }
            result = simData
        })
        return result
    }

    function summarize(simData) {
        if (!simData) return null
        var gd = simData.data
        return {
            label: simData.options && simData.options.label,
            universe: gd.universeIndex,
            ticks: simData.ticks,
            ageYears: Math.floor(gd.days / 365),
            coins: gd.coins,
            evil: gd.evil,
            entropySeeds: gd.entropy ? gd.entropy.seeds : 0,
            entropyEP: gd.entropy ? gd.entropy.EP : 0,
            rebirthOneCount: gd.rebirthOneCount,
            rebirthTwoCount: gd.rebirthTwoCount,
            currentJob: gd.currentJob ? gd.currentJob.name : null,
            currentSkill: gd.currentSkill ? gd.currentSkill.name : null,
            notes: simData.events,
        }
    }

    function runEarlyEconomyBaseline(options) {
        var opts = Object.assign({label: "earlyEconomy", autoRebirth: false}, options || {})
        var sim = buildScenario(opts)
        runUntil(sim, function(s) {
            return s.data.coins >= 500 || s.ticks >= 20000
        }, opts.maxTicks || 20000)
        var summary = summarize(sim)
        console.log("EA_SIM early economy", summary)
        return summary
    }

    function runDarkEntryBaseline(options) {
        var opts = Object.assign({label: "darkEntry", autoRebirth: true}, options || {})
        var sim = buildScenario(opts)
        runUntil(sim, function(s) {
            return s.data.evil >= 1 || s.ticks >= 40000
        }, opts.maxTicks || 40000)
        var summary = summarize(sim)
        console.log("EA_SIM dark entry", summary)
        return summary
    }

    function runEntropyEntryBaseline(options) {
        var opts = Object.assign({label: "entropyEntry", autoRebirth: true}, options || {})
        var sim = buildScenario(opts)
        runUntil(sim, function(s) {
            return (s.data.entropy && s.data.entropy.seeds >= 1) || s.ticks >= 60000
        }, opts.maxTicks || 60000)
        var summary = summarize(sim)
        console.log("EA_SIM entropy entry", summary)
        return summary
    }

    function runAutomationBaseline(options) {
        var opts = Object.assign({label: "automation", autoRebirth: false}, options || {})
        var sim = buildScenario(opts)
        runUntil(sim, function(s) {
            return isAutomationUnlocked() || s.ticks >= 15000
        }, opts.maxTicks || 15000)
        var summary = summarize(sim)
        console.log("EA_SIM automation timing", summary)
        return summary
    }

    window.EA_SIM = {
        createScenario: buildScenario,
        runTicks: runTicks,
        runUntil: runUntil,
        summarize: summarize,
        runEarlyEconomyBaseline: runEarlyEconomyBaseline,
        runDarkEntryBaseline: runDarkEntryBaseline,
        runEntropyEntryBaseline: runEntropyEntryBaseline,
        runAutomationBaseline: runAutomationBaseline,
    }
})()
