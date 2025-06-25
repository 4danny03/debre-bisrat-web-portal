import { createContext, useContext, useState, ReactNode } from "react";

type Language = "en" | "am";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the language context
const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined,
);

// Translations object for all strings in both languages
const translations: Record<string, Record<Language, string>> = {
  // Navigation
  home: { en: "Home", am: "መነሻ" },
  about: { en: "About Us", am: "ስለ እኛ" },
  events: { en: "Events", am: "ዝግጅቶች" },
  services: { en: "Services", am: "አገልግሎቶች" },
  gallery: { en: "Gallery", am: "ፎቶዎች" },
  donation: { en: "Donation", am: "ልገሳ" },
  membership: { en: "Membership", am: "አባልነት" },
  contact: { en: "Contact Us", am: "ያግኙን" },

  // Home page
  welcome: {
    en: "Welcome to the Debre Bisrat Dagimawi Kulibi St.Gabriel EOTC, Silver Spring, Maryland",
    am: "እንኳን ወደ ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ድረ ገጽ በሰላም መጡ።",
  },
  bible_verse: {
    en: "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap. For with the measure you use, it will be measured to you.",
    am: "ስጡ፤ ለእናንተም ይሰጣችኋል። መልካም መጠን የተደቆሰና የተነቀነቀ የተትረፈረፈም ይሰጣችኋል፤ በምትሰፍሩበት መስፈሪያ ለእናንተ ይሰፈርላችኋልና።",
  },
  bible_reference: { en: "Luke 6:38, NIV", am: "ሉቃስ 6:38" },

  // Common form fields
  full_name: { en: "Full Name", am: "ሙሉ ስም" },
  email: { en: "Email Address", am: "የኢሜል አድራሻ" },
  phone: { en: "Phone Number", am: "ስልክ ቁጥር" },
  address: { en: "Address", am: "አድራሻ" },
  preferred_language: { en: "Preferred Language", am: "የተመረጠ ቋንቋ" },
  english: { en: "English", am: "እንግሊዝኛ" },
  amharic: { en: "Amharic", am: "አማርኛ" },
  submit: { en: "Submit", am: "አስገባ" },
  processing: { en: "Processing...", am: "በመስራት ላይ..." },

  // Donation page
  donation_title: { en: "Support Our Church", am: "ቤተክርስቲያናችንን ይደግፉ" },
  donation_subtitle: {
    en: "Make a Difference in Our Community",
    am: "በማህበረሰባችን ውስጥ ለውጥ ያድርጉ",
  },
  donation_description: {
    en: "Your generous contributions help us maintain our church, support community programs, and continue our mission.",
    am: "የእርስዎ ገንዘብ ቤተክርስቲያናችንን ለመጠበቅ፣ የማህበረሰብ ፕሮግራሞችን ለመደገፍ እና ተልዕኮአችንን ለመቀጠል ይረዳናል።",
  },
  donation_amount: { en: "Donation Amount", am: "የልገሳ መጠን" },
  donation_type: { en: "Donation Type", am: "የልገሳ አይነት" },
  one_time: { en: "One-time", am: "አንድ ጊዜ" },
  monthly: { en: "Monthly", am: "ወርሃዊ" },
  quarterly: { en: "Quarterly", am: "በየሶስት ወሩ" },
  annually: { en: "Annually", am: "አመታዊ" },
  donate_now: { en: "Donate Now", am: "አሁን ይለግሱ" },
  donation_purpose: { en: "Purpose of Donation", am: "የልገሳ ዓላማ" },
  general_fund: { en: "General Fund", am: "አጠቃላይ" },
  building_fund: { en: "Building Fund", am: "የህንፃ" },
  youth_programs: { en: "Youth Programs", am: "የወጣቶች ፕሮግራም" },
  charity: { en: "Charity", am: "ለጋስነት" },
  suggested_amounts: { en: "Suggested Amounts", am: "የሚመከሩ መጠኖች" },
  custom_amount: { en: "Custom Amount", am: "የተለየ መጠን" },
  contact_preference: { en: "Contact Preference", am: "የመገናኛ ምርጫ" },
  email_contact: { en: "Email", am: "ኢሜል" },
  phone_contact: { en: "Phone", am: "ስልክ" },
  anonymous_donation: {
    en: "Make this donation anonymous",
    am: "ይህንን ልገሳ ስም ሳይገለጽ ማድረግ",
  },
  anonymous_note: {
    en: "Your contact information will not be shared publicly",
    am: "የእርስዎ የመገናኛ መረጃ በይፋ አይጋራም",
  },
  tax_deductible: { en: "Tax Deductible", am: "ከግብር የሚቀነስ" },
  tax_deductible_note: {
    en: "This donation is tax-deductible. You will receive a receipt for your records.",
    am: "ይህ ልገሳ ከግብር የሚቀነስ ነው። ለመዝገብዎ ደረሰኝ ይደርስዎታል።",
  },
  secure_payment: { en: "Secure Payment", am: "ደህንነቱ የተጠበቀ ክፍያ" },
  secure_payment_note: {
    en: "Your payment information is encrypted and secure",
    am: "የእርስዎ የክፍያ መረጃ የተመሰጠረ እና ደህንነቱ የተጠበቀ ነው",
  },
  donation_impact: { en: "Your Impact", am: "የእርስዎ ተጽዕኖ" },
  general_fund_impact: {
    en: "Supports daily operations, utilities, and maintenance of our church facilities",
    am: "የቤተክርስቲያናችንን የዕለት ተዕለት ሥራዎች፣ መገልገያዎች እና ጥገና ይደግፋል",
  },
  building_fund_impact: {
    en: "Helps with construction, renovation, and expansion of church buildings",
    am: "የቤተክርስቲያን ህንፃዎች ግንባታ፣ ማሻሻያ እና ማስፋፊያ ይረዳል",
  },
  youth_programs_impact: {
    en: "Funds Sunday school, youth activities, and educational programs",
    am: "የሰንበት ትምህርት ቤት፣ የወጣቶች እንቅስቃሴዎች እና የትምህርት ፕሮግራሞችን ይደግፋል",
  },
  charity_impact: {
    en: "Supports community outreach, food programs, and assistance to those in need",
    am: "የማህበረሰብ ድጋፍ፣ የምግብ ፕሮግራሞች እና ለተቸገሩ ሰዎች እርዳታ ይሰጣል",
  },
  donor_recognition: { en: "Donor Recognition", am: "የለጋሽ እውቅና" },
  include_in_bulletin: {
    en: "Include my name in the church bulletin (unless anonymous)",
    am: "ስሜን በቤተክርስቲያን መግለጫ ውስጥ ያካትቱ (ስም ሳይገለጽ ካልሆነ በስተቀር)",
  },
  memorial_dedication: {
    en: "Memorial or Dedication (Optional)",
    am: "መታሰቢያ ወይም መሰጠት (አማራጭ)",
  },
  memorial_placeholder: {
    en: "In memory of... or In honor of...",
    am: "በ... ትዝታ ወይም በ... ክብር",
  },
  proceed_to_payment: {
    en: "Proceed to Secure Payment",
    am: "ወደ ደህንነቱ የተጠበቀ ክፍያ ይሂዱ",
  },

  // Services page
  services_title: { en: "Church Services", am: "የቤተክርስቲያን አገልግሎቶች" },
  services_description: {
    en: "Learn about the various religious services offered at our church throughout the year.",
    am: "በዓመቱ ውስጥ ቤተክርስቲያናችን ስለሚሰጣቸው የተለያዩ ሃይማኖታዊ አገልግሎቶች ይወቁ።",
  },
  regular_services: { en: "Regular Services", am: "መደበኛ አገልግሎቶች" },
  special_services: {
    en: "Special Services & Holidays",
    am: "ልዩ አገልግሎቶች እና በዓላት",
  },
  children_services: { en: "Children's Services", am: "የልጆች አገልግሎቶች" },

  // Gallery page
  gallery_title: { en: "Photo Gallery", am: "ፎቶ ማዕከል" },
  gallery_description: {
    en: "Explore photos from our church events, celebrations, and community gatherings.",
    am: "ከቤተክርስቲያን ዝግጅቶቻችን፣ ከበዓላት እና ከማህበረሰብ ስብሰባዎች ፎቶዎችን ይመልከቱ።",
  },
  church_building: { en: "Church Building", am: "የቤተክርስቲያን ህንፃ" },
  congregation: { en: "Congregation", am: "ምዕመናን" },
  celebrations: { en: "Celebrations", am: "በዓላት" },
  community_events: { en: "Community Events", am: "የማህበረሰብ ዝግጅቶች" },

  // Contact page
  contact_title: { en: "Contact Us", am: "ያግኙን" },
  contact_description: {
    en: "Have questions? Reach out to us through any of the methods below or use the contact form.",
    am: "ጥያቄዎች አሉዎት? ከታች ባሉት ማንኛውም መንገዶች ወይም የመገናኛ ቅጹን በመጠቀም ያግኙን።",
  },
  message: { en: "Message", am: "መልዕክት" },
  send_message: { en: "Send Message", am: "መልዕክት ላክ" },
  language_switch: { en: "አማርኛ", am: "English" },

  // Footer
  copyright: {
    en: "© 2025 Debre Bisrat Dagimawi Kulibi St.Gabriel EOTC. All rights reserved.",
    am: "© 2025 ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን። መብቱ በህግ የተጠበቀ ነው።",
  },

  // Membership Registration
  membership_registration_title: {
    en: "Membership Registration",
    am: "የአባልነት ምዝገባ",
  },
  membership_registration_description: {
    en: "Join our church community by registering as a member. Annual membership fee is $100.",
    am: "በአባልነት በመመዝገብ የቤተክርስቲያን ማህበረሰባችንን ይቀላቀሉ። የዓመት አባልነት ክፍያ $100 ነው።",
  },
  membership_type: {
    en: "Membership Type",
    am: "የአባልነት ዓይነት",
  },
  select_membership_type: {
    en: "Select Membership Type",
    am: "የአባልነት ዓይነት ይምረጡ",
  },
  individual_membership: {
    en: "Individual Membership",
    am: "የግል አባልነት",
  },
  family_membership: {
    en: "Family Membership",
    am: "የቤተሰብ አባልነት",
  },
  membership_fee_notice: {
    en: "Annual Membership Fee: $100",
    am: "የዓመት አባልነት ክፍያ፡ $100",
  },
  membership_fee_description: {
    en: "This fee helps support our church's activities and maintenance.",
    am: "ይህ ክፍያ የቤተክርስቲያናችንን እንቅስቃሴዎች እና ጥገና ይደግፋል።",
  },
  register_and_pay: {
    en: "Register & Pay $100",
    am: "ይመዝገቡ እና $100 ይክፈሉ",
  },

  // Membership Registration Form Fields
  first_name: { en: "First Name", am: "መጠሪያ ስም" },
  middle_name: { en: "Middle Name", am: "የአባት ስም" },
  last_name: { en: "Last Name", am: "የአያት ስም" },
  baptismal_name: { en: "Baptismal Name", am: "የጥምቀት ስም" },
  date_of_birth: { en: "Date of Birth", am: "የትውልድ ቀን" },
  gender: { en: "Gender", am: "ፆታ" },
  male: { en: "Male", am: "ወንድ" },
  female: { en: "Female", am: "ሴት" },
  street_address: { en: "Street Address", am: "የመንገድ አድራሻ" },
  apt_suite_bldg: {
    en: "Apt, Suite, Bldg. (optional)",
    am: "አፓርትመንት፣ ሱት፣ ህንፃ (አማራጭ)",
  },
  city: { en: "City", am: "ከተማ" },
  state_province_region: { en: "State/Province/Region", am: "ግዛት/ክልል/ወረዳ" },
  postal_zip_code: { en: "Postal/Zip Code", am: "ፖስታ/ዚፕ ኮድ" },
  country: { en: "Country", am: "ሀገር" },
  united_states: { en: "United States", am: "አሜሪካ" },
  canada: { en: "Canada", am: "ካናዳ" },
  ethiopia: { en: "Ethiopia", am: "ኢትዮጵያ" },
  other: { en: "Other", am: "ሌላ" },
  regular_member: {
    en: "Regular Member ($100/year)",
    am: "መደበኛ አባል ($100/አመት)",
  },
  student_member: { en: "Student Member ($50/year)", am: "የተማሪ አባል ($50/አመት)" },
  senior_member: { en: "Senior Member ($75/year)", am: "የአዛውንት አባል ($75/አመት)" },
  family_member: {
    en: "Family Member ($200/year)",
    am: "የቤተሰብ አባል ($200/አመት)",
  },
  previous_member_orthodox: {
    en: "I was previously a member of another Orthodox church",
    am: "ከዚህ በፊት የሌላ ኦርቶዶክስ ቤተክርስቲያን አባል ነበርኩ",
  },
  previous_church_name: { en: "Previous Church Name", am: "የቀድሞ ቤተክርስቲያን ስም" },
  baptized: { en: "I have been baptized", am: "ተጠምቄአለሁ" },
  baptism_date: { en: "Baptism Date", am: "የጥምቀት ቀን" },
  marital_status: { en: "Marital Status", am: "የጋብቻ ሁኔታ" },
  single: { en: "Single", am: "ያላገባ" },
  married: { en: "Married", am: "ያገባ" },
  divorced: { en: "Divorced", am: "የተፋታ" },
  widowed: { en: "Widowed", am: "የትዳር አጋሩ የሞተበት" },
  spouse_information: { en: "Spouse Information", am: "የትዳር አጋር መረጃ" },
  spouse: { en: "Spouse", am: "የትዳር አጋር" },
  spouse_baptismal_name: {
    en: "Spouse Baptismal Name",
    am: "የትዳር አጋር የጥምቀት ስም",
  },
  spouse_phone: { en: "Spouse Phone", am: "የትዳር አጋር ስልክ" },
  spouse_email: { en: "Spouse Email", am: "የትዳር አጋር ኢሜል" },
  children_information: { en: "Children Information", am: "የልጆች መረጃ" },
  child_1: { en: "Child 1", am: "ልጅ 1" },
  child_2: { en: "Child 2", am: "ልጅ 2" },
  ministry_interests: {
    en: "Ministry Interests (Select all that apply)",
    am: "የአገልግሎት ፍላጎቶች (የሚመለከትዎትን ሁሉ ይምረጡ)",
  },
  volunteer_interests: {
    en: "Volunteer Interests (Select all that apply)",
    am: "የበጎ ፈቃድ ፍላጎቶች (የሚመለከትዎትን ሁሉ ይምረጡ)",
  },
  special_skills: {
    en: "Special Skills or Talents",
    am: "ልዩ ችሎታዎች ወይም ተሰጥኦዎች",
  },
  skills_placeholder: {
    en: "Please describe any special skills, talents, or professional expertise you'd like to share...",
    am: "እባክዎን ማካፈል የሚፈልጓቸውን ልዩ ችሎታዎች፣ ተሰጥኦዎች ወይም ሙያዊ ብቃቶች ይግለጹ...",
  },
  emergency_contact_info: {
    en: "Emergency Contact Information",
    am: "የአደጋ ጊዜ ተጠሪ መረጃ",
  },
  emergency_contact_name: {
    en: "Emergency Contact Name",
    am: "የአደጋ ጊዜ ተጠሪ ስም",
  },
  emergency_contact_phone: {
    en: "Emergency Contact Phone",
    am: "የአደጋ ጊዜ ተጠሪ ስልክ",
  },
  emergency_contact_relation: {
    en: "Relationship to Emergency Contact",
    am: "ከአደጋ ጊዜ ተጠሪ ጋር ያለዎት ግንኙነት",
  },
  emergency_relation_placeholder: {
    en: "e.g., Spouse, Parent, Sibling, Friend",
    am: "ለምሳሌ፣ ባል/ሚስት፣ ወላጅ፣ ወንድም/እህት፣ ጓደኛ",
  },
  final_details_review: {
    en: "Final Details & Review",
    am: "የመጨረሻ ዝርዝሮች እና ግምገማ",
  },
  email_updates_consent: {
    en: "I would like to receive email updates about church events and news",
    am: "ስለ ቤተክርስቲያን ዝግጅቶች እና ዜናዎች በኢሜይል መረጃዎችን መቀበል እፈልጋለሁ",
  },
  sms_updates_consent: {
    en: "I would like to receive SMS updates for urgent announcements",
    am: "ለአስቸኳይ ማስታወቂያዎች በኤስኤምኤስ መረጃዎችን መቀበል እፈልጋለሁ",
  },
  how_did_you_hear: {
    en: "How did you hear about our church?",
    am: "ስለ ቤተክርስቲያናችን እንዴት ሰሙ?",
  },
  please_select: { en: "Please select...", am: "እባክዎን ይምረጡ..." },
  friend_family: { en: "Friend or Family Member", am: "ጓደኛ ወይም የቤተሰብ አባል" },
  church_website: { en: "Church Website", am: "የቤተክርስቲያን ድህረ ገጽ" },
  social_media: { en: "Social Media", am: "ማህበራዊ ሚዲያ" },
  community_event: { en: "Community Event", am: "የማህበረሰብ ዝግጅት" },
  drove_by: { en: "Drove by the Church", am: "ቤተክርስቲያኑን አልፌ ሳይ" },
  additional_notes: {
    en: "Additional Notes or Comments",
    am: "ተጨማሪ ማስታወሻዎች ወይም አስተያየቶች",
  },
  notes_placeholder: {
    en: "Please share anything else you'd like us to know...",
    am: "እባክዎን እኛ እንድናውቅ የሚፈልጉትን ማንኛውንም ነገር ያካፍሉ...",
  },
  agree_terms: {
    en: "I agree to the church's terms and conditions, and I understand that membership requires an annual fee. I commit to participating in church activities and supporting the church community.",
    am: "የቤተክርስቲያኑን ውሎች እና ሁኔታዎች እስማማለሁ፣ እና አባልነት አመታዊ ክፍያ እንደሚጠይቅ ተረድቻለሁ። በቤተክርስቲያን እንቅስቃሴዎች ለመሳተፍ እና የቤተክርስቲያን ማህበረሰብን ለመደገፍ እቃጠራለሁ።",
  },
  photo_consent: {
    en: "I consent to having my photo taken during church events and activities for use in church publications, website, and social media.",
    am: "በቤተክርስቲያን ዝግጅቶች እና እንቅስቃሴዎች ወቅት ፎቶዬ እንዲነሳ እና በቤተክርስቲያን ህትመቶች፣ ድህረ ገጽ እና ማህበራዊ ሚዲያ ላይ እንዲውል ፈቃዴን እሰጣለሁ።",
  },
  membership_fee: { en: "Membership Fee", am: "የአባልነት ክፍያ" },
  annual_membership_fee: {
    en: "Annual membership fee:",
    am: "አመታዊ የአባልነት ክፍያ:",
  },
  payment_redirect_notice: {
    en: "After submitting this form, you will be redirected to a secure payment page to complete your membership registration.",
    am: "ይህንን ቅጽ ካስገቡ በኋላ፣ የአባልነት ምዝገባዎን ለማጠናቀቅ ወደ ደህንነቱ የተጠበቀ የክፍያ ገጽ ይዞረዛሉ።",
  },
  previous: { en: "Previous", am: "ቀዳሚ" },
  next: { en: "Next", am: "ቀጣይ" },
  complete_registration: {
    en: "Complete Registration & Pay",
    am: "ምዝገባን አጠናቅቅ እና ክፈል",
  },
  personal_information: { en: "Personal Information", am: "የግል መረጃ" },
  address_information: { en: "Address Information", am: "የአድራሻ መረጃ" },
  membership_family_info: {
    en: "Membership & Family Information",
    am: "የአባልነት እና የቤተሰብ መረጃ",
  },
  ministry_emergency_contact: {
    en: "Ministry Interests & Emergency Contact",
    am: "የአገልግሎት ፍላጎቶች እና የአደጋ ጊዜ ተጠሪ",
  },
  step_personal: { en: "Personal", am: "የግል" },
  step_address: { en: "Address", am: "አድራሻ" },
  step_membership: { en: "Membership", am: "አባልነት" },
  step_ministry: { en: "Ministry", am: "አገልግሎት" },
  step_review: { en: "Review", am: "ግምገማ" },
  date: { en: "Date", am: "ቀን" },
  required: { en: "*", am: "*" },
};

// Language Provider component
function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>("en");

  // Translation function
  const t = (key: string): string => {
    if (!translations[key]) {
      console.warn(`Translation key not found: ${key}`);
      return key;
    }
    return translations[key][language];
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// Custom hook for using the language context
function useLanguage(): LanguageContextType {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}

export { LanguageProvider, useLanguage };
