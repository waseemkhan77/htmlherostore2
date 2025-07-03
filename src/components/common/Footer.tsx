
import Link from "next/link";
import { Youtube, MessageCircle, Send } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-card border-t">
      <div className="container mx-auto px-4 py-6 text-center text-muted-foreground">
        <div className="flex justify-center gap-4 mb-4">
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
        <p className="text-sm">&copy; {new Date().getFullYear()} HTMLHero. All rights reserved.</p>
      </div>
    </footer>
  );
}
