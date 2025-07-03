
'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { getAuth, onAuthStateChanged, signOut, User } from 'firebase/auth';
import { app } from '@/lib/firebase';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
} from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { LayoutDashboard, Package, ListOrdered, LogOut, LayoutTemplate, Loader2, Handshake, AppWindow } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const auth = getAuth(app);

function AdminSidebar({ user }: { user: User }) {
  const pathname = usePathname();
  const router = useRouter();
  const { toast } = useToast();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast({ title: 'Logged Out', description: 'You have been successfully logged out.' });
      router.push('/login');
    } catch (error) {
      toast({ title: 'Logout Failed', description: 'An error occurred during logout.', variant: 'destructive' });
    }
  };

  const menuItems = [
    { href: '/wkhanadmin', label: 'Admin', icon: LayoutDashboard },
    { href: '/wkhanadmin/products', label: 'Products', icon: Package },
    { href: '/wkhanadmin/orders', label: 'Orders', icon: ListOrdered },
    { href: '/wkhanadmin/sell-requests', label: 'Sell Requests', icon: Handshake },
    { href: '/wkhanadmin/my-apps', label: 'My Apps', icon: AppWindow },
  ];

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
            <LayoutTemplate className="h-7 w-7 text-primary" />
            <h2 className="text-xl font-bold font-headline text-primary group-data-[collapsible=icon]:hidden">HTMLHero</h2>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {menuItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href}>
                <SidebarMenuButton isActive={pathname === item.href} tooltip={item.label}>
                  <item.icon />
                  <span>{item.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter>
        <div className="flex items-center gap-2 p-2 group-data-[collapsible=icon]:p-0 group-data-[collapsible=icon]:justify-center">
            <Avatar className="h-9 w-9">
                <AvatarImage src="https://placehold.co/40x40.png" alt="Admin" data-ai-hint="person avatar" />
                <AvatarFallback>{user.email?.charAt(0).toUpperCase() ?? 'A'}</AvatarFallback>
            </Avatar>
            <div className="flex flex-col group-data-[collapsible=icon]:hidden">
                <span className="text-sm font-semibold">Admin User</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
            </div>
            <Button variant="ghost" size="icon" onClick={handleLogout} className="ml-auto group-data-[collapsible=icon]:hidden">
                <LogOut className="h-4 w-4" />
            </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = React.useState<User | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user);
        setLoading(false);
      } else {
        router.push('/login');
      }
    });

    return () => unsubscribe();
  }, [router]);

  if (loading) {
    return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <SidebarProvider>
      <AdminSidebar user={user} />
      <SidebarInset>
        <header className="flex h-14 items-center gap-4 border-b bg-card px-6">
          <SidebarTrigger className="md:hidden" />
          <div className="flex-1">
            <h1 className="text-lg font-semibold font-headline">Admin</h1>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 bg-background">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
