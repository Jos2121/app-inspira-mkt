import { useParams, Link } from 'react-router-dom';
import { AuthView } from '@neondatabase/auth/react';
import './auth.css';

export function AuthPage() {
  const { path = 'sign-in' } = useParams();
  
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-zinc-50 relative p-6">
      {/* Subtle grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-700 fill-both relative z-10">
        
        {/* Logo */}
        <div className="flex flex-col items-center gap-2 mb-8 justify-center group">
          <div className="w-32 h-32 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img 
              src="/logo.jpg" 
              alt="Inspira Logo" 
              className="w-full h-full object-contain" 
            />
          </div>
        </div>

        {/* Form Container (Glassmorphism) */}
        <div className="bg-white/80 backdrop-blur-xl border border-zinc-200/60 p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
          <div className="mb-8 text-center space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
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

          {/* Custom Footer Links */}
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
  );
}