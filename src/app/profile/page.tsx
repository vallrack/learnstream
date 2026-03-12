
'use client';

import { useState, useEffect } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, CreditCard, Shield, Crown, CheckCircle, Loader2, Save, UserCircle, ShieldAlert } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useToast } from '@/hooks/use-toast';

export default function ProfilePage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  
  const { data: profile, isLoading: isProfileLoading } = useDoc(profileRef);
  
  const [displayName, setDisplayName] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName || '');
    }
  }, [profile]);

  const handleUpdateProfile = () => {
    if (!db || !user?.uid || !displayName.trim()) return;
    
    setSaving(true);
    updateDocumentNonBlocking(doc(db, 'users', user.uid), {
      displayName: displayName.trim()
    });
    
    // Simular un pequeño retardo para feedback visual
    setTimeout(() => {
      setSaving(false);
      toast({
        title: "Perfil actualizado",
        description: "Tu nombre ha sido guardado correctamente para futuros certificados.",
      });
    }, 500);
  };

  if (isUserLoading || isProfileLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center gap-4">
          <h1 className="text-2xl font-bold">Debes iniciar sesión</h1>
          <Button onClick={() => window.location.href = '/login'}>Ir al Login</Button>
        </main>
      </div>
    );
  }

  const isInactive = profile?.isActive === false;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        {isInactive && (
          <div className="mb-8 p-6 bg-rose-50 border border-rose-200 rounded-[2.5rem] flex items-center gap-4 text-rose-700">
            <ShieldAlert className="h-8 w-8 shrink-0" />
            <div>
              <p className="font-bold text-lg">Cuenta Suspendida</p>
              <p className="text-sm opacity-80">Tu cuenta está inactiva y el acceso a los cursos ha sido restringido. Contacta a soporte para más información.</p>
            </div>
          </div>
        )}

        <header className="mb-12 flex flex-col md:flex-row items-center gap-8 bg-white p-8 rounded-[3rem] border shadow-sm">
          <Avatar className="h-32 w-32 border-4 border-white shadow-2xl">
            <AvatarImage src={profile?.profileImageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-4xl font-bold">
              {displayName?.[0] || 'U'}
            </AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left flex-1 space-y-2">
            <h1 className="text-4xl font-headline font-bold text-slate-900">{displayName || 'Estudiante'}</h1>
            <p className="text-muted-foreground font-medium">{user.email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-2">
              {profile?.isPremiumSubscriber ? (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 gap-1 rounded-lg">
                  <Crown className="h-3 w-3" /> Miembro Premium
                </Badge>
              ) : (
                <Badge variant="outline" className="text-slate-500 rounded-lg">Miembro Estándar</Badge>
              )}
              {profile?.role === 'admin' && (
                <Badge className="bg-slate-900 text-white rounded-lg">Administrador</Badge>
              )}
            </div>
          </div>
        </header>

        <Tabs defaultValue="account" className="space-y-8">
          <TabsList className="bg-slate-200/50 p-1.5 rounded-2xl w-full md:w-fit">
            <TabsTrigger value="account" className="rounded-xl gap-2 px-6 h-11">
              <User className="h-4 w-4" /> Mi Cuenta
            </TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-xl gap-2 px-6 h-11">
              <CreditCard className="h-4 w-4" /> Suscripción
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-xl gap-2 px-6 h-11">
              <Shield className="h-4 w-4" /> Seguridad
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card className="rounded-[2.5rem] overflow-hidden border-none shadow-sm bg-white">
              <CardHeader className="bg-slate-50 p-8">
                <CardTitle className="text-2xl font-headline font-bold">Información Personal</CardTitle>
                <CardDescription>Actualiza tu nombre para que tus certificados se generen correctamente.</CardDescription>
              </CardHeader>
              <CardContent className="p-8 space-y-8">
                <div className="space-y-4 max-w-md">
                  <div className="space-y-2">
                    <Label htmlFor="fullname" className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Nombre Completo (Aparecerá en el diploma)</Label>
                    <div className="relative">
                      <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input 
                        id="fullname" 
                        placeholder="Ej: Daniel Morales" 
                        className="rounded-2xl h-12 pl-11 border-slate-200 focus:ring-primary shadow-sm"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                      />
                    </div>
                    <p className="text-[10px] text-muted-foreground ml-1">Por favor, usa tu nombre real y completo.</p>
                  </div>
                  
                  <div className="space-y-2">
                    <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Correo Electrónico (No editable)</Label>
                    <Input defaultValue={user.email || ''} disabled className="rounded-2xl h-12 bg-slate-50 border-slate-200 opacity-60" />
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-slate-50/50 p-8 flex justify-end">
                <Button 
                  onClick={handleUpdateProfile} 
                  disabled={saving || !displayName.trim()}
                  className="rounded-2xl h-12 px-8 gap-2 shadow-lg shadow-primary/20"
                >
                  {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  Guardar Perfil
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2 rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden">
                <CardHeader className="bg-slate-50 p-8">
                  <CardTitle className="text-2xl font-headline font-bold">Estado de Suscripción</CardTitle>
                  <CardDescription>Gestiona tu plan y beneficios premium.</CardDescription>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className={`p-8 rounded-[2rem] border-2 flex items-center justify-between ${profile?.isPremiumSubscriber ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                    <div>
                      <h4 className={`font-headline font-bold text-2xl mb-1 ${profile?.isPremiumSubscriber ? 'text-amber-700' : 'text-slate-700'}`}>
                        {profile?.isPremiumSubscriber ? 'Plan Premium Pro' : 'Plan Estándar (Gratis)'}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {profile?.isPremiumSubscriber ? 'Acceso ilimitado a todos los cursos y certificados.' : 'Acceso limitado a cursos gratuitos.'}
                      </p>
                    </div>
                    {profile?.isPremiumSubscriber && <Crown className="h-12 w-12 text-amber-500 opacity-20" />}
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-bold text-sm uppercase text-slate-500">Beneficios Activos:</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { text: "Acceso a cursos básicos", active: true },
                        { text: "Certificados de nivel fundamental", active: true },
                        { text: "Acceso a retos premium", active: !!profile?.isPremiumSubscriber },
                        { text: "Certificados de nivel profesional", active: !!profile?.isPremiumSubscriber },
                        { text: "Acceso vitalicio tras cierre", active: !!profile?.isPremiumSubscriber },
                        { text: "Soporte prioritario", active: !!profile?.isPremiumSubscriber },
                      ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-3 text-sm ${item.active ? 'text-slate-700' : 'text-slate-300'}`}>
                          <CheckCircle className={`h-4 w-4 ${item.active ? 'text-emerald-500' : 'text-slate-200'}`} />
                          {item.text}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
                {!profile?.isPremiumSubscriber && (
                  <CardFooter className="bg-slate-50 p-8">
                    <Button className="w-full h-14 rounded-2xl text-lg font-bold shadow-xl shadow-primary/20 bg-amber-500 hover:bg-amber-600">
                      Mejorar a Premium Ahora
                    </Button>
                  </CardFooter>
                )}
              </Card>

              <div className="space-y-6">
                <Card className="rounded-[2rem] border-none shadow-sm bg-white p-6">
                  <CardHeader className="px-0 pt-0">
                    <CardTitle className="text-base font-bold">Método de Pago</CardTitle>
                  </CardHeader>
                  <CardContent className="px-0 space-y-4">
                    <div className="p-4 border border-slate-100 rounded-2xl bg-slate-50 flex items-center gap-3">
                      <div className="w-10 h-6 bg-white border rounded flex items-center justify-center font-bold text-[8px] text-slate-400">TARJETA</div>
                      <span className="text-xs font-medium">No hay métodos asociados</span>
                    </div>
                    <Button variant="link" className="text-xs p-0 h-auto text-primary">Gestionar pagos →</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
