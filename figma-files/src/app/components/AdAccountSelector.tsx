import { useState } from "react";
import { Button } from "@/app/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/app/components/ui/radio-group";
import { Label } from "@/app/components/ui/label";
import { Alert, AlertDescription } from "@/app/components/ui/alert";
import { CheckCircle2, Loader2, AlertTriangle, RefreshCw, ExternalLink } from "lucide-react";

// Meta icon component
function MetaIcon({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 36 36" className={className} fill="currentColor">
      <path d="M20.3 12.3c-1.2-2.2-2.8-3.7-4.6-3.7-3.1 0-5.4 3.9-5.4 9.4 0 2.4.4 4.5 1.2 6.1 1.2 2.2 2.8 3.7 4.6 3.7 3.1 0 5.4-3.9 5.4-9.4 0-2.4-.4-4.5-1.2-6.1zm10.4 3.5c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4 1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2zm-16.2 9.9c1.6-1.5 3.5-3.8 5-6.7 1.1-2.1 1.9-4.1 2.3-5.8.2-.5.3-.8.4-1.1h.2c-2.5 0-4.6 2.4-6.3 6.2-.7 1.7-1.3 3.5-1.6 5.4z"/>
    </svg>
  );
}

export type AdAccount = {
  id: string;
  name: string;
  account_id: string;
  account_status: number;
  currency: string;
  timezone_name: string;
};

type AdAccountSelectorProps = {
  state: "loading" | "loaded" | "error" | "no-accounts" | "token-expired";
  accounts?: AdAccount[];
  selectedAccountId?: string;
  onSelect: (account: AdAccount) => void;
  onRefresh?: () => void;
  onReconnect?: () => void;
  errorMessage?: string;
};

export function AdAccountSelector({
  state,
  accounts = [],
  selectedAccountId,
  onSelect,
  onRefresh,
  onReconnect,
  errorMessage,
}: AdAccountSelectorProps) {
  const [localSelectedId, setLocalSelectedId] = useState<string | undefined>(selectedAccountId);

  const handleSelect = (accountId: string) => {
    const account = accounts.find((acc) => acc.id === accountId);
    if (account) {
      setLocalSelectedId(accountId);
      onSelect(account);
    }
  };

  // Loading state
  if (state === "loading") {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <MetaIcon className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <CardTitle>Select Ad Account</CardTitle>
              <CardDescription>Fetching your Meta ad accounts...</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-12 w-12 text-blue-600 animate-spin mb-4" />
            <p className="text-sm text-gray-600">Loading ad accounts from Meta...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Token expired state
  if (state === "token-expired") {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-yellow-900">Meta Connection Expired</CardTitle>
              <CardDescription className="text-yellow-800">
                Your Meta OAuth token has expired
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="border-yellow-200 bg-white">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-gray-700">
                Meta OAuth tokens expire every 60 days for security. Please reconnect your Meta
                account to continue using automated ads.
              </AlertDescription>
            </Alert>
            <Button onClick={onReconnect} className="w-full">
              <MetaIcon className="h-4 w-4 mr-2" />
              Reconnect Meta Account
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Error state
  if (state === "error") {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-900">Error Loading Ad Accounts</CardTitle>
              <CardDescription className="text-red-800">
                Unable to fetch your Meta ad accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="border-red-200 bg-white">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-sm text-gray-700">
                {errorMessage || "There was a problem connecting to the Meta API. Please try again."}
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button onClick={onRefresh} variant="outline" className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Retry
              </Button>
              <Button onClick={onReconnect} className="flex-1">
                <MetaIcon className="h-4 w-4 mr-2" />
                Reconnect Meta
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // No accounts state
  if (state === "no-accounts") {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-yellow-100 flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <CardTitle className="text-yellow-900">No Ad Accounts Found</CardTitle>
              <CardDescription className="text-yellow-800">
                Your Meta account doesn't have any ad accounts
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Alert className="border-yellow-200 bg-white">
              <AlertTriangle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-sm text-gray-700">
                To run ads on Meta, you need to create an ad account in Meta Business Manager first.
                Once created, come back and refresh this page.
              </AlertDescription>
            </Alert>
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => window.open("https://business.facebook.com/settings/ad-accounts", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Open Meta Business Manager
              </Button>
              <Button onClick={onRefresh} className="flex-1">
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Loaded state - show account selection
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
            <MetaIcon className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <CardTitle>Select Ad Account</CardTitle>
            <CardDescription>
              Choose which Meta ad account to use for automated advertising
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <Alert className="border-blue-200 bg-blue-50">
            <AlertDescription className="text-sm text-blue-900">
              We found {accounts.length} ad {accounts.length === 1 ? "account" : "accounts"} connected to your Meta Business account. Select one to continue.
            </AlertDescription>
          </Alert>

          <RadioGroup
            value={localSelectedId}
            onValueChange={handleSelect}
            className="space-y-3"
          >
            {accounts.map((account) => {
              const isSelected = localSelectedId === account.id;
              const isActive = account.account_status === 1;

              return (
                <div
                  key={account.id}
                  className={`relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
                    isSelected
                      ? "border-blue-600 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                  onClick={() => handleSelect(account.id)}
                >
                  <div className="flex items-start gap-3">
                    <RadioGroupItem
                      value={account.id}
                      id={account.id}
                      className="mt-1"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Label
                          htmlFor={account.id}
                          className="font-medium cursor-pointer"
                        >
                          {account.name}
                        </Label>
                        {isActive ? (
                          <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-gray-100 text-gray-600 border-gray-200 text-xs">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-600 space-y-0.5">
                        <div>Account ID: {account.account_id}</div>
                        <div>Currency: {account.currency}</div>
                        <div>Timezone: {account.timezone_name}</div>
                      </div>
                    </div>
                    {isSelected && (
                      <CheckCircle2 className="h-5 w-5 text-blue-600 absolute top-4 right-4" />
                    )}
                  </div>
                </div>
              );
            })}
          </RadioGroup>

          {localSelectedId && (
            <div className="flex justify-end pt-2">
              <Button
                onClick={() => {
                  const account = accounts.find((acc) => acc.id === localSelectedId);
                  if (account) onSelect(account);
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-2" />
                Confirm Selection
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
