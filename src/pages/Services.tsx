
import React from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Clock,
  Heart,
  Users,
  Book,
  Mic,
  Phone,
  Mail,
  MapPin,
  ChevronRight,
} from "lucide-react";

const Services: React.FC = () => {
  const { t, language } = useLanguage();

  const services = [
    {
      id: "divine-liturgy",
      titleKey: "service_divine_liturgy",
      descriptionKey: "service_divine_liturgy_desc",
      icon: Book,
      schedule: [
        {
          day: language === "en" ? "Sunday" : "እሁድ",
          time: "8:00 AM - 11:00 AM",
          type: language === "en" ? "Main Service" : "ዋና አገልግሎት",
        },
        {
          day: language === "en" ? "Wednesday" : "ረቡዕ",
          time: "6:00 PM - 8:00 PM",
          type: language === "en" ? "Evening Prayer" : "የምሽት ጸሎት",
        },
      ],
    },
    {
      id: "bible-study",
      titleKey: "service_bible_study",
      descriptionKey: "service_bible_study_desc",
      icon: Book,
      schedule: [
        {
          day: language === "en" ? "Saturday" : "ቅዳሜ",
          time: "10:00 AM - 12:00 PM",
          type: language === "en" ? "Adult Study" : "የአዋቂዎች ጥናት",
        },
        {
          day: language === "en" ? "Saturday" : "ቅዳሜ",
          time: "2:00 PM - 4:00 PM",
          type: language === "en" ? "Youth Study" : "የወጣቶች ጥናት",
        },
      ],
    },
    {
      id: "prayer-meetings",
      titleKey: "service_prayer_meetings",
      descriptionKey: "service_prayer_meetings_desc",
      icon: Heart,
      schedule: [
        {
          day: language === "en" ? "Friday" : "አርብ",
          time: "7:00 PM - 9:00 PM",
          type: language === "en" ? "Community Prayer" : "የማህበረሰብ ጸሎት",
        },
      ],
    },
    {
      id: "special-ceremonies",
      titleKey: "service_special_ceremonies",
      descriptionKey: "service_special_ceremonies_desc",
      icon: Users,
      schedule: [
        {
          day: language === "en" ? "By Appointment" : "በቀጠሮ",
          time: "",
          type: language === "en" ? "Baptism, Wedding, etc." : "ጥምቀት፣ ሰርግ፣ ወዘተ",
        },
      ],
    },
  ];

  const specialEvents = [
    {
      name: language === "en" ? "Timket (Epiphany)" : "ጥምቀት",
      date: language === "en" ? "January 19" : "ጥር 11",
      description:
        language === "en"
          ? "Celebration of the Baptism of Jesus Christ"
          : "የኢየሱስ ክርስቶስ ጥምቀት በዓል",
    },
    {
      name: language === "en" ? "Meskel (Finding of the True Cross)" : "መስቀል",
      date: language === "en" ? "September 27" : "መስከረም 17",
      description:
        language === "en"
          ? "Commemoration of the finding of the True Cross"
          : "የእውነተኛው መስቀል ዕለተ ርክበት",
    },
    {
      name: language === "en" ? "Fasika (Easter)" : "ፋሲካ",
      date: language === "en" ? "Varies each year" : "በየዓመቱ የተለየ",
      description:
        language === "en"
          ? "Celebration of the Resurrection of Jesus Christ"
          : "የኢየሱስ ክርስቶስ ትንሣኤ በዓል",
    },
  ];

  return (
    <Layout>
      <div className="py-12 px-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <Calendar className="inline-block h-12 w-12 text-church-burgundy mb-3" />
            <h1 className="text-4xl font-serif text-church-burgundy mb-4">
              {t("services_title")}
            </h1>
            <p className="max-w-2xl mx-auto text-lg">
              {t("services_description")}
            </p>
          </div>

          {/* Regular Services */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
            {services.map((service) => {
              const IconComponent = service.icon;
              return (
                <Card key={service.id} className="h-full">
                  <CardHeader>
                    <div className="flex items-center mb-3">
                      <IconComponent className="h-8 w-8 text-church-burgundy mr-3" />
                      <CardTitle className="text-xl font-serif text-church-burgundy">
                        {t(service.titleKey)}
                      </CardTitle>
                    </div>
                    <p className="text-gray-600">{t(service.descriptionKey)}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {service.schedule.map((item, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                        >
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 text-church-burgundy mr-2" />
                            <div>
                              <p className="font-medium text-sm">{item.day}</p>
                              <p className="text-xs text-gray-600">{item.type}</p>
                            </div>
                          </div>
                          {item.time && (
                            <span className="text-sm font-medium text-church-burgundy">
                              {item.time}
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-4 text-church-burgundy border-church-burgundy hover:bg-church-burgundy hover:text-white"
                    >
                      {language === "en" ? "Learn More" : "የበለጠ ለመረዳት"}
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Special Events */}
          <div className="mb-16">
            <h2 className="text-3xl font-serif text-church-burgundy text-center mb-8">
              {language === "en" ? "Special Religious Events" : "ልዩ ሃይማኖታዊ ዝግጅቶች"}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {specialEvents.map((event, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6">
                    <div className="bg-church-burgundy text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Calendar className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-serif text-church-burgundy mb-2">
                      {event.name}
                    </h3>
                    <p className="font-medium text-church-gold mb-2">
                      {event.date}
                    </p>
                    <p className="text-gray-600 text-sm">{event.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl font-serif text-church-burgundy text-center">
                {language === "en" ? "Contact for Services" : "ለአገልግሎቶች ያግኙን"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div className="flex flex-col items-center">
                  <Phone className="h-8 w-8 text-church-burgundy mb-2" />
                  <h3 className="font-medium mb-1">
                    {language === "en" ? "Phone" : "ስልክ"}
                  </h3>
                  <p className="text-gray-600">(555) 123-4567</p>
                </div>
                <div className="flex flex-col items-center">
                  <Mail className="h-8 w-8 text-church-burgundy mb-2" />
                  <h3 className="font-medium mb-1">
                    {language === "en" ? "Email" : "ኢሜይል"}
                  </h3>
                  <p className="text-gray-600">info@stgabrielchurch.org</p>
                </div>
                <div className="flex flex-col items-center">
                  <MapPin className="h-8 w-8 text-church-burgundy mb-2" />
                  <h3 className="font-medium mb-1">
                    {language === "en" ? "Address" : "አድራሻ"}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    123 Church Street
                    <br />
                    City, State 12345
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Services;
