import Phaser from 'phaser'

// TODO: Replace with Polygon with custom background color and size

class HexTile extends Phaser.Graphics {
    constructor ({ game, x, y, radius, hex }) {
        super(game, x, y)

        this.radius = radius - 1
        this.hex = hex

        this.tileTag = game.make.text(radius, radius, this.hex.x, {fontSize: 11})
        this.tileTag.anchor.setTo(0.5, 0.5)
        this.tileTag.addColor('#111', 0)
        this.addChild(this.tileTag)

        this.drawHex()

        this.inputEnabled = true
        this.input.useHandCursor = true
    }

    select () {
        this.game.selectedHex = this
    }

    update () {
        if (this.hex.cell) {
            this.tileTag.text = this.hex.cell.name
        }
        this.drawHex()
    }

    drawHex () {
        this.clear()

        let color = 0xeeeeee
        if (this.hex.cell) {
            color = this.hex.cell.color
        }

        const corners = []
        for (let i = 0; i < 6; i++) {
            corners.push(this._hexCorner(i))
        }
        this.beginFill(color, 0.5)
        this.drawPolygon(corners)
    }

    _hexCorner (i) {
        const angleDeg = 60 * i + 30
        const angleRad = Math.PI / 180 * angleDeg
        return new Phaser.Point(
            this.radius + this.radius * Math.cos(angleRad),
            this.radius + this.radius * Math.sin(angleRad),
        )
    }
}

export default HexTile
