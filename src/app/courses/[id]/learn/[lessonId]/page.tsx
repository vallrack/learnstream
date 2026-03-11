'use client';

import { useParams, useSearchParams } from 'next/navigation';
import { Navbar } from '@/components/layout/Navbar';
import { LessonAssistant } from '@/components/player/LessonAssistant';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  Menu, 
  MoreVertical, 
  Loader2, 
  BookOpen, 
  PlayCircle,
  Paperclip,
  FileDown,
  FileText,
  Presentation,
  Link as LinkIcon,
  Download
} from 'lucide-react';
import Link from 'next/link';
import { useDoc, useCollection, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, query, orderBy } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { Badge } from '@/components/ui/badge';

export default function LessonPlayerPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const db = useFirestore();

  const courseId = params.id as string;
  const lessonId = params.lessonId as string;
  const moduleId = searchParams.get('moduleId');

  // Fetch Course
  const courseRef = useMemoFirebase(() => {
    if (!db || !courseId) return null;
    return doc(db, 'courses', courseId);
  }, [db, courseId]);
  const { data: course, isLoading: isCourseLoading } = useDoc(courseRef);

  // Fetch Current Lesson
  const lessonRef = useMemoFirebase(() => {
    if (!db || !courseId || !moduleId || !lessonId) return null;
    return doc(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId);
  }, [db, courseId, moduleId, lessonId]);
  const { data: currentLesson, isLoading: isLessonLoading } = useDoc(lessonRef);

  // Fetch Modules for Sidebar
  const modulesQuery = useMemoFirebase(() => {
    if (!db || !courseId) return null;
    return query(collection(db, 'courses', courseId, 'modules'), orderBy('orderIndex', 'asc'));
  }, [db, courseId]);
  const { data: modules, isLoading: isModulesLoading } = useCollection(modulesQuery);

  if (isCourseLoading || isLessonLoading || isModulesLoading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground animate-pulse font-medium">Cargando lección...</p>
      </div>
    );
  }

  if (!course || !currentLesson) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-center p-6">
        <h1 className="text-2xl font-bold font-headline">No pudimos encontrar esta lección</h1>
        <p className="text-muted-foreground">Verifica que el curso y la lección existan.</p>
        <Link href={`/courses/${courseId}`}>
          <Button variant="outline" className="rounded-xl">Volver al curso</Button>
        </Link>
      </div>
    );
  }

  const isUrl = (str: string) => {
    if (!str) return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  const videoSource = isUrl(currentLesson.videoUrl) 
    ? currentLesson.videoUrl 
    : (isUrl(currentLesson.title) ? currentLesson.title : null);

  const formatVideoUrl = (url: string) => {
    if (!url) return '';
    if (url.includes('youtube.com/watch?v=')) {
      return url.replace('watch?v=', 'embed/');
    }
    if (url.includes('youtu.be/')) {
      const id = url.split('/').pop()?.split('?')[0];
      return `https://www.youtube.com/embed/${id}`;
    }
    return url;
  };

  const displayTitle = isUrl(currentLesson.title) ? "Video Clase" : currentLesson.title;

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      <Navbar />
      
      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="hidden lg:flex w-80 border-r bg-card flex-col overflow-hidden shrink-0">
          <div className="p-4 border-b flex items-center justify-between bg-muted/20">
            <h2 className="font-headline font-bold text-sm truncate">{course.title}</h2>
            <Button variant="ghost" size="icon" className="h-8 w-8"><Menu className="h-4 w-4" /></Button>
          </div>
          <div className="flex-1 overflow-y-auto">
            {modules?.map((module, i) => (
              <ModuleInSidebar key={module.id} module={module} courseId={courseId} activeLessonId={lessonId} index={i} />
            ))}
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 flex flex-col min-w-0 bg-[#F1F0F4]/30">
          <div className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
              {/* Header */}
              <div className="flex items-center justify-between gap-4 mb-2">
                <nav className="text-xs text-muted-foreground flex items-center gap-2">
                  <Link href="/dashboard" className="hover:text-primary">Dashboard</Link>
                  <span>/</span>
                  <Link href={`/courses/${courseId}`} className="hover:text-primary truncate max-w-[150px]">{course.title}</Link>
                  <span>/</span>
                  <span className="text-foreground font-medium">{displayTitle}</span>
                </nav>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </div>

              {/* Video Player */}
              {videoSource ? (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={formatVideoUrl(videoSource)} 
                    title={displayTitle}
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
              ) : (
                <div className="aspect-video bg-muted rounded-2xl flex flex-col items-center justify-center gap-4 text-muted-foreground border-2 border-dashed">
                  <PlayCircle className="h-12 w-12 opacity-20" />
                  <p>Esta lección no incluye video.</p>
                </div>
              )}

              {/* Lesson Info Tabs/Sections */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="md:col-span-2 space-y-8">
                  <article className="prose prose-slate max-w-none bg-card p-8 md:p-10 rounded-3xl border shadow-sm">
                    <h1 className="text-3xl font-headline font-bold mb-6">{displayTitle}</h1>
                    <div className="text-lg leading-relaxed text-muted-foreground space-y-6 whitespace-pre-wrap">
                      {currentLesson.description || currentLesson.content || "No hay descripción disponible."}
                    </div>
                  </article>
                </div>

                {/* Resources Sidebar for the Lesson */}
                <div className="space-y-6">
                  <LessonResources courseId={courseId} moduleId={moduleId!} lessonId={lessonId} />
                  
                  <div className="bg-primary/5 border border-primary/10 rounded-3xl p-6">
                    <h4 className="font-bold text-sm mb-3 flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-primary" />
                      Tarea de hoy
                    </h4>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Descarga el material adjunto y completa los ejercicios antes de pasar al siguiente módulo.
                    </p>
                  </div>
                </div>
              </div>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-8 pb-20 border-t">
                <Link href={`/courses/${courseId}`}>
                  <Button variant="outline" className="gap-2 h-12 rounded-xl">
                    <ChevronLeft className="h-5 w-5" />
                    Volver al curso
                  </Button>
                </Link>
                
                <Button className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Marcar como completada
                </Button>
              </div>
            </div>
          </div>
        </main>

        {/* AI Assistant Panel */}
        <aside className="hidden xl:block w-96 bg-card border-l shrink-0">
          <LessonAssistant lessonContent={currentLesson.content || currentLesson.description || ''} />
        </aside>
      </div>
    </div>
  );
}

function LessonResources({ courseId, moduleId, lessonId }: { courseId: string, moduleId: string, lessonId: string }) {
  const db = useFirestore();
  const resourcesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, 'courses', courseId, 'modules', moduleId, 'lessons', lessonId, 'resources'), orderBy('orderIndex', 'asc'));
  }, [db, courseId, moduleId, lessonId]);

  const { data: resources, isLoading } = useCollection(resourcesQuery);

  if (isLoading) return <Loader2 className="h-4 w-4 animate-spin mx-auto" />;

  if (!resources || resources.length === 0) return null;

  const getIcon = (type: string) => {
    switch (type) {
      case 'pdf': return <FileDown className="h-4 w-4 text-red-500" />;
      case 'word': return <FileText className="h-4 w-4 text-blue-500" />;
      case 'ppt': return <Presentation className="h-4 w-4 text-orange-500" />;
      default: return <LinkIcon className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <div className="bg-card border rounded-3xl shadow-sm overflow-hidden">
      <div className="p-5 border-b bg-muted/20">
        <h3 className="font-headline font-bold text-sm flex items-center gap-2">
          <Paperclip className="h-4 w-4 text-primary" />
          Material de Apoyo
        </h3>
      </div>
      <div className="p-3 space-y-2">
        {resources.map((res) => (
          <a 
            key={res.id} 
            href={res.contentUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-between p-3 rounded-2xl hover:bg-muted/50 transition-colors border border-transparent hover:border-border group"
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div className="bg-background p-2 rounded-xl shadow-sm border group-hover:bg-primary/5 transition-colors">
                {getIcon(res.type)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold truncate pr-2">{res.title}</p>
                <span className="text-[10px] text-muted-foreground uppercase">{res.type}</span>
              </div>
            </div>
            <Download className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
          </a>
        ))}
      </div>
    </div>
  );
}

function ModuleInSidebar({ module, courseId, activeLessonId, index }: { module: any, courseId: string, activeLessonId: string, index: number }) {
  const db = useFirestore();
  const lessonsQuery = useMemoFirebase(() => {
    if (!db || !courseId || !module.id) return null;
    return query(collection(db, 'courses', courseId, 'modules', module.id, 'lessons'), orderBy('orderIndex', 'asc'));
  }, [db, courseId, module.id]);

  const { data: lessons } = useCollection(lessonsQuery);

  const isUrl = (str: string) => {
    if (!str) return false;
    try {
      new URL(str);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="border-b last:border-0">
      <div className="bg-muted/10 px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
        Módulo {index + 1}: {module.title}
      </div>
      <div className="divide-y divide-border/50">
        {lessons?.map(lesson => {
          const isActive = lesson.id === activeLessonId;
          const lessonTitle = isUrl(lesson.title) ? "Video Clase" : lesson.title;
          return (
            <Link 
              key={lesson.id} 
              href={`/courses/${courseId}/learn/${lesson.id}?moduleId=${module.id}`}
              className={`block px-4 py-3 text-sm transition-colors hover:bg-muted/20 ${isActive ? 'bg-primary/5 text-primary border-l-2 border-primary font-medium' : ''}`}
            >
              <div className="flex items-center gap-3">
                <CheckCircle className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground/30'}`} />
                <span className="truncate">{lessonTitle}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
