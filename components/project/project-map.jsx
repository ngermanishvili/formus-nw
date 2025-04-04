"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function ProjectMap() {
  const [loading, setLoading] = useState(true);
  const [mapUrl, setMapUrl] = useState(null);
  const pathname = usePathname();

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        // Check if we're on a project page
        const projectIdMatch = pathname.match(/\/projects\/(\d+)/);

        if (projectIdMatch && projectIdMatch[1]) {
          const projectId = projectIdMatch[1];
          const response = await fetch(`/api/projects/${projectId}`);
          const data = await response.json();

          if (data.status === "success" && data.data && data.data.map_url) {
            setMapUrl(data.data.map_url);
          }
        }
      } catch (error) {
        console.error("Error fetching map data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMapData();
  }, [pathname]);

  // Don't render anything if not on a project page or no map URL
  if (!mapUrl || !pathname.includes("/projects/")) {
    return null;
  }

  return (
    <section className="map-section py-8 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-[1200px] mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-center font-firago">
            {pathname.includes("/ka/")
              ? "პროექტის მდებარეობა"
              : "Project Location"}
          </h2>
          {loading ? (
            <div className="flex items-center justify-center h-[400px]">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : (
            <div className="w-full aspect-[16/9] md:aspect-[16/7]">
              <iframe
                src={mapUrl}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="w-full h-full rounded-lg shadow-lg"
              />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
