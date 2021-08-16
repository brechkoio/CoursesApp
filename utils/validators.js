const { body } = require('express-validator');
const User = require('../models/user');

exports.registerValidators = [
    body('email')
      .isEmail().withMessage('Enter correct password')
      .custom(async (value, {req}) => {
        try {
          const user = await User.findOne({ email: value })
          if (user) {
            return Promise.reject('Email failed, change other email')
          }
        } catch (e) {
          console.log(e)
        }
      })
      .normalizeEmail(),
    body('password', 'Password mast be minimum 6 simbol and max simbols 36')
      .isLength({min: 6, max: 56})
      .isAlphanumeric()
      .trim(),
    body('confirm')
    .custom((value, {req}) => {
      if (value !== req.body.password) {
        throw new Error('Passwords must be the same')
      }
      return true
    })
    .trim(),
    body('name')
    .isLength({min: 3}).withMessage('Name must be minimum 3 simbol')
    .trim()
];

exports.loginValidators = [
    body('email')
    .isEmail().withMessage('Enter correct password')
    .custom(async (value, {req}) => {
      try {
        const user = await User.findOne({ email: value })
        if (!user) {
          return Promise.reject('Email is false, enter true email')
        }
      } catch (e) {
        console.log(e)
      }
    }),
    body('password', 'Incorrect password, enter correct password')
    .isLength({min: 6})
];

exports.courseValidators = [
    body('title')
    .isLength({min: 3})
    .withMessage('Min length mast be min 3 simbol')
    .trim(),
    body('price').isNumeric().withMessage('Enter correct price'),
    body('img', 'Enter correct URL image').isURL()
];