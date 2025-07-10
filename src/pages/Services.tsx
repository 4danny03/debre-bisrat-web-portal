import React, { useState } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Settings, CalendarCheck } from "lucide-react";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
const baseUrl = import.meta.env.BASE_URL;
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

interface ServiceItemProps {
  title: string;
  description: string;
  time: string;
  imageUrl?: string;
  requiresAppointment?: boolean;
}

const ServiceItem: React.FC<ServiceItemProps> = ({
  title,
  description,
  time,
  imageUrl,
  requiresAppointment = false,
}) => {
  return (
    <div className="border-l-2 border-church-gold pl-4 mb-6">
      {imageUrl && (
        <div className="mb-3 rounded-md overflow-hidden w-32 h-32 float-right ml-4">
          <img
            src={imageUrl}
            alt={title}
            className="object-cover w-full h-full transition-transform hover:scale-105 duration-300 rounded-md"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              // Try multiple fallback images in order
              if (target.src.includes("church-service.jpg")) {
                target.src = "/images/gallery/church-gathering.jpg";
              } else if (target.src.includes("church-gathering.jpg")) {
                target.src = "/images/gallery/ceremony-1.jpg";
              } else {
                target.src = "/images/gallery/church-service.jpg";
              }
            }}
          />
        </div>
      )}
      <h3 className="text-xl font-serif text-church-burgundy">{title}</h3>
      <p className="text-sm text-gray-500 mb-2">{time}</p>
      <p className="text-gray-700">{description}</p>
      {requiresAppointment && (
        <p className="text-xs text-church-burgundy mt-2 font-medium">
          * Appointment required
        </p>
      )}
    </div>
  );
};

// Religious service images mapping with verified paths
const religiousServiceImages = {
  "Christian Initiation": "/images/religious/palm-sunday.jpg",
  "ክርስትና ማስነሳት": "/images/religious/palm-sunday.jpg",
  "Qendil Prayer": "/images/gallery/church-service.jpg",
  "ጸሎተ ቀንዲል": "/images/gallery/church-service.jpg",
  "Marriage and Communion Education": "/images/gallery/ceremony-1.jpg",
  "የጋብቻና የቁርባን ትምህርት": "/images/gallery/ceremony-1.jpg",
  "Counseling Services": "/images/gallery/church-gathering.jpg",
  "የምክር አገልግሎት": "/images/gallery/church-gathering.jpg",
  "Marriage Ceremony": "/images/gallery/ceremony-2.jpg",
  "ጋብቻ መፈፀም": "/images/gallery/ceremony-2.jpg",
  "Funeral Prayer": "/images/religious/crucifixion.jpg",
  "ጸሎተ ፍትሐት": "/images/religious/crucifixion.jpg",
  "Holy Water Baptism": "/images/gallery/timket.jpg",
  "ጸበል መጠመቅ": "/images/gallery/timket.jpg",
  "Entering Lent": "/images/religious/procession.jpg",
  "ሱባኤ መግባት": "/images/religious/procession.jpg",
  "Qeder Baptism": "/images/gallery/timket.jpg",
  "የቄደር ጥምቀት": "/images/gallery/timket.jpg",
  "Divine Liturgy (Kidase)": "/images/gallery/church-service.jpg",
  ቅዳሴ: "/images/gallery/church-service.jpg",
};

const getServiceImage = (title: string): string => {
  return (
    (religiousServiceImages as Record<string, string>)[title] ||
    baseUrl + "images/gallery/church-service.jpg"
  );
};

const Services: React.FC = () => {
  const { t, language } = useLanguage();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();
  const [showModal, setShowModal] = useState(false);

  const handleAppointmentSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const phone = formData.get("phone") as string;
    const date = formData.get("date") as string;
    const time = formData.get("time") as string;
    const service = formData.get("service") as string || formData.get("serviceType") as string;
    const notes = formData.get("notes") as string;

    try {
      // Prepare appointment data for Edge Function (if you have one) or direct insert
      const appointmentPayload = {
        name,
        email,
        phone,
        service_type: service,
        appointment_date: date,
        appointment_time: time,
        notes,
        status: "pending",
      };

      // Direct insert using Supabase client (current method)
      // await api.appointments.createAppointment(appointmentPayload);

      // Use Edge Function if available (recommended for validation, logging, etc.)
      const response = await fetch("/functions/v1/appointment-management", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(appointmentPayload),
      });
      const result = await response.json();
      if (!response.ok || result.error) {
        throw new Error(result.error || "Appointment request failed");
      }

      toast({
        title: language === "en" ? "Appointment Request Sent" : "የቀጠሮ ጥያቄ ተልኳል",
        description:
          language === "en"
            ? `We've received your appointment request. We'll contact you soon to confirm.`
            : `የቀጠሮ ጥያቄዎን ተቀብለናል። በቅርቡ ለማረጋገጥ እናገኝዎታለን።`,
      });

      setIsDialogOpen(false);
      (e.target as HTMLFormElement).reset();
    } catch (error: any) {
      console.error("Error submitting appointment:", error);
      let errorMsg =
        (error && (error.message || error.error_description || error.toString())) ||
        (typeof error === "object" ? JSON.stringify(error) : String(error));
      toast({
        title: language === "en" ? "Error" : "ስህተት",
        description:
          (language === "en"
            ? "Failed to submit appointment request. "
            : "የቀጠሮ ጥያቄ ማስገባት አልተሳካም። ") + errorMsg,
        variant: "destructive",
      });
    }
  };

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
  const appointmentServices = [...regularServices, ...specialServices].filter(
    (s) => s.requiresAppointment,
  );

  return (
    <Layout>
      <div className="py-12 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <Settings className="inline-block h-10 w-10 text-church-burgundy mb-3" />
            <h1 className="text-4xl font-serif text-church-burgundy mb-4">
              {t("services_title") || "Church Services"}
            </h1>
            <p className="max-w-2xl mx-auto text-lg mb-6">
              {t("services_description") ||
                "Join us for worship and spiritual growth through our regular and special services. Our church follows the ancient traditions of the Ethiopian Orthodox Tewahedo Church."}
            </p>

            {/* Single Request Appointment Button */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-church-burgundy hover:bg-church-burgundy/90 text-white px-8 py-3 text-lg">
                  <CalendarCheck className="h-5 w-5 mr-2" />
                  {language === "en" ? "Request Appointment" : "ቀጠሮ ይጠይቁ"}
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>
                    {language === "en"
                      ? "Request Service Appointment"
                      : "የአገልግሎት ቀጠሮ ይጠይቁ"}
                  </DialogTitle>
                  <DialogDescription>
                    {language === "en"
                      ? "Please fill out the form below to request an appointment for any of our services that require scheduling."
                      : "ቀጠሮ የሚያስፈልጋቸው ማንኛውም አገልግሎቶች ለመጠየቅ ከታች ያለውን ቅጽ ይሙሉ።"}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">
                        {language === "en" ? "Full Name" : "ሙሉ ስም"} *
                      </Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">
                        {language === "en" ? "Email" : "ኢሜል"} *
                      </Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">
                      {language === "en" ? "Phone Number" : "ስልክ ቁጥር"} *
                    </Label>
                    <Input id="phone" name="phone" type="tel" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="service">
                      {language === "en" ? "Service Requested" : "የተጠየቀ አገልግሎት"}{" "}
                      *
                    </Label>
                    <select
                      id="service"
                      name="service"
                      required
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-church-burgundy"
                    >
                      <option value="">
                        {language === "en"
                          ? "Select a service..."
                          : "አገልግሎት ይምረጡ..."}
                      </option>
                      <option
                        value={
                          language === "en" ? "Marriage Ceremony" : "ጋብቻ መፈፀም"
                        }
                      >
                        {language === "en" ? "Marriage Ceremony" : "ጋብቻ መፈፀም"}
                      </option>
                      <option
                        value={
                          language === "en" ? "Funeral Prayer" : "ጸሎተ ፍትሐት"
                        }
                      >
                        {language === "en" ? "Funeral Prayer" : "ጸሎተ ፍትሐት"}
                      </option>
                      <option
                        value={
                          language === "en"
                            ? "Counseling Services"
                            : "የምክር አገልግሎት"
                        }
                      >
                        {language === "en"
                          ? "Counseling Services"
                          : "የምክር አገልግሎት"}
                      </option>
                      <option
                        value={language === "en" ? "Qendil Prayer" : "ጸሎተ ቀንዲል"}
                      >
                        {language === "en" ? "Qendil Prayer" : "ጸሎተ ቀንዲል"}
                      </option>
                      <option
                        value={
                          language === "en" ? "Qeder Baptism" : "የቄደር ጥምቀት"
                        }
                      >
                        {language === "en" ? "Qeder Baptism" : "የቄደር ጥምቀት"}
                      </option>
                      <option
                        value={
                          language === "en"
                            ? "Christian Initiation"
                            : "ክርስትና ማስነሳት"
                        }
                      >
                        {language === "en"
                          ? "Christian Initiation"
                          : "ክርስትና ማስነሳት"}
                      </option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">
                        {language === "en" ? "Preferred Date" : "የተመረጠ ቀን"} *
                      </Label>
                      <Input id="date" name="date" type="date" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="time">
                        {language === "en" ? "Preferred Time" : "የተመረጠ ሰዓት"} *
                      </Label>
                      <Input id="time" name="time" type="time" required />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">
                      {language === "en" ? "Additional Notes" : "ተጨማሪ ማስታወሻዎች"}
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder={
                        language === "en"
                          ? "Please provide any additional details or special requests..."
                          : "እባክዎን ማንኛውም ተጨማሪ ዝርዝሮች ወይም ልዩ ጥያቄዎች ያቅርቡ..."
                      }
                      rows={3}
                    />
                  </div>
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      {language === "en" ? "Cancel" : "ሰርዝ"}
                    </Button>
                    <Button
                      type="submit"
                      className="bg-church-burgundy hover:bg-church-burgundy/90"
                    >
                      {language === "en" ? "Submit Request" : "ጥያቄ አስገባ"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Modal Dialog for Appointment Form */}
          {showModal && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-lg shadow-lg max-w-lg w-full p-6 relative animate-fade-in">
                <button
                  className="absolute top-2 right-2 text-gray-500 hover:text-church-burgundy text-2xl font-bold"
                  onClick={() => setShowModal(false)}
                  aria-label="Close"
                >
                  ×
                </button>
                <CardTitle className="mb-2">
                  {language === "en" ? "Request an Appointment" : "ቀጠሮ ይጠይቁ"}
                </CardTitle>
                <CardDescription className="mb-4">
                  {language === "en"
                    ? "Select a service and fill out the form to request an appointment."
                    : "አገልግሎት ይምረጡ እና ቅጹን ይሙሉ ለቀጠሮ ለመጠየቅ።"}
                </CardDescription>
                <form onSubmit={handleAppointmentSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="serviceType">
                      {language === "en" ? "Service Type" : "የአገልግሎት አይነት"}
                    </Label>
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
                      <Label htmlFor="name">
                        {language === "en" ? "Name" : "ስም"}
                      </Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div>
                      <Label htmlFor="email">
                        {language === "en" ? "Email" : "ኢሜይል"}
                      </Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div>
                      <Label htmlFor="phone">
                        {language === "en" ? "Phone" : "ስልክ"}
                      </Label>
                      <Input id="phone" name="phone" type="tel" required />
                    </div>
                    <div>
                      <Label htmlFor="date">
                        {language === "en" ? "Date" : "ቀን"}
                      </Label>
                      <Input
                        id="date"
                        name="date"
                        type="date"
                        min={format(new Date(), "yyyy-MM-dd")}
                      />
                    </div>
                    <div>
                      <Label htmlFor="time">
                        {language === "en" ? "Time" : "ሰዓት"}
                      </Label>
                      <Input id="time" name="time" type="time" required />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="notes">
                      {language === "en" ? "Notes" : "ማስታወሻዎች"}
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder={
                        language === "en"
                          ? "Any additional information..."
                          : "ማንኛውም ተጨማሪ መረጃ..."
                      }
                    />
                  </div>
                  <Button
                    type="submit"
                    className="bg-church-burgundy hover:bg-church-burgundy/90"
                  >
                    {language === "en" ? "Submit Request" : "ጥያቄ አስገባ"}
                  </Button>
                </form>
              </div>
            </div>
          )}

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
                  <div
                    key={`regular-${index}`}
                    className="border-l-2 border-church-gold pl-4 mb-6"
                  >
                    <div className="mb-3 rounded-md overflow-hidden w-32 h-32 float-right ml-4">
                      <img
                        src={getServiceImage(service.title)}
                        alt={service.title}
                        className="object-cover w-full h-full transition-transform hover:scale-105 duration-300 rounded-md"
                      />
                    </div>
                    <h3 className="text-xl font-serif text-church-burgundy">
                      {service.title}
                    </h3>
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
                  <div
                    key={`special-${index}`}
                    className="border-l-2 border-church-gold pl-4 mb-6"
                  >
                    <div className="mb-3 rounded-md overflow-hidden w-32 h-32 float-right ml-4">
                      <img
                        src={getServiceImage(service.title)}
                        alt={service.title}
                        className="object-cover w-full h-full transition-transform hover:scale-105 duration-300 rounded-md"
                      />
                    </div>
                    <h3 className="text-xl font-serif text-church-burgundy">
                      {service.title}
                    </h3>
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
                      : "ለወጣቶች (13-18) የሚሰጠው የወጣቶች ፕሮግራም መንፈሳዊ መመሪያ፣ የቤተክርስቲያን አገልግሎት ስልጠና፣ የማህበረሰብ አገልግሎት እድሎች እና በየሳምንቱ ቅዳሜ ከ3፡00 ምሽት እስከ 6፡00 ምሽት የባህል ስራዎችን ይሰጣል። ወጣቶች በዘማሪ ቡድን እና በባህላዊ የኢትዮጵያ ኦርቶዶክስ ቤተክርስቲያን ሙዚቃ ስልጠናም ይሳተፋሉ።"}
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
