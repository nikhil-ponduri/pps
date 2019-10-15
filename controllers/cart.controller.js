import productsModels from "../models/products.models";
import { serverError, badRequest } from "../utils/constants";
import cartModel from "../models/cart.models";
import { sendResponse } from "../utils/utils";

export const addToCart = async (req, res) => {
    try {
        const { params: { productId }, user: { id } } = req;
        let product = await productsModels.findById(productId, { likes: 0 });
        if (!product) return badRequest(res, 'No product found with that Id');
        let item = await cartModel.findOne({ userId: id, productId });
        if (item) return badRequest(res, 'Product already in cart');
        item = await new cartModel({ userId: id, productId }).save();
        return sendResponse(res, { _id: item._id, data: product.toJSON() });
    } catch (error) {
        return serverError(res, null, error);
    }
}

export const deleteFromCart = async (req, res) => {
    try {
        const { params: { productId }, user: { id } } = req;
        const product = productsModels.findById(productId);
        if (!product) return badRequest(res, 'No product found with that Id');
        const result = await cartModel.deleteOne({ userId: id, productId });
        console.log(result, productId)
        if (!result.deletedCount) return badRequest(res, 'No Item found in cart with that Id');
        return sendResponse(res);
    } catch (error) {
        return serverError(res, null, error);
    }
}

export const getCart = async (req, res) => {
    try {
        const { user: { id } } = req;
        const cart = await cartModel.aggregate([
            { $match: { userId: id } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'data'
                }
            },
            {
                $addFields: {
                    data: {
                        $arrayElemAt: ['$data', 0]
                    }
                }
            }, {
                $project: {
                    'data.likes': 0,
                    productId: 0,
                    userId: 0,
                    'data.userId': 0
                }
            }
        ]);
        return sendResponse(res, cart);
    } catch (error) {
        serverError(res, null, error);
    }
}