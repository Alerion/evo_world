import Phaser from 'phaser'

class Hex {
    constructor ({ i, j, dx }) {
        this.i = i
        this.j = j

        this.x = 0
        this.dx = dx
    }

    update (delta) {
        this.x += this.dx * delta
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
    constructor ({ seed, width, height }) {
        this.seed = seed
        this.width = width
        this.height = height
        this.rnd = new Phaser.RandomDataGenerator(seed)

        this.layer = new HexCollection({ width, height })

        for (let i = 0; i < height; i++) {
            for (let j = 0; j < width; j++) {
                let hex = new Hex({
                    i: i,
                    j: j,
                    dx: this.rnd.normal(),
                })
                this.layer.set(i, j, hex)
            }
        }
    }

    update (delta) {
        this.layer.forEach(function (hex) {
            hex.update(delta)
        })
    }
}

export default World
