import React from "react";
import Layout from "../components/Layout";
import { useLanguage } from "../contexts/LanguageContext";

const About: React.FC = () => {
  const { language } = useLanguage();

  return (
    <Layout>
      <div className="py-12 bg-white shadow-md">
        <div className="container mx-auto px-6">
          <h1 className="text-4xl md:text-5xl font-serif text-center mb-8">
            {language === "en" ? "About Our Church" : "ስለ ቤተክርስቲያናችን"}
          </h1>
        </div>
      </div>

      <section className="py-12 px-6">
        <div className="container mx-auto max-w-7xl">
          <div className="bg-white p-8 lg:p-12 rounded-lg shadow-md">
            <div className="prose lg:prose-xl max-w-none">
              {language === "en" ? (
                // English content
                <>
                  <p className="mb-6 text-lg">
                    The church was established on June 19, 2011 (Sene 19, 2011
                    E.C.) in Maryland Silver Spring, following the faith,
                    doctrine, canon, and tradition of the Ethiopian Orthodox
                    Tewahedo Church.
                  </p>

                  <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-4">
                    Our Mission
                  </h2>
                  <p className="mb-6">
                    Its mission includes spreading the gospel, providing
                    spiritual services, teaching Orthodox Tewahedo faith and
                    Christian ethics to children, and passing down the faith to
                    future generations.
                  </p>

                  <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-4">
                    Our Status
                  </h2>
                  <p className="mb-6">
                    It is registered under Maryland state religious organization
                    laws and recently acquired a 14-hectare site, naturally
                    beautiful and suitable for various services, currently under
                    construction.
                  </p>

                  <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-4">
                    Our Services
                  </h2>
                  <p className="mb-6">
                    Services offered include monthly commemorations for St.
                    Gabriel and the Nativity of Mary, prayer of the covenant,
                    and divine liturgy, and it is open to all believers
                    regardless of race or status, united in Christ.
                  </p>

                  <div className="mt-12 p-6 bg-church-cream rounded-lg border-l-4 border-church-gold">
                    <h3 className="text-xl font-serif text-church-burgundy mb-4">
                      Our Welcome
                    </h3>
                    <p className="italic">
                      We welcome all who seek spiritual growth, community, and a
                      deeper understanding of the Ethiopian Orthodox Tewahedo
                      tradition. Our doors are open to you.
                    </p>
                  </div>

                  <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-4">
                    Our Vision
                  </h2>
                  <p className="mb-6">
                    The vision of Debre Bisrat Dagimawi Kulibi St.Gabriel EOTC
                    is to see all followers of the faith preserve their beliefs
                    and traditions, and to witness the Ethiopian Orthodox
                    Tewahedo faith and practice flourish and strengthen.
                  </p>

                  <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-4">
                    Our Purpose
                  </h2>
                  <p className="mb-6">
                    To maintain a Holy Church that is independent from any
                    political organization, governed and administered according
                    to the Church's established rules and regulations, ensuring
                    comprehensive service delivery.
                  </p>

                  <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-4">
                    Our Mission Statement
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li>Expand and strengthen the evangelism service.</li>
                    <li>
                      Organize and strengthen Sunday school youth programs.
                    </li>
                    <li>
                      Support and strengthen monasteries, churches, and
                      traditional education centers in Ethiopia.
                    </li>
                    <li>Protect and preserve the Church's dogma and canon.</li>
                    <li>
                      Enable believers to fully understand their faith and live
                      according to Christian ethics.
                    </li>
                    <li>
                      Accept and implement religious decisions issued by the
                      Holy Synod.
                    </li>
                    <li>Establish various charitable organizations.</li>
                    <li>
                      Provide services in collaboration with other Ethiopian
                      Orthodox Tewahedo churches in the area.
                    </li>
                  </ul>
                </>
              ) : (
                // Amharic content
                <>
                  <p className="mb-6 text-lg font-semibold text-center">
                    በስመ አብ ወወልድ ወመንፈስ ቅዱስ አሐዱ አምላክ አሜን
                  </p>

                  <p className="mb-6">
                    የሜሪላንድ ደብረ ብሥራት ዳግማዊ ቁልቢ ቅዱስ ገብርኤል ቤተክርስቲያን ሰኔ 19/2011 ዓ/ም
                    ወይም JUNE 2018 በልዑል እግዚአብሔር መልካም ፈቃድ በሜሪላንድ ሲልቨር ሰፕሪንግ ተቋቋመ።
                  </p>

                  <p className="mb-6">
                    ቤተክርስቲኑ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያንን እምነት፤ ዶግማ፤ ቀኖናንና ትውፊትን
                    የሚከተል ሲሆን፤ ቤተክርስቲያን የተቋቋመበት ዋና አላማ የእግዚአብሔርን የመንግሥቱን ወንጌል
                    ለማስፋፋት ለምእመናንና ምእመናት በአቅራቢያቸው መንፈሳዊ አገልግሎት እንዲያገኙ ማድረግና ለልጆች
                    ኦርቶዶክሳዊ ተዋሕዶ አስተዳድግና ክርስቲያናዊ ሥነ ምግባር በተጠናከረ መልኩ ማስተማር ከትውልድ
                    ወደ ትውልድ ሲተላለፍ የመጣውን የአበው ሃይማኖትን ተከትሎ ተገቢውን መንፈሳዊ አገልግሎት
                    ለምዕመናን መስጠት ነው።
                  </p>

                  <p className="mb-6">
                    በአስተዳደራዊ ሁኔታዎች ደግሞ ያለንበት ሀገር የኑሮና የአሠራር ሁኔታዎችን ያገናዘበ ፤የሜሪላንድ
                    እስቴት የሃይማኖት ድርጅት ማቋቋሚያ አዋጅ በሚደነግገው መሠረት የተመዘገበ እና ልዩ ልዩ
                    መንፈሳዊ አገልግሎቶችን በመስጠት ላይ ይገኛል።
                  </p>

                  <p className="mb-6">
                    ምእመናን እና ምእመናት በውቀታቸው፤ በገንዘባቸው ቦታና ጊዜ፤ ዘርና ጎሳ ሳይለያቸው ሁሉም
                    በክርስቶስ ኢየሱስ አንድ አካል ሆነው የእግዚአብሔርን ስም እየጠሩና እያመሰገኑ ለቀጣዩ ትውልድ
                    ለማስተላለፍ እና ሥርዓተ አምልኮ የሚፈጽሙበት በታ ነው።
                  </p>

                  <p className="mb-6">
                    መንፈሳዊ አገልግሎትን ለመስጠት በቅርቡ አዲስ ቦታ በመግዛት ህንጻ በመገንባት ላይ ይገኛል ።
                    ቦታው በስፋት 14 ሄክታር ላይ የተቀመጠ ሲሆ በተፈጥሮ ውብና ማራኪ የሆነ ለልዩ ልዩ
                    አገልግሎቶች የሚውል ነው ።
                  </p>

                  <p className="mb-6">
                    ቤተክርስቲያኑ ዘወትር ለምእመናን ክፍት ሲሆን በተጭማሪም የቅዱስ ገብርኤል እና የእናታችን
                    የልደታ ለማርያምን ወርሃዊ በዓላት የጸሎተ ኪዳንና ሥርዓተ ቅዳሴ አገልግሎት ይሰጣል።
                  </p>

                  <div className="mt-12 p-6 bg-church-cream rounded-lg border-l-4 border-church-gold">
                    <h3 className="text-xl font-serif text-church-burgundy mb-4">
                      እንኳን ደህና መጡ
                    </h3>
                    <p className="italic">
                      መንፈሳዊ ዕድገትን፣ ማህበረሰብን እና የኢትዮጵያ ኦርቶዶክስ ተዋሕዶን ወግና ባህል የሚፈልጉ
                      ሁሉ እንኳን ደህና መጡ። የእኛ በሮች ሁልጊዜ ለእርስዎ ክፍት ናቸው።
                    </p>
                  </div>

                  <h2 className="text-2xl font-serif text-church-burgundy mt-12 mb-4">
                    ራዕያችን
                  </h2>
                  <p className="mb-6">
                    የሜሪላንድ ደብረ ብሥራት ዳግማዊ ቁልቢ ገብርኤል ቤተክርስቲያን የእምነቱ ተከታዮች ሁሉ
                    እምነታቸውንና ሥርዓታቸውን ጠብቀው የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ እምነትና ሥርዓት ተስፋፍቶና
                    ተጠናክሮ ማየት ነው።
                  </p>

                  <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-4">
                    አላማና ተግባር
                  </h2>
                  <p className="mb-6">
                    ከማንኛውም የፖለቲካ ድርጅት ነፃ የሆነ በቤተክርስቲያኗ ቃለ አዋዲ ሕገ ደንብ የሚመራና
                    የሚተዳደር ቅድስት ቤተ ክርስቲያንን ለመጠበቅና አገልግሎቷም የተሟላ እንዲሆን ማድረግ ነው።
                  </p>

                  <h2 className="text-2xl font-serif text-church-burgundy mt-8 mb-4">
                    ተልዕኮ
                  </h2>
                  <ul className="list-disc pl-6 space-y-2 mb-6">
                    <li>የስብከተ ወንጌል አገልግሎትን ማስፋፋትና ማጠናከር።</li>
                    <li>የሰንበት ትምህርት ቤት ወጣቶችን ማደራጀት ማጠናከር።</li>
                    <li>
                      በኢትዮጵያ የሚገኙትን ገዳማትና አድባራት እንዲሁም የአብነት ትምህርት ቤቶችን መርዳትና
                      ማጠናከር።
                    </li>
                    <li>የቤተክርስቲያንን ዶግማ እና ቀኖና መጠበቅና ማስጠበቅ</li>
                    <li>
                      ምዕመናን ሃይማኖታቸውን ጠንቅቀው እንዲያውቁና በክርስቲያናዊ ሥነ ምግባር እንዲኖሩ ማድረግ
                    </li>
                    <li>
                      ከቅዱስ ሲኖዶስ የሚተላለፈንና የሚወጣውን ሃይማኖታዊ ውሳኔ መቀበና በተግባር መተርጐም።
                    </li>
                    <li>ልዩ ልዩ ምግባረ ሠናይ ድርጅቶችን ማቋቋም።</li>
                    <li>
                      በአካባቢው ከሚገኙ የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ አብያተ ክርስቲያናት ጋር ሕብረት በፍጠር
                      አገልግሎት መስጠት።
                    </li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 bg-white">
        <div className="container mx-auto px-6 max-w-7xl">
          <h2 className="text-3xl font-serif text-center mb-8">
            {language === "en" ? "Our Faith Tradition" : "የእምነታችን ዐውደ ታሪክ"}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-church-cream p-6 rounded-lg shadow">
              <h3 className="text-xl font-serif text-church-burgundy mb-4">
                {language === "en"
                  ? "Ethiopian Orthodox Tewahedo"
                  : "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ"}
              </h3>
              <p>
                {language === "en"
                  ? "The Ethiopian Orthodox Tewahedo Church has a rich history dating back to the 4th century, making it one of the oldest Christian churches in the world. Our traditions preserve ancient Christian practices and Ethiopian cultural heritage."
                  : "የኢትዮጵያ ኦርቶዶክስ ተዋሕዶ ቤተክርስቲያን ዕድሜው ከ4ኛው ክፍለ ዘመን የሚጀምር ሲሆን በዓለም ካሉት ቅድመ ክርስትና ቤተክርስቲያናት አንዱ ነው። ወጎቻችን ጥንታዊ የክርስትና ልማዶችን እና የኢትዮጵያን ባህላዊ ቅርስ ያቆያሉ።"}
              </p>
            </div>

            <div className="bg-church-cream p-6 rounded-lg shadow">
              <h3 className="text-xl font-serif text-church-burgundy mb-4">
                {language === "en" ? "St. Gabriel" : "ቅዱስ ገብርኤል"}
              </h3>
              <p>
                {language === "en"
                  ? "Our church is dedicated to St. Gabriel the Archangel, the divine messenger who announced the birth of Christ to the Virgin Mary. In Ethiopian tradition, St. Gabriel holds special significance as a protector and intercessor."
                  : "ቤተክርስቲያናችን የክርስቶስን ልደት ለድንግል ማሪያም ያበሰረው መልዕክተኛ ለሆነው ለቅዱስ ገብርኤል መልአከ አምላክ የተሰየመ ነው። በኢትዮጵያ ባሕል ውስጥ፣ ቅዱስ ገብርኤል እንደ ጠባቂ እና አማላጅ ልዩ ጠቀሜታ አለው።"}
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
