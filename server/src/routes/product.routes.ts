import { Router } from 'express';
import { productController } from '../controllers/product.controller';
import { optionalMerchant } from '../middleware/auth.middleware';

const router = Router();

router.get('/', optionalMerchant, productController.getAllProducts);
router.get('/stats', optionalMerchant, productController.getProductStats);
router.patch('/:id', optionalMerchant, productController.updateProduct);
router.delete('/:id', optionalMerchant, productController.deleteProduct);

export default router;
