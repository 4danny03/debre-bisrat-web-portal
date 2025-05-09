
import React from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Settings } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface ServiceItemProps {
  title: string;
  description: string;
  time: string;
}

const ServiceItem: React.FC<ServiceItemProps> = ({ title, description, time }) => {
  return (
    <div className="border-l-2 border-church-gold pl-4 mb-6">
      <h3 className="text-xl font-serif text-church-burgundy">{title}</h3>
      <p className="text-sm text-gray-500 mb-2">{time}</p>
      <p className="text-gray-700">{description}</p>
    </div>
  );
};

const Services: React.FC = () => {
  const { t, language } = useLanguage();
  
  // Service data - in a real application, this could come from a database
  const regularServices = [
    {
      title: language === 'en' ? "Divine Liturgy (Kidase)" : "ቅዳሴ",
      description: language === 'en' 
        ? "The Divine Liturgy is the main worship service, during which Holy Communion is celebrated."
        : "ቅዳሴ የቤተክርስቲያን ዋና የአምልኮ አገልግሎት ሲሆን በዚህ ጊዜ ቅዱስ ቁርባን ይከናወናል።",
      time: language === 'en' ? "Sundays, 8:00 AM - 12:30 PM" : "እሁድ፣ 8:00 ጠዋት - 12:30 ከሰዓት",
    },
    {
      title: language === 'en' ? "Evening Prayer" : "ምሽት ጸሎት",
      description: language === 'en'
        ? "Evening prayers and spiritual teachings from the church fathers."
        : "የምሽት ጸሎቶች እና መንፈሳዊ ትምህርቶች ከአብያተ ክርስቲያናት አባቶች።",
      time: language === 'en' ? "Wednesdays, 6:00 PM - 8:00 PM" : "ረቡዕ፣ 6:00 ምሽት - 8:00 ምሽት",
    },
    {
      title: language === 'en' ? "Monthly St. Gabriel Commemoration" : "ወርሃዊ የቅዱስ ገብርኤል ትዝታ",
      description: language === 'en'
        ? "Special service commemorating St. Gabriel, the patron saint of our church."
        : "ልዩ አገልግሎት ቅዱስ ገብርኤልን (የቤተክርስቲያናችን ጠባቂ ቅዱስ) ለማስታወስ።",
      time: language === 'en' ? "19th day of each month, 7:00 AM - 10:00 AM" : "በየወሩ 19ኛ ቀን፣ 7:00 ጠዋት - 10:00 ጠዋት",
    }
  ];
  
  const specialServices = [
    {
      title: language === 'en' ? "Ethiopian Christmas (Genna)" : "ገና",
      description: language === 'en'
        ? "Celebration of the birth of Jesus Christ according to the Ethiopian calendar."
        : "በኢትዮጵያ ዘመን አቆጣጠር መሰረት የኢየሱስ ክርስቶስ ልደት በዓል።",
      time: language === 'en' ? "January 7th" : "ጥር 29",
    },
    {
      title: language === 'en' ? "Ethiopian Epiphany (Timkat)" : "ጥምቀት",
      description: language === 'en'
        ? "Commemoration of the baptism of Jesus Christ in the Jordan River."
        : "በዮርዳኖስ ወንዝ የኢየሱስ ክርስቶስ ጥምቀት መታሰቢያ።",
      time: language === 'en' ? "January 19th" : "ጥር 11",
    },
    {
      title: language === 'en' ? "Easter (Fasika)" : "ፋሲካ",
      description: language === 'en'
        ? "Celebration of the resurrection of Jesus Christ following the 55-day fast of Lent."
        : "የኢየሱስ ክርስቶስ ትንሣኤ በዓል ከ55 ቀን የጾም ሰሞን በኋላ።",
      time: language === 'en' ? "According to the Orthodox calendar" : "በኦርቶዶክስ የበዓላት ቀን መሰረት",
    },
  ];

  return (
    <Layout>
      <div className="py-12 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Settings className="inline-block h-12 w-12 text-church-burgundy mb-3" />
            <h1 className="text-4xl font-serif text-church-burgundy mb-4">{t("services_title")}</h1>
            <p className="max-w-2xl mx-auto text-lg">{t("services_description")}</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader className="bg-church-burgundy text-white">
                <CardTitle className="text-church-gold">{t("regular_services")}</CardTitle>
                <CardDescription className="text-white/80">
                  {language === 'en' 
                    ? "Our weekly and monthly recurring services"
                    : "የእኛ ሳምንታዊ እና ወርሃዊ ተከታታይ አገልግሎቶች"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {regularServices.map((service, index) => (
                  <ServiceItem 
                    key={`regular-${index}`}
                    title={service.title}
                    description={service.description}
                    time={service.time}
                  />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="bg-church-burgundy text-white">
                <CardTitle className="text-church-gold">{t("special_services")}</CardTitle>
                <CardDescription className="text-white/80">
                  {language === 'en'
                    ? "Major feasts and celebrations throughout the year"
                    : "ዋና ዋና በዓላት እና በአመቱ ውስጥ የሚከበሩ ክብረ በዓላት"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {specialServices.map((service, index) => (
                  <ServiceItem 
                    key={`special-${index}`}
                    title={service.title}
                    description={service.description}
                    time={service.time}
                  />
                ))}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>{t("children_services")}</CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="sunday-school">
                  <AccordionTrigger>
                    {language === 'en' ? "Sunday School" : "የሰንበት ትምህርት ቤት"}
                  </AccordionTrigger>
                  <AccordionContent>
                    {language === 'en'
                      ? "Sunday School classes for children ages 5-12 are held every Sunday from 10:00 AM to 12:00 PM. Children learn about the Orthodox faith, Bible stories, church traditions, and Amharic language."
                      : "ከ5-12 ዓመት ለሆኑ ልጆች የሰንበት ትምህርት ቤት ትምህርቶች በየሰንበት ከ10፡00 ጠዋት እስከ 12፡00 ሰዓት ይካሄዳሉ። ልጆች ስለ ኦርቶዶክስ እምነት፣ የመጽሐፍ ቅዱስ ታሪኮች፣ የቤተክርስቲያን ወግ እና አማርኛ ቋንቋ ይማራሉ።"}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="youth-program">
                  <AccordionTrigger>
                    {language === 'en' ? "Youth Program" : "የወጣቶች ፕሮግራም"}
                  </AccordionTrigger>
                  <AccordionContent>
                    {language === 'en'
                      ? "Our youth program for teenagers (13-18) provides spiritual guidance, community service opportunities, and cultural activities every Saturday from 4:00 PM to 6:00 PM."
                      : "ለወጣቶች (13-18) የሚሰጠው የወጣቶች ፕሮግራማችን መንፈሳዊ መመሪያ፣ የማህበረሰብ አገልግሎት እድሎች እና በየሳምንቱ ቅዳሜ ከ4፡00 ምሽት እስከ 6፡00 ምሽት የባህል ስራዎችን ይሰጣል።"}
                  </AccordionContent>
                </AccordionItem>
                
                <AccordionItem value="amharic-classes">
                  <AccordionTrigger>
                    {language === 'en' ? "Amharic Language Classes" : "የአማርኛ ቋንቋ ትምህርት"}
                  </AccordionTrigger>
                  <AccordionContent>
                    {language === 'en'
                      ? "We offer Amharic language classes for children of all ages on Saturdays from 10:00 AM to 12:00 PM. These classes help children connect with their Ethiopian heritage through language learning."
                      : "ለሁሉም ዕድሜ ልጆች በየሳምንቱ ቅዳሜ ከ10፡00 ጠዋት እስከ 12፡00 ሰዓት የአማርኛ ቋንቋ ትምህርት እንሰጣለን። እነዚህ ክፍሎች ልጆች ከኢትዮጵያዊ ሀረጋቸው ጋር በቋንቋ ትምህርት በኩል እንዲገናኙ ይረዳቸዋል።"}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Services;
