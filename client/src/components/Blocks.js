import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Block from './Block';

class Blocks extends Component {
    state = { blocks: [] }

    componentDidMount() {
        fetch('http://localhost:3000/api/blocks')
            .then(response => response.json())
            .then(json => this.setState({ blocks: json }));
    }

    render() {
        console.log('this.state', this.state);

        return (
            <div>
                <div><Link to='/'>Back to Home</Link></div>
                <h3>Blocks</h3>
                {this.state.blocks.map((block, index) => (
                    <div key={index} style={{ marginBottom: '20px' }}>
                        {index === 0 ? (
                            <div><strong>genesis-block</strong></div>
                        ) : (
                            <div><strong>hash-{index}</strong></div>
                        )}
                        <div style={{ wordBreak: 'break-all', fontSize: '12px' }}>
                            {block.hash}
                        </div>


                        <div className='Block'>{block.hash}</div>

                        <Block key={block.hash} block={block} />
                    </div>
                ))}
            </div>
        );
    }
}

export default Blocks;