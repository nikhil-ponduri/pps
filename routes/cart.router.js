import { Router } from 'express';
import passport from 'passport';
import { addToCart, deleteFromCart, getCart } from '../controllers/cart.controller';

const route = Router();

route.put('/:productId', passport.authenticate('jwt', { session: false }), addToCart);

route.delete('/:productId', passport.authenticate('jwt', { session: false }), deleteFromCart);

route.get('/', passport.authenticate('jwt', { session: false }), getCart);

module.exports = route;