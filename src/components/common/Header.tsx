
import Link from 'next/link';
import { LayoutTemplate, Youtube, MessageCircle, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <LayoutTemplate className="h-7 w-7 text-primary" />
          <span className="text-xl font-bold font-headline text-primary">HTMLHero</span>
        </Link>
        <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-4">
                <Link href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Youtube className="h-6 w-6" />
                    <span className="sr-only">YouTube</span>
                </Link>
                <Link href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <MessageCircle className="h-6 w-6" />
                    <span className="sr-only">WhatsApp</span>
                </Link>
                <Link href="#" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
                    <Send className="h-6 w-6" />
                    <span className="sr-only">Telegram</span>
                </Link>
            </div>
            <Button variant="outline" asChild>
              <Link href="/my-apps">My Apps</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/sell-your-product">Sell Product</Link>
            </Button>
        </div>
      </div>
    </header>
  );
}
