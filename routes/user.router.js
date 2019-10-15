import passport from 'passport'
import { registerUser, loginUser, getUserDetails } from '../controllers/user.controller';
import { isValidRegisterForm, isValidLoginForm } from '../validations/user.validations';
var express = require('express');
var router = express.Router();

/* GET users listing. */
router.post('/login', isValidLoginForm, loginUser);

router.post('/register', isValidRegisterForm, registerUser);

router.get('/ping', passport.authenticate('jwt', { session: false }), getUserDetails);

module.exports = router;
