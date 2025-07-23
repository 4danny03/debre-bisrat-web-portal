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
  safeDataLoader,
  logAdminAction,
  formatErrorMessage,
} from "@/utils/adminHelpers";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  DollarSign,
  TrendingUp,
  Users,
  Calendar,
  Download,
  Filter,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

interface Donation {
  id: string;
  amount: number;
  donor_email: string;
  donor_name: string | null;
  purpose: string;
  payment_status: string;
  payment_id: string | null;
  payment_method: string | null;
  is_anonymous: boolean;
  created_at: string;
}

export default function AdminDonations() {
  const [donations, setDonations] = useState<Donation[]>([]);
  const [filteredDonations, setFilteredDonations] = useState<Donation[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  const [dateRange, setDateRange] = useState({ from: "", to: "" });
  const { toast } = useToast();

  useEffect(() => {
    loadDonations();
  }, []);

  useEffect(() => {
    filterDonations();
  }, [donations, searchTerm, statusFilter, purposeFilter, dateRange]);

  const loadDonations = async () => {
    setLoading(true);

    const { data, error } = await safeDataLoader(
      () =>
        supabase
          .from("donations")
          .select("*")
          .order("created_at", { ascending: false }),
      "donations",
    );

    if (error) {
      toast({
        title: "Error",
        description: formatErrorMessage(error, "Failed to load donations"),
        variant: "destructive",
      });
      setDonations([]);
    } else {
      // Ensure data has proper structure with safe array handling
      const safeData = Array.isArray(data) ? data : [];
      const processedData = safeData.map((donation) => ({
        ...donation,
        amount: Number(donation?.amount) || 0,
        payment_status: donation?.payment_status || "pending",
        is_anonymous: Boolean(donation?.is_anonymous),
        donor_name: donation?.donor_name || null,
        donor_email: donation?.donor_email || "",
        purpose: donation?.purpose || "general_fund",
      }));

      setDonations(processedData);
      logAdminAction("load", "donations", { count: processedData.length });
    }

    setLoading(false);
  };

  const filterDonations = () => {
    if (!Array.isArray(donations)) {
      setFilteredDonations([]);
      return;
    }

    let filtered = donations;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (donation) =>
          donation?.donor_email
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          donation?.donor_name
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          donation?.purpose?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (donation) => donation?.payment_status === statusFilter,
      );
    }

    // Purpose filter
    if (purposeFilter !== "all") {
      filtered = filtered.filter(
        (donation) => donation?.purpose === purposeFilter,
      );
    }

    // Date range filter with safe date handling
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
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>;
      case "failed":
        return <Badge className="bg-red-100 text-red-800">Failed</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getPurposeLabel = (purpose: string) => {
    return purpose
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const calculateStats = () => {
    if (!Array.isArray(donations)) {
      return {
        totalAmount: 0,
        averageAmount: 0,
        totalDonations: 0,
        thisMonthAmount: 0,
        thisMonthCount: 0,
      };
    }

    const completedDonations = donations.filter(
      (d) => d?.payment_status === "completed",
    );
    const totalAmount = completedDonations.reduce(
      (sum, d) => sum + (Number(d?.amount) || 0),
      0,
    );
    const averageAmount =
      completedDonations.length > 0
        ? totalAmount / completedDonations.length
        : 0;

    const currentMonth = new Date().getMonth();
    const thisMonthDonations = completedDonations.filter((d) => {
      if (!d?.created_at) return false;
      try {
        return new Date(d.created_at).getMonth() === currentMonth;
      } catch {
        return false;
      }
    });

    const thisMonthAmount = thisMonthDonations.reduce(
      (sum, d) => sum + (Number(d?.amount) || 0),
      0,
    );

    return {
      totalAmount,
      averageAmount,
      totalDonations: completedDonations.length,
      thisMonthAmount,
      thisMonthCount: thisMonthDonations.length,
    };
  };

  const exportDonations = () => {
    if (!Array.isArray(filteredDonations)) {
      toast({
        title: "Error",
        description: "No donations to export",
        variant: "destructive",
      });
      return;
    }

    const csvContent = [
      [
        "Date",
        "Donor Name",
        "Email",
        "Amount",
        "Purpose",
        "Status",
        "Payment Method",
      ],
      ...filteredDonations.map((donation) => {
        const safeDate = donation?.created_at
          ? format(new Date(donation.created_at), "yyyy-MM-dd HH:mm")
          : "N/A";
        return [
          safeDate,
          donation?.is_anonymous ? "Anonymous" : donation?.donor_name || "N/A",
          donation?.is_anonymous ? "Anonymous" : donation?.donor_email || "N/A",
          `${(Number(donation?.amount) || 0).toFixed(2)}`,
          getPurposeLabel(donation?.purpose || "general_fund"),
          donation?.payment_status || "N/A",
          donation?.payment_method || "N/A",
        ];
      }),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `donations-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-church-burgundy"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-church-burgundy">
            Donations Management
          </h1>
          <p className="text-gray-600">
            Track and manage church donations and contributions
          </p>
        </div>
        <Button onClick={exportDonations} variant="outline">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <DollarSign className="w-4 h-4 mr-2" />
              Total Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-church-burgundy">
              ${stats.totalAmount.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              {stats.totalDonations} completed donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" />
              Average Donation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${stats.averageAmount.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">Per donation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Calendar className="w-4 h-4 mr-2" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${stats.thisMonthAmount.toFixed(2)}
            </div>
            <p className="text-xs text-gray-500">
              {stats.thisMonthCount} donations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <Users className="w-4 h-4 mr-2" />
              Unique Donors
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {Array.isArray(donations)
                ? new Set(donations.map((d) => d?.donor_email).filter(Boolean))
                    .size
                : 0}
            </div>
            <p className="text-xs text-gray-500">Total donors</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Search donations..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="purpose">Purpose</Label>
              <Select value={purposeFilter} onValueChange={setPurposeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Purposes</SelectItem>
                  <SelectItem value="general_fund">General Fund</SelectItem>
                  <SelectItem value="building_fund">Building Fund</SelectItem>
                  <SelectItem value="youth_programs">Youth Programs</SelectItem>
                  <SelectItem value="membership_fee">Membership Fee</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateFrom">From Date</Label>
              <Input
                id="dateFrom"
                type="date"
                value={dateRange.from}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, from: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dateTo">To Date</Label>
              <Input
                id="dateTo"
                type="date"
                value={dateRange.to}
                onChange={(e) =>
                  setDateRange((prev) => ({ ...prev, to: e.target.value }))
                }
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Donations Table */}
      <Card>
        <CardHeader>
          <CardTitle>Donations ({filteredDonations.length})</CardTitle>
          <CardDescription>Manage and track all donations</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Donor</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Purpose</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Method</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDonations.map((donation) => (
                  <TableRow key={donation.id}>
                    <TableCell>
                      {format(
                        new Date(donation.created_at),
                        "MMM d, yyyy HH:mm",
                      )}
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">
                          {donation.is_anonymous
                            ? "Anonymous"
                            : donation.donor_name || "N/A"}
                        </div>
                        <div className="text-sm text-gray-500">
                          {donation.is_anonymous ? "" : donation.donor_email}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">
                      ${donation.amount.toFixed(2)}
                    </TableCell>
                    <TableCell>{getPurposeLabel(donation.purpose)}</TableCell>
                    <TableCell>
                      {getStatusBadge(donation.payment_status)}
                    </TableCell>
                    <TableCell>
                      {donation.payment_method
                        ? donation.payment_method.charAt(0).toUpperCase() +
                          donation.payment_method.slice(1)
                        : "N/A"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {filteredDonations.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No donations found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
