import { useState } from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function Donation() {
  const { t, language } = useLanguage();
  const [donationType, setDonationType] = useState('one_time');
  const [purpose, setPurpose] = useState('general_fund');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || isNaN(parseFloat(amount))) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount,
          donationType,
          purpose,
          email: (e.target as HTMLFormElement).email.value,
        }),
      });

      if (!response.ok) {
        throw new Error('Payment initiation failed');
      }

      const data = await response.json();
      window.location.href = data.url;
    } catch (error) {
      console.error('Error:', error);
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div className="container mx-auto p-4">
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle>{t("donation.title")}</CardTitle>
            <CardDescription>{t("donation.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>{t("donation.type")}</Label>
                <Select value={donationType} onValueChange={setDonationType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">{t("donation.types.one_time")}</SelectItem>
                    <SelectItem value="monthly">{t("donation.types.monthly")}</SelectItem>
                    <SelectItem value="quarterly">{t("donation.types.quarterly")}</SelectItem>
                    <SelectItem value="yearly">{t("donation.types.yearly")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>{t("donation.purpose")}</Label>
                <Select value={purpose} onValueChange={setPurpose}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="general_fund">{t("donation.purposes.general_fund")}</SelectItem>
                    <SelectItem value="building_fund">{t("donation.purposes.building_fund")}</SelectItem>
                    <SelectItem value="youth_programs">{t("donation.purposes.youth_programs")}</SelectItem>
                    <SelectItem value="general">{t("donation.purposes.general")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("donation.email")}</Label>
                <Input id="email" name="email" type="email" required />
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">{t("donation.amount")}</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
                  <Input
                    id="amount"
                    type="number"
                    min="1"
                    step="1"
                    className="pl-7"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading}>
                {loading ? t("donation.processing") : t("donation.submit")}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}
