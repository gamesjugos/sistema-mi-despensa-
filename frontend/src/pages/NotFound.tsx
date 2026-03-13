import { useNavigate } from 'react-router-dom';

const NotFound = () => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-[#050505] p-6">
            <div className="max-w-md w-full text-center">
                <h1 className="text-[120px] font-black leading-none text-slate-100 dark:text-slate-900 select-none">404</h1>
                <div className="-mt-8 relative z-10">
                    <p className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Página no encontrada</p>
                    <p className="text-slate-500 mb-8">La ruta que buscas no existe o fue movida.</p>
                    <button onClick={() => navigate('/')} className="btn-primary">
                        Volver al Dashboard
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotFound;
