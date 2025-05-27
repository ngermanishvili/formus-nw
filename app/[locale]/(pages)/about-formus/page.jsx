"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Check } from "lucide-react";
import Image from "next/image";
// These imports were in your original file, ensure they are used or remove them.
import NewsShape1 from "@/public/assets/shapes/home/3.png";
import NewsShape2 from "@/public/assets/shapes/news/1.png";
import ReactMarkdown from "react-markdown";
import BreadCumpShape from "@/public/assets/shapes/home/2.png";

const AboutFormus = () => {
  const [aboutData, setAboutData] = useState([]);
  const [hasMounted, setHasMounted] = useState(false); // For hydration safety
  const params = useParams();
  const locale = params.locale || "ka";

  useEffect(() => {
    setHasMounted(true); // Set to true once component mounts on client
  }, []);

  const introText = {
    en: "The investment in our projects is fully dedicated to creating environmentally friendly, safe and comfortable developments.",
    ka: "პროექტებში განხორციელებული ინვესტიცია სრულად მიმართულია ეკოლოგიურად სუფთა, უსაფრთხო  და მყუდრო განაშენიანების შექმნაზე.",
  };

  const benefits = {
    en: [
      "Flexible payment terms",
      "Efficient placement of savings",
      "Energy-efficient real estate with increasing value",
      "Strict adherence to construction timelines",
      "Fully funded projects",
    ],
    ka: [
      "გადახდის ხელსაყრელ პირობებს",
      "დანაზოგის ეფექტურ განთავსებას",
      "ენერგოეფექტურ უძრავ ქონებას მზარდი ღირებულებით",
      "მშენებლობის მკაცრად დაცულ ვადებს",
      "სრულად დაფინანსებულ პროექტებს",
    ],
  };

  const companionText = {
    en: 'For future residents, "Formus" serves as a guide and companion, from the very beginning of choosing a home to opening the door to their own apartment.',
    ka: 'მომავალი მობინადრეებისთვის "ფორმუსი" არის ახალი ცხოვრების გზამკვლევი და თანამგზავრი სახლის შერჩევის დაწყებიდან საკუთარი ბინის კარის შეღებამდე.',
  };

  const companionTitle = {
    en: "The company offers every resident: ",
    ka: "კომპანია ყველა მომხმარებელს სთავაზობს: ",
  };

  const getLocalizedField = (item, field) => {
    if (!item) return "";
    const fieldSuffix = locale === "en" ? "en" : "ge";
    return item[`${field}_${fieldSuffix}`] || ""; // Ensure a string is always returned
  };

  const renderParagraphs = (text) => {
    if (!text) return null;
    return text.split("\n\n").map((paragraph, index) => (
      <p
        key={index}
        className="text-lg text-gray-700 leading-relaxed font-normal mb-6"
      >
        {paragraph.trim()}
      </p>
    ));
  };

  // This function was defined but not explicitly called in the main return.
  // The JSX for aboutData[2] section implements similar logic directly.
  const renderBenefits = () => {
    // Note: These re-declarations shadow the component-level constants.
    // Consider removing them and using the component-level constants if they are the same.
    const localIntroText = {
      /* ... same as introText ... */
    };
    const localBenefits = {
      /* ... same as benefits ... */
    };
    const localCompanionText = {
      /* ... same as companionText ... */
    };

    return (
      <div className="mb-12">
        <p className="text-lg text-gray-700 leading-relaxed font-normal mb-6">
          {introText[locale]}{" "}
          {/* Using component-level introText here for consistency */}
        </p>
        <p className="text-lg text-gray-700 leading-relaxed font-normal mb-4">
          {companionTitle[locale]} {/* Using component-level companionTitle */}
        </p>
        <ul className="space-y-4 mb-6">
          {benefits[locale].map(
            (
              benefit,
              index // Using component-level benefits
            ) => (
              <li key={index} className="flex items-center gap-4">
                <div className="flex-shrink-0">
                  <Check className="h-6 w-6 text-green-500" />
                </div>
                <span className="text-gray-700 font-normal">{benefit}</span>
              </li>
            )
          )}
        </ul>
      </div>
    );
  };

  useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await fetch("/api/about");
        if (!res.ok) {
          console.error("API request failed with status:", res.status);
          setAboutData([]); // Set to empty or an error state representation
          return;
        }
        const data = await res.json();
        if (data.status === "success") {
          setAboutData(data.data || []); // Ensure data.data is not undefined
        } else {
          console.error("API returned error:", data.message);
          setAboutData([]);
        }
      } catch (error) {
        console.error("Failed to fetch about data:", error);
        setAboutData([]); // Set to empty or an error state representation
      }
    };
    // Fetch data only after the component has mounted to ensure `params` is available
    if (hasMounted) {
      fetchAboutData();
    }
  }, [hasMounted]); // Depend on hasMounted

  const formatTitle = (title) => {
    if (!title) return "";
    if (locale === "en") {
      return title.split(" for ").join("\n for ");
    } else {
      return title.split(" შენებისთვის").join("\nშენებისთვის");
    }
  };

  // Placeholder components for better readability
  const SkeletonPlaceholder = ({
    className = "bg-gray-200 rounded animate-pulse",
    heightClass = "h-8",
  }) => <div className={`${className} ${heightClass} w-full`}></div>;

  const TextPlaceholder = ({ lines = 1, className = "" }) => (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonPlaceholder key={i} heightClass="h-4" />
      ))}
    </div>
  );

  return (
    <div className="relative w-full bg-gray-50 py-40 font-firago">
      {/* These decorative images are assumed to be static and always present */}
      <div className="hidden lg:block absolute top-[100px] right-0 z-0">
        <img
          src="/assets/shapes/news/1.png"
          alt="Decorative shape"
          className="mt-12 lg:w-[90px] xl:w-[140px] 2xl:w-[200px] min-[1900px]:w-[300px]"
        />
      </div>
      <div className="hidden lg:block absolute bottom-[400px] left-[-20px] z-0">
        <img
          src="/assets/shapes/news/3.png"
          alt="Decorative shape"
          className="mt-12 lg:w-[110px] xl:w-[170px] 2xl:w-[200px] min-[1900px]:w-[300px]"
        />
      </div>

      <div className="container mx-auto px-4">
        <div className="max-w-[970px] mx-auto">
          <div className="w-full mb-16">
            {hasMounted && aboutData.length > 0 && aboutData[0]?.image_url ? (
              <img
                src={aboutData[0].image_url}
                alt="Formus Building Complex"
                className="w-full h-[800px] max-w-[1200px] object-cover object-bottom rounded-2xl shadow-lg"
              />
            ) : (
              <SkeletonPlaceholder
                className="w-full h-[800px] max-w-[1200px] rounded-2xl shadow-lg"
                heightClass=""
              />
            )}
          </div>

          <div className="mb-20">
            <div className="relative mb-8">
              <div className="z-0">
                {hasMounted && aboutData.length > 1 && aboutData[1] ? (
                  <h2
                    className="text-3xl font-bold mb-6 text-gray-900 font-firago flex items-center min-h-[90px]"
                    style={{
                      backgroundImage: `url(${BreadCumpShape.src})`, // Correctly use .src and url()
                      backgroundRepeat: "no-repeat",
                      backgroundPosition: "left center",
                      backgroundSize: "90px 90px",
                      paddingLeft: "",
                    }}
                  >
                    {getLocalizedField(aboutData[1], "title")}
                  </h2>
                ) : (
                  <h2
                    className="text-3xl font-bold mb-6 text-gray-900 font-firago flex items-center min-h-[90px]"
                    style={{ paddingLeft: "110px" }} // Placeholder with same layout structure
                    aria-hidden="true"
                  >
                    <TextPlaceholder lines={1} className="w-3/4" />
                  </h2>
                )}
              </div>
              {hasMounted && aboutData.length > 0 && aboutData[0] ? (
                <h2 className="text-4xl font-bold text-gray-900 font-firago whitespace-pre-line relative z-10">
                  {formatTitle(getLocalizedField(aboutData[0], "title"))}
                </h2>
              ) : (
                <div className="relative z-10">
                  <TextPlaceholder lines={2} className="w-1/2 h-16 mb-6" />
                </div>
              )}
            </div>
            {hasMounted && aboutData.length > 0 && aboutData[0] ? (
              <div className="space-y-4">
                {renderParagraphs(
                  getLocalizedField(aboutData[0], "description")
                )}
              </div>
            ) : (
              <TextPlaceholder lines={3} className="mb-4" />
            )}
          </div>

          {hasMounted && aboutData.length > 1 && aboutData[1] ? (
            <div className="flex flex-col md:flex-row items-center gap-16 mb-20">
              <div className="flex-1">
                <div className="space-y-4">
                  {renderParagraphs(
                    getLocalizedField(aboutData[1], "description")
                  )}
                </div>
              </div>
              <div className="w-full md:w-[350px] flex justify-center">
                <div className="w-full h-[350px] rounded-lg overflow-hidden shadow-xl">
                  <img
                    src={aboutData[1]?.image_url || "/default-placeholder.png"} // Provide a valid fallback image path
                    alt="Building Quality"
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <SkeletonPlaceholder
              className="flex flex-col md:flex-row items-center gap-16 mb-20"
              heightClass="h-[350px]"
            />
          )}

          {hasMounted && aboutData.length > 2 && aboutData[2] ? (
            <div className="flex flex-col md:flex-row-reverse items-center gap-16 mb-20">
              <div className="flex-1">
                <h2 className="text-3xl font-bold mb-6 text-gray-900 font-firago">
                  {getLocalizedField(aboutData[2], "title")}
                </h2>
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed font-normal mb-6">
                    {introText[locale]}
                  </p>
                  <p className="text-lg text-gray-700 leading-relaxed font-normal mb-4">
                    {companionTitle[locale]}
                  </p>
                  <ul className="space-y-4 mb-6">
                    {benefits[locale].map((benefit, index) => (
                      <li key={index} className="flex items-center gap-4">
                        <div className="flex-shrink-0">
                          <Check className="h-6 w-6 text-green-500" />
                        </div>
                        <span className="text-gray-700 font-normal">
                          {benefit}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <p className="text-lg text-gray-700 leading-relaxed font-normal">
                    {companionText[locale]}
                  </p>
                </div>
              </div>
              <div className="w-full md:w-[350px] flex justify-center">
                <div className="w-full h-[350px] rounded-lg overflow-hidden shadow-xl">
                  <Image
                    width={350} // Explicit width for Next/Image
                    height={350} // Explicit height for Next/Image
                    src={
                      aboutData[2]?.image_url ||
                      "https://res.cloudinary.com/ds9dsumwl/image/upload/v1740007760/formus/avzerdz2slr0g1rftaot.png"
                    } // Keep your fallback or use a local one
                    alt="Our Services"
                    className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                  />
                </div>
              </div>
            </div>
          ) : (
            <SkeletonPlaceholder
              className="flex flex-col md:flex-row-reverse items-center gap-16 mb-20"
              heightClass="h-[450px]"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default AboutFormus;
