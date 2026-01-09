import React, { useState, useEffect } from 'react';
import { WifiOff } from 'lucide-react';
import { toast } from 'sonner';

export default function NetworkStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            toast.success('Conexão restabelecida!', { id: 'network-status' });
        };

        const handleOffline = () => {
            setIsOnline(false);
            toast.error('Você está offline. Verifique sua conexão.', {
                id: 'network-status',
                duration: Infinity,
                icon: <WifiOff size={18} />
            });
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    if (isOnline) return null;

    return (
        <div className="bg-red-600 text-white text-xs font-bold text-center py-1 fixed top-0 w-full z-[9999] animate-pulse">
            VOCÊ ESTÁ OFFLINE - Algumas funcionalidades podem não funcionar.
        </div>
    );
}
