
'use client';

import { useState, useEffect, useTransition } from 'react';
import type { MyApp } from '@/lib/types';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Loader2, ExternalLink } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { getMyApps, saveMyApp, deleteMyApp } from '@/lib/actions';
import { Card } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';

const MyAppForm = ({ myApp, onSave, onCancel }: { myApp: Partial<MyApp> | null, onSave: (myApp: Partial<MyApp>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<MyApp>>(myApp || {});
    const [isSaving, startSaving] = useTransition();
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startSaving(() => {
          onSave(formData);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label htmlFor="name">App Name</Label>
                <Input id="name" value={formData.name || ''} onChange={e => setFormData({ ...formData, name: e.target.value })} required disabled={isSaving}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="image">Image URL</Label>
                <Input id="image" value={formData.image || ''} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://placehold.co/128x128.png" required disabled={isSaving}/>
            </div>
            <div className="space-y-2">
                <Label htmlFor="installLink">Install Link</Label>
                <Input id="installLink" value={formData.installLink || ''} onChange={e => setFormData({ ...formData, installLink: e.target.value })} placeholder="https://play.google.com/store/apps/details?id=..." required disabled={isSaving}/>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save App
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function MyAppsPage() {
    const [myApps, setMyApps] = useState<MyApp[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedApp, setSelectedApp] = useState<Partial<MyApp> | null>(null);
    const { toast } = useToast();

    const fetchAndSetMyApps = async () => {
        const fetchedMyApps = await getMyApps();
        setMyApps(fetchedMyApps);
    };

    useEffect(() => {
        setIsLoading(true);
        fetchAndSetMyApps().finally(() => setIsLoading(false));
    }, []);

    const handleSave = (appToSave: Partial<MyApp>) => {
        startTransition(async () => {
            const result = await saveMyApp(appToSave);
            if (result.success) {
                await fetchAndSetMyApps();
                toast({ title: 'Success', description: `App ${appToSave.id ? 'updated' : 'created'} successfully.` });
                setIsDialogOpen(false);
                setSelectedApp(null);
            } else {
                toast({ title: 'Error', description: result.message, variant: 'destructive' });
            }
        });
    };

    const handleDelete = () => {
        if (selectedApp?.id) {
            startTransition(async () => {
                await deleteMyApp(selectedApp.id!);
                await fetchAndSetMyApps();
                toast({ title: 'Success', description: 'App deleted successfully.' });
                setIsDeleteDialogOpen(false);
                setSelectedApp(null);
            });
        }
    };

    if (isLoading) {
        return (
            <div className="flex h-full w-full items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold font-headline">My Apps</h2>
                <Button onClick={() => { setSelectedApp({}); setIsDialogOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add App
                </Button>
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Install Link</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {myApps.map((app) => (
                            <TableRow key={app.id} className={isProcessing ? 'opacity-50' : ''}>
                                <TableCell>
                                    <Image src={app.image} alt={app.name} width={48} height={48} className="rounded-md" data-ai-hint="app icon" />
                                </TableCell>
                                <TableCell className="font-medium">{app.name}</TableCell>
                                <TableCell>
                                    <Link href={app.installLink} target="_blank" className="flex items-center gap-2 text-primary hover:underline">
                                        {app.installLink}
                                        <ExternalLink className="h-4 w-4" />
                                    </Link>
                                </TableCell>
                                <TableCell className="text-right">
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isProcessing}>
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => { setSelectedApp(app); setIsDialogOpen(true); }} disabled={isProcessing}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedApp(app); setIsDeleteDialogOpen(true); }} disabled={isProcessing}>
                                                <Trash2 className="mr-2 h-4 w-4" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="font-headline">{selectedApp?.id ? 'Edit App' : 'Add New App'}</DialogTitle>
                        <DialogDescription>
                            {selectedApp?.id ? 'Update the details of your app.' : 'Fill in the details for a new app.'}
                        </DialogDescription>
                    </DialogHeader>
                    <MyAppForm myApp={selectedApp} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Are you sure?</DialogTitle>
                        <DialogDescription>This action cannot be undone. This will permanently delete the app "{selectedApp?.name}".</DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isProcessing}>Cancel</Button>
                        <Button variant="destructive" onClick={handleDelete} disabled={isProcessing}>
                            {isProcessing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
