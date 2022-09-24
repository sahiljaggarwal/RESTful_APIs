import Joi from 'joi';
import { REFRESH_SECRET } from '../../config';
import { RefreshToken } from '../../models';
import CustomErrorHandler from '../../services/CustomErrorHandler';
import JwtService from '../../services/JwtService';

const refreshController = {
    async refresh(req, res, next){
        
        // validate
        const refreshSchema = Joi.object({
            refresh_token: Joi.string().required(),
        });

        const { error } = refreshSchema.validate(req.body);

        if (error) {
            return next(error);
        }

        // database 
        let refreshtoken;
        try{
            refreshtoken = await RefreshToken.findOne({token: req.body.refresh_token});
            if (!refreshtoken){
                return next(CustomErrorHandler.unAuthorized('Invalid'));
            }

            let userId;
            try {
                const { _id } = await JwtService.verify(refreshtoken.token, REFRESH_SECRET);
                userId = _id;
            } catch (err) {
                return next(CustomErrorHandler.unAuthorized('Invalid refresh token'))
            }

            const user = User.findOne({_id: userId});
            if(!user){
                return next(CustomErrorHandler.unAuthorized('No User Found! '))
            }

            // Token
            const access_token = JwtService.sign({_id: user._id, role: user.role});
            const refresh_token = JwtService.sign({_id: user._id, role: user.role,}, '1y', REFRESH_SECRET);

            // database whitelist
            await RefreshToken.create({token: refresh_token});
            res.json({ access_token, refresh_token })

        }catch(err){
            return next(new Error('Something Went Wrong' + err.message))
        }
    }
};

export default refreshController;