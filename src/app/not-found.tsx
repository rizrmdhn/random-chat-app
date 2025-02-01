import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-[350px] text-center">
        <CardHeader>
          <div className="mb-4 flex justify-center">
            <AlertCircle className="text-destructive h-12 w-12" />
          </div>
          <h1 className="text-4xl font-bold">404</h1>
          <p className="text-muted-foreground">Page Not Found</p>
        </CardHeader>
        <CardContent>
          <p className="mb-4">
            The page you are looking for doesn&apos;t exist or has been moved.
          </p>
          <Button asChild>
            <Link href="/">Return Home</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
