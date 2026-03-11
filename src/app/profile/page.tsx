import { Navbar } from '@/components/layout/Navbar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { User, CreditCard, Bell, Shield, Crown, CheckCircle } from 'lucide-react';
import Image from 'next/image';

export default function ProfilePage() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="max-w-5xl mx-auto px-6 py-12">
        <header className="mb-12 flex items-center gap-6">
          <div className="relative w-24 h-24 rounded-full overflow-hidden border-4 border-primary/20">
            <Image 
              src="https://picsum.photos/seed/user/200/200" 
              alt="Profile"
              fill
              className="object-cover"
            />
          </div>
          <div>
            <h1 className="text-3xl font-headline font-bold mb-1">Alex Rivers</h1>
            <p className="text-muted-foreground">alex.rivers@example.com</p>
            <div className="mt-2">
              <Badge className="bg-primary gap-1">
                <Crown className="h-3 w-3" />
                Premium Member
              </Badge>
            </div>
          </div>
        </header>

        <Tabs defaultValue="account" className="space-y-8">
          <TabsList className="bg-muted/50 p-1 rounded-xl">
            <TabsTrigger value="account" className="rounded-lg gap-2">
              <User className="h-4 w-4" />
              Account
            </TabsTrigger>
            <TabsTrigger value="subscription" className="rounded-lg gap-2">
              <CreditCard className="h-4 w-4" />
              Subscription
            </TabsTrigger>
            <TabsTrigger value="security" className="rounded-lg gap-2">
              <Shield className="h-4 w-4" />
              Security
            </TabsTrigger>
          </TabsList>

          <TabsContent value="account">
            <Card className="rounded-2xl overflow-hidden border-border/50">
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and how others see you on the platform.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="first-name">First name</Label>
                    <Input id="first-name" defaultValue="Alex" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="last-name">Last name</Label>
                    <Input id="last-name" defaultValue="Rivers" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <Input id="email" type="email" defaultValue="alex.rivers@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Input id="bio" defaultValue="Passionate lifelong learner and software developer." />
                </div>
              </CardContent>
              <CardFooter className="bg-muted/10 border-t p-6 flex justify-end">
                <Button>Save Changes</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="subscription">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card className="md:col-span-2 rounded-2xl border-border/50">
                <CardHeader>
                  <CardTitle>Active Subscription</CardTitle>
                  <CardDescription>You are currently on the Premium Monthly plan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="p-6 bg-primary/5 rounded-2xl border border-primary/10 flex items-center justify-between">
                    <div>
                      <h4 className="font-bold text-lg mb-1">Premium Monthly</h4>
                      <p className="text-sm text-muted-foreground">Next billing date: April 12, 2024</p>
                    </div>
                    <div className="text-right font-headline font-bold text-2xl">
                      $14.99<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h4 className="font-semibold text-sm">Plan Benefits:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Unlimited course access</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> AI Lesson Assistant</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Offline downloads</li>
                      <li className="flex items-center gap-2"><CheckCircle className="h-4 w-4 text-emerald-500" /> Course certificates</li>
                    </ul>
                  </div>
                </CardContent>
                <CardFooter className="bg-muted/10 border-t p-6 flex items-center justify-between">
                  <Button variant="outline" className="text-destructive hover:bg-destructive/5 hover:text-destructive">Cancel Subscription</Button>
                  <Button variant="outline">Switch to Yearly (Save 20%)</Button>
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-2xl border-border/50">
                  <CardHeader>
                    <CardTitle className="text-base">Payment Method</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-3 p-3 border rounded-xl">
                      <div className="w-10 h-6 bg-slate-100 rounded flex items-center justify-center font-bold text-[10px] text-slate-400">VISA</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">•••• 4242</p>
                        <p className="text-xs text-muted-foreground">Expires 12/26</p>
                      </div>
                    </div>
                    <Button variant="link" className="text-xs p-0 h-auto">Update payment method</Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}