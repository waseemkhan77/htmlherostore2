
'use client';

import { useState, useEffect, useTransition } from 'react';
import type { Order } from '@/lib/types';
import { getOrders, updateOrderStatus } from '@/lib/actions';
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
import { MoreHorizontal, Loader2 } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isUpdating, startTransition] = useTransition();
    const { toast } = useToast();

    const fetchAndSetOrders = async () => {
        const fetchedOrders = await getOrders();
        setOrders(fetchedOrders);
    };

    useEffect(() => {
        setIsLoading(true);
        fetchAndSetOrders().finally(() => setIsLoading(false));
    }, []);
    
    const handleStatusChange = (orderId: string, status: Order['status']) => {
        startTransition(async () => {
            await updateOrderStatus(orderId, status);
            await fetchAndSetOrders(); // Re-fetch to reflect changes
            toast({ title: "Status Updated", description: `Order ${orderId} marked as ${status}.` });
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
                <h2 className="text-2xl font-bold font-headline">Order Requests</h2>
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead className="hidden md:table-cell">Product</TableHead>
                            <TableHead className="hidden md:table-cell">Price</TableHead>
                            <TableHead className="hidden md:table-cell">Date</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="hidden md:table-cell">Payment ID</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {orders.map((order) => (
                            <TableRow key={order.id} className={isUpdating ? 'opacity-50' : ''}>
                                <TableCell>
                                    <div className="font-medium">{order.customerName}</div>
                                    <div className="text-sm text-muted-foreground">{order.customerEmail}</div>
                                    {/* Mobile-only view below */}
                                    <div className="md:hidden mt-2 space-y-1">
                                        <div className="text-sm font-medium">{order.productTitle}</div>
                                        <div className="text-sm text-muted-foreground">${order.price?.toFixed(2) ?? '0.00'}</div>
                                        <div className="text-xs text-muted-foreground">{format(order.orderDate, 'PPP')}</div>
                                        <div className="font-mono text-xs text-muted-foreground">{order.paymentId}</div>
                                    </div>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{order.productTitle}</TableCell>
                                <TableCell className="hidden md:table-cell">${order.price?.toFixed(2) ?? '0.00'}</TableCell>
                                <TableCell className="hidden md:table-cell">{format(order.orderDate, 'PPP')}</TableCell>
                                <TableCell>
                                    <Badge variant={order.status === 'Completed' ? 'default' : order.status === 'Pending' ? 'secondary' : 'destructive'}>
                                        {order.status}
                                    </Badge>
                                </TableCell>
                                <TableCell className="hidden md:table-cell">{order.paymentId}</TableCell>
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
                                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Pending')} disabled={isUpdating}>Pending</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Completed')} disabled={isUpdating}>Completed</DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => handleStatusChange(order.id, 'Rejected')} disabled={isUpdating}>Rejected</DropdownMenuItem>
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
