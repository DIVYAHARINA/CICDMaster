import { useState } from "react";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNavbar from "@/components/MobileNavbar";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";

export default function Configuration() {
  const [githubToken, setGithubToken] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookSecret, setWebhookSecret] = useState("");
  const [slackWebhook, setSlackWebhook] = useState("");
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [slackNotifications, setSlackNotifications] = useState(true);
  const [buildRetention, setBuildRetention] = useState("30");
  const [nodeVersion, setNodeVersion] = useState("16");
  const [artifactStorage, setArtifactStorage] = useState("replit");

  const { toast } = useToast();

  const handleSaveGeneral = () => {
    toast({
      title: "Settings saved",
      description: "General settings have been updated successfully.",
    });
  };

  const handleSaveIntegrations = () => {
    if (!githubToken) {
      toast({
        title: "Validation Error",
        description: "GitHub token is required.",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Integrations updated",
      description: "Your integration settings have been saved.",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification settings saved",
      description: "Your notification preferences have been updated.",
    });
  };

  const handleGenerateWebhook = () => {
    // In a real app, this would generate a unique webhook URL
    setWebhookUrl("https://ci-cd-dashboard.example.repl.co/api/github/webhook");
    setWebhookSecret("whsec_" + Math.random().toString(36).substring(2, 15));
    
    toast({
      title: "Webhook generated",
      description: "New webhook URL and secret have been generated.",
    });
  };

  const handleResetToken = () => {
    setGithubToken("");
    
    toast({
      title: "Token reset",
      description: "GitHub token has been reset. Please enter a new one.",
    });
  };

  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 font-sans text-neutral-900 dark:text-neutral-100 min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-900 p-6">
          <div className="max-w-5xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">Configuration</h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Manage your CI/CD settings, integrations, and preferences
                </p>
              </div>
            </div>
            
            <Tabs defaultValue="general" className="space-y-4">
              <TabsList>
                <TabsTrigger value="general">General</TabsTrigger>
                <TabsTrigger value="integrations">Integrations</TabsTrigger>
                <TabsTrigger value="notifications">Notifications</TabsTrigger>
                <TabsTrigger value="environment">Environment</TabsTrigger>
              </TabsList>
              
              <TabsContent value="general" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>General Settings</CardTitle>
                    <CardDescription>
                      Configure general settings for your CI/CD pipelines
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="buildRetention">Build History Retention (days)</Label>
                        <Select value={buildRetention} onValueChange={setBuildRetention}>
                          <SelectTrigger id="buildRetention">
                            <SelectValue placeholder="Select retention period" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="7">7 days</SelectItem>
                            <SelectItem value="14">14 days</SelectItem>
                            <SelectItem value="30">30 days</SelectItem>
                            <SelectItem value="60">60 days</SelectItem>
                            <SelectItem value="90">90 days</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="artifactStorage">Artifact Storage Location</Label>
                        <Select value={artifactStorage} onValueChange={setArtifactStorage}>
                          <SelectTrigger id="artifactStorage">
                            <SelectValue placeholder="Select storage location" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="replit">Replit Storage</SelectItem>
                            <SelectItem value="s3">AWS S3</SelectItem>
                            <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="parallel-builds">Enable Parallel Builds</Label>
                        <Switch id="parallel-builds" defaultChecked />
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Allow multiple builds to run concurrently for different branches
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="auto-cancel">Auto-cancel Redundant Builds</Label>
                        <Switch id="auto-cancel" defaultChecked />
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Automatically cancel in-progress builds when new commits are pushed
                      </p>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveGeneral}>Save Changes</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="integrations" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>GitHub Integration</CardTitle>
                    <CardDescription>
                      Connect your GitHub repositories for CI/CD automation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="github-token">GitHub Access Token</Label>
                      <div className="flex space-x-2">
                        <Input
                          id="github-token"
                          type="password"
                          placeholder="GitHub personal access token"
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                        />
                        <Button variant="outline" onClick={handleResetToken}>Reset</Button>
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Create a token with 'repo', 'admin:repo_hook' scopes at GitHub Developer Settings
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Webhook Configuration</Label>
                      <div className="p-4 border rounded-md bg-neutral-50 dark:bg-neutral-800 space-y-4">
                        <div className="flex flex-col space-y-2">
                          <Label htmlFor="webhook-url">Webhook URL</Label>
                          <div className="flex space-x-2">
                            <Input
                              id="webhook-url"
                              readOnly
                              value={webhookUrl}
                              placeholder="No webhook URL generated"
                            />
                            <Button variant="outline" onClick={handleGenerateWebhook}>Generate</Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-col space-y-2">
                          <Label htmlFor="webhook-secret">Webhook Secret</Label>
                          <Input
                            id="webhook-secret"
                            readOnly
                            value={webhookSecret}
                            placeholder="No webhook secret generated"
                            type="password"
                          />
                        </div>
                        
                        {webhookUrl && (
                          <Alert className="mt-4">
                            <FontAwesomeIcon icon="info-circle" className="h-4 w-4 mr-2" />
                            <AlertTitle>Webhook Setup Instructions</AlertTitle>
                            <AlertDescription>
                              Add this webhook to your GitHub repository settings with content type set to 'application/json' and the secret shown above.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveIntegrations}>Save Integration</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="notifications" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Notification Settings</CardTitle>
                    <CardDescription>
                      Configure when and how you receive build notifications
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-4">
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="email-notifications">Email Notifications</Label>
                          <Switch 
                            id="email-notifications" 
                            checked={emailNotifications}
                            onCheckedChange={setEmailNotifications}
                          />
                        </div>
                        {emailNotifications && (
                          <div className="ml-6 mt-2 space-y-2">
                            <div className="flex items-center space-x-2">
                              <Switch id="email-success" defaultChecked />
                              <Label htmlFor="email-success">Successful builds</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="email-failure" defaultChecked />
                              <Label htmlFor="email-failure">Failed builds</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Switch id="email-deployment" defaultChecked />
                              <Label htmlFor="email-deployment">Deployments</Label>
                            </div>
                          </div>
                        )}
                      </div>
                      
                      <Separator />
                      
                      <div className="flex flex-col space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="slack-notifications">Slack Notifications</Label>
                          <Switch 
                            id="slack-notifications" 
                            checked={slackNotifications}
                            onCheckedChange={setSlackNotifications}
                          />
                        </div>
                        {slackNotifications && (
                          <div className="space-y-2">
                            <div className="ml-6 mt-2 space-y-2">
                              <div className="flex items-center space-x-2">
                                <Switch id="slack-success" defaultChecked />
                                <Label htmlFor="slack-success">Successful builds</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch id="slack-failure" defaultChecked />
                                <Label htmlFor="slack-failure">Failed builds</Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Switch id="slack-deployment" defaultChecked />
                                <Label htmlFor="slack-deployment">Deployments</Label>
                              </div>
                            </div>
                            
                            <div className="mt-4">
                              <Label htmlFor="slack-webhook">Slack Webhook URL</Label>
                              <Input
                                id="slack-webhook"
                                value={slackWebhook}
                                onChange={(e) => setSlackWebhook(e.target.value)}
                                placeholder="https://hooks.slack.com/services/..."
                              />
                              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                                Create a webhook URL in your Slack workspace settings
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-end">
                      <Button onClick={handleSaveNotifications}>Save Notification Settings</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
              
              <TabsContent value="environment" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Environment Configuration</CardTitle>
                    <CardDescription>
                      Set up runtime environments for your builds
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="node-version">Node.js Version</Label>
                        <Select value={nodeVersion} onValueChange={setNodeVersion}>
                          <SelectTrigger id="node-version">
                            <SelectValue placeholder="Select Node.js version" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="14">Node.js 14 LTS</SelectItem>
                            <SelectItem value="16">Node.js 16 LTS</SelectItem>
                            <SelectItem value="18">Node.js 18 LTS</SelectItem>
                            <SelectItem value="20">Node.js 20 LTS</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="build-command">Default Build Command</Label>
                        <Input id="build-command" defaultValue="npm run build" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="environment-variables">Environment Variables</Label>
                      <Textarea 
                        id="environment-variables" 
                        className="font-mono text-sm h-32"
                        placeholder="KEY=value
ANOTHER_KEY=another_value"
                      />
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Enter one variable per line in KEY=value format. These will be available in all builds.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="cache-npm">Cache npm dependencies</Label>
                        <Switch id="cache-npm" defaultChecked />
                      </div>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">
                        Speed up builds by caching npm/yarn dependencies between runs
                      </p>
                    </div>
                    
                    <Separator className="my-4" />
                    
                    <div className="flex justify-end">
                      <Button>Save Environment Configuration</Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
      
      <MobileNavbar />
    </div>
  );
}
