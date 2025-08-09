import React, { useState } from "react";
import Layout from "../components/Layout";
import { Home, Phone, Mail, Facebook } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

const Contact: React.FC = () => {
  const { language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const subject = formData.get("subject") as string;
    const message = formData.get("message") as string;

    try {
      const { data, error } = await supabase.functions.invoke("contact-form", {
        body: { name, email, subject, message },
      });
      if (error || !data?.success) {
        throw new Error((error && error.message) || data?.error || "Failed to send message");
      }
      toast({
        title: "Message Sent",
        description: "Thank you for your message. We'll get back to you soon.",
      });
      console.log('response', data);
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to send message. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <Layout>
      <div className="py-12 bg-white shadow-md">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif text-center mb-8">
            {language === "am" ? "ያግኙን" : "Contact Us"}
          </h1>
        </div>
      </div>

      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="bg-white p-8 rounded-lg shadow-md">
              <h2 className="text-3xl font-serif text-church-burgundy mb-6">
                {language === "am" ? "ያግኙን" : "Get In Touch"}
              </h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="bg-church-burgundy rounded-full p-2 mt-1">
                    <Home className="text-white" size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {language === "am" ? "አድራሻ" : "Address"}
                    </h3>
                    <address className="not-italic">
                      16020 Batson Rd,
                      <br />
                      Spencerville, MD 20868
                    </address>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-church-burgundy rounded-full p-2 mt-1">
                    <Phone className="text-white" size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {language === "am" ? "ስልክ" : "Phone"}
                    </h3>
                    <a
                      href="tel:+12403818146"
                      className="hover:text-church-burgundy transition-colors"
                    >
                      (240)-381-8146
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-church-burgundy rounded-full p-2 mt-1">
                    <Mail className="text-white" size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">
                      {language === "am" ? "ኢሜይል" : "Email"}
                    </h3>
                    <a
                      href="mailto:info@stgabrielsilverspring.org"
                      className="hover:text-church-burgundy transition-colors"
                    >
                      info@stgabrielsilverspring.org
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="bg-church-burgundy rounded-full p-2 mt-1">
                    <Facebook className="text-white" size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">Facebook</h3>
                    <a
                      href="https://www.facebook.com/EthiopianOrthodoxSt.GabrielChurchSilverspringMD"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-church-burgundy transition-colors"
                    >
                    </a>
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <h3 className="font-semibold text-lg mb-1">
                  {language === "am" ? "ድህረ ገጾች" : "Websites"}
                </h3>
                <div className="space-y-2">
                  <div>
                    <a
                      href="https://stgabrielmd.org"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-church-burgundy transition-colors"
                    >
                      https://stgabrielmd.org
                    </a>
                  </div>
                  <div>
                    <a
                      href="http://www.EthiopianOrthodoxSt.GabrielChurchSilverspringMD.com"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-church-burgundy transition-colors"
                    >
                      www.EthiopianOrthodoxSt.GabrielChurchSilverspringMD.com
                    </a>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <div className="bg-white p-8 rounded-lg shadow-md">
                <h2 className="text-3xl font-serif text-church-burgundy mb-6">
                  {language === "am" ? "መልዕክት ይላኩልን" : "Send Us a Message"}
                </h2>
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div>
                    <label htmlFor="name" className="block mb-1 font-medium">
                      {language === "am" ? "ስም" : "Name"}
                    </label>
                    <Input
                      type="text"
                      id="name"
                      name="name"
                      required
                      placeholder={language === "am" ? "ስምዎን" : "Your name"}
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-1 font-medium">
                      {language === "am" ? "ኢሜይል" : "Email"}
                    </label>
                    <Input
                      type="email"
                      id="email"
                      name="email"
                      required
                      placeholder={language === "am" ? "ኢሜይልዎን" : "Your email"}
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block mb-1 font-medium">
                      {language === "am" ? "ርዕስ" : "Subject"}
                    </label>
                    <Input
                      type="text"
                      id="subject"
                      name="subject"
                      required
                      placeholder={
                        language === "am" ? "የመልዕክት ርዕስ" : "Message subject"
                      }
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block mb-1 font-medium">
                      {language === "am" ? "መልዕክት" : "Message"}
                    </label>
                    <Textarea
                      id="message"
                      name="message"
                      rows={5}
                      required
                      placeholder={
                        language === "am" ? "መልዕክትዎን" : "Your message"
                      }
                    />
                  </div>


                  <div>
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="bg-church-burgundy hover:bg-church-burgundy/90 text-white px-8 py-3"
                    >
                      {isSubmitting ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          {language === "am" ? "በመላክ ላይ..." : "Sending..."}
                        </div>
                      ) : language === "am" ? (
                        "መልዕክት ላክ"
                      ) : (
                        "Send Message"
                      )}
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-serif text-center mb-8">
            {language === "am" ? "አድራሻ" : "Location"}
          </h2>
          <div className="max-w-5xl mx-auto h-96 rounded-lg overflow-hidden shadow-lg">
            <iframe
              title="Church Location"
              width="100%"
              height="100%"
              frameBorder="0"
              style={{ border: 0 }}
              src={`https://www.google.com/maps/embed/v1/place?q=16020+Batson+Rd,+Spencerville,+MD+20868&key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8`}
              allowFullScreen
            ></iframe>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Contact;
