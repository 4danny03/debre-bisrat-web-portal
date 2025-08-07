import * as React from "react";
import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Search,
  Heart,
  CheckCircle,
  Clock,
  Eye,
  Trash2,
  Mail,
  User,
  Calendar,
  MessageSquare,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { Textarea } from "@/components/ui/textarea";
import LoadingSpinner from "@/components/LoadingSpinner";

interface PrayerRequest {
  id: string;
  name: string;
  email: string | null;
  request: string;
  is_public: boolean;
  is_answered: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminPrayerRequestsComplete() {
  const [prayerRequests, setPrayerRequests] = useState<PrayerRequest[]>([]);
  const [filteredRequests, setFilteredRequests] = useState<PrayerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedRequest, setSelectedRequest] = useState<PrayerRequest | null>(
    null,
  );
  const [isEmailDialogOpen, setIsEmailDialogOpen] = useState(false);
  const [emailSending, setEmailSending] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadPrayerRequests();
  }, []);

  useEffect(() => {
    filterRequests();
  }, [prayerRequests, searchTerm, statusFilter]);

  const loadPrayerRequests = async () => {
    try {
      const { data, error } = await supabase
        .from("prayer_requests")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setPrayerRequests(data || []);
    } catch (error) {
      console.error("Error loading prayer requests:", error);
      toast({
        title: "Error",
        description: "Failed to load prayer requests",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterRequests = () => {
    let filtered = prayerRequests;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (request) =>
          request.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.request.toLowerCase().includes(searchTerm.toLowerCase()) ||
          request.email?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      const isAnswered = statusFilter === "answered";
      filtered = filtered.filter(
        (request) => request.is_answered === isAnswered,
      );
    }

    setFilteredRequests(filtered);
  };

  const toggleAnsweredStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("prayer_requests")
        .update({
          is_answered: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Prayer request marked as ${!currentStatus ? "answered" : "pending"}`,
      });
      loadPrayerRequests();
    } catch (error) {
      console.error("Error updating prayer request:", error);
      toast({
        title: "Error",
        description: "Failed to update prayer request",
        variant: "destructive",
      });
    }
  };

  const deletePrayerRequest = async (id: string) => {
    try {
      const { error } = await supabase
        .from("prayer_requests")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Prayer request deleted successfully",
      });
      loadPrayerRequests();
    } catch (error) {
      console.error("Error deleting prayer request:", error);
      toast({
        title: "Error",
        description: "Failed to delete prayer request",
        variant: "destructive",
      });
    }
  };

  const sendEmailResponse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRequest || !selectedRequest.email) return;

    setEmailSending(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    try {
      // Send email via Resend
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: selectedRequest.email,
          subject: subject,
          htmlContent: message.replace(/\n/g, '<br>')
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }

      // Update prayer request to mark as answered
      await supabase
        .from("prayer_requests")
        .update({
          is_answered: true,
          updated_at: new Date().toISOString(),
        })
        .eq("id", selectedRequest.id);

      toast({
        title: "Email Sent",
        description: `Response sent to ${selectedRequest.name}`,
      });
      setIsEmailDialogOpen(false);
      setSelectedRequest(null);
      loadPrayerRequests();
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send email response",
        variant: "destructive",
      });
    } finally {
      setEmailSending(false);
    }
  };

  const calculateStats = () => {
    const totalRequests = prayerRequests.length;
    const answeredRequests = prayerRequests.filter((r) => r.is_answered).length;
    const pendingRequests = prayerRequests.filter((r) => !r.is_answered).length;
    const publicRequests = prayerRequests.filter((r) => r.is_public).length;
    const thisWeekRequests = prayerRequests.filter((r) => {
      const requestDate = new Date(r.created_at);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return requestDate >= weekAgo;
    }).length;

    return {
      totalRequests,
      answeredRequests,
      pendingRequests,
      publicRequests,
      thisWeekRequests,
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <LoadingSpinner className="h-64" text="Loading prayer requests..." ariaLabel="Loading prayer requests" />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-church-burgundy">
            Prayer Requests Management
          </h1>
          <p className="text-gray-600">
            Review and respond to prayer requests from the community
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Heart className="w-4 h-4 mr-2" />
              Total Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-church-burgundy">
              {stats.totalRequests}
            </div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Answered
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.answeredRequests}
            </div>
            <p className="text-xs text-gray-500">
              {stats.totalRequests > 0
                ? Math.round(
                    (stats.answeredRequests / stats.totalRequests) * 100,
                  )
                : 0}
              % of total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Clock className="w-4 h-4 mr-2" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingRequests}
            </div>
            <p className="text-xs text-gray-500">Awaiting response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Eye className="w-4 h-4 mr-2" />
              Public
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.publicRequests}
            </div>
            <p className="text-xs text-gray-500">Visible to community</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.thisWeekRequests}
            </div>
            <p className="text-xs text-gray-500">New requests</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Search & Filter</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search prayer requests..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Status Filter</Label>
              <div className="flex gap-2">
                <Button
                  variant={statusFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={statusFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("pending")}
                >
                  Pending
                </Button>
                <Button
                  variant={statusFilter === "answered" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setStatusFilter("answered")}
                >
                  Answered
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prayer Requests Table */}
      <Card>
        <CardHeader>
          <CardTitle>Prayer Requests ({filteredRequests.length})</CardTitle>
          <CardDescription>
            Manage and respond to community prayer requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Request</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Visibility</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((request) => (
                  <TableRow key={request.id}>
                    <TableCell>
                      {format(new Date(request.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{request.name}</div>
                        {request.email && (
                          <div className="text-sm text-gray-500">
                            {request.email}
                          </div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate">{request.request}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-xs"
                          onClick={() => setSelectedRequest(request)}
                        >
                          Read full request
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {request.is_answered ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Answered
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {request.is_public ? (
                        <Badge className="bg-blue-100 text-blue-800">
                          <Eye className="w-3 h-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">
                          Private
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleAnsweredStatus(
                              request.id,
                              request.is_answered,
                            )
                          }
                          className={
                            request.is_answered
                              ? ""
                              : "bg-green-50 hover:bg-green-100"
                          }
                        >
                          {request.is_answered ? (
                            <>
                              <Clock className="w-3 h-3 mr-1" />
                              Mark Pending
                            </>
                          ) : (
                            <>
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Mark Answered
                            </>
                          )}
                        </Button>
                        {request.email && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setSelectedRequest(request);
                              setIsEmailDialogOpen(true);
                            }}
                          >
                            <Mail className="w-3 h-3 mr-1" />
                            Email
                          </Button>
                        )}
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Prayer Request
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this prayer
                                request from {request.name}? This action cannot
                                be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => deletePrayerRequest(request.id)}
                                className="bg-red-600 hover:bg-red-700"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No prayer requests found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Prayer Request Detail Dialog */}
      <Dialog
        open={!!selectedRequest && !isEmailDialogOpen}
        onOpenChange={() => setSelectedRequest(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Prayer Request Details</DialogTitle>
            <DialogDescription>
              {selectedRequest &&
                format(
                  new Date(selectedRequest.created_at),
                  "MMMM d, yyyy 'at' h:mm a",
                )}
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">From:</Label>
                <p className="text-sm font-medium">{selectedRequest.name}</p>
                {selectedRequest.email && (
                  <p className="text-sm text-gray-500">
                    {selectedRequest.email}
                  </p>
                )}
              </div>
              <div>
                <Label className="text-sm font-medium">Prayer Request:</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-md border-l-4 border-church-gold">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">
                    {selectedRequest.request}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Status:</Label>
                    {selectedRequest.is_answered ? (
                      <Badge className="bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Answered
                      </Badge>
                    ) : (
                      <Badge className="bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Pending
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <Label className="text-sm">Visibility:</Label>
                    {selectedRequest.is_public ? (
                      <Badge className="bg-blue-100 text-blue-800">
                        <Eye className="w-3 h-3 mr-1" />
                        Public
                      </Badge>
                    ) : (
                      <Badge className="bg-gray-100 text-gray-800">
                        Private
                      </Badge>
                    )}
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleAnsweredStatus(
                        selectedRequest.id,
                        selectedRequest.is_answered,
                      );
                      setSelectedRequest(null);
                    }}
                    className={
                      selectedRequest.is_answered
                        ? ""
                        : "bg-green-50 hover:bg-green-100"
                    }
                  >
                    {selectedRequest.is_answered ? (
                      <>
                        <Clock className="w-4 h-4 mr-2" />
                        Mark Pending
                      </>
                    ) : (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Mark Answered
                      </>
                    )}
                  </Button>
                  {selectedRequest.email && (
                    <Button
                      onClick={() => setIsEmailDialogOpen(true)}
                      className="bg-church-burgundy hover:bg-church-burgundy/90"
                    >
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email Response
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Email Response Dialog */}
      <Dialog open={isEmailDialogOpen} onOpenChange={setIsEmailDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Send Email Response</DialogTitle>
            <DialogDescription>
              Respond to {selectedRequest?.name}'s prayer request
            </DialogDescription>
          </DialogHeader>
          {selectedRequest && (
            <form onSubmit={sendEmailResponse} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  name="subject"
                  defaultValue={`Re: Your Prayer Request`}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  name="message"
                  rows={6}
                  placeholder={`Dear ${selectedRequest.name},\n\nThank you for sharing your prayer request with us. We want you to know that we are praying for you and your situation.\n\n[Your personal message here]\n\nBlessings,\nSt. Gabriel Ethiopian Orthodox Church`}
                  required
                />
              </div>
              <div className="flex space-x-2">
                <Button
                  type="submit"
                  className="flex-1 bg-church-burgundy hover:bg-church-burgundy/90"
                  disabled={emailSending}
                >
                  {emailSending ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    <>
                      <Mail className="w-4 h-4 mr-2" />
                      Send Email
                    </>
                  )}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEmailDialogOpen(false)}
                  disabled={emailSending}
                >
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}