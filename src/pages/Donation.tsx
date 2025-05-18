import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Heart, CreditCard, Apple, Smartphone, Lock, Coins, Gift, Building, Users, ChurchIcon } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";

interface DonationPurpose {
  value: string;
  label: string;
  description: string;
  icon: React.ReactNode;
}

const SUGGESTED_AMOUNTS = [10, 25, 50, 100, 250, 500];

const DONATION_PURPOSES: DonationPurpose[] = [
  {
    value: "general_fund",
    label: "General Fund",
    description: "Support our church's daily operations and maintenance",
    icon: <ChurchIcon className="h-4 w-4" />
  },
  {
    value: "building_fund",
    label: "Building Fund",
    description: "Contribute to church expansion and renovation projects",
    icon: <Building className="h-4 w-4" />
  },
  {
    value: "youth_programs",
    label: "Youth Programs",
    description: "Support educational and spiritual programs for young members",
    icon: <Users className="h-4 w-4" />
  },
  {
    value: "charity",
    label: "Charity & Outreach",
    description: "Help us support those in need in our community",
    icon: <Gift className="h-4 w-4" />
  }
];

const Donation: React.FC = () => {
  const { t } = useLanguage();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donationType, setDonationType] = useState("one_time");
  const [paymentMethod, setPaymentMethod] = useState("credit_card");
  const [purpose, setPurpose] = useState("general_fund");
  const [contact, setContact] = useState("");
  const [contactError, setContactError] = useState(false);
  const [contactValid, setContactValid] = useState(true);
  const [contactType, setContactType] = useState<"email" | "phone" | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isGiftAid, setIsGiftAid] = useState(false);

  // Format currency input
  const formatCurrency = (value: string) => {
    const num = value.replace(/[^0-9.]/g, '');
    if (num === '') return '';
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(parseFloat(num));
  };

  // Handle custom amount input
  const handleCustomAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9.]/g, '');
    if (value === '' || !isNaN(parseFloat(value))) {
      setCustomAmount(value);
      setAmount(value);
    }
  };

  // Handle suggested amount selection
  const handleAmountSelect = (value: string) => {
    setAmount(value);
    setCustomAmount("");
  };

  // Validate contact format
  const validateContact = (value: string) => {
    if (!value) return { valid: false, type: null };
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/;
    
    if (emailRegex.test(value)) {
      return { valid: true, type: "email" as const };
    }
    if (phoneRegex.test(value)) {
      return { valid: true, type: "phone" as const };
    }
    
    if (value.replace(/[^0-9]/g, "").length > 5) {
      return { valid: false, type: "phone" as const };
    }
    return { valid: false, type: "email" as const };
  };

  useEffect(() => {
    if (isAnonymous) {
      setContact("");
      setContactValid(true);
      setContactType(null);
      setContactError(false);
      setIsGiftAid(false);
    } else {
      const { valid, type } = validateContact(contact);
      setContactValid(valid);
      setContactType(type);
    }
  }, [contact, isAnonymous]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAnonymous && (!contact || !contactValid)) {
      setContactError(true);
      toast({
        title: t("validation_error"),
        description: t("contact_required"),
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    setContactError(false);
    
    try {
      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: { 
          amount: parseFloat(amount),
          donationType,
          purpose,
          anonymous: isAnonymous,
          giftAid: isGiftAid,
          email: !isAnonymous && contactType === 'email' ? contact : undefined,
          phone: !isAnonymous && contactType === 'phone' ? contact : undefined
        }
      });

      if (error) throw error;

      if (data?.url) {
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

  // Calculate donation impact (example values)
  const getDonationImpact = () => {
    const amt = parseFloat(amount);
    if (isNaN(amt)) return "";
    if (amt >= 500) return "Could help fund major building repairs";
    if (amt >= 250) return "Could support youth programs for a month";
    if (amt >= 100) return "Could help maintain church services for a week";
    if (amt >= 50) return "Could provide educational materials";
    return "Every donation makes a difference";
  };

  return (
    <Layout>
      <div className="py-16 px-6">
        <div className="container mx-auto max-w-3xl">
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
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Amount Selection */}
                <div className="space-y-4">
                  <Label className="text-church-burgundy text-lg font-semibold">
                    {t("select_amount")}
                  </Label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {SUGGESTED_AMOUNTS.map((amt) => (
                      <Button
                        key={amt}
                        type="button"
                        variant={amount === amt.toString() ? "default" : "outline"}
                        className={`h-12 text-lg ${
                          amount === amt.toString()
                            ? "bg-church-gold text-church-burgundy"
                            : "border-church-burgundy/30 text-church-burgundy"
                        }`}
                        onClick={() => handleAmountSelect(amt.toString())}
                      >
                        ${amt}
                      </Button>
                    ))}
                  </div>

                  <div className="relative mt-4">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                    <Input
                      type="text"
                      placeholder="Enter custom amount"
                      className="pl-8 border-church-burgundy/30 focus:border-church-burgundy text-lg"
                      value={customAmount}
                      onChange={handleCustomAmountChange}
                    />
                  </div>
                </div>

                {/* Donation Purpose */}
                <div className="space-y-4">
                  <Label className="text-church-burgundy text-lg font-semibold">
                    {t("donation_purpose")}
                  </Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DONATION_PURPOSES.map((p) => (
                      <div
                        key={p.value}
                        className={`p-4 rounded-lg border cursor-pointer transition-all ${
                          purpose === p.value
                            ? "border-church-gold bg-church-gold/5"
                            : "border-gray-200 hover:border-church-gold/50"
                        }`}
                        onClick={() => setPurpose(p.value)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="text-church-burgundy">{p.icon}</div>
                          <div>
                            <h3 className="font-semibold text-church-burgundy">{p.label}</h3>
                            <p className="text-sm text-gray-600">{p.description}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-church-burgundy text-lg font-semibold">
                      {t("contact_details")}
                    </Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="anonymous"
                        checked={isAnonymous}
                        onChange={(e) => setIsAnonymous(e.target.checked)}
                        className="h-4 w-4 rounded border-church-burgundy/30 text-church-gold focus:ring-church-gold"
                      />
                      <Label htmlFor="anonymous" className="text-church-burgundy cursor-pointer">
                        {t("donate_anonymously")}
                      </Label>
                    </div>
                  </div>

                  {!isAnonymous && (
                    <div className="space-y-4">
                      <Input 
                        type="text"
                        placeholder={t("email_or_phone_placeholder")}
                        className={`border-church-burgundy/30 focus:border-church-burgundy ${
                          contact && !contactValid ? 'border-red-500' : ''
                        }`}
                        value={contact}
                        onChange={(e) => {
                          setContact(e.target.value);
                          setContactError(false);
                        }}
                      />
                      {contact && !contactValid && (
                        <p className="text-xs text-red-500">
                          {contactType === 'email' ? t("invalid_email") : t("invalid_phone")}
                        </p>
                      )}

                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          id="giftAid"
                          checked={isGiftAid}
                          onChange={(e) => setIsGiftAid(e.target.checked)}
                          className="h-4 w-4 rounded border-church-burgundy/30 text-church-gold focus:ring-church-gold"
                          disabled={isAnonymous}
                        />
                        <Label htmlFor="giftAid" className="text-church-burgundy cursor-pointer flex items-center gap-2">
                          {t("gift_aid")}
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger>
                                <Gift className="h-4 w-4 text-church-burgundy/60" />
                              </TooltipTrigger>
                              <TooltipContent>
                                <p className="max-w-xs">{t("gift_aid_explanation")}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        </Label>
                      </div>
                    </div>
                  )}
                </div>

                {/* Donation Frequency */}
                <div className="space-y-4">
                  <Label className="text-church-burgundy text-lg font-semibold">
                    {t("donation_frequency")}
                  </Label>
                  <RadioGroup 
                    defaultValue="one_time" 
                    value={donationType} 
                    onValueChange={setDonationType} 
                    className="grid grid-cols-2 md:grid-cols-4 gap-4"
                  >
                    {[
                      { value: "one_time", label: t("one_time") },
                      { value: "monthly", label: t("monthly") },
                      { value: "quarterly", label: t("quarterly") },
                      { value: "annually", label: t("annually") }
                    ].map((option) => (
                      <div
                        key={option.value}
                        className={`flex items-center justify-center p-3 rounded-lg border cursor-pointer transition-all ${
                          donationType === option.value
                            ? "border-church-gold bg-church-gold/5"
                            : "border-gray-200 hover:border-church-gold/50"
                        }`}
                        onClick={() => setDonationType(option.value)}
                      >
                        <span className="text-church-burgundy font-medium">
                          {option.label}
                        </span>
                      </div>
                    ))}
                  </RadioGroup>
                </div>

                {/* Payment Methods */}
                <div className="space-y-4">
                  <Label className="text-church-burgundy text-lg font-semibold flex items-center gap-2">
                    {t("payment_method")}
                    <Lock className="h-4 w-4 text-church-burgundy/60" />
                  </Label>
                  <div className="grid grid-cols-3 gap-4">
                    {[
                      { icon: <CreditCard className="h-5 w-5" />, label: "Credit Card" },
                      { icon: <Apple className="h-5 w-5" />, label: "Apple Pay" },
                      { icon: <Smartphone className="h-5 w-5" />, label: "Google Pay" }
                    ].map((method) => (
                      <div
                        key={method.label}
                        className="flex items-center gap-2 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200"
                      >
                        {method.icon}
                        <span className="text-sm font-medium">{method.label}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    {t("secure_payment_message")}
                  </p>
                </div>

                {amount && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                    <h3 className="text-church-burgundy font-semibold flex items-center gap-2">
                      <Coins className="h-4 w-4" />
                      {t("donation_impact")}
                    </h3>
                    <p className="text-sm text-gray-600">{getDonationImpact()}</p>
                  </div>
                )}
              </form>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 bg-gray-50 rounded-b-lg border-t">
              <div className="w-full pt-4">
                <div className="flex justify-between mb-2">
                  <span className="text-church-burgundy font-semibold">{t("total_amount")}:</span>
                  <span className="text-2xl font-bold text-church-burgundy">
                    ${amount ? parseFloat(amount).toFixed(2) : "0.00"}
                  </span>
                </div>
                {donationType !== "one_time" && (
                  <p className="text-sm text-gray-500 text-center">
                    {`${t("recurring_donation_notice")} ${t(donationType)}`}
                  </p>
                )}
                <Button 
                  type="submit"
                  onClick={handleSubmit}
                  disabled={isSubmitting || !amount || (!isAnonymous && (!contact || !contactValid))}
                  className="w-full bg-church-gold hover:bg-church-gold/90 text-church-burgundy mt-4 py-6 text-lg font-bold"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <span className="animate-spin">⌛</span>
                      {t("processing")}
                    </div>
                  ) : (
                    t("donate_now")
                  )}
                </Button>
              </div>

              <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
                <Lock className="h-3 w-3" />
                {t("secure_transaction_message")}
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Donation;
