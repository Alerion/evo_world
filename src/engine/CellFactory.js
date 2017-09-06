class CellFactory {
    constructor ({ name, reactions }) {
        this.name = name
        this.reactions = reactions
    }

    create () {
        const cell = new Cell(this)
        Object.assign(cell, this)
        delete cell.create
        return cell
    }
}

class Cell {}

export default CellFactory
