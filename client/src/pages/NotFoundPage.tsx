import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

export const NotFoundPage = () => {
  return (
    <div className="mx-auto flex max-w-md flex-col items-center py-20 text-center">
      <p className="text-5xl font-semibold tracking-tight">404</p>
      <h1 className="mt-4 text-lg font-semibold">Page not found</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        The page you're looking for doesn't exist or was moved.
      </p>
      <Button asChild className="mt-6">
        <Link to="/issues">
          <ArrowLeft className="h-4 w-4" />
          Back to issues
        </Link>
      </Button>
    </div>
  );
}
