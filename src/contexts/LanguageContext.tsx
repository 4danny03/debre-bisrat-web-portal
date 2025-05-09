
import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'am';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

// Create the language context
const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translations object for all strings in both languages
const translations: Record<string, Record<Language, string>> = {
  // Navigation
  "home": { en: "Home", am: "መነሻ" },
  "about": { en: "About Us", am: "ስለ እኛ" },
  "events": { en: "Events", am: "ዝግጅቶች" },
  "services": { en: "Services", am: "አገልግሎቶች" },
  "gallery": { en: "Gallery", am: "ፎቶዎች" },
  "donation": { en: "Donation", am: "ልገሳ" },
  "signup": { en: "Signup", am: "ይመዝገቡ" },
  "contact": { en: "Contact Us", am: "ያግኙን" },
  
  // Home page
  "welcome": { 
    en: "Welcome to the Debre Bisrat Dagimawi Kulibi St. Gabriel Ethiopian Orthodox Tewahedo Church, Silver Spring, Maryland", 
    am: "እንኳን ወደ ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ድረ ገጽ በሰላም መጡ።" 
  },
  "bible_verse": {
    en: "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, will be poured into your lap. For with the measure you use, it will be measured to you.",
    am: "ስጡ፤ ለእናንተም ይሰጣችኋል። መልካም መጠን የተደቆሰና የተነቀነቀ የተትረፈረፈም ይሰጣችኋል፤ በምትሰፍሩበት መስፈሪያ ለእናንተ ይሰፈርላችኋልና።"
  },
  "bible_reference": { en: "Luke 6:38, NIV", am: "ሉቃስ 6:38" },
  
  // Signup page
  "signup_title": { en: "Join Our Community", am: "ከእኛ ጋር ይቀላቀሉ" },
  "signup_description": { 
    en: "Join our community to receive updates about church events, services, and announcements.", 
    am: "ስለ ቤተክርስቲያን ዝግጅቶች፣ አገልግሎቶችና ማስታወቂያዎች ለመቀበል ከህብረተሰባችን ጋር ይቀላቀሉ።" 
  },
  "full_name": { en: "Full Name", am: "ሙሉ ስም" },
  "email": { en: "Email Address", am: "የኢሜል አድራሻ" },
  "phone": { en: "Phone Number", am: "ስልክ ቁጥር" },
  "preferred_language": { en: "Preferred Language", am: "የተመረጠ ቋንቋ" },
  "english": { en: "English", am: "እንግሊዝኛ" },
  "amharic": { en: "Amharic", am: "አማርኛ" },
  "submit": { en: "Submit", am: "አስገባ" },
  "signup_success": { en: "Thank you for signing up!", am: "ስለ ምዝገባዎ እናመሰግናለን!" },
  
  // Donation page
  "donation_title": { en: "Support Our Church", am: "ቤተክርስቲያናችንን ይደግፉ" },
  "donation_description": { 
    en: "Your generous contributions help us maintain our church, support community programs, and continue our mission.", 
    am: "የእርስዎ ገንዘብ ቤተክርስቲያናችንን ለመጠበቅ፣ የማህበረሰብ ፕሮግራሞችን ለመደገፍ እና ተልዕኮአችንን ለመቀጠል ይረዳናል።" 
  },
  "donation_amount": { en: "Donation Amount", am: "የልገሳ መጠን" },
  "donation_type": { en: "Donation Type", am: "የልገሳ አይነት" },
  "one_time": { en: "One-time", am: "አንድ ጊዜ" },
  "monthly": { en: "Monthly", am: "ወርሃዊ" },
  "quarterly": { en: "Quarterly", am: "በየሶስት ወሩ" },
  "annually": { en: "Annually", am: "አመታዊ" },
  "donate_now": { en: "Donate Now", am: "አሁን ይለግሱ" },
  "donation_purpose": { en: "Purpose of Donation", am: "የልገሳ ዓላማ" },
  "general_fund": { en: "General Fund", am: "አጠቃላይ" },
  "building_fund": { en: "Building Fund", am: "የህንፃ" },
  "youth_programs": { en: "Youth Programs", am: "የወጣቶች ፕሮግራም" },
  "charity": { en: "Charity", am: "ለጋስነት" },
  
  // Services page
  "services_title": { en: "Church Services", am: "የቤተክርስቲያን አገልግሎቶች" },
  "services_description": { 
    en: "Learn about the various religious services offered at our church throughout the year.", 
    am: "በዓመቱ ውስጥ ቤተክርስቲያናችን ስለሚሰጣቸው የተለያዩ ሃይማኖታዊ አገልግሎቶች ይወቁ።" 
  },
  "regular_services": { en: "Regular Services", am: "መደበኛ አገልግሎቶች" },
  "special_services": { en: "Special Services & Holidays", am: "ልዩ አገልግሎቶች እና በዓላት" },
  "children_services": { en: "Children's Services", am: "የልጆች አገልግሎቶች" },
  
  // Gallery page
  "gallery_title": { en: "Photo Gallery", am: "ፎቶ ማዕከል" },
  "gallery_description": { 
    en: "Explore photos from our church events, celebrations, and community gatherings.", 
    am: "ከቤተክርስቲያን ዝግጅቶቻችን፣ ከበዓላት እና ከማህበረሰብ ስብሰባዎች ፎቶዎችን ይመልከቱ።" 
  },
  "church_building": { en: "Church Building", am: "የቤተክርስቲያን ህንፃ" },
  "congregation": { en: "Congregation", am: "ምዕመናን" },
  "celebrations": { en: "Celebrations", am: "በዓላት" },
  "community_events": { en: "Community Events", am: "የማህበረሰብ ዝግጅቶች" },
  
  // Contact page
  "contact_title": { en: "Contact Us", am: "ያግኙን" },
  "contact_description": { 
    en: "Have questions? Reach out to us through any of the methods below or use the contact form.", 
    am: "ጥያቄዎች አሉዎት? ከታች ባሉት ማንኛውም መንገዶች ወይም የመገናኛ ቅጹን በመጠቀም ያግኙን።" 
  },
  "address": { en: "Address", am: "አድራሻ" },
  "message": { en: "Message", am: "መልዕክት" },
  "send_message": { en: "Send Message", am: "መልዕክት ላክ" },
  "language_switch": { en: "አማርኛ", am: "English" },
  
  // Footer
  "copyright": { 
    en: "© 2025 Debre Bisrat Dagimawi Kulibi St. Gabriel Ethiopian Orthodox Tewahedo Church. All rights reserved.", 
    am: "© 2025 ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን። መብቱ በህግ የተጠበቀ ነው።" 
  }
};

export const LanguageProvider: React.FC<{children: ReactNode}> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

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
};

// Custom hook for using the language context
export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
