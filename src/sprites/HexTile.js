import Phaser from 'phaser'

class HexTile extends Phaser.Graphics {
    constructor ({ game, x, y, radius, hex, getHexColor }) {
        super(game, x, y)

        this.radius = radius - 1
        this.hex = hex
        this.getHexColor = getHexColor

        this.tileTag = game.make.text(radius, radius, this.hex.x, {fontSize: 11})
        this.tileTag.anchor.setTo(0.5, 0.5)
        this.tileTag.addColor('#111', 0)
        this.addChild(this.tileTag)

        this.drawHex()

        this.inputEnabled = true
        this.input.useHandCursor = true
    }

    update () {
        if (this.hex.cell) {
            this.tileTag.visible = true
            this.tileTag.text = this.hex.cell.name
        } else {
            this.tileTag.visible = false
        }
        this.drawHex()
    }

    drawHex () {
        this.clear()

        const corners = []
        for (let i = 0; i < 6; i++) {
            corners.push(this._getHexCorner(i))
        }
        const {color, opacity} = this.getHexColor(this.hex)
        this.beginFill(color, opacity)
        this.drawPolygon(corners)
    }

    _getHexCorner (i) {
        const angleDeg = 60 * i + 30
        const angleRad = Math.PI / 180 * angleDeg
        return new Phaser.Point(
            this.radius + this.radius * Math.cos(angleRad),
            this.radius + this.radius * Math.sin(angleRad),
        )
    }
}

export default HexTile
