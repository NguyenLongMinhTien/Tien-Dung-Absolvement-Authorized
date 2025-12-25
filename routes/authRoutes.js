const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const authController = require('../controllers/authController');

router.post(
  '/register',
  [
    body('name').isString().trim().notEmpty().withMessage('name is required'),
    body('email').isEmail().withMessage('valid email is required'),
    body('password').isString().isLength({ min: 6 }).withMessage('password min length 6'),
    body('role').optional().isIn(['student', 'admin']).withMessage('invalid role')
  ],
  authController.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('valid email is required'),
    body('password').isString().notEmpty().withMessage('password is required')
  ],
  authController.login
);

module.exports = router;