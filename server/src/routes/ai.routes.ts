import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';

const router = Router();

router.get('/models', aiController.getModels);
router.get('/recommend', aiController.getRecommendation);

export default router;
