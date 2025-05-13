
import React, { useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const DonationSuccess: React.FC = () => {
  const { t } = useLanguage();
  const location = useLocation();
  const donationDetails = location.state?.donationDetails || {};

  useEffect(() => {
    // Log that the page has been loaded with donation details
    console.log("Donation success page loaded with details:", donationDetails);
    
    // In a real implementation, you would send an email notification here
    // This would typically be handled by a backend service
    console.log("Email notifications would be sent to donor and admins");
  }, [donationDetails]);

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
                <div className="text-center space-y-4">
                  {donationDetails.amount && (
                    <p className="text-xl font-bold text-church-burgundy">
                      Amount: ${donationDetails.amount}
                    </p>
                  )}
                  {donationDetails.purpose && (
                    <p className="text-gray-700">
                      Purpose: {donationDetails.purpose}
                    </p>
                  )}
                  <p className="text-gray-600">
                    {t("donation_confirmation_email")}
                  </p>
                </div>
                
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
