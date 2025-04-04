"use client";
import { useState, useEffect, useMemo, useCallback } from "react";
import Link from "next/link";
import { CldImage } from "next-cloudinary";
import { useSearchParams } from "next/navigation";
import FloorFilters from "../apartment/floor-filters";

const ITEMS_PER_PAGE = 12;
const CACHE_TTL = 1000 * 60 * 30; // 30 minutes

const statusConfig = {
  available: { text: "ხელმისაწვდომი", color: "bg-[#a2c080]" },
  sold: { text: "გაყიდული", color: "bg-[#f94011]" },
  reserved: { text: "დაჯავშნილი", color: "bg-yellow-500" },
  default: { text: "უცნობი", color: "bg-gray-500" },
};

const cloudinaryLoader = ({ src, width, quality }) => {
  const params = [
    "f_auto",
    "q_auto",
    "dpr_auto",
    "w_" + width,
    "c_limit",
    "g_auto",
  ];

  // Add caching parameters
  params.push("fl_immutable");
  params.push("fl_lossy");

  if (quality) params.push(`q_${quality}`);

  // Replace YOUR_CLOUD_NAME with the actual cloud name from env variable
  return `https://res.cloudinary.com/ds9dsumwl/image/upload/${params.join(
    ","
  )}/${src}`;
};

export default function ApartmentList() {
  const [apartments, setApartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeView, setActiveView] = useState("3D");
  const [visibleItems, setVisibleItems] = useState(ITEMS_PER_PAGE);
  const searchParams = useSearchParams();

  // Updated filters section in ApartmentList component
  const filters = useMemo(
    () => ({
      projects: searchParams.get("projects")?.split(",").filter(Boolean) || [],
      blocks: searchParams.get("blocks")?.split(",").filter(Boolean) || [],
      floors:
        searchParams.get("floors")?.split(",").map(Number).filter(Boolean) ||
        [],
      statuses: searchParams.get("statuses")?.split(",").filter(Boolean) || [],
      totalArea: {
        min: parseInt(searchParams.get("totalAreaMin")) || 0,
        max: parseInt(searchParams.get("totalAreaMax")) || Infinity,
      },
    }),
    [searchParams]
  );

  // Updated filter function
  const filterApartments = useCallback(
    (apts) => {
      return apts.filter((apt) => {
        // Make sure apt exists and has required properties
        if (!apt) return false;

        const projectMatch =
          !filters.projects ||
          filters.projects.length === 0 ||
          (apt.project_id !== undefined &&
            apt.project_id !== null &&
            filters.projects.includes(String(apt.project_id)));

        // Make block comparison case insensitive - prioritize block_name over block_id
        const blockMatch =
          !filters.blocks ||
          filters.blocks.length === 0 ||
          (apt.block_name &&
            filters.blocks
              .map((b) => b.toUpperCase())
              .includes(apt.block_name.toUpperCase())) ||
          (apt.block_code &&
            filters.blocks
              .map((b) => b.toUpperCase())
              .includes(apt.block_code.toUpperCase()));

        const floorMatch =
          !filters.floors ||
          filters.floors.length === 0 ||
          (apt.floor !== undefined &&
            filters.floors.includes(Number(apt.floor)));

        const statusMatch =
          !filters.statuses ||
          filters.statuses.length === 0 ||
          (apt.status && filters.statuses.includes(apt.status));

        // Add area filter with null checks
        const totalArea = parseFloat(apt.total_area) || 0;
        const areaMatch =
          !filters.totalArea ||
          (totalArea >= (filters.totalArea.min || 0) &&
            totalArea <= (filters.totalArea.max || Infinity));

        return (
          projectMatch && blockMatch && floorMatch && statusMatch && areaMatch
        );
      });
    },
    [filters]
  );

  const filteredApartments = useMemo(
    () => filterApartments(apartments),
    [apartments, filterApartments]
  );

  // --- Log the result AFTER client-side filtering ---
  useEffect(() => {
    console.log(
      "ApartmentList: Result after client-side filtering (filteredApartments):",
      filteredApartments
    );
  }, [filteredApartments]);

  const currentItems = useMemo(
    () => filteredApartments.slice(0, visibleItems),
    [filteredApartments, visibleItems]
  );

  const hasMore = useMemo(
    () => visibleItems < filteredApartments.length,
    [visibleItems, filteredApartments.length]
  );

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Always clear cache when filters change to ensure fresh data
        const cacheKey = "apartments";
        localStorage.removeItem(cacheKey);

        // Clear any other cached data that might interfere
        sessionStorage.removeItem(cacheKey);

        // Force clear other localStorage items that might contain apartment data
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes("apartment") || key.includes("cache"))) {
            localStorage.removeItem(key);
          }
        }

        // Build API URL with all filters
        let apiURL = "/api/apartments";

        // Add filter parameters if they exist
        const params = new URLSearchParams();

        // Include project_id parameter if projects are selected
        if (filters.projects && filters.projects.length > 0) {
          const projectId = filters.projects[0];
          params.append("project_id", projectId);
        }

        // If blocks are specified, add them to query
        if (filters.blocks && filters.blocks.length > 0) {
          // Normalize block values to be A, B, D
          const normalizedBlocks = filters.blocks.map((block) =>
            String(block).trim().toUpperCase()
          );
          params.append("blocks", normalizedBlocks.join(","));
        }

        // If floors are specified, add them to query
        if (filters.floors && filters.floors.length > 0) {
          params.append("floors", filters.floors.join(","));
        }

        // If statuses are specified, add them to query
        if (filters.statuses && filters.statuses.length > 0) {
          params.append("statuses", filters.statuses.join(","));
        }

        // Add total area filters to the query params
        if (filters.totalArea && filters.totalArea.min !== undefined) {
          params.append("totalAreaMin", filters.totalArea.min);
        }

        if (
          filters.totalArea &&
          filters.totalArea.max !== undefined &&
          filters.totalArea.max < Infinity
        ) {
          params.append("totalAreaMax", filters.totalArea.max);
        }

        // If we have parameters, add them to the URL
        if (params.toString()) {
          apiURL += `?${params.toString()}`;
        }

        // Add a unique timestamp to prevent browser caching
        const timestamp = new Date().getTime();
        apiURL += apiURL.includes("?") ? `&_=${timestamp}` : `?_=${timestamp}`;

        // --- Log constructed API URL ---
        console.log("ApartmentList: Fetching data from URL:", apiURL);

        // Use fetch with cache: 'no-store' and appropriate headers
        const res = await fetch(apiURL, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        if (!res.ok) throw new Error("Failed to fetch");

        const { data } = await res.json();

        // --- Log raw data received from API ---
        console.log("ApartmentList: Raw data received from API:", data);

        // Check for any unexpected project IDs
        const uniqueProjectIds = [
          ...new Set(data.map((apt) => apt.project_id)),
        ];

        if (filters.projects && filters.projects.length > 0) {
          const requestedProjectId = filters.projects[0];
          const hasUnexpectedProjects = uniqueProjectIds.some(
            (id) => String(id) !== String(requestedProjectId)
          );

          if (hasUnexpectedProjects) {
            console.warn(
              "Warning: Received apartments from projects we didn't request!",
              {
                requested: requestedProjectId,
                received: uniqueProjectIds,
              }
            );
          }
        }

        // Additional check for block name correctness
        if (data.length > 0 && data[0].block_name) {
        } else if (data.length > 0) {
        }

        // Further block name analysis
        const uniqueBlocks = [
          ...new Set(data.map((apt) => apt.block_name || apt.block_id)),
        ];

        // Example check for apartments in 'D' block
        const dBlockApts = data.filter(
          (apt) =>
            (apt.block_name && apt.block_name.toUpperCase() === "D") ||
            (apt.block_id && apt.block_id.toUpperCase() === "D")
        );

        if (dBlockApts.length > 0) {
          if (dBlockApts[0]) {
          }
        }

        // Check if 'D' block was requested in filters
        if (
          filters.blocks &&
          filters.blocks.map((b) => b.toUpperCase()).includes("D")
        ) {
          if (dBlockApts.length > 0) {
            const sampleD = dBlockApts[0];
          } else {
          }
        } else {
          if (dBlockApts.length > 0) {
          }
        }

        // More detailed check on a sample apartment from D block if available
        if (dBlockApts.length > 0) {
          const sampleD = dBlockApts[0];
          const filterMatch = filterApartments([sampleD]);

          if (filterMatch.length === 0) {
          }
        }

        // If filters for blocks are active, verify the data matches
        if (filters.blocks && filters.blocks.length > 0) {
          const requestedBlocks = filters.blocks.map((b) => b.toUpperCase());
          const hasUnexpectedBlocks = uniqueBlocks.some(
            (block) =>
              block && !requestedBlocks.includes(String(block).toUpperCase())
          );

          if (hasUnexpectedBlocks) {
            console.warn(
              "Warning: Received apartments from blocks we didn't request!",
              {
                requested: requestedBlocks,
                received: uniqueBlocks,
              }
            );
          }
        }

        setApartments(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [filters]);

  if (loading) return <LoadingIndicator />;
  if (error) return <ErrorDisplay message={error} />;

  return (
    <>
      <section className="section pt-16 bg-gray-50 mb-16">
        <div className="container mx-auto px-4 flex justify-center items-center mt-8 md:mt-12 lg:mt-[100px] mb-8">
          <FloorFilters
            initialFilters={filters}
            onSearch={(newFilters) => {
              // Re-fetch data if needed
              if (JSON.stringify(filters) !== JSON.stringify(newFilters)) {
                // Re-fetch will happen automatically thanks to the dependency array in useEffect
                // No need to fetch directly here
              }
            }}
          />
        </div>
        <div className="container mx-auto px-4">
          <HeaderSection
            count={filteredApartments.length}
            activeView={activeView}
            setView={setActiveView}
          />

          {currentItems.length === 0 ? (
            <EmptyState />
          ) : (
            <>
              <ApartmentGrid items={currentItems} activeView={activeView} />
              {hasMore && (
                <LoadMoreButton onClick={() => setVisibleItems((p) => p + 8)} />
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}

const LoadingIndicator = () => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-lg">იტვირთება...</div>
  </div>
);

const ErrorDisplay = ({ message }) => (
  <div className="min-h-[400px] flex items-center justify-center">
    <div className="text-red-500">{message}</div>
  </div>
);

const HeaderSection = ({ count, activeView, setView }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
    <div className="flex items-center gap-4">
      {/* <h2 className="text-2xl font-semibold">ჩვენი ბინები</h2> */}
      <span className="text-sm text-gray-500">ნაპოვნია {count} ბინა</span>
    </div>

    <div className="flex gap-2">
      {["2D", "3D"].map((view) => (
        <button
          key={view}
          onClick={() => setView(view)}
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            activeView === view
              ? "bg-[#00326b] text-white"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          }`}
        >
          {view} ვიზუალი
        </button>
      ))}
    </div>
  </div>
);

const ApartmentGrid = ({ items, activeView }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {items.map((apt, index) => (
      <ApartmentCard
        key={apt.apartment_id}
        apt={apt}
        index={index}
        view={activeView}
      />
    ))}
  </div>
);

const ApartmentCard = ({ apt, index, view }) => {
  const imageUrl = apt[`home_${view.toLowerCase()}`];
  const status = statusConfig[apt.status] || statusConfig.default;

  return (
    <Link
      href={`/apartment/${apt.apartment_id}-${apt.apartment_number}-${apt.floor}`}
      className="bg-white rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
    >
      <div className="relative aspect-video">
        {imageUrl ? (
          <CldImage
            src={imageUrl}
            alt={`ბინა ${apt.apartment_number}`}
            width={800}
            height={600}
            loader={cloudinaryLoader}
            priority={index < 4}
            loading={index < 4 ? "eager" : "lazy"}
            quality={60}
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
            fetchPriority={index < 4 ? "high" : "auto"}
            unoptimized={false}
            placeholder="blur"
            blurDataURL="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiB2aWV3Qm94PSIwIDAgODAwIDYwMCI+PHJlY3Qgd2lkdGg9IjgwMCIgaGVpZ2h0PSI2MDAiIGZpbGw9IiNlMmU4ZjAiLz48L3N2Zz4="
          />
        ) : (
          <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
            <span className="text-gray-400">სურათი არ არის</span>
          </div>
        )}
        <StatusBadge status={status} />
      </div>

      <CardContent apt={apt} />
    </Link>
  );
};

const StatusBadge = ({ status }) => (
  <div
    className={`absolute top-3 right-3 px-3 py-1 rounded-full text-sm ${status.color} text-white`}
  >
    {status.text}
  </div>
);

const CardContent = ({ apt }) => (
  <div className="p-4">
    <div className="flex justify-between items-start mb-2">
      <h3 className="text-lg font-semibold">ბინა {apt.apartment_number}</h3>
      <span className="text-sm font-medium bg-gray-100 px-2 py-1 rounded">
        ბლოკი {apt.block_name}
      </span>
    </div>

    <div className="text-gray-600 space-y-2">
      <InfoRow label="სართული" value={apt.floor} />
      <InfoRow label="ფართი" value={`${apt.total_area} მ²`} />
      {apt.price && <InfoRow label="ფასი" value={`$${apt.price}`} />}
    </div>
  </div>
);

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between">
    <span>{label}</span>
    <span className="font-medium">{value}</span>
  </div>
);

const EmptyState = () => (
  <div className="min-h-[200px] flex flex-col items-center justify-center bg-white rounded-xl shadow p-6 gap-4">
    <div className="text-gray-500">ბინები ვერ მოიძებნა</div>
    <div className="text-sm text-gray-400 text-center">
      გთხოვთ, შეცვალოთ ფილტრის პარამეტრები საძიებლად
    </div>
  </div>
);

const LoadMoreButton = ({ onClick }) => (
  <div className="mt-8 flex justify-center">
    <button
      onClick={onClick}
      className="px-6 py-2 text-white rounded-full bg-[#00326b] transition-colors hover:bg-[#002456]"
    >
      მეტის ნახვა
    </button>
  </div>
);
