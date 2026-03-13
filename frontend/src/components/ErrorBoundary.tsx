import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props { children: ReactNode; }
interface State { hasError: boolean; error: Error | null; }

/**
 * React Error Boundary – catches render errors and shows a fallback UI.
 * ISO 25010 - Fault Tolerance / Reliability
 */
class ErrorBoundary extends Component<Props, State> {
    public state: State = { hasError: false, error: null };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, info: ErrorInfo) {
        console.error('[ErrorBoundary] Caught error:', error, info.componentStack);
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050505] p-6">
                    <div className="max-w-md w-full text-center">
                        <div className="text-7xl mb-6">⚠️</div>
                        <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-3">Algo salió mal</h1>
                        <p className="text-slate-500 mb-2">Ocurrió un error inesperado en la aplicación.</p>
                        {process.env.NODE_ENV !== 'production' && this.state.error && (
                            <pre className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-400 text-left overflow-auto">
                                {this.state.error.message}
                            </pre>
                        )}
                        <div className="mt-8 flex gap-3 justify-center">
                            <button
                                onClick={() => this.setState({ hasError: false, error: null })}
                                className="btn-outline"
                            >
                                Intentar de nuevo
                            </button>
                            <button
                                onClick={() => window.location.href = '/'}
                                className="btn-primary"
                            >
                                Volver al inicio
                            </button>
                        </div>
                    </div>
                </div>
            );
        }
        return this.props.children;
    }
}

export default ErrorBoundary;
