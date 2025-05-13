
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Heart, CreditCard, Apple, Smartphone } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";

const Donation: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("one_time");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [purpose, setPurpose] = useState("general_fund");
  const [email, setEmail] = useState("");
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Call our Supabase Edge Function to create a Stripe checkout session
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          amount,
          donationType,
          purpose,
          email
        }
      });

      if (error) {
        throw error;
      }

      if (data?.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error("Failed to generate checkout URL");
      }
    } catch (error) {
      console.error("Payment error:", error);
      toast({
        title: "Payment Error",
        description: error.message || "Failed to process payment. Please try again.",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="py-16 px-6">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-church-gold">
            <CardHeader className="bg-gradient-to-r from-church-burgundy to-church-burgundy/90 text-white">
              <div className="flex items-center gap-3">
                <Heart className="text-church-gold h-8 w-8" />
                <CardTitle className="text-church-gold text-3xl">{t("donation_title")}</CardTitle>
              </div>
              <CardDescription className="text-white/90 mt-2">
                {t("donation_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount" className="text-church-burgundy">
                    {t("donation_amount")}
                  </Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input 
                      id="amount" 
                      type="number" 
                      min="1" 
                      step="0.01" 
                      required
                      className="pl-8 border-church-burgundy/30 focus:border-church-burgundy"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-church-burgundy">
                    {t("email_address")}
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required
                    className="border-church-burgundy/30 focus:border-church-burgundy"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@email.com"
                  />
                  <p className="text-xs text-gray-500">{t("donation_receipt_email")}</p>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-church-burgundy">
                    {t("donation_type")}
                  </Label>
                  <RadioGroup defaultValue="one_time" value={donationType} onValueChange={setDonationType} className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="one_time" id="one_time" />
                      <Label htmlFor="one_time">{t("one_time")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">{t("monthly")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quarterly" id="quarterly" />
                      <Label htmlFor="quarterly">{t("quarterly")}</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="annually" id="annually" />
                      <Label htmlFor="annually">{t("annually")}</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose" className="text-church-burgundy">
                    {t("donation_purpose")}
                  </Label>
                  <Select defaultValue="general_fund" value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger className="border-church-burgundy/30 focus:border-church-burgundy">
                      <SelectValue placeholder={t("donation_purpose")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general_fund">{t("general_fund")}</SelectItem>
                      <SelectItem value="building_fund">{t("building_fund")}</SelectItem>
                      <SelectItem value="youth_programs">{t("youth_programs")}</SelectItem>
                      <SelectItem value="charity">{t("charity")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-3">
                  <Label className="text-church-burgundy">
                    {t("payment_method")}
                  </Label>
                  <p className="text-sm text-gray-500">
                    {t("stripe_payment_methods")}
                  </p>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !amount || !email}
                  className="bg-church-gold hover:bg-church-gold/90 text-church-burgundy font-bold w-full"
                >
                  {isSubmitting ? "Processing..." : t("donate_now")}
                </Button>
                
                <p className="text-sm text-center text-gray-500">
                  {donationType !== "one_time" ? 
                    "Your card will be charged automatically on the recurring basis you selected." : 
                    "This is a one-time donation."
                  }
                </p>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Donation;
