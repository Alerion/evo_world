import _ from 'lodash'
import CellFactory from './CellFactory.js'
import Resource from './Resource.js'
import RandomGenerator from '../random.js'

class Hex {
    constructor ({ i, j, resources, cell, updateSplitRatio }) {
        this.i = i
        this.j = j
        this.resources = resources
        this.cell = cell
        this.neighbors = []
        this.updateSplitRatio = updateSplitRatio

        this.resourcesDelta = {}
        _.each(this.resources, (value, key) => {
            this.resourcesDelta[key] = 0
        })
    }

    setNeighbors (neighbors) {
        this.neighbors = neighbors
    }

    calcUpdate (delta) {
        if (this.cell) {
            _.each(this.cell.reactions, (reaction) => this.applyReaction(reaction, delta))
        }
    }

    applyUpdate () {
        _.each(this.resourcesDelta, (value, key) => {
            this.resources[key] += value
            this.resourcesDelta[key] = 0
        })
    }

    applyReaction (reaction, delta) {
        const inputs = reaction.inputs
        const output = reaction.output
        const consumed = {}

        _.each(inputs, (value, key) => {
            const amount = value * delta
            if (this.resources[key] && this.resources[key] >= amount) {
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
                this.resourcesDelta[key] += resDelta * (1 - this.updateSplitRatio)
                _.each(this.neighbors, (neighbor) => {
                    neighbor.resourcesDelta[key] += resDelta * this.updateSplitRatio / 6
                })
            })
        }
    }
}

// This Hex is used as outside neighbor, so all hexes have six neighbors
// Does not keep any resources and cells, just to have proper calculations
class OutsideHex extends Hex {
    calcUpdate (delta) {}
    applyUpdate () {}
    applyReaction (reaction, delta) {}
}

class HexCollection {
    constructor ({ width, height }) {
        this.width = width
        this.height = height
        this.items = []

        for (let i = 0; i < height; i++) {
            this.items.push(new Array(width).fill(null))
        }
    }

    updateNeighbors () {
        this.forEach((hex) => {
            hex.setNeighbors(this.getNeighbors(hex))
        })
    }

    get (i, j) {
        return this.items[i] && this.items[i][j]
    }

    set (i, j, item) {
        this.items[i][j] = item
    }

    forEach (callback, context) {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                callback.call(context, this.get(i, j), i, j, this)
            }
        }
    }

    getNeighbors ({ i, j, hex }) {
        if (hex) {
            i = hex.i
            j = hex.j
        }

        const directions = [[0, -1], [1, -1], [1, 0], [0, 1], [-1, 1], [-1, 0]]
        return _.map(directions, (item) => {
            let neighbor = this.get(i + item[0], j + item[1])
            if (_.isEmpty(neighbor)) {
                neighbor = new OutsideHex({
                    i: i + item[0],
                    j: j + item[1],
                })
            }
            return neighbor
        })
    }
}

class World {
    // Arguments example you can find in config.js
    constructor ({ seed, width, height, resources, cells }) {
        this.seed = seed
        this.width = width
        this.height = height
        this.cellsConfig = cells
        this.resourcesConfig = resources
        this.rnd = new RandomGenerator(seed)
        this.rnd.sow(this.seed)

        this.resources = {}
        resources.list.forEach((item) => {
            this.resources[item.name] = new Resource(item)
        })

        this.cells = {}
        cells.list.forEach((item) => {
            this.cells[item.name] = new CellFactory(item)
        })

        this.layer = new HexCollection({ width, height })
        this.initialize()
    }

    update (delta) {
        // World is updated in two steps. At first all changes are calculated.
        // Then changes are applied. This way only current values are used form
        // calculation and we avoid situation, when next hex use already updated
        // values from previous hex.
        this.layer.forEach(function (hex) {
            hex.calcUpdate(delta)
        })

        this.layer.forEach(function (hex) {
            hex.applyUpdate()
        })
    }

    initialize () {
        for (let i = 0; i < this.height; i++) {
            for (let j = 0; j < this.width; j++) {
                let cell
                const cellName = this.rnd.randomCell(this.cellsConfig.initial)

                if (cellName) {
                    cell = this.cells[cellName].create()
                }
                const hex = new Hex({
                    i: i,
                    j: j,
                    resources: Object.assign({}, this.resourcesConfig.initial),
                    cell: cell,
                    updateSplitRatio: this.resourcesConfig.updateSplitRatio,
                })
                this.layer.set(i, j, hex)
            }
        }
        this.layer.updateNeighbors()
    }

    reset () {
        this.rnd.sow(this.seed)
        this.initialize()
    }
}

export default World
