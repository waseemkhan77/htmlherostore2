
'use client';

import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

function PurchaseSuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="flex-grow flex items-center justify-center">
        <Card className="w-full max-w-lg text-center">
            <CardHeader>
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                    <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                </div>
            </CardHeader>
            <CardContent className="space-y-4 px-8 pb-8">
                <CardTitle className="font-headline text-3xl">Thank You For Your Order!</CardTitle>
                <CardDescription className="text-base text-muted-foreground">
                    We have received your submission. We will verify your payment shortly and send the product files to your email address.
                </CardDescription>
                {orderId && (
                     <div className="pt-2">
                        <p className="text-sm text-muted-foreground">
                            Your Order ID is:
                        </p>
                        <p className="font-mono text-lg text-foreground bg-muted rounded-md py-2 mt-1">
                          {orderId}
                        </p>
                    </div>
                )}
                <Button asChild size="lg" className="mt-6 w-full">
                    <Link href="/">Return to Store</Link>
                </Button>
            </CardContent>
        </Card>
    </div>
  );
}

export default function PurchaseSuccessPage() {
    return (
        <Suspense fallback={
            <div className="flex h-screen w-full items-center justify-center bg-background">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        }>
            <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-grow container mx-auto px-4 py-8">
                     <PurchaseSuccessContent />
                </main>
                <Footer />
            </div>
        </Suspense>
    );
}
