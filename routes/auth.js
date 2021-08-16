const { Router } = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { validationResult } = require('express-validator');
const regEmail = require('../emails/regestration');
const nodemailer = require('nodemailer');
const User = require('../models/user');
const resetEmail = require('../emails/reset');
const {registerValidators, loginValidators} = require('../utils/validators');
const router = Router();

const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'larissa.von@ethereal.email',
        pass: 'kathR7jtS9kC2J4hRK'
    }
});

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

router.post('/login', loginValidators, async (req, res) => {
    try {
        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('loginError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#login');
        }

        const {email, password} = req.body;

        const candidate = await User.findOne({ email });
        const areSame = await bcrypt.compare(password, candidate.password);
        

        if (areSame) {
            req.session.user = candidate;
            req.session.isAuthenticated = true;
            req.session.save(err => {
                if (err) {
                    throw err;
                }
                res.redirect('/');
            });
        }
    } catch (e) {
        console.log(e)
    }
});

router.post('/register', registerValidators, async (req, res) => {
    try {
        const { email, password, name } = req.body;

        const errors = validationResult(req);

        if (!errors.isEmpty()) {
            req.flash('registerError', errors.array()[0].msg);
            return res.status(422).redirect('/auth/login#register');
        }

        const hashPassword = await bcrypt.hash(password, 10);

        const user = new User({
            email,
            name,
            password: hashPassword,
            cart: { items: [] }
        });

        await user.save();
        await transporter.sendMail(regEmail(email));
        res.redirect('/auth/login#login');

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

router.get('/password/:token', async (req, res) => {
    if (!req.params.token) {
        return res.redirect('/auth/login')
      }
    
      try {
        const user = await User.findOne({
          resetToken: req.params.token,
          resetTokenExp: {$gt: Date.now()}
        })
    
        if (!user) {
          return res.redirect('/auth/login')
        } else {
          res.render('auth/password', {
            title: 'Восстановить доступ',
            error: req.flash('error'),
            userId: user._id.toString(),
            token: req.params.token
          })
        }
      } catch (e) {
        console.log(e)
      }
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

router.post('/password', async (req, res) => {
    try {
        const user = await User.findOne({
          _id: req.body.userId,
          resetToken: req.body.token,
          resetTokenExp: {$gt: Date.now()}
        })
    
        if (user) {
          user.password = await bcrypt.hash(req.body.password, 10)
          user.resetToken = undefined
          user.resetTokenExp = undefined
          await user.save()
          res.redirect('/auth/login')
        } else {
          req.flash('loginError', 'Время жизни токена истекло')
          res.redirect('/auth/login')
        }
      } catch (e) {
        console.log(e)
      }
});

module.exports = router;