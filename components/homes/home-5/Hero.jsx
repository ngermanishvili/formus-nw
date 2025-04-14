"use client";
import Image from "next/image";
import Link from "next/link";
import { Autoplay } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import LeftomBottomShape from "@/public/assets/shapes/home/1.png";

const baseSettings = {
  modules: [Autoplay],
  autoplay: {
    delay: 4000,
    disableOnInteraction: false,
  },
};

export default function Hero() {
  const [mounted, setMounted] = useState(false);
  const [data, setData] = useState({
    sliders: [],
    projects: [],
  });
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState(0);
  const [bgImage, setBgImage] = useState("");

  const pathname = usePathname();
  const currentLang = pathname?.includes("/ka") ? "ge" : "en";

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [slidersRes, projectsRes] = await Promise.all([
          fetch("/api/sliders", {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }),
          fetch(`/api/projects?t=${new Date().getTime()}`, {
            cache: "no-store",
            headers: {
              "Cache-Control": "no-cache",
            },
          }),
        ]);

        const [slidersData, projectsData] = await Promise.all([
          slidersRes.json(),
          projectsRes.json(),
        ]);

        const slidersResult =
          slidersData.status === "success" ? slidersData.data : [];

        setData({
          sliders: slidersResult,
          projects: projectsData.status === "success" ? projectsData.data : [],
        });

        if (slidersResult.length > 0) {
          setBgImage(
            slidersResult[0]?.image_url ||
              "/assets/imgs/page/homepage5/banner.png"
          );
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Update background image when active slide changes
  useEffect(() => {
    if (data.sliders.length > 0 && activeIndex < data.sliders.length) {
      setBgImage(
        data.sliders[activeIndex]?.image_url ||
          "/assets/imgs/page/homepage5/banner.png"
      );
    }
  }, [activeIndex, data.sliders]);

  if (!mounted) return null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <section className="section banner-home5">
      <div className="box-banner-homepage-2">
        <div
          className="box-cover-image cursor-pointer"
          suppressHydrationWarning
          style={{
            backgroundImage: `url(${bgImage})`,
            transition: "background-image 0.6s ease-in-out",
            backgroundPosition: "center",
            backgroundSize: "cover",
          }}
        />
        <div className="box-banner-info">
          <div className="box-swiper">
            {data.sliders.length > 0 && (
              <>
                <Swiper
                  {...baseSettings}
                  slidesPerView={1}
                  loop={data.sliders.length > 1}
                  onSlideChange={(swiper) => setActiveIndex(swiper.realIndex)}
                  className="swiper-container swiper-banner-1 pb-0 cursor-pointer"
                  grabCursor={true}
                >
                  {data.sliders.map((slider) => (
                    <SwiperSlide key={slider.id} className="swiper-slide">
                      <div className="mx-auto cursor-pointer">
                        <h1 className="heading-52-medium color-white wow fadeInUp text-2xl md:text-3xl lg:text-6xl xl:text-6xl">
                          {currentLang === "ge"
                            ? slider.title_ge
                            : slider.title_en}
                        </h1>
                        {slider.description_ge && (
                          <p className="text-base md:text-lg color-white mt-4 max-w-2xl">
                            {currentLang === "ge"
                              ? slider.description_ge
                              : slider.description_en}
                          </p>
                        )}
                      </div>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </>
            )}
          </div>
        </div>
        <div className="box-services-banner">
          <div className="container-sub px-4 md:px-8"></div>
        </div>
        <div className="absolute bottom-0 right-0 z-10">
          <Image
            src={LeftomBottomShape}
            alt="Bottom shape"
            width={500}
            height={400}
            className="h-auto md:w-[500px] sm:w-[300px] w-[200px] transform-none"
            priority
          />
        </div>
      </div>
    </section>
  );
}
