
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Heart, DollarSign } from "lucide-react";

export default function Donation() {
  const [amount, setAmount] = useState("");
  const [customAmount, setCustomAmount] = useState("");
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [purpose, setPurpose] = useState("General Fund");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [stripeEnabled, setStripeEnabled] = useState(false);
  const { toast } = useToast();

  const predefinedAmounts = ["25", "50", "100", "250", "500"];
  const purposes = [
    "General Fund",
    "Building Fund",
    "Ministry Support",
    "Youth Programs",
    "Community Outreach",
    "Special Events"
  ];

  useEffect(() => {
    checkStripeSettings();
  }, []);

  const checkStripeSettings = async () => {
    try {
      const { data } = await supabase
        .from("site_settings")
        .select("enable_stripe, stripe_publishable_key")
        .single();

      setStripeEnabled(Boolean(data?.enable_stripe && data?.stripe_publishable_key));
    } catch (error) {
      console.error("Error checking Stripe settings:", error);
    }
  };

  // ... keep existing code (handleAmountSelect, handleCustomAmountChange, getSelectedAmount functions)

  const handleAmountSelect = (value: string) => {
    setAmount(value);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setAmount("");
  };

  const getSelectedAmount = () => {
    return customAmount || amount;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const selectedAmount = getSelectedAmount();
    if (!selectedAmount || parseFloat(selectedAmount) <= 0) {
      toast({
        title: "Error",
        description: "Please enter a valid donation amount",
        variant: "destructive",
      });
      return;
    }

    if (!isAnonymous && (!donorName || !donorEmail)) {
      toast({
        title: "Error",
        description: "Please provide your name and email",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);

    try {
      if (stripeEnabled) {
        const { data, error } = await supabase.functions.invoke("create-checkout", {
          body: {
            amount: parseFloat(selectedAmount),
            purpose,
            donor_name: isAnonymous ? null : donorName,
            donor_email: isAnonymous ? null : donorEmail,
            is_anonymous: isAnonymous
          }
        });

        if (error) throw error;

        if (data.url) {
          window.location.href = data.url;
        }
      } else {
        // Fallback for when Stripe is not enabled
        const { error } = await supabase
          .from("donations")
          .insert({
            amount: parseFloat(selectedAmount),
            donor_name: isAnonymous ? null : donorName,
            donor_email: isAnonymous ? null : donorEmail,
            purpose,
            is_anonymous: isAnonymous,
            payment_status: "pending",
            payment_method: "offline"
          });

        if (error) throw error;

        toast({
          title: "Thank You!",
          description: "Your donation request has been recorded. Please contact the church for payment instructions.",
        });

        // Reset form
        setAmount("");
        setCustomAmount("");
        setDonorName("");
        setDonorEmail("");
        setPurpose("General Fund");
        setIsAnonymous(false);
      }
    } catch (error) {
      console.error("Error processing donation:", error);
      toast({
        title: "Error",
        description: "Failed to process donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  // ... keep existing code (JSX return statement)

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <Heart className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-4xl font-bold mb-4">Make a Donation</h1>
          <p className="text-lg text-gray-600">
            Your generous contribution helps us serve our community and spread God's love.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Donation Details
            </CardTitle>
            <CardDescription>
              {stripeEnabled ? 
                "Complete your secure donation using our online payment system" :
                "Please fill out the form below. Payment instructions will be provided after submission."
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Amount Selection */}
              <div className="space-y-4">
                <Label className="text-base font-medium">Donation Amount</Label>
                <RadioGroup value={amount} onValueChange={handleAmountSelect}>
                  <div className="grid grid-cols-3 gap-3">
                    {predefinedAmounts.map((amt) => (
                      <div key={amt} className="flex items-center space-x-2">
                        <RadioGroupItem value={amt} id={`amount-${amt}`} />
                        <Label htmlFor={`amount-${amt}`} className="cursor-pointer">
                          ${amt}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
                <div className="space-y-2">
                  <Label htmlFor="customAmount">Custom Amount ($)</Label>
                  <Input
                    id="customAmount"
                    type="number"
                    min="1"
                    step="0.01"
                    value={customAmount}
                    onChange={(e) => handleCustomAmountChange(e.target.value)}
                    placeholder="Enter custom amount"
                  />
                </div>
              </div>

              {/* Purpose Selection */}
              <div className="space-y-2">
                <Label htmlFor="purpose">Donation Purpose</Label>
                <RadioGroup value={purpose} onValueChange={setPurpose}>
                  <div className="space-y-2">
                    {purposes.map((p) => (
                      <div key={p} className="flex items-center space-x-2">
                        <RadioGroupItem value={p} id={`purpose-${p}`} />
                        <Label htmlFor={`purpose-${p}`} className="cursor-pointer">
                          {p}
                        </Label>
                      </div>
                    ))}
                  </div>
                </RadioGroup>
              </div>

              {/* Anonymous Option */}
              <div className="flex items-center space-x-2">
                <Switch
                  id="anonymous"
                  checked={isAnonymous}
                  onCheckedChange={setIsAnonymous}
                />
                <Label htmlFor="anonymous">Make this donation anonymous</Label>
              </div>

              {/* Donor Information */}
              {!isAnonymous && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="donorName">Full Name</Label>
                    <Input
                      id="donorName"
                      value={donorName}
                      onChange={(e) => setDonorName(e.target.value)}
                      placeholder="Your full name"
                      required={!isAnonymous}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="donorEmail">Email Address</Label>
                    <Input
                      id="donorEmail"
                      type="email"
                      value={donorEmail}
                      onChange={(e) => setDonorEmail(e.target.value)}
                      placeholder="your.email@example.com"
                      required={!isAnonymous}
                    />
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full"
                disabled={processing || !getSelectedAmount()}
              >
                {processing ? "Processing..." : 
                 stripeEnabled ? `Donate $${getSelectedAmount()} via Stripe` : 
                 `Submit Donation Request - $${getSelectedAmount()}`}
              </Button>

              {!stripeEnabled && (
                <p className="text-sm text-gray-500 text-center">
                  Online payments are currently not available. Please contact the church for payment instructions.
                </p>
              )}
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
