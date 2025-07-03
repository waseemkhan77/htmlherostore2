
import { getMyApps } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Header } from '@/components/common/Header';
import { Footer } from '@/components/common/Footer';
import { Download } from 'lucide-react';

export default async function MyAppsPage() {
    const myApps = await getMyApps();

    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-grow container mx-auto px-4 py-8">
                <section className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold font-headline text-primary mb-4">
                        Our Apps
                    </h1>
                    <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                        Check out our collection of apps, available on the Google Play Store.
                    </p>
                </section>

                {myApps.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
                        {myApps.map(app => (
                            <Card key={app.id} className="flex flex-col overflow-hidden text-center items-center">
                                <CardHeader className="p-6">
                                    <Image
                                        src={app.image}
                                        alt={app.name}
                                        width={128}
                                        height={128}
                                        className="w-32 h-32 object-cover rounded-2xl shadow-lg"
                                        data-ai-hint="app icon"
                                    />
                                </CardHeader>
                                <CardContent className="p-4 flex-grow">
                                    <CardTitle className="font-headline text-xl mb-2">{app.name}</CardTitle>
                                </CardContent>
                                <CardFooter className="p-6 pt-0 w-full">
                                    <Button asChild className="w-full">
                                        <Link href={app.installLink} target="_blank">
                                            <Download className="mr-2" /> Install Now
                                        </Link>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16">
                        <p className="text-xl text-muted-foreground">No apps have been added yet.</p>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}
