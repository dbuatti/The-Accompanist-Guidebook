import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 text-center">
      <h1 className="text-2xl font-serif font-bold text-primary mb-4">The Accompanist Guidebook</h1>
      <p className="text-muted-foreground mb-8">Welcome to the portal. Please sign in to continue.</p>
      <Link 
        href="/login" 
        className="bg-primary text-primary-foreground px-8 py-3 rounded-full font-serif hover:bg-primary/90 transition-colors"
      >
        Go to Login
      </Link>
    </div>
  );
}