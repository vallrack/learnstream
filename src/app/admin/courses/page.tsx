
'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, BookOpen, Loader2, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc, Timestamp } from 'firebase/firestore';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TECH_STACK } from '@/lib/languages';
import Link from 'next/link';

export default function AdminCoursesPage() {
  const { user } = useUser();
  const db = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCourseId, setEditingCourseId] = useState<string | null>(null);
  
  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);
  const isAdmin = profile?.role === 'admin';

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [technology, setTechnology] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewVideoUrl, setPreviewVideoUrl] = useState('');
  const [isFree, setIsFree] = useState(true);
  const [closingDate, setClosingDate] = useState('');
  const [isActive, setIsActive] = useState(true);

  const coursesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'courses');
  }, [db]);

  const { data: courses, isLoading } = useCollection(coursesQuery);

  const resetForm = () => {
    setEditingCourseId(null);
    setTitle('');
    setDescription('');
    setCategory('');
    setTechnology('');
    setImageUrl('');
    setPreviewVideoUrl('');
    setIsFree(true);
    setClosingDate('');
    setIsActive(true);
  };

  const handleEditClick = (course: any) => {
    setEditingCourseId(course.id);
    setTitle(course.title || '');
    setDescription(course.description || '');
    setCategory(course.category || '');
    setTechnology(course.technology || '');
    setImageUrl(course.thumbnailDataUrl || course.imageUrl || '');
    setPreviewVideoUrl(course.previewVideoUrl || '');
    setIsFree(course.isFree ?? true);
    setIsActive(course.isActive ?? true);
    
    if (course.closingDate) {
      const date = course.closingDate instanceof Timestamp ? course.closingDate.toDate() : new Date(course.closingDate);
      setClosingDate(date.toISOString().split('T')[0]);
    } else {
      setClosingDate('');
    }
    
    setIsDialogOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !user) return;

    const courseData: any = {
      title,
      description,
      category,
      technology,
      isFree,
      isActive,
      previewVideoUrl,
      updatedAt: serverTimestamp(),
    };

    if (closingDate) {
      courseData.closingDate = Timestamp.fromDate(new Date(closingDate));
    } else {
      courseData.closingDate = null;
    }

    if (imageUrl) {
      if (imageUrl.startsWith('data:')) {
        courseData.thumbnailDataUrl = imageUrl;
      } else {
        courseData.imageUrl = imageUrl;
      }
    }

    if (editingCourseId) {
      updateDocumentNonBlocking(doc(db, 'courses', editingCourseId), courseData);
    } else {
      courseData.instructorId = user.uid;
      courseData.instructorName = user.displayName || user.email;
      courseData.createdAt = serverTimestamp();
      if (!courseData.imageUrl && !courseData.thumbnailDataUrl) {
        courseData.imageUrl = `https://picsum.photos/seed/${Math.random()}/800/450`;
      }
      addDocumentNonBlocking(collection(db, 'courses'), courseData);
    }
    
    setIsDialogOpen(false);
    resetForm();
  };

  const handleDeleteCourse = (courseId: string) => {
    if (!db || !isAdmin) return;
    if (confirm('¿Estás seguro de que quieres eliminar este curso permanentemente?')) {
      deleteDocumentNonBlocking(doc(db, 'courses', courseId));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-headline font-bold mb-2 text-foreground">Gestionar Cursos</h1>
            <p className="text-muted-foreground">Crea, organiza y establece fechas de cierre para tus cursos.</p>
          </div>
          
          <div className="flex gap-3">
            <Link href="/admin/students">
              <Button variant="outline" className="rounded-xl h-11 gap-2">
                <Users className="h-4 w-4" />
                Gestión de Alumnos
              </Button>
            </Link>
            <Dialog open={isDialogOpen} onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}>
              <DialogTrigger asChild>
                <Button onClick={() => resetForm()} className="bg-primary hover:bg-primary/90 gap-2 rounded-xl h-11">
                  <Plus className="h-4 w-4" />
                  Crear Nuevo Curso
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[650px] rounded-3xl max-h-[90vh] overflow-y-auto">
                <form onSubmit={handleFormSubmit}>
                  <DialogHeader>
                    <DialogTitle>{editingCourseId ? 'Editar Curso' : 'Nuevo Curso'}</DialogTitle>
                    <DialogDescription>
                      Configura el acceso y la vigencia del curso académico.
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="title">Título del Curso</Label>
                        <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Next.js Pro" required className="rounded-xl h-11" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="category">Área Principal</Label>
                        <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej: Desarrollo Web" required className="rounded-xl h-11" />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label>Tecnología Específica</Label>
                        <Select value={technology} onValueChange={setTechnology}>
                          <SelectTrigger className="rounded-xl h-11">
                            <SelectValue placeholder="Selecciona el lenguaje..." />
                          </SelectTrigger>
                          <SelectContent className="max-h-[300px]">
                            {Object.entries(TECH_STACK).map(([cat, subgroups]) => (
                              <SelectGroup key={cat}>
                                <SelectLabel className="bg-muted/50 py-1.5">{cat}</SelectLabel>
                                {Array.isArray(subgroups) 
                                  ? subgroups.map(tech => <SelectItem key={tech} value={tech}>{tech}</SelectItem>)
                                  : Object.entries(subgroups).flatMap(([sub, techs]) => 
                                      techs.map(tech => <SelectItem key={tech} value={tech}>{tech}</SelectItem>)
                                    )
                                }
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="closingDate">Fecha de Cierre (Opcional)</Label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                          <Input 
                            id="closingDate" 
                            type="date" 
                            value={closingDate} 
                            onChange={(e) => setClosingDate(e.target.value)} 
                            className="rounded-xl h-11 pl-10" 
                          />
                        </div>
                        <p className="text-[10px] text-muted-foreground ml-1">Pasada esta fecha, el curso se inactivará para no-pagos.</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="grid gap-2">
                        <Label htmlFor="imageUrl">URL Imagen Portada</Label>
                        <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="rounded-xl h-11" />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="previewVideoUrl">URL Video Presentación</Label>
                        <Input id="previewVideoUrl" value={previewVideoUrl} onChange={(e) => setPreviewVideoUrl(e.target.value)} placeholder="https://youtube.com/..." className="rounded-xl h-11" />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="description">Descripción</Label>
                      <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Qué aprenderán los alumnos?" required className="rounded-xl min-h-[100px]" />
                    </div>

                    <div className="flex gap-6 items-center">
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="isFree" 
                          checked={isFree} 
                          onChange={(e) => setIsFree(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                        />
                        <Label htmlFor="isFree" className="cursor-pointer">Curso Gratuito</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="isActive" 
                          checked={isActive} 
                          onChange={(e) => setIsActive(e.target.checked)}
                          className="h-4 w-4 rounded border-gray-300 text-primary"
                        />
                        <Label htmlFor="isActive" className="cursor-pointer">Publicado / Activo</Label>
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full rounded-2xl h-14 text-lg font-bold shadow-xl shadow-primary/20" disabled={!technology}>
                      {editingCourseId ? 'Guardar Cambios' : 'Publicar Curso'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <div className="bg-card rounded-3xl border shadow-sm overflow-hidden bg-white">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground font-medium">Cargando catálogo...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30 hover:bg-muted/30 border-none">
                  <TableHead className="rounded-tl-3xl pl-6">Título</TableHead>
                  <TableHead>Tecnología</TableHead>
                  <TableHead>Vigencia</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right pr-6 rounded-tr-3xl">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses?.map(course => {
                  const isExpired = course.closingDate && (course.closingDate instanceof Timestamp ? course.closingDate.toDate() : new Date(course.closingDate)) < new Date();
                  
                  return (
                    <TableRow key={course.id} className="border-muted/20">
                      <TableCell className="font-bold pl-6 py-5">
                        <div className="flex flex-col">
                          <span>{course.title}</span>
                          <span className="text-[10px] text-muted-foreground font-normal line-clamp-1">{course.category}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="rounded-lg font-bold border-primary/20 bg-primary/5 text-primary">
                          {course.technology}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {course.closingDate ? (
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${isExpired ? 'text-rose-600' : 'text-slate-600'}`}>
                            <Clock className="h-3 w-3" />
                            {new Date(course.closingDate instanceof Timestamp ? course.closingDate.toDate() : course.closingDate).toLocaleDateString()}
                            {isExpired && <span className="text-[10px] font-bold uppercase">(Cerrado)</span>}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">De por vida</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {course.isActive ? (
                             <Badge className="bg-emerald-500 text-white border-none rounded-lg h-5 text-[10px]">Activo</Badge>
                          ) : (
                             <Badge className="bg-slate-300 text-slate-700 border-none rounded-lg h-5 text-[10px]">Borrador</Badge>
                          )}
                          {course.isFree ? (
                            <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50 rounded-lg h-5 text-[10px]">Gratis</Badge>
                          ) : (
                            <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50 rounded-lg h-5 text-[10px]">Premium</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/courses/${course.id}/content`}>
                            <Button variant="ghost" size="sm" className="gap-2 rounded-xl text-xs h-9">
                              <BookOpen className="h-3.5 w-3.5" />
                              Contenido
                            </Button>
                          </Link>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-9 w-9 rounded-xl"
                            onClick={() => handleEditClick(course)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          {isAdmin && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-9 w-9 text-destructive hover:bg-destructive/10 rounded-xl"
                              onClick={() => handleDeleteCourse(course.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}

import { Users } from 'lucide-react';
