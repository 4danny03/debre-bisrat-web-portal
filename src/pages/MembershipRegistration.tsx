import React from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

const MembershipRegistration: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Get form data
      const formData = new FormData(e.target as HTMLFormElement);
      const amount = "100"; // Membership fee in dollars

      // Call Stripe checkout for membership fee payment
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          amount,
          donationType: "one_time",
          purpose: "membership_fee",
          email: formData.get('email'),
          metadata: {
            name: formData.get('name'),
            phone: formData.get('phone'),
            language: formData.get('language'),
            address: formData.get('address'),
            membershipType: formData.get('membershipType')
          }
        }
      });

      if (error) throw error;

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("Failed to generate checkout URL");
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process registration. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="py-16 px-6">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-church-gold">
            <CardHeader className="bg-gradient-to-r from-church-burgundy to-church-burgundy/90 text-white">
              <CardTitle className="text-church-gold text-3xl">{t("membership_registration_title") || "Membership Registration"}</CardTitle>
              <CardDescription className="text-white/90 mt-2">
                {t("membership_registration_description") || "Join our church community by registering as a member. Annual membership fee is $100."}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-church-burgundy">
                    {t("full_name")}
                  </Label>
                  <Input 
                    id="name" 
                    name="name"
                    required 
                    className="border-church-burgundy/30 focus:border-church-burgundy"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-church-burgundy">
                    {t("email")}
                  </Label>
                  <Input 
                    id="email" 
                    name="email"
                    type="email" 
                    required
                    className="border-church-burgundy/30 focus:border-church-burgundy"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-church-burgundy">
                    {t("phone")}
                  </Label>
                  <Input 
                    id="phone" 
                    name="phone"
                    type="tel" 
                    required
                    className="border-church-burgundy/30 focus:border-church-burgundy"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address" className="text-church-burgundy">
                    {t("address") || "Address"}
                  </Label>
                  <Input 
                    id="address" 
                    name="address"
                    required
                    className="border-church-burgundy/30 focus:border-church-burgundy"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="membershipType" className="text-church-burgundy">
                    {t("membership_type") || "Membership Type"}
                  </Label>
                  <Select defaultValue="individual" name="membershipType">
                    <SelectTrigger className="border-church-burgundy/30 focus:border-church-burgundy">
                      <SelectValue placeholder={t("select_membership_type") || "Select Membership Type"} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="individual">{t("individual_membership") || "Individual Membership"}</SelectItem>
                      <SelectItem value="family">{t("family_membership") || "Family Membership"}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-church-burgundy">
                    {t("preferred_language")}
                  </Label>
                  <Select defaultValue={language} name="language">
                    <SelectTrigger className="border-church-burgundy/30 focus:border-church-burgundy">
                      <SelectValue placeholder={t("preferred_language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t("english")}</SelectItem>
                      <SelectItem value="am">{t("amharic")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg bg-gray-50 p-4 text-sm text-gray-600">
                  <p>{t("membership_fee_notice") || "Annual Membership Fee: $100"}</p>
                  <p className="mt-1">{t("membership_fee_description") || "This fee helps support our church's activities and maintenance."}</p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-church-burgundy hover:bg-church-burgundy/90 w-full"
                >
                  {isSubmitting ? t("processing") || "Processing..." : t("register_and_pay") || "Register & Pay $100"}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default MembershipRegistration;
