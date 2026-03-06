import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, QrCode } from "lucide-react";
import Link from "next/link";

export default function ExpiredPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-500/10 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      <Card className="w-full max-w-sm bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
        <CardHeader className="text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-red-500/20 mx-auto flex items-center justify-center">
            <Clock className="w-8 h-8 text-red-500" />
          </div>
          <div>
            <CardTitle className="text-xl">Link Expired</CardTitle>
            <CardDescription className="mt-2 text-muted-foreground">The QR code you scanned has past its expiration date and is no longer accessible.</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="flex justify-center flex-col items-center">
             <QrCode className="w-24 h-24 text-muted border-4 border-dashed rounded-xl p-4 opacity-50" />
        </CardContent>
        <CardFooter>
           <Link href="/" className="w-full">
             <Button variant="outline" className="w-full">
               Learn about Scanova
             </Button>
           </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
