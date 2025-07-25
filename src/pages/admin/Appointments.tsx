import React, { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  CalendarCheck,
  Clock,
  User,
  Mail,
  Phone,
  MessageSquare,
  CheckCircle,
  XCircle,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { api } from "@/integrations/supabase/api";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import EmptyState from "@/components/EmptyState";
// @ts-ignore
import { saveAs } from "file-saver";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface Appointment {
  id: string;
  name: string;
  email: string;
  phone: string;
  service_title: string;
  requested_date: string;
  requested_time: string;
  notes?: string | null;
  status: string;
  admin_response?: string | null;
  admin_notes?: string | null;
  confirmed_date?: string | null;
  confirmed_time?: string | null;
  responded_by?: string | null;
  responded_at?: string | null;
  created_at: string;
  updated_at?: string | null;
  responded_by_profile?: { email: string } | null;
}

const AdminAppointments: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [responseDialog, setResponseDialog] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [currentUser, setCurrentUser] = useState<SupabaseUser | null>(null);
  const { toast } = useToast();

  // Error boundary for robust UI
  const [errorBoundary, setErrorBoundary] = useState<string | null>(null);

  const loadAppointments = useCallback(async () => {
    setLoading(true);
    setErrorBoundary(null);
    try {
      let data;
      if (!statusFilter || statusFilter === "all") {
        data = await api.appointments.getAppointments();
      } else {
        data = await api.appointments.getAppointmentsByStatus(statusFilter);
      }
      setAppointments(data || []);
    } catch (error: unknown) {
      const errorMessage =
        typeof error === "object" && error !== null && "message" in error
          ? (error as { message?: string }).message
          : String(error);
      setErrorBoundary(errorMessage || "Failed to load appointments");
      toast({
        title: "Error",
        description: errorMessage || "Failed to load appointments",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, toast]);

  useEffect(() => {
    loadAppointments();
    getCurrentUser();
  }, [loadAppointments]);

  const getCurrentUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    setCurrentUser(session?.user ?? null);
  };

  const handleResponse = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedAppointment || !currentUser) return;
    const formData = new FormData(e.currentTarget);
    const status = formData.get("status") as string;
    const admin_response = formData.get("admin_response") as string;
    const admin_notes = formData.get("admin_notes") as string;
    const confirmed_date = formData.get("confirmed_date") as string;
    const confirmed_time = formData.get("confirmed_time") as string;
    try {
      await api.appointments.respondToAppointment(selectedAppointment.id, {
        status,
        admin_response,
        admin_notes: admin_notes || undefined,
        confirmed_date: confirmed_date || undefined,
        confirmed_time: confirmed_time || undefined,
        responded_by: currentUser?.id,
      });
      toast({ title: "Success", description: "Response sent successfully" });
      setResponseDialog(false);
      setSelectedAppointment(null);
      loadAppointments();
    } catch (error) {
      console.error("Error responding to appointment:", error);
      toast({
        title: "Error",
        description: "Failed to send response",
        variant: "destructive",
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: {
        variant: "secondary" as const,
        icon: Clock,
        color: "text-yellow-600",
      },
      approved: {
        variant: "default" as const,
        icon: CheckCircle,
        color: "text-green-600",
      },
      rejected: {
        variant: "destructive" as const,
        icon: XCircle,
        color: "text-red-600",
      },
      completed: {
        variant: "outline" as const,
        icon: CheckCircle,
        color: "text-blue-600",
      },
    };
    const config =
      variants[status as keyof typeof variants] || variants.pending;
    const Icon = config.icon;
    return (
      <Badge variant={config.variant} className="capitalize">
        <Icon className={`w-3 h-3 mr-1 ${config.color}`} />
        {status}
      </Badge>
    );
  };

  const openResponseDialog = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setResponseDialog(true);
  };

  // Filtered and searched appointments
  const filteredAppointments = useMemo(() => {
    let filtered = appointments;
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter((a) => a.status === statusFilter);
    }
    if (search) {
      filtered = filtered.filter((a) =>
        a.name?.toLowerCase().includes(search.toLowerCase()) ||
        a.email?.toLowerCase().includes(search.toLowerCase()) ||
        a.service_title?.toLowerCase().includes(search.toLowerCase())
      );
    }
    return filtered;
  }, [appointments, statusFilter, search]);

  // Export to CSV functionality
  const exportToCSV = () => {
    const csvRows = [
      [
        "ID",
        "Name",
        "Email",
        "Phone",
        "Service",
        "Date",
        "Status",
        "Admin Notes",
      ],
      ...appointments.map((a) => [
        a.id,
        a.name,
        a.email,
        a.phone,
        a.service_title,
        a.requested_date,
        a.status,
        a.admin_notes || "",
      ]),
    ];
    const csvContent = csvRows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csvContent], { type: "text/csv" });
    saveAs(blob, "appointments.csv");
  };

  return (
    <div className="space-y-6">
      {errorBoundary && (
        <div className="bg-red-100 text-red-700 p-4 rounded mb-4">
          <b>Error:</b> {errorBoundary}
        </div>
      )}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-church-burgundy">
            Appointments
          </h1>
          <p className="text-gray-600 mt-1">
            Manage appointment requests from the services page
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={statusFilter || ""} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-40">
              <RefreshCw className="w-4 h-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={loadAppointments} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>
      <div className="flex gap-2 mb-4">
        <Input
          placeholder="Search by name, email, or service..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <Select
          value={statusFilter || "all"}
          onValueChange={setStatusFilter}
        >
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="confirmed">Confirmed</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="cancelled">Cancelled</SelectItem>
          </SelectContent>
        </Select>
        <Button onClick={exportToCSV}>Export CSV</Button>
      </div>
      {loading ? (
        <div className="py-10">
          <span>Loading...</span>
        </div>
      ) : appointments.length === 0 ? (
        <EmptyState
          icon={CalendarCheck}
          title="No appointments found"
          description="No appointment requests match the current filter."
        />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Appointment Requests</CardTitle>
            <CardDescription>
              {appointments.length} appointment
              {appointments.length !== 1 ? "s" : ""} found
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Requester</TableHead>
                    <TableHead>Service</TableHead>
                    <TableHead>Requested Date/Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAppointments.map((appointment) => (
                    <TableRow key={appointment.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center">
                            <User className="w-4 h-4 mr-1" />
                            {appointment.name}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Mail className="w-3 h-3 mr-1" />
                            {appointment.email}
                          </div>
                          <div className="text-sm text-gray-500 flex items-center">
                            <Phone className="w-3 h-3 mr-1" />
                            {appointment.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">
                          {appointment.service_title}
                        </div>
                        {appointment.notes && (
                          <div className="text-sm text-gray-500 mt-1 flex items-start">
                            <MessageSquare className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                            <span className="line-clamp-2">
                              {appointment.notes}
                            </span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center text-sm">
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(
                              new Date(appointment.requested_date),
                              "MMM d, yyyy",
                            )}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Clock className="w-3 h-3 mr-1" />
                            {appointment.requested_time}
                          </div>
                          {appointment.confirmed_date &&
                            appointment.confirmed_date !==
                              appointment.requested_date && (
                              <div className="flex items-center text-sm text-green-600">
                                <Calendar className="w-3 h-3 mr-1" />
                                Confirmed:{" "}
                                {format(
                                  new Date(appointment.confirmed_date),
                                  "MMM d, yyyy",
                                )}
                              </div>
                            )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(appointment.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-gray-500">
                          {format(
                            new Date(appointment.created_at),
                            "MMM d, yyyy HH:mm",
                          )}
                        </div>
                        {appointment.responded_at && (
                          <div className="text-xs text-gray-400 mt-1">
                            Responded:{" "}
                            {format(
                              new Date(appointment.responded_at),
                              "MMM d, HH:mm",
                            )}
                          </div>
                        )}
                        {appointment.responded_by_profile?.email && (
                          <div className="text-xs text-gray-400 mt-1">
                            By: {appointment.responded_by_profile.email}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => openResponseDialog(appointment)}
                          className="bg-church-burgundy hover:bg-church-burgundy/90"
                        >
                          {appointment.status === "pending"
                            ? "Respond"
                            : "Update"}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Response Dialog */}
      <Dialog open={responseDialog} onOpenChange={setResponseDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Respond to Appointment Request</DialogTitle>
            <DialogDescription>
              {selectedAppointment && (
                <span>
                  Responding to {selectedAppointment.name}'s request for{" "}
                  {selectedAppointment.service_title}
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          {selectedAppointment && (
            <form onSubmit={handleResponse} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    defaultValue={selectedAppointment.status}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmed_date">
                    Confirmed Date (if approved)
                  </Label>
                  <Input
                    id="confirmed_date"
                    name="confirmed_date"
                    type="date"
                    defaultValue={
                      selectedAppointment.confirmed_date ||
                      selectedAppointment.requested_date
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmed_time">
                  Confirmed Time (if approved)
                </Label>
                <Input
                  id="confirmed_time"
                  name="confirmed_time"
                  type="time"
                  defaultValue={
                    selectedAppointment.confirmed_time ||
                    selectedAppointment.requested_time
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_response">Response Message *</Label>
                <Textarea
                  id="admin_response"
                  name="admin_response"
                  placeholder="Enter your response to the appointment request..."
                  defaultValue={selectedAppointment.admin_response || ""}
                  required
                  rows={4}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="admin_notes">Internal Notes (optional)</Label>
                <Textarea
                  id="admin_notes"
                  name="admin_notes"
                  placeholder="Internal notes for admin reference..."
                  defaultValue={selectedAppointment.admin_notes || ""}
                  rows={3}
                />
              </div>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setResponseDialog(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="bg-church-burgundy hover:bg-church-burgundy/90"
                >
                  Send Response
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
      {/* Activity log stub */}
      <div className="mt-8">
        <h3 className="text-lg font-bold mb-2">Activity Log</h3>
        <div className="text-sm text-gray-500">(Activity log will appear here)</div>
      </div>
    </div>
  );
};

export default AdminAppointments;
