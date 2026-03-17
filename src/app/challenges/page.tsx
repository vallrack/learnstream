'use client';

import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Code2, Terminal, ArrowRight, Loader2, Sparkles, Layout, Lock, Unlock, LogIn, EyeOff } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useCollection, useFirestore, useMemoFirebase, useUser, useDoc } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import Link from 'next/link';
import { useState, useMemo } from 'react';

export default function ChallengesCataloguePage() {
  const db = useFirestore();
  const { user } = useUser();
  const [searchTerm, setSearchTerm] = useState('');

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);
  const isAdmin = profile?.role === 'admin';

  const progressQuery = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return collection(db, 'users', user.uid, 'courseProgress');
  }, [db, user?.uid]);
  const { data: userProgress } = useCollection(progressQuery);

  const enrolledCourseIds = useMemo(() => {
    return userProgress?.map(p => p.courseId) || [];
  }, [userProgress]);

  const challengesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'coding_challenges'), orderBy('createdAt', 'desc'));
  }, [db]);

  const { data: allChallenges, isLoading } = useCollection(challengesQuery);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Principiante': return 'bg-emerald-500/10 text-emerald-600 border-emerald-200';
      case 'Intermedio': return 'bg-amber-500/10 text-amber-600 border-amber-200';
      case 'Avanzado': return 'bg-rose-500/10 text-rose-600 border-rose-200';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  // FILTRADO CRÍTICO: 
  // 1. Desafíos Públicos (visibility === 'public' o undefined)
  // 2. Desafíos de cursos en los que el alumno está inscrito
  // 3. Admin ve todo
  const filteredChallenges = useMemo(() => {
    return allChallenges?.filter(challenge => {
      const isVisible = isAdmin || 
                        challenge.visibility === 'public' || 
                        !challenge.visibility ||
                        (challenge.visibility === 'private' && enrolledCourseIds.includes(challenge.courseId));
      
      const matchesSearch = challenge.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            challenge.technology?.toLowerCase().includes(searchTerm.toLowerCase());
      
      return isVisible && matchesSearch;
    }) || [];
  }, [allChallenges, isAdmin, enrolledCourseIds, searchTerm]);

  // Agrupar por tecnología
  const groupedChallenges = useMemo(() => {
    return filteredChallenges.reduce((acc, challenge) => {
      const tech = challenge.technology || 'Otros';
      if (!acc[tech]) acc[tech] = [];
      acc[tech].push(challenge);
      return acc;
    }, {} as Record<string, any[]>);
  }, [filteredChallenges]);

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-16 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-bold mb-6">
            <Sparkles className="h-4 w-4" />
            Supera tus límites técnicos
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold mb-6 text-foreground">Desafíos de Código</h1>
          <p className="text-lg text-muted-foreground mb-10 leading-relaxed">
            Pon a prueba tu lógica con retos públicos o exclusivos de tus cursos. 
            Solo verás desafíos de cursos en los que estés inscrito.
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input 
              placeholder="Busca por lenguaje o tema..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 rounded-2xl shadow-sm border-muted-foreground/20 focus:ring-primary bg-white" 
            />
          </div>
        </header>

        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="font-medium text-muted-foreground">Preparando los retos...</p>
          </div>
        ) : filteredChallenges.length > 0 ? (
          <div className="space-y-20">
            {Object.entries(groupedChallenges).map(([tech, techChallenges]) => (
              <section key={tech}>
                <div className="flex items-center gap-4 mb-8 border-b pb-4 border-slate-200">
                  <div className="bg-primary p-2.5 rounded-2xl shadow-lg shadow-primary/20">
                    {tech.includes('HTML') || tech.includes('CSS') || tech.includes('Figma')
                      ? <Layout className="h-6 w-6 text-white" />
                      : <Terminal className="h-6 w-6 text-white" />
                    }
                  </div>
                  <div>
                    <h2 className="text-2xl font-headline font-bold text-foreground">{tech}</h2>
                    <p className="text-sm text-muted-foreground">{techChallenges.length} {techChallenges.length === 1 ? 'desafío disponible' : 'desafíos disponibles'}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {techChallenges.map(challenge => {
                    const isPremium = !challenge.isFree;
                    const isCoursePrivate = challenge.visibility === 'private';

                    return (
                      <Card key={challenge.id} className="group rounded-[2.5rem] overflow-hidden border-slate-200 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 flex flex-col bg-white relative">
                        {isCoursePrivate && (
                          <div className="absolute top-4 left-4 z-10">
                            <Badge variant="secondary" className="bg-amber-100 text-amber-700 border-amber-200 text-[10px] font-bold gap-1 rounded-lg">
                              <Lock className="h-2.5 w-2.5" /> CURSO
                            </Badge>
                          </div>
                        )}
                        <CardHeader className="p-8 pb-4">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex gap-2 ml-auto">
                              <Badge variant="outline" className={`rounded-xl border ${getDifficultyColor(challenge.difficulty)}`}>
                                {challenge.difficulty}
                              </Badge>
                              {challenge.isFree ? (
                                <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 rounded-xl"><Unlock className="h-3 w-3 mr-1" /> Libre</Badge>
                              ) : (
                                <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 rounded-xl"><Lock className="h-3 w-3 mr-1" /> Premium</Badge>
                              )}
                            </div>
                          </div>
                          <CardTitle className="text-2xl font-headline font-bold line-clamp-1 group-hover:text-primary transition-colors text-foreground">
                            {challenge.title}
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-0 flex-1">
                          <p className="text-muted-foreground text-sm line-clamp-3 leading-relaxed mb-6">
                            {challenge.description}
                          </p>
                        </CardContent>
                        <CardFooter className="p-8 pt-0 mt-auto">
                          {isPremium && !user ? (
                            <Link href="/login" className="w-full">
                              <Button variant="outline" className="w-full h-12 rounded-2xl gap-2 font-bold border-amber-200 text-amber-700 hover:bg-amber-50">
                                <LogIn className="h-4 w-4" />
                                Ingresa para Acceder
                              </Button>
                            </Link>
                          ) : (
                            <Button className="w-full h-12 rounded-2xl gap-2 font-bold group-hover:bg-primary transition-all shadow-lg shadow-transparent group-hover:shadow-primary/20" asChild>
                              <Link href={`/challenges/${challenge.id}`}>
                                Aceptar Desafío
                                <ArrowRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                        </CardFooter>
                      </Card>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-muted/20 rounded-[3rem] border-4 border-dashed max-w-2xl mx-auto flex flex-col items-center">
            <EyeOff className="h-12 w-12 text-muted-foreground opacity-20 mb-4" />
            <p className="text-muted-foreground font-medium">No hay desafíos visibles para ti en este momento.</p>
            <p className="text-xs text-muted-foreground mt-2">Inscríbete en cursos para desbloquear sus retos exclusivos.</p>
            <Link href="/courses" className="mt-6"><Button variant="outline">Explorar Cursos</Button></Link>
          </div>
        )}
      </main>
    </div>
  );
}