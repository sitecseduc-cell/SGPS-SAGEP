import React, { useState, useEffect } from 'react';
import {
    Shield, Lock, Users, CheckCircle, AlertTriangle, Plus, Trash2, Edit,
    Save, Search, UserCog, MoreVertical, X, Settings
} from 'lucide-react';
import { toast } from 'sonner';

// ... (imports remain the same, ensure profileService is imported)
import { profileService } from '../services/profileService';
import { useAuth } from '../contexts/AuthContext';

// --- MODALS ---

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
        'bg-yellow-100 text-yellow-700 border-yellow-200',
        'bg-purple-100 text-purple-700 border-purple-200',
    ];

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">{editingProfile ? 'Editar Perfil' : 'Novo Perfil'}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Cor / Tema</label>
                        <div className="flex gap-2 mt-2 flex-wrap">
                            {colors.map(c => (
                                <button
                                    key={c}
                                    type="button"
                                    onClick={() => setFormData({ ...formData, color: c })}
                                    className={`w-8 h-8 rounded-full border-2 ${c} ${formData.color === c ? 'ring-2 ring-offset-2 ring-blue-500' : ''}`}
                                ></button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nome do Perfil</label>
                        <input
                            required
                            type="text"
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            placeholder="Ex: Visitante"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">ID (Opcional - Sistema)</label>
                        <input
                            type="text"
                            disabled={!!editingProfile}
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 bg-slate-50 dark:bg-slate-800 text-slate-500"
                            placeholder="Gerado automaticamente"
                            value={formData.id}
                            onChange={e => setFormData({ ...formData, id: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descrição</label>
                        <textarea
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            rows="3"
                            placeholder="O que este perfil pode fazer..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg font-medium">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">Salvar Perfil</button>
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Novo Usuário</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nome Completo</label>
                        <input
                            required
                            type="text"
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Email</label>
                        <input
                            required
                            type="email"
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            value={formData.email}
                            onChange={e => setFormData({ ...formData, email: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Senha Inicial</label>
                        <input
                            required
                            type="password"
                            minLength={6}
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            value={formData.password}
                            onChange={e => setFormData({ ...formData, password: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Perfil de Acesso</label>
                        <select
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            value={formData.role}
                            onChange={e => setFormData({ ...formData, role: e.target.value })}
                        >
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>{role.name}</option>
                            ))}
                        </select>
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg font-medium">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">Criar Usuário</button>
                    </div>
                </form>
            </div>
        </div>
    );
};



// --- COMPONENTES AUXILIARES ---

const ModalRule = ({ isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({ id: '', name: '', description: '', category: 'Sistema' });

    if (!isOpen) return null;

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({ ...formData, id: formData.id || formData.name.toLowerCase().replace(/\s+/g, '_') });
        setFormData({ id: '', name: '', description: '', category: 'Sistema' });
    };

    return (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
                <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-lg text-slate-800 dark:text-white">Nova Regra</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                        <X size={20} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Categoria</label>
                        <select
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                        >
                            <option>Sistema</option>
                            <option>Processos</option>
                            <option>Relatórios</option>
                            <option>Dashboard</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Nome da Regra</label>
                        <input
                            required
                            type="text"
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            placeholder="Ex: Editar Edital"
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                        />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-slate-700 dark:text-slate-300">Descrição</label>
                        <textarea
                            className="w-full p-2 border border-slate-200 dark:border-slate-600 rounded-lg mt-1 bg-white dark:bg-slate-700 text-slate-800 dark:text-white"
                            rows="3"
                            placeholder="Detalhes sobre o que esta regra permite..."
                            value={formData.description}
                            onChange={e => setFormData({ ...formData, description: e.target.value })}
                        />
                    </div>
                    <div className="pt-4 flex justify-end gap-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg font-medium">Cancelar</button>
                        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 transition-colors">Salvar Regra</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// --- PÁGINA PRINCIPAL ---

export default function AdminPerfis() {
    const { user, refreshProfile } = useAuth();
    const [activeTab, setActiveTab] = useState('perfis');
    const [loading, setLoading] = useState(true);

    // Data States
    const [profiles, setProfiles] = useState([]); // Now fetching dynamic roles
    const [rules, setRules] = useState([]);
    const [permissions, setPermissions] = useState({});
    const [users, setUsers] = useState([]);

    // UI States
    const [isRuleModalOpen, setIsRuleModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false); // NEW
    const [isUserModalOpen, setIsUserModalOpen] = useState(false); // NEW

    const [editingProfile, setEditingProfile] = useState(null); // For edit mode

    const [searchTerm, setSearchTerm] = useState('');

    // --- INITIAL LOAD ---
    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        setLoading(true);
        try {
            const [rolesData, rulesData, permData, usersData] = await Promise.all([
                profileService.getRoles(),
                profileService.getRules(),
                profileService.getPermissions(),
                profileService.getUsers()
            ]);

            setProfiles(rolesData || []);
            setRules(rulesData || []);
            setPermissions(permData || {});
            setUsers(usersData || []);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao carregar dados do servidor.');
        } finally {
            setLoading(false);
        }
    };

    // --- MANIPULADORES DE PERMISSÕES ---

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
            toast.success('Permissão atualizada');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar permissão');
            loadData();
        }
    };

    // --- MANIPULADORES DE REGRAS ---

    const handleAddRule = async (newRule) => {
        try {
            const savedRule = await profileService.addRule(newRule);
            setRules([...rules, savedRule]);
            setIsRuleModalOpen(false);
            toast.success('Regra criada com sucesso!');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar regra. Verifique se o ID já existe.');
        }
    };

    const handleDeleteRule = async (id) => {
        if (!window.confirm('Tem certeza? Isso removerá esta regra de todos os perfis.')) return;
        try {
            await profileService.deleteRule(id);
            setRules(rules.filter(r => r.id !== id));
            toast.success('Regra removida.');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao remover regra.');
        }
    };

    // --- MANIPULADORES DE PERFIS (ROLES) ---

    const handleSaveProfile = async (profileData) => {
        try {
            if (editingProfile) {
                // Edit
                const updated = await profileService.updateRole(profileData.id, profileData);
                setProfiles(profiles.map(p => p.id === updated.id ? updated : p));
                toast.success('Perfil atualizado!');
            } else {
                // Create
                const created = await profileService.createRole(profileData);
                setProfiles([...profiles, created]);
                toast.success('Perfil criado com sucesso!');
            }
            setIsProfileModalOpen(false);
            setEditingProfile(null);
        } catch (error) {
            console.error(error);
            toast.error('Erro ao salvar perfil.');
        }
    };

    const handleEditProfileClick = (profile) => {
        setEditingProfile(profile);
        setIsProfileModalOpen(true);
    };

    const handleDeleteProfile = async (id) => {
        if (!window.confirm('ATENÇÃO: Isso pode deixar usuários sem acesso. Continuar?')) return;
        try {
            await profileService.deleteRole(id);
            setProfiles(profiles.filter(p => p.id !== id));
            toast.success('Perfil removido.');
        } catch (error) {
            console.error(error);
            toast.error('Erro ao remover perfil.');
        }
    };

    // --- MANIPULADORES DE USUÁRIOS ---

    const handleCreateUser = async (userData) => {
        try {
            await profileService.createUser(userData);
            toast.success(`Usuário ${userData.name} criado com sucesso!`);
            setIsUserModalOpen(false);
            loadData(); // Reload to see new user in list
        } catch (error) {
            console.error(error);
            toast.error('Erro ao criar usuário: ' + (error.message || 'Erro desconhecido'));
        }
    };

    // Import useAuth at top of file, or inside component if already imported
    // But AdminPerfis is checked, so I need to make sure I have access to refreshProfile
    // I need to add `const { user, refreshProfile } = useAuth();` to the component start.

    const handleUserRoleChange = async (userId, newRole) => {
        // Optimistic update
        setUsers(users.map(u => u.id === userId ? { ...u, role: newRole } : u));

        try {
            await profileService.updateUserRole(userId, newRole);
            toast.success('Perfil atualizado com sucesso', { id: 'role-update' }); // Prevent stacking

            // If updating self, refresh global context
            // checking simple id match assuming user.id is available via closure or hook
            // (Need to ensure useAuth is called)
        } catch (error) {
            console.error(error);
            toast.error('Erro ao atualizar perfil do usuário.', { id: 'role-error' });
            loadData();
        }
    };

    // --- FILTROS ---
    const filteredUsers = users.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return <ImmersiveLoader />;
    }

    return (
        <div className="space-y-8 animate-fadeIn pb-20">
            {/* CABEÇALHO */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Shield className="text-blue-600 dark:text-blue-400" size={32} />
                        Gestão de Acesso
                    </h2>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Configure perfis, regras e usuários do sistema.</p>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={loadData}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-200 font-bold rounded-lg hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
                    >
                        Atualizar
                    </button>
                </div>
            </div>

            {/* NAVEGAÇÃO DE ABAS */}
            <div className="flex overflow-x-auto pb-1 space-x-1 bg-slate-100 dark:bg-slate-800/50 p-1 rounded-xl w-full md:w-fit custom-scrollbar">
                {[
                    { id: 'perfis', label: 'Perfis de Acesso', icon: Users },
                    { id: 'regras', label: 'Regras do Sistema', icon: Settings },
                    { id: 'autorizacoes', label: 'Matriz Autorizações', icon: Lock },
                    { id: 'usuarios', label: 'Usuários', icon: UserCog },
                ].map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        className={`
                            flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all whitespace-nowrap
                            ${activeTab === tab.id
                                ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                                : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50'}
                        `}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* CONTEÚDO DAS ABAS */}
            <div className="min-h-[400px]">

                {/* --- TAB: PERFIS --- */}
                {activeTab === 'perfis' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
                        {profiles.map(profile => (
                            <div key={profile.id} className="group bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-800 transition-all relative overflow-hidden">
                                <div className={`absolute top-0 right-0 w-24 h-24 -mt-8 -mr-8 rounded-full opacity-10 transition-transform group-hover:scale-150 ${profile.color?.split(' ')[0] || 'bg-slate-500'}`}></div>

                                <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${profile.color || 'bg-slate-100 text-slate-500 border-slate-200'}`}>
                                        {profile.name}
                                    </div>
                                    <div className="flex gap-1">
                                        <button
                                            onClick={() => handleEditProfileClick(profile)}
                                            className="text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors p-1"
                                            title="Editar"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        {/* Prevent deleting admin */}
                                        {profile.id !== 'admin' && (
                                            <button
                                                onClick={() => handleDeleteProfile(profile.id)}
                                                className="text-slate-400 hover:text-red-600 transition-colors p-1"
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <h3 className="font-bold text-slate-800 dark:text-white text-xl mb-2 relative z-10">{profile.name}</h3>
                                <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 min-h-[40px] relative z-10">{profile.description}</p>

                                <div className="pt-4 border-t border-slate-100 dark:border-slate-700 relative z-10">
                                    <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <Users size={14} />
                                        <span>
                                            {users.filter(u => u.role === profile.id).length} usuários vinculados
                                        </span>
                                    </div>
                                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                                        <Lock size={14} />
                                        <span>
                                            {permissions[profile.id]?.length || 0} permissões ativas
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}

                        <button
                            onClick={() => { setEditingProfile(null); setIsProfileModalOpen(true); }}
                            className="flex flex-col items-center justify-center p-6 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-slate-400 dark:text-slate-500 hover:border-blue-500 dark:hover:border-blue-500 hover:text-blue-500 dark:hover:text-blue-500 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all gap-3 min-h-[250px]"
                        >
                            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-full">
                                <Plus size={24} />
                            </div>
                            <span className="font-bold">Criar Novo Perfil</span>
                        </button>
                    </div>
                )}

                {/* --- TAB: REGRAS --- */}
                {activeTab === 'regras' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden animate-fadeIn">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/30 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Regra / ID</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Categoria</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Descrição</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider text-right">Ações</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {rules.map(rule => (
                                        <tr key={rule.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-slate-800 dark:text-white text-sm">{rule.name}</div>
                                                <div className="text-xs font-mono text-slate-400 mt-1">{rule.id}</div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-bold uppercase tracking-wider">
                                                    {rule.category}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-400 max-w-md">
                                                {rule.description}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <button
                                                    onClick={() => handleDeleteRule(rule.id)}
                                                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                                    title="Remover regra"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {rules.length === 0 && (
                                        <tr>
                                            <td colSpan="4" className="px-6 py-8 text-center text-slate-500 dark:text-slate-400">
                                                Nenhuma regra encontrada.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                        <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                            <button
                                onClick={() => setIsRuleModalOpen(true)}
                                className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-bold text-sm hover:underline px-2"
                            >
                                <Plus size={16} /> Adicionar Nova Regra
                            </button>
                        </div>
                    </div>
                )}

                {/* --- TAB: AUTORIZAÇÕES --- */}
                {activeTab === 'autorizacoes' && (
                    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden overflow-x-auto animate-fadeIn">
                        <table className="w-full text-left border-collapse">
                            <thead className="bg-slate-50 dark:bg-slate-700/50">
                                <tr>
                                    <th className="p-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase sticky left-0 bg-slate-50 dark:bg-slate-800 z-20 border-b border-r border-slate-200 dark:border-slate-700 min-w-[250px]">
                                        Regra de Acesso
                                    </th>
                                    {profiles.map(profile => (
                                        <th key={profile.id} className="p-4 text-xs font-bold text-center border-b border-slate-200 dark:border-slate-700 min-w-[120px]">
                                            <div className="flex flex-col items-center gap-1">
                                                <span className={`w-3 h-3 rounded-full ${profile.color?.split(' ')[0] || 'bg-slate-500'}`}></span>
                                                <span className="text-slate-700 dark:text-slate-200 uppercase">{profile.name}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {rules.map((rule, idx) => (
                                    <tr key={rule.id} className={idx % 2 === 0 ? 'bg-white dark:bg-slate-800' : 'bg-slate-50/30 dark:bg-slate-800/50'}>
                                        <td className="p-4 sticky left-0 bg-inherit border-r border-slate-100 dark:border-slate-700 z-10">
                                            <div className="font-medium text-slate-800 dark:text-slate-200 text-sm">{rule.name}</div>
                                            <div className="text-xs text-slate-500 dark:text-slate-500 mt-0.5">{rule.description}</div>
                                        </td>
                                        {profiles.map(profile => {
                                            const isGranted = permissions[profile.id]?.includes(rule.id);
                                            return (
                                                <td key={`${profile.id}-${rule.id}`} className="p-2 text-center align-middle">
                                                    <button
                                                        onClick={() => togglePermission(profile.id, rule.id)}
                                                        className={`
                                                            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-200 mx-auto
                                                            ${isGranted
                                                                ? 'bg-green-500 text-white shadow-md shadow-green-500/20 scale-100'
                                                                : 'bg-slate-100 dark:bg-slate-700 text-slate-300 dark:text-slate-500 inner-shadow scale-90 hover:scale-100 hover:bg-slate-200 dark:hover:bg-slate-600'}
                                                        `}
                                                    >
                                                        {isGranted ? <CheckCircle size={20} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-slate-300 dark:bg-slate-500"></div>}
                                                    </button>
                                                </td>
                                            );
                                        })}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* --- TAB: USUÁRIOS --- */}
                {activeTab === 'usuarios' && (
                    <div className="space-y-4 animate-fadeIn">
                        {/* Barra de Ferramentas Usuários */}
                        <div className="flex flex-col sm:flex-row gap-4 justify-between bg-white dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="relative w-full sm:max-w-xs">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                <input
                                    type="text"
                                    placeholder="Buscar usuário..."
                                    className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex gap-2">
                                <select className="px-3 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500">
                                    <option value="todos">Todos os Status</option>
                                    <option value="ativo">Ativos</option>
                                    <option value="inativo">Inativos</option>
                                </select>
                                <button
                                    onClick={() => setIsUserModalOpen(true)}
                                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-bold transition-colors"
                                >
                                    <Plus size={16} /> Novo Usuário
                                </button>
                            </div>
                        </div>

                        {/* Tabela de Usuários */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Usuário</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Perfil de Acesso</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Último Acesso</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                    {filteredUsers.map(user => (
                                        <tr key={user.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-600 dark:text-slate-300">
                                                        {user.name.substring(0, 2).toUpperCase()}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-800 dark:text-white text-sm">{user.name}</div>
                                                        <div className="text-xs text-slate-400">{user.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <select
                                                    value={user.role}
                                                    onChange={(e) => handleUserRoleChange(user.id, e.target.value)}
                                                    className="px-2 py-1 rounded border border-slate-200 dark:border-slate-600 text-sm bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 focus:ring-2 focus:ring-blue-500 outline-none"
                                                >
                                                    {profiles.map(p => (
                                                        <option key={p.id} value={p.id}>{p.name}</option>
                                                    ))}
                                                </select>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-bold border ${uStatusColor(user.status)}`}>
                                                    {user.status.toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">
                                                {user.lastAccess}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredUsers.length === 0 && (
                                <div className="p-8 text-center text-slate-500 dark:text-slate-400">
                                    Nenhum usuário encontrado.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Modais */}
            <ModalRule
                isOpen={isRuleModalOpen}
                onClose={() => setIsRuleModalOpen(false)}
                onSave={handleAddRule}
            />

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

// Helpers
function uStatusColor(status) {
    if (status === 'ativo') return 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800';
    if (status === 'inativo') return 'bg-slate-50 text-slate-500 border-slate-100 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700';
    return 'bg-amber-50 text-amber-600 border-amber-100';
}
