import _ from 'lodash'

class Cell {
    constructor ({ name, reactions, resources }) {
        this.name = name
        this.reactions = reactions
        this.resources = resources
        this.resourcesDelta = {}
        _.each(this.resources, (value, key) => {
            this.resourcesDelta[key] = 0
        })
    }

    applyUpdate () {
        _.each(this.resourcesDelta, (value, key) => {
            this.resources[key] += value
            this.resourcesDelta[key] = 0
        })
    }

    applyReactions (delta, hex) {
        _.each(this.reactions, (reaction) => this.applyReaction(delta, reaction, hex))
    }

    applyReaction (delta, reaction, hex) {
        const inputs = reaction.inputs
        const output = reaction.output
        const consumed = {}

        _.each(inputs, (value, key) => {
            const amount = value * delta
            if (hex.resources[key] && hex.resources[key] >= amount) {
                consumed[key] = amount
            } else {
                consumed[key] = 0
            }
        })

        if (_.every(_.values(consumed))) {
            _.each(consumed, (value, key) => {
                hex.resourcesDelta[key] -= value
            })

            _.each(output, (value, key) => {
                let resDelta = value * delta
                this.resourcesDelta[key] += resDelta
            })
        }
    }
}

class CellFactory {
    constructor ({ config, resourcesConfig }) {
        this.config = config
        this.resourcesConfig = resourcesConfig

        this.initilResources = {}
        _.each(resourcesConfig.list, (item) => {
            if (!item.isEnergy) {
                this.initilResources[item.name] = 0
            }
        })
    }

    create () {
        const cell = new Cell({
            name: this.config.name,
            reactions: this.config.reactions,
            resources: Object.assign({}, this.initilResources),
        })
        return cell
    }
}

export default CellFactory
