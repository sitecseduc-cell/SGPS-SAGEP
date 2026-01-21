import React, { useState, useEffect } from 'react';
import {
    Shield, Lock, Users, CheckCircle, AlertTriangle, Plus, Trash2, Edit,
    Save, Search, UserCog, MoreVertical, X, Settings, Database, Activity,
    ChevronLeft, ChevronRight, Filter, TrendingUp, Clock, UserPlus, Eye,
    Award, BarChart3, PieChart, LineChart, Zap, Star, User
} from 'lucide-react';
import { toast } from 'sonner';
import { profileService } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';
import { Bar, Pie } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

// --- COMPONENTS ---

const StatCard = ({ title, value, icon: Icon, color, subtext, trend }) => (
    <div className="glass-panel p-6 rounded-2xl border border-white/30 dark:border-white/10 relative overflow-hidden group hover:scale-[1.02] transition-transform duration-300">
        <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity ${color}`}>
            <Icon size={64} />
        </div>
        <div className="relative z-10">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg ${color} bg-opacity-20 text-current`}>
                <Icon size={24} />
            </div>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mb-1 flex items-center gap-2">
                {value}
                {trend && (
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <TrendingUp size={14} /> {trend}
                    </span>
                )}
            </h3>
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
            {subtext && <p className="text-xs text-slate-400 mt-2">{subtext}</p>}
        </div>
    </div>
);

const UserAvatar = ({ name, size = 'sm' }) => {
    const initials = name ? name.substring(0, 2).toUpperCase() : '??';
    const dims = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-9 h-9 text-xs';
    const colors = [
        'from-indigo-500 to-violet-600',
        'from-emerald-500 to-teal-600',
        'from-amber-500 to-orange-600',
        'from-pink-500 to-rose-600',
        'from-blue-500 to-cyan-600',
    ];
    const colorIndex = name ? name.charCodeAt(0) % colors.length : 0;
    return (
        <div className={`${dims} rounded-full bg-gradient-to-br ${colors[colorIndex]} flex items-center justify-center text-white font-bold shadow-lg shadow-indigo-500/20`}>
            {initials}
        </div>
    );
};

// Activity timeline entry component
const ActivityEntry = ({ icon: Icon, title, description, time }) => (
    <div className="flex items-start gap-3 py-2 border-b border-slate-200/30 dark:border-white/10">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-800 rounded-lg">
            <Icon size={20} className="text-indigo-600 dark:text-indigo-300" />
        </div>
        <div className="flex-1">
            <p className="font-medium text-slate-800 dark:text-white">{title}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <span className="text-xs text-slate-400 dark:text-slate-500 whitespace-nowrap">{time}</span>
    </div>
);

export default function AdminPerfis() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState('usuarios');
    const [loading, setLoading] = useState(true);

    // Data states
    const [profiles, setProfiles] = useState([]);
    const [rules, setRules] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [users, setUsers] = useState([]);
    const [totalUsers, setTotalUsers] = useState(0);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const LIMIT = 10;

    // New states for redesign
    const [roleCounts, setRoleCounts] = useState([]); // [{id, name, count}]
    const [activityLogs, setActivityLogs] = useState([]); // [{icon, title, description, time}]

    // UI modals
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isUserModalOpen, setIsUserModalOpen] = useState(false);
    const [editingProfile, setEditingProfile] = useState(null);

    // Initial data load
    useEffect(() => {
        loadInitialData();
    }, []);

    // Reload users when pagination/search changes
    useEffect(() => {
        if (!loading) loadUsers();
    }, [page, search]);

    const loadInitialData = async () => {
        setLoading(true);
        try {
            const [rolesData, rulesData, permData] = await Promise.all([
                profileService.getRoles(),
                profileService.getRules(),
                profileService.getPermissions(),
            ]);
            setProfiles(rolesData || []);
            setRules(rulesData || []);
            setPermissions(permData || {});
            await Promise.all([loadUsers(), loadRoleCounts(), loadActivity()]);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar dados do sistema.');
        } finally {
            setLoading(false);
        }
    };

    const loadUsers = async () => {
        try {
            const { users, total } = await profileService.getUsers(page, LIMIT, search);
            setUsers(users);
            setTotalUsers(total);
        } catch (error) {
            console.error(error);
        }
    };

    const loadRoleCounts = async () => {
        try {
            const counts = await profileService.getRoleUserCounts(); // [{id, name, count}]
            setRoleCounts(counts);
        } catch (error) {
            console.error('Failed to load role counts', error);
        }
    };

    const loadActivity = async () => {
        try {
            const logs = await profileService.getUserActivity(1, 10);
            const formatted = logs.map(l => ({
                icon: l.type === 'role' ? Shield : UserPlus,
                title: l.title,
                description: l.description,
                time: new Date(l.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }));
            setActivityLogs(formatted);
        } catch (error) {
            console.error('Failed to load activity', error);
        }
    };

    // --- ACTIONS ---
    const handleCreateUser = async (userData) => {
        try {
            await profileService.createUser(userData);
            toast.success(`Usuário ${userData.name} criado!`);
            setIsUserModalOpen(false);
            loadUsers();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar usuário.');
        }
    };

    const handleSaveProfile = async (profileData) => {
        try {
            if (editingProfile) {
                const updated = await profileService.updateRole(profileData.id, profileData);
                setProfiles(profiles.map(p => (p.id === updated.id ? updated : p)));
                toast.success('Perfil atualizado!');
            } else {
                const created = await profileService.createRole(profileData);
                setProfiles([...profiles, created]);
                toast.success('Perfil criado!');
            }
            setIsProfileModalOpen(false);
            setEditingProfile(null);
            loadRoleCounts();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar perfil.');
        }
    };

    const handleDeleteProfile = async (id) => {
        if (!window.confirm('Isso pode afetar todos os usuários com este perfil. Continuar?')) return;
        try {
            await profileService.deleteRole(id);
            setProfiles(profiles.filter(p => p.id !== id));
            toast.success('Perfil removido.');
            loadRoleCounts();
        } catch (error) {
            console.error(error);
            toast.error('Erro ao remover perfil.');
        }
    };

    const togglePermission = async (profileId, ruleId) => {
        const currentRules = permissions[profileId] || [];
        const hasRule = currentRules.includes(ruleId);
        const shouldAdd = !hasRule;
        setPermissions(prev => {
            const newRules = shouldAdd
                ? [...(prev[profileId] || []), ruleId]
                : (prev[profileId] || []).filter(r => r !== ruleId);
            return { ...prev, [profileId]: newRules };
        });
        try {
            await profileService.togglePermission(profileId, ruleId, shouldAdd);
        } catch (error) {
            toast.error('Falha ao atualizar permissão.');
            loadInitialData();
        }
    };

    const handleUserRoleChange = async (userId, newRole) => {
        setUsers(users.map(u => (u.id === userId ? { ...u, role: newRole } : u)));
        try {
            await profileService.updateUserRole(userId, newRole);
            toast.success('Função atualizada com sucesso.');
        } catch (error) {
            toast.error('Erro ao atualizar função.');
            loadUsers();
        }
    };

    // --- RENDER ---
    if (loading && profiles.length === 0) {
        return (
            <div className="flex items-center justify-center h-[60vh] animate-pulse">
                <div className="flex flex-col items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-800" />
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-800 rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-24">
            {/* Header Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard
                    title="Total de Usuários"
                    value={totalUsers}
                    icon={Users}
                    color="text-indigo-600 dark:text-indigo-400 bg-indigo-500"
                    subtext="Cadastrados na plataforma"
                    trend="+2%"
                />
                <StatCard
                    title="Perfis Ativos"
                    value={profiles.length}
                    icon={Shield}
                    color="text-emerald-600 dark:text-emerald-400 bg-emerald-500"
                    subtext="Níveis de acesso configurados"
                />
                <StatCard
                    title="Regras de Sistema"
                    value={rules.length}
                    icon={Database}
                    color="text-amber-600 dark:text-amber-400 bg-amber-500"
                    subtext="Capabilities granulares"
                />
            </div>

            {/* Role Distribution Chart */}
            {/* Chart Removed by User Request */}

            {/* Navigation Tabs */}
            <div className="glass-panel p-1.5 rounded-xl inline-flex gap-2 relative z-10">
                {[{ id: 'usuarios', label: 'Usuários', icon: UserCog }, { id: 'perfis', label: 'Perfis e Funções', icon: Shield }, { id: 'matriz', label: 'Matriz de Permissões', icon: Lock }].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-bold transition-all duration-300 ${activeTab === tab.id ? 'bg-white dark:bg-white/10 text-indigo-600 dark:text-white shadow-md' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'}`}
                    >
                        <tab.icon size={18} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            {activeTab === 'usuarios' && (
                <div className="space-y-6 animate-fadeIn">
                    {/* Toolbar */}
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white/40 dark:bg-black/20 p-4 rounded-2xl border border-white/50 dark:border-white/5 backdrop-blur-sm">
                        <div className="relative w-full md:w-96">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                className="input-glass w-full pl-12"
                                placeholder="Buscar por nome ou email..."
                                value={search}
                                onChange={e => { setSearch(e.target.value); setPage(1); }}
                            />
                        </div>
                        <button
                            onClick={() => setIsUserModalOpen(true)}
                            className="btn-primary-glass px-6 py-2.5 flex items-center gap-2 w-full md:w-auto justify-center"
                        >
                            <Plus size={18} /> Novo Usuário
                        </button>
                    </div>

                    {/* Users Table */}
                    <div className="glass-panel rounded-2xl overflow-hidden shadow-lg">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-slate-50/50 dark:bg-white/5 border-b border-slate-200/50 dark:border-white/5">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Usuário</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Perfil</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-left">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Último Acesso</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                                    {users.map(u => (
                                        <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-4">
                                                    <UserAvatar name={u.name} />
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-white">{u.name}</div>
                                                        <div className="text-xs text-slate-500 dark:text-slate-400">{u.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={u.role}
                                                    onChange={e => handleUserRoleChange(u.id, e.target.value)}
                                                    className="bg-transparent text-sm font-semibold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 focus:ring-2 focus:ring-indigo-500 outline-none cursor-pointer hover:bg-white dark:hover:bg-slate-800 transition-colors"
                                                >
                                                    {profiles.map(p => (
                                                        <option key={p.id} value={p.id} className="dark:bg-slate-900">{p.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400">ATIVO</span>
                                            </td>
                                            <td className="px-6 py-4 text-right text-sm text-slate-500 dark:text-slate-400">{u.lastAccess}</td>
                                        </tr>
                                    ))}
                                    {users.length === 0 && (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">Nenhum usuário encontrado.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        {/* Pagination */}
                        <div className="px-6 py-4 border-t border-slate-200/50 dark:border-white/5 flex items-center justify-between">
                            <div className="text-sm text-slate-500 dark:text-slate-400">
                                Mostrando <span className="font-bold">{(page - 1) * LIMIT + 1}</span> a <span className="font-bold">{Math.min(page * LIMIT, totalUsers)}</span> de <span className="font-bold">{totalUsers}</span>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setPage(p => Math.max(1, p - 1))}
                                    disabled={page === 1}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronLeft size={20} />
                                </button>
                                <button
                                    onClick={() => setPage(p => p + 1)}
                                    disabled={page * LIMIT >= totalUsers}
                                    className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 disabled:opacity-50 transition-colors"
                                >
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {activeTab === 'perfis' && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                    {profiles.map(profile => (
                        <div key={profile.id} className="glass-panel p-8 rounded-3xl relative group overflow-hidden border border-white/40 dark:border-white/10 hover:border-indigo-500/50 transition-all duration-300">
                            {/* Decorative Background Blob */}
                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-10 -mt-10 rounded-full blur-3xl opacity-20 ${profile.color?.split(' ')[0].replace('bg-', 'bg-') || 'bg-slate-500'}`} />
                            <div className="relative z-10">
                                <div className="flex justify-between items-start mb-6">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border shadow-sm ${profile.color || 'bg-slate-100 text-slate-600 border-slate-200'}`}>{profile.name}</span>
                                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingProfile(profile); setIsProfileModalOpen(true); }} className="p-2 hover:bg-indigo-50 dark:hover:bg-indigo-500/20 rounded-lg text-indigo-600 dark:text-indigo-400 transition-colors"><Edit size={16} /></button>
                                        <button onClick={() => handleDeleteProfile(profile.id)} className="p-2 hover:bg-red-50 dark:hover:bg-red-500/20 rounded-lg text-red-600 dark:text-red-400 transition-colors"><Trash2 size={16} /></button>
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-800 dark:text-white mb-2">{profile.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 min-h-[40px]">{profile.description || 'Sem descrição definida.'}</p>
                                <div className="pt-6 border-t border-slate-200/50 dark:border-white/10 grid grid-cols-2 gap-4">
                                    <div>
                                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{permissions[profile.id]?.length || 0}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Permissões</div>
                                    </div>
                                    <div>
                                        <div className="text-2xl font-bold text-slate-800 dark:text-white">{roleCounts.find(rc => rc.id === profile.id)?.count || 0}</div>
                                        <div className="text-xs text-slate-500 dark:text-slate-400 uppercase font-bold tracking-wider">Usuários</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button onClick={() => { setEditingProfile(null); setIsProfileModalOpen(true); }} className="glass-panel p-8 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700/50 hover:border-indigo-500 dark:hover:border-indigo-500 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-all flex flex-col items-center justify-center gap-4 group min-h-[300px]">
                        <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-all duration-300"><Plus size={32} /></div>
                        <span className="font-bold text-slate-600 dark:text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">Criar Novo Perfil</span>
                    </button>
                </div>
            )}

            {activeTab === 'matriz' && (
                <div className="glass-panel rounded-2xl overflow-hidden shadow-xl animate-fadeIn">
                    <div className="overflow-x-auto custom-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr>
                                    <th className="p-6 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider sticky left-0 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md z-20 border-b border-r border-slate-200 dark:border-slate-800 min-w-[300px]">Regra de Acesso / Capability</th>
                                    {profiles.map(profile => (
                                        <th key={profile.id} className="p-4 text-center border-b border-slate-200 dark:border-slate-800 min-w-[140px] bg-slate-50/50 dark:bg-white/5">
                                            <div className="flex flex-col items-center gap-2">
                                                <span className={`w-3 h-3 rounded-full ${profile.color?.split(' ')[0] || 'bg-slate-500'}`} />
                                                <span className="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase">{profile.name}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {rules.map((rule, idx) => (
                                    <tr key={rule.id} className={idx % 2 === 0 ? 'bg-white/50 dark:bg-transparent' : 'bg-slate-50/30 dark:bg-white/5'}>
                                        <td className="p-6 sticky left-0 bg-inherit border-r border-slate-100 dark:border-slate-800 z-10 backdrop-blur-sm">
                                            <div className="font-bold text-slate-800 dark:text-white text-sm">{rule.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{rule.description}</div>
                                        </td>
                                        {profiles.map(profile => {
                                            const isGranted = permissions[profile.id]?.includes(rule.id);
                                            return (
                                                <td key={`${profile.id}-${rule.id}`} className="p-4 text-center align-middle">
                                                    <button
                                                        onClick={() => togglePermission(profile.id, rule.id)}
                                                        className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all duration-300 mx-auto ${isGranted ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 text-white shadow-lg shadow-emerald-500/30 transform scale-100' : 'bg-slate-100 dark:bg-white/5 text-slate-300 dark:text-slate-600 hover:bg-slate-200 dark:hover:bg-white/10 inner-shadow transform scale-90 hover:scale-100'}`}
                                                    >
                                                        {isGranted ? <CheckCircle size={22} strokeWidth={2.5} /> : <div className="w-2 h-2 rounded-full bg-current" />}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Activity Timeline */}
            {activityLogs.length > 0 && (
                <div className="glass-panel p-6 rounded-2xl border border-white/30 dark:border-white/10 mt-8">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-4 flex items-center gap-2"><Activity size={20} className="text-indigo-600" /> Atividades Recentes</h3>
                    <div className="space-y-2">
                        {activityLogs.map((log, i) => (
                            <ActivityEntry key={i} icon={log.icon} title={log.title} description={log.description} time={log.time} />
                        ))}
                    </div>
                </div>
            )}

            {/* Modals */}
            <ModalProfile
                isOpen={isProfileModalOpen}
                onClose={() => { setIsProfileModalOpen(false); setEditingProfile(null); }}
                onSave={handleSaveProfile}
                editingProfile={editingProfile}
            />
            <ModalUser
                isOpen={isUserModalOpen}
                onClose={() => setIsUserModalOpen(false)}
                onSave={handleCreateUser}
                roles={profiles}
            />
        </div>
    );
}

// --- MODALS (unchanged) ---

const ModalProfile = ({ isOpen, onClose, onSave, editingProfile }) => {
    const [formData, setFormData] = useState({ id: '', name: '', description: '', color: 'bg-slate-100 text-slate-700 border-slate-200' });

    useEffect(() => {
        if (editingProfile) {
            setFormData(editingProfile);
        } else {
            setFormData({ id: '', name: '', description: '', color: 'bg-slate-100 text-slate-700 border-slate-200' });
        }
    }, [editingProfile, isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    const colors = [
        'bg-slate-100 text-slate-700 border-slate-200',
        'bg-red-100 text-red-700 border-red-200',
        'bg-blue-100 text-blue-700 border-blue-200',
        'bg-green-100 text-green-700 border-green-200',
        'bg-amber-100 text-amber-700 border-amber-200',
        'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200',
    ];

    return (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
            <div className="glass-card w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
                <div className="px-6 py-5 border-b border-slate-200/50 dark:border-white/10 flex justify-between items-center bg-white/40 dark:bg-black/20">
                    <h3 className="font-bold text-xl text-slate-800 dark:text-white flex items-center gap-2"><Shield className="text-indigo-500" size={24} />{editingProfile ? 'Editar Perfil' : 'Novo Perfil'}</h3>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors"><X size={20} className="text-slate-500 dark:text-slate-400" /></button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Identidade Visual</label>
                        <div className="flex gap-3 flex-wrap">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: c })}
                                    className={`w-10 h-10 rounded-full border-2 transition-transform hover:scale-110 ${c} ${formData.color === c ? 'ring-2 ring-offset-2 ring-indigo-500 scale-110' : ''}`}>
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Nome do Perfil</label>
                        <input
                            required
                            type="text"
                            className="input-glass w-full"
                            placeholder="Ex: Visitante"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">ID (Unique)</label>
                        <input
                            type="text"
                            disabled={!!editingProfile}
                            className={`input-glass w-full font-mono text-sm ${editingProfile ? 'opacity-50 cursor-not-allowed' : ''}`}
                            placeholder="Gerado automaticamente se vazio"
                            value={formData.id}
                            onChange={e => setFormData({ ...formData, id: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 block">Descrição</label>
                        <textarea
                            className="input-glass w-full min-h-[100px]"
                            placeholder="Descreva as responsabilidades deste perfil..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary-glass px-6 py-2.5">Cancelar</button>
                        <button type="submit" className="btn-primary-glass px-6 py-2.5 flex items-center gap-2"><Save size={18} /> Salvar Perfil</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const ModalUser = ({ isOpen, onClose, onSave, roles }) => {
    const [formData, setFormData] = useState({ name: '', email: '', password: '', role: 'servidor' });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-[9999] flex items-center justify-center p-4 backdrop-blur-md animate-fadeIn">
            <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 transform transition-all scale-100">
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 flex justify-between items-center text-white">
                    <div>
                        <h3 className="font-bold text-xl flex items-center gap-2">
                            <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                                <UserPlus size={20} className="text-white" />
                            </div>
                            Novo Usuário
                        </h3>
                        <p className="text-blue-100 text-xs mt-1 ml-11 opacity-90">Cadastre um novo membro na equipe</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-full transition-colors text-white/80 hover:text-white">
                        <X size={20} />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Nome Completo</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                <input
                                    required
                                    type="text"
                                    placeholder="Ex: Ana Silva"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-0 transition-all dark:text-white"
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="group">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Email Corporativo</label>
                            <div className="relative">
                                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">@</div>
                                <input
                                    required
                                    type="email"
                                    placeholder="ana.silva@cps.pa.gov.br"
                                    className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-0 transition-all dark:text-white"
                                    value={formData.email}
                                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Senha Inicial</label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <input
                                        required
                                        type="password"
                                        minLength={6}
                                        placeholder="******"
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-0 transition-all dark:text-white"
                                        value={formData.password}
                                        onChange={e => setFormData({ ...formData, password: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="group">
                                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2 ml-1">Perfil de Acesso</label>
                                <div className="relative">
                                    <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                                    <select
                                        className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-xl text-sm font-medium focus:outline-none focus:border-blue-500 focus:ring-0 transition-all dark:text-white appearance-none cursor-pointer"
                                        value={formData.role}
                                        onChange={e => setFormData({ ...formData, role: e.target.value })}
                                    >
                                        {roles.map(role => (
                                            <option key={role.id} value={role.id}>{role.name}</option>
                                        ))}
                                    </select>
                                    <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 scale-75" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 flex justify-end gap-3 border-t border-slate-100 dark:border-slate-800 mt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2.5 rounded-xl text-slate-600 dark:text-slate-300 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-500/30 active:scale-95 transition-all flex items-center gap-2"
                        >
                            <CheckCircle size={18} />
                            Criar Usuário
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
