import products from "../models/products.models";
import stream from 'stream';
import { ObjectId } from 'mongodb'
import { v4 } from 'uuid'
import { serverError, badRequest, bucket } from "../utils/constants";
import trashModel from "../models/trash.model";
import featuredProductsModel from "../models/featured.model";
import productsModels from "../models/products.models";
import { sendResponse, S3 } from "../utils/utils";
import likesModel from "../models/likes.model";

export const allProducts = async (req, res) => {
    try {
        const { user } = req;
        const { page = 0, name = '' } = req.query;
        const query = [
            {
                $match: {
                    title: {
                        $regex: name
                    }
                }
            },
            {
                $project: {
                    likes: 0
                }
            }]
        if (!user) {
            const results = await productsModels.aggregate([
                ...query,
                {
                    $facet: {
                        metadata: [{
                            $count: 'total',
                        }, {
                            $addFields: {
                                page, offset: 12
                            }
                        }],
                        data: [{
                            $skip: page * 12,
                        }, {
                            $limit: 12
                        }]
                    }
                }
            ]);
            sendResponse(res, results[0])
        }
        else {
            const { id, role } = user;
            if (role === 'admin') {
                query.push(...[{
                    $lookup: {
                        from: 'featureds',
                        localField: '_id',
                        foreignField: 'productId',
                        as: 'featured'
                    }
                }, {
                    $addFields: {
                        featured: {
                            $size: '$featured'
                        }
                    }
                }]);
            }
            const results = await productsModels.aggregate([
                ...query,
                {
                    $lookup: {
                        from: 'likes',
                        let: { productID: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{ $eq: ['$productId', '$$productID'] }, { $eq: ['$userId', id] }]
                                    }
                                }
                            }
                        ],
                        as: 'liked'
                    }
                },
                {
                    $lookup: {
                        from: 'carts',
                        let: { productID: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{ $eq: ['$productId', '$$productID'] }, { $eq: ['$userId', id] }]
                                    }
                                }
                            }
                        ],
                        as: 'inCart'
                    }
                },
                {
                    $addFields: {
                        liked: {
                            $size: '$liked'
                        },
                        inCart: {
                            $size: '$inCart'
                        }
                    }
                },
                {
                    $facet: {
                        metadata: [{
                            $count: 'total',
                        }, {
                            $addFields: {
                                page, offset: 12
                            }
                        }],
                        data: [{
                            $skip: page * 12,
                        }, {
                            $limit: 12
                        }]
                    }
                }
            ]);
            sendResponse(res, results[0]);
        }
    } catch (error) {
        serverError(res, null, error);
    }
}

export const productDetails = async (req, res) => {
    try {
        const { params: { productId }, user } = req;
        let product;
        product = await productsModels.findById(productId, { likes: 0 });
        if (!product) return badRequest(res, 'No product found with that Id');
        if (!user) {
            return sendResponse(res, product.toJSON());
        }
        else {
            const { id } = user;
            const product = await productsModels.aggregate([{ $match: { _id: ObjectId(productId) } },
            {
                $lookup: {
                    from: 'likes',
                    let: { productID: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ['$productId', '$$productID'] }, { $eq: ['$userId', id] }]
                                }
                            }
                        }
                    ],
                    as: 'liked'
                }
            },
            {
                $lookup: {
                    from: 'carts',
                    let: { productID: '$_id' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ['$productId', '$$productID'] }, { $eq: ['$userId', id] }]
                                }
                            }
                        }
                    ],
                    as: 'inCart'
                }
            },
            {
                $lookup: {
                    from: 'featureds',
                    localField: 'productId',
                    foreignField: 'productId',
                    as: 'featured'
                }
            },
            {
                $addFields: {
                    liked: {
                        $size: '$liked'
                    },
                    inCart: {
                        $size: '$inCart'
                    },
                    featured: {
                        $size: '$featured'
                    }
                }
            },
            { $project: { likes: 0 } }
            ]);
            if (!product.length) return badRequest(res, 'No product found with that Id');
            return sendResponse(res, product[0]);
        }
    } catch (error) {
        serverError(res, null, error);
    }
}

export const updateProduct = (req, res) => {
    const { id } = req.params;
    const { title, description, price, discountPrice } = req.body;
    products.findById(id).then(product => {
        if (product.userId !== req.user._id) return badRequest(res, 'Product not found');
        product = {
            ...product,
            title,
            description,
            price,
            discountPrice
        }
        product.save((err, product) => {
            if (err) {
                console.log(err);
                return serverError(res);
            }
            return res.json({ data: product.toJSON() });
        })

    }).catch(err => {
        console.log(err);
        return serverError(res);
    })
}

export const addProduct = (req, res) => {
    try {
        const { title, description, price, artist, discount } = req.body;
        const { images } = req.files;
        let count = 0;
        const newProduct = {
            userId: req.user.id,
            title,
            description,
            price,
            artist,
            images: [],
            discount
        }
        const uploadImages = (images) => {
            images.slice(0, 4).map(async (image) => {
                let bufferStream = new stream.PassThrough();
                bufferStream.end(new Buffer(image.data));
                const fileName = v4();
                newProduct.images.push(fileName);
                const params = {
                    Bucket: 'projectpps',
                    Body: bufferStream,
                    Key: fileName,
                    'Content-Type': 'image/jpeg'
                }
                await S3.upload(params).promise();

            });
            new productsModels(newProduct).save();
        }
        uploadImages(Array.isArray(images) ? images : [images]);
        sendResponse(res);
    } catch (error) {
        serverError(res, null, error)
    }
}

export const likeProduct = async (req, res) => {
    try {
        const { params: { productId }, user: { id } } = req;
        const isLiked = await likesModel.findOne({ productId, userId: id });
        if (isLiked) return badRequest(res, 'User already liked product');
        const like = new likesModel({ productId, userId: id }).save();
        return sendResponse(res, like);
    }
    catch (error) {
        return serverError(res, null, error);
    }
}

export const deleteProductLike = async (req, res) => {
    try {
        const { params: { productId }, user: { id } } = req;
        const result = await likesModel.deleteOne({ userId: id, productId });
        if (!result.deletedCount) return badRequest(res, 'user not liked product');
        return sendResponse(res);
    } catch (error) {
        return serverError(res, null, error)
    }
}


export const deleteProduct = (req, res) => {
    const { id } = req.params;
    products.findByIdAndDelete(id).then(doc => {
        new trashModel({
            created: doc.created,
            userId: doc.userId,
            images: doc.images.map(image => image.url)
        }).save(err => {
            console.log(err);
        });
        return res.json();
    }).catch(err => {
        console.log(err);
        return serverError(res);
    })
}

export const getDeletedProducts = (req, res) => {
    const { id } = req.params;
    const { page = 0, offset = 10 } = req.query;
    trashModel.find().limit(10).skip(page * offset).then(products => {
        return res.json(products);
    }).catch(err => {
        console.log(err);
        return serverError(res);
    })
}

export const getFeaturedProducts = async (req, res) => {
    try {
        const results = await featuredProductsModel.aggregate([{
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
        }
        ]);
        sendResponse(res, results);
    } catch (error) {
        serverError(res, error);
    }
}

export const getPopularProducts = (req, res) => {
    productsModels.find({}).sort({ date: -1 }).limit(10).then(result => {
        return res.json(result);
    }).catch(error => {
        console.log(error);
        return serverError(res);
    })
}

export const getLatestProducts = async (req, res) => {
    try {
        const { user } = req;
        let data;
        if (!user) {
            data = await productsModels.find({}).sort({ _id: -1 }).limit(10);
        } else {
            let { id, role } = user;
            const query = [
                { $sort: { '_id': -1 } },
                { $limit: 10 },
                {
                    $lookup: {
                        from: 'likes',
                        let: { productID: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{ $eq: ['$productId', '$$productID'] }, { $eq: ['$userId', id] }]
                                    }
                                }
                            }
                        ],
                        as: 'liked'
                    }
                },
                {
                    $lookup: {
                        from: 'carts',
                        let: { productID: '$_id' },
                        pipeline: [
                            {
                                $match: {
                                    $expr: {
                                        $and: [{ $eq: ['$productId', '$$productID'] }, { $eq: ['$userId', id] }]
                                    }
                                }
                            }
                        ],
                        as: 'inCart'
                    }
                },
                {
                    $addFields: {
                        liked: {
                            $size: '$liked'
                        },
                        inCart: {
                            $size: '$inCart'
                        }
                    }
                },
            ]
            if (role === 'admin') {
                query.push(...[{
                    $lookup: {
                        from: 'featureds',
                        localField: '_id',
                        foreignField: 'productId',
                        as: 'featured'
                    }
                },
                {
                    $addFields: {
                        featured: {
                            $size: '$featured'
                        }
                    }
                }])
            }
            data = await productsModels.aggregate(query);
        }
        sendResponse(res, data);
    } catch (error) {
        serverError(res, null, error);
    }
}


export const getLikedProducts = async (req, res) => {
    try {
        const { user: { id } } = req;
        const result = await likesModel.aggregate([
            {
                $match: { userId: id }
            },
            {
                $lookup: {
                    from: 'products',
                    localField: 'productId',
                    foreignField: '_id',
                    as: 'data'
                }
            },
            {
                $lookup: {
                    from: 'carts',
                    let: { productID: '$productId' },
                    pipeline: [
                        {
                            $match: {
                                $expr: {
                                    $and: [{ $eq: ['$productId', '$$productID'] }, { $eq: ['$userId', id] }]
                                }
                            }
                        }
                    ],
                    as: 'inCart'
                }
            },
            {
                $addFields: {
                    data: {
                        $arrayElemAt: ['$data', 0]
                    }
                }
            },
            {
                $addFields: {
                    'data.inCart': {
                        $size: '$inCart'
                    }
                }
            },
            {
                $project: {
                    'data.likes': 0,
                    'userId': 0,
                    'productId': 0,
                    inCart: 0
                }
            }
        ]);
        sendResponse(res, result);
    } catch (error) {
        serverError(res, null, error);
    }
}

export const putFeatureProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const product = await productsModels.findById(productId);
        if (!product) return badRequest(res, 'No product found with that Id');
        const result = await featuredProductsModel.updateOne({ productId }, { productId }, { upsert: true });
        if (!result.upserted) return badRequest(res, 'Product already featured');
        return sendResponse(res);
    } catch (error) {
        serverError(res, null, error)
    }
}

export const deleteFeaturedProduct = async (req, res) => {
    try {
        const { productId } = req.params;
        const result = await featuredProductsModel.deleteOne({ productId });
        if (!result.deletedCount) return badRequest(res, 'No product found with that Id');
        return sendResponse(res);
    } catch (error) {
        serverError(res, null, error)
    }
}