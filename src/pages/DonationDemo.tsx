import React, { useState } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { DollarSign, CreditCard, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function DonationDemo() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [donationType, setDonationType] = useState("one_time");
  const [purpose, setPurpose] = useState("general_fund");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleDonate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!amount || parseFloat(amount) <= 0) {
        throw new Error("Please enter a valid donation amount");
      }

      if (!email) {
        throw new Error("Please enter your email address");
      }

      // Call the Supabase Edge Function to create a checkout session
      const checkoutData = {
        amount,
        donationType,
        purpose,
        email,
        name: name || "",
      };


      const { data, error: fnError } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: checkoutData,
        },
      );


      if (fnError) {
        throw new Error(fnError.message);
      }

      // Redirect to Stripe checkout
      if (data?.url) {
        window.location.href = data.url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to process donation",
      );
      toast({
        variant: "destructive",
        title: "Donation Error",
        description:
          err instanceof Error ? err.message : "Failed to process donation",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-church-burgundy mb-4">
            {t("donation_demo") || "Donation Demo"}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            This is a demonstration of our donation system using Stripe test
            mode. No real charges will be made.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <Card>
            <CardHeader className="bg-church-burgundy text-white">
              <CardTitle className="text-church-gold flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Make a Donation
              </CardTitle>
              <CardDescription className="text-white/80">
                Support our church with your generous contribution
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleDonate} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="amount">Donation Amount ($)</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="amount"
                      type="number"
                      placeholder="50"
                      min="1"
                      step="0.01"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="pl-10"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="name">Your Name (Optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Donation Type</Label>
                  <RadioGroup
                    value={donationType}
                    onValueChange={setDonationType}
                    className="flex flex-col space-y-1"
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="one_time" id="one_time" />
                      <Label htmlFor="one_time">One-time donation</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="monthly" id="monthly" />
                      <Label htmlFor="monthly">Monthly recurring</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="quarterly" id="quarterly" />
                      <Label htmlFor="quarterly">Quarterly recurring</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="yearly" id="yearly" />
                      <Label htmlFor="yearly">Yearly recurring</Label>
                    </div>
                  </RadioGroup>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="purpose">Donation Purpose</Label>
                  <Select value={purpose} onValueChange={setPurpose}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select purpose" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="general_fund">General Fund</SelectItem>
                      <SelectItem value="building_fund">
                        Building Fund
                      </SelectItem>
                      <SelectItem value="youth_programs">
                        Youth Programs
                      </SelectItem>
                      <SelectItem value="outreach">
                        Community Outreach
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  type="submit"
                  className="w-full bg-church-burgundy hover:bg-church-burgundy/90"
                  disabled={loading}
                >
                  {loading ? (
                    "Processing..."
                  ) : (
                    <span className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Donate Now
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col text-xs text-gray-500 pt-0">
              <div className="bg-blue-50 p-3 rounded-md border border-blue-100 w-full">
                <p className="font-medium text-blue-800 mb-1">
                  Demo Mode Information
                </p>
                <p>This is a demo integration using Stripe test mode.</p>
                <p>No real charges will be made.</p>
                <p className="mt-2 font-medium">
                  Test card: 4242 4242 4242 4242
                </p>
                <p>Any future expiration date, any CVC</p>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
