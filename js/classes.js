class Task {
    constructor(baseData) {
        this.baseData = baseData
        this.name = baseData.name
        this.level = 0
        this.maxLevel = 0 
        this.xp = 0

        this.xpMultipliers = [
        ]
    }

    getMaxXp() {
        var maxXp = Math.round(this.baseData.maxXp * (this.level + 1) * Math.pow(1.01, this.level))
        return maxXp
    }

    getXpLeft() {
        return Math.round(this.getMaxXp() - this.xp)
    }

    getMaxLevelMultiplier() {
        var maxLevelMultiplier = 1 + this.maxLevel / 10
        if (typeof getPatternComprehensionBoost === "function") {
            maxLevelMultiplier *= getPatternComprehensionBoost()
        }
        return maxLevelMultiplier
    }

    getXpGain() {
        return applyMultipliers(10, this.xpMultipliers)
    }

    increaseXp() {
        var gain = applySpeed(this.getXpGain())
        this.xp += gain
        if (typeof recordXpGainForPatterns === "function") {
            recordXpGainForPatterns(gain, this)
        }
        if (this.xp >= this.getMaxXp()) {
            var excess = this.xp - this.getMaxXp()
            while (excess >= 0) {
                this.level += 1
                excess -= this.getMaxXp()
            }
            this.xp = this.getMaxXp() + excess
        }
    }
}

class Job extends Task {
    constructor(baseData) {
        super(baseData)   
        this.incomeMultipliers = [
        ]
    }

    getLevelMultiplier() {
        var levelMultiplier = 1 + Math.log10(this.level + 1)
        return levelMultiplier
    }
    
    getIncome() {
        return applyMultipliers(this.baseData.income, this.incomeMultipliers) 
    }
}

class Skill extends Task {
    constructor(baseData) {
        super(baseData)
    }

    getEffect() {
        var effect = 1 + this.baseData.effect * this.level
        return effect
    }

    getEffectDescription() {
        var description = this.baseData.description
        if (typeof tTooltip === "function") {
            description = tTooltip(description)
        }
        var text = "x" + String(this.getEffect().toFixed(2)) + " " + description
        return text
    }
}

class Item {
    constructor(baseData) {  
        this.baseData = baseData
        this.name = baseData.name
        this.expenseMultipliers = [
         
        ]
        this.discovered = false
    }

    getEffect() {
        if (gameData.currentProperty != this && !gameData.currentMisc.includes(this)) return 1
        var effect = this.baseData.effect
        return effect
    }

    getEffectDescription() {
        var description = this.baseData.description
        if (itemCategories["Properties"].includes(this.name)) description = "Happiness"
        if (typeof tTooltip === "function") {
            description = tTooltip(description)
        }
        var text = "x" + this.baseData.effect.toFixed(1) + " " + description
        return text
    }

    getExpense() {
        return applyMultipliers(this.baseData.expense, this.expenseMultipliers)
    }
}

class Requirement {
    constructor(elements, requirements) {
        this.elements = elements
        this.requirements = requirements
        this.completed = this.completed || false
    }

    isCompleted() {
        if (this.completed) return true
        for (var requirement of this.requirements) {
            if (!this.getCondition(requirement)) {
                return false
            }
        }
        this.completed = true
        return true
    }
}

class TaskRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "task"
    }

    getCondition(requirement) {
        if (requirement.universe && (gameData.universeIndex || 1) < requirement.universe) return false
        if (requirement.age && daysToYears(gameData.days) < requirement.age) return false
        if (requirement.meaning && (gameData.meaning || 0) < requirement.meaning) return false
        if (typeof isTaskExclusiveAvailable === "function" && requirement.task && !isTaskExclusiveAvailable(requirement.task)) return false
        if (typeof isMajorChoiceAvailableForTask === "function" && requirement.task && !isMajorChoiceAvailableForTask(requirement.task)) return false
        if (!requirement.task) return true
        return gameData.taskData[requirement.task].level >= requirement.requirement
    }
}

class CoinRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "coins"
    }

    getCondition(requirement) {
        if (this.completed) return true
        if (!gameData) return false
        var enoughCoins = gameData.coins >= requirement.requirement
        if (enoughCoins && typeof markItemDiscoveredIfKnown === "function") {
            if (this.key) {
                markItemDiscoveredIfKnown(this.key)
            }
        }
        if (enoughCoins) {
            this.completed = true
        }
        return enoughCoins || this.completed
    }
}

class AgeRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "age"
    }

    getCondition(requirement) {
        var ageYears = daysToYears(gameData.days)
        var reqAge = requirement.requirement
        if (requirement.allowShortLife && typeof hasShortBrilliantLife === "function" && hasShortBrilliantLife()) {
            if (typeof getShortLifeThresholdAgeYears === "function") {
                reqAge = Math.min(reqAge, getShortLifeThresholdAgeYears())
            }
        }
        return ageYears >= reqAge
    }
}

class EvilRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "evil"
    }

    getCondition(requirement) {
        return gameData.evil >= requirement.requirement
    }    
}

class EntropyRequirement extends Requirement {
    constructor(elements, requirements) {
        super(elements, requirements)
        this.type = "entropy"
    }

    getCondition(requirement) {
        var unlocked = (typeof isEntropyUnlocked === "function") ? isEntropyUnlocked() : (gameData && gameData.entropy && gameData.entropy.entropyUnlocked)
        var seedsOk = requirement.seeds ? (gameData && gameData.entropy && gameData.entropy.seeds >= requirement.seeds) : true
        if (unlocked && seedsOk) {
            this.completed = true
        }
        return (unlocked && seedsOk) || this.completed
    }
}
