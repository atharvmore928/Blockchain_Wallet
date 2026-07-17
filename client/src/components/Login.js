import React, { Component } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import history from '../history';

class Login extends Component {
    state = { error: '' };

    handleLoginSuccess = async (credentialResponse) => {
        try {
            const API_BASE_URL = process.env.REACT_APP_API_URL || window.location.origin;
            const res = await axios.post(`${API_BASE_URL}/api/auth/google`, {
                token: credentialResponse.credential
            });
            
            if (res.data && res.data.token && res.data.user) {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                history.push('/');
            } else {
                throw new Error("Invalid response from server. Check REACT_APP_API_URL.");
            }
        } catch (error) {
            console.error('Login Failed:', error);
            this.setState({ error: 'Failed to authenticate with the server.' });
        }
    };

    render() {
        return (
            <div className='Login' style={{ textAlign: 'center', marginTop: '50px' }}>
                <h2>Welcome to Blockchain Wallet</h2>
                <p>Please log in to continue.</p>
                <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <GoogleLogin
                        onSuccess={this.handleLoginSuccess}
                        onError={() => {
                            console.log('Login Failed');
                            this.setState({ error: 'Google Login Failed.' });
                        }}
                    />
                </div>
                {this.state.error && <div className='danger-alert'>{this.state.error}</div>}
            </div>
        );
    }
}

export default Login;
