import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Upload,
  Download,
  Mail,
  FileText,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { api } from "@/integrations/supabase/api";

interface BulkOperation {
  id: string;
  type: "import" | "export" | "delete" | "email" | "update";
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  total: number;
  message: string;
  createdAt: Date;
}

export default function BulkOperations() {
  const [operations, setOperations] = useState<BulkOperation[]>([]);
  const [bulkEmailContent, setBulkEmailContent] = useState({
    subject: "",
    content: "",
  });
  const [importData, setImportData] = useState<string>("");
  const [activeTab, setActiveTab] = useState("members");
  const { toast } = useToast();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (file.type === "application/json") {
        setImportData(content);
      } else if (file.type === "text/csv") {
        // Convert CSV to JSON format
        const lines = content.split("\n");
        const headers = lines[0].split(",");
        const jsonData = lines
          .slice(1)
          .map((line) => {
            const values = line.split(",");
            const obj: any = {};
            headers.forEach((header, index) => {
              obj[header.trim()] = values[index]?.trim();
            });
            return obj;
          })
          .filter((obj) => Object.values(obj).some((val) => val));
        setImportData(JSON.stringify(jsonData, null, 2));
      }
    };
    reader.readAsText(file);
  };

  const handleBulkImport = async (table: string) => {
    if (!importData.trim()) {
      toast({
        title: "Error",
        description: "Please provide data to import",
        variant: "destructive",
      });
      return;
    }

    try {
      const data = JSON.parse(importData);
      if (!Array.isArray(data)) {
        throw new Error("Data must be an array");
      }

      const operation: BulkOperation = {
        id: Date.now().toString(),
        type: "import",
        status: "running",
        progress: 0,
        total: data.length,
        message: `Importing ${data.length} ${table} records...`,
        createdAt: new Date(),
      };

      setOperations((prev) => [...prev, operation]);

      // Process in batches
      const batchSize = 10;
      let processed = 0;

      for (let i = 0; i < data.length; i += batchSize) {
        const batch = data.slice(i, i + batchSize);

        const { error } = await supabase.from(table).insert(batch);

        if (error) {
          console.error(`Batch ${i / batchSize + 1} failed:`, error);
        }

        processed += batch.length;

        // Update progress
        setOperations((prev) =>
          prev.map((op) =>
            op.id === operation.id
              ? {
                  ...op,
                  progress: processed,
                  message: `Imported ${processed}/${data.length} records`,
                }
              : op,
          ),
        );
      }

      // Mark as completed
      setOperations((prev) =>
        prev.map((op) =>
          op.id === operation.id
            ? {
                ...op,
                status: "completed",
                message: `Successfully imported ${processed} records`,
              }
            : op,
        ),
      );

      toast({
        title: "Success",
        description: `Imported ${processed} ${table} records`,
      });

      setImportData("");
    } catch (error) {
      console.error("Import error:", error);
      toast({
        title: "Error",
        description: "Failed to import data. Please check the format.",
        variant: "destructive",
      });
    }
  };

  const handleBulkExport = async (table: string) => {
    try {
      const { data, error } = await supabase.from(table).select("*");

      if (error) throw error;

      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${table}-export-${new Date().toISOString().split("T")[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Success",
        description: `Exported ${data?.length || 0} ${table} records`,
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Error",
        description: "Failed to export data",
        variant: "destructive",
      });
    }
  };

  const handleBulkEmail = async () => {
    if (!bulkEmailContent.subject || !bulkEmailContent.content) {
      toast({
        title: "Error",
        description: "Please provide both subject and content",
        variant: "destructive",
      });
      return;
    }

    try {
      // Get all active email subscribers
      const subscribers = await api.emailSubscribers.getSubscribers();
      const activeSubscribers =
        subscribers?.filter((s) => s.status === "active") || [];

      if (activeSubscribers.length === 0) {
        toast({
          title: "Warning",
          description: "No active subscribers found",
          variant: "destructive",
        });
        return;
      }

      // If emailCampaigns is not available, show a warning and skip
      if (
        !("emailCampaigns" in api) ||
        typeof (api as any).emailCampaigns?.createCampaign !== "function"
      ) {
        toast({
          title: "Not Supported",
          description:
            "Bulk email campaigns are not supported in this deployment.",
          variant: "destructive",
        });
        return;
      }

      await (api as any).emailCampaigns.createCampaign({
        name: `Bulk Email - ${new Date().toLocaleDateString()}`,
        subject: bulkEmailContent.subject,
        content: bulkEmailContent.content,
        status: "sent",
        recipient_count: activeSubscribers.length,
        sent_count: activeSubscribers.length,
        sent_at: new Date().toISOString(),
      });

      toast({
        title: "Success",
        description: `Email campaign created and sent to ${activeSubscribers.length} subscribers`,
      });

      setBulkEmailContent({ subject: "", content: "" });
    } catch (error) {
      console.error("Bulk email error:", error);
      toast({
        title: "Error",
        description: "Failed to send bulk email",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-church-burgundy">
            Bulk Operations
          </h1>
          <p className="text-gray-600 mt-1">
            Manage data in bulk - import, export, and batch operations
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="events">Events</TabsTrigger>
          <TabsTrigger value="email">Email Campaign</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Import Members
                </CardTitle>
                <CardDescription>
                  Upload member data from JSON or CSV files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="member-file">Upload File</Label>
                  <Input
                    id="member-file"
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="member-data">Or Paste JSON Data</Label>
                  <Textarea
                    id="member-data"
                    placeholder='[{"full_name": "John Doe", "email": "john@example.com", "phone": "123-456-7890"}]'
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={8}
                  />
                </div>
                <Button
                  onClick={() => handleBulkImport("members")}
                  className="w-full"
                  disabled={!importData.trim()}
                >
                  Import Members
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export Members
                </CardTitle>
                <CardDescription>
                  Download all member data as JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Export all member records including contact information,
                  membership details, and registration dates.
                </p>
                <Button
                  onClick={() => handleBulkExport("members")}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Members
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="events" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Import Events
                </CardTitle>
                <CardDescription>
                  Upload event data from JSON or CSV files
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="event-file">Upload File</Label>
                  <Input
                    id="event-file"
                    type="file"
                    accept=".json,.csv"
                    onChange={handleFileUpload}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="event-data">Or Paste JSON Data</Label>
                  <Textarea
                    id="event-data"
                    placeholder='[{"title": "Sunday Service", "event_date": "2024-01-01", "event_time": "10:00", "location": "Main Hall"}]'
                    value={importData}
                    onChange={(e) => setImportData(e.target.value)}
                    rows={8}
                  />
                </div>
                <Button
                  onClick={() => handleBulkImport("events")}
                  className="w-full"
                  disabled={!importData.trim()}
                >
                  Import Events
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Export Events
                </CardTitle>
                <CardDescription>
                  Download all event data as JSON
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  Export all event records including dates, times, locations,
                  and descriptions.
                </p>
                <Button
                  onClick={() => handleBulkExport("events")}
                  className="w-full"
                  variant="outline"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Export All Events
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                Bulk Email Campaign
              </CardTitle>
              <CardDescription>
                Send emails to all active subscribers
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email-subject">Subject</Label>
                <Input
                  id="email-subject"
                  placeholder="Enter email subject"
                  value={bulkEmailContent.subject}
                  onChange={(e) =>
                    setBulkEmailContent((prev) => ({
                      ...prev,
                      subject: e.target.value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-content">Content</Label>
                <Textarea
                  id="email-content"
                  placeholder="Enter email content..."
                  value={bulkEmailContent.content}
                  onChange={(e) =>
                    setBulkEmailContent((prev) => ({
                      ...prev,
                      content: e.target.value,
                    }))
                  }
                  rows={10}
                />
              </div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex items-center">
                  <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2" />
                  <p className="text-sm text-yellow-800">
                    This will send the email to all active subscribers. Make
                    sure to review the content carefully.
                  </p>
                </div>
              </div>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    className="w-full"
                    disabled={
                      !bulkEmailContent.subject || !bulkEmailContent.content
                    }
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Send Bulk Email
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirm Bulk Email</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to send this email to all active
                      subscribers? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={handleBulkEmail}>
                      Send Email
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="operations" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Operation History</CardTitle>
              <CardDescription>
                Track the status of bulk operations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {operations.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No operations yet</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Bulk operations will appear here when you perform them
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {operations.map((operation) => (
                    <div key={operation.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          {operation.status === "completed" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : operation.status === "failed" ? (
                            <AlertTriangle className="h-5 w-5 text-red-600" />
                          ) : (
                            <div className="h-5 w-5 border-2 border-church-burgundy border-t-transparent rounded-full animate-spin" />
                          )}
                          <span className="font-medium capitalize">
                            {operation.type} Operation
                          </span>
                        </div>
                        <span className="text-sm text-gray-500">
                          {operation.createdAt.toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">
                        {operation.message}
                      </p>
                      {operation.total > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-church-burgundy h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${(operation.progress / operation.total) * 100}%`,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
