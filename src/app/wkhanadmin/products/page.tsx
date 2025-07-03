
'use client';

import { useState, useEffect, useTransition } from 'react';
import type { Product } from '@/lib/types';
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
import { Badge } from '@/components/ui/badge';
import { MoreHorizontal, PlusCircle, Trash2, Edit, Bot, Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { generateAIDescription, getProducts, saveProduct, deleteProduct } from '@/lib/actions';
import { Card } from '@/components/ui/card';

const ProductForm = ({ product, onSave, onCancel }: { product: Partial<Product> | null, onSave: (product: Partial<Product>) => void, onCancel: () => void }) => {
    const [formData, setFormData] = useState<Partial<Product>>(product || {});
    const [isGenerating, setIsGenerating] = useState(false);
    const [isSaving, startSaving] = useTransition();
    const { toast } = useToast();

    const handleGenerateDesc = async () => {
      if (!formData.title || !formData.category) {
        toast({ title: "Error", description: "Please enter a title and category first.", variant: "destructive" });
        return;
      }
      setIsGenerating(true);
      const description = await generateAIDescription(formData.title, formData.category);
      setFormData(prev => ({ ...prev, description }));
      setIsGenerating(false);
    }
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        startSaving(() => {
          onSave(formData);
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input id="title" value={formData.title || ''} onChange={e => setFormData({ ...formData, title: e.target.value })} required disabled={isSaving}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value as Product['category'] })} disabled={isSaving}>
                        <SelectTrigger><SelectValue placeholder="Select a category" /></SelectTrigger>
                        <SelectContent>
                            <SelectItem value="Telegram Mini Apps">Telegram Mini Apps</SelectItem>
                            <SelectItem value="Android Apps">Android Apps</SelectItem>
                            <SelectItem value="Websites">Websites</SelectItem>
                            <SelectItem value="Bots">Bots</SelectItem>
                            <SelectItem value="Tools">Tools</SelectItem>
                            <SelectItem value="Services">Services</SelectItem>
                            <SelectItem value="Games">Games</SelectItem>
                            <SelectItem value="Social Accounts">Social Accounts</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <div className="relative">
                <Textarea id="description" value={formData.description || ''} onChange={e => setFormData({ ...formData, description: e.target.value })} required className="pr-10" disabled={isSaving}/>
                <Button type="button" size="icon" variant="ghost" className="absolute top-2 right-2 h-7 w-7" onClick={handleGenerateDesc} disabled={isGenerating || isSaving}>
                  <Bot className={`h-4 w-4 ${isGenerating ? 'animate-spin' : ''}`} />
                </Button>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="price">Price</Label>
                    <Input id="price" type="number" step="0.01" value={formData.price || ''} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) })} required disabled={isSaving}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="discount">Discount (e.g., 0.1 for 10%)</Label>
                    <Input id="discount" type="number" step="0.01" value={formData.discount || ''} onChange={e => setFormData({ ...formData, discount: parseFloat(e.target.value) })} disabled={isSaving}/>
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="image">Image URL</Label>
                    <Input id="image" value={formData.image || ''} onChange={e => setFormData({ ...formData, image: e.target.value })} placeholder="https://placehold.co/600x400.png" required disabled={isSaving}/>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="livePreviewLink">Live Preview Link</Label>
                    <Input id="livePreviewLink" value={formData.livePreviewLink || ''} onChange={e => setFormData({ ...formData, livePreviewLink: e.target.value })} placeholder="#" required disabled={isSaving}/>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={onCancel} disabled={isSaving}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>
                    {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Save Product
                </Button>
            </DialogFooter>
        </form>
    );
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isProcessing, startTransition] = useTransition();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Partial<Product> | null>(null);
    const { toast } = useToast();

    const fetchAndSetProducts = async () => {
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
    };

    useEffect(() => {
        setIsLoading(true);
        fetchAndSetProducts().finally(() => setIsLoading(false));
    }, []);

    const handleSave = (productToSave: Partial<Product>) => {
        startTransition(async () => {
            const result = await saveProduct(productToSave);
            if (result.success) {
                await fetchAndSetProducts();
                toast({ title: 'Success', description: `Product ${productToSave.id ? 'updated' : 'created'} successfully.` });
                setIsDialogOpen(false);
                setSelectedProduct(null);
            } else {
                toast({ title: 'Error', description: result.message, variant: 'destructive' });
            }
        });
    };

    const handleDelete = () => {
        if (selectedProduct?.id) {
            startTransition(async () => {
                await deleteProduct(selectedProduct.id!);
                await fetchAndSetProducts();
                toast({ title: 'Success', description: 'Product deleted successfully.' });
                setIsDeleteDialogOpen(false);
                setSelectedProduct(null);
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
                <h2 className="text-2xl font-bold font-headline">Products</h2>
                <Button onClick={() => { setSelectedProduct({}); setIsDialogOpen(true); }}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
            </div>
            <Card>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Title</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead className="hidden md:table-cell">Sold</TableHead>
                            <TableHead className="hidden md:table-cell">Rating</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((product) => (
                            <TableRow key={product.id} className={isProcessing ? 'opacity-50' : ''}>
                                <TableCell className="font-medium">{product.title}</TableCell>
                                <TableCell><Badge variant="outline">{product.category}</Badge></TableCell>
                                <TableCell>${product.price.toFixed(2)}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.unitsSold}</TableCell>
                                <TableCell className="hidden md:table-cell">{product.rating.toFixed(1)}</TableCell>
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
                                            <DropdownMenuItem onClick={() => { setSelectedProduct(product); setIsDialogOpen(true); }} disabled={isProcessing}>
                                                <Edit className="mr-2 h-4 w-4" /> Edit
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive" onClick={() => { setSelectedProduct(product); setIsDeleteDialogOpen(true); }} disabled={isProcessing}>
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
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="font-headline">{selectedProduct?.id ? 'Edit Product' : 'Add New Product'}</DialogTitle>
                        <DialogDescription>
                            {selectedProduct?.id ? 'Update the details of your product.' : 'Fill in the details to create a new product.'}
                        </DialogDescription>
                    </DialogHeader>
                    <ProductForm product={selectedProduct} onSave={handleSave} onCancel={() => setIsDialogOpen(false)} />
                </DialogContent>
            </Dialog>

            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="font-headline">Are you sure?</DialogTitle>
                        <DialogDescription>This action cannot be undone. This will permanently delete the product "{selectedProduct?.title}".</DialogDescription>
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
