'use client';

import { useState, useEffect } from 'react';
import { useAuth, useUser, useFirestore } from '@/firebase';
import { signInWithEmailAndPassword, signInAnonymously, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, getDoc, serverTimestamp } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LogIn, UserCircle, Loader2, AlertCircle, UserPlus } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import Image from 'next/image';

export default function LoginPage() {
  const auth = useAuth();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const router = useRouter();
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ message: string; code?: string } | null>(null);

  useEffect(() => {
    if (user && !loading) {
      router.push('/dashboard');
    }
  }, [user, loading, router]);

  const syncUserProfile = async (authUser: any, nameOverride?: string) => {
    if (!firestore || !authUser) return;
    
    // CRÍTICO: No creamos documento en Firestore para usuarios anónimos (invitados)
    if (authUser.isAnonymous) return;

    // DEFINICIÓN DE ADMINISTRADORES
    const ADMIN_EMAILS = ['varrack67@gmail.com', 'vallrack67@gmail.com'];
    const isAdmin = ADMIN_EMAILS.includes(authUser.email?.toLowerCase());

    const userRef = doc(firestore, 'users', authUser.uid);
    try {
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) {
        setDocumentNonBlocking(userRef, {
          id: authUser.uid,
          displayName: nameOverride || authUser.email?.split('@')[0] || 'Usuario',
          email: authUser.email,
          profileImageUrl: authUser.photoURL || `https://picsum.photos/seed/${authUser.uid}/200/200`,
          createdAt: serverTimestamp(),
          isPremiumSubscriber: isAdmin, // El admin suele tener acceso total
          role: isAdmin ? 'admin' : 'student',
          isActive: true,
          xp: 0,
          level: 1
        }, { merge: true });
      } else {
        // Si ya existe pero el rol cambió por ser admin, actualizamos solo el rol
        if (isAdmin && userDoc.data()?.role !== 'admin') {
          setDocumentNonBlocking(userRef, { role: 'admin' }, { merge: true });
        }
      }
    } catch (e) {
      console.warn("Could not sync profile during login", e);
    }
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await syncUserProfile(userCredential.user);
      router.push('/dashboard');
    } catch (err: any) {
      let message = 'Error al iniciar sesión. Por favor, verifica tus datos.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        message = 'Credenciales inválidas. Verifica tu correo y contraseña.';
      }
      setError({ message, code: err.code });
      setLoading(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError({ message: 'Las contraseñas no coinciden.' });
      return;
    }
    if (password.length < 6) {
      setError({ message: 'La contraseña debe tener al menos 6 caracteres.' });
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      await updateProfile(userCredential.user, {
        displayName: displayName
      });

      await syncUserProfile(userCredential.user, displayName);
      
      router.push('/dashboard');
    } catch (err: any) {
      let message = 'Error al crear la cuenta.';
      if (err.code === 'auth/email-already-in-use') {
        message = 'Este correo electrónico ya está registrado.';
      } else if (err.code === 'auth/invalid-email') {
        message = 'El formato del correo electrónico no es válido.';
      }
      setError({ message, code: err.code });
      setLoading(false);
    }
  };

  const handleAnonymousLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInAnonymously(auth);
      router.push('/dashboard');
    } catch (err: any) {
      let message = 'Error al iniciar sesión como invitado.';
      setError({ message, code: err.code });
      setLoading(false);
    }
  };

  if (isUserLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const logoUrl = "https://drive.google.com/uc?export=view&id=16eSjcZhzvz1dGapFrNVFXSQ_kG4dyg0i";

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center w-24 h-24 mb-4 relative">
              <Image 
                src={logoUrl} 
                alt="LearnStream Logo" 
                fill 
                className="object-contain" 
              />
            </div>
            <h1 className="text-3xl font-headline font-bold">Bienvenido a LearnStream</h1>
            <p className="text-muted-foreground">Tu viaje de aprendizaje comienza aquí</p>
          </div>

          <Card className="border-border/50 shadow-xl rounded-3xl overflow-hidden">
            <Tabs defaultValue="login" className="w-full">
              <TabsList className="grid w-full grid-cols-2 rounded-none h-12 bg-muted/30">
                <TabsTrigger value="login" className="data-[state=active]:bg-background rounded-none font-bold">Ingresar</TabsTrigger>
                <TabsTrigger value="register" className="data-[state=active]:bg-background rounded-none font-bold">Registrarse</TabsTrigger>
              </TabsList>
              
              <CardContent className="pt-8 space-y-4">
                {error && (
                  <Alert variant="destructive" className="rounded-xl mb-4">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{error.message}</AlertDescription>
                  </Alert>
                )}

                <TabsContent value="login" className="mt-0 space-y-4">
                  <form onSubmit={handleEmailLogin} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email">Correo Electrónico</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        placeholder="tu@ejemplo.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password">Contraseña</Label>
                      <Input 
                        id="password" 
                        type="password" 
                        placeholder="Tu contraseña"
                        required 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl gap-2 font-bold" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
                      Iniciar Sesión
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="register" className="mt-0 space-y-4">
                  <form onSubmit={handleEmailRegister} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="reg-name">Nombre Completo</Label>
                      <Input 
                        id="reg-name" 
                        type="text" 
                        placeholder="Ej: Juan Pérez" 
                        required 
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="reg-email">Correo Electrónico</Label>
                      <Input 
                        id="reg-email" 
                        type="email" 
                        placeholder="tu@ejemplo.com" 
                        required 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="rounded-xl h-11"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="reg-password">Contraseña</Label>
                        <Input 
                          id="reg-password" 
                          type="password" 
                          placeholder="Mín. 6 caracteres"
                          required 
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="rounded-xl h-11"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reg-confirm">Confirmar</Label>
                        <Input 
                          id="reg-confirm" 
                          type="password" 
                          placeholder="Repite contraseña"
                          required 
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          className="rounded-xl h-11"
                        />
                      </div>
                    </div>
                    <Button type="submit" className="w-full h-11 rounded-xl gap-2 font-bold bg-primary hover:bg-primary/90" disabled={loading}>
                      {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                      Crear Cuenta Gratis
                    </Button>
                  </form>
                </TabsContent>

                <div className="relative py-4">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-[10px] font-bold uppercase tracking-widest">
                    <span className="bg-background px-4 text-muted-foreground">O también</span>
                  </div>
                </div>

                <Button 
                  variant="secondary" 
                  className="w-full h-11 rounded-xl gap-2 bg-secondary/50 hover:bg-secondary text-secondary-foreground font-bold"
                  onClick={handleAnonymousLogin}
                  disabled={loading}
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserCircle className="h-4 w-4" />}
                  Continuar como Invitado
                </Button>
              </CardContent>
              <CardFooter className="pb-8 justify-center">
                <p className="text-[10px] text-muted-foreground text-center px-6 leading-relaxed">
                  Al registrarte, aceptas nuestros términos de servicio y política de privacidad.
                </p>
              </CardFooter>
            </Tabs>
          </Card>
        </div>
      </main>
    </div>
  );
}
