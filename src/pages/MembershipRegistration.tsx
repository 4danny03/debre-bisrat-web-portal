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
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;

  // Membership Information
  membershipType: string;
  previousMember: boolean;
  previousChurch: string;
  baptized: boolean;
  baptismDate: string;

  // Family Information
  maritalStatus: string;
  spouseName: string;
  children: Array<{ name: string; age: string }>;

  // Contact Preferences
  preferredLanguage: string;
  contactMethod: string;
  emailUpdates: boolean;
  smsUpdates: boolean;

  // Ministry Interests
  ministryInterests: string[];
  volunteerInterests: string[];
  skills: string;

  // Emergency Contact
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;

  // Additional Information
  howDidYouHear: string;
  additionalNotes: string;
  agreeToTerms: boolean;
  agreeToPhotos: boolean;
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
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
    membershipType: "regular",
    previousMember: false,
    previousChurch: "",
    baptized: false,
    baptismDate: "",
    maritalStatus: "single",
    spouseName: "",
    children: [],
    preferredLanguage: "english",
    contactMethod: "email",
    emailUpdates: true,
    smsUpdates: false,
    ministryInterests: [],
    volunteerInterests: [],
    skills: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
    howDidYouHear: "",
    additionalNotes: "",
    agreeToTerms: false,
    agreeToPhotos: false,
  });

  const totalSteps = 5;
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
        if (!formData.address.trim()) errors.address = "Address is required";
        if (!formData.city.trim()) errors.city = "City is required";
        if (!formData.state.trim()) errors.state = "State is required";
        if (!formData.zipCode.trim()) errors.zipCode = "ZIP code is required";
        break;
      case 3:
        if (!formData.membershipType)
          errors.membershipType = "Membership type is required";
        if (formData.previousMember && !formData.previousChurch.trim()) {
          errors.previousChurch = "Previous church name is required";
        }
        if (formData.baptized && !formData.baptismDate) {
          errors.baptismDate = "Baptism date is required";
        }
        break;
      case 4:
        if (!formData.emergencyName.trim())
          errors.emergencyName = "Emergency contact name is required";
        if (!formData.emergencyPhone.trim())
          errors.emergencyPhone = "Emergency contact phone is required";
        if (!formData.emergencyRelation.trim())
          errors.emergencyRelation = "Emergency contact relation is required";
        break;
      case 5:
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
    setFormData((prev) => ({ ...prev, children }));
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
            address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
            membership_type: formData.membershipType,
            membership_status: "pending",
            join_date: new Date().toISOString(),
            date_of_birth: formData.dateOfBirth,
            gender: formData.gender,
            marital_status: formData.maritalStatus,
            spouse_name: formData.spouseName || null,
            emergency_contact_name: formData.emergencyName,
            emergency_contact_phone: formData.emergencyPhone,
            emergency_contact_relation: formData.emergencyRelation,
            preferred_language: formData.preferredLanguage,
            ministry_interests: formData.ministryInterests,
            volunteer_interests: formData.volunteerInterests,
            skills: formData.skills || null,
            how_did_you_hear: formData.howDidYouHear || null,
            additional_notes: formData.additionalNotes || null,
            baptized: formData.baptized,
            baptism_date: formData.baptismDate || null,
            previous_member: formData.previousMember,
            previous_church: formData.previousChurch || null,
            children: formData.children.filter((child) => child.name.trim()),
            email_updates: formData.emailUpdates,
            sms_updates: formData.smsUpdates,
            photo_consent: formData.agreeToPhotos,
          },
        ])
        .select()
        .single();

      if (memberError) {
        throw memberError;
      }

      // Create Stripe checkout session using the existing edge function
      const response = await supabase.functions.invoke(
        "supabase-functions-create-checkout",
        {
          body: {
            amount: "100",
            donationType: "one_time",
            purpose: "membership_fee",
            email: formData.email,
            name: `${formData.firstName} ${formData.lastName}`,
            address: `${formData.address}, ${formData.city}, ${formData.state} ${formData.zipCode}`,
            memberId: memberData.id,
          },
        },
      );

      if (response.error) {
        throw new Error("Payment initiation failed");
      }

      // Redirect to Stripe checkout
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
              <h3 className="text-lg font-semibold">
                {getTranslation("personal")}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">
                  {getTranslation("firstName")} *
                </Label>
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
                <Label htmlFor="lastName">{getTranslation("lastName")} *</Label>
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">{getTranslation("email")} *</Label>
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
                <Label htmlFor="phone">{getTranslation("phone")} *</Label>
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
                <Label htmlFor="dateOfBirth">
                  {getTranslation("dateOfBirth")} *
                </Label>
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
                <Label>{getTranslation("gender")} *</Label>
                <RadioGroup
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="male" id="male" />
                    <Label htmlFor="male">{getTranslation("male")}</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="female" id="female" />
                    <Label htmlFor="female">{getTranslation("female")}</Label>
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
              <h3 className="text-lg font-semibold">
                {getTranslation("address")}
              </h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Street Address *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={formErrors.address ? "border-red-500" : ""}
              />
              {formErrors.address && (
                <p className="text-red-500 text-sm">{formErrors.address}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <Label htmlFor="state">State *</Label>
                <Input
                  id="state"
                  value={formData.state}
                  onChange={(e) => handleInputChange("state", e.target.value)}
                  className={formErrors.state ? "border-red-500" : ""}
                />
                {formErrors.state && (
                  <p className="text-red-500 text-sm">{formErrors.state}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="zipCode">ZIP Code *</Label>
                <Input
                  id="zipCode"
                  value={formData.zipCode}
                  onChange={(e) => handleInputChange("zipCode", e.target.value)}
                  className={formErrors.zipCode ? "border-red-500" : ""}
                />
                {formErrors.zipCode && (
                  <p className="text-red-500 text-sm">{formErrors.zipCode}</p>
                )}
              </div>
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
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <FileText className="h-5 w-5 text-church-burgundy" />
              <h3 className="text-lg font-semibold">
                Membership & Family Information
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

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="previousMember"
                  checked={formData.previousMember}
                  onCheckedChange={(checked) =>
                    handleInputChange("previousMember", checked)
                  }
                />
                <Label htmlFor="previousMember">
                  I was previously a member of another Orthodox church
                </Label>
              </div>

              {formData.previousMember && (
                <div className="space-y-2">
                  <Label htmlFor="previousChurch">Previous Church Name *</Label>
                  <Input
                    id="previousChurch"
                    value={formData.previousChurch}
                    onChange={(e) =>
                      handleInputChange("previousChurch", e.target.value)
                    }
                    className={
                      formErrors.previousChurch ? "border-red-500" : ""
                    }
                  />
                  {formErrors.previousChurch && (
                    <p className="text-red-500 text-sm">
                      {formErrors.previousChurch}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="baptized"
                  checked={formData.baptized}
                  onCheckedChange={(checked) =>
                    handleInputChange("baptized", checked)
                  }
                />
                <Label htmlFor="baptized">I have been baptized</Label>
              </div>

              {formData.baptized && (
                <div className="space-y-2">
                  <Label htmlFor="baptismDate">Baptism Date *</Label>
                  <Input
                    id="baptismDate"
                    type="date"
                    value={formData.baptismDate}
                    onChange={(e) =>
                      handleInputChange("baptismDate", e.target.value)
                    }
                    className={formErrors.baptismDate ? "border-red-500" : ""}
                  />
                  {formErrors.baptismDate && (
                    <p className="text-red-500 text-sm">
                      {formErrors.baptismDate}
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="space-y-4">
              <Label>Marital Status</Label>
              <RadioGroup
                value={formData.maritalStatus}
                onValueChange={(value) =>
                  handleInputChange("maritalStatus", value)
                }
                className="grid grid-cols-2 gap-4"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="single" id="single" />
                  <Label htmlFor="single">Single</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="married" id="married" />
                  <Label htmlFor="married">Married</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="divorced" id="divorced" />
                  <Label htmlFor="divorced">Divorced</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="widowed" id="widowed" />
                  <Label htmlFor="widowed">Widowed</Label>
                </div>
              </RadioGroup>
            </div>

            {formData.maritalStatus === "married" && (
              <div className="space-y-2">
                <Label htmlFor="spouseName">Spouse's Name</Label>
                <Input
                  id="spouseName"
                  value={formData.spouseName}
                  onChange={(e) =>
                    handleInputChange("spouseName", e.target.value)
                  }
                />
              </div>
            )}

            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label>Children</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={addChild}
                >
                  Add Child
                </Button>
              </div>

              {children.map((child, index) => (
                <div key={index} className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Child's name"
                    value={child.name}
                    onChange={(e) => updateChild(index, "name", e.target.value)}
                  />
                  <div className="flex gap-2">
                    <Input
                      placeholder="Age"
                      value={child.age}
                      onChange={(e) =>
                        updateChild(index, "age", e.target.value)
                      }
                    />
                    {children.length > 1 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => removeChild(index)}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <Heart className="h-5 w-5 text-church-burgundy" />
              <h3 className="text-lg font-semibold">
                Ministry Interests & Emergency Contact
              </h3>
            </div>

            <div className="space-y-4">
              <Label>Ministry Interests (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {ministryOptions.map((ministry) => (
                  <div key={ministry} className="flex items-center space-x-2">
                    <Checkbox
                      id={ministry}
                      checked={formData.ministryInterests.includes(ministry)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleArrayChange("ministryInterests", [
                            ...formData.ministryInterests,
                            ministry,
                          ]);
                        } else {
                          handleArrayChange(
                            "ministryInterests",
                            formData.ministryInterests.filter(
                              (m) => m !== ministry,
                            ),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={ministry} className="text-sm">
                      {ministry}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <Label>Volunteer Interests (Select all that apply)</Label>
              <div className="grid grid-cols-2 gap-2">
                {volunteerOptions.map((volunteer) => (
                  <div key={volunteer} className="flex items-center space-x-2">
                    <Checkbox
                      id={volunteer}
                      checked={formData.volunteerInterests.includes(volunteer)}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          handleArrayChange("volunteerInterests", [
                            ...formData.volunteerInterests,
                            volunteer,
                          ]);
                        } else {
                          handleArrayChange(
                            "volunteerInterests",
                            formData.volunteerInterests.filter(
                              (v) => v !== volunteer,
                            ),
                          );
                        }
                      }}
                    />
                    <Label htmlFor={volunteer} className="text-sm">
                      {volunteer}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="skills">Special Skills or Talents</Label>
              <Textarea
                id="skills"
                value={formData.skills}
                onChange={(e) => handleInputChange("skills", e.target.value)}
                placeholder="Please describe any special skills, talents, or professional expertise you'd like to share..."
              />
            </div>

            <Separator />

            <div className="space-y-4">
              <h4 className="font-semibold text-church-burgundy">
                Emergency Contact Information
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="emergencyName">
                    Emergency Contact Name *
                  </Label>
                  <Input
                    id="emergencyName"
                    value={formData.emergencyName}
                    onChange={(e) =>
                      handleInputChange("emergencyName", e.target.value)
                    }
                    className={formErrors.emergencyName ? "border-red-500" : ""}
                  />
                  {formErrors.emergencyName && (
                    <p className="text-red-500 text-sm">
                      {formErrors.emergencyName}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emergencyPhone">
                    Emergency Contact Phone *
                  </Label>
                  <Input
                    id="emergencyPhone"
                    type="tel"
                    value={formData.emergencyPhone}
                    onChange={(e) =>
                      handleInputChange("emergencyPhone", e.target.value)
                    }
                    className={
                      formErrors.emergencyPhone ? "border-red-500" : ""
                    }
                  />
                  {formErrors.emergencyPhone && (
                    <p className="text-red-500 text-sm">
                      {formErrors.emergencyPhone}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="emergencyRelation">
                  Relationship to Emergency Contact *
                </Label>
                <Input
                  id="emergencyRelation"
                  value={formData.emergencyRelation}
                  onChange={(e) =>
                    handleInputChange("emergencyRelation", e.target.value)
                  }
                  className={
                    formErrors.emergencyRelation ? "border-red-500" : ""
                  }
                  placeholder="e.g., Spouse, Parent, Sibling, Friend"
                />
                {formErrors.emergencyRelation && (
                  <p className="text-red-500 text-sm">
                    {formErrors.emergencyRelation}
                  </p>
                )}
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle className="h-5 w-5 text-church-burgundy" />
              <h3 className="text-lg font-semibold">Final Details & Review</h3>
            </div>

            <div className="space-y-4">
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

              <div className="space-y-2">
                <Label>Preferred Contact Method</Label>
                <RadioGroup
                  value={formData.contactMethod}
                  onValueChange={(value) =>
                    handleInputChange("contactMethod", value)
                  }
                  className="flex gap-6"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="email" id="contact-email" />
                    <Label htmlFor="contact-email">Email</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="contact-phone" />
                    <Label htmlFor="contact-phone">Phone</Label>
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
                    I would like to receive email updates about church events
                    and news
                  </Label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="smsUpdates"
                    checked={formData.smsUpdates}
                    onCheckedChange={(checked) =>
                      handleInputChange("smsUpdates", checked)
                    }
                  />
                  <Label htmlFor="smsUpdates">
                    I would like to receive SMS updates for urgent announcements
                  </Label>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="howDidYouHear">
                How did you hear about our church?
              </Label>
              <Select
                value={formData.howDidYouHear}
                onValueChange={(value) =>
                  handleInputChange("howDidYouHear", value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Please select..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="friend">
                    Friend or Family Member
                  </SelectItem>
                  <SelectItem value="website">Church Website</SelectItem>
                  <SelectItem value="social-media">Social Media</SelectItem>
                  <SelectItem value="community-event">
                    Community Event
                  </SelectItem>
                  <SelectItem value="drove-by">Drove by the Church</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="additionalNotes">
                Additional Notes or Comments
              </Label>
              <Textarea
                id="additionalNotes"
                value={formData.additionalNotes}
                onChange={(e) =>
                  handleInputChange("additionalNotes", e.target.value)
                }
                placeholder="Please share anything else you'd like us to know..."
              />
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

              <div className="flex items-start space-x-2">
                <Checkbox
                  id="agreeToPhotos"
                  checked={formData.agreeToPhotos}
                  onCheckedChange={(checked) =>
                    handleInputChange("agreeToPhotos", checked)
                  }
                />
                <Label
                  htmlFor="agreeToPhotos"
                  className="text-sm leading-relaxed"
                >
                  I consent to having my photo taken during church events and
                  activities for use in church publications, website, and social
                  media.
                </Label>
              </div>
            </div>

            <div className="bg-church-cream p-4 rounded-lg">
              <h4 className="font-semibold text-church-burgundy mb-2">
                Membership Fee
              </h4>
              <p className="text-sm text-gray-600 mb-2">
                Annual membership fee:{" "}
                <span className="font-semibold">$100</span>
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
              {t("membership.title") || getTranslation("title")}
            </CardTitle>
            <CardDescription className="text-lg">
              {t("membership.description") || getTranslation("description")}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  {getStepIcon(1)}
                  <span className="text-sm font-medium">
                    {getTranslation("personal_step")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStepIcon(2)}
                  <span className="text-sm font-medium">
                    {getTranslation("address_step")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStepIcon(3)}
                  <span className="text-sm font-medium">
                    {getTranslation("membership_step")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStepIcon(4)}
                  <span className="text-sm font-medium">
                    {getTranslation("ministry_step")}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {getStepIcon(5)}
                  <span className="text-sm font-medium">
                    {getTranslation("review_step")}
                  </span>
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
                {getTranslation("previous")}
              </Button>

              {currentStep < totalSteps ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  className="bg-church-burgundy hover:bg-church-burgundy/90"
                >
                  {getTranslation("next")}
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
                      {getTranslation("processing")}
                    </>
                  ) : (
                    <>
                      <CreditCard className="h-4 w-4 mr-2" />
                      {getTranslation("completeRegistration")}
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
