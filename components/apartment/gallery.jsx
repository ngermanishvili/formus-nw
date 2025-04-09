"use client";

import React, { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { CldImage } from "next-cloudinary";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const GalleryGrid = () => {
  const [loading, setLoading] = useState(true);
  const [galleryPhotos, setGalleryPhotos] = useState([]);
  const router = useRouter();

  // Load all gallery photos
  useEffect(() => {
    const fetchGalleryPhotos = async () => {
      try {
        setLoading(true);
        const timestamp = new Date().getTime();
        const response = await fetch(`/api/gallery-photos?t=${timestamp}`);
        const result = await response.json();

        if (result.status === "success") {
          // Get all active photos sorted by display order, limit to 12
          const photos = result.data
            .filter((photo) => photo.is_active)
            .sort((a, b) => a.display_order - b.display_order)
            .slice(0, 12); // Limit to maximum 12 photos

          setGalleryPhotos(photos);
        }
      } catch (error) {
        console.error("Error fetching gallery photos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryPhotos();
  }, []);

  // Handle click on an image to navigate to its project
  const handleImageClick = (image) => {
    router.push(image.project_link);
  };

  return (
    <div className="mx-auto py-24">
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : galleryPhotos.length === 0 ? (
        <div className="flex justify-center items-center h-64">
          <p>No photos available</p>
        </div>
      ) : (
        <div className="gallery-swiper-container">
          <style jsx global>{`
            .gallery-swiper .swiper-button-next,
            .gallery-swiper .swiper-button-prev {
              color: white !important;
              background: rgba(0, 0, 0, 0.3);
              width: 40px;
              height: 40px;
              border-radius: 50%;
              display: flex;
              align-items: center;
              justify-content: center;
            }

            .gallery-swiper .swiper-button-next:after,
            .gallery-swiper .swiper-button-prev:after {
              font-size: 18px;
              font-weight: bold;
            }

            .gallery-swiper .swiper-pagination-bullet {
              background: white;
              opacity: 0.7;
            }

            .gallery-swiper .swiper-pagination-bullet-active {
              background: white;
              opacity: 1;
            }
          `}</style>
          <Swiper
            modules={[Navigation, Pagination, Autoplay]}
            spaceBetween={20}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            autoplay={{
              delay: 5000,
              disableOnInteraction: false,
            }}
            breakpoints={{
              640: {
                slidesPerView: 2,
              },
              1024: {
                slidesPerView: 3,
              },
            }}
            className="gallery-swiper"
          >
            {galleryPhotos.map((photo, index) => (
              <SwiperSlide key={photo.id}>
                <div
                  className="relative aspect-video rounded-lg overflow-hidden cursor-pointer group"
                  onClick={() => handleImageClick(photo)}
                >
                  <CldImage
                    src={photo.image_path}
                    alt={photo.title || "Gallery image"}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-20 transition-opacity duration-300" />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      )}
    </div>
  );
};

export default GalleryGrid;
