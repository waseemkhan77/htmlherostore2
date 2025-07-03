"use client";

import { useState, useMemo, useEffect } from 'react';
import type { Product } from '@/lib/types';
import { getProducts } from '@/lib/actions';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import Link from 'next/link';
import { BuyDialog } from '@/components/storefront/BuyDialog';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Search, Star, ExternalLink, ShoppingCart, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';


const ProductCard = ({ product }: { product: Product }) => {
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [isDescriptionModalOpen, setIsDescriptionModalOpen] = useState(false);
  const discountedPrice = product.price * (1 - (product.discount ?? 0));
  const showReadMore = product.description.length > 120;

  return (
    <>
      <Card className="flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
        <CardHeader className="p-0 relative">
          {product.discount && (
            <Badge className="absolute top-2 right-2 z-10 bg-accent text-accent-foreground" variant="default">{`${product.discount * 100}% OFF`}</Badge>
          )}
          <Image
            src={product.image}
            alt={product.title}
            width={600}
            height={400}
            className="w-full h-48 object-cover"
            data-ai-hint="website template screenshot"
          />
        </CardHeader>
        <CardContent className="p-4 flex-grow">
          <CardTitle className="font-headline text-lg mb-2">{product.title}</CardTitle>
          <CardDescription className="text-sm line-clamp-3">{product.description}</CardDescription>
          {showReadMore && (
            <button
              onClick={() => setIsDescriptionModalOpen(true)}
              className="text-sm text-primary hover:underline font-medium mt-1"
            >
              Show more...
            </button>
          )}
        </CardContent>
        <CardFooter className="p-4 pt-0 flex flex-col items-start">
          <div className="w-full flex justify-between items-center mb-4">
            <div>
              {product.discount ? (
                <p className="text-sm text-muted-foreground line-through">${product.price.toFixed(2)}</p>
              ) : <div className='h-[20px]'/>}
              <p className="text-2xl font-bold font-headline text-primary">${discountedPrice.toFixed(2)}</p>
            </div>
            <div className="text-right">
              <div className="flex items-center justify-end gap-1 text-sm text-muted-foreground">
                <Star className="w-4 h-4 text-accent fill-accent" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{product.unitsSold} sold</p>
            </div>
          </div>
          <div className="w-full grid grid-cols-2 gap-2">
            <Button asChild variant="outline">
              <Link href={product.livePreviewLink} target="_blank">
                <ExternalLink className="mr-2" /> Live Preview
              </Link>
            </Button>
            <Button onClick={() => setIsBuyModalOpen(true)} className="bg-accent hover:bg-accent/90">
              <ShoppingCart className="mr-2" /> Buy Now
            </Button>
          </div>
        </CardFooter>
      </Card>
      <BuyDialog product={product} isOpen={isBuyModalOpen} onOpenChange={setIsBuyModalOpen} />
      <Dialog open={isDescriptionModalOpen} onOpenChange={setIsDescriptionModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-headline">{product.title}</DialogTitle>
          </DialogHeader>
          <div className="py-2 max-h-[60vh] overflow-y-auto pr-4">
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{product.description}</p>
          </div>
          <DialogFooter>
              <Button variant="outline" onClick={() => setIsDescriptionModalOpen(false)}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const categories: Product['category'][] = ['Telegram Mini Apps', 'Android Apps', 'Websites', 'Bots', 'Tools', 'Services', 'Games', 'Social Accounts'];

  useEffect(() => {
    const fetchProducts = async () => {
        setIsLoading(true);
        const fetchedProducts = await getProducts();
        setProducts(fetchedProducts);
        setIsLoading(false);
    };
    fetchProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
        const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
        const matchesSearch = !searchQuery || 
          product.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
  }, [searchQuery, products, selectedCategory]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <section className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
            The Ultimate Digital Marketplace
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
            Your one-stop shop to buy and sell Telegram Mini Apps, mobile apps, websites, social accounts, bots, tools, and game accounts.
          </p>
        </section>

        <div className="mb-8 max-w-2xl mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search by title or keyword..."
              className="pl-10 w-full h-12 rounded-full shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-12">
            <Button 
                variant={selectedCategory === 'All' ? 'default' : 'outline'}
                onClick={() => setSelectedCategory('All')}
                className="rounded-full"
            >
                All
            </Button>
            {categories.map(category => (
                <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="rounded-full"
                >
                    {category}
                </Button>
            ))}
        </div>

        {isLoading ? (
            <div className="flex justify-center py-16">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map(product => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-xl text-muted-foreground">No products found matching your criteria.</p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
