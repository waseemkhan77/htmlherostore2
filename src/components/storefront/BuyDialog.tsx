
'use client';

import { useEffect, useActionState } from 'react';
import { useRouter } from 'next/navigation';
import type { Product } from '@/lib/types';
import { useFormStatus } from 'react-dom';
import { initiatePurchase } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ArrowRight, Wallet, Smartphone, ClipboardCopy } from 'lucide-react';
import Image from 'next/image';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const initialState = { success: false, orderId: null, errors: null, message: '' };

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full bg-accent hover:bg-accent/90" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      Submit Order
      <ArrowRight className="ml-2 h-4 w-4" />
    </Button>
  );
}

const EasypaisaIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-green-500"><title>Easypaisa</title><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm-1.07 16.348V7.652h1.61c2.478 0 4.49 2.011 4.49 4.49s-2.012 4.206-4.49 4.206h-1.61z"/><path d="M11.918 10.03v4.205h.643c1.328 0 2.403-1.075 2.403-2.403s-1.075-2.002-2.403-2.002h-.643z" fill="#fff"/></svg>
);

const JazzcashIcon = () => (
    <svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 fill-red-600"><title>Jazzcash</title><path d="M0 12C0 5.373 5.373 0 12 0s12 5.373 12 12-5.373 12-12 12S0 18.627 0 12zm13.19 2.477c1.373-.424 2.22-1.74 2.22-3.237 0-1.95-1.58-3.53-3.53-3.53h-3.4v8.51h3.33c1.78-.002 3.23-1.45 3.23-3.23a3.21 3.21 0 0 0-.85-.483zm-1.03-3.17c.75 0 1.35.6 1.35 1.35s-.6 1.35-1.35 1.35h-1.3v-2.7h1.3z" fill="#fff"/></svg>
);

const WalletAddress = ({ address, onCopy }: { address: string; onCopy: (text: string) => void }) => (
    <div className="mt-3 w-full">
        <Label htmlFor={`walletAddress-${address}`} className="text-xs text-muted-foreground">Wallet Address</Label>
        <div className="relative">
            <Input
                id={`walletAddress-${address}`}
                readOnly
                value={address}
                className="mt-1 text-center font-mono text-xs h-8 pr-8"
            />
            <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
                onClick={() => onCopy(address)}
            >
                <ClipboardCopy className="h-3 w-3" />
                <span className="sr-only">Copy</span>
            </Button>
        </div>
    </div>
);


export function BuyDialog({
  product,
  isOpen,
  onOpenChange,
}: {
  product: Product;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, dispatch] = useActionState(initiatePurchase, initialState);
  const router = useRouter();
  const { toast } = useToast();

  const discountedPrice = product.price * (1 - (product.discount ?? 0));

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied!', description: 'Address copied to clipboard.' });
  };

  useEffect(() => {
    if (state.success && state.orderId) {
      router.push(`/purchase-success?orderId=${state.orderId}`);
      onOpenChange(false);
    } else if (state.message && !state.success) {
      toast({
        title: 'Error',
        description: state.message,
        variant: 'destructive',
      });
    }
  }, [state, router, toast, onOpenChange]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90svh] flex flex-col">
        <DialogHeader>
          <DialogTitle className="font-headline text-2xl">Complete Your Purchase</DialogTitle>
          <DialogDescription>
            Purchase "{product.title}" for <b className="text-primary">${discountedPrice.toFixed(2)}</b>. 
            Follow the steps below to get your file.
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6 py-4 flex-grow overflow-y-auto pr-2 -mr-4">
          
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">1</span>
              <span>Choose Payment Method</span>
            </h3>
            <Tabs defaultValue="crypto" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="crypto"><Wallet className="mr-2" />Crypto</TabsTrigger>
                <TabsTrigger value="mobile"><Smartphone className="mr-2" />Mobile Wallet</TabsTrigger>
              </TabsList>
              <TabsContent value="crypto" className="p-4 rounded-b-lg rounded-tr-lg bg-muted/50 mt-0">
                  <Tabs defaultValue="binance-bep20" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                         <TabsTrigger value="binance-bep20">USDT (BEP20)</TabsTrigger>
                         <TabsTrigger value="trc20">USDT (TRC20)</TabsTrigger>
                      </TabsList>
                      <div className="mt-4 p-4 text-center border rounded-md bg-background">
                           <p className="text-sm text-muted-foreground mb-2">Scan the QR code or copy the address below</p>
                           <Image
                              src="https://placehold.co/200x200.png"
                              alt="Payment QR Code"
                              width={120}
                              height={120}
                              data-ai-hint="qr code"
                              className="rounded-md mx-auto"
                          />
                          <TabsContent value="binance-bep20" className="mt-2">
                              <WalletAddress address="0x1234567890abcdef1234567890abcdef12345678" onCopy={handleCopy} />
                          </TabsContent>
                          <TabsContent value="trc20" className="mt-2">
                               <WalletAddress address="TX1234567890abcdefghijklmnopqrstuvwxyZ" onCopy={handleCopy} />
                          </TabsContent>
                      </div>
                  </Tabs>
              </TabsContent>
              <TabsContent value="mobile" className="p-4 rounded-b-lg rounded-tr-lg bg-muted/50 mt-0 space-y-4">
                  <div className="p-4 border rounded-md bg-background">
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><EasypaisaIcon/> Easypaisa</h4>
                      <p><b>Account Title:</b> Admin Hero</p>
                      <p><b>Account Number:</b> 0300-1234567</p>
                  </div>
                  <div className="p-4 border rounded-md bg-background">
                      <h4 className="font-semibold flex items-center gap-2 mb-2"><JazzcashIcon/> Jazzcash</h4>
                      <p><b>Account Title:</b> Admin Hero</p>
                      <p><b>Account Number:</b> 0301-7654321</p>
                  </div>
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-sm font-bold">2</span>
              <span>Submit Your Details</span>
            </h3>
            <form action={dispatch} className="space-y-4 p-4 rounded-lg bg-muted/50 flex-grow flex flex-col justify-center">
              <input type="hidden" name="productId" value={product.id} />

              <div className="space-y-2">
                <Label htmlFor="customerName">Full Name</Label>
                <Input id="customerName" name="customerName" required />
                {state.errors?.customerName && (
                  <p className="text-sm text-destructive">
                    {state.errors.customerName}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email Address</Label>
                <Input
                  id="customerEmail"
                  name="customerEmail"
                  type="email"
                  required
                  placeholder="Your file will be sent here"
                />
                {state.errors?.customerEmail && (
                  <p className="text-sm text-destructive">
                    {state.errors.customerEmail}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentId">Transaction ID / Reference</Label>
                <Input
                  id="paymentId"
                  name="paymentId"
                  required
                  placeholder="Enter the payment transaction hash or reference"
                />
                {state.errors?.paymentId && (
                  <p className="text-sm text-destructive">
                    {state.errors.paymentId}
                  </p>
                )}
              </div>
              
              <DialogFooter className="pt-2 !mt-6">
                <SubmitButton />
              </DialogFooter>
            </form>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
