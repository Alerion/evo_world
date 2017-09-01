import Phaser from 'phaser'

// TODO: Replace with Polygon with custom background color and size

export default class extends Phaser.Sprite {
    constructor ({ game, x, y, asset, isVertical, hex }) {
        super(game, x, y, asset)

        this.hex = hex

        this.anchor.setTo(0.5, 0.5)

        this.tileTag = game.make.text(0, 0, this.hex.x, {fontSize: 11})
        this.tileTag.anchor.setTo(0.5, 0.5)
        this.tileTag.addColor('#ffffff', 0)
        if (isVertical) {
            this.tileTag.rotation = -Math.PI / 2
        }
        this.addChild(this.tileTag)
        this.tileTag.visible = true

        if (isVertical) {
            this.rotation = Math.PI / 2
        }
        this.inputEnabled = true
        this.input.useHandCursor = true
        this.events.onInputOut.add(this.rollOut, this)
        this.events.onInputOver.add(this.rollOver, this)
        this.marked = false
    }

    rollOut () {
        this.scale.x = 1
        this.scale.y = 1
    }

    rollOver () {
        this.scale.x = 0.9
        this.scale.y = 0.9
    }

    select () {
        this.game.selectedHex = this
    }

    update () {
        this.tileTag.text = Math.round(this.hex.x)
    }
}
