
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
  ArrowLeft,
  UserCheck,
  UserX,
  ShieldAlert
} from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useMemoFirebase, useDoc, updateDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, doc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function AdminStudentsPage() {
  const db = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);

  const usersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'users'), orderBy('createdAt', 'desc'));
  }, [db]);
  const { data: students, isLoading } = useCollection(usersQuery);

  const coursesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'courses');
  }, [db]);
  const { data: allCourses } = useCollection(coursesQuery);

  // FILTRO CLAVE: 
  // 1. Solo mostramos usuarios registrados (con email).
  // 2. EXCLUIMOS a los administradores de la lista de gestión académica.
  const filteredStudents = students?.filter(s => 
    s.email && 
    s.role !== 'admin' &&
    (
      s.displayName?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.email?.toLowerCase().includes(searchTerm.toLowerCase())
    )
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
                  <h1 className="text-4xl font-headline font-bold">Gestión de Estudiantes</h1>
                </div>
                <p className="text-muted-foreground">Monitorea el progreso y activa/desactiva cuentas de estudiantes reales.</p>
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
                  <p className="text-muted-foreground font-medium">Cargando base de datos de estudiantes...</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-slate-50 border-none hover:bg-slate-50">
                      <TableHead className="pl-8 h-14">Estudiante</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead>Nivel</TableHead>
                      <TableHead>Registrado</TableHead>
                      <TableHead className="text-right pr-8">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStudents.length > 0 ? (
                      filteredStudents.map((student) => (
                        <TableRow key={student.id} className={`border-slate-100 group ${student.isActive === false ? 'opacity-60 grayscale' : ''}`}>
                          <TableCell className="pl-8 py-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10 border-2 border-slate-100">
                                <AvatarImage src={student.profileImageUrl} />
                                <AvatarFallback><UserCircle className="h-6 w-6" /></AvatarFallback>
                              </Avatar>
                              <div className="flex flex-col">
                                <span className="font-bold text-slate-900">{student.displayName || 'Estudiante'}</span>
                                <span className="text-xs text-muted-foreground">{student.email}</span>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            {student.isActive === false ? (
                              <Badge variant="destructive" className="rounded-lg gap-1">
                                <UserX className="h-3 w-3" /> Inactivo
                              </Badge>
                            ) : (
                              <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 rounded-lg gap-1">
                                <UserCheck className="h-3 w-3" /> Activo
                              </Badge>
                            )}
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
                            {student.createdAt ? new Date(student.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                          </TableCell>
                          <TableCell className="text-right pr-8">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="rounded-xl gap-2 h-10 group-hover:bg-primary group-hover:text-white transition-all"
                              onClick={() => setSelectedStudentId(student.id)}
                            >
                              Gestionar
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className="h-40 text-center text-muted-foreground">
                          No hay estudiantes registrados que coincidan con la búsqueda.
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
  
  const studentRef = useMemoFirebase(() => {
    if (!db || !studentId) return null;
    return doc(db, 'users', studentId);
  }, [db, studentId]);
  const { data: student } = useDoc(studentRef);

  const progressQuery = useMemoFirebase(() => {
    if (!db || !studentId) return null;
    return collection(db, 'users', studentId, 'courseProgress');
  }, [db, studentId]);
  const { data: enrollments, isLoading: isProgressLoading } = useCollection(progressQuery);

  const submissionsQuery = useMemoFirebase(() => {
    if (!db || !studentId) return null;
    return collection(db, 'users', studentId, 'challenge_submissions');
  }, [db, studentId]);
  const { data: submissions } = useCollection(submissionsQuery);

  const handleToggleStatus = (active: boolean) => {
    if (!db || !studentId) return;
    updateDocumentNonBlocking(doc(db, 'users', studentId), {
      isActive: active
    });
  };

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
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
                <span className="flex items-center gap-1.5"><Mail className="h-4 w-4" /> {student?.email}</span>
                {student?.isPremiumSubscriber && (
                  <Badge className="bg-amber-100 text-amber-700 border-amber-200">
                    <Crown className="h-3 w-3 mr-1" /> Premium
                  </Badge>
                )}
              </div>
            </div>
          </div>

          <Card className="rounded-2xl border-slate-200 bg-white p-4 flex items-center gap-4">
            <div className="flex flex-col">
              <Label className="text-xs font-bold uppercase text-muted-foreground mb-1">Estado de la Cuenta</Label>
              <span className={`text-sm font-bold ${student?.isActive !== false ? 'text-emerald-600' : 'text-rose-600'}`}>
                {student?.isActive !== false ? 'Cuenta Activa' : 'Cuenta Suspendida'}
              </span>
            </div>
            <Switch 
              checked={student?.isActive !== false} 
              onCheckedChange={handleToggleStatus}
              className="data-[state=checked]:bg-emerald-500"
            />
          </Card>
        </div>
      </header>

      {student?.isActive === false && (
        <div className="p-6 bg-rose-50 border border-rose-200 rounded-[2rem] flex items-center gap-4 text-rose-700">
          <ShieldAlert className="h-8 w-8 shrink-0" />
          <div>
            <p className="font-bold text-lg">Cuenta Inactiva</p>
            <p className="text-sm opacity-80">El acceso a los cursos para este estudiante ha sido revocado. El estudiante verá un mensaje de suspensión al intentar ingresar.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
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
                  <span className="text-sm font-medium text-slate-600">Certificados</span>
                </div>
                <span className="text-xl font-bold">{enrichedEnrollments.filter(e => e.status === 'completed').length}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="text-xl font-headline font-bold mb-6 flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Inscripciones Actuales
            </h3>
            
            <div className="space-y-4">
              {isProgressLoading ? (
                <div className="p-12 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
              ) : enrichedEnrollments.length > 0 ? (
                enrichedEnrollments.map((enr) => (
                  <Card key={enr.id} className="rounded-2xl border border-slate-100 shadow-sm bg-white overflow-hidden">
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
                  <p className="text-slate-500 italic text-sm">Sin inscripciones activas.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
