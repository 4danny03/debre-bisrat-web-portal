import React, { useState } from "react";
import Layout from "../components/Layout";
import { Home, Phone, Mail, Facebook } from "lucide-react";
import { useLanguage } from "../contexts/LanguageContext";

const Contact: React.FC = () => {
  const { language } = useLanguage();
  // Add state for form fields and submission status
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.id]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSuccess(null);
    setError(null);
    // Simulate async send (replace with real API call if needed)
    setTimeout(() => {
      setSubmitting(false);
      setSuccess(language === "am" ? "መልዕክትዎ ተልኳል!" : "Your message has been sent!");
      setForm({ name: "", email: "", subject: "", message: "" });
    }, 1200);
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
                      EthiopianOrthodoxSt.GabrielChurchSilverspringMD
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
                    <input
                      type="text"
                      id="name"
                      value={form.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-church-burgundy"
                      placeholder={language === "am" ? "ስምዎን" : "Your name"}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-1 font-medium">
                      {language === "am" ? "ኢሜይል" : "Email"}
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={form.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-church-burgundy"
                      placeholder={language === "am" ? "ኢሜይልዎን" : "Your email"}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="subject" className="block mb-1 font-medium">
                      {language === "am" ? "ርዕስ" : "Subject"}
                    </label>
                    <input
                      type="text"
                      id="subject"
                      value={form.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-church-burgundy"
                      placeholder={language === "am" ? "የመልዕክት ርዕስ" : "Message subject"}
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block mb-1 font-medium">
                      {language === "am" ? "መልዕክት" : "Message"}
                    </label>
                    <textarea
                      id="message"
                      rows={5}
                      value={form.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-church-burgundy"
                      placeholder={language === "am" ? "መልዕክትዎን" : "Your message"}
                      required
                    ></textarea>
                  </div>

                  {success && <div className="text-green-600 font-medium">{success}</div>}
                  {error && <div className="text-red-600 font-medium">{error}</div>}

                  <div>
                    <button
                      type="submit"
                      className="bg-church-burgundy text-white px-8 py-3 rounded-md hover:bg-church-burgundy/80 transition-colors"
                      disabled={submitting}
                    >
                      {submitting
                        ? language === "am" ? "በማስተናገድ ላይ..." : "Sending..."
                        : language === "am" ? "መልዕክት ላክ" : "Send Message"}
                    </button>
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
