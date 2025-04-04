"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Loader2, Check } from "lucide-react";
import GreenSectionShape from "@/public/assets/shapes/project/4.png";
import BreadCumpShape from "@/public/assets/shapes/home/2.png";
import NewsShape1 from "@/public/assets/shapes/news/1.png";
import NewsShape2 from "@/public/assets/shapes/news/3.png";

// ფუნქცია პარაგრაფების დასარენდერებლად (ახალი ხაზების გათვალისწინებით)
const renderParagraphs = (text) => {
  if (!text) return null;
  return text.split("\n").map((paragraph, index) => (
    <p
      key={index}
      className="text-lg text-gray-700 leading-relaxed font-normal mb-6 font-firago"
    >
      {paragraph}
    </p>
  ));
};

// პარსინგის ფუნქცია გალერეის სურათებისთვის
function parseImages(imageUrl) {
  console.log("Gallery imageUrl in about-project:", imageUrl);

  if (!imageUrl) {
    console.log("No gallery images found");
    return [];
  }

  try {
    // თუ მასივია, დავაბრუნოთ
    if (Array.isArray(imageUrl)) {
      console.log("Image URL is already an array:", imageUrl);
      return imageUrl
        .map((url) => (typeof url === "string" ? url.replace(/['"]/g, "") : ""))
        .filter((url) => url.trim() !== "");
    }

    // გავასუფთაოთ სტრინგი
    let cleanJsonString =
      typeof imageUrl === "string"
        ? imageUrl.replace(/^["'](.*)["']$/, "$1").trim()
        : "";

    console.log("Cleaned gallery JSON string:", cleanJsonString);

    if (!cleanJsonString) {
      console.log("Empty gallery string after cleaning");
      return [];
    }

    // JSON მასივის პარსინგი
    if (cleanJsonString.startsWith("[") && cleanJsonString.endsWith("]")) {
      console.log("String appears to be a JSON array, attempting to parse");
      try {
        const parsed = JSON.parse(cleanJsonString);
        console.log("Successfully parsed gallery JSON:", parsed);

        if (Array.isArray(parsed)) {
          const validUrls = parsed
            .map((url) =>
              typeof url === "string" ? url.replace(/['"]/g, "") : ""
            )
            .filter((url) => url.trim() !== "");

          console.log("Validated gallery URLs:", validUrls);
          return validUrls;
        } else {
          console.log("Parsed gallery result is not an array:", parsed);
        }
      } catch (parseError) {
        console.error("Gallery JSON parsing error:", parseError);
      }
    }

    // URL-ების ამოღება რეგულარული გამოსახულებით
    if (cleanJsonString.includes("http")) {
      console.log("String contains URLs, extracting with regex");
      const urlRegex = /(https?:\/\/[^"'\s,\[\]]+)/g;
      const matches = cleanJsonString.match(urlRegex);

      if (matches && matches.length > 0) {
        console.log("Found gallery URLs with regex:", matches);
        return matches
          .map((url) => url.replace(/['"]/g, ""))
          .filter((url) => url.trim() !== "");
      }
    }

    // ერთი URL-ის შემთხვევა
    if (cleanJsonString.startsWith("http")) {
      console.log("Gallery string appears to be a single URL");
      return [cleanJsonString.replace(/['"]/g, "")];
    }

    console.log("Could not parse gallery images");
    return [];
  } catch (error) {
    console.error("Error parsing gallery images:", error);
    return [];
  }
}

const AboutProject = ({ projectId }) => {
  const [loading, setLoading] = useState(true);
  const [sections, setSections] = useState([]);
  const [projectData, setProjectData] = useState(null);
  const [error, setError] = useState(null);

  const pathname = usePathname();
  const locale = pathname.includes("/ka") ? "ka" : "en";
  const currentLang = locale === "ka" ? "ge" : "en";

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log(`Fetching project data for ID: ${projectId}`);
        setLoading(true);

        // კეშის გამორთვისთვის პარამეტრების დამატება
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/projects/${projectId}/about?_=${timestamp}`,
          {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );

        if (!response.ok) {
          throw new Error(`Failed to fetch project data: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched project data:", data);
        setProjectData(data);
      } catch (err) {
        console.error("Error fetching project data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchData();
    }
  }, [projectId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[300px]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-12 px-4 text-center">
        <p className="text-red-500">Error: {error}</p>
      </div>
    );
  }

  if (!projectData || !projectData.data || projectData.data.length === 0) {
    return (
      <div className="py-12 px-4 text-center">
        <p>No project sections available.</p>
      </div>
    );
  }

  // ფილტრი მხოლოდ about_page ტიპის სექციებისთვის
  const aboutSections = projectData.data.filter(
    (section) => section.section_type === "about_page"
  );

  const gallerySection = projectData.data.find(
    (section) =>
      section.section_type === "gallery" ||
      (section.title && section.title.toLowerCase().includes("gallery")) ||
      (section.title_geo && section.title_geo.toLowerCase().includes("გალერე"))
  );

  console.log("Gallery section found:", gallerySection);

  const galleryImages = gallerySection
    ? parseImages(gallerySection.image_url)
    : [];

  console.log("Parsed gallery images:", galleryImages);

  return (
    <>
      {/* About Section with same styling as about-formus */}
      <div className="relative w-full bg-gray-50 py-40 font-firago">
        {/* Decorative shapes */}
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
            {/* მაპინგი ყველა about_page ტიპის სექციაზე, მონაცვლეობით განლაგებით */}
            {aboutSections.length > 0 ? (
              aboutSections.map((section, index) => (
                <div
                  key={index}
                  className={`flex flex-col ${
                    index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"
                  } items-center gap-16 mb-20`}
                >
                  <div className="flex-1">
                    <h3 className="text-3xl font-bold mb-2 text-gray-900 font-firago">
                      {currentLang === "ge"
                        ? section.title_ge
                        : section.title_en}
                    </h3>
                    {/* Show subtitle if exists */}
                    {((currentLang === "ge" && section.subtitle_ge) ||
                      (currentLang === "en" && section.subtitle_en)) && (
                      <h4 className="text-lg text-gray-600 mb-6 font-firago">
                        {currentLang === "ge"
                          ? section.subtitle_ge
                          : section.subtitle_en}
                      </h4>
                    )}
                    {/* If no subtitle, add margin */}
                    {!(
                      (currentLang === "ge" && section.subtitle_ge) ||
                      (currentLang === "en" && section.subtitle_en)
                    ) && <div className="mb-6"></div>}
                    <div className="space-y-4">
                      {renderParagraphs(
                        currentLang === "ge"
                          ? section.description_ge
                          : section.description_en
                      )}
                    </div>
                  </div>
                  <div className="w-full md:w-[350px] flex justify-center">
                    <div className="w-full h-[350px] rounded-lg overflow-hidden shadow-xl">
                      {section.image_url ? (
                        <img
                          src={section.image_url}
                          alt={
                            currentLang === "ge"
                              ? section.title_ge
                              : section.title_en
                          }
                          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <img
                          src="/assets/ortachala-project/ortachala-project.png"
                          alt={
                            locale === "ka"
                              ? "პროექტის სურათი"
                              : "Project image"
                          }
                          className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 px-4 text-center">
                <p>
                  {locale === "ka"
                    ? "ამ პროექტისთვის არ არის ხელმისაწვდომი აღწერილობითი სექციები."
                    : "No description sections available for this project."}
                </p>
              </div>
            )}

            {/* Gallery section */}
            {galleryImages.length > 0 && (
              <div className="mb-20">
                <h2 className="text-3xl font-bold mb-8 text-gray-900 font-firago text-center">
                  {locale === "ka" ? "გალერეა" : "Gallery"}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {galleryImages.map((imageUrl, index) => (
                    <div
                      key={index}
                      className="h-64 rounded-lg overflow-hidden shadow-lg"
                    >
                      <img
                        src={imageUrl}
                        alt={`Gallery image ${index + 1}`}
                        className="w-full h-full object-cover transform hover:scale-110 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AboutProject;
