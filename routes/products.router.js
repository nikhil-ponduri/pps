import { Router } from 'express'
import passport from 'passport'
import { allProducts, updateProduct, productDetails, addProduct, likeProduct, deleteProductLike, getFeaturedProducts, getLatestProducts, getPopularProducts, getLikedProducts, putFeatureProduct, deleteFeaturedProduct } from '../controllers/products.controller';
import { isValidProductForm } from '../validations/product.validations';
import { validateUser } from '../auth/passport';

const router = Router();

router.get('/all', validateUser, allProducts);

router.post('/', passport.authenticate('jwt', { session: false }), isValidProductForm, addProduct);

router.get('/liked', passport.authenticate('jwt', { session: false }), getLikedProducts)

router.put('/:productId/like', passport.authenticate('jwt', { session: false }), likeProduct)

router.delete('/:productId/like', passport.authenticate('jwt', { session: false }), deleteProductLike);

router.get('/featured', getFeaturedProducts);

router.put('/:productId/feature', passport.authenticate('jwt', { session: false }), putFeatureProduct);

router.delete('/:productId/feature', passport.authenticate('jwt', { session: false }), deleteFeaturedProduct);

router.get('/latest', validateUser, getLatestProducts);

router.get('/popular', getPopularProducts);


router.get('/:productId', validateUser, productDetails);

router.put('/:id', passport.authenticate('jwt', { session: false }), isValidProductForm, updateProduct);



module.exports = router;