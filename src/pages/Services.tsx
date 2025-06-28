import React from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Settings } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { api } from "@/integrations/supabase/api";

// Base URL for image paths
const baseUrl = import.meta.env.BASE_URL;
const religiousServiceImages: Record<string, string> = {
  // Add mappings for each service title to its corresponding image path
  "Holy Water Baptism": baseUrl + "images/services/holy-water-baptism.jpg",
  "Marriage Ceremony": baseUrl + "images/services/marriage-ceremony.jpg",
  "Funeral Prayer": baseUrl + "images/services/funeral-prayer.jpg",
  "Marriage and Communion Education":
    baseUrl + "images/services/marriage-communion-education.jpg",
  "Counseling Services": baseUrl + "images/services/counseling-services.jpg",
  Qendil: baseUrl + "images/services/qendil.jpg",
  "Qeder Baptism": baseUrl + "images/services/qeder-baptism.jpg",
  "Christian Initiation": baseUrl + "images/services/christian-initiation.jpg",
  "Entering Lent": baseUrl + "images/services/entering-lent.jpg",
  "Divine Liturgy (Kidase)": baseUrl + "images/services/divine-liturgy.jpg",
};

const getServiceImage = (title: string): string => {
  return (religiousServiceImages as Record<string, string>)[title] || baseUrl + "images/gallery/church-service.jpg";
};

const Services: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();

  // Service data
  const regularServices = [
    {
      title: language === "en" ? "Holy Water Baptism" : "ጸበል መጠመቅ",
      description:
        language === "en"
          ? "Blessing and immersion in holy water for spiritual cleansing and healing."
          : "ለመንፈሳዊ ንጽህና እና ፈውስ በቅዱስ ውሃ ውስጥ መባረክ እና መጠመቅ።",
      time: language === "en" ? "Sundays after Divine Liturgy" : "እሁድ ከቅዳሴ በኋላ",
      requiresAppointment: false,
    },
    {
      title: language === "en" ? "Marriage Ceremony" : "ጋብቻ መፈፀም",
      description:
        language === "en"
          ? "Traditional Orthodox Christian church marriage ceremony following church customs and traditions."
          : "የቤተክርስቲያን ልማዶችን እና ወጎችን የሚከተል ባህላዊ የኦርቶዶክስ ክርስቲያን የጋብቻ ሥርዓት።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
      requiresAppointment: true,
    },
    {
      title: language === "en" ? "Funeral Prayer" : "ጸሎተ ፍትሐት",
      description:
        language === "en"
          ? "Prayer service for the departed, offering comfort to families and commending the soul to God's mercy."
          : "ለሟቾች የሚደረግ የጸሎት አገልግሎት፣ ለቤተሰቦች መጽናናትን የሚሰጥ እና ነፍስን ለእግዚአብሔር ምሕረት የሚያስረክብ።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
      requiresAppointment: true,
    },
    {
      title:
        language === "en"
          ? "Marriage and Communion Education"
          : "የጋብቻና የቁርባን ትምህርት",
      description:
        language === "en"
          ? "Educational sessions for couples preparing for marriage and individuals preparing to receive Holy Communion."
          : "ለጋብቻ ለሚዘጋጁ ጥንዶች እና ቅዱስ ቁርባን ለመቀበል ለሚዘጋጁ ግለሰቦች የሚሰጡ የትምህርት ክፍለ ጊዜያት።",
      time:
        language === "en"
          ? "Saturdays, 2:00 PM - 4:00 PM"
          : "ቅዳሜ፣ 2:00 ከሰዓት - 4:00 ከሰዓት",
      requiresAppointment: false,
    },
    {
      title: language === "en" ? "Counseling Services" : "የምክር አገልግሎት",
      description:
        language === "en"
          ? "Counseling services for health issues, addiction, marriage problems, and other personal challenges."
          : "በጤና፣ በሱስ፣ በትዳር እና በሌሎች ችግሮች የምክር አገልግሎት።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
      requiresAppointment: true,
    },
  ];

  const specialServices = [
    {
      title: language === "en" ? "Qendil Prayer" : "ጸሎተ ቀንዲል",
      description:
        language === "en"
          ? "Special prayer service with the blessing of oil for healing and spiritual protection."
          : "ለፈውስ እና ለመንፈሳዊ ጥበቃ ከዘይት ቡራኬ ጋር የሚደረግ ልዩ የጸሎት አገልግሎት።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
      requiresAppointment: true,
    },
    {
      title: language === "en" ? "Qeder Baptism" : "የቄደር ጥምቀት",
      description:
        language === "en"
          ? "Special baptismal service following traditional Ethiopian Orthodox customs."
          : "ባህላዊ የኢትዮጵያ ኦርቶዶክስ ወጎችን የሚከተል ልዩ የጥምቀት አገልግሎት።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
      requiresAppointment: true,
    },
    {
      title: language === "en" ? "Christian Initiation" : "ክርስትና ማስነሳት",
      description:
        language === "en"
          ? "The sacrament of Christian initiation, introducing new members to the faith and church community."
          : "አዲስ አማኞችን ወደ እምነት እና የቤተክርስቲያን ማህበረሰብ የሚያስተዋውቅ የክርስትና ሥርዓት።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
      requiresAppointment: true,
    },
    {
      title: language === "en" ? "Entering Lent" : "ሱባኤ መግባት",
      description:
        language === "en"
          ? "Special service marking the beginning of fasting periods, with prayers for spiritual strength and guidance."
          : "ለመንፈሳዊ ጥንካሬ እና መመሪያ ከጸሎቶች ጋር የጾም ወቅቶችን መጀመሪያ የሚያመለክት ልዩ አገልግሎት።",
      time:
        language === "en"
          ? "Beginning of major fasting periods"
          : "የዋና ዋና የጾም ወቅቶች መጀመሪያ",
      requiresAppointment: false,
    },
    {
      title: language === "en" ? "Divine Liturgy (Kidase)" : "ቅዳሴ",
      description:
        language === "en"
          ? "The Divine Liturgy is the main worship service, during which Holy Communion is celebrated. It follows the ancient liturgy of St. Basil, St. Gregory, and St. Cyril."
          : "ቅዳሴ የቤተክርስቲያን ዋና የአምልኮ አገልግሎት ሲሆን በዚህ ጊዜ ቅዱስ ቁርባን ይከናወናል። የቅዱስ ባስልዮስ፣ የቅዱስ ግሪጎሪዮስ እና የቅዱስ ኪሪሎስ ጥንታዊ ሥርዓተ ቅዳሴን ይከተላል።",
      time:
        language === "en"
          ? "Sundays, 7:00 AM - 12:00 PM"
          : "እሁድ፣ 7:00 ጠዋት - 12:00 ከሰዓት",
      requiresAppointment: false,
    },
  ];

  // Collect all services that require appointments
  const appointmentServices = [
    ...regularServices,
    ...specialServices,
  ].filter((s) => s.requiresAppointment);

  // Single appointment request handler
  const handleAppointmentSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const notes = formData.get("notes") as string;
    try {
      await api.appointments.createAppointment({
        name,
        email,
        phone,
        service_title: appointmentServices[0]?.title || "",
        requested_date: date,
        requested_time: time,
        notes,
        status: "pending",
      });
      toast({
        title: language === "en" ? "Appointment Request Sent" : "የቀጠሮ ጥያቄ ተልኳል",
        description:
          language === "en"
            ? `We've received your request for ${appointmentServices[0]?.title}. We'll contact you soon to confirm.`
            : `ለ${appointmentServices[0]?.title} የቀጠሮ ጥያቄዎን ተቀብለናል። በቅርቡ ለማረጋገጥ እናገኝዎታለን።`,
      });
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      console.error("Error submitting appointment:", error);
      toast({
        title: language === "en" ? "Error" : "ስህተት",
        description:
          language === "en"
            ? "Failed to submit appointment request. Please try again."
            : "የቀጠሮ ጥያቄ ማስገባት አልተሳካም። እባክዎ እንደገና ይሞክሩ።",
        variant: "destructive",
      });
    }
  };

  return (
    <Layout>
      <div className="py-12 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Settings className="inline-block h-10 w-10 text-church-burgundy mb-3" />
            <h1 className="text-4xl font-serif text-church-burgundy mb-4">
              {t("services_title") || "Church Services"}
            </h1>
            <p className="max-w-2xl mx-auto text-lg">
              {t("services_description") ||
                "Join us for worship and spiritual growth through our regular and special services. Our church follows the ancient traditions of the Ethiopian Orthodox Tewahedo Church."}
            </p>
          </div>

          {/* Single Appointment Request Section */}
          <Card className="mb-10">
            <CardHeader>
              <CardTitle>{language === "en" ? "Request an Appointment" : "ቀጠሮ ይጠይቁ"}</CardTitle>
              <CardDescription>
                {language === "en"
                  ? "Select a service and fill out the form to request an appointment."
                  : "አገልግሎት ይምረጡ እና ቅጹን ይሙሉ ለቀጠሮ ለመጠየቅ።"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="serviceType">{language === "en" ? "Service Type" : "የአገልግሎት አይነት"}</Label>
                  <select
                    id="serviceType"
                    name="serviceType"
                    className="w-full border rounded px-3 py-2 mt-1"
                    required
                  >
                    {appointmentServices.map((service, idx) => (
                      <option key={service.title + idx} value={service.title}>
                        {service.title}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">{language === "en" ? "Name" : "ስም"}</Label>
                    <Input id="name" name="name" required />
                  </div>
                  <div>
                    <Label htmlFor="email">{language === "en" ? "Email" : "ኢሜይል"}</Label>
                    <Input id="email" name="email" type="email" required />
                  </div>
                  <div>
                    <Label htmlFor="phone">{language === "en" ? "Phone" : "ስልክ"}</Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                  <div>
                    <Label htmlFor="date">{language === "en" ? "Date" : "ቀን"}</Label>
                    <Input id="date" name="date" type="date" min={format(new Date(), "yyyy-MM-dd")}/>
                  </div>
                  <div>
                    <Label htmlFor="time">{language === "en" ? "Time" : "ሰዓት"}</Label>
                    <Input id="time" name="time" type="time" required />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">{language === "en" ? "Notes" : "ማስታወሻዎች"}</Label>
                  <Textarea id="notes" name="notes" placeholder={language === "en" ? "Any additional information..." : "ማንኛውም ተጨማሪ መረጃ..."} />
                </div>
                <Button type="submit" className="bg-church-burgundy hover:bg-church-burgundy/90">
                  {language === "en" ? "Submit Request" : "ጥያቄ አስገባ"}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Service lists (no appointment buttons) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            <Card>
              <CardHeader className="bg-church-burgundy text-white">
                <CardTitle className="text-church-gold">
                  {t("regular_services")}
                </CardTitle>
                <CardDescription className="text-white/80">
                  {language === "en"
                    ? "Our weekly and monthly recurring services"
                    : "የእኛ ሳምንታዊ እና ወርሃዊ ተከታታይ አገልግሎቶች"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {regularServices.map((service, index) => (
                  <div key={`regular-${index}`} className="border-l-2 border-church-gold pl-4 mb-6">
                    <div className="mb-3 rounded-md overflow-hidden w-32 h-32 float-right ml-4">
                      <img
                        src={getServiceImage(service.title)}
                        alt={service.title}
                        className="object-cover w-full h-full transition-transform hover:scale-105 duration-300 rounded-md"
                      />
                    </div>
                    <h3 className="text-xl font-serif text-church-burgundy">{service.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{service.time}</p>
                    <p className="text-gray-700">{service.description}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="bg-church-burgundy text-white">
                <CardTitle className="text-church-gold">
                  {t("special_services")}
                </CardTitle>
                <CardDescription className="text-white/80">
                  {language === "en"
                    ? "Major feasts and celebrations throughout the year"
                    : "ዋና ዋና በዓላት እና በአመቱ ውስጥ የሚከበሩ ክብረ በዓላት"}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                {specialServices.map((service, index) => (
                  <div key={`special-${index}`} className="border-l-2 border-church-gold pl-4 mb-6">
                    <div className="mb-3 rounded-md overflow-hidden w-32 h-32 float-right ml-4">
                      <img
                        src={getServiceImage(service.title)}
                        alt={service.title}
                        className="object-cover w-full h-full transition-transform hover:scale-105 duration-300 rounded-md"
                      />
                    </div>
                    <h3 className="text-xl font-serif text-church-burgundy">{service.title}</h3>
                    <p className="text-sm text-gray-500 mb-2">{service.time}</p>
                    <p className="text-gray-700">{service.description}</p>
                  </div>
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
                    {language === "en" ? "Sunday School" : "የሰንበት ትምህርት ቤት"}
                  </AccordionTrigger>
                  <AccordionContent>
                    {language === "en"
                      ? "Sunday School classes for children ages 5-12 are held every Sunday from 9:00 AM to 12:00 PM. Children learn about the Orthodox faith, Bible stories, church traditions, Ethiopian Orthodox hymns, and Amharic language."
                      : "ከ5-12 ዓመት ለሆኑ ልጆች የሰንበት ትምህርት ቤት ትምህርቶች በየሰንበት ከ9፡00 ጠዋት እስከ 12፡00 ሰዓት ይካሄዳሉ። ልጆች ስለ ኦርቶዶክስ እምነት፣ የመጽሐፍ ቅዱስ ታሪኮች፣ የቤተክርስቲያን ወግ፣ የኢትዮጵያ ኦርቶዶክስ መዝሙሮች እና አማርኛ ቋንቋ ይማራሉ።"}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="youth-program">
                  <AccordionTrigger>
                    {language === "en" ? "Youth Program" : "የወጣቶች ፕሮግራም"}
                  </AccordionTrigger>
                  <AccordionContent>
                    {language === "en"
                      ? "Our youth program for teenagers (13-18) provides spiritual guidance, church service training, community service opportunities, and cultural activities every Saturday from 3:00 PM to 6:00 PM. Youth also participate in choir and traditional Ethiopian Orthodox church music training."
                      : "ለወጣቶች (13-18) የሚሰጠው የወጣቶች ፕሮግራማችን መንፈሳዊ መመሪያ፣ የቤተክርስቲያን አገልግሎት ስልጠና፣ የማህበረሰብ አገልግሎት እድሎች እና በየሳምንቱ ቅዳሜ ከ3፡00 ምሽት እስከ 6፡00 ምሽት የባህል ስራዎችን ይሰጣል። ወጣቶች በዘማሪ ቡድን እና በባህላዊ የኢትዮጵያ ኦርቶዶክስ ቤተክርስቲያን ሙዚቃ ስልጠናም ይሳተፋሉ።"}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="amharic-classes">
                  <AccordionTrigger>
                    {language === "en"
                      ? "Amharic Language Classes"
                      : "የአማርኛ ቋንቋ ትምህርት"}
                  </AccordionTrigger>
                  <AccordionContent>
                    {language === "en"
                      ? "We offer Amharic language classes for children of all ages on Saturdays from 10:00 AM to 12:00 PM. These classes help children connect with their Ethiopian heritage through language learning, including reading and writing in Fidel (Ethiopian script)."
                      : "ለሁሉም ዕድሜ ልጆች በየሳምንቱ ቅዳሜ ከ10፡00 ጠዋት እስከ 12፡00 ሰዓት የአማርኛ ቋንቋ ትምህርት እንሰጣለን። እነዚህ ክፍሎች ልጆች ከኢትዮጵያዊ ሀረጋቸው ጋር በቋንቋ ትምህርት በኩል እንዲገናኙ ይረዳቸዋል፣ በፊደል ንባብና ጽሑፍን ጨምሮ።"}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="mezmur-classes">
                  <AccordionTrigger>
                    {language === "en"
                      ? "Traditional Church Music"
                      : "የቤተክርስቲያን መዝሙር ትምህርት"}
                  </AccordionTrigger>
                  <AccordionContent>
                    {language === "en"
                      ? "Traditional Ethiopian Orthodox church music (Mezmur) classes are offered for both children and adults on Saturdays from 1:00 PM to 3:00 PM. Learn traditional hymns, chants, and the use of traditional instruments like the Begena, Kebero, and Sistrum."
                      : "ባህላዊ የኢትዮጵያ ኦርቶዶክስ የቤተክርስቲያን ሙዚቃ (መዝሙር) ትምህርቶች ለልጆችም ሆነ ለአዋቂዎች በየሳምንቱ ቅዳሜ ከ1፡00 ከሰዓት እስከ 3፡00 ከሰዓት ይሰጣሉ። ባህላዊ መዝሙሮችን፣ ዝማሬዎችን እና እንደ በገና፣ ከበሮ እና ሲስትሩም ያሉ ባህላዊ መሣሪያዎችን አጠቃቀም ይማሩ።"}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="adult-education">
                  <AccordionTrigger>
                    {language === "en"
                      ? "Adult Religious Education"
                      : "የአዋቂዎች ሃይማኖታዊ ትምህርት"}
                  </AccordionTrigger>
                  <AccordionContent>
                    {language === "en"
                      ? "Adult religious education classes are held on Sundays after the Divine Liturgy from 1:00 PM to 2:30 PM. These classes cover Orthodox theology, church history, patristic teachings, and spiritual practices for daily life."
                      : "የአዋቂዎች ሃይማኖታዊ ትምህርት ክፍሎች በየሰንበቱ ከቅዳሴ በኋላ ከ1፡00 ከሰዓት እስከ 2፡30 ከሰዓት ይካሄዳሉ። እነዚህ ክፍሎች የኦርቶዶክስ ሥነ መለኮት፣ የቤተክርስቲያን ታሪክ፣ የአባቶች ትምህርቶች እና ለዕለት ተዕለት ሕይወት መንፈሳዊ ልምምዶችን ያካትታሉ።"}
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
