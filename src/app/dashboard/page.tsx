import { Navbar } from '@/components/layout/Navbar';
import { MOCK_COURSES } from '@/lib/mock-data';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Trophy, Clock, PlayCircle } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

export default function DashboardPage() {
  const enrolledCourses = MOCK_COURSES.slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-6 py-12">
        <header className="mb-12">
          <h1 className="text-4xl font-headline font-bold mb-2">Welcome back, Alex!</h1>
          <p className="text-muted-foreground">You have completed 45% of your current goals this month.</p>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Courses in Progress</CardTitle>
              <BookOpen className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">4</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Learning Hours</CardTitle>
              <Clock className="h-4 w-4 text-accent" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">24.5</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">Certificates</CardTitle>
              <Trophy className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
            </CardContent>
          </Card>
        </div>

        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-headline font-bold">Current Courses</h2>
            <Link href="/courses">
              <Button variant="outline" size="sm">Explore More</Button>
            </Link>
          </div>
          
          <div className="space-y-6">
            {enrolledCourses.map((course, i) => {
              const progress = i === 0 ? 65 : 12;
              return (
                <Card key={course.id} className="overflow-hidden border-border/50">
                  <div className="flex flex-col md:flex-row">
                    <div className="w-full md:w-64 h-40 relative shrink-0">
                      <Image 
                        src={course.thumbnail} 
                        alt={course.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-6 flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-headline font-bold text-xl">{course.title}</h3>
                          <span className="text-sm font-medium text-primary">{progress}%</span>
                        </div>
                        <p className="text-sm text-muted-foreground mb-6 line-clamp-1">{course.description}</p>
                        <Progress value={progress} className="h-2" />
                      </div>
                      <div className="mt-6 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Last accessed 2 days ago</span>
                        <Link href={`/courses/${course.id}/learn/${course.modules[0].lessons[0].id}`}>
                          <Button size="sm" className="gap-2">
                            <PlayCircle className="h-4 w-4" />
                            Continue Learning
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </section>
      </main>
    </div>
  );
}