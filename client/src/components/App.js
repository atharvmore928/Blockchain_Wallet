import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import logo from '../../assets/logo.png';
import history from '../history';

class App extends Component {
  state = { walletInfo: { address: 'Loading...', balance: 'Loading...' }, user: null }

  componentDidMount() {
    const token = localStorage.getItem('token');
    if (!token) {
      history.push('/login');
      return;
    }

    const user = JSON.parse(localStorage.getItem('user'));
    this.setState({ user });

    fetch('http://localhost:3000/api/wallet-info', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      .then(response => {
        if (response.status === 401) {
          this.handleLogout();
          throw new Error('Unauthorized');
        }
        return response.json();
      })
      .then(data => {
        if (data.address) {
          this.setState({ walletInfo: data });
        }
      })
      .catch(err => console.error('Error:', err));
  }

  handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    history.push('/login');
  }

  render() {
    const { address, balance } = this.state.walletInfo;
    const { user } = this.state;
    return (
      <div className='App'>
        <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '10px' }}>
          {user && <span style={{ marginRight: '15px' }}>Hello, {user.name}</span>}
          <button onClick={this.handleLogout} className='btn btn-danger btn-sm'>Logout</button>
        </div>
        <img className='logo' src={logo}></img>
        <br />
        <div className='WalletInfo'>
          <h2>Welcome to the blockchain...</h2>
          <div>Address: {address}</div>
          <div>Balance: {balance}</div>
          <br />
          <div><Link to='/blocks'>Blocks</Link></div>
          <div><Link to='/conduct-transaction'>Conduct a Transaction</Link></div>
          <div><Link to='/transaction-pool'>Transaction Pool</Link></div>
        </div>
      </div>
    );
  }
}

export default App;