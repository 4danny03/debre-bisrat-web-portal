import { type FC, useState, useEffect } from "react";
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
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import {
  CheckCircle,
  User,
  CreditCard,
  FileText,
  AlertCircle,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Users,
  Heart,
} from "lucide-react";

interface FormData {
  // Personal Information
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: string;

  // Address Information
  streetAddress: string;
  city: string;
  stateProvinceRegion: string;
  postalZipCode: string;
  country: string;

  // Membership Information
  membershipType: string;
  ministryInterests: string;
  preferredLanguage: string;
  emailUpdates: boolean;
  agreeToTerms: boolean;
}

const MembershipRegistration: FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [children, setChildren] = useState<
    Array<{ name: string; age: string }>
  >([{ name: "", age: "" }]);

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
    ministryInterests: "",
    preferredLanguage: "english",
    emailUpdates: true,
    agreeToTerms: false,
  });

  const totalSteps = 3;
  const progressPercentage = (currentStep / totalSteps) * 100;

  const ministryOptions = [
    "Sunday School",
    "Youth Ministry",
    "Music Ministry",
    "Prayer Ministry",
    "Outreach Ministry",
    "Women's Ministry",
    "Men's Ministry",
    "Children's Ministry",
    "Hospitality Ministry",
    "Media Ministry",
  ];

  const volunteerOptions = [
    "Event Planning",
    "Cleaning & Maintenance",
    "Food Service",
    "Transportation",
    "Translation Services",
    "Technical Support",
    "Administrative Support",
    "Fundraising",
    "Community Outreach",
    "Teaching",
  ];

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

  const handleInputChange = (field: keyof FormData, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleArrayChange = (field: keyof FormData, values: string[]) => {
    setFormData((prev) => ({ ...prev, [field]: values }));
  };

  const addChild = () => {
    setChildren((prev) => [...prev, { name: "", age: "" }]);
  };

  const removeChild = (index: number) => {
    setChildren((prev) => prev.filter((_, i) => i !== index));
  };

  const updateChild = (index: number, field: "name" | "age", value: string) => {
    setChildren((prev) =>
      prev.map((child, i) =>
        i === index ? { ...child, [field]: value } : child,
      ),
    );
  };

  useEffect(() => {
    if (Array.isArray(children)) {
      setFormData((prev) => ({ ...prev, children }));
    }
  }, [children]);

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;

    setIsSubmitting(true);

    try {
      // Create member record
      const { data: memberData, error: memberError } = await supabase
        .from("members")
        .insert([
          {
            full_name: `${formData.firstName} ${formData.lastName}`,
            email: formData.email,
            phone: formData.phone,
            address: `${formData.streetAddress}, ${formData.city}, ${formData.stateProvinceRegion} ${formData.postalZipCode}`,
            membership_type: formData.membershipType,
            membership_status: "pending",
            join_date: new Date().toISOString(),
            registration_date: new Date().toISOString().split("T")[0],
            first_name: formData.firstName,
            last_name: formData.lastName,
            street_address: formData.streetAddress,
            city: formData.city,
            state_province_region: formData.stateProvinceRegion,
            postal_zip_code: formData.postalZipCode,
            country: formData.country,
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            preferred_language: formData.preferredLanguage,
            ministry_interests: formData.ministryInterests
              ? [formData.ministryInterests]
              : [],
            email_updates: formData.emailUpdates,
          },
        ])
        .select()
        .single();

      if (memberError) {
        throw memberError;
      }

      // Determine membership fee based on type
      const membershipFees = {
        regular: "100",
        student: "50",
        senior: "75",
        family: "200",
      };
      const membershipFee =
        membershipFees[
          formData.membershipType as keyof typeof membershipFees
        ] || "100";

      // Create Stripe checkout session using the existing edge function
      const checkoutData = {
        amount: membershipFee,
        donationType: "one_time",
        purpose: "membership_fee",
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        address: `${formData.streetAddress}, ${formData.city}, ${formData.stateProvinceRegion} ${formData.postalZipCode}`,
        memberId: memberData.id,
        membershipType: formData.membershipType,
      };

      console.log("Invoking create-checkout function with data:", checkoutData);
      console.log(
        "Membership fee for type",
        formData.membershipType,
        ":",
        membershipFee,
      );

      const response = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: checkoutData,
        },
      );

      console.log("Checkout function response:", response);
      console.log("Response data:", response.data);
      console.log("Response error:", response.error);

      if (response.error) {
        console.error("Function error:", response.error);
        throw new Error(
          `Payment initiation failed: ${response.error.message || "Unknown error"}`,
        );
      }

      if (!response.data?.url) {
        console.error("No checkout URL in response:", response.data);
        throw new Error("No checkout URL received");
      }

      // Redirect to Stripe checkout
      console.log("Redirecting to checkout URL:", response.data.url);
      window.location.href = response.data.url;
    } catch (error) {
      console.error("Membership registration error:", error);
      toast({
        variant: "destructive",
        title: "Registration Error",
        description:
          "There was an error processing your membership registration. Please try again.",
      });
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

            <div className="space-y-2">
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
            </div>

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

  // Amharic translations for membership registration
  const translations = {
    en: {
      title: "Membership Registration",
      description: "Join our church community by registering as a member",
      personal: "Personal Information",
      firstName: "First Name",
      lastName: "Last Name",
      email: "Email Address",
      phone: "Phone Number",
      dateOfBirth: "Date of Birth",
      gender: "Gender",
      male: "Male",
      female: "Female",
      address: "Address Information",
      streetAddress: "Street Address",
      city: "City",
      state: "State",
      zipCode: "ZIP Code",
      country: "Country",
      membershipInfo: "Membership & Family Information",
      membershipType: "Membership Type",
      regularMember: "Regular Member ($100/year)",
      studentMember: "Student Member ($50/year)",
      seniorMember: "Senior Member ($75/year)",
      familyMember: "Family Member ($200/year)",
      previousMember: "I was previously a member of another Orthodox church",
      previousChurch: "Previous Church Name",
      baptized: "I have been baptized",
      baptismDate: "Baptism Date",
      maritalStatus: "Marital Status",
      single: "Single",
      married: "Married",
      divorced: "Divorced",
      widowed: "Widowed",
      spouseName: "Spouse's Name",
      children: "Children",
      addChild: "Add Child",
      childName: "Child's name",
      age: "Age",
      remove: "Remove",
      ministryInterests: "Ministry Interests & Emergency Contact",
      selectMinistries: "Ministry Interests (Select all that apply)",
      volunteerInterests: "Volunteer Interests (Select all that apply)",
      skills: "Special Skills or Talents",
      skillsPlaceholder:
        "Please describe any special skills, talents, or professional expertise you'd like to share...",
      emergencyContact: "Emergency Contact Information",
      emergencyName: "Emergency Contact Name",
      emergencyPhone: "Emergency Contact Phone",
      emergencyRelation: "Relationship to Emergency Contact",
      emergencyRelationPlaceholder: "e.g., Spouse, Parent, Sibling, Friend",
      finalDetails: "Final Details & Review",
      preferredLanguage: "Preferred Language",
      english: "English",
      amharic: "Amharic",
      contactMethod: "Preferred Contact Method",
      emailUpdates:
        "I would like to receive email updates about church events and news",
      smsUpdates:
        "I would like to receive SMS updates for urgent announcements",
      howDidYouHear: "How did you hear about our church?",
      additionalNotes: "Additional Notes or Comments",
      notesPlaceholder: "Please share anything else you'd like us to know...",
      agreeToTerms:
        "I agree to the church's terms and conditions, and I understand that membership requires an annual fee. I commit to participating in church activities and supporting the church community.",
      agreeToPhotos:
        "I consent to having my photo taken during church events and activities for use in church publications, website, and social media.",
      membershipFee: "Membership Fee",
      annualFee: "Annual membership fee: ",
      paymentRedirect:
        "After submitting this form, you will be redirected to a secure payment page to complete your membership registration.",
      previous: "Previous",
      next: "Next",
      processing: "Processing...",
      completeRegistration: "Complete Registration & Pay $100",
      personal_step: "Personal",
      address_step: "Address",
      membership_step: "Membership",
      ministry_step: "Ministry",
      review_step: "Review",
    },
    am: {
      title: "የአባልነት ምዝገባ",
      description: "እንደ አባል በመመዝገብ የቤተክርስቲያን ማህበረሰባችንን ይቀላቀሉ",
      personal: "የግል መረጃ",
      firstName: "መጠሪያ ስም",
      lastName: "የአባት ስም",
      email: "የኢሜይል አድራሻ",
      phone: "ስልክ ቁጥር",
      dateOfBirth: "የትውልድ ቀን",
      gender: "ፆታ",
      male: "ወንድ",
      female: "ሴት",
      address: "የአድራሻ መረጃ",
      streetAddress: "የመንገድ አድራሻ",
      city: "ከተማ",
      state: "ግዛት",
      zipCode: "ዚፕ ኮድ",
      country: "ሀገር",
      membershipInfo: "የአባልነት እና የቤተሰብ መረጃ",
      membershipType: "የአባልነት አይነት",
      regularMember: "መደበኛ አባል ($100/አመት)",
      studentMember: "የተማሪ አባል ($50/አመት)",
      seniorMember: "የአዛውንት አባል ($75/አመት)",
      familyMember: "የቤተሰብ አባል ($200/አመት)",
      previousMember: "ከዚህ በፊት የሌላ ኦርቶዶክስ ቤተክርስቲያን አባል ነበርኩ",
      previousChurch: "የቀድሞ ቤተክርስቲያን ስም",
      baptized: "ተጠምቄአለሁ",
      baptismDate: "የጥምቀት ቀን",
      maritalStatus: "የጋብቻ ሁኔታ",
      single: "ያላገባ",
      married: "ያገባ",
      divorced: "የተፋታ",
      widowed: "የትዳር አጋሩ የሞተበት",
      spouseName: "የትዳር አጋር ስም",
      children: "ልጆች",
      addChild: "ልጅ ጨምር",
      childName: "የልጅ ስም",
      age: "እድሜ",
      remove: "አስወግድ",
      ministryInterests: "የአገልግሎት ፍላጎቶች እና የአደጋ ጊዜ ተጠሪ",
      selectMinistries: "የአገልግሎት ፍላጎቶች (የሚመለከትዎትን ሁሉ ይምረጡ)",
      volunteerInterests: "የበጎ ፈቃድ ፍላጎቶች (የሚመለከትዎትን ሁሉ ይምረጡ)",
      skills: "ልዩ ችሎታዎች ወይም ተሰጥኦዎች",
      skillsPlaceholder:
        "እባክዎን ማካፈል የሚፈልጓቸውን ልዩ ችሎታዎች፣ ተሰጥኦዎች ወይም ሙያዊ ብቃቶች ይግለጹ...",
      emergencyContact: "የአደጋ ጊዜ ተጠሪ መረጃ",
      emergencyName: "የአደጋ ጊዜ ተጠሪ ስም",
      emergencyPhone: "የአደጋ ጊዜ ተጠሪ ስልክ",
      emergencyRelation: "ከአደጋ ጊዜ ተጠሪ ጋር ያለዎት ግንኙነት",
      emergencyRelationPlaceholder: "ለምሳሌ፣ ባል/ሚስት፣ ወላጅ፣ ወንድም/እህት፣ ጓደኛ",
      finalDetails: "የመጨረሻ ዝርዝሮች እና ግምገማ",
      preferredLanguage: "የመረጡት ቋንቋ",
      english: "እንግሊዝኛ",
      amharic: "አማርኛ",
      contactMethod: "የመረጡት የመገናኛ ዘዴ",
      emailUpdates: "ስለ ቤተክርስቲያን ዝግጅቶች እና ዜናዎች በኢሜይል መረጃዎችን መቀበል እፈልጋለሁ",
      smsUpdates: "ለአስቸኳይ ማስታወቂያዎች በኤስኤምኤስ መረጃዎችን መቀበል እፈልጋለሁ",
      howDidYouHear: "ስለ ቤተክርስቲያናችን እንዴት ሰሙ?",
      additionalNotes: "ተጨማሪ ማስታወሻዎች ወይም አስተያየቶች",
      notesPlaceholder: "እባክዎን እኛ እንድናውቅ የሚፈልጉትን ማንኛውንም ነገር ያካፍሉ...",
      agreeToTerms:
        "የቤተክርስቲያኑን ውሎች እና ሁኔታዎች እስማማለሁ፣ እና አባልነት አመታዊ ክፍያ እንደሚጠይቅ ተረድቻለሁ። በቤተክርስቲያን እንቅስቃሴዎች ለመሳተፍ እና የቤተክርስቲያን ማህበረሰብን ለመደገፍ እቃጠራለሁ።",
      agreeToPhotos:
        "በቤተክርስቲያን ዝግጅቶች እና እንቅስቃሴዎች ወቅት ፎቶዬ እንዲነሳ እና በቤተክርስቲያን ህትመቶች፣ ድህረ ገጽ እና ማህበራዊ ሚዲያ ላይ እንዲውል ፈቃዴን እሰጣለሁ።",
      membershipFee: "የአባልነት ክፍያ",
      annualFee: "አመታዊ የአባልነት ክፍያ: ",
      paymentRedirect:
        "ይህንን ቅጽ ካስገቡ በኋላ፣ የአባልነት ምዝገባዎን ለማጠናቀቅ ወደ ደህንነቱ የተጠበቀ የክፍያ ገጽ ይዞረዛሉ።",
      previous: "ቀዳሚ",
      next: "ቀጣይ",
      processing: "በሂደት ላይ...",
      completeRegistration: "ምዝገባን አጠናቅቅ እና $100 ክፈል",
      personal_step: "የግል",
      address_step: "አድራሻ",
      membership_step: "አባልነት",
      ministry_step: "አገልግሎት",
      review_step: "ግምገማ",
    },
  };

  // Get translations based on current language
  const getTranslation = (key: string): string => {
    if (
      language === "am" &&
      translations.am[key as keyof typeof translations.am]
    ) {
      return translations.am[key as keyof typeof translations.am];
    }
    return translations.en[key as keyof typeof translations.en];
  };

  return (
    <Layout>
      <div className="container mx-auto p-4 max-w-4xl">
        <Card className="bg-white shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl text-church-burgundy">
              {t("membership_registration_title")}
            </CardTitle>
            <CardDescription className="text-lg">
              {t("membership_registration_description")}
            </CardDescription>
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
    </Layout>
  );
};

export default MembershipRegistration;
