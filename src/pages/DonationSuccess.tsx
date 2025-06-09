
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Home, Receipt } from "lucide-react";
import { Link } from "react-router-dom";

export default function DonationSuccess() {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [donationDetails, setDonationDetails] = useState(null);

  useEffect(() => {
    // In a real implementation, you might want to verify the session with Stripe
    // and get donation details from your database
    console.log("Donation completed with session ID:", sessionId);
  }, [sessionId]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto text-center">
        <CheckCircle className="h-20 w-20 text-green-500 mx-auto mb-6" />
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-green-600">
              Thank You for Your Generous Donation!
            </CardTitle>
            <CardDescription>
              Your contribution has been successfully processed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <p className="text-lg mb-4">
                Your donation helps us continue our mission to serve our community 
                and spread God's love. We are truly grateful for your generosity.
              </p>
              
              {sessionId && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="text-sm text-gray-600">
                    <strong>Transaction ID:</strong> {sessionId}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Please save this for your records
                  </p>
                </div>
              )}
            </div>

            <div className="space-y-3">
              <p className="text-sm text-gray-600">
                📧 A confirmation email has been sent to your email address.
              </p>
              <p className="text-sm text-gray-600">
                📄 You may use this transaction for tax deduction purposes.
              </p>
              <p className="text-sm text-gray-600">
                ❓ If you have any questions, please contact our church office.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild>
                <Link to="/">
                  <Home className="h-4 w-4 mr-2" />
                  Return Home
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link to="/donation">
                  Make Another Donation
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
