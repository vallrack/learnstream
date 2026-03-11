import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlayCircle, User, Crown, LayoutDashboard } from 'lucide-react';

export function Navbar() {
  return (
    <nav className="border-b bg-card px-6 py-4 flex items-center justify-between sticky top-0 z-50">
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-2">
          <div className="bg-primary p-1.5 rounded-lg">
            <PlayCircle className="text-primary-foreground h-6 w-6" />
          </div>
          <span className="font-headline font-bold text-xl tracking-tight">LearnStream</span>
        </Link>
        <div className="hidden md:flex items-center gap-6">
          <Link href="/courses" className="text-sm font-medium hover:text-primary transition-colors">Courses</Link>
          <Link href="/dashboard" className="text-sm font-medium hover:text-primary transition-colors">My Learning</Link>
        </div>
      </div>
      <div className="flex items-center gap-4">
        <Link href="/admin">
          <Button variant="ghost" size="sm" className="hidden lg:flex gap-2">
            <LayoutDashboard className="h-4 w-4" />
            Admin Panel
          </Button>
        </Link>
        <Button variant="outline" size="sm" className="gap-2 text-primary border-primary hover:bg-primary/5">
          <Crown className="h-4 w-4 fill-primary" />
          Upgrade
        </Button>
        <Link href="/profile">
          <Button variant="ghost" size="icon" className="rounded-full">
            <User className="h-5 w-5" />
          </Button>
        </Link>
      </div>
    </nav>
  );
}