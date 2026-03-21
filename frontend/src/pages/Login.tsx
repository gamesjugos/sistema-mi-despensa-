import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { useAuthStore } from '../store/authStore';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [rememberEmail, setRememberEmail] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    useEffect(() => {
        const savedEmail = localStorage.getItem('savedEmail');
        if (savedEmail) {
            setEmail(savedEmail);
            setRememberEmail(true);
        }
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        if (rememberEmail) {
            localStorage.setItem('savedEmail', email);
        } else {
            localStorage.removeItem('savedEmail');
        }

        try {
            const res = await api.post('/auth/login', {
                email,
                password,
            });
            setAuth(res.data.token, res.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg text-slate-100 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10 flex flex-col items-center">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-2xl mb-6 bg-white flex items-center justify-center p-2 relative group">
                        <img 
                            src="/recurso2.jpg" 
                            alt="Mi Despensa Logo" 
                            className="w-full h-full object-contain mix-blend-multiply" 
                        />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">Mi Despensa</h1>
                    <p className="text-slate-400">Panel Administrativo</p>
                </div>

                <div className="bg-dark-card border border-dark-border rounded-2xl shadow-2xl p-8">
                    <h2 className="text-2xl font-semibold mb-6">Iniciar Sesión</h2>

                    {error && (
                        <div className="bg-primary-900/50 border border-primary-500/50 text-white p-3 rounded-lg mb-6 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Correo Electrónico</label>
                            <input
                                type="email"
                                required
                                className="input focus:ring-primary-600 bg-[#121212] border-dark-border text-white placeholder-slate-500"
                                placeholder="admin@midespensa.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5">Contraseña</label>
                            <input
                                type="password"
                                required
                                className="input focus:ring-primary-600 bg-[#121212] border-dark-border text-white placeholder-slate-500"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center">
                            <input
                                id="remember_email"
                                type="checkbox"
                                checked={rememberEmail}
                                onChange={(e) => setRememberEmail(e.target.checked)}
                                className="w-4 h-4 text-primary-600 bg-dark-bg border-dark-border rounded focus:ring-primary-500 focus:ring-offset-dark-bg"
                            />
                            <label htmlFor="remember_email" className="ml-2 text-sm text-slate-400 cursor-pointer hover:text-slate-300 transition-colors">
                                Recordar correo
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn-primary flex items-center justify-center gap-2 py-3 mt-4"
                        >
                            {loading ? 'Cargando...' : 'Entrar al Panel'}
                            {!loading && <LogIn size={18} />}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Login;
