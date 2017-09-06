import CellFactory from './CellFactory.js'
import Resource from './Resource.js'
import RandomGenerator from '../random.js'

class Hex {
    constructor ({ i, j, resources, cell }) {
        this.i = i
        this.j = j
        this.resources = resources
        this.cell = cell
    }

    update (delta) {

    }
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

    get (i, j) {
        return this.items[i][j]
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
}

class World {
    constructor ({ seed, width, height, resources, cells }) {
        this.seed = seed
        this.width = width
        this.height = height
        this.rnd = new RandomGenerator(seed)

        this.resources = {}
        resources.list.forEach((item) => {
            this.resources[item.name] = new Resource(item)
        })

        this.cells = {}
        cells.list.forEach((item) => {
            this.cells[item.name] = new CellFactory(item)
        })

        this.layer = new HexCollection({ width, height })

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                let cell
                const cellName = this.rnd.randomCell(cells.initial)

                if (cellName) {
                    cell = this.cells[cellName].create()
                }
                const hex = new Hex({
                    i: i,
                    j: j,
                    resources: Object.assign({}, resources.initial),
                    cell: cell,
                })
                this.layer.set(i, j, hex)
            }
        }
    }

    update (delta) {

    }
}

export default World
