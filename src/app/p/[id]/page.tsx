
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Loader2, Award, Code2, Terminal, Star, Crown, Trophy, Medal } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import Link from 'next/link';
import Image from 'next/image';

export default function PublicPortfolioPage() {
  const params = useParams();
  const studentId = params.id as string;
  const db = useFirestore();

  const studentRef = useMemoFirebase(() => {
    if (!db || !studentId) return null;
    return doc(db, 'users', studentId);
  }, [db, studentId]);
  const { data: student, isLoading: isStudentLoading } = useDoc(studentRef);

  const submissionsQuery = useMemoFirebase(() => {
    if (!db || !studentId) return null;
    return query(collection(db, 'users', studentId, 'challenge_submissions'), orderBy('submittedAt', 'desc'));
  }, [db, studentId]);
  const { data: submissions } = useCollection(submissionsQuery);

  const achievementsQuery = useMemoFirebase(() => {
    if (!db || !studentId) return null;
    return query(collection(db, 'users', studentId, 'achievements'), orderBy('unlockedAt', 'desc'));
  }, [db, studentId]);
  const { data: achievements } = useCollection(achievementsQuery);

  const logoUrl = "https://drive.google.com/uc?export=view&id=16eSjcZhzvz1dGapFrNVFXSQ_kG4dyg0i";

  if (isStudentLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#F8FAFC]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!student) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center bg-[#F8FAFC]">
        <h1 className="text-2xl font-bold">Perfil no encontrado</h1>
        <Link href="/"><Button>Volver al inicio</Button></Link>
      </div>
    );
  }

  const level = Math.floor((student.xp || 0) / 1000) + 1;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-slate-900 text-white pt-20 pb-32 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12"><Terminal className="h-64 w-64" /></div>
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 relative z-10">
          <Avatar className="h-40 w-40 border-8 border-white/10 shadow-2xl">
            <AvatarImage src={student.profileImageUrl} />
            <AvatarFallback className="bg-primary text-white text-5xl font-bold">{student.displayName?.[0]}</AvatarFallback>
          </Avatar>
          <div className="text-center md:text-left flex-1 space-y-4">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                <h1 className="text-4xl md:text-5xl font-headline font-bold">{student.displayName || 'Estudiante'}</h1>
                {student.isPremiumSubscriber && <Crown className="h-8 w-8 text-amber-400" />}
              </div>
              <p className="text-slate-400 text-lg">Talento Digital en LearnStream</p>
            </div>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
              <Badge className="bg-primary/20 text-primary border-primary/30 px-4 py-1.5 rounded-xl font-bold">Nivel {level}</Badge>
              <div className="flex items-center gap-2 text-sm text-slate-300">
                <Trophy className="h-4 w-4 text-amber-500" />
                <span className="font-bold">{student.xp || 0} XP Totales</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <Card className="rounded-[2.5rem] border-none shadow-xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b">
                <CardTitle className="text-xs font-bold uppercase tracking-widest text-slate-500">Logros de Maestría</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {achievements?.map(ach => (
                    <div key={ach.id} className="flex gap-3 items-center bg-amber-50 p-3 rounded-2xl border border-amber-100">
                      <div className="bg-amber-500 p-2 rounded-xl text-white shadow-sm">
                        <Medal className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-amber-700">Insignia</p>
                        <p className="text-xs font-bold leading-tight">{ach.title}</p>
                      </div>
                    </div>
                  ))}
                  {(!achievements || achievements.length === 0) && (
                    <p className="text-xs text-center text-muted-foreground italic py-4">Sin insignias aún.</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-headline font-bold mb-6 flex items-center gap-3">
                <Code2 className="h-6 w-6 text-primary" />
                Desafíos Superados
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {submissions?.filter(s => s.passed).map((sub) => (
                  <Card key={sub.id} className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-lg transition-all border border-slate-100">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex justify-between items-start mb-2">
                        <Badge className="bg-emerald-100 text-emerald-700">SUPERADO</Badge>
                        <span className="text-[10px] text-muted-foreground font-bold">{new Date(sub.submittedAt?.toDate()).toLocaleDateString()}</span>
                      </div>
                      <CardTitle className="text-lg font-headline font-bold line-clamp-1">{sub.challengeTitle}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6 pt-2">
                      <div className="flex items-center gap-2 mb-4">
                        <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
                        <span className="text-sm font-bold">{sub.score}/5.0</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-3 bg-slate-50 p-3 rounded-xl italic">
                        "{sub.feedback}"
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-20 text-center py-10 border-t bg-white">
        <p className="text-xs text-muted-foreground font-bold tracking-widest uppercase">Generado por LearnStream - La vida en un código</p>
      </footer>
    </div>
  );
}
