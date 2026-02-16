import { Router } from 'express';
import { aiController } from '../controllers/ai.controller';

const router = Router();

router.get('/models', aiController.getModels);
router.post('/recommend', aiController.getRecommendation);

export default router;
