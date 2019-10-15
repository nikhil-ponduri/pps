import { Schema, model } from "mongoose";

const featuredProductsModel = new Schema({
    productId: {
        type: Schema.Types.ObjectId,
        required: true,
        index: true,
        unique: true
    },
    created: {
        type: Date,
        default: Date.now()
    }
});

export default model('featureds', featuredProductsModel);