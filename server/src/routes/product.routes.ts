import { Router } from 'express';
import { productController } from '../controllers/product.controller';

const router = Router();

router.get('/', productController.getAllProducts);
router.get('/stats', productController.getProductStats);

export default router;
