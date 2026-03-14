import React, { useState, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { LayoutDashboard, Users, CalendarDays, ShieldCheck, LogOut, Menu, X } from 'lucide-react';

interface LayoutProps {
    children: React.ReactNode;
}

const navItems = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/players', icon: Users, label: 'Jugadores' },
    { to: '/payments', icon: CalendarDays, label: 'Pagos' },
    { to: '/admins', icon: ShieldCheck, label: 'Admins' },
];

const Layout = ({ children }: LayoutProps) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Auto-logout after 1 minute of inactivity
    useEffect(() => {
        let timeoutId: ReturnType<typeof setTimeout>;

        const resetTimer = () => {
            clearTimeout(timeoutId);
            // 60000 ms = 1 minute
            timeoutId = setTimeout(() => {
                handleLogout();
            }, 60000);
        };

        // Start the timer
        resetTimer();

        // Add event listeners for user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
        events.forEach((event) => {
            document.addEventListener(event, resetTimer);
        });

        // Cleanup on unmount
        return () => {
            clearTimeout(timeoutId);
            events.forEach((event) => {
                document.removeEventListener(event, resetTimer);
            });
        };
    }, []);

    const SidebarContent = () => (
        <>
            {/* Logo */}
            <div className="p-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-primary-500/20 shadow-sm bg-white dark:bg-black">
                        <img src="/logo.png" alt="Vikingos Logo" className="w-full h-full object-cover scale-110" />
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="text-primary-600">Vikingos</span>
                        <span className="text-[10px] font-bold px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-slate-500 uppercase tracking-widest">PRO</span>
                    </h1>
                </div>
                {/* Close button – mobile only */}
                <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 text-slate-400 hover:text-slate-700 dark:hover:text-white">
                    <X size={20} />
                </button>
            </div>

            {/* Nav */}
            <nav className="flex-1 px-4 py-2 space-y-1">
                {navItems
                    .filter(item => item.to !== '/admins' || user?.role === 'SUPERADMIN')
                    .map(({ to, icon: Icon, label }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={to === '/'}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 font-medium text-sm ${isActive
                                    ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 shadow-sm'
                                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-dark-card hover:text-slate-900 dark:hover:text-white'
                                }`
                            }
                        >
                            <Icon size={20} />
                            {label}
                        </NavLink>
                    ))}
            </nav>

            {/* User footer */}
            <div className="p-4 border-t border-slate-200 dark:border-dark-border">
                <div className="flex items-center gap-3 mb-3 px-2">
                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-600 dark:text-primary-400 text-sm shrink-0">
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name || 'Admin'}</p>
                        <p className="text-xs text-slate-400 truncate">{user?.email}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors"
                >
                    <LogOut size={16} />
                    Cerrar Sesión
                </button>
            </div>
        </>
    );

    return (
        <div className="flex h-screen bg-slate-50 dark:bg-[#050505] overflow-hidden">

            {/* ── Desktop Sidebar ── */}
            <aside className="hidden lg:flex w-64 bg-white dark:bg-dark-bg border-r border-slate-200 dark:border-dark-border flex-col shrink-0 transition-colors">
                <SidebarContent />
            </aside>

            {/* ── Mobile Overlay ── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* ── Mobile Slide-in Sidebar ── */}
            <aside className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-dark-bg border-r border-slate-200 dark:border-dark-border flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <SidebarContent />
            </aside>

            {/* ── Main content ── */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

                {/* Mobile top bar */}
                <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white dark:bg-dark-bg border-b border-slate-200 dark:border-dark-border shrink-0 z-30">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="p-2 -ml-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                            <Menu size={22} />
                        </button>
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full overflow-hidden shrink-0 shadow-sm bg-white dark:bg-black border border-primary-500/20">
                                <img src="/logo.png" alt="Logo" className="w-full h-full object-cover scale-110" />
                            </div>
                            <h1 className="text-lg font-bold text-slate-900 dark:text-white">
                                <span className="text-primary-600">Vikingos</span>
                            </h1>
                        </div>
                    </div>
                    <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center font-bold text-primary-600 text-sm">
                        {user?.name?.charAt(0).toUpperCase() || 'A'}
                    </div>
                </header>

                {/* Scrollable page content */}
                <main className="flex-1 overflow-y-auto flex flex-col">
                    <div className="p-4 sm:p-6 lg:p-8 pb-24 lg:pb-8 flex-1">
                        {children}
                    </div>
                    <footer className="w-full py-4 text-center mt-auto">
                        <p className="text-xs text-slate-400 dark:text-slate-500 font-medium uppercase tracking-wider">
                            &copy; {new Date().getFullYear()} derechos de autor <span className="font-bold text-primary-500">jesus ruiz</span>
                        </p>
                    </footer>
                </main>

                {/* ── Mobile bottom navigation ── */}
                <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white dark:bg-dark-bg border-t border-slate-200 dark:border-dark-border flex items-center justify-around px-2 py-1 safe-area-b">
                    {navItems
                        .filter(item => item.to !== '/admins' || user?.role === 'SUPERADMIN')
                        .map(({ to, icon: Icon, label }) => (
                            <NavLink
                                key={to}
                                to={to}
                                end={to === '/'}
                                className={({ isActive }) =>
                                    `flex flex-col items-center gap-0.5 px-3 py-2 rounded-xl transition-all duration-200 min-w-[52px] ${isActive
                                        ? 'text-primary-600 dark:text-primary-400'
                                        : 'text-slate-400 dark:text-slate-600'
                                    }`
                                }
                            >
                                {({ isActive }) => (
                                    <>
                                        <div className={`p-1.5 rounded-xl transition-colors ${isActive ? 'bg-primary-50 dark:bg-primary-900/30' : ''}`}>
                                            <Icon size={20} />
                                        </div>
                                        <span className="text-[10px] font-semibold">{label}</span>
                                    </>
                                )}
                            </NavLink>
                        ))}
                </nav>
            </div>
        </div>
    );
};

export default Layout;
