
'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';

export default function SellRequestSuccessPage() {
  return (
    <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
             <Card className="w-full max-w-lg text-center">
                <CardHeader>
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/50">
                        <CheckCircle2 className="h-10 w-10 text-green-600 dark:text-green-400" />
                    </div>
                </CardHeader>
                <CardContent className="space-y-4 px-8 pb-8">
                    <CardTitle className="font-headline text-3xl">Submission Received!</CardTitle>
                    <CardDescription className="text-base text-muted-foreground">
                        Thank you for submitting your product. Our team will review it and get back to you via email shortly.
                    </CardDescription>
                    <Button asChild size="lg" className="mt-6 w-full">
                        <Link href="/">Return to Store</Link>
                    </Button>
                </CardContent>
            </Card>
        </main>
        <Footer />
    </div>
  );
}
