import React, { Component } from 'react';
import Blocks from './Blocks';
import logo from '../assets/logo.png';

class App extends Component {
  state = { walletInfo: { address: 'fooxv6', balance: 9999 } }

  componentDidMount() {
    fetch('http://localhost:3000/api/wallet-info')
      .then(response => response.json())
      .then(data => {
        console.log('response', data);
        this.setState({ walletInfo: data });
      })
      .catch(err => console.error('Error:', err));
  }

  render() {
    const { address, balance } = this.state.walletInfo;
    return (
      <div>
        <img className='logo' src={logo}></img>
        <br />
        <h2>Welcome to the blockchain...</h2>
        <div>Address: {address}</div>
        <div>Balance: {balance}</div>
        <br />
        <Blocks />
      </div>
    );
  }
}

export default App;