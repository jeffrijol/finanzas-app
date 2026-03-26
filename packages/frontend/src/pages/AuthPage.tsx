import { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useAuth } from '@/providers/AuthProvider';
import { useAuthRateLimit } from '@/hooks/useAuthRateLimit';
import { PasswordStrengthMeter } from '@/components/auth/PasswordStrengthMeter';

export function AuthPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const { canAttempt, recordAttempt, formatRemainingTime, attemptsLeft } = useAuthRateLimit();

  // Redirect if already logged in
  if (user) {
    navigate('/dashboard');
    return null;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Configurar persistencia según "Remember Me"
      if (!rememberMe) {
         // Nota: Supabase usa localStorage por defecto. 
         // Para "session only" necesitaríamos configurar el cliente con sessionStorage,
         // pero eso es global. Por ahora, confiamos en el default de Supabase.
         // Una implementación estricta requeriría re-inicializar el cliente 
         // o usar cookies de sesión.
      }

      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      // Record successful login
      recordAttempt(true);
      navigate('/dashboard');
    } catch (error: any) {
      // Record failed login attempt
      recordAttempt(false);
      
      // Check if it's a rate limit error from backend
      const is429 = error.message?.includes('429') || error.status === 429;
      
      toast({
        title: "Error al iniciar sesión",
        description: is429 
          ? "Demasiados intentos. El servidor te ha bloqueado temporalmente."
          : error.message || "Credenciales incorrectas",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (error) throw error;

      toast({
        title: "Registro exitoso",
        description: "Revisa tu correo electrónico para verificar tu cuenta.",
      });
    } catch (error: any) {
      toast({
        title: "Error en el registro",
        description: error.message,
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const defaultTab = searchParams.get('mode') === 'register' ? 'register' : 'login';

  return (
    <div className="container relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0 bg-slate-50">
      
      {/* Left Panel: Branding / Visual */}
      <div className="relative hidden h-full flex-col bg-muted p-10 text-white lg:flex dark:border-r">
        <div className="absolute inset-0 bg-slate-900" />
        <div className="relative z-20 flex items-center text-lg font-medium">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-2 h-6 w-6"
          >
            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
          </svg>
          Finanzas App
        </div>
        <div className="relative z-20 mt-auto">
          <blockquote className="space-y-2">
            <p className="text-lg">
              &ldquo;El control de tus finanzas es el primer paso hacia la libertad. Esta plataforma me ha ayudado a entender y optimizar mis gastos como nunca antes.&rdquo;
            </p>
            <footer className="text-sm">Sofia Davis</footer>
          </blockquote>
        </div>
      </div>

      {/* Right Panel: Auth Forms */}
      <div className="lg:p-8 flex items-center justify-center h-full">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">
              Bienvenido de nuevo
            </h1>
            <p className="text-sm text-muted-foreground">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <Tabs defaultValue={defaultTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Iniciar sesión</TabsTrigger>
              <TabsTrigger value="register">Registrarse</TabsTrigger>
            </TabsList>

            <TabsContent value="login">
              <Card>
                <CardHeader>
                  <CardTitle>Login</CardTitle>
                  <CardDescription>
                    Entra a tu cuenta para ver tu dashboard.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {!canAttempt && (
                    <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive mb-4">
                      <p className="font-semibold">Demasiados intentos fallidos</p>
                      <p className="text-xs mt-1">
                        Espera {formatRemainingTime()} antes de intentar nuevamente.
                      </p>
                    </div>
                  )}
                  <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="nombre@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                      />
                    </div>
                    <Link
                      to="/auth/forgot-password"
                      className="text-sm text-muted-foreground hover:text-primary transition-colors"
                    >
                      ¿Olvidaste tu contraseña?
                    </Link>
                    <div className="flex items-center space-x-2">
                        <Checkbox 
                            id="remember" 
                            checked={rememberMe} 
                            onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                        />
                        <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
                            Mantener sesión iniciada
                        </Label>
                    </div>
                    <Button type="submit" className="w-full" disabled={loading || !canAttempt}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      {!canAttempt ? `Bloqueado (${formatRemainingTime()})` : 'Entrar'}
                    </Button>
                    {canAttempt && attemptsLeft < 3 && (
                      <p className="text-xs text-muted-foreground text-center">
                        {attemptsLeft} intento{attemptsLeft !== 1 ? 's' : ''} restante{attemptsLeft !== 1 ? 's' : ''}
                      </p>
                    )}
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="register">
              <Card>
                <CardHeader>
                  <CardTitle>Registro</CardTitle>
                  <CardDescription>
                    Crea una cuenta nueva. Recibirás un email de confirmación.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <form onSubmit={handleRegister} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="rg-email">Email</Label>
                      <Input 
                        id="rg-email" 
                        type="email" 
                        placeholder="nombre@ejemplo.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="rg-password">Contraseña</Label>
                      <Input 
                        id="rg-password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required 
                        minLength={8}
                      />
                      <PasswordStrengthMeter password={password} className="mt-2" />
                    </div>
                    <Button type="submit" className="w-full" disabled={loading}>
                      {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                      Registrarse
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          <p className="px-8 text-center text-sm text-muted-foreground">
            Al continuar, aceptas nuestros{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Términos de Servicio
            </a>{" "}
            y{" "}
            <a href="#" className="underline underline-offset-4 hover:text-primary">
              Política de Privacidad
            </a>
            .
          </p>
        </div>
      </div>
    </div>
  );
}
