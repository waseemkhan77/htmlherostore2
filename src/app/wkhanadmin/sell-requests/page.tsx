
'use client';

import { useState, useEffect, useTransition } from 'react';
import type { SellRequest } from '@/lib/types';
import { getSellRequests, updateSellRequestStatus } from '@/lib/actions';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, Loader2, ExternalLink } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import Link from 'next/link';

export default function SellRequestsPage() {
    const [requests, setRequests] = useState<SellRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, startTransition] = useTransition();
    const { toast } = useToast();

    const fetchAndSetRequests = async () => {
        setIsLoading(true);
        const fetchedRequests = await getSellRequests();
        setRequests(fetchedRequests);
        setIsLoading(false);
    };

    useEffect(() => {
        fetchAndSetRequests();
    }, []);
    
    const handleStatusChange = (requestId: string, status: SellRequest['status']) => {
        startTransition(async () => {
            await updateSellRequestStatus(requestId, status);
            await fetchAndSetRequests();
            toast({ title: "Status Updated", description: `Request marked as ${status}.` });
        });
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
                <h2 className="text-2xl font-bold font-headline">Sell Requests</h2>
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Product Name</TableHead>
                            <TableHead className="hidden md:table-cell">Submitted By</TableHead>
                            <TableHead className="hidden md:table-cell">Price</TableHead>
                            <TableHead className="hidden sm:table-cell">Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {requests.map((req) => (
                            <TableRow key={req.id} className={isUpdating ? 'opacity-50' : ''}>
                                <TableCell>
                                    <div className="font-medium flex items-center gap-2">
                                        {req.productName}
                                        <Link href={req.productLink} target="_blank">
                                            <ExternalLink className="h-3 w-3 text-muted-foreground" />
                                        </Link>
                                    </div>
                                    <div className="text-sm text-muted-foreground md:hidden">{req.email}</div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">
                                    <div className="font-medium">{req.email}</div>
                                    <div className="text-sm text-muted-foreground">{req.phone}</div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">${req.price?.toFixed(2) ?? '0.00'}</TableCell>
                                <TableCell className="hidden sm:table-cell">{format(req.submissionDate, 'PPP')}</TableCell>
                                <TableCell>
                                    <Badge variant={req.status === 'Approved' ? 'default' : req.status === 'Pending' ? 'secondary' : 'destructive'}>
                                        {req.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-right">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0" disabled={isUpdating}>
                                                <span className="sr-only">Open menu</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Change Status</DropdownMenuLabel>
                                            <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'Pending')} disabled={isUpdating}>Pending</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'Approved')} disabled={isUpdating}>Approved</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(req.id, 'Rejected')} disabled={isUpdating}>Rejected</DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </>
    );
}
