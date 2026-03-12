
'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  BookOpen, 
  ChevronRight, 
  Loader2, 
  UserCircle,
  Crown,
  Trophy,
  Filter,
  ArrowLeft
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminStudentsPage() {
  const router = useRouter();
  const db = useFirestore();
  const { user: currentUser } = useUser();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  // 1. Obtener todos los usuarios
  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: students, isLoading } = useCollection(usersQuery);

  // 2. Obtener todos los cursos para referencia
  const coursesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'courses');
  }, [db]);
  const { data: allCourses } = useCollection(coursesQuery);

  const filteredStudents = students?.filter(s => 
    s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.email?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        {selectedStudentId ? (
          <StudentDetailView 
            studentId={selectedStudentId} 
            allCourses={allCourses || []} 
            onBack={() => setSelectedStudentId(null)} 
          />
        ) : (
          <>
            <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="bg-primary/10 p-2.5 rounded-2xl">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <h1 className="text-4xl font-headline font-bold">Gestión de Alumnos</h1>
                </div>
                <p className="text-muted-foreground">Monitorea el progreso y las inscripciones de tus estudiantes.</p>
              </div>
              
              <div className="relative w-full md:w-80">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar por nombre o email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 rounded-xl h-11 border-slate-200"
                />
              </div>
            </header>

            <div className="bg-white rounded-[2.5rem] border shadow-sm overflow-hidden">
              {isLoading ? (
                <div className="p-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                  <p className="text-muted-foreground font-medium">Cargando base de datos de alumnos...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-none hover:bg-slate-50">
                      <TableHead className="pl-8 h-14">Estudiante</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Registrado el</TableHead>
                      <TableHead>Rol</TableHead>
                      <TableHead className="text-right pr-8">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.map((student) => (
                      <TableRow key={student.id} className="border-slate-100 group">
                        <TableCell className="pl-8 py-4">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-10 w-10 border-2 border-slate-100">
                              <AvatarImage src={student.profileImageUrl} />
                              <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-900">{student.displayName || 'Estudiante'}</span>
                              <span className="text-xs text-muted-foreground">{student.email || 'Modo Invitado'}</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {student.isPremiumSubscriber ? (
                            <Badge className="bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-100 gap-1 rounded-lg">
                              <Crown className="h-3 w-3" /> Premium
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-slate-500 rounded-lg">Estándar</Badge>
                          )}
                        </TableCell>
                        <TableCell className="text-slate-500 text-sm">
                          {student.createdAt ? new Date(student.createdAt.toDate()).toLocaleDateString() : 'Desconocido'}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="rounded-lg capitalize">{student.role || 'Estudiante'}</Badge>
                        </TableCell>
                        <TableCell className="text-right pr-8">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="rounded-xl gap-2 h-10 group-hover:bg-primary group-hover:text-white transition-all"
                            onClick={() => setSelectedStudentId(student.id)}
                          >
                            Ver Progreso
                            <ChevronRight className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {filteredStudents.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="py-20 text-center text-muted-foreground">
                          No se encontraron estudiantes que coincidan con la búsqueda.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  );
}

function StudentDetailView({ studentId, allCourses, onBack }: { studentId: string, allCourses: any[], onBack: () => void }) {
  const db = useFirestore();
  
  // 1. Perfil del estudiante
  const studentRef = useMemoFirebase(() => {
    if (!db || !studentId) return null;
    return doc(db, 'users', studentId);
  }, [db, studentId]);
  const { data: student } = useDoc(studentRef);

  // 2. Progreso en cursos (Inscripciones)
  const progressQuery = useMemoFirebase(() => {
    if (!db || !studentId) return null;
    return collection(db, 'users', studentId, 'courseProgress');
  }, [db, studentId]);
  const { data: enrollments, isLoading: isProgressLoading } = useCollection(progressQuery);

  // 3. Desafíos realizados
  const submissionsQuery = useMemoFirebase(() => {
    if (!db || !studentId) return null;
    return collection(db, 'users', studentId, 'challenge_submissions');
  }, [db, studentId]);
  const { data: submissions } = useCollection(submissionsQuery);

  const enrichedEnrollments = enrollments?.map(enr => {
    const course = allCourses.find(c => c.id === enr.courseId);
    return { ...enr, course };
  }).filter(e => e.course) || [];

  return (
    <div className="space-y-12 animate-in fade-in slide-in-from-right-4 duration-500">
      <header className="flex flex-col gap-6">
        <Button variant="ghost" onClick={onBack} className="w-fit -ml-4 gap-2 text-muted-foreground hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />
          Volver a Estudiantes
        </Button>
        
        <div className="flex items-center gap-6">
          <Avatar className="h-24 w-24 border-4 border-white shadow-xl">
            <AvatarImage src={student?.profileImageUrl} />
            <AvatarFallback className="bg-primary/10 text-primary text-3xl font-bold">
              {student?.displayName?.[0] || 'E'}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h2 className="text-4xl font-headline font-bold text-slate-900">{student?.displayName || 'Estudiante'}</h2>
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {student?.email || 'Modo Invitado'}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> Registrado: {student?.createdAt ? new Date(student.createdAt.toDate()).toLocaleDateString() : 'N/A'}</span>
              {student?.isPremiumSubscriber && (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                  <Crown className="h-3 w-3 mr-1" /> Miembro Premium
                </Badge>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Estadísticas Rápidas */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="rounded-[2rem] border-none shadow-sm bg-white overflow-hidden">
            <CardHeader className="bg-slate-50 border-b">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Resumen Académico</CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-xl"><BookOpen className="h-5 w-5 text-blue-600" /></div>
                  <span className="text-sm font-medium text-slate-600">Cursos Inscritos</span>
                </div>
                <span className="text-xl font-bold">{enrichedEnrollments.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-emerald-100 p-2 rounded-xl"><Trophy className="h-5 w-5 text-emerald-600" /></div>
                  <span className="text-sm font-medium text-slate-600">Cursos Finalizados</span>
                </div>
                <span className="text-xl font-bold">{enrichedEnrollments.filter(e => e.status === 'completed').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-xl"><Trophy className="h-5 w-5 text-purple-600" /></div>
                  <span className="text-sm font-medium text-slate-600">Desafíos Completados</span>
                </div>
                <span className="text-xl font-bold">{submissions?.length || 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Listado de Inscripciones */}
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Inscripciones por Curso
            </h3>
            
            <div className="space-y-4">
              {isProgressLoading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : enrichedEnrollments.length > 0 ? (
                enrichedEnrollments.map((enr) => (
                  <Card key={enr.id} className="rounded-2xl border border-slate-100 shadow-sm bg-white hover:border-primary/20 transition-all overflow-hidden">
                    <CardContent className="p-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <h4 className="font-bold text-lg text-slate-900">{enr.course.title}</h4>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="rounded-lg text-[10px] h-5">{enr.course.technology}</Badge>
                            {enr.status === 'completed' ? (
                              <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200 text-[10px] h-5">Finalizado</Badge>
                            ) : (
                              <Badge className="bg-blue-100 text-blue-700 border-blue-200 text-[10px] h-5">En Progreso</Badge>
                            )}
                          </div>
                        </div>
                        <div className="w-full sm:w-48 space-y-2">
                          <div className="flex justify-between text-xs font-bold text-slate-500">
                            <span>Progreso</span>
                            <span>{Math.round(enr.progressPercentage || 0)}%</span>
                          </div>
                          <Progress value={enr.progressPercentage || 0} className="h-2 bg-slate-100" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))
              ) : (
                <div className="p-12 text-center bg-slate-50 rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-500 italic text-sm">Este estudiante aún no se ha inscrito en ningún curso.</p>
                </div>
              )}
            </div>
          </section>

          {/* Desafíos */}
          <section>
             <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              Resultados en Desafíos
            </h3>
            <div className="bg-white border rounded-2xl overflow-hidden shadow-sm">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50/50">
                    <TableHead>Desafío</TableHead>
                    <TableHead>Puntaje</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead className="text-right">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions?.map((sub) => (
                    <TableRow key={sub.id}>
                      <TableCell className="font-bold text-sm">{sub.challengeTitle}</TableCell>
                      <TableCell>
                         <div className="flex items-center gap-2">
                           <span className={`font-bold ${sub.score >= 4 ? 'text-emerald-600' : 'text-slate-900'}`}>{sub.score}/5</span>
                         </div>
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {sub.submittedAt ? new Date(sub.submittedAt.toDate()).toLocaleDateString() : 'N/A'}
                      </TableCell>
                      <TableCell className="text-right">
                        {sub.passed ? (
                          <Badge className="bg-emerald-500 text-white border-none rounded-lg text-[10px] h-5">Aprobado</Badge>
                        ) : (
                          <Badge className="bg-rose-500 text-white border-none rounded-lg text-[10px] h-5">Fallido</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                  {(!submissions || submissions.length === 0) && (
                    <TableRow>
                      <TableCell colSpan={4} className="py-8 text-center text-muted-foreground italic text-xs">
                        Sin intentos registrados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
