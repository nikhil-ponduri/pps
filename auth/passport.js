import { ExtractJwt, Strategy } from 'passport-jwt';
import passport from 'passport';
import jwt from 'jsonwebtoken';
import users from '../models/users.models';
import { SECRETKEY } from '../utils/constants';

const opts = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: SECRETKEY
}

module.exports = () => {
    passport.use(new Strategy(opts, (jwt_payload, done) => {
        users.findById(jwt_payload.id, (err, user) => {
            if (err) return done(err);
            if (!user) return done(null, false);
            return done(null, { id: user._id, role: user.role });
        })
    }))
}
export const validateUser = (req, res, next) => {
    const { headers: { authorization = '' } } = req;
    jwt.verify(authorization.split(' ')[1], SECRETKEY, (err, data) => {
        if (err) return next();
        users.findById(data.id, (err, user) => {
            if (user) req.user = { id: user._id, role: user.role };
            next();
        })
    })
}