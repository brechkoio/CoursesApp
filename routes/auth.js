const { Router } = require('express');
const bcryptjs = require('bcryptjs');
const User = require('../models/user');
const router = Router();

router.get('/login', async (req, res) => {
    res.render('auth/login', {
        title: 'Auth',
        isLogin: true
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
                res.redirect('/auth/login#login');
            }
        } else {
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
            res.redirect('/auth/login#login');
        }

    } catch (error) {
        console.log(error);
    }
});

module.exports = router;