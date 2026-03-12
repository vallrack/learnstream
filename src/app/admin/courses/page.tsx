
'use client';

import { useState } from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2, BookOpen, Loader2, List as ListIcon } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useCollection, useFirestore, useUser, useDoc, useMemoFirebase, addDocumentNonBlocking, updateDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, serverTimestamp, doc } from 'firebase/firestore';
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
      previewVideoUrl,
      updatedAt: serverTimestamp(),
    };

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
            <p className="text-muted-foreground">Crea y organiza tu contenido educativo.</p>
          </div>
          
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
            <DialogContent className="sm:max-w-[600px] rounded-3xl max-h-[90vh] overflow-y-auto">
              <form onSubmit={handleFormSubmit}>
                <DialogHeader>
                  <DialogTitle>{editingCourseId ? 'Editar Curso' : 'Nuevo Curso'}</DialogTitle>
                  <DialogDescription>
                    Define la tecnología principal del curso para habilitar desafíos compatibles.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="title">Título del Curso</Label>
                      <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Ej: Next.js Pro" required className="rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="category">Área Principal</Label>
                      <Input id="category" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="Ej: Desarrollo Web" required className="rounded-xl" />
                    </div>
                  </div>

                  <div className="grid gap-2">
                    <Label>Tecnología Específica</Label>
                    <Select value={technology} onValueChange={setTechnology}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Selecciona el lenguaje o herramienta..." />
                      </SelectTrigger>
                      <SelectContent className="max-h-[300px]">
                        {Object.entries(TECH_STACK).map(([category, subgroups]) => (
                          <SelectGroup key={category}>
                            <SelectLabel className="bg-muted/50 py-1.5">{category}</SelectLabel>
                            {Array.isArray(subgroups) 
                              ? subgroups.map(tech => <SelectItem key={tech} value={tech}>{tech}</SelectItem>)
                              : Object.entries(subgroups).map(([sub, techs]) => (
                                  <div key={sub} className="px-2">
                                    <p className="text-[10px] uppercase font-bold text-muted-foreground mt-2 mb-1 pl-2">{sub}</p>
                                    {techs.map(tech => <SelectItem key={tech} value={tech}>{tech}</SelectItem>)}
                                  </div>
                                ))
                            }
                          </SelectGroup>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-2">
                    <Label htmlFor="imageUrl">URL Imagen de Portada</Label>
                    <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://..." className="rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="previewVideoUrl">URL Video Presentación</Label>
                    <Input id="previewVideoUrl" value={previewVideoUrl} onChange={(e) => setPreviewVideoUrl(e.target.value)} placeholder="https://youtube.com/..." className="rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="¿Qué aprenderán los alumnos?" required className="rounded-xl min-h-[100px]" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <input 
                      type="checkbox" 
                      id="isFree" 
                      checked={isFree} 
                      onChange={(e) => setIsFree(e.target.checked)}
                      className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <Label htmlFor="isFree">Curso Gratuito</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button type="submit" className="w-full rounded-xl h-11" disabled={!technology}>
                    {editingCourseId ? 'Actualizar Curso' : 'Publicar Curso'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </header>

        <div className="bg-card rounded-2xl border shadow-sm overflow-hidden">
          {isLoading ? (
            <div className="p-20 flex flex-col items-center justify-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Cargando catálogo...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Título</TableHead>
                  <TableHead>Tecnología</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {courses?.map(course => (
                  <TableRow key={course.id}>
                    <TableCell className="font-bold">{course.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="rounded-lg">{course.technology}</Badge>
                    </TableCell>
                    <TableCell>
                      {course.isFree ? (
                        <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-500/20">Gratis</Badge>
                      ) : (
                        <Badge className="bg-amber-500/10 text-amber-600 border-amber-500/20">Premium</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/courses/${course.id}/content`}>
                          <Button variant="outline" size="sm" className="gap-2 rounded-lg text-xs h-8">
                            <BookOpen className="h-3.5 w-3.5" />
                            Contenido
                          </Button>
                        </Link>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => handleEditClick(course)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive hover:bg-destructive/10"
                            onClick={() => handleDeleteCourse(course.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </main>
    </div>
  );
}
