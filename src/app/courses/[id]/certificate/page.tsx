'use client';

import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { CourseCertificate } from '@/components/courses/CourseCertificate';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Download, Printer, Share2, Loader2, AlertCircle } from 'lucide-react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, where } from 'firebase/firestore';
import { useEffect, useState } from 'react';

export default function CertificatePage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const db = useFirestore();
  const { user, isUserLoading } = useUser();
  const [isPrinting, setIsPrinting] = useState(false);

  const courseRef = useMemoFirebase(() => {
    if (!db || !courseId) return null;
    return doc(db, 'courses', courseId);
  }, [db, courseId]);
  const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);

  const progressRef = useMemoFirebase(() => {
    if (!db || !user?.uid || !courseId) return null;
    return doc(db, 'users', user.uid, 'courseProgress', courseId);
  }, [db, user?.uid, courseId]);
  const { data: progress } = useDoc(progressRef);

  const modulesQuery = useMemoFirebase(() => {
    if (!db || !courseId) return null;
    return collection(db, 'courses', courseId, 'modules');
  }, [db, courseId]);
  const { data: modules } = useCollection(modulesQuery);

  const handlePrint = () => {
    window.print();
  };

  if (isUserLoading || isCourseLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!course || !progress || progress.status !== 'completed') {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
        <AlertCircle className="h-12 w-12 text-amber-500" />
        <h1 className="text-2xl font-bold">Certificado no disponible</h1>
        <p className="text-muted-foreground">Debes completar el 100% del curso para obtener tu certificación.</p>
        <Button onClick={() => router.back()}>Volver</Button>
      </div>
    );
  }

  const studentName = profile?.displayName || user?.displayName || user?.email?.split('@')[0] || 'Estudiante';
  const completionDate = progress?.completedAt ? new Date(progress.completedAt.toDate()).toLocaleDateString() : new Date().toLocaleDateString();

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col print:bg-white">
      <div className="print:hidden">
        <Navbar />
      </div>
      
      <main className="flex-1 flex flex-col items-center py-12 px-6">
        <div className="max-w-5xl w-full space-y-8 flex flex-col items-center">
          <header className="w-full flex items-center justify-between print:hidden">
            <Button variant="ghost" onClick={() => router.back()} className="rounded-xl gap-2">
              <ChevronLeft className="h-4 w-4" />
              Volver al Curso
            </Button>
            <div className="flex items-center gap-3">
              <Button variant="outline" className="rounded-xl gap-2" onClick={handlePrint}>
                <Printer className="h-4 w-4" />
                Imprimir / PDF
              </Button>
              <Button className="rounded-xl gap-2 shadow-lg shadow-primary/20">
                <Share2 className="h-4 w-4" />
                Compartir Logro
              </Button>
            </div>
          </header>

          <div className="w-full overflow-x-auto py-8 px-2 flex justify-center">
            <div className="min-w-[900px]">
              <CourseCertificate 
                studentName={studentName}
                courseTitle={course.title}
                technology={course.technology || 'General'}
                isPremium={!!profile?.isPremiumSubscriber}
                completionDate={completionDate}
                modulesCount={modules?.length || 0}
              />
            </div>
          </div>

          <section className="max-w-2xl text-center space-y-4 print:hidden">
            <h2 className="text-2xl font-headline font-bold">¡Felicidades por tu graduación!</h2>
            <p className="text-muted-foreground">
              Has demostrado compromiso y disciplina al finalizar este programa. Este certificado es un testimonio de tus nuevas habilidades técnicas en <strong>{course.technology}</strong>.
            </p>
          </section>
        </div>
      </main>

      <style jsx global>{`
        @media print {
          nav, footer, header, .print-hidden {
            display: none !important;
          }
          body {
            background: white !important;
          }
          .min-w-\[900px\] {
            min-width: 100% !important;
            padding: 0 !important;
            margin: 0 !important;
          }
        }
      `}</style>
    </div>
  );
}