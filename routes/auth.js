const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Wallet = require('../wallet');

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google', async (req, res) => {
    try {
        const { token } = req.body;
        

        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        
        const { sub: googleId, email, name } = payload;


        let user = await User.findOne({ googleId });

        if (!user) {

            const userWallet = new Wallet();
            

            user = new User({
                googleId,
                email,
                name,
                publicKey: userWallet.publicKey,
                privateKey: userWallet.keyPair.getPrivate('hex')
            });
            await user.save();
        }


        const jwtToken = jwt.sign(
            { id: user._id }, 
            process.env.JWT_SECRET || 'fallback_secret_for_development', 
            { expiresIn: '7d' }
        );

        res.json({ token: jwtToken, user: { name: user.name, email: user.email, publicKey: user.publicKey } });
    } catch (error) {
        console.error('Google Auth Error:', error);
        res.status(400).json({ error: 'Authentication failed' });
    }
});

module.exports = router;
