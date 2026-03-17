'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { 
  ShieldCheck, 
  Loader2, 
  ArrowRight,
  Zap,
  Star,
  Award,
  CreditCard
} from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
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

  const handleStartPayment = () => {
    if (!user?.uid || !user.email) return;
    
    const publicKey = process.env.NEXT_PUBLIC_EPAYCO_PUBLIC_KEY;
    
    if (!publicKey) {
      toast({
        variant: "destructive",
        title: "Configuración incompleta",
        description: "Falta la llave pública de ePayco. Contacta al administrador.",
      });
      return;
    }

    setIsProcessing(true);

    // Cargar dinámicamente el script de ePayco
    const script = document.createElement('script');
    script.src = 'https://checkout.epayco.co/checkout.js';
    script.async = true;
    script.onload = () => {
      const handler = (window as any).ePayco.checkout.configure({
        key: publicKey,
        test: false // ACTIVADO: MODO REAL PARA RECIBIR DINERO
      });

      const data = {
        name: "LearnStream Premium - Acceso Ilimitado",
        description: "Acceso de por vida a todos los cursos y desafíos de IA",
        invoice: `LS-${Date.now()}`,
        currency: "cop",
        amount: "120000", // Valor en pesos colombianos ($120.000 COP)
        tax_base: "0",
        tax: "0",
        country: "co",
        lang: "es",
        external: "false",
        response: `${window.location.origin}/checkout/success`,
        name_billing: user.displayName || "Estudiante",
        email_billing: user.email,
        extra1: user.uid, // ID del estudiante para la activación automática
      };

      handler.open(data);
      setIsProcessing(false);
    };
    
    document.body.appendChild(script);
  };

  if (isUserLoading) return <div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          <div className="space-y-8">
            <div>
              <h1 className="text-4xl font-headline font-bold mb-4 text-slate-900">Potencia tu carrera en Colombia</h1>
              <p className="text-lg text-muted-foreground">Desbloquea herramientas profesionales con medios de pago locales a través de ePayco.</p>
            </div>

            <div className="space-y-4">
              {[
                { icon: Zap, title: "Pagos con Nequi y Daviplata", desc: "Usa tus billeteras digitales favoritas o PSE para activar tu cuenta al instante." },
                { icon: Star, title: "Evaluación por IA", desc: "Feedback detallado e insignias de maestría en tus retos de código." },
                { icon: Award, title: "Certificados de Valor", desc: "Diplomas verificados listos para compartir en tu portfolio profesional." }
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
                <span className="text-3xl font-bold">$120.000<span className="text-sm font-normal opacity-60"> COP</span></span>
              </div>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold">Un solo pago para acceso vitalicio</p>
            </div>
          </div>

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
                  <span className="text-slate-600 font-medium">Plan Premium Vitalicio</span>
                  <span className="font-bold">$120.000</span>
                </div>
                <div className="flex justify-between items-center pt-4">
                  <span className="text-xl font-headline font-bold">Total a pagar</span>
                  <span className="text-3xl font-headline font-bold">$120.000</span>
                </div>
              </div>

              <div className="space-y-4">
                <Button 
                  onClick={handleStartPayment} 
                  disabled={isProcessing}
                  className="w-full h-16 rounded-2xl text-xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] bg-primary"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Iniciando ePayco...
                    </>
                  ) : (
                    <>
                      Pagar con ePayco
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </>
                  )}
                </Button>
                
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Transacción procesada de forma segura por ePayco
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-slate-50/50 p-6 flex flex-col gap-4">
              <div className="flex flex-wrap justify-center gap-4 opacity-60 grayscale h-6">
                <img src="https://multimedia.epayco.co/epayco-landing/v2/pse.png" alt="PSE" className="h-full" />
                <img src="https://multimedia.epayco.co/epayco-landing/v2/nequi.png" alt="Nequi" className="h-full" />
                <img src="https://multimedia.epayco.co/epayco-landing/v2/daviplata.png" alt="Daviplata" className="h-full" />
                <img src="https://multimedia.epayco.co/epayco-landing/v2/efecty.png" alt="Efecty" className="h-full" />
              </div>
              <p className="text-[10px] text-center text-muted-foreground leading-relaxed px-4">
                Al pagar, aceptas nuestros <span className="text-primary cursor-pointer hover:underline">Términos de Servicio</span>. Tu acceso Premium se activará automáticamente una vez confirmado el pago.
              </p>
            </CardFooter>
          </Card>
        </div>
      </main>
    </div>
  );
}
