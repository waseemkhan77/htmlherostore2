
'use client';

import { useActionState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import Link from 'next/link';

import { submitSellRequest } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, MessageCircle, Send } from 'lucide-react';

const initialState = { success: false, errors: null, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Submit For Review
    </Button>
  );
}

export default function SellYourProductPage() {
  const [state, dispatch] = useActionState(submitSellRequest, initialState);
  const { toast } = useToast();
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.success) {
      router.push('/sell-request-success');
    } else if (state.message && !state.success && state.errors === null) {
      toast({
        title: 'Submission Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, toast, router]);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
        <Card className="w-full max-w-2xl">
          <CardHeader>
            <CardTitle className="font-headline text-3xl">Sell Your Product</CardTitle>
            <CardDescription>
              Have a high-quality digital product? Submit it for review. We'll list it on our marketplace if it meets our standards.
            </CardDescription>
          </CardHeader>
          <form ref={formRef} action={dispatch}>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="productName">Product Name</Label>
                        <Input id="productName" name="productName" required />
                        {state.errors?.productName && <p className="text-sm text-destructive">{state.errors.productName}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="productLink">Product Link</Label>
                        <Input id="productLink" name="productLink" type="url" placeholder="https://example.com/my-product" required />
                        {state.errors?.productLink && <p className="text-sm text-destructive">{state.errors.productLink}</p>}
                    </div>
                </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Your Price (USD)</Label>
                        <Input id="price" name="price" type="number" step="0.01" required />
                        {state.errors?.price && <p className="text-sm text-destructive">{state.errors.price}</p>}
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="phone">Contact Number (WhatsApp)</Label>
                        <Input id="phone" name="phone" type="tel" required />
                        {state.errors?.phone && <p className="text-sm text-destructive">{state.errors.phone}</p>}
                    </div>
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="email">Your Email</Label>
                    <Input id="email" name="email" type="email" required />
                    {state.errors?.email && <p className="text-sm text-destructive">{state.errors.email}</p>}
                </div>
                <div className="space-y-2">
                    <Label htmlFor="message">Message / Description</Label>
                    <Textarea id="message" name="message" placeholder="Briefly describe your product and why it's a good fit for our store." required />
                    {state.errors?.message && <p className="text-sm text-destructive">{state.errors.message}</p>}
                </div>
                
                 <div className="!mt-6 text-center text-sm text-muted-foreground p-4 bg-muted rounded-lg">
                    <p className="font-semibold">Want a faster response or have questions?</p>
                    <p>Contact us directly for a quick review of your product.</p>
                    <div className="flex justify-center gap-4 mt-3">
                        <Button asChild variant="outline" size="sm">
                            <Link href="#" target="_blank">
                                <MessageCircle className="mr-2"/> WhatsApp
                            </Link>
                        </Button>
                         <Button asChild variant="outline" size="sm">
                            <Link href="#" target="_blank">
                                <Send className="mr-2"/> Telegram
                            </Link>
                        </Button>
                    </div>
                </div>
            </CardContent>
            <CardFooter>
              <SubmitButton />
            </CardFooter>
          </form>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
