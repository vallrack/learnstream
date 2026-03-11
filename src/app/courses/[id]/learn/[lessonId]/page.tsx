import { Navbar } from '@/components/layout/Navbar';
import { MOCK_COURSES } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import { LessonAssistant } from '@/components/player/LessonAssistant';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, CheckCircle, Menu, MoreVertical } from 'lucide-react';
import Link from 'next/link';

export default async function LessonPlayerPage({ params }: { params: { id: string, lessonId: string } }) {
  const course = MOCK_COURSES.find(c => c.id === params.id);
  if (!course) notFound();

  let currentLesson = null;
  let flatLessons: any[] = [];
  
  course.modules.forEach(m => {
    m.lessons.forEach(l => {
      flatLessons.push({ ...l, moduleId: m.id });
      if (l.id === params.lessonId) currentLesson = l;
    });
  });

  if (!currentLesson) notFound();

  const currentIndex = flatLessons.findIndex(l => l.id === params.lessonId);
  const nextLesson = flatLessons[currentIndex + 1];
  const prevLesson = flatLessons[currentIndex - 1];

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
            {course.modules.map((module, i) => (
              <div key={module.id} className="border-b last:border-0">
                <div className="bg-muted/10 px-4 py-3 font-semibold text-xs text-muted-foreground uppercase tracking-wider">
                  Module {i + 1}: {module.title}
                </div>
                <div className="divide-y divide-border/50">
                  {module.lessons.map(lesson => {
                    const isActive = lesson.id === params.lessonId;
                    return (
                      <Link 
                        key={lesson.id} 
                        href={`/courses/${course.id}/learn/${lesson.id}`}
                        className={`block px-4 py-3 text-sm transition-colors hover:bg-muted/20 ${isActive ? 'bg-primary/5 text-primary border-l-2 border-primary font-medium' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <CheckCircle className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-muted-foreground/30'}`} />
                          <span className="truncate">{lesson.title}</span>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
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
                  <Link href={`/courses/${course.id}`} className="hover:text-primary truncate max-w-[150px]">{course.title}</Link>
                  <span>/</span>
                  <span className="text-foreground font-medium">{currentLesson.title}</span>
                </nav>
                <Button variant="ghost" size="icon"><MoreVertical className="h-4 w-4" /></Button>
              </div>

              {/* Video Placeholder */}
              {currentLesson.videoUrl && (
                <div className="aspect-video bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                  <iframe 
                    width="100%" 
                    height="100%" 
                    src={currentLesson.videoUrl} 
                    title="YouTube video player" 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen
                  ></iframe>
                </div>
              )}

              {/* Text Content */}
              <article className="prose prose-slate max-w-none bg-card p-8 md:p-12 rounded-3xl border shadow-sm">
                <h1 className="text-3xl md:text-4xl font-headline font-bold mb-8">{currentLesson.title}</h1>
                <div className="text-lg leading-relaxed text-muted-foreground space-y-6">
                  {currentLesson.content.split('\n').map((para: string, i: number) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              </article>

              {/* Navigation Controls */}
              <div className="flex items-center justify-between pt-8 pb-20 border-t">
                {prevLesson ? (
                  <Link href={`/courses/${course.id}/learn/${prevLesson.id}`}>
                    <Button variant="outline" className="gap-2 h-12 rounded-xl">
                      <ChevronLeft className="h-5 w-5" />
                      Previous Lesson
                    </Button>
                  </Link>
                ) : <div />}
                
                {nextLesson ? (
                  <Link href={`/courses/${course.id}/learn/${nextLesson.id}`}>
                    <Button className="gap-2 h-12 px-8 rounded-xl bg-primary hover:bg-primary/90">
                      Next Lesson
                      <ChevronRight className="h-5 w-5" />
                    </Button>
                  </Link>
                ) : (
                  <Button className="h-12 px-8 rounded-xl bg-emerald-600 hover:bg-emerald-700 gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Complete Course
                  </Button>
                )}
              </div>
            </div>
          </div>
        </main>

        {/* AI Assistant Panel */}
        <aside className="hidden xl:block w-96 bg-card border-l shrink-0">
          <LessonAssistant lessonContent={currentLesson.content} />
        </aside>
      </div>
    </div>
  );
}