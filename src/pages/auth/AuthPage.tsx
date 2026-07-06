import { useParams } from 'react-router-dom';
import { AuthView } from '@neondatabase/auth/react';
import './auth.css';

export function AuthPage() {
  const { path = 'sign-in' } = useParams();
  
  return (
    <div className="auth-page-container">
      <div className="auth-card-wrapper">
        <div className="auth-header">
          <h1 className="text-2xl font-bold text-slate-900">Gestión Empresarial</h1>
          <p className="text-slate-500 text-sm mt-1">Ingresa a tu cuenta para continuar</p>
        </div>
        <AuthView path={path as any} redirectTo="/" />
      </div>
    </div>
  );
}
