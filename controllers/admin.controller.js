import bannerModel from '../models/banner.models';
import { Stream } from 'stream';
import { v4 } from 'uuid'
import { bucket, serverError, badRequest } from '../utils/constants';
import productsModels from '../models/products.models';
import featuredProductsModel from '../models/featured.model';
import { sendResponse } from '../utils/utils';
import promoModel from '../models/promos.models';

export const addBanner = (req, res) => {
    const { body: { title, description, artist }, files: { banner } } = req;
    let bufferStream = new Stream.PassThrough();
    bufferStream.end(new Buffer(banner.data));
    const fileName = `${v4()}.jpeg`;
    const file = bucket.file(fileName)
    bufferStream.pipe(file.createWriteStream({
        metadata: {
            contentType: 'image/jpeg'
        },
        resumable: false
    })).on('error', (err) => {
        console.log('error while uploading image', err);
        return serverError(res);
    }).on('finish', () => {
        new bannerModel({
            description,
            url: fileName,
            artist
        }).save((err, banner) => {
            console.log('saved');
            return res.json(banner);
        })
    })
}

export const deleteBanner = (req, res) => {
    const { prams: { id } } = req;
    bannerModel.findByIdAndDelete(id, (err) => {
        if (err) return serverError(res);
        return res;
    })
}

export const featureProduct = (req, res) => {
    const { params: { id } } = req;
    productsModels.updateOne({ _id: id }, { $set: { featured: true }, }, (err, result) => {
        if (err) return serverError(res);
        if (!result.modifiedCount) return badRequest(res, 'no product found with that id')
        new featuredProductsModel({
            productId: id
        }).save(err => {
            if (err) return serverError(res);
            return res.send();
        })
    })
}

export const removeFeatureProduct = (req, res) => {
    const { params: { id } } = req;
    productsModels.updateOne({ _id: id }, { $set: { featured: false }, }, (err, result) => {
        if (err) return serverError(res);
        if (!result.modifiedCount) return badRequest(res, 'no product found with that id')
        featuredProductsModel.deleteOne({ productId: id }, (err, result) => {
            if (err) return serverError(res);
            if (!result.deletedCount) return badRequest(res, 'no product found with that id');
            return res.end();
        })
    })
}

export const getCarousals = (rea, res) => {
    bannerModel.find({}).then(banners => {
        return sendResponse(res, banners);
    }).catch(err => {
        return serverError(err);
    })
}

export const addPromo = (req, res) => {
    const { productId, promo } = req.body;
    productsModels.findById(productId, (err, product) => {
        if (err) return serverError(res);
        if (!product) return badRequest(res, "Product not found for given Id");
        promoModel.updateOne({ promo }, { productId }, { upsert: true }).then(result => {
            return sendResponse(res);
        }).catch(err => {
            return serverError(res, null, err);
        })
    })

}

export const deletePromo = (req, res) => {
    const { productId } = req.params;
    promoModel.deleteOne({ productId }).then(result => {
        sendResponse(res);
    }).catch(err => {
        serverError(res);
    })
}

export const getPromo = (req, res) => {
    promoModel.aggregate([{
        $lookup: {
            from: "products",
            localField: "productId",
            foreignField: "_id",
            as: "productInfo"
        },
    },
    {
        $project: {
            data: {
                $arrayElemAt: ['$productInfo', 0]
            },
            promo: 1
        }
    }]).then(results => {
        return sendResponse(res, results);
    }).catch(err => {
        return serverError(res, null, err)
    })
}