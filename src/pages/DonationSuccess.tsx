
import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { CheckCircle, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

type SessionData = {
  amount: string;
  formattedAmount: string;
  email: string;
  purpose: string;
  donationType: string;
  date: string;
};

const DonationSuccess: React.FC = () => {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [sessionData, setSessionData] = useState<SessionData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          setError("Session ID not found. Unable to retrieve donation details.");
          setIsLoading(false);
          return;
        }

        // Call the get-session function to get session details
        // Using params in the URL path instead of query option
        const { data, error: sessionError } = await supabase.functions.invoke('get-session', {
          body: { session_id: sessionId }
        });

        if (sessionError) {
          throw new Error(sessionError.message || "Failed to retrieve session data");
        }

        if (!data || !data.session) {
          throw new Error("Failed to retrieve session data");
        }

        const session = data.session;
        
        // Extract the payment amount
        let amountInCents = 0;
        let email = '';
        let purpose = '';
        let donationType = 'one_time';
        
        if (session.mode === 'payment' && session.payment_intent) {
          amountInCents = session.amount_total;
        } else if (session.mode === 'subscription' && session.subscription) {
          amountInCents = session.amount_total;
          donationType = session.metadata?.donationType || 'monthly';
        }
        
        // Get customer email and metadata
        email = session.customer_details?.email || session.metadata?.email || '';
        purpose = session.metadata?.purpose || 'general_fund';
        
        // Calculate the amount in dollars
        const amount = (amountInCents / 100).toString();
        
        // Format the amount with currency
        const formattedAmount = new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD'
        }).format(amountInCents / 100);

        // Set the session data
        const sessionDetails: SessionData = {
          amount,
          formattedAmount,
          email,
          purpose,
          donationType,
          date: new Date().toLocaleDateString()
        };
        
        setSessionData(sessionDetails);
        
        // Send email notifications
        await supabase.functions.invoke('send-email', {
          body: {
            donorEmail: email,
            amount: amount,
            purpose: purpose,
            donationType: donationType
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching session data:", error);
        setError("Failed to process your donation information. Please contact support.");
        setIsLoading(false);
        
        toast({
          title: "Error",
          description: "There was an issue retrieving your donation information.",
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
            <p className="mt-4 text-lg">Processing your donation...</p>
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
              <CardHeader className="bg-red-50">
                <CardTitle className="text-red-700">An Error Occurred</CardTitle>
                <CardDescription className="text-red-600">
                  {error}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <p className="mb-4">If you believe your donation was processed, please contact us for verification.</p>
                <Button asChild className="bg-church-gold hover:bg-church-gold/90 text-church-burgundy font-bold">
                  <Link to="/">Return to Home</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="py-16 px-6">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-church-gold">
            <CardHeader className="bg-gradient-to-r from-church-burgundy to-church-burgundy/90 text-white">
              <div className="flex items-center justify-center gap-3">
                <CheckCircle className="text-church-gold h-12 w-12" />
                <CardTitle className="text-church-gold text-3xl">
                  {t("thank_you_for_your_donation")}
                </CardTitle>
              </div>
              <CardDescription className="text-white/90 mt-2 text-center">
                {t("donation_received")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-6">
                {sessionData && (
                  <div className="text-center space-y-4">
                    <p className="text-xl font-bold text-church-burgundy">
                      Amount: {sessionData.formattedAmount}
                    </p>
                    <p className="text-gray-700">
                      Purpose: {sessionData.purpose.split('_').map(word => 
                        word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                    </p>
                    <p className="text-gray-700">
                      Type: {sessionData.donationType === "one_time" ? "One-time donation" : 
                            sessionData.donationType === "monthly" ? "Monthly subscription" :
                            sessionData.donationType === "quarterly" ? "Quarterly subscription" :
                            "Annual subscription"}
                    </p>
                    <p className="text-gray-600">
                      {t("donation_confirmation_email")}
                    </p>
                  </div>
                )}
                
                <div className="flex flex-col space-y-4 pt-4">
                  <p className="text-center text-gray-700">
                    {t("may_god_bless_you")}
                  </p>
                  <Button 
                    asChild
                    className="bg-church-gold hover:bg-church-gold/90 text-church-burgundy font-bold"
                  >
                    <Link to="/">
                      {t("return_to_home")}
                    </Link>
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

export default DonationSuccess;
