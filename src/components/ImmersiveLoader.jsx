import React, { useState, useEffect } from 'react';

const MESSAGES = [
    "Calibrando os cristais de energia...",
    "Contatando satélites...",
    "Organizando os bits nos lugares certos...",
    "Verificando se o café está pronto...",
    "Carregando a magia do serviço público...",
    "Desembaralhando os dados...",
    "Polindo os pixels da interface...",
    "Verificando a integridade do fluxo quântico...",
    "Aguarde enquanto desenhamos a tela...",
    "Compilando a burocracia digital..."
];

export default function ImmersiveLoader() {
    const [message, setMessage] = useState(MESSAGES[0]);
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        // Cycle messages every 2.5s
        const messsageInterval = setInterval(() => {
            setMessage(MESSAGES[Math.floor(Math.random() * MESSAGES.length)]);
        }, 2500);

        // Fake progress bar
        const progressInterval = setInterval(() => {
            setProgress(old => {
                if (old >= 100) return 0;
                return old + 1; // slow increment
            });
        }, 50);

        return () => {
            clearInterval(messsageInterval);
            clearInterval(progressInterval);
        };
    }, []);

    return (
        <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans">

            {/* Background Aurora */}
            <div className="absolute top-[-20%] left-[-20%] w-[70%] h-[70%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-[-20%] right-[-20%] w-[70%] h-[70%] bg-fuchsia-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>

            {/* Main Loader Container */}
            <div className="relative z-10 flex flex-col items-center">

                {/* Animated Orb/Cube */}
                <div className="relative w-32 h-32 mb-12">
                    {/* Outer Ring */}
                    <div className="absolute inset-0 border-4 border-transparent border-t-indigo-500/50 border-r-fuchsia-500/50 rounded-full animate-spin duration-[3s]"></div>
                    <div className="absolute inset-2 border-4 border-transparent border-b-emerald-500/50 border-l-blue-500/50 rounded-full animate-spin duration-[2s] direction-reverse"></div>

                    {/* Core */}
                    <div className="absolute inset-8 bg-white/20 dark:bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl animate-float flex items-center justify-center border border-white/20">
                        <div className="w-8 h-8 bg-gradient-to-tr from-indigo-500 to-fuchsia-500 rounded-lg animate-pulse shadow-lg shadow-indigo-500/50"></div>
                    </div>

                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-indigo-500/20 blur-2xl rounded-full animate-pulse"></div>
                </div>

                {/* Text & Message */}
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-fuchsia-600 dark:from-indigo-400 dark:to-fuchsia-400 mb-4 tracking-tight animate-fadeIn">
                    Carregando Sistema
                </h2>

                <div className="h-6 overflow-hidden relative w-80 text-center">
                    <p className="text-sm font-medium text-slate-500 dark:text-slate-400 animate-slideInRight key={message}">
                        {message}
                    </p>
                </div>

                {/* Progress Bar */}
                <div className="mt-8 w-64 h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500 bg-[length:200%_100%] animate-[shimmer_2s_infinite_linear]"
                        style={{ width: '100%' }} // Indeterminate for now, or use progress state
                    ></div>
                </div>

            </div>

            {/* Footer Hint */}
            <div className="absolute bottom-8 text-xs text-slate-400 animate-pulse">
                Preparando sua experiência...
            </div>

        </div>
    );
}
