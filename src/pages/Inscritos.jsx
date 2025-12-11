import React, { useState } from 'react';
import { 
  Search, ChevronRight, Mail, Phone, Save, Edit, 
  User, MapPin, FileText, Clock, FileCheck, Eye // <--- Adicionado o Eye aqui
} from 'lucide-react';
import CandidateTable from '../components/CandidateTable';
import { CANDIDATOS_MOCK } from '../data/mockData';

export default function Inscritos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  const filteredCandidates = CANDIDATOS_MOCK.filter(c => 
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) || 
    c.cpf.includes(searchTerm) ||
    c.processo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelectCandidate = (candidate) => {
    setSelectedCandidate(candidate);
    setEditData(candidate);
    setIsEditing(false);
  };

  const handleSave = () => {
    alert(`Dados de ${editData.nome} salvos com sucesso!`);
    setIsEditing(false);
  };

  if (selectedCandidate) {
    return (
      <div className="animate-fadeIn space-y-6 pb-10">
        {/* Header do Perfil */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center space-x-4">
            <button onClick={() => setSelectedCandidate(null)} className="p-2 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors">
              <ChevronRight size={20} className="rotate-180 text-slate-600"/>
            </button>
            <div className="h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center text-2xl font-bold text-blue-600 border-2 border-white shadow-md">
              {selectedCandidate.nome.charAt(0)}
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-800">{selectedCandidate.nome}</h2>
              <p className="text-sm text-slate-500 font-mono">CPF: {selectedCandidate.cpf}</p>
              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-bold ${
                selectedCandidate.status === 'Classificado' ? 'bg-emerald-100 text-emerald-700' : 
                selectedCandidate.status === 'Desclassificado' ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
              }`}>
                {selectedCandidate.status}
              </span>
            </div>
          </div>
          <div className="flex space-x-3">
            {isEditing ? (
              <>
                <button onClick={() => setIsEditing(false)} className="px-4 py-2 border border-slate-300 rounded-lg text-slate-600 font-medium hover:bg-slate-50">Cancelar</button>
                <button onClick={handleSave} className="px-4 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 flex items-center shadow-lg shadow-emerald-500/20">
                  <Save size={18} className="mr-2"/> Salvar
                </button>
              </>
            ) : (
              <button onClick={() => setIsEditing(true)} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 flex items-center shadow-lg shadow-blue-500/20">
                <Edit size={18} className="mr-2"/> Editar Dados
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 lg:col-span-2">
            <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center">
              <User size={20} className="mr-2 text-blue-500"/> Dados Cadastrais
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">E-mail</label>
                {isEditing ? (
                  <input type="email" value={editData.email} onChange={(e) => setEditData({...editData, email: e.target.value})} className="w-full p-2 border border-blue-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                ) : (
                  <div className="flex items-center text-slate-800 font-medium p-2 bg-slate-50 rounded-lg border border-transparent"><Mail size={16} className="mr-2 text-slate-400"/> {selectedCandidate.email}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Telefone / WhatsApp</label>
                {isEditing ? (
                  <input type="text" value={editData.telefone} onChange={(e) => setEditData({...editData, telefone: e.target.value})} className="w-full p-2 border border-blue-300 rounded-lg bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
                ) : (
                  <div className="flex items-center text-slate-800 font-medium p-2 bg-slate-50 rounded-lg border border-transparent"><Phone size={16} className="mr-2 text-slate-400"/> {selectedCandidate.telefone}</div>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Perfil de Inscrição</label>
                <div className="p-2 text-slate-800 font-medium bg-slate-50 rounded-lg">{selectedCandidate.perfil}</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-500 mb-1">Data Inscrição</label>
                <div className="p-2 text-slate-800 font-medium bg-slate-50 rounded-lg">{selectedCandidate.data_inscricao}</div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-100">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <MapPin size={20} className="mr-2 text-indigo-500"/> Processo e Localidade
              </h3>
              <div className="bg-indigo-50 p-4 rounded-xl border border-indigo-100">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase">Processo Seletivo</span>
                    <p className="font-bold text-indigo-900">{selectedCandidate.processo}</p>
                  </div>
                  <div>
                    <span className="text-xs font-bold text-indigo-400 uppercase">Cargo Pretendido</span>
                    <p className="font-bold text-indigo-900">{selectedCandidate.cargo}</p>
                  </div>
                  <div className="md:col-span-2">
                    <span className="text-xs font-bold text-indigo-400 uppercase">Lotação / Escola</span>
                    <p className="font-bold text-indigo-900">{selectedCandidate.localidade}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <FileText size={20} className="mr-2 text-orange-500"/> Documentos
              </h3>
              <ul className="space-y-2">
                {selectedCandidate.documentos?.map((doc, i) => (
                  <li key={i} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg text-sm font-medium text-slate-700 hover:bg-orange-50 hover:text-orange-700 transition-colors cursor-pointer group">
                    <span className="flex items-center"><FileCheck size={16} className="mr-2 text-slate-400 group-hover:text-orange-500"/> {doc}</span>
                    <Eye size={16} className="opacity-0 group-hover:opacity-100"/>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                <Clock size={20} className="mr-2 text-slate-500"/> Linha do Tempo
              </h3>
              <div className="relative border-l-2 border-slate-100 ml-3 space-y-6 pl-6 pb-2">
                {selectedCandidate.historico?.map((hist, i) => (
                  <div key={i} className="relative">
                    <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-2 border-white bg-blue-500 shadow-sm"></div>
                    <span className="text-xs font-bold text-slate-400 block mb-1">{hist.data}</span>
                    <p className="text-sm font-medium text-slate-800">{hist.evento}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn space-y-6 pb-10">
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Gestão de Inscritos</h2>
            <p className="text-slate-500 text-sm mt-1">Pesquise, visualize e gerencie os candidatos.</p>
          </div>
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Buscar por Nome, CPF ou Processo..." 
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <CandidateTable candidates={filteredCandidates} onSelect={handleSelectCandidate} />
      </div>
    </div>
  );
}