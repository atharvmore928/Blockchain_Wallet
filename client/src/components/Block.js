import React, { Component } from 'react';
import { Button } from 'react-bootstrap';
import Transaction from './Transaction';

class Block extends Component {
    state = { displayTransaction: false }

    toggleDisplayTransaction = () => {
        this.setState({ displayTransaction: !this.state.displayTransaction });
    }

    get displayTransactions() {
        const { data } = this.props.block;

        const stringifiedData = JSON.stringify(data);
        const dataDisplay = stringifiedData.length > 35 ?
            `${stringifiedData.substring(0, 35)}...` :
            stringifiedData;

        if (this.state.displayTransaction) {
            return (
                <div>
                    {data.map(transaction => (
                        <div key={transaction.id}>
                            <hr />
                            <Transaction transaction={transaction} />
                        </div>
                    ))}
                    <br />
                    <Button
                        bsStyle="danger"
                        bsSize="small"
                        onClick={this.toggleDisplayTransaction}
                    >
                        Show Less
                    </Button>
                </div>
            );
        }

        return (
            <div>
                <div>Data: {dataDisplay}</div>
                <Button
                    bsStyle="danger"
                    bsSize="small"
                    onClick={this.toggleDisplayTransaction}
                >
                    Show More
                </Button>
            </div>
        );
    }

    render() {
        const { timestamp, hash } = this.props.block;
        const hashDisplay = `${hash.substring(0, 15)}...`;

        return (
            <div className='Block'>
                <div>Hash: {hashDisplay}</div>
                <div>Timestamp: {new Date(timestamp).toLocaleString()}</div>
                {this.displayTransactions}
            </div>
        );
    }
}

export default Block;