import { Router } from 'express';
import passport from 'passport';
import { isValidBannerForm } from '../validations/admin.validations';
import { addBanner, deleteBanner, getCarousals, addPromo, getPromo } from '../controllers/admin.controller';
const router = Router();

router.post('/carousal', passport.authenticate('jwt', { session: false }), isValidBannerForm, addBanner);

router.delete('/carousal', passport.authenticate('jwt', { session: false }), deleteBanner);

router.get('/carousals', getCarousals);

router.post('/promo', passport.authenticate('jwt', { session: false }), addPromo);

router.get('/promo', getPromo);

module.exports = router;