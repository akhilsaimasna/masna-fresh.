'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useToast } from '@/components/shared/Toast';
import { Save, Plus, X, Loader2 } from 'lucide-react';
import type { Profile } from '@/types/app.types';

const WORK_AUTH_OPTIONS = ['US Citizen', 'OPT', 'CPT', 'H1B', 'Other'];
const EXPERIENCE_OPTIONS = ['Internship', 'Entry', 'Mid', 'Senior'];

export default function ProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [fullName, setFullName] = useState('');
    const [targetRoles, setTargetRoles] = useState<string[]>([]);
    const [newRole, setNewRole] = useState('');
    const [locations, setLocations] = useState<string[]>([]);
    const [newLocation, setNewLocation] = useState('');
    const [workAuth, setWorkAuth] = useState('');
    const [experienceLevel, setExperienceLevel] = useState('');
    const [openToRelocation, setOpenToRelocation] = useState(false);
    const { showToast } = useToast();
    const supabase = createClient();

    useEffect(() => {
        const fetchProfile = async () => {
            const {
                data: { user },
            } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            if (data) {
                setProfile(data);
                setFullName(data.full_name || '');
                setTargetRoles(data.target_roles || []);
                setLocations(data.locations || []);
                setWorkAuth(data.work_auth || '');
                setExperienceLevel(data.experience_level || '');
                setOpenToRelocation(data.open_to_relocation || false);
            }
            setLoading(false);
        };
        fetchProfile();
    }, [supabase]);

    const handleSave = async () => {
        if (!profile) return;
        setSaving(true);

        const { error } = await supabase
            .from('profiles')
            .update({
                full_name: fullName,
                target_roles: targetRoles,
                locations,
                work_auth: workAuth || null,
                experience_level: experienceLevel || null,
                open_to_relocation: openToRelocation,
                updated_at: new Date().toISOString(),
            })
            .eq('id', profile.id);

        setSaving(false);
        if (error) {
            showToast('Failed to save profile', 'error');
        } else {
            showToast('Profile saved successfully');
        }
    };

    const addRole = () => {
        if (newRole.trim() && !targetRoles.includes(newRole.trim())) {
            setTargetRoles([...targetRoles, newRole.trim()]);
            setNewRole('');
        }
    };

    const removeRole = (role: string) => {
        setTargetRoles(targetRoles.filter((r) => r !== role));
    };

    const addLocation = () => {
        if (newLocation.trim() && !locations.includes(newLocation.trim())) {
            setLocations([...locations, newLocation.trim()]);
            setNewLocation('');
        }
    };

    const removeLocation = (loc: string) => {
        setLocations(locations.filter((l) => l !== loc));
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[60vh]">
                <div className="loading-spinner" style={{ width: 40, height: 40 }} />
            </div>
        );
    }

    return (
        <div className="max-w-2xl">
            <div className="mb-8">
                <h1 className="text-2xl font-bold">Profile</h1>
                <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                    Tell us about your job search preferences
                </p>
            </div>

            <div className="space-y-6">
                {/* Full Name */}
                <div className="glass-card p-6">
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Full Name
                    </label>
                    <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="input-field"
                        placeholder="Jane Smith"
                    />
                </div>

                {/* Target Roles */}
                <div className="glass-card p-6">
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Target Roles
                    </label>
                    <p className="text-xs mb-3" style={{ color: 'rgba(255,255,255,0.3)' }}>
                        What positions are you looking for?
                    </p>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newRole}
                            onChange={(e) => setNewRole(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                            className="input-field flex-1"
                            placeholder="e.g. Software Engineer"
                        />
                        <button onClick={addRole} className="btn-ghost px-3">
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {targetRoles.map((role) => (
                            <span key={role} className="chip chip-brand">
                                {role}
                                <button onClick={() => removeRole(role)} className="ml-1 opacity-60 hover:opacity-100">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>

                {/* Locations */}
                <div className="glass-card p-6">
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Preferred Locations
                    </label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            value={newLocation}
                            onChange={(e) => setNewLocation(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addLocation())}
                            className="input-field flex-1"
                            placeholder="e.g. New York, NY or Remote"
                        />
                        <button onClick={addLocation} className="btn-ghost px-3">
                            <Plus size={16} />
                        </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {locations.map((loc) => (
                            <span key={loc} className="chip chip-accent">
                                {loc}
                                <button onClick={() => removeLocation(loc)} className="ml-1 opacity-60 hover:opacity-100">
                                    <X size={12} />
                                </button>
                            </span>
                        ))}
                    </div>
                    <label className="flex items-center gap-2 mt-4 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={openToRelocation}
                            onChange={(e) => setOpenToRelocation(e.target.checked)}
                            className="w-4 h-4 rounded"
                        />
                        <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
                            Open to relocation
                        </span>
                    </label>
                </div>

                {/* Work Authorization */}
                <div className="glass-card p-6">
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Work Authorization
                    </label>
                    <div className="grid grid-cols-5 gap-2">
                        {WORK_AUTH_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setWorkAuth(opt)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all ${workAuth === opt ? 'text-white' : ''
                                    }`}
                                style={{
                                    background: workAuth === opt ? 'rgba(51, 128, 255, 0.2)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${workAuth === opt ? 'rgba(51, 128, 255, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                                    color: workAuth === opt ? 'var(--color-brand-300)' : 'rgba(255,255,255,0.5)',
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Experience Level */}
                <div className="glass-card p-6">
                    <label className="block text-xs font-medium mb-2" style={{ color: 'rgba(255,255,255,0.5)' }}>
                        Experience Level
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                        {EXPERIENCE_OPTIONS.map((opt) => (
                            <button
                                key={opt}
                                onClick={() => setExperienceLevel(opt)}
                                className={`px-3 py-2 rounded-lg text-xs font-medium transition-all`}
                                style={{
                                    background: experienceLevel === opt ? 'rgba(16, 185, 129, 0.2)' : 'rgba(255,255,255,0.03)',
                                    border: `1px solid ${experienceLevel === opt ? 'rgba(16, 185, 129, 0.3)' : 'rgba(255,255,255,0.06)'}`,
                                    color: experienceLevel === opt ? 'var(--color-accent-400)' : 'rgba(255,255,255,0.5)',
                                }}
                            >
                                {opt}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Save */}
                <button onClick={handleSave} disabled={saving} className="btn-primary">
                    {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                    {saving ? 'Saving...' : 'Save Profile'}
                </button>
            </div>
        </div>
    );
}
