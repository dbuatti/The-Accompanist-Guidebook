import { Music } from 'lucide-react';
import AuthContainer from '@/components/AuthContainer';

export const dynamicParams = false;

export default async function AuthPage({
  params,
}: {
  params: Promise<{ path: string }>;
}) {
  const { path } = await params;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      <div className="absolute inset-0 sheet-music-texture pointer-events-none" />
      
      <div className="z-10 w-full max-w-md p-4">
        <div className="text-center mb-8 space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary">
            <Music size={32} />
          </div>
          <h1 className="text-3xl font-serif font-bold text-primary">The Accompanist Guidebook</h1>
          <p className="text-muted-foreground italic">Sign in to access your learning portal</p>
        </div>

        <div className="bg-card p-8 rounded-2xl shadow-xl border border-border/50">
          <AuthContainer path={path} />
        </div>

        <p className="text-center text-xs text-muted-foreground uppercase tracking-widest mt-8">
          Private Educational Resource
        </p>
      </div>
    </div>
  );
}