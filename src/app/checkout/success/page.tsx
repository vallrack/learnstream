
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle2, Loader2, ArrowRight, PartyPopper } from 'lucide-react';
import { useUser, useFirestore, updateDocumentNonBlocking } from '@/firebase';
import { doc } from 'firebase/firestore';

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>}>
      <SuccessContent />
    </Suspense>
  );
}

function SuccessContent() {
  const { user, isUserLoading } = useUser();
  const db = useFirestore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const [isActivating, setIsActivating] = useState(true);

  useEffect(() => {
    if (!isUserLoading && user?.uid && sessionId && db) {
      // Activar la suscripción Premium en Firestore tras el pago exitoso
      // Nota: En una app de producción esto se haría vía Webhook para mayor seguridad,
      // pero aquí lo hacemos en el cliente para cumplir con la arquitectura solicitada.
      updateDocumentNonBlocking(doc(db, 'users', user.uid), {
        isPremiumSubscriber: true,
        premiumUpdatedAt: new Date().toISOString(),
        lastStripeSessionId: sessionId
      });
      
      // Simular un tiempo de procesamiento visual
      const timer = setTimeout(() => {
        setIsActivating(false);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user, isUserLoading, sessionId, db]);

  if (isUserLoading || isActivating) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-6 text-center">
          <div className="bg-primary/10 p-8 rounded-full mb-6">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
          </div>
          <h1 className="text-3xl font-headline font-bold mb-2">Confirmando tu pago...</h1>
          <p className="text-muted-foreground">Estamos configurando tu acceso Premium. Solo tardará unos segundos.</p>
        </main>
      </div>
    );
  }

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
            <p className="opacity-80">Bienvenido a la comunidad Premium de LearnStream.</p>
          </div>
          <CardContent className="p-8 space-y-6 text-center">
            <div className="flex justify-center gap-2 text-primary font-bold">
              <PartyPopper className="h-5 w-5" />
              <span>Cuenta Activada</span>
            </div>
            <p className="text-slate-600">Ahora tienes acceso ilimitado a todos los cursos, evaluaciones por IA y certificados. ¡Es hora de empezar a aprender!</p>
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
