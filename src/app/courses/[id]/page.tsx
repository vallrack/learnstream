import { Navbar } from '@/components/layout/Navbar';
import { MOCK_COURSES } from '@/lib/mock-data';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Users, Star, Clock, Globe, BookOpen, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';

export default async function CourseDetailPage({ params }: { params: { id: string } }) {
  const course = MOCK_COURSES.find(c => c.id === params.id);
  
  if (!course) notFound();

  const totalLessons = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

  return (
    <div className="min-h-screen bg-background pb-20">
      <Navbar />
      
      <div className="bg-primary py-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10" />
        <div className="max-w-7xl mx-auto relative z-10 text-white">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <Badge className="bg-white/20 hover:bg-white/30 text-white border-none">{course.category}</Badge>
            <div className="flex items-center gap-1 text-sm text-white/80">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
              <span className="font-bold text-white">4.8</span> (1.2k reviews)
            </div>
          </div>
          <h1 className="text-3xl md:text-5xl font-headline font-bold mb-6 max-w-3xl leading-tight">
            {course.title}
          </h1>
          <p className="text-xl text-primary-foreground/90 mb-8 max-w-2xl leading-relaxed">
            {course.description}
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm">
            <div className="flex items-center gap-2"><Users className="h-4 w-4" /> 5,420 Enrolled</div>
            <div className="flex items-center gap-2"><Clock className="h-4 w-4" /> 12.5 Hours total</div>
            <div className="flex items-center gap-2"><Globe className="h-4 w-4" /> English</div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-6 -mt-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-12">
            <section className="bg-card p-8 rounded-2xl border shadow-sm mt-20 md:mt-0">
              <h2 className="text-2xl font-headline font-bold mb-6">What you'll learn</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4, 5, 6].map(i => (
                  <div key={i} className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
                    <span>Master core concepts and advanced patterns in this domain.</span>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-headline font-bold mb-6">Course Content</h2>
              <div className="space-y-4">
                {course.modules.map((module, i) => (
                  <div key={module.id} className="border rounded-xl overflow-hidden bg-card">
                    <div className="bg-muted/30 px-6 py-4 flex items-center justify-between border-b">
                      <h3 className="font-semibold text-lg flex items-center gap-3">
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs">0{i+1}</span>
                        {module.title}
                      </h3>
                      <span className="text-sm text-muted-foreground">{module.lessons.length} lessons</span>
                    </div>
                    <div className="divide-y">
                      {module.lessons.map(lesson => (
                        <div key={lesson.id} className="px-6 py-4 flex items-center justify-between hover:bg-muted/10">
                          <div className="flex items-center gap-4">
                            <PlayCircle className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-medium">{lesson.title}</span>
                          </div>
                          {!lesson.isFree && <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">Premium</Badge>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border shadow-xl overflow-hidden sticky top-24">
              <div className="relative aspect-video">
                <Image 
                  src={course.thumbnail} 
                  alt={course.title}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                  <PlayCircle className="h-16 w-16 text-white" />
                </div>
              </div>
              <div className="p-8">
                <div className="text-3xl font-headline font-bold mb-6">
                  {course.isFree ? 'Free' : '$49.99'}
                  {course.isFree && <span className="text-sm font-normal text-muted-foreground ml-2">to get started</span>}
                </div>
                
                <div className="space-y-4">
                  <Link href={`/courses/${course.id}/learn/${course.modules[0].lessons[0].id}`}>
                    <Button className="w-full h-12 text-lg font-bold bg-primary hover:bg-primary/90">
                      Enroll Now
                    </Button>
                  </Link>
                  <Button variant="outline" className="w-full h-12 text-lg font-bold">
                    Add to Favorites
                  </Button>
                </div>

                <div className="mt-8 space-y-4">
                  <p className="font-semibold text-sm">This course includes:</p>
                  <ul className="space-y-3 text-sm text-muted-foreground">
                    <li className="flex items-center gap-3"><Clock className="h-4 w-4" /> Full lifetime access</li>
                    <li className="flex items-center gap-3"><BookOpen className="h-4 w-4" /> {totalLessons} Lessons</li>
                    <li className="flex items-center gap-3"><Globe className="h-4 w-4" /> Certificate of completion</li>
                    <li className="flex items-center gap-3"><Zap className="h-4 w-4" /> AI Learning Assistant access</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}