import * as React from "react";
import { useState } from "react";
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
// import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { CheckCircle, User, Users, CreditCard, MapPin } from "lucide-react";
import MemberDashboard from "../components/MemberDashboard";

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;
  streetAddress: string;
  city: string;
  stateProvinceRegion: string;
  postalZipCode: string;
  country: string;
  membershipType: string;
  // ministryInterests: string;
  preferredLanguage: string;
  emailUpdates: boolean;
  agreeToTerms: boolean;
  // Removed unused children field for cleanup
}

const MembershipRegistration = () => {
  const { t } = useLanguage();

  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<FormData>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    dateOfBirth: "",
    gender: "",
    streetAddress: "",
    city: "",
    stateProvinceRegion: "",
    postalZipCode: "",
    country: "United States",
    membershipType: "regular",
    // ministryInterests: "",
    preferredLanguage: "english",
    emailUpdates: true,
    agreeToTerms: false,
  });

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  // Removed unused ministryOptions and volunteerOptions arrays

  const validateStep = (step: number): boolean => {
    const errors: Record<string, string> = {};

    switch (step) {
      case 1:
        if (!formData.firstName.trim())
          errors.firstName = "First name is required";
        if (!formData.lastName.trim())
          errors.lastName = "Last name is required";
        if (!formData.email.trim()) errors.email = "Email is required";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
          errors.email = "Invalid email format";
        if (!formData.phone.trim()) errors.phone = "Phone number is required";
        if (!formData.dateOfBirth)
          errors.dateOfBirth = "Date of birth is required";
        if (!formData.gender) errors.gender = "Gender is required";
        break;
      case 2:
        if (!formData.streetAddress.trim())
          errors.streetAddress = "Street address is required";
        if (!formData.city.trim()) errors.city = "City is required";
        if (!formData.stateProvinceRegion.trim())
          errors.stateProvinceRegion = "State/Province/Region is required";
        if (!formData.postalZipCode.trim())
          errors.postalZipCode = "Postal/ZIP code is required";
        break;
      case 3:
        if (!formData.membershipType)
          errors.membershipType = "Membership type is required";
        if (!formData.agreeToTerms)
          errors.agreeToTerms = "You must agree to the terms and conditions";
        break;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrevious = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleInputChange = (field: keyof FormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  // Removed unused handleArrayChange function

  // Removed useEffect for children state

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  if (!validateStep(currentStep)) return;
  
  setIsSubmitting(true);
  setError(null);
  
  try {
    // Determine membership fee based on type
    const membershipFees = {
      regular: "100",
      student: "50",
      senior: "75",
      family: "200",
    };
    const membershipFee = membershipFees[formData.membershipType as keyof typeof membershipFees] || "100";

    // First create the member record
    const memberResponse = await supabase.functions.invoke(
      "membership-management",
      {
        body: {
          action: "create_member",
          member_data: {
            full_name: `${formData.firstName} ${formData.lastName}`,
            first_name: formData.firstName,
            last_name: formData.lastName,
            email: formData.email,
            phone: formData.phone,
            address: `${formData.streetAddress}, ${formData.city}, ${formData.stateProvinceRegion} ${formData.postalZipCode}`,
            street_address: formData.streetAddress,
            city: formData.city,
            state_province_region: formData.stateProvinceRegion,
            postal_zip_code: formData.postalZipCode,
            country: formData.country,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            membership_type: formData.membershipType,
            preferred_language: formData.preferredLanguage,
            email_updates: formData.emailUpdates,
            terms_accepted: formData.agreeToTerms,
            newsletter_consent: formData.emailUpdates,
            membership_status: "pending_payment", // Initial status
            payment_status: "pending",
          },
        },
      }
    );

    if (memberResponse.error) {
      throw new Error(`Member registration failed: ${memberResponse.error.message || "Unknown error"}`);
    }

    const newMember = memberResponse.data?.member;
    if (!newMember?.id) {
      throw new Error("Failed to create member record or get member ID");
    }

    // Create Stripe checkout session with all required metadata
    const checkoutData = {
      amount: membershipFee,
      donationType: "one_time",
      purpose: "membership_fee",
      email: formData.email,
      name: `${formData.firstName} ${formData.lastName}`,
      address: `${formData.streetAddress}, ${formData.city}, ${formData.stateProvinceRegion} ${formData.postalZipCode}`,
      memberId: newMember.id, // Now included in initial request
    };

    const response = await supabase.functions.invoke("create-checkout", {
      body: checkoutData,
    });

    if (response.error) {
      // Update member record to reflect payment failure
      await supabase
        .from('members')
        .update({ 
          membership_status: 'registration_failed',
          payment_status: 'failed'
        })
        .eq('id', newMember.id);
        
      throw new Error(`Payment initiation failed: ${response.error.message || "Unknown error"}`);
    }

    if (!response.data?.url) {
      throw new Error("No checkout URL received from payment processor");
    }

    // Track the pending payment in your database
    await supabase
      .from('member_payments')
      .insert({
        member_id: newMember.id,
        amount: parseFloat(membershipFee),
        payment_method: 'stripe',
        status: 'pending',
        checkout_session_id: response.data.sessionId, // Make sure your create-checkout returns this
      });

    // Redirect to Stripe checkout
    window.location.href = response.data.url;

  } catch (error: unknown) {
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Registration failed. Please try again.";
    
    console.error("Membership registration error:", error);
    toast({
      variant: "destructive",
      title: "Registration Error",
      description: `There was an error processing your membership registration. ${errorMessage}`,
    });
    setError(errorMessage);
  } finally {
    setIsSubmitting(false);
  }
};

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <User className="h-5 w-5 text-church-burgundy" />
              <h3 className="text-lg font-semibold">Personal Information</h3>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name *</Label>
                <Input
                  id="firstName"
                  value={formData.firstName}
                  onChange={(e) =>
                    handleInputChange("firstName", e.target.value)
                  }
                  className={formErrors.firstName ? "border-red-500" : ""}
                />
                {formErrors.firstName && (
                  <p className="text-red-500 text-sm">{formErrors.firstName}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name *</Label>
                <Input
                  id="lastName"
                  value={formData.lastName}
                  onChange={(e) =>
                    handleInputChange("lastName", e.target.value)
                  }
                  className={formErrors.lastName ? "border-red-500" : ""}
                />
                {formErrors.lastName && (
                  <p className="text-red-500 text-sm">{formErrors.lastName}</p>
                )}
              </div>
            </div>

            {/* Contact Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className={formErrors.email ? "border-red-500" : ""}
                />
                {formErrors.email && (
                  <p className="text-red-500 text-sm">{formErrors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  className={formErrors.phone ? "border-red-500" : ""}
                />
                {formErrors.phone && (
                  <p className="text-red-500 text-sm">{formErrors.phone}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dateOfBirth">Date of Birth *</Label>
                <Input
                  id="dateOfBirth"
                  type="date"
                  value={formData.dateOfBirth}
                  onChange={(e) =>
                    handleInputChange("dateOfBirth", e.target.value)
                  }
                  className={formErrors.dateOfBirth ? "border-red-500" : ""}
                />
                {formErrors.dateOfBirth && (
                  <p className="text-red-500 text-sm">
                    {formErrors.dateOfBirth}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Gender *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">Male</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">Female</Label>
                  </div>
                </RadioGroup>
                {formErrors.gender && (
                  <p className="text-red-500 text-sm">{formErrors.gender}</p>
                )}
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="h-5 w-5 text-church-burgundy" />
              <h3 className="text-lg font-semibold">Address Information</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="streetAddress">Street Address *</Label>
              <Input
                id="streetAddress"
                value={formData.streetAddress}
                onChange={(e) =>
                  handleInputChange("streetAddress", e.target.value)
                }
                className={formErrors.streetAddress ? "border-red-500" : ""}
              />
              {formErrors.streetAddress && (
                <p className="text-red-500 text-sm">
                  {formErrors.streetAddress}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City *</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  className={formErrors.city ? "border-red-500" : ""}
                />
                {formErrors.city && (
                  <p className="text-red-500 text-sm">{formErrors.city}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="stateProvinceRegion">State/Province *</Label>
                <Input
                  id="stateProvinceRegion"
                  value={formData.stateProvinceRegion}
                  onChange={(e) =>
                    handleInputChange("stateProvinceRegion", e.target.value)
                  }
                  className={
                    formErrors.stateProvinceRegion ? "border-red-500" : ""
                  }
                />
                {formErrors.stateProvinceRegion && (
                  <p className="text-red-500 text-sm">
                    {formErrors.stateProvinceRegion}
                  </p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalZipCode">ZIP/Postal Code *</Label>
                <Input
                  id="postalZipCode"
                  value={formData.postalZipCode}
                  onChange={(e) =>
                    handleInputChange("postalZipCode", e.target.value)
                  }
                  className={formErrors.postalZipCode ? "border-red-500" : ""}
                />
                {formErrors.postalZipCode && (
                  <p className="text-red-500 text-sm">
                    {formErrors.postalZipCode}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Select
                  value={formData.country}
                  onValueChange={(value) => handleInputChange("country", value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="United States">United States</SelectItem>
                    <SelectItem value="Canada">Canada</SelectItem>
                    <SelectItem value="Ethiopia">Ethiopia</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-church-burgundy" />
              <h3 className="text-lg font-semibold">
                Membership Details & Preferences
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="membershipType">Membership Type *</Label>
              <Select
                value={formData.membershipType}
                onValueChange={(value) =>
                  handleInputChange("membershipType", value)
                }
              >
                <SelectTrigger
                  className={formErrors.membershipType ? "border-red-500" : ""}
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">
                    Regular Member ($100/year)
                  </SelectItem>
                  <SelectItem value="student">
                    Student Member ($50/year)
                  </SelectItem>
                  <SelectItem value="senior">
                    Senior Member ($75/year)
                  </SelectItem>
                  <SelectItem value="family">
                    Family Member ($200/year)
                  </SelectItem>
                </SelectContent>
              </Select>
              {formErrors.membershipType && (
                <p className="text-red-500 text-sm">
                  {formErrors.membershipType}
                </p>
              )}
            </div>

            {/* <div className="space-y-2">
              <Label htmlFor="ministryInterests">Ministry Interests</Label>
              <Textarea
                id="ministryInterests"
                value={formData.ministryInterests}
                onChange={(e) =>
                  handleInputChange("ministryInterests", e.target.value)
                }
                placeholder="Please describe any ministries or volunteer activities you're interested in..."
                rows={3}
              />
            </div> */}

            <div className="space-y-2">
              <Label>Preferred Language</Label>
              <RadioGroup
                value={formData.preferredLanguage}
                onValueChange={(value) =>
                  handleInputChange("preferredLanguage", value)
                }
                className="flex gap-6"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="english" id="english" />
                  <Label htmlFor="english">English</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="amharic" id="amharic" />
                  <Label htmlFor="amharic">Amharic</Label>
                </div>
              </RadioGroup>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="emailUpdates"
                  checked={formData.emailUpdates}
                  onCheckedChange={(checked) =>
                    handleInputChange("emailUpdates", checked)
                  }
                />
                <Label htmlFor="emailUpdates">
                  I would like to receive email updates about church events and
                  news
                </Label>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onCheckedChange={(checked) =>
                    handleInputChange("agreeToTerms", checked)
                  }
                  className={formErrors.agreeToTerms ? "border-red-500" : ""}
                />
                <Label
                  htmlFor="agreeToTerms"
                  className="text-sm leading-relaxed"
                >
                  I agree to the church's terms and conditions, and I understand
                  that membership requires an annual fee. I commit to
                  participating in church activities and supporting the church
                  community. *
                </Label>
              </div>
              {formErrors.agreeToTerms && (
                <p className="text-red-500 text-sm">
                  {formErrors.agreeToTerms}
                </p>
              )}
            </div>

            <div className="bg-church-cream p-4 rounded-lg">
              <h4 className="font-semibold text-church-burgundy mb-2">
                Membership Fee
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Annual membership fee:{" "}
                <span className="font-semibold">
                  $
                  {formData.membershipType === "regular"
                    ? "100"
                    : formData.membershipType === "student"
                      ? "50"
                      : formData.membershipType === "senior"
                        ? "75"
                        : formData.membershipType === "family"
                          ? "200"
                          : "100"}
                </span>
              </p>
              <p className="text-xs text-gray-500">
                After submitting this form, you will be redirected to a secure
                payment page to complete your membership registration.
              </p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepIcon = (step: number) => {
    if (step < currentStep) {
      return <CheckCircle className="h-5 w-5 text-green-600" />;
    } else if (step === currentStep) {
      return (
        <div className="h-5 w-5 rounded-full bg-church-burgundy text-white flex items-center justify-center text-xs font-bold">
          {step}
        </div>
      );
    } else {
      return (
        <div className="h-5 w-5 rounded-full bg-gray-300 text-gray-600 flex items-center justify-center text-xs font-bold">
          {step}
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center bg-gradient-to-r from-church-gold/10 to-church-burgundy/10 rounded-t-lg py-8 mb-4">
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-church-gold/80 rounded-full mb-4 shadow-lg">
                <Users size={36} className="text-church-burgundy" />
              </div>
              <CardTitle className="text-3xl md:text-4xl font-serif text-church-burgundy mb-2">
                {t("membership_registration_title")}
              </CardTitle>
              <CardDescription className="text-lg text-gray-700 max-w-2xl mx-auto">
                {t("membership_registration_description")}
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  {getStepIcon(1)}
                  <span className="text-sm font-medium">Personal</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStepIcon(2)}
                  <span className="text-sm font-medium">Address</span>
                </div>
                <div className="flex items-center gap-2">
                  {getStepIcon(3)}
                  <span className="text-sm font-medium">Membership</span>
                </div>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-sm text-gray-600 mt-2 text-center">
                Step {currentStep} of {totalSteps}
              </p>
            </div>

            {/* Step Content */}
            <div className="min-h-[400px]">{renderStepContent()}</div>

            {/* Error Message */}
            {error && (
              <div className="text-red-600 bg-red-50 border border-red-200 rounded p-2 mb-4">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-8 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                {t("previous")}
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-church-burgundy hover:bg-church-burgundy/90"
                >
                  {t("next")}
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="bg-church-burgundy hover:bg-church-burgundy/90"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t("processing")}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {t("complete_registration")} $
                      {formData.membershipType === "regular"
                        ? "100"
                        : formData.membershipType === "student"
                          ? "50"
                          : formData.membershipType === "senior"
                            ? "75"
                            : formData.membershipType === "family"
                              ? "200"
                              : "100"}
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
      {/* TODO: Replace with real user logic */}
      {/*<MemberDashboard /> */}
    </Layout>
  );
};

export default MembershipRegistration;
