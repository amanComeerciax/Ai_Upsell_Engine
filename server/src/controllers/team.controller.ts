import { Request, Response } from 'express';
import prisma from '../lib/prisma';

export const teamController = {
    /**
     * Get all team members for the authenticated merchant
     */
    async getTeamMembers(req: Request, res: Response) {
        try {
            const merchant = req.merchant!;

            const members = await prisma.team_members.findMany({
                where: { merchant_id: merchant.id },
                orderBy: { created_at: 'asc' },
                select: {
                    id: true,
                    email: true,
                    name: true,
                    role: true,
                    is_active: true,
                    invited_at: true,
                    joined_at: true,
                    clerk_user_id: true,
                }
            });

            // Add the owner as the first entry
            const teamList = [
                {
                    id: 0,
                    email: merchant.email,
                    name: merchant.business_name,
                    role: 'owner',
                    is_active: true,
                    invited_at: null,
                    joined_at: null,
                    clerk_user_id: merchant.clerk_user_id,
                    isOwner: true,
                },
                ...members.map(m => ({
                    ...m,
                    isOwner: false,
                    status: m.joined_at ? 'active' : 'pending',
                }))
            ];

            res.status(200).json({ team: teamList, count: teamList.length });
        } catch (error) {
            console.error('[Team Controller] Get Members Error:', error);
            res.status(500).json({ error: 'Failed to fetch team members' });
        }
    },

    /**
     * Add a new team member (invite by email)
     */
    async addTeamMember(req: Request, res: Response) {
        try {
            const merchant = req.merchant!;
            const { email, name } = req.body;

            if (!email) {
                return res.status(400).json({ error: 'Email is required' });
            }

            // Check if this email is already a team member for this merchant
            const existing = await prisma.team_members.findFirst({
                where: {
                    merchant_id: merchant.id,
                    email: email.toLowerCase().trim(),
                }
            });

            if (existing) {
                return res.status(409).json({ error: 'This email is already a team member' });
            }

            // Check if this email is the merchant owner
            if (merchant.email && merchant.email.toLowerCase() === email.toLowerCase().trim()) {
                return res.status(409).json({ error: 'This email is the store owner' });
            }

            // Check if this email is already registered as a merchant
            const existingMerchant = await prisma.merchants.findFirst({
                where: { email: email.toLowerCase().trim() }
            });

            // If they have their own merchant account, we still allow them as a team member
            // They'll be linked when they login

            // Check if there's already a Clerk user with this email by looking for team_members
            // with a clerk_user_id in any other merchant
            const existingTeamMember = await prisma.team_members.findFirst({
                where: {
                    email: email.toLowerCase().trim(),
                    clerk_user_id: { not: null },
                }
            });

            const member = await prisma.team_members.create({
                data: {
                    merchant_id: merchant.id,
                    email: email.toLowerCase().trim(),
                    name: name || null,
                    role: 'member',
                    // If this user already has a Clerk account from another team, we can pre-link
                    clerk_user_id: existingTeamMember?.clerk_user_id || null,
                    joined_at: existingTeamMember?.clerk_user_id ? new Date() : null,
                }
            });

            console.log(`[Team] Member invited: ${email} to merchant ${merchant.id}`);

            res.status(201).json({
                message: 'Team member added successfully',
                member: {
                    id: member.id,
                    email: member.email,
                    name: member.name,
                    role: member.role,
                    is_active: member.is_active,
                    invited_at: member.invited_at,
                    joined_at: member.joined_at,
                    status: member.joined_at ? 'active' : 'pending',
                    isOwner: false,
                }
            });
        } catch (error) {
            console.error('[Team Controller] Add Member Error:', error);
            res.status(500).json({ error: 'Failed to add team member' });
        }
    },

    /**
     * Update a team member (name, role, active status)
     */
    async updateTeamMember(req: Request, res: Response) {
        try {
            const merchant = req.merchant!;
            const memberId = parseInt(req.params.id as string);
            const { name, role, is_active } = req.body;

            // Verify the member belongs to this merchant
            const member = await prisma.team_members.findFirst({
                where: { id: memberId, merchant_id: merchant.id }
            });

            if (!member) {
                return res.status(404).json({ error: 'Team member not found' });
            }

            const updated = await prisma.team_members.update({
                where: { id: memberId },
                data: {
                    ...(name !== undefined && { name }),
                    ...(role !== undefined && { role }),
                    ...(is_active !== undefined && { is_active }),
                }
            });

            console.log(`[Team] Member updated: ${updated.email} (ID: ${memberId})`);

            res.status(200).json({
                message: 'Team member updated',
                member: {
                    id: updated.id,
                    email: updated.email,
                    name: updated.name,
                    role: updated.role,
                    is_active: updated.is_active,
                    status: updated.joined_at ? 'active' : 'pending',
                    isOwner: false,
                }
            });
        } catch (error) {
            console.error('[Team Controller] Update Error:', error);
            res.status(500).json({ error: 'Failed to update team member' });
        }
    },

    /**
     * Remove a team member
     */
    async removeTeamMember(req: Request, res: Response) {
        try {
            const merchant = req.merchant!;
            const memberId = parseInt(req.params.id as string);

            // Verify the member belongs to this merchant
            const member = await prisma.team_members.findFirst({
                where: { id: memberId, merchant_id: merchant.id }
            });

            if (!member) {
                return res.status(404).json({ error: 'Team member not found' });
            }

            await prisma.team_members.delete({
                where: { id: memberId }
            });

            console.log(`[Team] Member removed: ${member.email} from merchant ${merchant.id}`);

            res.status(200).json({ message: 'Team member removed successfully' });
        } catch (error) {
            console.error('[Team Controller] Remove Error:', error);
            res.status(500).json({ error: 'Failed to remove team member' });
        }
    },
};
