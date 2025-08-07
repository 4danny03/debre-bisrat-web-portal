import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import {
  Download,
  Search,
  Filter,
  DollarSign,
  Users,
  TrendingUp,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

interface Donation {
  id: string;
  amount: number;
  donor_name: string;
  donor_email: string;
  purpose: string;
  status: string;
  created_at: string;
  payment_method?: string;
  notes?: string;
}

interface DonationStats {
  total_amount: number;
  total_donations: number;
  monthly_growth: number;
  average_donation: number;
}

const Donations = () => {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const [stats, setStats] = useState<DonationStats>({
    total_amount: 0,
    total_donations: 0,
    monthly_growth: 0,
    average_donation: 0,
  });
  const [error, setError] = useState<string | null>(null);

  const loadDonations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from("donations")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error loading donations:", error);
        setError("Failed to load donations. Please try again.");
        toast.error("Failed to load donations");
        return;
      }

      const donationsData = data || [];
      setDonations(donationsData);

      // Calculate stats
      const totalAmount = donationsData.reduce(
        (sum, donation) => sum + (donation.amount || 0),
        0,
      );
      const totalDonations = donationsData.length;
      const averageDonation =
        totalDonations > 0 ? totalAmount / totalDonations : 0;

      // Calculate monthly growth (simplified)
      const currentMonth = new Date().getMonth();
      const currentMonthDonations = donationsData.filter((d) => {
        if (!d.created_at) return false;
        try {
          return new Date(d.created_at).getMonth() === currentMonth;
        } catch {
          return false;
        }
      });
      const monthlyGrowth = currentMonthDonations.length;

      setStats({
        total_amount: totalAmount,
        total_donations: totalDonations,
        monthly_growth: monthlyGrowth,
        average_donation: averageDonation,
      });
    } catch (err) {
      console.error("Unexpected error loading donations:", err);
      setError("An unexpected error occurred. Please try again.");
      toast.error("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter donations based on search and filters
  const filterDonations = useCallback(() => {
    if (!Array.isArray(donations)) {
      console.warn("Donations is not an array:", donations);
      setFilteredDonations([]);
      return;
    }

    let filtered = [...donations];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter((donation) => {
        if (!donation) return false;
        const searchLower = searchTerm.toLowerCase();
        return (
          (donation.donor_name &&
            donation.donor_name.toLowerCase().includes(searchLower)) ||
          (donation.donor_email &&
            donation.donor_email.toLowerCase().includes(searchLower)) ||
          (donation.purpose &&
            donation.purpose.toLowerCase().includes(searchLower))
        );
      });
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (donation) => donation?.status === statusFilter,
      );
    }

    // Purpose filter
    if (purposeFilter !== "all") {
      filtered = filtered.filter(
        (donation) => donation?.purpose === purposeFilter,
      );
    }

    // Date range filter
    if (dateRange.from) {
      filtered = filtered.filter((donation) => {
        if (!donation?.created_at) return false;
        try {
          return new Date(donation.created_at) >= new Date(dateRange.from);
        } catch {
          return false;
        }
      });
    }

    if (dateRange.to) {
      filtered = filtered.filter((donation) => {
        if (!donation?.created_at) return false;
        try {
          return new Date(donation.created_at) <= new Date(dateRange.to);
        } catch {
          return false;
        }
      });
    }
    setFilteredDonations(filtered);
  }, [donations, searchTerm, statusFilter, purposeFilter, dateRange]);

  useEffect(() => {
    loadDonations();
  }, [loadDonations]);

  useEffect(() => {
    filterDonations();
  }, [filterDonations]);

  const exportToExcel = () => {
    try {
      const exportData = filteredDonations.map((donation) => ({
        "Donor Name": donation.donor_name || "",
        Email: donation.donor_email || "",
        Amount: donation.amount || 0,
        Purpose: donation.purpose || "",
        // Status: donation.status || "",
        Date: donation.created_at
          ? format(new Date(donation.created_at), "yyyy-MM-dd")
          : "",
        "Payment Method": donation.payment_method || "",
        Notes: donation.notes || "",
      }));

      const ws = XLSX.utils.json_to_sheet(exportData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Donations");

      const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
      const data = new Blob([excelBuffer], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      });
      saveAs(data, `donations-${format(new Date(), "yyyy-MM-dd")}.xlsx`);

      toast.success("Donations exported successfully");
    } catch (err) {
      console.error("Export error:", err);
      toast.error("Failed to export donations");
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount || 0);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading donations...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-4">{error}</p>
          <Button onClick={loadDonations} variant="outline">
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Donations</h1>
          <p className="text-muted-foreground">
            Manage and track all donations
          </p>
        </div>
        <Button onClick={exportToExcel} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Export to Excel
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Donations
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.total_amount)}
            </div>
            <p className="text-xs text-muted-foreground">
              From {stats.total_donations} donations
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Donors</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total_donations}</div>
            <p className="text-xs text-muted-foreground">
              Unique donations received
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.monthly_growth}</div>
            <p className="text-xs text-muted-foreground">
              Donations this month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Donation
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.average_donation)}
            </div>
            <p className="text-xs text-muted-foreground">
              Per donation average
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search donations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={purposeFilter} onValueChange={setPurposeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Purpose" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Purposes</SelectItem>
                <SelectItem value="general">General</SelectItem>
                <SelectItem value="building">Building Fund</SelectItem>
                <SelectItem value="missions">Missions</SelectItem>
                <SelectItem value="youth">Youth Ministry</SelectItem>
              </SelectContent>
            </Select>
            <Input
              type="date"
              placeholder="From Date"
              value={dateRange.from}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, from: e.target.value }))
              }
            />
            <Input
              type="date"
              placeholder="To Date"
              value={dateRange.to}
              onChange={(e) =>
                setDateRange((prev) => ({ ...prev, to: e.target.value }))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Donations ({filteredDonations.length})</CardTitle>
          <CardDescription>Recent donations and their details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purpose</TableHead>
                  {/* <TableHead>Status</TableHead> */}
                  <TableHead>Date</TableHead>
                  <TableHead>Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="text-muted-foreground">
                        {donations.length === 0
                          ? "No donations found"
                          : "No donations match your filters"}
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredDonations.map((donation) => (
                    <TableRow key={donation.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {donation.donor_name || "Anonymous"}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {donation.donor_email}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(donation.amount)}
                      </TableCell>
                      <TableCell>{donation.purpose || "General"}</TableCell>
                      {/* <TableCell>
                        <Badge variant={getStatusBadgeVariant(donation.status)}>
                          {donation.status || "Unknown"}
                        </Badge>
                      </TableCell> */}
                      <TableCell>
                        {donation.created_at
                          ? format(
                              new Date(donation.created_at),
                              "MMM dd, yyyy",
                            )
                          : "N/A"}
                      </TableCell>
                      <TableCell>{donation.payment_method || "N/A"}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Donations;
