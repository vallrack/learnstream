
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  ShieldCheck, 
  Lock, 
  Loader2, 
  ArrowRight,
  Zap,
  Star,
  Award,
  CreditCard
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { createCheckoutSession } from '@/app/actions/stripe';
import { useToast } from '@/hooks/use-toast';

export default function CheckoutPage() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  
  const [isProcessing, setIsProcessing] = useState(false);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
    if (profile?.isPremiumSubscriber) {
      router.push('/dashboard');
    }
  }, [user, isUserLoading, router, profile]);

  const handleStartPayment = async () => {
    if (!user?.uid || !user.email) return;
    
    setIsProcessing(true);
    try {
      const { url } = await createCheckoutSession(user.uid, user.email);
      if (url) {
        // Redirigir al Checkout seguro de Stripe
        window.location.href = url;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error de conexión",
        description: error.message || "Hubo un problema al conectar con la pasarela de pagos.",
      });
      setIsProcessing(false);
    }
  };

  if (isUserLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Columna Izquierda: Información del Plan */}
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-headline font-bold mb-4">Potencia tu carrera hoy</h1>
              <p className="text-lg text-muted-foreground">Estás a un paso de desbloquear todas las herramientas de nivel profesional.</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Zap, title: "Acceso Ilimitado", desc: "Todos los cursos actuales y futuros de la plataforma." },
                { icon: Star, title: "Evaluación por IA", desc: "Feedback detallado e insignias de maestría en tus retos." },
                { icon: Award, title: "Certificados de Valor", desc: "Diplomas verificados listos para compartir en LinkedIn." }
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
                <span className="text-slate-400">Inversión total:</span>
                <span className="text-3xl font-bold">$29.99<span className="text-sm font-normal opacity-60"> USD</span></span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Un solo pago para acceso ilimitado</p>
            </div>
          </div>

          {/* Columna Derecha: Resumen y Botón Stripe */}
          <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
            <CardHeader className="bg-slate-50 p-8 border-b">
              <CardTitle className="text-xl flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-primary" />
                Resumen de Orden
              </CardTitle>
            </CardHeader>
            <CardContent className="p-8 space-y-8">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-dashed">
                  <span className="text-slate-600 font-medium">Plan Premium Anual</span>
                  <span className="font-bold">$29.99</span>
                </div>
                <div className="flex justify-between items-center py-2 text-emerald-600 font-bold">
                  <span>Descuento Especial</span>
                  <span>-$0.00</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-xl font-headline font-bold">Total a pagar</span>
                  <span className="text-3xl font-headline font-bold">$29.99</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleStartPayment} 
                  disabled={isProcessing}
                  className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] bg-primary"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Conectando...
                    </>
                  ) : (
                    <>
                      Pagar con Stripe
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Transacción protegida por Stripe SSL
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 p-6 flex flex-col gap-2">
              <div className="flex justify-center gap-4 opacity-40 grayscale h-6 mb-2">
                <img src="https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_Inc._logo.svg" alt="Visa" className="h-full" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/2/2a/Mastercard-logo.svg" alt="Mastercard" className="h-full" />
                <img src="https://upload.wikimedia.org/wikipedia/commons/b/b5/PayPal.svg" alt="PayPal" className="h-full" />
              </div>
              <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-4">
                Al pagar, aceptas nuestros <span className="text-primary cursor-pointer hover:underline">Términos de Servicio</span>. Tu acceso Premium se activará inmediatamente después de la confirmación del banco.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
