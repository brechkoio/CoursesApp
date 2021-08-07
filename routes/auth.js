const { Router } = require('express');
const bcryptjs = require('bcryptjs');
const crypto = require('crypto');
const regEmail = require('../emails/regestration');
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');
const User = require('../models/user');
const keys = require('../keys');
const resetEmail = require('../emails/reset');
const router = Router();

const transporter = nodemailer.createTransport(sendgrid({
    auth: {
        api_key: keys.SENDGRID_API_KEY
    }
}))

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Auth',
        isLogin: true,
        loginError: req.flash('loginError'),
        registerError: req.flash('registerError'),
    });
});

router.get('/logout', async (req, res) => {
    req.session.destroy(() => {
        res.redirect('/auth/login#login');
    });
});

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        const candidate = await User.findOne({ email });

        if (candidate) {
            const areSame = await bcryptjs.compare(password, candidate.password);

            if (areSame) {
                req.session.user = candidate;
                req.session.isAuthenticated = true;
                req.session.save((err) => {
                    if (err) {
                        throw err
                    } else {
                        res.redirect('/');
                    }
                });
            } else {
                req.flash('loginError', 'The password is incorrect')
                res.redirect('/auth/login#login');
            }
        } else {
            req.flash('loginError', 'The login is incorrect')
            res.redirect('/auth/login#login');
        }
    } catch (error) {
        console.log(error);
    }
});

router.post('/register', async (req, res) => {
    try {
        const { email, password, name, repead } = req.body;
        const candidate = await User.findOne({ email });

        if (candidate) {
            req.flash('registerError', 'This email address is already in use');
            res.redirect('/auth/login#register');
        } else {
            const hashPassword = await bcryptjs.hash(password, 10);
            const user = new User({
                email,
                name,
                password: hashPassword,
                cart: { items: [] }
            });

            await user.save();
            await transporter.sendMail(regEmail(email));
            res.redirect('/auth/login#login');
        }

    } catch (error) {
        console.log(error);
    }
});

router.get('/reset', (req, res) => {
    res.render('auth/reset', {
        title: 'Reset password',
        error: req.flash('error')
    });
});

router.post('/reset', (req, res) => {
   try {
    crypto.randomBytes(32, async (err, buffer) => {
        if (err) {
            req.flash('error', "Error");
            return res.redirect('/auth/reset');
        }

        const token = buffer.toString('hex');
        const candidate = await User.findOne({email: req.body.email});

        if (candidate) {
            candidate.resetToken = token;
            candidate.resetTokenExp = Date.now() + 60 * 60 * 1000;
            await candidate.save();
            await transporter.sendMail(resetEmail(candidate.email, token));
            res.redirect('/auth/login');
        } else {
            req.flash('error', 'Email not found');
            res.redirect('/auth/reset');
        }
    })
   } catch (error) {
       console.log(error);
   } 
});

module.exports = router;