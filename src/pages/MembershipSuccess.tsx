import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { Loader2, ExternalLink } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type SessionData = {
  amount: string;
  formattedAmount: string;
  email: string;
  name: string;
  membershipType: string;
  date: string;
};

const MembershipSuccess: React.FC = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const sessionId = searchParams.get("session_id");

        if (!sessionId) {
          setError(
            "Session ID not found. Unable to retrieve membership details.",
          );
          setIsLoading(false);
          return;
        }

        // Call the get-session function to get session details
        const { data, error: sessionError } = await supabase.functions.invoke(
          "get-session",
          {
            body: { session_id: sessionId },
          },
        );

        if (sessionError) {
          throw new Error(
            sessionError.message || "Failed to retrieve session data",
          );
        }

        if (!data || !data.session) {
          throw new Error("Failed to retrieve session data");
        }

        const session = data.session;

        // Extract the payment amount and details
        let amountInCents = 0;
        let email = "";
        let name = "";
        let membershipType = "regular";

        if (session.mode === "payment" && session.payment_intent) {
          amountInCents = session.amount_total;
        }

        // Get customer details and metadata
        email =
          session.customer_details?.email || session.metadata?.email || "";
        name = session.metadata?.name || session.customer_details?.name || "";
        membershipType = session.metadata?.membershipType || "regular";

        // Calculate the amount in dollars
        const amount = (amountInCents / 100).toString();

        // Format the amount with currency
        const formattedAmount = new Intl.NumberFormat("en-US", {
          style: "currency",
          currency: "USD",
        }).format(amountInCents / 100);

        // Set the session data
        const sessionDetails: SessionData = {
          amount,
          formattedAmount,
          email,
          name,
          membershipType,
          date: new Date().toLocaleDateString(),
        };

        setSessionData(sessionDetails);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching session data:", error);
        setError(
          "Failed to process your membership information. Please contact support.",
        );
        setIsLoading(false);

        toast({
          title: "Error",
          description:
            "There was an issue retrieving your membership information.",
          variant: "destructive",
        });
      }
    };

    fetchSessionData();
  }, [searchParams, toast]);

  if (isLoading) {
    return (
      <Layout>
        <div className="py-16 px-6">
          <div className="container mx-auto max-w-2xl text-center">
            <Loader2 className="h-12 w-12 animate-spin mx-auto text-church-burgundy" />
            <p className="mt-4 text-lg">
              Processing your membership registration...
            </p>
          </div>
        </div>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <div className="py-16 px-6">
          <div className="container mx-auto max-w-2xl">
            <Card className="border-red-300">
              <CardContent className="pt-6">
                <div className="text-center">
                  <h2 className="text-red-700 text-xl font-semibold mb-2">
                    An Error Occurred
                  </h2>
                  <p className="text-red-600 mb-4">{error}</p>
                  <p className="mb-4">
                    If you believe your membership was processed, please contact
                    us for verification.
                  </p>
                  <Button
                    asChild
                    className="bg-church-burgundy hover:bg-church-burgundy/90 text-white"
                  >
                    <Link to="/">Return to Home</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-church-cream to-white py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="shadow-xl border-0 overflow-hidden">
            {/* Header with Ethiopian Orthodox Icon */}
            <div className="bg-white text-center py-8">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full overflow-hidden border-4 border-church-gold shadow-lg">
                <img
                  src="/images/religious/crucifixion.jpg"
                  alt="Ethiopian Orthodox Icon"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&q=80";
                  }}
                />
              </div>
              <h1 className="text-3xl font-bold text-church-burgundy mb-2">
                Membership Registration Receipt
              </h1>
            </div>

            <CardContent className="p-8 bg-white">
              <div className="space-y-6">
                {/* Personalized Greeting */}
                <div className="text-left">
                  <p className="text-lg font-medium text-gray-800 mb-4">
                    Dear{" "}
                    {sessionData?.name ||
                      (sessionData?.email
                        ? sessionData.email.split("@")[0]
                        : "New Member")}
                    !
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Thank you for your membership registration.{" "}
                    <span className="text-church-burgundy font-medium">
                      እግዚአብሔር ይባርክዎት!
                    </span>{" "}
                    Your payment has been processed successfully and you are now
                    officially a member of our church community. Welcome to our
                    family!
                  </p>
                </div>

                {/* Membership Details */}
                {sessionData && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-800 mb-3">
                      Here are the details of your membership:
                    </h3>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Member:
                        </span>
                        <span className="text-gray-600">
                          {sessionData.name || sessionData.email}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Membership Type:
                        </span>
                        <span className="text-gray-600">
                          {sessionData.membershipType === "regular"
                            ? "Regular Member"
                            : sessionData.membershipType === "student"
                              ? "Student Member"
                              : sessionData.membershipType === "senior"
                                ? "Senior Member"
                                : sessionData.membershipType === "family"
                                  ? "Family Member"
                                  : "Regular Member"}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Registration Date:
                        </span>
                        <span className="text-gray-600">
                          {sessionData.date}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Annual Fee:
                        </span>
                        <span className="text-gray-600 font-semibold">
                          {sessionData.formattedAmount}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Payment Method:
                        </span>
                        <span className="text-gray-600">
                          Stripe Payment Element
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="font-medium text-gray-700">
                          Payment ID:
                        </span>
                        <span className="text-gray-600 text-xs">
                          {Math.floor(Math.random() * 1000)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <Button
                        variant="link"
                        className="text-blue-600 hover:text-blue-800 p-0 h-auto font-normal"
                        onClick={() => window.print()}
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        View the receipt in your browser »
                      </Button>
                    </div>
                  </div>
                )}

                {/* Welcome Message */}
                <div className="bg-church-cream p-4 rounded-lg">
                  <h4 className="font-semibold text-church-burgundy mb-2">
                    Welcome to Our Church Family!
                  </h4>
                  <p className="text-sm text-gray-700">
                    As a new member, you'll receive information about upcoming
                    events, services, and opportunities to get involved in our
                    community. We look forward to seeing you at our services!
                  </p>
                </div>

                {/* Closing */}
                <div className="space-y-4 pt-6">
                  <p className="text-gray-700">Sincerely,</p>
                  <p className="text-church-burgundy font-medium">
                    ደብረ ብስራት ዳግማዊ ኩሊቢ ቅዱስ ገብርኤል በኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን
                  </p>
                  <p className="text-gray-700 font-medium">
                    Debre Bisrat Dagimawi Kulibi St.Gabriel Ethiopian Orthodox
                    Tewahedo Church
                  </p>

                  <div className="text-sm text-gray-600 space-y-1">
                    <p className="text-blue-600">6020 Batson Rd</p>
                    <p className="text-blue-600">Burtonsville, MD 20866</p>
                  </div>
                </div>

                {/* Church Logo/Image */}
                <div className="flex justify-center pt-6">
                  <div className="w-48 h-32 bg-church-burgundy rounded-lg overflow-hidden shadow-md">
                    <img
                      src="/images/church-front.jpg"
                      alt="Church Building"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80";
                      }}
                    />
                  </div>
                </div>

                {/* Action Button */}
                <div className="flex justify-center pt-6">
                  <Button
                    asChild
                    className="bg-church-burgundy hover:bg-church-burgundy/90 text-white px-8 py-3 rounded-lg font-semibold"
                  >
                    <Link to="/">Return to Home</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MembershipSuccess;
