
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
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsSubmitting(false);
      
      // Store donation details to pass to success page
      const donationDetails = {
        amount,
        donationType,
        paymentMethod,
        purpose,
        email,
        date: new Date().toISOString()
      };
      
      // Navigate to the success page with donation details
      navigate("/donation-success", { state: { donationDetails } });
      
      // Show toast notification
      toast({
        title: `Thank you for your $${amount} donation!`,
        description: "Your generosity helps our church community thrive.",
      });
    }, 2000);
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
                  <Tabs defaultValue="credit_card" value={paymentMethod} onValueChange={setPaymentMethod} className="w-full">
                    <TabsList className="grid grid-cols-3 w-full">
                      <TabsTrigger value="credit_card" className="flex items-center gap-2">
                        <CreditCard className="h-4 w-4" />
                        {t("credit_card")}
                      </TabsTrigger>
                      <TabsTrigger value="apple_pay" className="flex items-center gap-2">
                        <Apple className="h-4 w-4" />
                        {t("apple_pay")}
                      </TabsTrigger>
                      <TabsTrigger value="google_pay" className="flex items-center gap-2">
                        <Smartphone className="h-4 w-4" />
                        {t("google_pay")}
                      </TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="credit_card" className="mt-4 border rounded-md p-4">
                      <div className="space-y-3">
                        <div className="space-y-2">
                          <Label htmlFor="card_number">Card Number</Label>
                          <Input id="card_number" placeholder="1234 5678 9012 3456" className="border-church-burgundy/30" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <Label htmlFor="expiry">Expiry Date</Label>
                            <Input id="expiry" placeholder="MM/YY" className="border-church-burgundy/30" />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="cvc">CVC</Label>
                            <Input id="cvc" placeholder="123" className="border-church-burgundy/30" />
                          </div>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="apple_pay" className="mt-4 border rounded-md p-4 text-center">
                      <div className="py-4">
                        <p className="text-gray-600 mb-2">Click the button below to pay with Apple Pay</p>
                        <div className="bg-black text-white py-2 px-4 rounded-md inline-flex items-center gap-2 cursor-pointer">
                          <Apple className="h-5 w-5" />
                          <span className="font-medium">Pay</span>
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="google_pay" className="mt-4 border rounded-md p-4 text-center">
                      <div className="py-4">
                        <p className="text-gray-600 mb-2">Click the button below to pay with Google Pay</p>
                        <div className="bg-white border shadow-sm text-black py-2 px-4 rounded-md inline-flex items-center gap-2 cursor-pointer">
                          <Smartphone className="h-5 w-5" />
                          <span className="font-medium">Google Pay</span>
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
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
