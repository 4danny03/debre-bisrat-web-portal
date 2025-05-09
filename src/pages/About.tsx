
import React from 'react';
import Layout from '../components/Layout';

const About: React.FC = () => {
  return (
    <Layout>
      <div className="py-12 bg-white shadow-md">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif text-center mb-8">About Our Church</h1>
        </div>
      </div>

      <section className="py-12 px-6">
        <div className="container mx-auto">
          <div className="max-w-4xl mx-auto bg-white p-8 rounded-lg shadow-md">
            <div className="prose lg:prose-lg mx-auto">
              <p className="mb-6 text-lg">
                The church was established on June 19, 2011 (Sene 19, 2011 E.C.) in Maryland Silver Spring, 
                following the faith, doctrine, canon, and tradition of the Ethiopian Orthodox Tewahedo Church.
              </p>
              
              <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-4">Our Mission</h2>
              <p className="mb-6">
                Its mission includes spreading the gospel, providing spiritual services, teaching Orthodox Tewahedo faith 
                and Christian ethics to children, and passing down the faith to future generations.
              </p>
              
              <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-4">Our Status</h2>
              <p className="mb-6">
                It is registered under Maryland state religious organization laws and recently acquired a 14-hectare site, 
                naturally beautiful and suitable for various services, currently under construction.
              </p>
              
              <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-4">Our Services</h2>
              <p className="mb-6">
                Services offered include monthly commemorations for St. Gabriel and the Nativity of Mary, prayer of the covenant, 
                and divine liturgy, and it is open to all believers regardless of race or status, united in Christ.
              </p>

              <div className="mt-12 p-6 bg-church-cream rounded-lg border-l-4 border-church-gold">
                <h3 className="text-xl font-serif text-church-burgundy mb-4">Our Welcome</h3>
                <p className="italic">
                  We welcome all who seek spiritual growth, community, and a deeper understanding of the 
                  Ethiopian Orthodox Tewahedo tradition. Our doors are open to you.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <h2 className="text-3xl font-serif text-center mb-8">Our Faith Tradition</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bg-church-cream p-6 rounded-lg shadow">
              <h3 className="text-xl font-serif text-church-burgundy mb-4">Ethiopian Orthodox Tewahedo</h3>
              <p>
                The Ethiopian Orthodox Tewahedo Church has a rich history dating back to the 4th century, 
                making it one of the oldest Christian churches in the world. Our traditions preserve ancient 
                Christian practices and Ethiopian cultural heritage.
              </p>
            </div>
            
            <div className="bg-church-cream p-6 rounded-lg shadow">
              <h3 className="text-xl font-serif text-church-burgundy mb-4">St. Gabriel</h3>
              <p>
                Our church is dedicated to St. Gabriel the Archangel, the divine messenger who announced the 
                birth of Christ to the Virgin Mary. In Ethiopian tradition, St. Gabriel holds special significance 
                as a protector and intercessor.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
