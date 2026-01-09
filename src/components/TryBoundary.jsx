import React from 'react';
import { AlertTriangle, Home, RefreshCw, Copy, Check } from 'lucide-react';

class TryBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hasError: false,
            error: null,
            errorInfo: null,
            copied: false
        };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught error:", error, errorInfo);
        this.setState({ errorInfo });
    }

    handleReload = () => {
        this.setState({ hasError: false, error: null, errorInfo: null });
        window.location.reload();
    };

    handleGoHome = () => {
        window.location.href = '/';
    };

    handleCopyError = () => {
        const errorText = `Error: ${this.state.error?.toString()}\nInfo: ${this.state.errorInfo?.componentStack}`;
        navigator.clipboard.writeText(errorText);
        this.setState({ copied: true });
        setTimeout(() => this.setState({ copied: false }), 2000);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4 text-center font-sans">
                    <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full border border-red-100">
                        <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-6">
                            <AlertTriangle className="text-red-600" size={32} />
                        </div>

                        <h1 className="text-2xl font-bold text-slate-800 mb-2">Ops! Algo deu errado.</h1>
                        <p className="text-slate-500 mb-6">
                            O sistema encontrou um erro inesperado. Tente recarregar a página.
                        </p>

                        {this.state.error && (
                            <div className="relative group">
                                <div className="bg-slate-100 p-4 rounded-lg text-left mb-6 overflow-auto max-h-40 text-xs font-mono text-slate-600 border border-slate-200">
                                    {this.state.error.toString()}
                                </div>
                                <button
                                    onClick={this.handleCopyError}
                                    className="absolute top-2 right-2 p-1.5 bg-white rounded-md shadow-sm border border-slate-200 hover:bg-slate-50 text-slate-500"
                                    title="Copiar erro"
                                >
                                    {this.state.copied ? <Check size={14} className="text-green-600" /> : <Copy size={14} />}
                                </button>
                            </div>
                        )}

                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <button
                                onClick={this.handleReload}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors shadow-blue-200 shadow-lg hover:shadow-blue-300"
                            >
                                <RefreshCw size={18} /> Tentar Novamente
                            </button>
                            <button
                                onClick={this.handleGoHome}
                                className="flex items-center justify-center gap-2 px-6 py-3 bg-white border border-slate-200 text-slate-700 rounded-xl font-bold hover:bg-slate-50 transition-colors"
                            >
                                <Home size={18} /> Ir para o Início
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default TryBoundary;
