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

interface ServiceItemProps {
  title: string;
  description: string;
  time: string;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  title,
  description,
  time,
}) => {
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

  // Service data based on the provided church services
  const regularServices = [
    {
      title: language === "en" ? "Christian Initiation" : "ክርስትና ማስነሳት",
      description:
        language === "en"
          ? "The sacrament of Christian initiation, introducing new members to the faith and church community."
          : "አዲስ አማኞችን ወደ እምነት እና የቤተክርስቲያን ማህበረሰብ የሚያስተዋውቅ የክርስትና ሥርዓት።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
    },
    {
      title: language === "en" ? "Qendil Prayer" : "ጸሎተ ቀንዲል",
      description:
        language === "en"
          ? "Special prayer service with the blessing of oil for healing and spiritual protection."
          : "ለፈውስ እና ለመንፈሳዊ ጥበቃ ከዘይት ቡራኬ ጋር የሚደረግ ልዩ የጸሎት አገልግሎት።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
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
    },
    {
      title: language === "en" ? "Counseling Services" : "የምክር አገልግሎት",
      description:
        language === "en"
          ? "Counseling services for health issues, addiction, marriage problems, and other personal challenges."
          : "በጤና፣ በሱስ፣ በትዳር እና በሌሎች ችግሮች የምክር አገልግሎት።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
    },
    {
      title: language === "en" ? "Marriage Ceremony" : "ጋብቻ መፈፀም",
      description:
        language === "en"
          ? "Traditional Orthodox Christian marriage ceremony following church customs and traditions."
          : "የቤተክርስቲያን ልማዶችን እና ወጎችን የሚከተል ባህላዊ የኦርቶዶክስ ክርስቲያን የጋብቻ ሥርዓት።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
    },
    {
      title: language === "en" ? "Funeral Prayer" : "ጸሎተ ፍትሐት",
      description:
        language === "en"
          ? "Prayer service for the departed, offering comfort to families and commending the soul to God's mercy."
          : "ለሟቾች የሚደረግ የጸሎት አገልግሎት፣ ለቤተሰቦች መጽናናትን የሚሰጥ እና ነፍስን ለእግዚአብሔር ምሕረት የሚያስረክብ።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
    },
    {
      title: language === "en" ? "Holy Water Baptism" : "ጸበል መጠመቅ",
      description:
        language === "en"
          ? "Blessing and immersion in holy water for spiritual cleansing and healing."
          : "ለመንፈሳዊ ንጽህና እና ፈውስ በቅዱስ ውሃ ውስጥ መባረክ እና መጠመቅ።",
      time: language === "en" ? "Sundays after Divine Liturgy" : "እሁድ ከቅዳሴ በኋላ",
    },
  ];

  const specialServices = [
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
    },
    {
      title: language === "en" ? "Qeder Baptism" : "የቄደር ጥምቀት",
      description:
        language === "en"
          ? "Special baptismal service following traditional Ethiopian Orthodox customs."
          : "ባህላዊ የኢትዮጵያ ኦርቶዶክስ ወጎችን የሚከተል ልዩ የጥምቀት አገልግሎት።",
      time: language === "en" ? "By appointment" : "በቀጠሮ",
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
    },
  ];

  return (
    <Layout>
      <div className="py-12 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Settings className="inline-block h-12 w-12 text-church-burgundy mb-3" />
            <h1 className="text-4xl font-serif text-church-burgundy mb-4">
              {t("services_title") || "Church Services"}
            </h1>
            <p className="max-w-2xl mx-auto text-lg">
              {t("services_description") ||
                "Join us for worship and spiritual growth through our regular and special services. Our church follows the ancient traditions of the Ethiopian Orthodox Tewahedo Church."}
            </p>
          </div>

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
