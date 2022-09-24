import { Product } from '../models';
import multer from 'multer';
import path  from 'path';
import CustomErrorHandler from '../services/CustomErrorHandler';
import fs from 'fs';
import Joi from 'joi';
import productSchema from '../validators/productValidators';

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/') ,
    filename: (req, file, cb) => {
        const uniqueName = `${Date.now()}-${Math.round(Math.random() * 1E9 )} ${path.extname(file.originalname)}`
        cb(null, uniqueName);
    }
});

const handleMultipartData = multer({storage, limits: { fileSize: 1000000 * 5 }}).single('image')

const productController = {
    async store(req, res, next){
        // multipart form data
        handleMultipartData(req, res,  async(err) => {
            if (err){
                return next(CustomErrorHandler.serverError(err.message));
            }
            console.log(req.file);
            const filePath = req.file.path;

            // Validation
            const prroductSchema = Joi.object({
                name: Joi.string().required(),
                price: Joi.number().required(),
                size: Joi.multer().required(),
            });
    
            const { error } = productSchema.validate(req.body);
            if(error){
                // Delete the uploaded file
                fs.unlink(`${appRoot}/${filePath}`, (err) => {
                    if (err) {
                        return next(CustomErrorHandler.serverError(err.message))
                    }
                })
                return next(error);

                //rootfolder/uploads/filename.png
            }
            const { name, price, size } = req.body;
            let document;
            try{
                document = await Product.create({
                    name,
                    price,
                    size,
                    image: filePath
                });
            } catch(err){
                return next(err);
            }

            res.status(201).json({document});
        });
    },
    update(req, res, next){
        handleMultipartData(req, res,  async(err) => {
            if (err){
                return next(CustomErrorHandler.serverError(err.message));
            }

            let filePath; 
            if(req.filePath){
                filePath = req.file.path;
            }
            console.log(req.file);
            
            // Validation
            // const prroductSchema = Joi.object({
            //     name: Joi.string().required(),
            //     price: Joi.number().required(),
            //     size: Joi.multer().required(),
            // });
    
            const { error } = productSchema.validate(req.body);
            if(error){
                // Delete the uploaded file
                if (req.file) {
                    fs.unlink(`${appRoot}/${filePath}`, (err) => {
                        if (err) {
                            return next(CustomErrorHandler.serverError(err.message))
                        }
                    })
                 }
                return next(error);

                //rootfolder/uploads/filename.png
            }
            const { name, price, size } = req.body;
            let document;
            try{
                document = await Product.findOneAndUpdate({_id: req.params.id},{
                    name,
                    price,
                    size,
                    ...(req.file && { image: filePath})
                    
                }, {new: true });
            } catch(err){
                return next(err);
            }

            res.status(201).json({document});
        });
    },

    async destroy(req, res, next){
        const document = await Product.findOneAndRemove({_id: req.params.id});
        if(!document){
            return next(new Error('Nothing to delete'));
        }

        // image delete
        const imagePath = document._doc.image;
        fs.unlink(`${appRoot}/${imagePath}`, (err)=>{
            if(err){
                return next(CustomErrorHandler.serverError());
            }
            res.json(document);
        });
    },
    
    async index(req, res, next){
        let documents;
        // pagination mongoose-pagination
        try {
            documents = await Product.find().select('-updatedAt -__v').sort({_id: -1});
        } catch (err) {
            return next(CustomErrorHandler.serverError());
        }
        return res.json(documents);

    },
    async show (req, res, next){
        let document;
        try {
            document = await Product.findOne({ _id: req.params.id }).select('-updatedAt -__v')
        } catch (err) {
            return next(CustomErrorHandler.serverError)
        }
        return res.json(document);
    }
}

export default productController;