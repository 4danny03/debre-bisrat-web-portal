
import React from 'react';
import ImageSlider from '../components/ImageSlider';
import Layout from '../components/Layout';
import { Link } from 'react-router-dom';

const slides = [
  {
    image: 'https://images.unsplash.com/photo-1487958449943-2429e8be8625',
    title: 'Welcome to St. Gabriel Church',
    content: 'Join us in worship and community',
  },
  {
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742',
    title: 'Our Faith Community',
    content: 'Growing together in faith and fellowship',
  },
  {
    image: 'https://images.unsplash.com/photo-1473177104440-ffee2f376098',
    title: 'Worship with Us',
    content: 'Experience the Ethiopian Orthodox tradition',
  },
];

const Home: React.FC = () => {
  return (
    <Layout>
      <ImageSlider slides={slides} />
      
      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-serif mb-6">
              Welcome to the Debre Bisrat Dagimawi Kulibi St. Gabriel Ethiopian Orthodox Tewahedo Church, Silver Spring, Maryland
            </h1>
            
            <p className="text-2xl font-amharic mb-8 text-church-dark">
              እንኳን ወደ ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ድረ ገጽ በሰላም መጡ።
            </p>

            <div className="mt-12 mb-8">
              <Link 
                to="/about"
                className="bg-church-burgundy text-white px-8 py-3 rounded-md hover:bg-church-burgundy/80 transition-colors"
              >
                Learn More About Us
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-3xl font-serif mb-8 text-center">Biblical Wisdom</h2>
            
            <div className="bg-church-cream p-8 border-l-4 border-church-gold rounded-r shadow-md">
              <p className="text-xl mb-4 italic">
                "Give, and it will be given to you. A good measure, pressed down, shaken together and running over, 
                will be poured into your lap. For with the measure you use, it will be measured to you."
              </p>
              <p className="text-right text-church-burgundy font-semibold">
                Luke 6:38, NIV
              </p>
              
              <p className="text-xl mt-6 mb-4 font-amharic italic">
                "ስጡ፥ ይሰጣችሁማል፤ መልካም መስፈሪያ የተደቆሰ የተነቀነቀ የተትረፈረፈ 
                በኩራባችሁ ይሰጣችሁማል፤ በምትሰፍሩበት መስፈሪያ ይሰፈርላችሁማልና።"
              </p>
              <p className="text-right text-church-burgundy font-semibold font-amharic">
                ሉቃስ 6:38
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-serif mb-4">Join Us in Worship</h3>
              <p className="mb-4">Experience the beauty of Ethiopian Orthodox worship and traditions with our community.</p>
              <Link to="/contact" className="text-church-burgundy hover:underline">Find our schedule →</Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-serif mb-4">Our Community</h3>
              <p className="mb-4">Join a welcoming community of believers united in faith, tradition, and service.</p>
              <Link to="/about" className="text-church-burgundy hover:underline">Learn about us →</Link>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow">
              <h3 className="text-2xl font-serif mb-4">Upcoming Events</h3>
              <p className="mb-4">Stay connected with our church activities, celebrations, and gatherings.</p>
              <Link to="/events" className="text-church-burgundy hover:underline">View calendar →</Link>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Home;
