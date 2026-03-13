import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import { LogIn } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const setAuth = useAuthStore((state) => state.setAuth);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            // Direct call to API
            const res = await axios.post('http://localhost:5000/api/auth/login', {
                email,
                password,
            });
            setAuth(res.data.token, res.data.user);
            navigate('/');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-dark-bg text-slate-100 p-4">
            <div className="w-full max-w-md">
                <div className="text-center mb-10 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-[#121212] shadow-2xl mb-4 bg-white dark:bg-black relative group">
                        <div className="absolute inset-0 bg-primary-500/10 group-hover:bg-transparent transition-colors z-10"></div>
                        <img src="/logo.png" alt="Vikingos Logo" className="w-full h-full object-cover scale-[1.15] z-0" />
                    </div>
                    <h1 className="text-4xl font-bold tracking-tighter text-white mb-2">Vikingos GC</h1>
                    <p className="text-slate-400">Panel administrativo</p>
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
                                placeholder="admin@vikingos.com"
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
