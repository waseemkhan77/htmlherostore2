import { getProducts, getOrders } from '@/lib/actions';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Package, ListOrdered, DollarSign } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default async function AdminDashboardPage() {
    const [products, orders] = await Promise.all([
        getProducts(),
        getOrders(),
    ]);

    const totalRevenue = orders
        .filter(o => o.status === 'Completed')
        .reduce((sum, order) => {
            const product = products.find(p => p.id === order.productId);
            if (!product) return sum;
            const price = typeof product.price === 'number' ? product.price : 0;
            const discount = typeof product.discount === 'number' ? product.discount : 0;
            return sum + (price * (1 - discount));
        }, 0);

    const stats = [
        { title: "Total Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, href: "/wkhanadmin/orders" },
        { title: "Products", value: products.length, icon: Package, href: "/wkhanadmin/products" },
        { title: "Pending Orders", value: orders.filter(o => o.status === 'Pending').length, icon: ListOrdered, href: "/wkhanadmin/orders" },
    ];

    return (
        <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {stats.map((stat, index) => (
                    <Card key={index}>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                            <stat.icon className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{stat.value}</div>
                            <Link href={stat.href}>
                                <Button variant="link" className="text-xs text-muted-foreground p-0 h-auto">View All</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid gap-4">
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Orders</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {orders.slice(0, 5).map(order => (
                                <div key={order.id} className="flex items-center">
                                    <div className="ml-4 space-y-1">
                                        <p className="text-sm font-medium leading-none">{order.customerName}</p>
                                        <p className="text-sm text-muted-foreground">{order.customerEmail}</p>
                                    </div>
                                    <div className="ml-auto font-medium">{order.productTitle}</div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
