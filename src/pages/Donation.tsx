
import { useState } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Heart,
  Shield,
  CreditCard,
  Phone,
  Mail,
  Users,
  Building,
  GraduationCap,
  HandHeart,
  CheckCircle,
  Lock,
  Smartphone,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function Donation() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [donationType, setDonationType] = useState("one_time");
  const [purpose, setPurpose] = useState("general_fund");
  const [amount, setAmount] = useState("");
  const [contactMethod, setContactMethod] = useState("email");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [includeBulletin, setIncludeBulletin] = useState(false);
  const [memorial, setMemorial] = useState("");
  const [loading, setLoading] = useState(false);

  // Suggested donation amounts
  const suggestedAmounts = [25, 50, 100, 250, 500, 1000];

  // Purpose descriptions for impact section
  const purposeImpacts = {
    general_fund: t("general_fund_impact") || "Supports the church's daily operations and ministries.",
    building_fund: t("building_fund_impact") || "Helps maintain and improve our church facilities.",
    youth_programs: t("youth_programs_impact") || "Supports youth activities and education programs.",
    charity: t("charity_impact") || "Aids community outreach and charitable initiatives.",
  };

  // Purpose icons
  const purposeIcons = {
    general_fund: Users,
    building_fund: Building,
    youth_programs: GraduationCap,
    charity: HandHeart,
  };

  const handleAmountSelect = (selectedAmount: number) => {
    setAmount(selectedAmount.toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) < 1) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount of at least $1.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const contactInfo = isAnonymous
        ? ""
        : contactMethod === "email"
          ? (formData.get("email") as string)
          : (formData.get("phone") as string);

      const { data, error } = await supabase.functions.invoke('create-checkout', {
        body: {
          amount,
          donationType,
          purpose,
          email: contactMethod === "email" ? contactInfo : "",
          phone: contactMethod === "phone" ? contactInfo : "",
          name: formData.get("name") as string || "",
          address: formData.get("address") as string || "",
          isAnonymous,
          includeBulletin,
          memorial: memorial.trim(),
        }
      });

      if (error) {
        throw new Error(error.message || "Payment initiation failed");
      }

      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL received");
      }
    } catch (error) {
      console.error("Error:", error);
      toast({
        title: "Payment Error",
        description:
          "There was an issue processing your donation. Please try again.",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  const PurposeIcon = purposeIcons[purpose as keyof typeof purposeIcons];

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-church-cream to-white py-12">
        <div className="container mx-auto px-4">
          {/* Header Section */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-church-burgundy rounded-full mb-4">
              <Heart className="w-8 h-8 text-church-gold" />
            </div>
            <h1 className="text-4xl md:text-5xl font-serif text-church-burgundy mb-4">
              {t("donation_title") || "Make a Donation"}
            </h1>
            <p className="text-xl text-church-burgundy/80 mb-2">
              {t("donation_subtitle") || "Support Our Ministry"}
            </p>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t("donation_description") || "Your generous donation helps us continue our mission and serve the community."}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {/* Main Donation Form */}
            <div className="lg:col-span-2">
              <Card className="shadow-lg border-church-gold/20">
                <CardHeader className="bg-gradient-to-r from-church-burgundy to-church-burgundy/90 text-white">
                  <CardTitle className="text-church-gold flex items-center">
                    <CreditCard className="w-5 h-5 mr-2" />
                    {t("donation_title") || "Make a Donation"}
                  </CardTitle>
                  <CardDescription className="text-white/90">
                    {t("donation_description") || "Support our ministry with your generous contribution"}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Suggested Amounts */}
                    <div className="space-y-3">
                      <Label className="text-lg font-semibold">
                        {t("suggested_amounts") || "Suggested Amounts"}
                      </Label>
                      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                        {suggestedAmounts.map((suggestedAmount) => (
                          <Button
                            key={suggestedAmount}
                            type="button"
                            variant={
                              amount === suggestedAmount.toString()
                                ? "default"
                                : "outline"
                            }
                            className={`h-12 ${
                              amount === suggestedAmount.toString()
                                ? "bg-church-burgundy hover:bg-church-burgundy/90 text-white"
                                : "border-church-burgundy/30 hover:border-church-burgundy hover:bg-church-burgundy/5"
                            }`}
                            onClick={() => handleAmountSelect(suggestedAmount)}
                          >
                            ${suggestedAmount}
                          </Button>
                        ))}
                      </div>
                    </div>

                    {/* Custom Amount */}
                    <div className="space-y-2">
                      <Label htmlFor="amount" className="text-lg font-semibold">
                        {t("custom_amount") || "Custom Amount"}
                      </Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-semibold">
                          $
                        </span>
                        <Input
                          id="amount"
                          type="number"
                          min="1"
                          step="1"
                          className="pl-8 h-12 text-lg border-church-burgundy/30 focus:border-church-burgundy"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="Enter amount"
                          required
                        />
                      </div>
                    </div>

                    {/* Donation Type */}
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">
                        {t("donation_type")}
                      </Label>
                      <Select
                        value={donationType}
                        onValueChange={setDonationType}
                      >
                        <SelectTrigger className="h-12 border-church-burgundy/30 focus:border-church-burgundy">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="one_time">
                            {t("one_time")}
                          </SelectItem>
                          <SelectItem value="monthly">
                            {t("monthly")}
                          </SelectItem>
                          <SelectItem value="quarterly">
                            {t("quarterly")}
                          </SelectItem>
                          <SelectItem value="annually">
                            {t("annually")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Purpose */}
                    <div className="space-y-2">
                      <Label className="text-lg font-semibold">
                        {t("donation_purpose")}
                      </Label>
                      <Select value={purpose} onValueChange={setPurpose}>
                        <SelectTrigger className="h-12 border-church-burgundy/30 focus:border-church-burgundy">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="general_fund">
                            {t("general_fund")}
                          </SelectItem>
                          <SelectItem value="building_fund">
                            {t("building_fund")}
                          </SelectItem>
                          <SelectItem value="youth_programs">
                            {t("youth_programs")}
                          </SelectItem>
                          <SelectItem value="charity">
                            {t("charity")}
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <Separator className="my-6" />

                    {/* Anonymous Donation */}
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="anonymous"
                          checked={isAnonymous}
                          onCheckedChange={(checked) =>
                            setIsAnonymous(checked as boolean)
                          }
                        />
                        <Label
                          htmlFor="anonymous"
                          className="text-base font-medium"
                        >
                          {t("anonymous_donation")}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-600 ml-6">
                        {t("anonymous_note")}
                      </p>
                    </div>

                    {/* Contact Information */}
                    {!isAnonymous && (
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold">
                          {t("contact_preference")}
                        </Label>
                        <div className="grid grid-cols-2 gap-4">
                          <Button
                            type="button"
                            variant={
                              contactMethod === "email" ? "default" : "outline"
                            }
                            className={`h-12 ${
                              contactMethod === "email"
                                ? "bg-church-burgundy hover:bg-church-burgundy/90"
                                : "border-church-burgundy/30 hover:border-church-burgundy"
                            }`}
                            onClick={() => setContactMethod("email")}
                          >
                            <Mail className="w-4 h-4 mr-2" />
                            {t("email_contact")}
                          </Button>
                          <Button
                            type="button"
                            variant={
                              contactMethod === "phone" ? "default" : "outline"
                            }
                            className={`h-12 ${
                              contactMethod === "phone"
                                ? "bg-church-burgundy hover:bg-church-burgundy/90"
                                : "border-church-burgundy/30 hover:border-church-burgundy"
                            }`}
                            onClick={() => setContactMethod("phone")}
                          >
                            <Phone className="w-4 h-4 mr-2" />
                            {t("phone_contact")}
                          </Button>
                        </div>

                        {contactMethod === "email" ? (
                          <Input
                            name="email"
                            type="email"
                            placeholder="your.email@example.com"
                            className="h-12 border-church-burgundy/30 focus:border-church-burgundy"
                            required
                          />
                        ) : (
                          <Input
                            name="phone"
                            type="tel"
                            placeholder="(555) 123-4567"
                            className="h-12 border-church-burgundy/30 focus:border-church-burgundy"
                            required
                          />
                        )}
                      </div>
                    )}

                    {/* Donor Recognition */}
                    {!isAnonymous && (
                      <div className="space-y-4">
                        <Label className="text-lg font-semibold">
                          {t("donor_recognition")}
                        </Label>
                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="bulletin"
                            checked={includeBulletin}
                            onCheckedChange={(checked) =>
                              setIncludeBulletin(checked as boolean)
                            }
                          />
                          <Label htmlFor="bulletin" className="text-base">
                            {t("include_in_bulletin")}
                          </Label>
                        </div>
                      </div>
                    )}

                    {/* Memorial/Dedication */}
                    <div className="space-y-2">
                      <Label
                        htmlFor="memorial"
                        className="text-lg font-semibold"
                      >
                        {t("memorial_dedication")}
                      </Label>
                      <Textarea
                        id="memorial"
                        value={memorial}
                        onChange={(e) => setMemorial(e.target.value)}
                        placeholder={t("memorial_placeholder")}
                        className="border-church-burgundy/30 focus:border-church-burgundy"
                        rows={3}
                      />
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={loading || !amount}
                      className="w-full h-14 text-lg bg-church-burgundy hover:bg-church-burgundy/90 text-white font-semibold"
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                          {t("processing") || "Processing..."}
                        </div>
                      ) : (
                        <div className="flex items-center">
                          <Lock className="w-5 h-5 mr-2" />
                          {t("proceed_to_payment") || "Proceed to Payment"}
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Impact Card */}
              <Card className="shadow-lg border-church-gold/20">
                <CardHeader className="bg-church-gold text-church-burgundy">
                  <CardTitle className="flex items-center">
                    <PurposeIcon className="w-5 h-5 mr-2" />
                    {t("donation_impact") || "Your Impact"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <p className="text-sm text-gray-700">
                    {purposeImpacts[purpose as keyof typeof purposeImpacts]}
                  </p>
                </CardContent>
              </Card>

              {/* Security & Trust */}
              <Card className="shadow-lg border-church-gold/20">
                <CardHeader>
                  <CardTitle className="flex items-center text-church-burgundy">
                    <Shield className="w-5 h-5 mr-2" />
                    {t("secure_payment") || "Secure Payment"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {t("secure_payment") || "Secure Payment"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {t("secure_payment_note") || "Your payment is processed securely through Stripe"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium">
                        {t("tax_deductible") || "Tax Deductible"}
                      </p>
                      <p className="text-xs text-gray-600">
                        {t("tax_deductible_note") || "Your donation may be tax deductible"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Payment Methods */}
              <Card className="shadow-lg border-church-gold/20">
                <CardContent className="p-4">
                  <p className="text-sm font-medium text-center mb-3">
                    Accepted Payment Methods
                  </p>
                  <div className="grid grid-cols-2 gap-2 mb-3">
                    <Badge variant="outline" className="px-2 py-1 justify-center">
                      Visa
                    </Badge>
                    <Badge variant="outline" className="px-2 py-1 justify-center">
                      Mastercard
                    </Badge>
                    <Badge variant="outline" className="px-2 py-1 justify-center">
                      Amex
                    </Badge>
                    <Badge variant="outline" className="px-2 py-1 justify-center">
                      Discover
                    </Badge>
                  </div>
                  <div className="flex justify-center space-x-4 pt-2 border-t">
                    <div className="flex items-center space-x-1">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-xs">Apple Pay</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Smartphone className="w-4 h-4" />
                      <span className="text-xs">Google Pay</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
