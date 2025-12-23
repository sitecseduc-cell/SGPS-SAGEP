import React from 'react';
import DashboardMap from '../components/DashboardMap';

export default function Lotacao() {
    return (
        <div className="animate-fadeIn space-y-6 h-[calc(100vh-100px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Contratação & Lotação</h2>
                    <p className="text-slate-500">Distribua os candidatos classificados nas vagas disponíveis via geolocalização.</p>
                </div>
            </div>

            <div className="flex-1 overflow-hidden bg-white rounded-2xl shadow-sm border border-slate-200">
                <DashboardMap />
            </div>
        </div>
    );
}
