
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const MembershipRegistration: React.FC = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [membershipType, setMembershipType] = useState<string>("regular");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    address: "",
    agreeToTerms: false,
  });

  const membershipPrices = {
    regular: 50,
    student: 25,
    senior: 30,
    family: 100,
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      toast({
        title: "Error",
        description: "Please agree to the terms and conditions",
        variant: "destructive",
      });
      return;
    }

    if (!formData.fullName || !formData.email) {
      toast({
        title: "Error", 
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // First, add member to database
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .insert({
          full_name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          membership_type: membershipType,
          membership_status: "pending",
          membership_date: new Date().toISOString().split('T')[0],
          join_date: new Date().toISOString().split('T')[0],
        })
        .select()
        .single();

      if (memberError) {
        console.error("Error creating member:", memberError);
        throw new Error("Failed to create member record");
      }

      // Create Stripe checkout session
      const { data: checkoutData, error: checkoutError } = await supabase.functions.invoke(
        "create-checkout",
        {
          body: {
            amount: membershipPrices[membershipType as keyof typeof membershipPrices] * 100, // Convert to cents
            currency: "usd",
            membershipType: membershipType,
            memberName: formData.fullName,
            memberEmail: formData.email,
            memberId: memberData.id,
          },
        }
      );

      if (checkoutError) {
        console.error("Error creating checkout session:", checkoutError);
        throw new Error("Failed to create payment session");
      }

      if (checkoutData?.url) {
        // Redirect to Stripe checkout
        window.location.href = checkoutData.url;
      } else {
        throw new Error("No checkout URL received");
      }

    } catch (error) {
      console.error("Registration error:", error);
      toast({
        title: "Registration Failed",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-church-cream to-white py-12">
        <div className="container mx-auto max-w-2xl px-4">
          <Card className="shadow-xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold text-church-burgundy mb-2">
                Church Membership Registration
              </CardTitle>
              <p className="text-gray-600">
                Join our church family and become part of our community
              </p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-church-burgundy">
                    Personal Information
                  </h3>
                  
                  <div>
                    <Label htmlFor="fullName">Full Name *</Label>
                    <Input
                      id="fullName"
                      name="fullName"
                      type="text"
                      required
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email">Email Address *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label htmlFor="address">Address</Label>
                    <Input
                      id="address"
                      name="address"
                      type="text"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="mt-1"
                    />
                  </div>
                </div>

                {/* Membership Type */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-church-burgundy">
                    Membership Type
                  </h3>
                  
                  <RadioGroup
                    value={membershipType}
                    onValueChange={setMembershipType}
                    className="space-y-3"
                  >
                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="regular" id="regular" />
                      <Label htmlFor="regular" className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>Regular Membership</span>
                          <span className="font-semibold">${membershipPrices.regular}/year</span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="student" id="student" />
                      <Label htmlFor="student" className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>Student Membership</span>
                          <span className="font-semibold">${membershipPrices.student}/year</span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="senior" id="senior" />
                      <Label htmlFor="senior" className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>Senior Membership (65+)</span>
                          <span className="font-semibold">${membershipPrices.senior}/year</span>
                        </div>
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2 p-3 border rounded-lg">
                      <RadioGroupItem value="family" id="family" />
                      <Label htmlFor="family" className="flex-1 cursor-pointer">
                        <div className="flex justify-between">
                          <span>Family Membership</span>
                          <span className="font-semibold">${membershipPrices.family}/year</span>
                        </div>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="agreeToTerms"
                      name="agreeToTerms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => 
                        setFormData(prev => ({ ...prev, agreeToTerms: checked === true }))
                      }
                    />
                    <Label htmlFor="agreeToTerms" className="text-sm text-gray-600">
                      I agree to the terms and conditions of church membership and 
                      understand that the registration fee is non-refundable.
                    </Label>
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading || !formData.agreeToTerms}
                  className="w-full bg-church-burgundy hover:bg-church-burgundy/90 text-white py-3 text-lg font-semibold"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Processing Registration...
                    </>
                  ) : (
                    `Pay $${membershipPrices[membershipType as keyof typeof membershipPrices]} & Complete Registration`
                  )}
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
