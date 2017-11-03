import _ from 'lodash'

const STORAGE_FILL_TIME = 5 // seconds

class Cell {
    constructor ({ name, reactions, resources, maxStorage, divisionConditions, deathConditions, color }) {
        this.name = name
        this.color = color
        this.reactions = reactions
        this.divisionConditions = divisionConditions
        this.deathConditions = deathConditions
        this.maxStorage = maxStorage

        this.lifeTime = 0
        this.isActive = true
        this.isDead = false
        this.resources = resources
        this.resourcesDelta = {}
        _.each(this.resources, (value, key) => {
            this.resourcesDelta[key] = 0
        })
    }

    fillStorage (delta, hex) {
        if (!this.isActive) {
            return
        }

        _.each(this.resources, (value, key) => {
            if (value < this.maxStorage[key]) {
                const resDelta = Math.min(
                    this.maxStorage[key] / STORAGE_FILL_TIME * delta,
                    this.maxStorage[key] - value,
                    hex.resources[key],
                )

                hex.resourcesDelta[key] -= resDelta
                this.resourcesDelta[key] += resDelta
            }
        })
    }

    applyReactions (delta, hex) {
        if (this.isActive) {
            _.each(this.reactions, (reaction) => this._applyReaction(delta, reaction, hex))
        }
    }

    _applyReaction (delta, reaction, hex) {
        // TODO: run reactions when this is required
        const inputs = reaction.inputs
        const output = reaction.output
        const consumed = {}

        _.each(inputs, (value, key) => {
            const amount = value * delta
            if (this.resources[key] >= amount) {
                consumed[key] = amount
            } else {
                consumed[key] = 0
            }
        })

        if (_.every(_.values(consumed))) {
            _.each(consumed, (value, key) => {
                this.resourcesDelta[key] -= value
            })

            _.each(output, (value, key) => {
                let resDelta = value * delta
                this.resourcesDelta[key] += resDelta
            })
        }
    }

    applyUpdate (delta) {
        // Some reactions can happen even if cell is not active
        _.each(this.resourcesDelta, (value, key) => {
            this.resources[key] += value
            this.resourcesDelta[key] = 0
        })

        if (this.isActive) {
            this.lifeTime += delta
        }
    }

    canDie () {
        if (!this.isDead && this.deathConditions) {
            return this.lifeTime >= this.deathConditions.lifeTime
        }
        return false
    }

    die () {
        this.isDead = true
        this.isActive = false
    }

    canDivide () {
        if (!this.isActive || _.isEmpty(this.divisionConditions)) {
            return false
        }

        return _.every(this.divisionConditions, (value, key) => {
            return this.resources[key] >= value
        })
    }

    divide () {
        if (!this.isActive) {
            return false
        }

        const initilResources = {}
        _.each(this.resources, (value, key) => {
            this.resources[key] = value / 2
            initilResources[key] = value / 2
        })

        return new Cell({
            name: this.name,
            reactions: this.reactions,
            resources: initilResources,
            maxStorage: this.maxStorage,
            divisionConditions: this.divisionConditions,
            deathConditions: this.deathConditions,
            color: this.color,
        })
    }
}

class CellFactory {
    constructor ({ config, resourcesConfig, color }) {
        this.config = config
        this.resourcesConfig = resourcesConfig
        this.color = color

        this.maxStorage = {}
        this.initilResources = {}
        _.each(resourcesConfig, (item) => {
            if (!item.isEnergy) {
                this.initilResources[item.name] = 0
                this.maxStorage[item.name] = 0
            }
        })

        _.each(config.reactions, (reaction) => {
            _.each(reaction.inputs, (value, key) => {
                this.maxStorage[key] += value * config.storeMaxTurns
            })
        })
        _.each(config.divisionConditions, (value, key) => {
            this.maxStorage[key] = Math.max(value, this.maxStorage[key])
        })
    }

    create () {
        const cell = new Cell({
            name: this.config.name,
            reactions: this.config.reactions,
            resources: Object.assign({}, this.initilResources),
            maxStorage: this.maxStorage,
            divisionConditions: this.config.divisionConditions,
            deathConditions: this.config.deathConditions,
            color: this.color,
        })
        return cell
    }
}

export default CellFactory
