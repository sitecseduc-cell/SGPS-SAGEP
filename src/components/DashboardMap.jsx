import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip, useMapEvents } from 'react-leaflet';
import { Users, MapPin, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '../lib/supabaseClient';

const center = [-4.5, -53.0]; // Approximate center of Pará
const zoom = 6;

const cities = [
    { name: 'Belém', position: [-1.4558, -48.5023], count: 150 },
    { name: 'Santarém', position: [-2.4430, -54.7082], count: 85 },
    { name: 'Marabá', position: [-5.3686, -49.1179], count: 60 },
    { name: 'Castanhal', position: [-1.2964, -47.9250], count: 40 },
    { name: 'Parauapebas', position: [-6.0673, -49.9032], count: 95 },
    { name: 'Altamira', position: [-3.2033, -52.2065], count: 25 },
    { name: 'Tucuruí', position: [-3.7661, -49.6725], count: 30 },
    { name: 'Barcarena', position: [-1.5058, -48.6258], count: 55 },
];

const getColor = (count) => {
    if (count > 100) return '#ef4444'; // red-500
    if (count > 80) return '#f97316'; // orange-500
    if (count > 50) return '#eab308'; // yellow-500
    if (count > 30) return '#3b82f6'; // blue-500
    return '#10b981'; // emerald-500
};

export default function DashboardMap() {
    const [candidates, setCandidates] = useState([]);
    const [selectedCandidate, setSelectedCandidate] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from('candidatos')
                .select('*')
                .eq('status', 'Classificado')
                .limit(50);

            if (error) throw error;
            setCandidates(data || []);
        } catch (error) {
            console.error('Erro ao buscar candidatos para lotação:', error);
            // toast.error('Erro ao carregar candidatos.'); // Optional
        } finally {
            setLoading(false);
        }
    };

    const handleCityClick = (city) => {
        if (!selectedCandidate) {
            toast.info('Selecione um candidato na lista primeiro para realizar a lotação.');
            return;
        }

        // Mock allocation persistence - in real app would be an UPDATE to DB
        // await supabase.from('candidatos').update({ localidade: city.name, status: 'Lotado' }).eq('id', selectedCandidate.id);

        toast.success(`Candidato ${selectedCandidate.nome} lotado em ${city.name} com sucesso!`);

        // Remove assigned candidate from list locally
        setCandidates(prev => prev.filter(c => c.id !== selectedCandidate.id));
        setSelectedCandidate(null);
    };

    return (
        <div className="flex flex-col md:flex-row h-[500px] w-full rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700 shadow-sm bg-white">

            {/* Sidebar de Candidatos */}
            <div className="w-full md:w-1/3 border-r border-slate-200 bg-slate-50 flex flex-col">
                <div className="p-4 border-b border-slate-200 bg-white">
                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                        <Users size={18} className="text-blue-600" /> Alocação de Candidatos
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">Selecione um candidato (Classificado) e clique no mapa.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-2">
                    {loading ? (
                        <div className="flex justify-center p-8"><Loader className="animate-spin text-slate-400" /></div>
                    ) : candidates.length === 0 ? (
                        <div className="text-center p-8 text-slate-400 text-sm">
                            <CheckCircle size={32} className="mx-auto mb-2 opacity-50" />
                            Nenhum candidato aguardando lotação.
                        </div>
                    ) : (
                        candidates.map(candidate => (
                            <div
                                key={candidate.id}
                                onClick={() => setSelectedCandidate(candidate)}
                                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedCandidate?.id === candidate.id
                                        ? 'bg-blue-50 border-blue-500 shadow-md ring-1 ring-blue-500'
                                        : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-sm'
                                    }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-slate-700 text-sm">{candidate.nome}</p>
                                        <p className="text-xs text-slate-500">{candidate.cargo || 'Cargo não def.'}</p>
                                    </div>
                                    <span className="bg-emerald-100 text-emerald-700 text-[10px] px-1.5 py-0.5 rounded font-bold">
                                        {candidate.nota_final || '-'}
                                    </span>
                                </div>
                                {selectedCandidate?.id === candidate.id && (
                                    <div className="mt-2 text-xs text-blue-600 font-bold flex items-center gap-1 animate-fadeIn">
                                        <MapPin size={12} /> Selecione o destino no mapa
                                        <ArrowRight size={12} className="ml-auto" />
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Mapa */}
            <div className="flex-1 relative z-0">
                <MapContainer
                    center={center}
                    zoom={zoom}
                    style={{ height: '100%', width: '100%' }}
                    scrollWheelZoom={true}
                    className="z-0"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {cities.map((city, idx) => (
                        <CircleMarker
                            key={idx}
                            center={city.position}
                            radius={8 + Math.sqrt(city.count) * 1.5}
                            eventHandlers={{
                                click: () => handleCityClick(city),
                            }}
                            pathOptions={{
                                color: getColor(city.count),
                                fillColor: getColor(city.count),
                                fillOpacity: 0.6,
                                weight: 1
                            }}
                        >
                            <Tooltip direction="top" offset={[0, -10]} opacity={1}>
                                <div className="text-center font-sans">
                                    <span className="font-bold block text-sm text-slate-800">{city.name}</span>
                                    <span className="text-xs font-semibold text-slate-600">{city.count} Vagas Disponíveis</span>
                                    <div className="text-[10px] text-blue-500 mt-1 font-bold">Clique para Lotar</div>
                                </div>
                            </Tooltip>
                        </CircleMarker>
                    ))}
                </MapContainer>

                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur p-2 rounded-lg shadow-lg border border-slate-200 text-xs z-[1000]">
                    <p className="font-bold mb-1 text-slate-700">Demandas</p>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-red-500"></span> Alta (&gt;100)</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span> Média (&gt;80)</div>
                    <div className="flex items-center gap-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Normal</div>
                </div>
            </div>
        </div>
    );
}
