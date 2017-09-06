import React from 'react'
import _ from 'lodash'
import numeral from 'numeral'

class HexPanel extends React.Component {
    render () {
        const hex = this.props.hex
        const resources = _.map(hex.resources, (value, name) =>
            <li className="list-group-item" key={name}>
                {name} <span className="badge badge-default badge-pill">{numeral(value).format('0.00')}</span>
            </li>
        )
        if (hex) {
            return <div><ul className="list-group">{resources}</ul></div>
        }
        return <div>Click on hex to select</div>
    }
}

export default HexPanel
