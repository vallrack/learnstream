
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
  Paperclip,
  Upload,
  Link as LinkIcon,
  X,
  FileText,
  Code2,
  AlertTriangle
} from 'lucide-react';
import { 
  useCollection, 
  useDoc, 
  useFirestore, 
  useStorage,
  useUser,
  useMemoFirebase, 
  addDocumentNonBlocking, 
  updateDocumentNonBlocking, 
  deleteDocumentNonBlocking 
} from '@/firebase';
import { collection, query, orderBy, doc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';

export default function CourseContentAdminPage() {
  const params = useParams();
  const router = useRouter();
  const courseId = params.id as string;
  const db = useFirestore();
  const { user } = useUser();

  const [isModuleDialogOpen, setIsModuleDialogOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<any>(null);
  const [moduleTitle, setModuleTitle] = useState('');
  const [moduleOrder, setModuleOrder] = useState('0');

  const profileRef = useMemoFirebase(() => {
    if (!db || !user?.uid) return null;
    return doc(db, 'users', user.uid);
  }, [db, user?.uid]);
  const { data: profile } = useDoc(profileRef);
  const isAdmin = profile?.role === 'admin';

  const courseRef = useMemoFirebase(() => {
    if (!db || !courseId) return null;
    return doc(db, 'courses', courseId);
  }, [db, courseId]);
  const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);

  const modulesQuery = useMemoFirebase(() => {
    if (!db || !courseId) return null;
    return query(collection(db, 'courses', courseId, 'modules'), orderBy('orderIndex', 'asc'));
  }, [db, courseId]);
  const { data: modules, isLoading: isModulesLoading } = useCollection(modulesQuery);

  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !course) return;

    const moduleData = {
      title: moduleTitle,
      orderIndex: parseInt(moduleOrder),
      courseId: courseId,
      instructorId: course.instructorId,
      courseIsFree: course.isFree ?? true,
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
    if (!db || !isAdmin) return;
    if (confirm('¿Estás seguro de eliminar este módulo y todo su contenido?')) {
      deleteDocumentNonBlocking(doc(db, 'courses', courseId, 'modules', moduleId));
    }
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
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20">{course?.technology}</Badge>
                <h1 className="text-4xl font-headline font-bold">Contenido: {course?.title}</h1>
              </div>
              <p className="text-muted-foreground">Gestiona módulos, lecciones y desafíos compatibles con {course?.technology}.</p>
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
                          <p className="text-xs font-bold text-primary uppercase tracking-wider">Módulo {i + 1}</p>
                          <p className="text-lg font-bold">{module.title}</p>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="h-9 w-9" onClick={(e) => {
                        e.stopPropagation();
                        setEditingModule(module);
                        setModuleTitle(module.title);
                        setModuleOrder(module.orderIndex?.toString() || '0');
                        setIsModuleDialogOpen(true);
                      }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {isAdmin && (
                        <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteModule(module.id);
                        }}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                  <AccordionContent className="pb-6 border-t pt-4">
                    <LessonManager course={course} moduleId={module.id} isAdmin={isAdmin} />
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </section>
      </main>
    </div>
  );
}

function LessonManager({ course, moduleId, isAdmin }: { course: any, moduleId: string, isAdmin: boolean }) {
  const db = useFirestore();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);

  const [type, setType] = useState<'video' | 'challenge'>('video');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [videoUrl, setVideoUrl] = useState('');
  const [challengeId, setChallengeId] = useState('');
  const [duration, setDuration] = useState('10');
  const [order, setOrder] = useState('0');
  const [isPremium, setIsPremium] = useState(false);

  // Cargar desafíos para el selector (solo si coinciden con la tecnología del curso)
  const challengesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, 'coding_challenges');
  }, [db]);
  const { data: allChallenges } = useCollection(challengesQuery);
  
  const compatibleChallenges = allChallenges?.filter(c => c.technology === course.technology) || [];

  const lessonsQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'courses', course.id, 'modules', moduleId, 'lessons'), orderBy('orderIndex', 'asc'));
  }, [db, course.id, moduleId]);

  const { data: lessons } = useCollection(lessonsQuery);

  const handleSaveLesson = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db) return;

    const lessonData: any = {
      title,
      description,
      type,
      durationInMinutes: parseInt(duration),
      orderIndex: parseInt(order),
      isPremium,
      moduleId,
      instructorId: course.instructorId,
      courseIsFree: course.isFree ?? true,
      updatedAt: serverTimestamp(),
    };

    if (type === 'video') {
      lessonData.videoUrl = videoUrl;
    } else {
      lessonData.challengeId = challengeId;
      const challenge = compatibleChallenges.find(c => c.id === challengeId);
      if (challenge) {
        lessonData.title = challenge.title;
        lessonData.description = challenge.description;
      }
    }

    if (editingLesson) {
      updateDocumentNonBlocking(doc(db, 'courses', course.id, 'modules', moduleId, 'lessons', editingLesson.id), lessonData);
    } else {
      addDocumentNonBlocking(collection(db, 'courses', course.id, 'modules', moduleId, 'lessons'), {
        ...lessonData,
        createdAt: serverTimestamp(),
      });
    }
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setEditingLesson(null);
    setType('video');
    setTitle('');
    setDescription('');
    setVideoUrl('');
    setChallengeId('');
    setDuration('10');
    setOrder('0');
    setIsPremium(false);
  };

  const handleEdit = (lesson: any) => {
    setEditingLesson(lesson);
    setType(lesson.type || 'video');
    setTitle(lesson.title || '');
    setDescription(lesson.description || '');
    setVideoUrl(lesson.videoUrl || '');
    setChallengeId(lesson.challengeId || '');
    setDuration(lesson.durationInMinutes?.toString() || '10');
    setOrder(lesson.orderIndex?.toString() || '0');
    setIsPremium(lesson.isPremium || false);
    setIsDialogOpen(true);
  };

  const handleDelete = (lessonId: string) => {
    if (!db || !isAdmin) return;
    if (confirm('¿Eliminar lección?')) {
      deleteDocumentNonBlocking(doc(db, 'courses', course.id, 'modules', moduleId, 'lessons', lessonId));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="font-bold text-sm text-muted-foreground uppercase">Contenido del Módulo</h4>
        <Dialog open={isDialogOpen} onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) resetForm();
        }}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="h-8 rounded-lg">
              <Plus className="h-3 w-3 mr-1" /> Añadir Contenido
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-3xl sm:max-w-[500px]">
            <form onSubmit={handleSaveLesson}>
              <DialogHeader>
                <DialogTitle>{editingLesson ? 'Editar Contenido' : 'Añadir Contenido'}</DialogTitle>
                <DialogDescription>
                  Elige entre una clase de video o un desafío interactivo de {course.technology}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-6">
                <div className="grid gap-2">
                  <Label>Tipo de Contenido</Label>
                  <Select value={type} onValueChange={(v: any) => setType(v)}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="video">Clase de Video / Texto</SelectItem>
                      <SelectItem value="challenge">Desafío de Código (Evaluado por IA)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {type === 'video' ? (
                  <>
                    <div className="grid gap-2">
                      <Label>Título de la Clase</Label>
                      <Input placeholder="Ej: Introducción a..." value={title} onChange={(e) => setTitle(e.target.value)} required className="rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                      <Label>URL del Video (YouTube)</Label>
                      <Input placeholder="https://youtube.com/..." value={videoUrl} onChange={(e) => setVideoUrl(e.target.value)} className="rounded-xl" />
                    </div>
                    <div className="grid gap-2">
                      <Label>Descripción o Contenido Escrito</Label>
                      <Textarea placeholder="Contenido de la lección..." value={description} onChange={(e) => setDescription(e.target.value)} className="min-h-[120px] rounded-xl" />
                    </div>
                  </>
                ) : (
                  <div className="grid gap-2">
                    <Label>Seleccionar Desafío compatible ({course.technology})</Label>
                    <Select value={challengeId} onValueChange={setChallengeId} required>
                      <SelectTrigger className="rounded-xl h-12">
                        <SelectValue placeholder="Elige un reto..." />
                      </SelectTrigger>
                      <SelectContent>
                        {compatibleChallenges.length > 0 ? (
                          compatibleChallenges.map(c => (
                            <SelectItem key={c.id} value={c.id}>
                              <div className="flex flex-col items-start">
                                <span className="font-bold">{c.title}</span>
                                <span className="text-[10px] opacity-60 uppercase">{c.difficulty}</span>
                              </div>
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-4 text-center space-y-2">
                            <AlertTriangle className="h-5 w-5 text-amber-500 mx-auto" />
                            <p className="text-xs text-muted-foreground">No hay desafíos creados para {course.technology}.</p>
                            <Button variant="link" size="sm" asChild>
                              <Link href="/admin/challenges">Crear uno ahora →</Link>
                            </Button>
                          </div>
                        )}
                      </SelectContent>
                    </Select>
                    {compatibleChallenges.length === 0 && (
                      <p className="text-[10px] text-amber-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                        Solo puedes asignar desafíos que coincidan con la tecnología del curso.
                      </p>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                    <Label>Duración (min)</Label>
                    <Input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="rounded-xl" />
                  </div>
                  <div className="grid gap-2">
                    <Label>Orden</Label>
                    <Input type="number" value={order} onChange={(e) => setOrder(e.target.value)} className="rounded-xl" />
                  </div>
                </div>

                <div className="flex items-center gap-2 p-3 bg-muted/30 rounded-xl">
                  <input type="checkbox" id="prem" checked={isPremium} onChange={(e) => setIsPremium(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-primary" />
                  <Label htmlFor="prem" className="text-xs">Lección Premium (Solo suscriptores)</Label>
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" className="w-full rounded-xl h-11" disabled={type === 'challenge' && !challengeId}>
                  Guardar Contenido
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="space-y-4">
        {lessons?.map((lesson) => (
          <div key={lesson.id} className="bg-slate-50 p-4 rounded-2xl border flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl ${lesson.type === 'challenge' ? 'bg-primary/10 text-primary' : 'bg-slate-200 text-slate-600'}`}>
                  {lesson.type === 'challenge' ? <Code2 className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-sm">{lesson.title}</p>
                    {lesson.isPremium && <Badge variant="outline" className="text-[10px] py-0 h-4 bg-amber-50 text-amber-600 border-amber-200">Premium</Badge>}
                  </div>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">
                    {lesson.type === 'challenge' ? 'Desafío Evaluado' : 'Lección de Contenido'}
                  </p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(lesson)}><Edit className="h-4 w-4" /></Button>
                {isAdmin && (
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:bg-destructive/10" onClick={() => handleDelete(lesson.id)}><Trash2 className="h-4 w-4" /></Button>
                )}
              </div>
            </div>
            {lesson.type === 'video' && (
              <ResourceManager course={course} moduleId={moduleId} lesson={lesson} isAdmin={isAdmin} />
            )}
          </div>
        ))}
        {(!lessons || lessons.length === 0) && (
          <div className="py-12 text-center bg-white rounded-2xl border-2 border-dashed">
            <p className="text-sm text-muted-foreground italic">No hay lecciones en este módulo.</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ResourceManager({ course, moduleId, lesson, isAdmin }: { course: any, moduleId: string, lesson: any, isAdmin: boolean }) {
  const db = useFirestore();
  const storage = useStorage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [title, setTitle] = useState('');
  const [type, setType] = useState('pdf');
  const [contentUrl, setContentUrl] = useState('');

  const resourcesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'courses', course.id, 'modules', moduleId, 'lessons', lesson.id, 'resources'), orderBy('orderIndex', 'asc'));
  }, [db, course.id, moduleId, lesson.id]);

  const { data: resources } = useCollection(resourcesQuery);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !storage) return;

    setUploading(true);
    setUploadProgress(0);
    
    try {
      const storageRef = ref(storage, `courses/${course.id}/resources/${Date.now()}_${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress);
        }, 
        (error) => {
          console.error("Upload task failed", error);
          alert(`Error al subir: ${error.message}.`);
          setUploading(false);
        }, 
        async () => {
          const url = await getDownloadURL(uploadTask.snapshot.ref);
          setContentUrl(url);
          if (!title) setTitle(file.name);
          
          const ext = file.name.split('.').pop()?.toLowerCase();
          if (ext === 'pdf') setType('pdf');
          else if (['doc', 'docx'].includes(ext!)) setType('word');
          else if (['ppt', 'pptx', 'pps', 'ppsx'].includes(ext!)) setType('ppt');
          
          setUploading(false);
        }
      );
    } catch (err: any) {
      console.error("General upload error", err);
      setUploading(false);
    }
  };

  const handleSaveResource = (e: React.FormEvent) => {
    e.preventDefault();
    if (!db || !contentUrl) return;

    const resourceData = {
      title,
      type,
      contentUrl,
      orderIndex: 0,
      lessonId: lesson.id,
      instructorId: course.instructorId,
      courseIsFree: course.isFree ?? true,
      lessonIsPremium: lesson.isPremium ?? false,
      updatedAt: serverTimestamp(),
    };

    addDocumentNonBlocking(collection(db, 'courses', course.id, 'modules', moduleId, 'lessons', lesson.id, 'resources'), {
      ...resourceData,
      createdAt: serverTimestamp(),
    });
    
    setIsDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setType('pdf');
    setContentUrl('');
    setUploadProgress(0);
  };

  const handleDeleteResource = (resourceId: string) => {
    if (!db || !isAdmin) return;
    if (confirm('¿Eliminar recurso?')) {
      deleteDocumentNonBlocking(doc(db, 'courses', course.id, 'modules', moduleId, 'lessons', lesson.id, 'resources', resourceId));
    }
  };

  return (
    <div className="mt-4 border-t pt-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-1"><Paperclip className="h-3 w-3" /> Material de Apoyo</p>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild><Button size="sm" variant="ghost" className="h-7 text-[10px] border rounded-lg">Añadir Archivo</Button></DialogTrigger>
          <DialogContent className="rounded-3xl">
            <form onSubmit={handleSaveResource}>
              <DialogHeader><DialogTitle>Nuevo Recurso</DialogTitle></DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Tipo de Recurso</Label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pdf">Documento PDF (Subir)</SelectItem>
                      <SelectItem value="word">Documento Word (Subir)</SelectItem>
                      <SelectItem value="ppt">PowerPoint (Subir)</SelectItem>
                      <SelectItem value="link">Enlace Externo (Drive, Notion...)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {type !== 'link' ? (
                  <div className="space-y-2">
                    <Label>Subir Archivo</Label>
                    <div className="border-2 border-dashed rounded-xl p-4 text-center min-h-[100px] flex flex-col items-center justify-center gap-4">
                      {uploading ? (
                        <div className="flex flex-col items-center gap-3 w-full max-w-[200px]">
                          <Loader2 className="h-6 w-6 animate-spin text-primary" />
                          <div className="w-full">
                            <Progress value={uploadProgress} className="h-1" />
                          </div>
                        </div>
                      ) : contentUrl ? (
                        <div className="flex flex-col items-center gap-2">
                          <div className="flex items-center justify-center gap-2 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">
                            Archivo cargado <X className="h-3 w-3 cursor-pointer" onClick={() => setContentUrl('')} />
                          </div>
                        </div>
                      ) : (
                        <>
                          <input type="file" id="file-upload" className="hidden" onChange={handleFileUpload} />
                          <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2 w-full">
                            <Upload className="h-6 w-6 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Seleccionar archivo</span>
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Label>URL del Enlace</Label>
                    <Input 
                      placeholder="https://drive.google.com/..." 
                      value={contentUrl} 
                      onChange={(e) => setContentUrl(e.target.value)} 
                      required 
                      className="rounded-xl"
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label>Título del Recurso</Label>
                  <Input placeholder="Ej: Guía de sintaxis" value={title} onChange={(e) => setTitle(e.target.value)} required className="rounded-xl" />
                </div>
              </div>
              <DialogFooter><Button type="submit" className="w-full rounded-xl" disabled={uploading || !contentUrl}>Guardar</Button></DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {resources?.map((res) => (
          <div key={res.id} className="text-[10px] p-2 bg-white border rounded-xl flex items-center justify-between group">
            <span className="truncate pr-2 flex items-center gap-2">
              {res.type === 'link' ? <LinkIcon className="h-3 w-3" /> : <FileText className="h-3 w-3" />}
              {res.title}
            </span>
            {isAdmin && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7 text-destructive hover:bg-destructive/10 rounded-lg" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteResource(res.id);
                }}
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
