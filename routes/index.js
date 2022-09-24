import express from 'express';
const router = express.Router();
import { registerController } from '../controllers/';
import { refreshController } from '../controllers/';
import { loginController } from '../controllers';
import { userController } from '../controllers';
import { productController  } from '../controllers'
import auth from '../middlewares/auth'
import admin from '../middlewares/admin';


router.post('/register', registerController.register);
router.post('/login', loginController.login);
router.get('/me',auth, userController.me);
router.post('/refresh', refreshController.refresh);
router.post('/logout', auth, loginController.logout);
router.post('/logout', auth, loginController.logout);
router.post('/products',[auth, admin], productController.store); 
router.put('/products/:id',[auth, admin], productController.update); 
router.delete('/products/:id',[auth, admin], productController.destroy); 
router.get('/products/:id', productController.index); 
router.get('/products/:id', productController.show); 

export default router;

