import { Router } from 'express';
import { teamController } from '../controllers/team.controller';
import { identifyMerchant } from '../middleware/auth.middleware';
import { isOwner } from '../middleware/team.middleware';

const router = Router();

// All team routes require merchant authentication AND owner role
router.use(identifyMerchant);
router.use(isOwner);

/**
 * @route GET /api/v1/team
 * @desc Get all team members for the merchant
 */
router.get('/', teamController.getTeamMembers);

/**
 * @route POST /api/v1/team
 * @desc Add/invite a new team member
 */
router.post('/', teamController.addTeamMember);

/**
 * @route PATCH /api/v1/team/:id
 * @desc Update a team member
 */
router.patch('/:id', teamController.updateTeamMember);

/**
 * @route DELETE /api/v1/team/:id
 * @desc Remove a team member
 */
router.delete('/:id', teamController.removeTeamMember);

export default router;
