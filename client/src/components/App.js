import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';

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
      <div className='App'>
        <img className='logo' src={logo}></img>
        <br />
        <div className='WalletInfo'>
          <h2>Welcome to the blockchain...</h2>
          <div>Address: {address}</div>
          <div>Balance: {balance}</div>
          <div><Link to='/blocks'>Blocks</Link></div>
          <br />
          <div><Link to='/conduct-transaction'>Conduct a Transaction</Link></div>
          <div><Link to='/transaction-pool'>Transaction Pool</Link></div>
        </div>
      </div>
    );
  }
}

export default App;