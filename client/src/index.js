import React from 'react';
import { render } from 'react-dom';
import { Router, Switch, Route } from 'react-router-dom';
import history from './history';
import App from './components/App';
import Blocks from './components/Blocks';
import './index.css';
import TransactionPool from './components/TransactionPool';
import ConductTransaction from './components/ConductTransaction';

import { GoogleOAuthProvider } from '@react-oauth/google';
import Login from './components/Login';

const GOOGLE_CLIENT_ID = '1056587351266-4onntkik630q74oq53e03pgu1mm48rsu.apps.googleusercontent.com';

render(
    <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
        <Router history={history}>
            <Switch>
                <Route exact={true} path='/' component={App} />
                <Route path='/login' component={Login} />
                <Route path='/blocks' component={Blocks} />
                <Route path='/conduct-transaction' component={ConductTransaction} />
                <Route path='/transaction-pool' component={TransactionPool} />
            </Switch>
        </Router>
    </GoogleOAuthProvider>,
    document.getElementById('root')
);