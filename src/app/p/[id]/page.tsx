
'use client';

import { useParams } from 'next/navigation';
import { useDoc, useFirestore, useMemoFirebase, useCollection } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { Loader2, Award, Code2, Terminal, Star, Crown, Trophy, Medal, MapPin, ExternalLink, Globe, ShieldCheck, Stars } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
        <div className="bg-white p-12 rounded-[3rem] border shadow-xl">
          <ShieldCheck className="h-16 w-16 text-slate-200 mx-auto mb-6" />
          <h1 className="text-2xl font-bold font-headline text-slate-900">Perfil no encontrado</h1>
          <p className="text-muted-foreground mb-8">El usuario solicitado no existe o su perfil es privado.</p>
          <Link href="/"><Button className="rounded-xl px-8">Volver a LearnStream</Button></Link>
        </div>
      </div>
    );
  }

  const level = Math.floor((student.xp || 0) / 1000) + 1;
  const xpProgress = (student.xp || 0) % 1000;

  return (
    <div className="min-h-screen bg-[#F8FAFC] pb-20">
      <header className="bg-slate-900 text-white pt-24 pb-40 px-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-20 opacity-5 rotate-12 pointer-events-none">
          <Terminal className="h-96 w-96" />
        </div>
        <div className="absolute bottom-0 left-0 p-20 opacity-5 -rotate-12 pointer-events-none">
          <Stars className="h-64 w-64 text-amber-400" />
        </div>
        
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center gap-10 relative z-10">
          <div className="relative">
            <Avatar className="h-48 w-48 border-8 border-white/10 shadow-2xl">
              <AvatarImage src={student.profileImageUrl} className="object-cover" />
              <AvatarFallback className="bg-primary text-white text-6xl font-bold">{student.displayName?.[0]}</AvatarFallback>
            </Avatar>
            {student.isPremiumSubscriber && (
              <div className="absolute -top-4 -right-4 bg-amber-400 text-slate-900 p-3 rounded-2xl shadow-xl border-4 border-slate-900 animate-bounce">
                <Crown className="h-6 w-6" />
              </div>
            )}
          </div>

          <div className="text-center md:text-left flex-1 space-y-6">
            <div>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mb-3">
                <h1 className="text-5xl md:text-6xl font-headline font-bold tracking-tight">{student.displayName || 'Estudiante'}</h1>
                <Badge className="bg-emerald-500 text-white border-none rounded-xl px-4 py-1 font-bold h-auto flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4" /> Perfil Verificado
                </Badge>
              </div>
              <p className="text-slate-400 text-xl font-medium max-w-xl">Talento Digital en formación dentro de la comunidad LearnStream.</p>
            </div>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-6">
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Nivel Actual</p>
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-black text-amber-400">{level}</span>
                  <div className="w-32 h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-400" style={{ width: `${xpProgress / 10}%` }} />
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Experiencia Total</p>
                <div className="flex items-center gap-2">
                  <Trophy className="h-6 w-6 text-amber-400" />
                  <span className="text-2xl font-bold">{student.xp || 0} XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 -mt-20 relative z-20">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          <div className="lg:col-span-1 space-y-8">
            <Card className="rounded-[3rem] border-none shadow-2xl bg-white overflow-hidden">
              <CardHeader className="bg-slate-50 border-b p-8">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-slate-500 flex items-center gap-2">
                  <Medal className="h-4 w-4 text-primary" />
                  Logros de Maestría
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <div className="space-y-4">
                  {achievements?.map(ach => (
                    <div key={ach.id} className="flex gap-4 items-center bg-amber-50/50 p-4 rounded-3xl border border-amber-100 group hover:bg-amber-100 transition-colors">
                      <div className="bg-amber-500 p-3 rounded-2xl text-white shadow-lg group-hover:scale-110 transition-transform">
                        <Medal className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-amber-700">Insignia IA</p>
                        <p className="text-sm font-bold leading-tight text-slate-900">{ach.title}</p>
                        <p className="text-[10px] text-amber-600 font-medium mt-0.5">{ach.description}</p>
                      </div>
                    </div>
                  ))}
                  {(!achievements || achievements.length === 0) && (
                    <div className="text-center py-10 space-y-3">
                      <Stars className="h-10 w-10 text-slate-200 mx-auto" />
                      <p className="text-xs text-muted-foreground font-medium italic px-4">Superando retos con excelencia (4.5+) se desbloquean insignias aquí.</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-[3rem] border-none shadow-sm bg-white p-8 space-y-6">
              <h3 className="font-bold text-slate-900">Sobre este talento</h3>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Globe className="h-4 w-4 text-primary" />
                  <span>Portafolio Verificado en LearnStream</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-slate-600">
                  <Award className="h-4 w-4 text-primary" />
                  <span>Miembro desde {student.createdAt ? new Date(student.createdAt.toDate()).getFullYear() : '2024'}</span>
                </div>
              </div>
              <Button variant="outline" className="w-full rounded-2xl gap-2 font-bold h-12" asChild>
                <Link href="/login">
                  Únete a LearnStream
                  <ExternalLink className="h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-10">
            <section>
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-3xl font-headline font-bold text-slate-900 flex items-center gap-3">
                  <Code2 className="h-8 w-8 text-primary" />
                  Desafíos Superados
                </h2>
                <span className="bg-white px-4 py-1.5 rounded-full border shadow-sm text-xs font-bold text-slate-500">
                  {submissions?.filter(s => s.passed).length || 0} Proyectos
                </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {submissions?.filter(s => s.passed).map((sub) => (
                  <Card key={sub.id} className="rounded-[2.5rem] border-none shadow-sm bg-white overflow-hidden group hover:shadow-xl transition-all border border-slate-100 flex flex-col">
                    <CardHeader className="p-8 pb-4">
                      <div className="flex justify-between items-start mb-4">
                        <Badge className="bg-emerald-100 text-emerald-700 border-none px-3 py-1 rounded-lg text-[10px] font-black tracking-widest uppercase">SUPERADO</Badge>
                        <span className="text-[10px] text-slate-400 font-bold">{new Date(sub.submittedAt?.toDate()).toLocaleDateString()}</span>
                      </div>
                      <CardTitle className="text-xl font-headline font-bold line-clamp-2 text-slate-900 group-hover:text-primary transition-colors">
                        {sub.challengeTitle}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="p-8 pt-2 flex-1 flex flex-col justify-between">
                      <div className="flex items-center gap-2 mb-6">
                        <div className="flex">
                          {[1,2,3,4,5].map(i => (
                            <Star key={i} className={`h-4 w-4 ${i <= Math.round(sub.score) ? 'text-amber-400 fill-amber-400' : 'text-slate-200'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-black text-slate-900 ml-1">{sub.score.toFixed(1)}/5.0</span>
                      </div>
                      <div className="bg-slate-50 p-5 rounded-[1.5rem] border border-slate-100">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Evaluación del Tutor IA</p>
                        <p className="text-xs text-slate-600 leading-relaxed italic font-medium">
                          "{sub.feedback}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {(!submissions || submissions.filter(s => s.passed).length === 0) && (
                  <div className="col-span-full py-20 text-center bg-white rounded-[3rem] border-4 border-dashed border-slate-100">
                    <ShieldCheck className="h-12 w-12 text-slate-200 mx-auto mb-4" />
                    <p className="text-slate-400 font-bold">Sin desafíos públicos todavía.</p>
                  </div>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      <footer className="mt-20 text-center py-12 border-t bg-white">
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="relative w-8 h-8">
            <Image src={logoUrl} alt="Logo" fill className="object-contain" />
          </div>
          <span className="font-headline font-bold text-lg">LearnStream Portfolio</span>
        </div>
        <p className="text-[10px] text-muted-foreground font-black tracking-[0.3em] uppercase">Validado por Inteligencia Artificial Académica</p>
      </footer>
    </div>
  );
}
