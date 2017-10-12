import React from 'react'
import _ from 'lodash'
import numeral from 'numeral'
import {
    ButtonToolbar, Button, Glyphicon, Modal, Badge, ListGroup, ListGroupItem, DropdownButton,
    MenuItem,
} from 'react-bootstrap'
import CellInfoModal from './CellInfoModal'
import {reactionToText} from '../utils.js'

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

        let cell = hex.cell
        let cellInfo = ''
        let cellModal = ''

        if (cell) {
            const cellResources = _.map(cell.resources, (value, name) =>
                <ListGroupItem key={name}>
                    {name} <Badge>{numeral(value).format('0')}</Badge>
                </ListGroupItem>
            )

            cellInfo = <div>
                {cell.name} ({hex.i}, {hex.j})
                <Button onClick={this.openCellInfo} bsStyle="link"><Glyphicon glyph="question-sign"/></Button>
                <ListGroup>
                    <ListGroupItem key="life-time">
                        Life time <Badge>{numeral(cell.lifeTime).format('0')}</Badge>
                    </ListGroupItem>
                </ListGroup>
                <ListGroup>{cellResources}</ListGroup>
            </div>

            const reactionsList = _.map(cell.reactions, (reaction, index) => {
                return <li key={index}>{reactionToText(reaction)}</li>
            })
            const divisionConditionsList = _.map(cell.divisionConditions, (val, resource) => {
                return <li key={resource}>{`${resource} = ${val}`}</li>
            })
            cellModal = <Modal show={this.state.showCellInfo} onHide={this.closeCellInfo}>
                <Modal.Header closeButton>
                    <Modal.Title>{cell.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <h4>Reactions (for second)</h4>
                    <ul>{reactionsList}</ul>

                    <h4>Division conditions</h4>
                    <ul>{divisionConditionsList}</ul>

                    <h4>Death conditions</h4>
                    <ul>
                        <li>Life time: {cell.deathConditions && cell.deathConditions.lifeTime} sec</li>
                    </ul>
                </Modal.Body>
            </Modal>
        }

        return <div>
            <ListGroup>{resources}</ListGroup>
            {cellInfo}
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
