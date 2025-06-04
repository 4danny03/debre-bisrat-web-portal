
import React from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, MapPin, Calendar, Users, Heart, Book, Music, Coffee } from "lucide-react";

export default function Services() {
  const { t } = useLanguage();

  const services = [
    {
      id: 1,
      title: "Sunday Morning Worship",
      time: "10:00 AM",
      duration: "1.5 hours",
      location: "Main Sanctuary",
      description: "Join us for our main weekly worship service with inspiring music, prayer, and biblical teaching.",
      type: "worship",
      language: "English & Amharic",
      features: ["Live Music", "Children's Program", "Translation Available"]
    },
    {
      id: 2,
      title: "Evening Prayer Service",
      time: "6:00 PM",
      duration: "1 hour",
      location: "Prayer Hall",
      description: "A peaceful evening service focused on prayer, meditation, and spiritual reflection.",
      type: "prayer",
      language: "Amharic",
      features: ["Traditional Prayers", "Quiet Reflection", "Candle Lighting"]
    },
    {
      id: 3,
      title: "Youth Fellowship",
      time: "7:00 PM",
      duration: "2 hours",
      location: "Youth Center",
      description: "Dynamic gathering for young people with contemporary worship, discussion, and community building.",
      type: "fellowship",
      language: "English",
      features: ["Contemporary Music", "Group Discussions", "Social Activities"]
    },
    {
      id: 4,
      title: "Bible Study",
      time: "7:30 PM",
      duration: "1.5 hours",
      location: "Study Room",
      description: "Weekly Bible study sessions exploring scripture with deep discussion and practical application.",
      type: "study",
      language: "English & Amharic",
      features: ["Group Study", "Interactive Discussion", "Take-home Materials"]
    }
  ];

  const weeklySchedule = [
    { day: "Sunday", services: ["Sunday Morning Worship", "Evening Prayer Service"] },
    { day: "Monday", services: [] },
    { day: "Tuesday", services: ["Bible Study"] },
    { day: "Wednesday", services: ["Evening Prayer Service"] },
    { day: "Thursday", services: [] },
    { day: "Friday", services: ["Youth Fellowship"] },
    { day: "Saturday", services: [] }
  ];

  const getServiceIcon = (type: string) => {
    switch (type) {
      case "worship": return <Music className="h-5 w-5" />;
      case "prayer": return <Heart className="h-5 w-5" />;
      case "fellowship": return <Users className="h-5 w-5" />;
      case "study": return <Book className="h-5 w-5" />;
      default: return <Calendar className="h-5 w-5" />;
    }
  };

  const getServiceColor = (type: string) => {
    switch (type) {
      case "worship": return "bg-blue-100 text-blue-800";
      case "prayer": return "bg-purple-100 text-purple-800";
      case "fellowship": return "bg-green-100 text-green-800";
      case "study": return "bg-orange-100 text-orange-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-church-burgundy mb-4">
            {t("services") || "Church Services"}
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Join us throughout the week for worship, prayer, fellowship, and learning. 
            All are welcome to participate in our spiritual community.
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid gap-8 md:grid-cols-2 mb-12">
          {services.map((service) => (
            <Card key={service.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    {getServiceIcon(service.type)}
                    <CardTitle className="text-xl text-church-burgundy">{service.title}</CardTitle>
                  </div>
                  <Badge className={getServiceColor(service.type)}>
                    {service.type}
                  </Badge>
                </div>
                <CardDescription className="text-base">
                  {service.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-gray-500" />
                    <span>{service.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <span>{service.duration}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span>{service.location}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span>{service.language}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-sm text-gray-700 mb-2">Features:</h4>
                  <div className="flex flex-wrap gap-1">
                    {service.features.map((feature, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Button size="sm" className="w-full bg-church-burgundy hover:bg-church-burgundy/90">
                  Learn More
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Weekly Schedule */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl text-church-burgundy flex items-center">
              <Calendar className="h-6 w-6 mr-2" />
              Weekly Schedule
            </CardTitle>
            <CardDescription>
              Our regular weekly services and gatherings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-7">
              {weeklySchedule.map((day, index) => (
                <div key={index} className="text-center">
                  <h3 className="font-semibold text-church-burgundy mb-2">{day.day}</h3>
                  <div className="space-y-1">
                    {day.services.length > 0 ? (
                      day.services.map((service, serviceIndex) => {
                        const serviceData = services.find(s => s.title === service);
                        return (
                          <div key={serviceIndex} className="bg-gray-50 p-2 rounded text-xs">
                            <div className="font-medium">{service}</div>
                            {serviceData && (
                              <div className="text-gray-500">{serviceData.time}</div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-gray-400 text-xs py-2">No services</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center bg-church-cream p-8 rounded-lg">
          <h2 className="text-2xl font-bold text-church-burgundy mb-4">
            Join Us for Worship
          </h2>
          <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
            Whether you're new to faith or have been walking with God for years, 
            there's a place for you in our community. Come as you are and experience 
            the love and fellowship of our church family.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-church-burgundy hover:bg-church-burgundy/90">
              <Coffee className="h-4 w-4 mr-2" />
              Plan Your Visit
            </Button>
            <Button size="lg" variant="outline" className="border-church-burgundy text-church-burgundy">
              Contact Us
            </Button>
          </div>
        </div>
      </div>
    </Layout>
  );
}
