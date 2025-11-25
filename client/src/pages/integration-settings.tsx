import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Mail, CheckCircle2, XCircle, Send, Database, AlertCircle, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { EmailSettings } from "@shared/schema";

export default function IntegrationSettings() {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    provider: "gmail",
    recipientEmail: "",
    senderEmail: "",
    smtpHost: "",
    smtpPort: "",
    smtpUsername: "",
    smtpPassword: "",
    apiKey: "",
  });
  const [isTesting, setIsTesting] = useState(false);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const { data: settings, isLoading } = useQuery<EmailSettings>({
    queryKey: ["/api/email-settings"],
  });

  const { data: systemSettings } = useQuery<{ logoUrl?: string | null }>({
    queryKey: ["/api/system-settings"],
  });

  const saveMutation = useMutation({
    mutationFn: (data: typeof formData) => apiRequest("POST", "/api/email-settings", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/email-settings"] });
      toast({ title: "Email settings saved successfully" });
    },
  });

  const testMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/email-settings/test"),
    onSuccess: () => {
      toast({ 
        title: "Test email sent!", 
        description: "Check your inbox for the test message." 
      });
      setIsTesting(false);
    },
    onError: () => {
      toast({
        title: "Test failed",
        description: "Could not send test email. Please check your configuration.",
        variant: "destructive",
      });
      setIsTesting(false);
    },
  });

  // Initialize form with existing settings
  useState(() => {
    if (settings) {
      setFormData({
        provider: settings.provider || "gmail",
        recipientEmail: settings.recipientEmail,
        senderEmail: settings.senderEmail || "",
        smtpHost: settings.smtpHost || "",
        smtpPort: settings.smtpPort?.toString() || "",
        smtpUsername: settings.smtpUsername || "",
        smtpPassword: settings.smtpPassword || "",
        apiKey: settings.apiKey || "",
      });
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveMutation.mutate(formData);
  };

  const handleTestEmail = () => {
    setIsTesting(true);
    testMutation.mutate();
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploadingLogo(true);
      const reader = new FileReader();
      reader.onload = async (event) => {
        const dataUrl = event.target?.result as string;
        await apiRequest("POST", "/api/system-settings", { logoUrl: dataUrl });
        setLogoUrl(dataUrl);
        toast({ title: "Logo uploaded successfully!" });
        queryClient.invalidateQueries({ queryKey: ["/api/system-settings"] });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: "Upload failed",
        description: "Could not upload logo. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploadingLogo(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-semibold" data-testid="heading-integration">Integration Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure email notifications for order fulfillment
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Email Notifications
              </CardTitle>
              <CardDescription>
                Receive automated emails when transfers are marked as received
              </CardDescription>
            </div>
            {settings?.configured ? (
              <Badge className="bg-green-100 text-green-800" data-testid="badge-configured">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Configured
              </Badge>
            ) : (
              <Badge variant="secondary" data-testid="badge-not-configured">
                <XCircle className="h-3 w-3 mr-1" />
                Not Configured
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="provider">Email Service Provider</Label>
              <Select
                value={formData.provider}
                onValueChange={(value) => setFormData({ ...formData, provider: value })}
              >
                <SelectTrigger id="provider" data-testid="select-provider">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gmail">Gmail</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="resend">Resend</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {formData.provider === "gmail" && "Uses Gmail API for sending emails"}
                {formData.provider === "sendgrid" && "Uses SendGrid for transactional emails"}
                {formData.provider === "resend" && "Uses Resend for email delivery"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="recipientEmail">Recipient Email Address</Label>
              <Input
                id="recipientEmail"
                type="email"
                value={formData.recipientEmail}
                onChange={(e) => setFormData({ ...formData, recipientEmail: e.target.value })}
                placeholder="shabsm4@gmail.com"
                required
                data-testid="input-recipient-email"
              />
              <p className="text-xs text-muted-foreground">
                Email address that will receive notifications when orders are fulfilled
              </p>
            </div>

            {formData.provider === "gmail" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="smtpUsername">Gmail Address</Label>
                  <Input
                    id="smtpUsername"
                    type="email"
                    value={formData.smtpUsername}
                    onChange={(e) => setFormData({ ...formData, smtpUsername: e.target.value })}
                    placeholder="your-email@gmail.com"
                    data-testid="input-smtp-username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="smtpPassword">Gmail App Password</Label>
                  <Input
                    id="smtpPassword"
                    type="password"
                    value={formData.smtpPassword}
                    onChange={(e) => setFormData({ ...formData, smtpPassword: e.target.value })}
                    placeholder="16-character app password"
                    data-testid="input-smtp-password"
                  />
                  <p className="text-xs text-muted-foreground">
                    Get your app password from{" "}
                    <a href="https://myaccount.google.com/apppasswords" target="_blank" rel="noopener noreferrer" className="text-primary underline">
                      Google App Passwords
                    </a>
                  </p>
                </div>
              </>
            )}

            {formData.provider === "sendgrid" && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">SendGrid API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="SG.xxxxxxxxxxxxxxxxxx"
                  data-testid="input-api-key"
                />
              </div>
            )}

            {formData.provider === "resend" && (
              <div className="space-y-2">
                <Label htmlFor="apiKey">Resend API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  value={formData.apiKey}
                  onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                  placeholder="re_xxxxxxxxxxxxxxxxxx"
                  data-testid="input-api-key"
                />
              </div>
            )}

            <div className="bg-muted p-4 rounded-md space-y-2">
              <h4 className="font-medium text-sm">What's included in notifications:</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Transfer ID and details (from/to locations, driver, vehicle)</li>
                <li>• Complete list of products transferred</li>
                <li>• Shortage information (if any items were short)</li>
                <li>• Damage reports (if any items were damaged)</li>
                <li>• Fulfillment timestamp</li>
              </ul>
            </div>

            <div className="flex items-center gap-3">
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                data-testid="button-save-settings"
              >
                {saveMutation.isPending ? "Saving..." : "Save Configuration"}
              </Button>
              
              {settings?.configured && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestEmail}
                  disabled={isTesting || testMutation.isPending}
                  data-testid="button-test-email"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {isTesting || testMutation.isPending ? "Sending..." : "Send Test Email"}
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                Logo Settings
              </CardTitle>
              <CardDescription>
                Upload a custom logo to display on login and top of the app
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {systemSettings?.logoUrl && (
            <div className="border rounded-lg p-4 bg-muted/50">
              <p className="text-sm font-medium mb-2">Current Logo:</p>
              <img 
                src={systemSettings.logoUrl} 
                alt="Current Logo" 
                className="h-16 w-auto object-contain"
                data-testid="preview-logo"
              />
            </div>
          )}
          
          <div className="space-y-2">
            <Label htmlFor="logo-upload">Upload Logo</Label>
            <Input
              id="logo-upload"
              type="file"
              accept="image/*"
              onChange={handleLogoUpload}
              disabled={isUploadingLogo}
              data-testid="input-logo-upload"
            />
            <p className="text-xs text-muted-foreground">
              Recommended: PNG or JPG, max 1MB, square or landscape format works best
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Integration Guide</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Gmail Setup</h4>
            <p className="text-sm text-muted-foreground">
              Gmail integration uses the Replit connector which handles OAuth authentication automatically.
              Simply save your recipient email address and the system will be ready to send notifications.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">SendGrid Setup</h4>
            <p className="text-sm text-muted-foreground">
              For SendGrid, you'll need to configure your API key in the Replit Secrets tab with the key
              SENDGRID_API_KEY. Then enter your recipient email here.
            </p>
          </div>

          <div>
            <h4 className="font-medium mb-2">Resend Setup</h4>
            <p className="text-sm text-muted-foreground">
              For Resend, add your API key to Replit Secrets as RESEND_API_KEY, then configure your recipient
              email address here.
            </p>
          </div>

          <div className="bg-blue-50 dark:bg-blue-950 p-4 rounded-md border border-blue-200 dark:border-blue-900">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              <strong>Note:</strong> Email notifications are sent automatically when a transfer is marked as 
              "Received" in the Receive Transfers section. No manual action is required once configured.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Firebase Data Sync
          </CardTitle>
          <CardDescription>
            Your data is automatically synced with Firebase on every login
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-green-50 dark:bg-green-950 p-4 rounded-md border border-green-200 dark:border-green-900">
            <p className="text-sm text-green-900 dark:text-green-100">
              ✓ Automatic synchronization is enabled. Your data will be kept up to date with Firebase on each login without any manual action required.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
