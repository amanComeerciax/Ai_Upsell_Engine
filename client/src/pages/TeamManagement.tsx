import { useState, useEffect, useCallback } from 'react'
import {
    Users, UserPlus, Trash2, Loader2, Mail, Shield, Crown, Clock,
    CheckCircle2, AlertCircle, Search, UserCog
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

import apiClient from '@/lib/api-client'
import { toast } from 'sonner'

interface TeamMember {
    id: number
    email: string | null
    name: string | null
    role: string
    is_active: boolean
    invited_at: string | null
    joined_at: string | null
    clerk_user_id: string | null
    isOwner: boolean
    status?: string
}

export default function TeamManagementPage() {

    const [team, setTeam] = useState<TeamMember[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')

    // Add member form
    const [showAddForm, setShowAddForm] = useState(false)
    const [newEmail, setNewEmail] = useState('')
    const [newName, setNewName] = useState('')
    const [adding, setAdding] = useState(false)
    const [removingId, setRemovingId] = useState<number | null>(null)

    const fetchTeam = useCallback(async () => {
        try {
            setLoading(true)
            const res = await apiClient.get('/team')
            setTeam(res.data.team || [])
        } catch (err: any) {
            console.error('[Team] Fetch failed:', err)
            toast.error('Failed to load team members')
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchTeam()
    }, [fetchTeam])

    const handleAddMember = async () => {
        if (!newEmail.trim()) {
            toast.error('Email is required')
            return
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(newEmail.trim())) {
            toast.error('Please enter a valid email address')
            return
        }

        try {
            setAdding(true)
            await apiClient.post('/team', {
                email: newEmail.trim(),
                name: newName.trim() || null,
            })
            toast.success('Team member added successfully!')
            setNewEmail('')
            setNewName('')
            setShowAddForm(false)
            await fetchTeam()
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to add team member')
        } finally {
            setAdding(false)
        }
    }

    const handleRemoveMember = async (memberId: number, memberEmail: string | null) => {
        if (!confirm(`Remove ${memberEmail || 'this member'} from the team?`)) return

        try {
            setRemovingId(memberId)
            await apiClient.delete(`/team/${memberId}`)
            toast.success('Team member removed')
            await fetchTeam()
        } catch (err: any) {
            toast.error(err.response?.data?.error || 'Failed to remove member')
        } finally {
            setRemovingId(null)
        }
    }

    const filteredTeam = team.filter(m => {
        if (!searchQuery) return true
        const q = searchQuery.toLowerCase()
        return (
            (m.email && m.email.toLowerCase().includes(q)) ||
            (m.name && m.name.toLowerCase().includes(q)) ||
            m.role.toLowerCase().includes(q)
        )
    })

    const ownerCount = team.filter(m => m.isOwner).length
    const activeCount = team.filter(m => !m.isOwner && m.status === 'active').length
    const pendingCount = team.filter(m => !m.isOwner && m.status === 'pending').length

    return (
        <div className="space-y-5 animate-fade-in pb-8">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1.5">
                        <Users className="h-4 w-4 text-[#06B6D4]" />
                        <span className="text-xs font-semibold text-[#06B6D4]">Team Management</span>
                    </div>
                    <p className="text-sm text-slate-400 mt-1 font-medium max-w-lg">
                        Manage your <span className="text-slate-700 font-semibold">team members</span> and control who has access to your dashboard.
                    </p>
                </div>
                <Button
                    onClick={() => setShowAddForm(true)}
                    className="h-10 px-5 rounded-lg bg-[#06B6D4] text-white text-xs font-semibold shadow-lg shadow-cyan-500/20 hover:bg-[#0891B2] hover:-translate-y-0.5 transition-all duration-300"
                >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Add Member
                </Button>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                    { label: 'Total Members', value: team.length, icon: Users, color: 'cyan' },
                    { label: 'Active', value: ownerCount + activeCount, icon: CheckCircle2, color: 'emerald' },
                    { label: 'Pending Invite', value: pendingCount, icon: Clock, color: 'amber' },
                ].map(s => (
                    <div key={s.label} className="glass-card p-5 flex items-center gap-4 group hover:shadow-lg transition-all duration-300">
                        <div className={`h-11 w-11 rounded-lg ${
                            s.color === 'cyan' ? 'bg-cyan-50' :
                            s.color === 'emerald' ? 'bg-emerald-50' :
                            'bg-amber-50'
                        } flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                            <s.icon className={`h-5 w-5 ${
                                s.color === 'cyan' ? 'text-[#06B6D4]' :
                                s.color === 'emerald' ? 'text-emerald-500' :
                                'text-amber-500'
                            }`} />
                        </div>
                        <div>
                            <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider">{s.label}</p>
                            <p className="text-2xl font-bold text-slate-900 mt-0.5">{s.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Add Member Modal/Card */}
            {showAddForm && (
                <div className="glass-card p-6 border-2 border-cyan-100 space-y-5 animate-fade-in relative overflow-hidden">
                    {/* Decorative glow */}
                    <div className="absolute -top-10 -right-10 w-32 h-32 bg-cyan-500/5 rounded-full blur-2xl" />
                    
                    <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-cyan-50 flex items-center justify-center">
                                <UserPlus className="h-5 w-5 text-[#06B6D4]" />
                            </div>
                            <div>
                                <h3 className="text-sm font-bold text-slate-900">Invite Team Member</h3>
                                <p className="text-[10px] text-slate-400 font-medium">
                                    They'll receive access once they sign up with this email
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={() => { setShowAddForm(false); setNewEmail(''); setNewName('') }}
                            className="text-slate-300 hover:text-slate-500 transition-colors text-lg font-bold"
                        >
                            ×
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 relative z-10">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Email Address *</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                                <Input
                                    type="email"
                                    value={newEmail}
                                    onChange={(e) => setNewEmail(e.target.value)}
                                    placeholder="teammate@company.com"
                                    className="h-11 rounded-lg bg-slate-50 border-slate-200 pl-10 text-sm focus-visible:ring-cyan-200"
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Name (Optional)</Label>
                            <Input
                                value={newName}
                                onChange={(e) => setNewName(e.target.value)}
                                placeholder="John Doe"
                                className="h-11 rounded-lg bg-slate-50 border-slate-200 text-sm focus-visible:ring-cyan-200"
                                onKeyDown={(e) => e.key === 'Enter' && handleAddMember()}
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3 relative z-10">
                        <Button
                            onClick={handleAddMember}
                            disabled={adding || !newEmail.trim()}
                            className="h-10 px-6 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold shadow-lg shadow-cyan-500/20"
                        >
                            {adding ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <UserPlus className="h-4 w-4 mr-2" />}
                            Send Invite
                        </Button>
                        <Button
                            variant="outline"
                            onClick={() => { setShowAddForm(false); setNewEmail(''); setNewName('') }}
                            className="h-10 px-6 rounded-lg border-slate-200 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                    </div>

                    {/* Info Box */}
                    <div className="p-4 rounded-lg bg-cyan-50 border border-cyan-100 relative z-10">
                        <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-[#06B6D4] mt-0.5 shrink-0" />
                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                                The team member will need to <span className="text-[#06B6D4] font-semibold">sign up</span> using this exact email address. 
                                Once they sign up, they'll automatically get access to your dashboard.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Search */}
            {team.length > 2 && (
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300" />
                    <Input
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search team members..."
                        className="h-10 rounded-lg bg-white border-slate-200 pl-10 text-sm focus-visible:ring-cyan-200"
                    />
                </div>
            )}

            {/* Team Members List */}
            <div className="glass-card overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center py-16">
                        <Loader2 className="h-6 w-6 text-violet-500 animate-spin" />
                        <span className="ml-3 text-sm text-gray-400 font-medium">Loading team...</span>
                    </div>
                ) : filteredTeam.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 px-4">
                        <div className="h-16 w-16 rounded-lg bg-slate-50 flex items-center justify-center mb-4">
                            <Users className="h-8 w-8 text-slate-200" />
                        </div>
                        <p className="text-sm font-semibold text-slate-500">No team members yet</p>
                        <p className="text-xs text-slate-400 mt-1">Invite your team to collaborate on this dashboard</p>
                        <Button
                            onClick={() => setShowAddForm(true)}
                            className="mt-4 h-9 px-5 rounded-lg bg-[#06B6D4] hover:bg-[#0891B2] text-white text-xs font-semibold shadow-lg shadow-cyan-500/20"
                        >
                            <UserPlus className="h-3.5 w-3.5 mr-2" />
                            Add First Member
                        </Button>
                    </div>
                ) : (
                    <div>
                        {/* Table Header */}
                        <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-slate-50/80 border-b border-slate-100">
                            <div className="col-span-5">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Member</span>
                            </div>
                            <div className="col-span-2">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Role</span>
                            </div>
                            <div className="col-span-3">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Status</span>
                            </div>
                            <div className="col-span-2 text-right">
                                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Actions</span>
                            </div>
                        </div>

                        {/* Members */}
                        {filteredTeam.map((member, idx) => (
                            <div
                                key={member.id + '-' + idx}
                                className="grid grid-cols-12 gap-4 px-6 py-4 items-center border-b border-slate-50 last:border-0 hover:bg-cyan-50/30 transition-colors duration-200 group"
                            >
                                {/* Member Info */}
                                <div className="col-span-5 flex items-center gap-3">
                                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-md ${
                                        member.isOwner
                                            ? 'bg-[#06B6D4] shadow-cyan-500/20'
                                            : member.status === 'active'
                                            ? 'bg-emerald-500 shadow-emerald-500/20'
                                            : 'bg-amber-400 shadow-amber-500/20'
                                    }`}>
                                        {member.name
                                            ? member.name.charAt(0).toUpperCase()
                                            : member.email
                                            ? member.email.charAt(0).toUpperCase()
                                            : '?'}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">
                                            {member.name || 'Unnamed'}
                                            {member.isOwner && (
                                                <span className="ml-2 text-[9px] font-bold text-[#06B6D4] uppercase tracking-wider">You</span>
                                            )}
                                        </p>
                                        <p className="text-xs text-slate-400 font-medium truncate">{member.email}</p>
                                    </div>
                                </div>

                                {/* Role */}
                                <div className="col-span-2">
                                    {member.isOwner ? (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-50 text-[#06B6D4] text-[10px] font-bold uppercase tracking-wider">
                                            <Crown className="h-3 w-3" />
                                            Owner
                                        </span>
                                    ) : (
                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-50 text-slate-600 text-[10px] font-bold uppercase tracking-wider">
                                            <Shield className="h-3 w-3" />
                                            Member
                                        </span>
                                    )}
                                </div>

                                {/* Status */}
                                <div className="col-span-3">
                                    {member.isOwner ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-semibold text-emerald-600">Active</span>
                                        </div>
                                    ) : member.status === 'active' ? (
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                                            <span className="text-xs font-semibold text-emerald-600">Active</span>
                                            {member.joined_at && (
                                                <span className="text-[9px] text-slate-300 font-medium">
                                                    since {new Date(member.joined_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2">
                                            <div className="h-2 w-2 rounded-full bg-amber-400" />
                                            <span className="text-xs font-semibold text-amber-600">Pending</span>
                                            {member.invited_at && (
                                                <span className="text-[9px] text-slate-300 font-medium">
                                                    invited {new Date(member.invited_at).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Actions */}
                                <div className="col-span-2 flex justify-end">
                                    {!member.isOwner && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleRemoveMember(member.id, member.email)}
                                            disabled={removingId === member.id}
                                            className="h-8 w-8 p-0 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition-all duration-200"
                                            title="Remove member"
                                        >
                                            {removingId === member.id ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Trash2 className="h-4 w-4" />
                                            )}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Footer */}
            <div className="p-5 rounded-lg bg-slate-50 border border-slate-200">
                <div className="flex items-start gap-3">
                    <div className="h-9 w-9 rounded-lg bg-cyan-50 flex items-center justify-center shrink-0">
                        <UserCog className="h-4.5 w-4.5 text-[#06B6D4]" />
                    </div>
                    <div>
                        <h4 className="text-xs font-bold text-slate-700">How Team Access Works</h4>
                        <ul className="mt-2 space-y-1.5 text-[11px] text-slate-500 font-medium leading-relaxed">
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold mt-0.5">1.</span>
                                Add a team member by entering their email address
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold mt-0.5">2.</span>
                                They sign up using the <span className="text-[#06B6D4] font-semibold">same email</span> on the login page
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold mt-0.5">3.</span>
                                They're automatically linked and can access your dashboard
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 font-bold mt-0.5">4.</span>
                                Only you (the owner) can manage settings, billing, and team
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
