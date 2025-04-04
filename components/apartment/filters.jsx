import React, { useState, useCallback, useEffect, useMemo } from "react";
import { ChevronDown, X, Search, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { Link } from "@/src/i18n/routing";

const translations = {
  en: {
    back: "Back",
    block: "Block",
    blocks: "Blocks",
    floor: "Floor",
    floors: "Floors",
    status: "Status",
    search: "Search",
    filter: "Filter",
    filters: "Filters",
    clear: "Clear",
    available: "Available",
    booked: "Booked",
    sold: "Sold",
  },
  ka: {
    back: "← უკან",
    block: "ბლოკი",
    blocks: "ბლოკები",
    floor: "სართული",
    floors: "სართული",
    status: "სტატუსი",
    search: "ძებნა",
    filter: "ფილტრი",
    filters: "ფილტრები",
    clear: "გასუფთავება",
    available: "თავისუფალი",
    booked: "დაჯავშნილი",
    sold: "გაყიდული",
  },
};

const FilterButton = ({ label, children, isActive, isOpen, onToggle }) => {
  return (
    <div className="relative">
      <button
        className={`flex items-center gap-2 px-4 py-2 rounded-lg 
                     border transition-all duration-200
                     ${
                       isActive
                         ? "bg-[#FBB200] border-[#FBB200] text-white"
                         : "bg-transparent border-black/30 text-white hover:border-black"
                     }`}
        onClick={onToggle}
      >
        {label}
        <ChevronDown
          size={16}
          className={`transform transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-white rounded-lg border border-black/30 shadow-xl z-50">
          {children}
        </div>
      )}
    </div>
  );
};

const FloorFilters = (props) => {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = translations[locale];

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);

  const activeFilters = useMemo(
    () => ({
      blocks: searchParams.get("blocks")?.split(",").filter(Boolean) || [],
      floors:
        searchParams.get("floors")?.split(",").map(Number).filter(Boolean) ||
        [],
      statuses: searchParams.get("statuses")?.split(",").filter(Boolean) || [],
    }),
    [searchParams]
  );

  const blockFloors = {
    A: Array.from({ length: 8 }, (_, i) => i + 1),
    B: Array.from({ length: 8 }, (_, i) => i + 1),
    D: Array.from({ length: 15 }, (_, i) => i + 1),
  };
  const allAvailableBlocks = ["A", "B", "D"];

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isDrawerOpen]);

  const updateFiltersInUrl = (newFilters) => {
    const currentParams = new URLSearchParams(searchParams.toString());

    Object.keys(newFilters).forEach((key) => {
      const value = newFilters[key];
      if (Array.isArray(value) && value.length > 0) {
        currentParams.set(key, value.join(","));
      } else if (!Array.isArray(value) && value) {
        currentParams.set(key, value);
      } else {
        currentParams.delete(key);
      }
    });

    const newQuery = currentParams.toString();
    console.log(
      `[FloorFilters] updateFiltersInUrl: Pushing URL: ${pathname}?${newQuery}`
    );
    router.push(`${pathname}?${newQuery}`, { scroll: false });
    setOpenFilter(null);
    setIsDrawerOpen(false);
  };

  const handleFilterToggle = useCallback(
    (type, value) => {
      console.log(
        `[FloorFilters] handleFilterToggle: type=${type}, value=${value}`
      );
      const currentValues = activeFilters[type] || [];
      let newValues;

      if (currentValues.includes(value)) {
        newValues = currentValues.filter((v) => v !== value);
      } else {
        newValues = [...currentValues, value];
      }
      console.log(
        `[FloorFilters] handleFilterToggle: currentValues=${JSON.stringify(
          currentValues
        )}, newValues=${JSON.stringify(newValues)}`
      );

      updateFiltersInUrl({ ...activeFilters, [type]: newValues });
    },
    [activeFilters, updateFiltersInUrl]
  );

  const handleClearFilters = useCallback(() => {
    updateFiltersInUrl({
      blocks: [],
      floors: [],
      statuses: [],
    });
  }, [updateFiltersInUrl]);

  const getAvailableFloors = () => {
    if (activeFilters.blocks.length === 0) return [];
    const maxFloor = Math.max(
      0,
      ...activeFilters.blocks.map((block) => blockFloors[block]?.length || 0)
    );
    return Array.from({ length: maxFloor }, (_, i) => i + 1);
  };

  const activeFiltersCount = Object.values(activeFilters).reduce(
    (count, arr) => count + arr.length,
    0
  );

  const getStatusLabel = (status) => {
    return t[status] || status;
  };

  return (
    <>
      <div className="relative bg-transparent border-white border-black/30 text-white">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href={pathname.includes("/floor") ? "/choose-apartment" : "/"}
              className="items-center gap-2 px-4 py-2 rounded-lg 
            bg-[#FBB200] font-medium
            transition-colors duration-200
            border border-[#FBB200] text-white 
            hidden md:flex"
            >
              <span className="text-black hover:text-black">{t.back}</span>
            </Link>

            <div className="h-6 w-px bg-black/30" />

            <div className="hidden md:flex items-center gap-2">
              <FilterButton
                label={
                  activeFilters.blocks.length > 0
                    ? activeFilters.blocks.length === 1
                      ? `${activeFilters.blocks[0]} ${t.block}`
                      : `${activeFilters.blocks.join(" & ")} ${t.blocks}`
                    : t.block
                }
                isActive={activeFilters.blocks.length > 0}
                isOpen={openFilter === "block"}
                onToggle={() =>
                  setOpenFilter(openFilter === "block" ? null : "block")
                }
              >
                <div className="space-y-1 p-2">
                  {allAvailableBlocks.map((block) => (
                    <label
                      key={`desktop-block-${block}`}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-black/5 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.blocks.includes(block)}
                        className="text-[#FBB200]"
                        onChange={() => handleFilterToggle("blocks", block)}
                      />
                      <span className="text-black">
                        {t.block} {block}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterButton>

              <FilterButton
                label={
                  activeFilters.floors.length > 0
                    ? `${activeFilters.floors.length} ${t.floors}`
                    : t.floor
                }
                isActive={activeFilters.floors.length > 0}
                isOpen={openFilter === "floor"}
                onToggle={() =>
                  setOpenFilter(openFilter === "floor" ? null : "floor")
                }
              >
                <div className="space-y-1 p-2 max-h-60 overflow-y-auto">
                  {getAvailableFloors().map((floor) => (
                    <label
                      key={`desktop-floor-${floor}`}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-black/5 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.floors.includes(floor)}
                        className="text-[#FBB200]"
                        onChange={() => handleFilterToggle("floors", floor)}
                      />
                      <span className="text-black">
                        {floor} {t.floor}
                      </span>
                    </label>
                  ))}
                </div>
              </FilterButton>

              <FilterButton
                label={
                  activeFilters.statuses.length > 0
                    ? activeFilters.statuses
                        .map((status) => getStatusLabel(status))
                        .join(" & ")
                    : t.status
                }
                isActive={activeFilters.statuses.length > 0}
                isOpen={openFilter === "status"}
                onToggle={() =>
                  setOpenFilter(openFilter === "status" ? null : "status")
                }
              >
                <div className="space-y-1 p-2">
                  {[
                    { value: "available", label: t.available },
                    { value: "booked", label: t.booked },
                    { value: "sold", label: t.sold },
                  ].map(({ value, label }) => (
                    <label
                      key={`desktop-status-${value}`}
                      className="flex items-center gap-2 px-2 py-1.5 hover:bg-black/5 rounded cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={activeFilters.statuses.includes(value)}
                        className="text-[#FBB200]"
                        onChange={() => handleFilterToggle("statuses", value)}
                      />
                      <span className="text-black">{label}</span>
                    </label>
                  ))}
                </div>
              </FilterButton>

              {/* Search Button for Desktop */}
              <button
                onClick={() => {
                  const queryParams = new URLSearchParams();
                  if (activeFilters.blocks.length) {
                    queryParams.set("blocks", activeFilters.blocks.join(","));
                  }
                  if (activeFilters.floors.length) {
                    queryParams.set("floors", activeFilters.floors.join(","));
                  }
                  if (activeFilters.statuses.length) {
                    queryParams.set(
                      "statuses",
                      activeFilters.statuses.join(",")
                    );
                  }
                  // Always add available as default status if no status is selected
                  if (!activeFilters.statuses.length) {
                    queryParams.set("statuses", "available");
                  }
                  router.push(
                    `/${locale}/homes-list?${queryParams.toString()}`,
                    { scroll: true }
                  );
                }}
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[#FBB200] hover:bg-[#FBB200]/90 text-black
                         transition-colors duration-200"
                disabled={activeFiltersCount === 0}
              >
                <Search size={18} />
                <span>{t.search}</span>
                {activeFiltersCount > 0 && (
                  <span
                    className="flex items-center justify-center w-5 h-5 text-xs 
                              bg-black text-[#FBB200] rounded-full ml-1"
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              {activeFiltersCount > 0 && (
                <Button
                  variant="ghost"
                  className="relative group px-3 py-2 rounded-lg
                            text-red-500 hover:text-white transition-colors duration-300"
                  onClick={handleClearFilters}
                >
                  <span
                    className="absolute inset-0 bg-red-500/10 group-hover:bg-red-500 
                              transition-colors duration-300 -z-10 rounded-lg"
                  />
                  <Trash2 size={18} />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={`relative p-3 rounded-md bg-[#FBB200] hover:bg-[#FBB200]/90 text-black shadow-xl transition-all duration-200 z-0 md:hidden flex items-center gap-2 mr-1 ${
          pathname.includes("/choose-apartment")
            ? "absolute mt-[64%] left-0"
            : "bottom-6 right-6"
        }`}
      >
        <Search size={20} />
        <span className="font-medium">{t.filter}</span>
        {activeFiltersCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-xs bg-black text-[#FBB200] rounded-full">
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Search Button */}
      <button
        onClick={() => {
          const queryParams = new URLSearchParams();
          if (activeFilters.blocks.length) {
            queryParams.set("blocks", activeFilters.blocks.join(","));
          }
          if (activeFilters.floors.length) {
            queryParams.set("floors", activeFilters.floors.join(","));
          }
          if (activeFilters.statuses.length) {
            queryParams.set("statuses", activeFilters.statuses.join(","));
          }
          // Always add available as default status if no status is selected
          if (!activeFilters.statuses.length) {
            queryParams.set("statuses", "available");
          }
          router.push(`/${locale}/homes-list?${queryParams.toString()}`, {
            scroll: true,
          });
        }}
        className={`relative p-3 rounded-md bg-[#FBB200] hover:bg-[#FBB200]/90 text-black shadow-xl transition-all duration-200 z-0 md:hidden flex items-center gap-2 mr-1 ${
          pathname.includes("/choose-apartment")
            ? "absolute mt-[64%] right-0"
            : "bottom-6 right-6"
        }`}
        disabled={activeFiltersCount === 0}
      >
        <Search size={20} />
        <span className="font-medium">{t.search}</span>
      </button>

      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 mt-[150px]"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-900 z-50 transform transition-all duration-300 ease-out p-4 flex flex-col">
            <div className="flex justify-between items-center mb-6 mt-[70px]">
              <h2 className="text-xl font-semibold text-white">{t.filters}</h2>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => setIsDrawerOpen(false)}
              >
                <X size={30} />
              </Button>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pb-20">
              <div>
                <h3 className="text-white/90 mb-3">{t.block}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {allAvailableBlocks.map((block) => (
                    <button
                      key={`mobile-block-${block}`}
                      onClick={() => handleFilterToggle("blocks", block)}
                      className={`p-3 rounded-lg text-center font-medium ${
                        activeFilters.blocks.includes(block)
                          ? "bg-[#FBB200] text-white"
                          : "bg-white/10 text-white/90"
                      }`}
                    >
                      {t.block} {block}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white/90 mb-3">{t.floor}</h3>
                <div className="grid grid-cols-4 gap-2">
                  {getAvailableFloors().map((floor) => (
                    <button
                      key={`mobile-floor-${floor}`}
                      onClick={() => handleFilterToggle("floors", floor)}
                      className={`p-3 rounded-lg text-center font-medium ${
                        activeFilters.floors.includes(floor)
                          ? "bg-[#FBB200] text-white"
                          : "bg-black/20 text-white/90"
                      }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-white/90 mb-3">{t.status}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "available", label: t.available },
                    { value: "booked", label: t.booked },
                    { value: "sold", label: t.sold },
                  ].map(({ value, label }) => (
                    <button
                      key={`mobile-status-${value}`}
                      onClick={() => handleFilterToggle("statuses", value)}
                      className={`p-3 rounded-lg text-center font-medium ${
                        activeFilters.statuses.includes(value)
                          ? "bg-[#FBB200] text-white"
                          : "bg-white/10 text-white/90"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-white/10 bg-gray-900">
              <div className="flex gap-2">
                {activeFiltersCount > 0 && (
                  <Button
                    variant="outline"
                    className="flex-1 border-red-500 text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={handleClearFilters}
                  >
                    {t.clear}
                  </Button>
                )}

                {/* Search Button in Drawer */}
                <Button
                  onClick={() => {
                    const queryParams = new URLSearchParams();
                    if (activeFilters.blocks.length) {
                      queryParams.set("blocks", activeFilters.blocks.join(","));
                    }
                    if (activeFilters.floors.length) {
                      queryParams.set("floors", activeFilters.floors.join(","));
                    }
                    if (activeFilters.statuses.length) {
                      queryParams.set(
                        "statuses",
                        activeFilters.statuses.join(",")
                      );
                    }
                    // Always add available as default status if no status is selected
                    if (!activeFilters.statuses.length) {
                      queryParams.set("statuses", "available");
                    }
                    router.push(
                      `/${locale}/homes-list?${queryParams.toString()}`,
                      { scroll: true }
                    );
                  }}
                  className="flex-1 bg-[#FBB200] hover:bg-[#FBB200]/90 text-black"
                  disabled={activeFiltersCount === 0}
                >
                  {t.search}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

const ApartmentFilters = ({ onFilterChange }) => {
  return <FloorFilters onFilterChange={onFilterChange} />;
};

export default ApartmentFilters;
