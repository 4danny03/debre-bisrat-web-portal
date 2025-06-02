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
  MessageSquare,
  CheckCircle,
  Clock,
  Eye,
  EyeOff,
  Trash2,
  User,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";

interface Testimonial {
  id: string;
  name: string;
  content: string;
  is_approved: boolean;
  created_at: string;
  updated_at: string;
}

export default function AdminTestimonials() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [filteredTestimonials, setFilteredTestimonials] = useState<
    Testimonial[]
  >([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTestimonial, setSelectedTestimonial] =
    useState<Testimonial | null>(null);
  const [approvalFilter, setApprovalFilter] = useState("all");
  const { toast } = useToast();

  useEffect(() => {
    loadTestimonials();
  }, []);

  useEffect(() => {
    filterTestimonials();
  }, [testimonials, searchTerm, approvalFilter]);

  const loadTestimonials = async () => {
    try {
      const { data, error } = await supabase
        .from("testimonials")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTestimonials(data || []);
    } catch (error) {
      console.error("Error loading testimonials:", error);
      toast({
        title: "Error",
        description: "Failed to load testimonials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterTestimonials = () => {
    let filtered = testimonials;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (testimonial) =>
          testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    // Approval filter
    if (approvalFilter !== "all") {
      const isApproved = approvalFilter === "approved";
      filtered = filtered.filter(
        (testimonial) => testimonial.is_approved === isApproved,
      );
    }

    setFilteredTestimonials(filtered);
  };

  const toggleApproval = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .update({
          is_approved: !currentStatus,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Testimonial ${!currentStatus ? "approved" : "unapproved"} successfully`,
      });
      loadTestimonials();
    } catch (error) {
      console.error("Error updating testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to update testimonial",
        variant: "destructive",
      });
    }
  };

  const deleteTestimonial = async (id: string) => {
    try {
      const { error } = await supabase
        .from("testimonials")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Testimonial deleted successfully",
      });
      loadTestimonials();
    } catch (error) {
      console.error("Error deleting testimonial:", error);
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      });
    }
  };

  const calculateStats = () => {
    const totalTestimonials = testimonials.length;
    const approvedTestimonials = testimonials.filter(
      (t) => t.is_approved,
    ).length;
    const pendingTestimonials = testimonials.filter(
      (t) => !t.is_approved,
    ).length;
    const thisMonthTestimonials = testimonials.filter(
      (t) => new Date(t.created_at).getMonth() === new Date().getMonth(),
    ).length;

    return {
      totalTestimonials,
      approvedTestimonials,
      pendingTestimonials,
      thisMonthTestimonials,
    };
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
            Testimonials Management
          </h1>
          <p className="text-gray-600">
            Review and manage testimonials from church members
          </p>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <MessageSquare className="w-4 h-4 mr-2" />
              Total Testimonials
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-church-burgundy">
              {stats.totalTestimonials}
            </div>
            <p className="text-xs text-gray-500">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <CheckCircle className="w-4 h-4 mr-2" />
              Approved
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.approvedTestimonials}
            </div>
            <p className="text-xs text-gray-500">
              {stats.totalTestimonials > 0
                ? Math.round(
                    (stats.approvedTestimonials / stats.totalTestimonials) *
                      100,
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
              Pending Review
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pendingTestimonials}
            </div>
            <p className="text-xs text-gray-500">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center">
              <User className="w-4 h-4 mr-2" />
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.thisMonthTestimonials}
            </div>
            <p className="text-xs text-gray-500">New testimonials</p>
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
                  placeholder="Search testimonials..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Approval Status</Label>
              <div className="flex gap-2">
                <Button
                  variant={approvalFilter === "all" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setApprovalFilter("all")}
                >
                  All
                </Button>
                <Button
                  variant={
                    approvalFilter === "approved" ? "default" : "outline"
                  }
                  size="sm"
                  onClick={() => setApprovalFilter("approved")}
                >
                  Approved
                </Button>
                <Button
                  variant={approvalFilter === "pending" ? "default" : "outline"}
                  size="sm"
                  onClick={() => setApprovalFilter("pending")}
                >
                  Pending
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Testimonials Table */}
      <Card>
        <CardHeader>
          <CardTitle>Testimonials ({filteredTestimonials.length})</CardTitle>
          <CardDescription>
            Review and manage community testimonials
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Testimonial</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTestimonials.map((testimonial) => (
                  <TableRow key={testimonial.id}>
                    <TableCell>
                      {format(new Date(testimonial.created_at), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{testimonial.name}</div>
                    </TableCell>
                    <TableCell>
                      <div className="max-w-xs">
                        <p className="truncate">{testimonial.content}</p>
                        <Button
                          variant="link"
                          size="sm"
                          className="p-0 h-auto text-xs"
                          onClick={() => setSelectedTestimonial(testimonial)}
                        >
                          Read full testimonial
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {testimonial.is_approved ? (
                        <Badge className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approved
                        </Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">
                          <Clock className="w-3 h-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            toggleApproval(
                              testimonial.id,
                              testimonial.is_approved,
                            )
                          }
                          className={
                            testimonial.is_approved
                              ? ""
                              : "bg-green-50 hover:bg-green-100"
                          }
                        >
                          {testimonial.is_approved ? (
                            <>
                              <ThumbsDown className="w-3 h-3 mr-1" />
                              Unapprove
                            </>
                          ) : (
                            <>
                              <ThumbsUp className="w-3 h-3 mr-1" />
                              Approve
                            </>
                          )}
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" size="sm">
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>
                                Delete Testimonial
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to delete this testimonial
                                from {testimonial.name}? This action cannot be
                                undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() =>
                                  deleteTestimonial(testimonial.id)
                                }
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
          {filteredTestimonials.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No testimonials found matching your criteria.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Testimonial Detail Dialog */}
      <Dialog
        open={!!selectedTestimonial}
        onOpenChange={() => setSelectedTestimonial(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Testimonial Details</DialogTitle>
            <DialogDescription>
              {selectedTestimonial &&
                format(
                  new Date(selectedTestimonial.created_at),
                  "MMMM d, yyyy 'at' h:mm a",
                )}
            </DialogDescription>
          </DialogHeader>
          {selectedTestimonial && (
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">From:</Label>
                <p className="text-sm font-medium">
                  {selectedTestimonial.name}
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Testimonial:</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-md border-l-4 border-church-gold">
                  <p className="text-sm leading-relaxed whitespace-pre-wrap italic">
                    "{selectedTestimonial.content}"
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <Label className="text-sm">Status:</Label>
                  {selectedTestimonial.is_approved ? (
                    <Badge className="bg-green-100 text-green-800">
                      <CheckCircle className="w-3 h-3 mr-1" />
                      Approved
                    </Badge>
                  ) : (
                    <Badge className="bg-yellow-100 text-yellow-800">
                      <Clock className="w-3 h-3 mr-1" />
                      Pending Review
                    </Badge>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      toggleApproval(
                        selectedTestimonial.id,
                        selectedTestimonial.is_approved,
                      );
                      setSelectedTestimonial(null);
                    }}
                    className={
                      selectedTestimonial.is_approved
                        ? ""
                        : "bg-green-50 hover:bg-green-100"
                    }
                  >
                    {selectedTestimonial.is_approved ? (
                      <>
                        <ThumbsDown className="w-4 h-4 mr-2" />
                        Unapprove
                      </>
                    ) : (
                      <>
                        <ThumbsUp className="w-4 h-4 mr-2" />
                        Approve
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
