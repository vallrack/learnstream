'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronLeft, 
  Loader2, 
  GripVertical, 
  Video, 
  FileText,
  FileDown,
  Link as LinkIcon,
  Presentation,
  MoreVertical,
  Settings,
  Paperclip
} from 'lucide-react';
import { 
  useCollection, 
  useDoc, 
  useFirestore, 
  useMemoFirebase, 
  addDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export default function CourseContentAdminPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const db = useFirestore();

  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  
  // Module Form
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleOrder, setModuleOrder] = useState('0');

  // Fetch Course
  const courseRef = useMemoFirebase(() => {
    if (!db || !courseId) return null;
    return doc(db, 'courses', courseId);
  }, [db, courseId]);
  const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);

  // Fetch Modules
  const modulesQuery = useMemoFirebase(() => {
    if (!db || !courseId) return null;
    return query(collection(db, 'courses', courseId, 'modules'), orderBy('orderIndex', 'asc'));
  }, [db, courseId]);
  const { data: modules, isLoading: isModulesLoading } = useCollection(modulesQuery);

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const moduleData = {
      title: moduleTitle,
      orderIndex: parseInt(moduleOrder),
      courseId: courseId,
      updatedAt: serverTimestamp(),
    };

    if (editingModule) {
      updateDocumentNonBlocking(doc(db, 'courses', courseId, 'modules', editingModule.id), moduleData);
    } else {
      addDocumentNonBlocking(collection(db, 'courses', courseId, 'modules'), {
        ...moduleData,
        createdAt: serverTimestamp(),
      });
    }
    setIsModuleDialogOpen(false);
    resetModuleForm();
  };

  const resetModuleForm = () => {
    setEditingModule(null);
    setModuleTitle('');
    setModuleOrder('0');
  };

  const handleDeleteModule = (moduleId: string) => {
    if (!db || !confirm('¿Estás seguro de eliminar este módulo? Se borrarán sus lecciones.')) return;
    deleteDocumentNonBlocking(doc(db, 'courses', courseId, 'modules', moduleId));
  };

  if (isCourseLoading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12 flex flex-col gap-6">
          <Button variant="ghost" onClick={() => router.back()} className="w-fit -ml-2 text-muted-foreground hover:text-foreground">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Volver a Cursos
          </Button>
          
          <div className="flex items-end justify-between gap-4">
            <div>
              <h1 className="text-4xl font-headline font-bold mb-2">Contenido: {course?.title}</h1>
              <p className="text-muted-foreground">Organiza los módulos, lecciones y recursos de este curso.</p>
            </div>
            
            <Dialog open={isModuleDialogOpen} onOpenChange={(open) => {
              setIsModuleDialogOpen(open);
              if (!open) resetModuleForm();
            }}>
              <DialogTrigger asChild>
                <Button className="rounded-xl h-11 gap-2 shadow-lg shadow-primary/10">
                  <Plus className="h-4 w-4" />
                  Añadir Módulo
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <form onSubmit={handleSaveModule}>
                  <DialogHeader>
                    <DialogTitle>{editingModule ? 'Editar Módulo' : 'Nuevo Módulo'}</DialogTitle>
                    <DialogDescription>Define el título y el orden del módulo.</DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="m-title">Título del Módulo</Label>
                      <Input id="m-title" value={moduleTitle} onChange={(e) => setModuleTitle(e.target.value)} required placeholder="Ej: Fundamentos" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="m-order">Orden (Index)</Label>
                      <Input id="m-order" type="number" value={moduleOrder} onChange={(e) => setModuleOrder(e.target.value)} required />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="submit" className="w-full rounded-xl h-11">Guardar Módulo</Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </header>

        <section className="space-y-4">
          {isModulesLoading ? (
            <div className="py-20 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>
          ) : (
            <Accordion type="single" collapsible className="space-y-4">
              {modules?.map((module, i) => (
                <AccordionItem key={module.id} value={module.id} className="bg-white border rounded-2xl overflow-hidden px-4 shadow-sm">
                  <div className="flex items-center gap-2 group pr-4">
                    <AccordionTrigger className="flex-1 hover:no-underline py-6">
                      <div className="flex items-center gap-4 text-left">
                        <div className="bg-muted p-2 rounded-lg"><GripVertical className="h-4 w-4 text-muted-foreground" /></div>
                        <div>
                          <p className="text-xs font-bold text-primary uppercase tracking-wider">Módulo {module.orderIndex ?? i}</p>
                          <p className="text-lg font-bold">{module.title}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => {
                        e.stopPropagation();
                        setEditingModule(module);
                        setModuleTitle(module.title);
                        setModuleOrder(module.orderIndex?.toString() || '0');
                        setIsModuleDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive" onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteModule(module.id);
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <AccordionContent className="pb-6 border-t pt-4">
                    <LessonManager courseId={courseId} moduleId={module.id} />
                  </AccordionContent>
                </AccordionItem>
              ))}
              {modules?.length === 0 && (
                <div className="text-center py-20 bg-white border-2 border-dashed rounded-3xl">
                  <p className="text-muted-foreground">No hay módulos aún. ¡Empieza creando el primero!</p>
                </div>
              )}
            </Accordion>
          )}
        </section>
      </main>
    </div>
  );
}

function LessonManager({ courseId, moduleId }: { courseId: string, moduleId: string }) {
  const db = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  // Lesson Form
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [duration, setDuration] = useState('10');
  const [order, setOrder] = useState('0');
  const [isPremium, setIsPremium] = useState(false);

  const lessonsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'courses', courseId, 'modules', moduleId, 'lessons'), orderBy('orderIndex', 'asc'));
  }, [db, courseId, moduleId]);

  const { data: lessons, isLoading } = useCollection(lessonsQuery);

  const resetForm = () => {
    setEditingLesson(null);
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setDuration('10');
    setOrder('0');
    setIsPremium(false);
  };

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const lessonData = {
      title,
      description,
      videoUrl,
      durationInMinutes: parseInt(duration),
      orderIndex: parseInt(order),
      isPremium,
      moduleId,
      updatedAt: serverTimestamp(),
    };

    if (editingLesson) {
      updateDocumentNonBlocking(doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', editingLesson.id), lessonData);
    } else {
      addDocumentNonBlocking(collection(db, 'courses', courseId, 'modules', moduleId, 'lessons'), {
        ...lessonData,
        createdAt: serverTimestamp(),
      });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setTitle(lesson.title || '');
    setDescription(lesson.description || '');
    setVideoUrl(lesson.videoUrl || '');
    setDuration(lesson.durationInMinutes?.toString() || '10');
    setOrder(lesson.orderIndex?.toString() || '0');
    setIsPremium(lesson.isPremium || false);
    setIsDialogOpen(true);
  };

  const handleDelete = (lessonId: string) => {
    if (!confirm('¿Eliminar esta lección?')) return;
    deleteDocumentNonBlocking(doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-muted-foreground uppercase tracking-tight">Lecciones</h4>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 rounded-lg gap-1">
              <Plus className="h-3 w-3" />
              Añadir Lección
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px] rounded-3xl max-h-[90vh] overflow-y-auto">
            <form onSubmit={handleSaveLesson}>
              <DialogHeader>
                <DialogTitle>{editingLesson ? 'Editar Lección' : 'Nueva Lección'}</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="l-title">Título</Label>
                  <Input id="l-title" value={title} onChange={(e) => setTitle(e.target.value)} required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="l-video">URL Video (YouTube, Vimeo...)</Label>
                  <Input id="l-video" value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} placeholder="https://youtube.com/..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="l-desc">Descripción / Contenido</Label>
                  <Textarea id="l-desc" value={description} onChange={(e) => setDescription(e.target.value)} rows={5} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="l-dur">Duración (min)</Label>
                    <Input id="l-dur" type="number" value={duration} onChange={(e) => setDuration(e.target.value)} />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="l-ord">Orden</Label>
                    <Input id="l-ord" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input type="checkbox" id="l-prem" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} />
                  <Label htmlFor="l-prem">Contenido Premium</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full rounded-xl h-11">Guardar Lección</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin mx-auto" />
        ) : (
          lessons?.map((lesson, idx) => (
            <div key={lesson.id} className="bg-[#F1F5F9]/50 rounded-2xl border p-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white p-2 rounded-lg shadow-sm border">
                    {lesson.videoUrl ? <Video className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold truncate max-w-[300px]">{lesson.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="outline" className="text-[10px] h-4 py-0 px-1 bg-white">#{lesson.orderIndex ?? idx}</Badge>
                      <span className="text-[10px] text-muted-foreground">{lesson.durationInMinutes || 0} min</span>
                      {lesson.isPremium && <Badge className="bg-amber-500 text-[9px] h-3.5 px-1">Premium</Badge>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(lesson)}>
                    <Edit className="h-3.5 w-3.5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(lesson.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>

              {/* Resource Manager Integration */}
              <ResourceManager courseId={courseId} moduleId={moduleId} lessonId={lesson.id} />
            </div>
          ))
        )}
        {lessons?.length === 0 && !isLoading && (
          <p className="text-xs text-muted-foreground italic text-center py-4">Este módulo no tiene lecciones aún.</p>
        )}
      </div>
    </div>
  );
}

function ResourceManager({ courseId, moduleId, lessonId }: { courseId: string, moduleId: string, lessonId: string }) {
  const db = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);

  // Resource Form
  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [contentUrl, setContentUrl] = useState('');
  const [order, setOrder] = useState('0');

  const resourcesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId, 'resources'), orderBy('orderIndex', 'asc'));
  }, [db, courseId, moduleId, lessonId]);

  const { data: resources, isLoading } = useCollection(resourcesQuery);

  const resetForm = () => {
    setEditingResource(null);
    setTitle('');
    setType('pdf');
    setContentUrl('');
    setOrder('0');
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const resourceData = {
      title,
      type,
      contentUrl,
      orderIndex: parseInt(order),
      lessonId,
      updatedAt: serverTimestamp(),
    };

    if (editingResource) {
      updateDocumentNonBlocking(doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId, 'resources', editingResource.id), resourceData);
    } else {
      addDocumentNonBlocking(collection(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId, 'resources'), {
        ...resourceData,
        createdAt: serverTimestamp(),
      });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const handleEdit = (resource: any) => {
    setEditingResource(resource);
    setTitle(resource.title || '');
    setType(resource.type || 'pdf');
    setContentUrl(resource.contentUrl || '');
    setOrder(resource.orderIndex?.toString() || '0');
    setIsDialogOpen(true);
  };

  const handleDelete = (resourceId: string) => {
    if (!confirm('¿Eliminar este recurso?')) return;
    deleteDocumentNonBlocking(doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId, 'resources', resourceId));
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileDown className="h-3 w-3 text-red-500" />;
      case 'word': return <FileText className="h-3 w-3 text-blue-500" />;
      case 'ppt': return <Presentation className="h-3 w-3 text-orange-500" />;
      default: return <LinkIcon className="h-3 w-3 text-gray-500" />;
    }
  };

  return (
    <div className="pt-2 border-t mt-2">
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-1">
          <Paperclip className="h-3 w-3" /> Material de Apoyo
        </p>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="ghost" className="h-6 rounded-md gap-1 text-[10px] hover:bg-white border">
              <Plus className="h-2 w-2" />
              Añadir Recurso
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[400px] rounded-3xl">
            <form onSubmit={handleSaveResource}>
              <DialogHeader>
                <DialogTitle>{editingResource ? 'Editar Recurso' : 'Nuevo Recurso'}</DialogTitle>
                <DialogDescription>Añade guías, talleres o presentaciones.</DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="r-title">Nombre del Material</Label>
                  <Input id="r-title" value={title} onChange={(e) => setTitle(e.target.value)} required placeholder="Ej: Guía de Ejercicios PDF" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="r-type">Tipo de Archivo</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Selecciona tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">PDF (Guías, Talleres)</SelectItem>
                      <SelectItem value="word">Word (Documentos)</SelectItem>
                      <SelectItem value="ppt">PowerPoint (Presentaciones)</SelectItem>
                      <SelectItem value="link">Enlace Externo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="r-url">URL del Archivo</Label>
                  <Input id="r-url" value={contentUrl} onChange={(e) => setContentUrl(e.target.value)} required placeholder="https://dropbox.com/s/..." />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="r-order">Orden</Label>
                  <Input id="r-order" type="number" value={order} onChange={(e) => setOrder(e.target.value)} />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full rounded-xl h-11">Guardar Recurso</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {resources?.map((resource) => (
          <div key={resource.id} className="flex items-center justify-between p-2 rounded-lg bg-white border text-[11px] group">
            <div className="flex items-center gap-2">
              {getIcon(resource.type)}
              <span className="font-medium truncate max-w-[120px]">{resource.title}</span>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => handleEdit(resource)}>
                <Edit className="h-2.5 w-2.5" />
              </Button>
              <Button variant="ghost" size="icon" className="h-5 w-5 text-destructive" onClick={() => handleDelete(resource.id)}>
                <Trash2 className="h-2.5 w-2.5" />
              </Button>
            </div>
          </div>
        ))}
        {resources?.length === 0 && !isLoading && (
          <p className="text-[10px] text-muted-foreground italic col-span-2">No hay recursos adicionales.</p>
        )}
      </div>
    </div>
  );
}
