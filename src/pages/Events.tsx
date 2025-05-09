
import React from 'react';
import Layout from '../components/Layout';
import { Calendar } from 'lucide-react';

interface EventProps {
  date: string;
  title: string;
  location: string;
  description: string;
}

const EventCard: React.FC<EventProps> = ({ date, title, location, description }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <div className="bg-church-burgundy text-white py-3 px-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar size={18} />
          <span>{date}</span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-xl font-serif text-church-burgundy mb-2">{title}</h3>
        <p className="text-sm text-gray-600 mb-4">{location}</p>
        <p>{description}</p>
      </div>
    </div>
  );
};

const Events: React.FC = () => {
  const events: EventProps[] = [
    {
      date: "May 14, 2025",
      title: "የሜያዝያ ቅዱስ ገብርኤል በዓል / St. Gabriel Monthly Commemoration",
      location: "16020 Batson Rd, Spencerville, MD 20868",
      description: "Join us for the monthly commemoration of St. Gabriel. The service will include prayers, hymns, and a community meal following the ceremony."
    },
    {
      date: "May 21, 2025",
      title: "የልጆች የሰንበት ትምህርት / Sunday School for Children",
      location: "16020 Batson Rd, Spencerville, MD 20868",
      description: "Weekly Sunday school classes for children to learn about Orthodox Tewahedo faith and traditions. Classes are available for different age groups."
    },
    {
      date: "June 19, 2025",
      title: "የቤተክርስቲያን ምሥረታ በዓል / Church Foundation Anniversary",
      location: "16020 Batson Rd, Spencerville, MD 20868",
      description: "Celebrate the anniversary of our church's foundation with special liturgical services, cultural performances, and community festivities."
    }
  ];

  return (
    <Layout>
      <div className="py-12 bg-white shadow-md">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif text-center mb-8">Church Events</h1>
        </div>
      </div>

      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto">
            <div className="mb-10">
              <h2 className="text-2xl font-serif mb-4">Upcoming Events</h2>
              <p className="text-gray-600">
                Join us for these upcoming events at Debre Bisrat Dagimawi Kulibi St. Gabriel Church.
                Our community welcomes you to participate in our worship services and gatherings.
              </p>
            </div>

            <div className="grid gap-8">
              {events.map((event, index) => (
                <EventCard key={index} {...event} />
              ))}
            </div>

            <div className="mt-12 p-6 bg-church-cream rounded-lg border-l-4 border-church-gold">
              <h3 className="text-xl font-serif text-church-burgundy mb-2">Regular Services</h3>
              <p>
                Regular Divine Liturgy services are held every Sunday starting at 8:00 AM. Please arrive early to 
                participate in the Morning Prayers that begin at 6:00 AM.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Events;
