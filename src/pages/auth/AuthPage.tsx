import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { authClient } from '@/lib/auth-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Phone, Lock, User, ShieldAlert } from 'lucide-react';
import './auth.css';

export function AuthPage() {
  const { path = 'sign-in' } = useParams();
  const navigate = useNavigate();
  const [whatsapp, setWhatsapp] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const cleanWhatsapp = whatsapp.replace(/\s+/g, '');
    const fakeEmail = `${cleanWhatsapp}@inspira.local`;

    try {
      if (path === 'sign-in') {
        await authClient.signIn.email({ email: fakeEmail, password }, {
          onSuccess: () => navigate('/'),
          onError: (ctx) => toast.error(ctx.error.message)
        });
      } else {
        await authClient.signUp.email({ email: fakeEmail, password, name }, {
          onSuccess: () => navigate('/'),
          onError: (ctx) => toast.error(ctx.error.message)
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const generateTestCredentials = async () => {
    setLoading(true);
    const users = [
      { w: '+51999000001', n: 'Super Administrador' },
      { w: '+51999000002', n: 'Administrador' },
      { w: '+51999000003', n: 'Empleado Test' }
    ];
    
    let created = 0;
    for (const u of users) {
       try {
         await authClient.signUp.email({
           email: `${u.w}@inspira.local`,
           password: 'Prueba123!',
           name: u.n
         });
         created++;
       } catch (err) {
         // Silently ignore if already exists
       }
    }
    
    if (created > 0) {
      toast.success("Credenciales de prueba generadas exitosamente.");
    } else {
      toast.info("Las credenciales ya existían previamente.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-zinc-50 relative p-6">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

      <div className="w-full max-w-[440px] animate-in fade-in zoom-in-95 duration-700 fill-both relative z-10">
        
        <div className="flex flex-col items-center gap-2 mb-8 justify-center group">
          <div className="w-24 h-24 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
            <img src="/logo.jpg" alt="Inspira Logo" className="w-full h-full object-contain rounded-2xl shadow-sm" />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-zinc-200/60 p-8 sm:p-10 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.08)]">
          <div className="mb-8 text-center space-y-2">
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
              {path === 'sign-in' ? 'Acceso al Sistema' : 'Crear Cuenta'}
            </h1>
            <p className="text-zinc-500 text-sm font-medium">
              {path === 'sign-in' 
                ? 'Ingresa tu número de WhatsApp para continuar' 
                : 'Regístrate como empleado o administrador'}
            </p>
          </div>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            {path === 'sign-up' && (
              <div className="space-y-2">
                <Label>Nombre Completo</Label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                  <Input 
                    value={name} 
                    onChange={e => setName(e.target.value)} 
                    required 
                    className="pl-10 h-12 rounded-xl" 
                    placeholder="Ej. Juan Pérez" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label>Número de WhatsApp</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <Input 
                  value={whatsapp} 
                  onChange={e => setWhatsapp(e.target.value)} 
                  required 
                  className="pl-10 h-12 rounded-xl font-mono" 
                  placeholder="+51 999 000 000" 
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400" />
                <Input 
                  type="password"
                  value={password} 
                  onChange={e => setPassword(e.target.value)} 
                  required 
                  className="pl-10 h-12 rounded-xl" 
                  placeholder="••••••••" 
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="w-full h-12 mt-2 bg-blue-600 hover:bg-blue-700 rounded-xl text-md font-bold shadow-lg shadow-blue-600/20">
              {loading ? 'Procesando...' : (path === 'sign-in' ? 'Ingresar' : 'Registrarse')}
            </Button>
          </form>

          <div className="mt-8 text-center text-sm text-zinc-500 font-medium">
            {path === 'sign-in' ? (
              <p>
                ¿No tienes cuenta?{' '}
                <Link to="/auth/sign-up" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                  Regístrate aquí
                </Link>
              </p>
            ) : (
              <p>
                ¿Ya tienes una cuenta?{' '}
                <Link to="/auth/sign-in" className="text-blue-600 hover:text-blue-700 font-bold transition-colors">
                  Inicia Sesión
                </Link>
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mt-12">
        <Button variant="outline" onClick={generateTestCredentials} disabled={loading} className="border-amber-200 text-amber-700 hover:bg-amber-50 rounded-xl bg-white/50 backdrop-blur-sm">
          <ShieldAlert className="w-4 h-4 mr-2" />
          Generar Credenciales de Prueba
        </Button>
      </div>
    </div>
  );
}