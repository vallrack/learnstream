
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  Loader2, 
  CheckCircle2, 
  ArrowRight,
  Zap,
  Star,
  Award
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';
import Image from 'next/image';

export default function CheckoutPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const handlePayment = () => {
    if (!db || !user?.uid) return;
    
    setIsProcessing(true);
    
    // Simulamos un retraso de red de una pasarela real
    setTimeout(() => {
      updateDocumentNonBlocking(doc(db, 'users', user.uid), {
        isPremiumSubscriber: true,
        premiumUpdatedAt: new Date().toISOString()
      });
      setIsProcessing(false);
      setIsSuccess(true);
    }, 2500);
  };

  if (isUserLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  if (isSuccess) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center p-6">
          <Card className="max-w-md w-full rounded-[3rem] border-none shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-500">
            <div className="bg-emerald-600 p-12 text-center text-white">
              <div className="bg-white/20 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-md">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-headline font-bold mb-2">¡Pago Exitoso!</h2>
              <p className="opacity-80">Bienvenido a la experiencia Premium de LearnStream.</p>
            </div>
            <CardContent className="p-8 space-y-6 text-center">
              <p className="text-slate-600">Tu cuenta ha sido actualizada. Ahora tienes acceso ilimitado a todos los cursos, retos de IA y certificados oficiales.</p>
              <Button onClick={() => router.push('/dashboard')} className="w-full h-14 rounded-2xl text-lg font-bold gap-2 shadow-xl shadow-primary/20">
                Ir a mi Dashboard
                <ArrowRight className="h-5 w-5" />
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Columna Izquierda: Información del Plan */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-headline font-bold mb-4">Completa tu suscripción</h1>
              <p className="text-lg text-muted-foreground">Estás a un paso de desbloquear todo tu potencial técnico.</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Zap, title: "Acceso Ilimitado", desc: "Todos los cursos actuales y futuros." },
                { icon: Star, title: "Evaluación por IA", desc: "Feedback detallado en cada línea de código." },
                { icon: Award, title: "Certificados PRO", desc: "Diplomas verificados para tu LinkedIn." }
              ].map((feat, i) => (
                <div key={i} className="flex gap-4 p-4 bg-white rounded-2xl border border-slate-100 shadow-sm">
                  <div className="bg-primary/10 p-3 rounded-xl h-fit">
                    <feat.icon className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">{feat.title}</h4>
                    <p className="text-sm text-muted-foreground">{feat.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-slate-900 rounded-[2rem] text-white">
              <div className="flex justify-between items-center mb-4">
                <span className="text-slate-400">Total a pagar hoy:</span>
                <span className="text-3xl font-bold">$29.99<span className="text-sm font-normal opacity-60">/mes</span></span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Garantía de satisfacción de 30 días</p>
            </div>
          </div>

          {/* Columna Derecha: Formulario de Pago */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 p-8 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Detalles de Facturación
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="font-bold ml-1">Titular de la Tarjeta</Label>
                  <Input placeholder="Ej: Juan Pérez" className="rounded-xl h-12" />
                </div>
                
                <div className="space-y-2">
                  <Label className="font-bold ml-1">Número de Tarjeta</Label>
                  <div className="relative">
                    <Input placeholder="0000 0000 0000 0000" className="rounded-xl h-12 pr-12" />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-1">
                      <div className="w-8 h-5 bg-slate-200 rounded" />
                      <div className="w-8 h-5 bg-slate-200 rounded" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">Vencimiento</Label>
                    <Input placeholder="MM / YY" className="rounded-xl h-12" />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold ml-1">CVC</Label>
                    <Input placeholder="123" className="rounded-xl h-12" />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-slate-50 p-3 rounded-xl">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                Tus datos están protegidos con cifrado SSL de 256 bits.
              </div>

              <Button 
                onClick={handlePayment} 
                disabled={isProcessing}
                className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <Lock className="h-5 w-5 mr-2" />
                    Pagar $29.99 USD
                  </>
                )}
              </Button>
            </CardContent>
            <CardFooter className="bg-slate-50/50 p-6 flex flex-col gap-2">
              <p className="text-[10px] text-center text-muted-foreground leading-relaxed">
                Al confirmar el pago, aceptas los <span className="text-primary cursor-pointer hover:underline">términos de servicio</span>. Esta es una transacción segura procesada por el sistema de pagos de LearnStream.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
