import Phaser from 'phaser'

// TODO: Replace with Polygon with custom background color and size

class HexTile extends Phaser.Graphics {
    constructor ({ game, x, y, radius, hex }) {
        super(game, x, y)

        this.radius = radius - 1
        this.hex = hex

        this.tileTag = game.make.text(radius, radius, this.hex.x, {fontSize: 11})
        this.tileTag.anchor.setTo(0.5, 0.5)
        this.tileTag.addColor('#000', 0)
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
    }

    drawHex () {
        // Invisible circle to allow select hex
        this.beginFill(0x0000FF, 0)
        this.drawCircle(this.radius, this.radius, this.radius * 2)

        const corners = []
        for (let i = 0; i < 6; i++) {
            corners.push(this._hexCorner(i))
        }

        // draw vertices
        for (let i = 0; i < 6; i++) {
            this.lineStyle(1, 0xffd900, 1)
            this.moveTo(corners[i].x, corners[i].y)
            this.lineTo(corners[(i + 1) % 6].x, corners[(i + 1) % 6].y)
        }
    }

    _hexCorner (i) {
        const angleDeg = 60 * i + 30
        const angleRad = Math.PI / 180 * angleDeg
        return {
            x: this.radius + this.radius * Math.cos(angleRad),
            y: this.radius + this.radius * Math.sin(angleRad),
        }
    }
}

export default HexTile
