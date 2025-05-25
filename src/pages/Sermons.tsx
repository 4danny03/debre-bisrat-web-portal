import React, { useState, useEffect } from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";
import { Play, Pause, Calendar, Book, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { api } from "@/integrations/supabase/api";
import { format } from "date-fns";

interface Sermon {
  id: string;
  title: string;
  description: string | null;
  scripture_reference: string | null;
  audio_url: string | null;
  preacher: string | null;
  sermon_date: string;
  is_featured: boolean;
}

const SermonCard: React.FC<{ sermon: Sermon }> = ({ sermon }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const { language } = useLanguage();

  useEffect(() => {
    if (sermon.audio_url) {
      const audioElement = new Audio(sermon.audio_url);
      setAudio(audioElement);

      audioElement.addEventListener("ended", () => setIsPlaying(false));
      return () => {
        audioElement.pause();
        audioElement.removeEventListener("ended", () => setIsPlaying(false));
      };
    }
  }, [sermon.audio_url]);

  const togglePlay = () => {
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const formattedDate = sermon.sermon_date
    ? format(new Date(sermon.sermon_date), "MMMM d, yyyy")
    : "";

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <h3 className="text-xl font-serif text-church-burgundy mb-2">
          {sermon.title}
        </h3>

        <div className="flex items-center text-sm text-gray-600 mb-3 space-x-4">
          {sermon.preacher && (
            <div className="flex items-center">
              <User size={16} className="mr-1" />
              <span>{sermon.preacher}</span>
            </div>
          )}

          <div className="flex items-center">
            <Calendar size={16} className="mr-1" />
            <span>{formattedDate}</span>
          </div>

          {sermon.scripture_reference && (
            <div className="flex items-center">
              <Book size={16} className="mr-1" />
              <span>{sermon.scripture_reference}</span>
            </div>
          )}
        </div>

        {sermon.description && (
          <p className="text-gray-700 mb-4">{sermon.description}</p>
        )}

        {sermon.audio_url && (
          <Button
            variant="outline"
            size="sm"
            className="flex items-center"
            onClick={togglePlay}
          >
            {isPlaying ? (
              <>
                <Pause size={16} className="mr-2" />
                {language === "en" ? "Pause" : "ማቆም"}
              </>
            ) : (
              <>
                <Play size={16} className="mr-2" />
                {language === "en" ? "Listen" : "ማዳመጥ"}
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

const Sermons: React.FC = () => {
  const { language } = useLanguage();
  const [sermons, setSermons] = useState<Sermon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSermons = async () => {
      try {
        const data = await api.sermons.getSermons();
        setSermons(data || []);
      } catch (err) {
        console.error("Error fetching sermons:", err);
        setError(
          language === "en"
            ? "Failed to load sermons. Please try again later."
            : "ስብከቶችን መጫን አልተቻለም። እባክዎ ቆይተው እንደገና ይሞክሩ።",
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSermons();
  }, [language]);

  return (
    <Layout>
      <div className="py-12 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-serif text-church-burgundy mb-4">
              {language === "en" ? "Sermons" : "ስብከቶች"}
            </h1>
            <p className="max-w-2xl mx-auto text-lg">
              {language === "en"
                ? "Listen to recent sermons from our church services"
                : "ከቤተክርስቲያን አገልግሎቶቻችን የቅርብ ጊዜ ስብከቶችን ያዳምጡ"}
            </p>
          </div>

          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-church-burgundy border-r-transparent">
                <span className="sr-only">Loading...</span>
              </div>
            </div>
          ) : error ? (
            <div className="text-center py-12 text-red-600">{error}</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {sermons.length > 0 ? (
                sermons.map((sermon) => (
                  <SermonCard key={sermon.id} sermon={sermon} />
                ))
              ) : (
                <div className="col-span-full text-center py-12 text-gray-500">
                  {language === "en"
                    ? "No sermons available at the moment."
                    : "በአሁኑ ጊዜ ምንም ስብከቶች አልተገኙም።"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Sermons;
