import React from 'react';
import Layout from '../components/Layout';
import { useLanguage } from '../contexts/LanguageContext';
import { Calendar } from '../components/ui/calendar';
import { Card } from '../components/ui/card';
import { addDays, format, isSameDay } from 'date-fns';

interface ChurchEvent {
  date: Date;
  title: { en: string; am: string };
  description: { en: string; am: string };
  type: 'major' | 'regular' | 'community';
  icon?: string;
}

const Events: React.FC = () => {
  const { language } = useLanguage();
  const [date, setDate] = React.useState<Date>(new Date());
  
  // Ethiopian months in Amharic
  const amharicMonths = [
    'መስከረም', 'ጥቅምት', 'ኅዳር', 'ታኅሣሥ', 'ጥር', 'የካቲት',
    'መጋቢት', 'ሚያዝያ', 'ግንቦት', 'ሰኔ', 'ሐምሌ', 'ነሐሴ', 'ጷጉሜን'
  ];
  
  // Define church events
  const churchEvents: ChurchEvent[] = [
    {
      date: new Date(2025, 4, 19), // May 19, 2025
      title: {
        en: "St. Gabriel Monthly Commemoration",
        am: "የቅዱስ ገብርኤል ወርሃዊ ተዝካር"
      },
      description: {
        en: "Monthly commemoration of St. Gabriel with special prayers and services",
        am: "የቅዱስ ገብርኤል ወርሃዊ መታሰቢያ በተለየ ጸሎትና አገልግሎት"
      },
      type: 'major',
      icon: '/images/church-icon.png'
    },
    {
      date: new Date(2025, 4, 25), // May 25, 2025
      title: {
        en: "Sunday School",
        am: "የሰንበት ትምህርት ቤት"
      },
      description: {
        en: "Weekly Sunday school for children and youth",
        am: "የልጆችና የወጣቶች ሰንበት ትምህርት ቤት"
      },
      type: 'regular'
    },
    {
      date: new Date(2025, 5, 19), // June 19, 2025
      title: {
        en: "Church Foundation Day",
        am: "የቤተክርስቲያን መሰረት የተጣለበት ቀን"
      },
      description: {
        en: "Anniversary celebration of our church's foundation",
        am: "የቤተክርስቲያናችን መሰረት የተጣለበት ቀን በዓል"
      },
      type: 'major',
      icon: '/images/church-front.jpg'
    }
  ];

  const eventsForDay = (day: Date) => 
    churchEvents.filter(event => isSameDay(event.date, day));

  const formatDate = (date: Date) => {
    if (language === 'am') {
      const day = date.getDate();
      const month = amharicMonths[date.getMonth()];
      const year = date.getFullYear();
      return `${month} ${day}፣ ${year}`;
    }
    return format(date, 'MMMM d, yyyy');
  };

  return (
    <Layout>
      <div className="min-h-screen py-12 px-4 sm:px-6">
        <div className="container mx-auto">
          <div 
            className="relative rounded-lg overflow-hidden mb-12 h-64 bg-cover bg-center"
            style={{ backgroundImage: 'url("/images/timket-celebration.jpg")' }}
          >
            <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <h1 className="text-4xl md:text-5xl text-white font-serif">
                {language === 'en' ? 'Church Events' : 'የቤተክርስቲያን በዓላት'}
              </h1>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            <Card className="md:col-span-8 p-6 bg-white shadow-lg rounded-lg">
              <Calendar
                mode="single"
                selected={date}
                onSelect={(date) => date && setDate(date)}
                className="rounded-md"
                modifiers={{
                  event: (date) => churchEvents.some(event => isSameDay(event.date, date))
                }}
                modifiersStyles={{
                  event: { 
                    fontWeight: 'bold',
                    backgroundColor: 'var(--church-burgundy)',
                    color: 'white',
                    borderRadius: '50%'
                  }
                }}
              />
            </Card>

            <div className="md:col-span-4">
              <Card className="p-6 bg-white shadow-lg rounded-lg">
                <h2 className="text-2xl font-serif text-church-burgundy mb-4">
                  {language === 'en' ? 'Events on ' : 'በዚህ ቀን ያሉ በዓላት '}
                  {formatDate(date)}
                </h2>
                
                {eventsForDay(date).length > 0 ? (
                  <div className="space-y-4">
                    {eventsForDay(date).map((event, index) => (
                      <div 
                        key={index}
                        className="p-4 rounded-lg border border-church-gold bg-church-cream"
                      >
                        {event.icon && (
                          <img 
                            src={event.icon} 
                            alt={event.title[language]} 
                            className="w-full h-32 object-cover rounded-lg mb-4"
                          />
                        )}
                        <h3 className="text-xl font-serif text-church-burgundy">
                          {event.title[language]}
                        </h3>
                        <p className="mt-2 text-gray-600">
                          {event.description[language]}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">
                    {language === 'en' 
                      ? 'No events scheduled for this day' 
                      : 'በዚህ ቀን የተያዘ መርሐ ግብር የለም'}
                  </p>
                )}
              </Card>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Events;
