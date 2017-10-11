import React from 'react'
import _ from 'lodash'
import numeral from 'numeral'
import {
    ButtonToolbar, Button, Glyphicon, Modal, Badge, ListGroup, ListGroupItem, DropdownButton,
    MenuItem,
} from 'react-bootstrap'
import CellInfoModal from './CellInfoModal'

class HexPanel extends React.Component {
    constructor (props) {
        super(props)
        this.state = { showCellInfo: false }

        this.openCellInfo = this.openCellInfo.bind(this)
        this.closeCellInfo = this.closeCellInfo.bind(this)
    }

    render () {
        let button
        if (this.props.running) {
            button = <Button bsStyle="warning" onClick={this.props.stop}>
                Pause <Glyphicon glyph="pause"/>
            </Button>
        } else {
            button = <Button bsStyle="success" onClick={this.props.start}>
                Start <Glyphicon glyph="play"/>
            </Button>
        }

        const activeItem = _.find(this.props.displayChoices, item => item.active)
        const displayFilter = <DropdownButton title={activeItem.name} id="display-filter"
            onSelect={this.props.setDisplayMode}>
            {this.props.displayChoices.map((item) => {
                if (item.key === '') {
                    return <MenuItem divider key="divider"/>
                }
                return <MenuItem eventKey={item.key} key={item.key} active={item.active}>
                    {item.name}
                </MenuItem>
            })}
        </DropdownButton>

        return <div>
            <ButtonToolbar>
                {button}
                <Button bsStyle="danger" onClick={this.props.reset}>
                    Reset <Glyphicon glyph="refresh"/>
                </Button>
                {displayFilter}
            </ButtonToolbar>
            {this.renderHex(this.props.hex)}
        </div>
    }

    renderHex (hex) {
        if (!hex) {
            return <div>Click on hex to select</div>
        }

        // FIXME: Use RESOURCES_MULTIPLIER for format
        const resources = _.map(hex.resources, (value, name) =>
            <ListGroupItem key={name}>
                {name} <Badge>{numeral(value).format('0')}</Badge>
            </ListGroupItem>
        )

        let cell = ''
        let cellModal = ''

        if (hex.cell) {
            const cellResources = _.map(hex.cell.resources, (value, name) =>
                <ListGroupItem key={name}>
                    {name} <Badge>{numeral(value).format('0')}</Badge>
                </ListGroupItem>
            )

            cell = <div>
                {hex.cell.name} ({hex.i}, {hex.j})
                <Button onClick={this.openCellInfo} bsStyle="link"><Glyphicon glyph="question-sign"/></Button>
                <ListGroup>{cellResources}</ListGroup>
            </div>

            cellModal = <Modal show={this.state.showCellInfo} onHide={this.closeCellInfo}>
                <Modal.Header closeButton>
                    <Modal.Title>{hex.cell.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Reactions</h4>
                </Modal.Body>
            </Modal>
        }

        return <div>
            <ListGroup>{resources}</ListGroup>
            {cell}
            {cellModal}
        </div>
    }

    openCellInfo () {
        this.setState({ showCellInfo: true })
    }

    closeCellInfo () {
        this.setState({ showCellInfo: false })
    }
}

export default HexPanel
