import { Schema, model } from 'mongoose';

const promoSchema = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        required: true
    },
    promo: {
        type: Number,
        required: true,
        enum: [1, 2, 3, 4]
    }
});

const promoModel = model('promos', promoSchema);

export default promoModel