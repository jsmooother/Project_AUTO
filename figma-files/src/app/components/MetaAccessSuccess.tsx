import { Button } from "@/app/components/ui/button";
import { Card, CardContent } from "@/app/components/ui/card";
import { CheckCircle2, RefreshCw, Sparkles } from "lucide-react";

interface MetaAccessSuccessProps {
  onRefresh: () => void;
}

export function MetaAccessSuccess({ onRefresh }: MetaAccessSuccessProps) {
  return (
    <Card className="border-2 border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="text-center max-w-md mx-auto">
          <div className="w-16 h-16 rounded-full bg-green-600 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="h-8 w-8 text-white" />
          </div>
          
          <h3 className="text-2xl font-semibold mb-2 flex items-center justify-center gap-2">
            Access granted
            <Sparkles className="h-5 w-5 text-green-600" />
          </h3>
          
          <p className="text-gray-700 mb-6">
            Project AUTO can now manage ads in your Meta account. Refresh this page to continue
            setting up ads.
          </p>
          
          <Button size="lg" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh ad accounts
          </Button>
          
          <p className="text-xs text-gray-600 mt-4">
            You can revoke this access at any time from Meta Business Manager
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
