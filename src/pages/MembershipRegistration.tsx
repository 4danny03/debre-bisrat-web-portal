import { type FC } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from '@/integrations/supabase/client';

const MembershipRegistration: FC = () => {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.target as HTMLFormElement);
      const amount = "100"; // Membership fee in dollars

      // Create member record
      const { error: memberError } = await supabase
        .from('members')
        .insert([{
          full_name: formData.get('name'),
          email: formData.get('email'),
          phone: formData.get('phone'),
          address: formData.get('address'),
          membership_type: formData.get('membershipType'),
          membership_status: 'pending',
          join_date: new Date().toISOString(),
        }]);

      if (memberError) {
        throw memberError;
      }

      // Call Stripe checkout through Edge Function
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          donationType: "one_time",
          purpose: "membership_fee",
          email: formData.get('email'),
          name: formData.get('name'),
          address: formData.get('address')
        }),
      });

      if (!response.ok) {
        throw new Error('Payment initiation failed');
      }

      const data = await response.json();
      window.location.href = data.url;

    } catch (error) {
      console.error('Membership registration error:', error);
      toast({
        variant: "destructive",
        title: t("Error"),
        description: t("membership.error_message")
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{t("membership.title")}</CardTitle>
            <CardDescription>{t("membership.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("membership.name")}</Label>
                <Input id="name" name="name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("membership.email")}</Label>
                <Input id="email" name="email" type="email" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("membership.phone")}</Label>
                <Input id="phone" name="phone" type="tel" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">{t("membership.address")}</Label>
                <Input id="address" name="address" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="membershipType">{t("membership.type")}</Label>
                <Select name="membershipType" defaultValue="regular" required>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="regular">{t("membership.types.regular")}</SelectItem>
                    <SelectItem value="student">{t("membership.types.student")}</SelectItem>
                    <SelectItem value="senior">{t("membership.types.senior")}</SelectItem>
                    <SelectItem value="family">{t("membership.types.family")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t("membership.submitting") : t("membership.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default MembershipRegistration;
