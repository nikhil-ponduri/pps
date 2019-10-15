import { Schema, model } from 'mongoose';

const cartSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    },
    productId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true
    }
});

cartSchema.index({ userId: 1, 'cart.productId': -1 });

const cartModel = model('cart', cartSchema);

export default cartModel;