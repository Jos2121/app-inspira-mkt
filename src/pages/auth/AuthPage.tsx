import { useParams, Link } from 'react-router-dom';
import { AuthView } from '@neondatabase/auth/react';
import { Command } from 'lucide-react';
import './auth.css';

export function AuthPage() {
  const { path = 'sign-in' } = useParams();
  
  return (
    <div className="min-h-screen w-full flex bg-zinc-50">
      {/* Left Panel: Tech/Brand side (Desktop only) */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-zinc-950 p-12 relative overflow-hidden">
        {/* Tech Grid Background (Dark) */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
        
        {/* Brand Logo */}
        <div className="relative z-10 flex items-center gap-3 text-white">
          <div className="w-12 h-12 bg-blue-600 border border-blue-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30">
            <Command className="w-6 h-6" />
          </div>
          <span className="font-bold text-2xl tracking-tight">Gestión MVP</span>
        </div>
        
        {/* Hero Copy */}
        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-xs font-mono text-blue-200">
            <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,0.6)]"></span>
            SISTEMA EN LÍNEA
          </div>
          <h2 className="text-4xl font-bold text-white tracking-tight leading-tight">
            Optimiza tus operaciones y escala tu negocio.
          </h2>
          <p className="text-zinc-400 text-lg leading-relaxed">
            Plataforma SaaS integral para la gestión de clientes, inventario y ventas. Todo en un solo lugar con métricas en tiempo real.
          </p>
        </div>
        
        {/* Footer info */}
        <div className="relative z-10 flex items-center justify-between text-zinc-500 font-mono text-xs uppercase tracking-widest">
          <span>v1.0.0-beta</span>
          <span>© 2026 Inspira Corp</span>
        </div>
      </div>

      {/* Right Panel: Form side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-zinc-50 relative">
        {/* Subtle grid for the light side */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

        <div className="w-full max-w-[420px] animate-in fade-in zoom-in-95 duration-700 fill-both relative z-10">
          
          {/* Mobile Logo */}
          <div className="lg:hidden flex flex-col items-center gap-4 mb-10 justify-center">
            <div className="w-14 h-14 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/30 border border-blue-500">
              <Command className="w-7 h-7" />
            </div>
            <span className="font-bold text-2xl tracking-tight text-zinc-900">Gestión MVP</span>
          </div>

          {/* Form Container (Glassmorphism) */}
          <div className="bg-white/70 backdrop-blur-xl border border-zinc-200/50 p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)]">
            <div className="mb-8 text-center space-y-2">
              <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">
                {path === 'sign-in' ? 'Bienvenido de vuelta' : 'Crear Cuenta'}
              </h1>
              <p className="text-zinc-500 text-sm font-medium">
                {path === 'sign-in' 
                  ? 'Ingresa tus credenciales para acceder al panel' 
                  : 'Regístrate para comenzar a gestionar tu negocio'}
              </p>
            </div>
            
            <div className="auth-wrapper">
              <AuthView path={path as any} redirectTo="/" />
            </div>

            {/* Custom Footer Links to override default behavior if needed, or simply complement */}
            <div className="mt-8 text-center text-sm text-zinc-500 font-medium">
              {path === 'sign-in' ? (
                <p>
                  ¿No tienes una cuenta?{' '}
                  <Link to="/auth/sign-up" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">
                    Regístrate aquí
                  </Link>
                </p>
              ) : (
                <p>
                  ¿Ya tienes una cuenta?{' '}
                  <Link to="/auth/sign-in" className="text-blue-600 hover:text-blue-700 hover:underline font-semibold transition-colors">
                    Inicia Sesión
                  </Link>
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
