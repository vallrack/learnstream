import Image from 'next/image';
import Link from 'next/link';
import { Course } from '@/lib/mock-data';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Clock, BookOpen } from 'lucide-react';

export function CourseCard({ course }: { course: Course }) {
  const lessonCount = course.modules.reduce((acc, mod) => acc + mod.lessons.length, 0);

  return (
    <Card className="overflow-hidden group hover:shadow-lg transition-all duration-300 border-border/50">
      <Link href={`/courses/${course.id}`}>
        <div className="relative aspect-video overflow-hidden">
          <Image 
            src={course.thumbnail} 
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            data-ai-hint="course thumbnail"
          />
          <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 transition-colors" />
          {course.isFree ? (
            <Badge className="absolute top-3 right-3 bg-emerald-500 hover:bg-emerald-600">Free</Badge>
          ) : (
            <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-600">Premium</Badge>
          )}
        </div>
      </Link>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center gap-2 text-xs text-muted-foreground mb-2">
          <Badge variant="secondary" className="font-normal">{course.category}</Badge>
          <span className="flex items-center gap-1"><BookOpen className="h-3 w-3" /> {lessonCount} Lessons</span>
        </div>
        <Link href={`/courses/${course.id}`}>
          <h3 className="font-headline font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {course.title}
          </h3>
        </Link>
      </CardHeader>
      <CardContent className="p-4 pt-2">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {course.description}
        </p>
      </CardContent>
      <CardFooter className="p-4 pt-0 flex items-center justify-between border-t border-border/40 mt-auto">
        <span className="text-xs font-medium text-muted-foreground">By {course.instructor}</span>
        <Link href={`/courses/${course.id}`}>
          <div className="text-primary hover:text-primary/80 transition-colors">
            <PlayCircle className="h-8 w-8" />
          </div>
        </Link>
      </CardFooter>
    </Card>
  );
}