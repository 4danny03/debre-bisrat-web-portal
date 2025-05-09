
import React from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const Signup: React.FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: t("signup_success"),
        description: new Date().toLocaleString(),
      });
      (e.target as HTMLFormElement).reset();
    }, 1500);
  };

  return (
    <Layout>
      <div className="py-16 px-6">
        <div className="container mx-auto max-w-2xl">
          <Card className="border-church-gold">
            <CardHeader className="bg-gradient-to-r from-church-burgundy to-church-burgundy/90 text-white">
              <CardTitle className="text-church-gold text-3xl">{t("signup_title")}</CardTitle>
              <CardDescription className="text-white/90 mt-2">
                {t("signup_description")}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-church-burgundy">
                    {t("full_name")}
                  </Label>
                  <Input 
                    id="name" 
                    required 
                    className="border-church-burgundy/30 focus:border-church-burgundy"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-church-burgundy">
                    {t("email")}
                  </Label>
                  <Input 
                    id="email" 
                    type="email" 
                    required
                    className="border-church-burgundy/30 focus:border-church-burgundy"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-church-burgundy">
                    {t("phone")}
                  </Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    className="border-church-burgundy/30 focus:border-church-burgundy"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="language" className="text-church-burgundy">
                    {t("preferred_language")}
                  </Label>
                  <Select defaultValue={language}>
                    <SelectTrigger className="border-church-burgundy/30 focus:border-church-burgundy">
                      <SelectValue placeholder={t("preferred_language")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">{t("english")}</SelectItem>
                      <SelectItem value="am">{t("amharic")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="bg-church-burgundy hover:bg-church-burgundy/90 w-full"
                >
                  {isSubmitting ? "..." : t("submit")}
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Signup;
