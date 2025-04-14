import React, { useState, useCallback, useEffect } from "react";
import { ChevronDown, X, Search, Check, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter, usePathname } from "next/navigation";
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
    area: "Area",
    areas: "Areas",
    squareMeters: "m²",
    project: "Project",
    projects: "Projects",
    ortachalaHills: "Ortachala Hills",
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
    area: "ფართი",
    areas: "ფართი",
    squareMeters: "მ²",
    project: "პროექტი",
    projects: "პროექტები",
    ortachalaHills: "ორთაჭალა ჰილსი",
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
                         ? "bg-[#FBB200] border-[#FBB200] text-black"
                         : "bg-transparent border-black/30 text-black hover:border-black"
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

const FloorFilters = ({ initialFilters, onSearch }) => {
  const router = useRouter();
  const pathname = usePathname();
  const locale = useLocale();
  const t = translations[locale];
  const areaRanges = [
    {
      value: "20-40",
      label: pathname === "/ka/homes-list" ? "20-40 მ²" : "20-40 m²",
    },
    {
      value: "40-60",
      label: pathname === "/ka/homes-list" ? "40-60 მ²" : "40-60 m²",
    },
    {
      value: "60-80",
      label: pathname === "/ka/homes-list" ? "60-80 მ²" : "60-80 m²",
    },
    {
      value: "80-100",
      label: pathname === "/ka/homes-list" ? "80-100 მ²" : "80-100 m²",
    },
    {
      value: "100-120",
      label: pathname === "/ka/homes-list" ? "100-120 მ²" : "100-120 m²",
    },
    {
      value: "120-150",
      label: pathname === "/ka/homes-list" ? "120-150 მ²" : "120-150 m²",
    },
    {
      value: "150-1000",
      label: pathname === "/ka/homes-list" ? ">150 მ²" : ">150 m²",
    },
  ];
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [openFilter, setOpenFilter] = useState(null);

  // Initialize with URL params if provided via initialFilters
  const [filters, setFilters] = useState(() => {
    // Use initialFilters if provided, otherwise use the default empty state
    if (initialFilters) {
      // Parse blocks to ensure they are uppercase and normalized
      let blocks = initialFilters.blocks || [];
      if (typeof blocks === "string") {
        blocks = [blocks.toUpperCase()];
      } else if (Array.isArray(blocks)) {
        blocks = blocks.map((b) => String(b).toUpperCase());
      }

      // Parse projects
      let projects = initialFilters.projects || [];
      if (projects.length > 0) {
      }

      const result = {
        projects: initialFilters.projects || [],
        floors: initialFilters.floors || [],
        statuses: initialFilters.statuses || [],
        blocks: blocks,
        areas: initialFilters.areas || [],
      };

      return result;
    }

    return {
      projects: [],
      floors: [],
      statuses: [],
      blocks: [],
      areas: [],
    };
  });

  const [projects, setProjects] = useState([]);
  const [availableBlocks, setAvailableBlocks] = useState([
    { id: "A", name: "A ბლოკი", block_code: "A" },
    { id: "B", name: "B ბლოკი", block_code: "B" },
    { id: "D", name: "D ბლოკი", block_code: "D" },
  ]);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsLoading(true);
        const timestamp = new Date().getTime();
        const response = await fetch(
          `/api/projects?isActive=true&t=${timestamp}`
        );
        if (response.ok) {
          const { data } = await response.json();
          setProjects(data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };

    fetchProjects();
  }, []);

  // Fetch blocks for selected project
  useEffect(() => {
    const fetchBlocks = async () => {
      try {
        if (filters.projects.length === 0) {
          // If no project selected, use default blocks with block_code
          setAvailableBlocks([
            { id: "A", name: "A ბლოკი", block_code: "A" },
            { id: "B", name: "B ბლოკი", block_code: "B" },
            { id: "D", name: "D ბლოკი", block_code: "D" },
          ]);
          // Also reset selected blocks and floors
          setFilters((prev) => ({ ...prev, blocks: [], floors: [] }));
          return;
        }

        const projectId = filters.projects[0];

        // Use building_blocks API with project_id filter to get blocks for this project
        const response = await fetch(
          `/api/building_blocks?project_id=${projectId}`
        );
        if (response.ok) {
          const { data } = await response.json();

          if (data.length > 0) {
            // Create array of objects with ID and name for blocks - use actual name from API
            const blocksWithNames = data.map((block) => ({
              id: block.id,
              name: block.name,
              name_en: block.name_en,
              block_code: block.block_code,
            }));

            setAvailableBlocks(blocksWithNames);

            // If current selected blocks contain blocks that don't belong to this project,
            // filter them out
            setFilters((prev) => {
              const validBlocks = prev.blocks.filter((blockId) =>
                blocksWithNames.some((block) => block.id === blockId)
              );
              if (validBlocks.length !== prev.blocks.length) {
                return {
                  ...prev,
                  blocks: validBlocks,
                };
              }
              return prev;
            });
          } else {
            // No blocks found for this project
            setAvailableBlocks([]);
            setFilters((prev) => ({
              ...prev,
              blocks: [], // Reset blocks if none are available
              floors: [], // Reset floors too
            }));
          }
        }
      } catch (error) {
        console.error("Error fetching blocks:", error);
      }
    };

    fetchBlocks();
  }, [filters.projects]); // Re-run when selected project changes

  // State for total floors per block
  const [blockFloorCounts, setBlockFloorCounts] = useState({});

  // Fetch total floors for available blocks
  useEffect(() => {
    const fetchBuildingDetails = async () => {
      if (availableBlocks.length === 0) {
        setBlockFloorCounts({});
        return;
      }

      try {
        const newBlockFloorCounts = {};
        for (const block of availableBlocks) {
          // Fetch details for each block based on its ID
          const response = await fetch(`/api/building_blocks/${block.id}`);
          if (response.ok) {
            const { data } = await response.json();
            if (data && data.length > 0) {
              const totalFloors = parseInt(data[0].total_floors, 10); // Ensure it's a number
              newBlockFloorCounts[block.id] = isNaN(totalFloors)
                ? 0
                : totalFloors;
            } else {
              newBlockFloorCounts[block.id] = 0; // Default to 0 if not found
            }
          } else {
            newBlockFloorCounts[block.id] = 0; // Default if error
          }
        }
        setBlockFloorCounts(newBlockFloorCounts);
      } catch (error) {
        console.error("Error fetching building details:", error);
        setBlockFloorCounts({}); // Reset on error
      }
    };

    fetchBuildingDetails();
  }, [availableBlocks]); // Re-run when available blocks change

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

  const handleFilterToggle = useCallback((type, value, entireRow = false) => {
    if (type === "areas") {
      setFilters((prev) => {
        const currentValues = prev[type];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        return { ...prev, [type]: newValues };
      });
    } else if (type === "projects") {
      setFilters((prev) => {
        const currentValues = prev[type];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];

        return {
          ...prev,
          [type]: newValues,
        };
      });
    } else if (type === "blocks") {
      setFilters((prev) => {
        const currentBlocks = prev.blocks;
        const newBlocks = currentBlocks.includes(value)
          ? currentBlocks.filter((v) => v !== value)
          : [...currentBlocks, value];

        return { ...prev, blocks: newBlocks, floors: [] };
      });
    } else {
      setFilters((prev) => {
        const currentValues = prev[type];
        const newValues = currentValues.includes(value)
          ? currentValues.filter((v) => v !== value)
          : [...currentValues, value];
        return { ...prev, [type]: newValues };
      });
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      projects: [],
      floors: [],
      statuses: [],
      blocks: [],
      areas: [],
    });
  }, []);

  const handleSearch = () => {
    const queryParams = new URLSearchParams();

    if (filters.projects.length) {
      queryParams.set("projects", filters.projects.join(","));
    }
    if (filters.floors.length) {
      queryParams.set("floors", filters.floors.join(","));
    }
    if (filters.statuses.length) {
      queryParams.set("statuses", filters.statuses.join(","));
    }
    if (filters.blocks.length) {
      // Map selected numeric IDs to their corresponding block_code letters
      const selectedBlockCodes = filters.blocks
        .map((selectedId) => {
          const block = availableBlocks.find((b) => b.id === selectedId);
          // Return the block_code if found, otherwise null (shouldn't happen ideally)
          return block ? block.block_code : null;
        })
        .filter((code) => code !== null); // Filter out any potential nulls

      // Only set the query parameter if we have valid block codes
      if (selectedBlockCodes.length > 0) {
        queryParams.set("blocks", selectedBlockCodes.join(","));
      }
    }
    if (filters.areas.length && filters.areas[0]) {
      const parts = filters.areas[0].split("-");
      if (parts.length === 2) {
        queryParams.set("totalAreaMin", parts[0]);
        queryParams.set("totalAreaMax", parts[1]);
      } else {
        console.warn("Invalid area range format:", filters.areas[0]);
      }
    }

    // Call onSearch prop if provided
    if (typeof onSearch === "function") {
      onSearch(filters);
    }

    // Update the URL with the new search parameters
    const newPath = `${pathname}?${queryParams.toString()}`;
    router.push(newPath, { scroll: false }); // Use shallow routing

    // Close the drawer
    setIsDrawerOpen(false);
  };

  const getAvailableFloors = () => {
    // Helper function to safely get floor count for a block
    const getBlockFloorCount = (blockId) => {
      return blockFloorCounts[blockId] || 0; // Return count (number), default 0
    };

    let maxFloor = 0;

    // If blocks are selected, find the max floor count among selected blocks
    if (filters.blocks.length > 0) {
      maxFloor = Math.max(
        0, // Ensure Math.max doesn't return -Infinity if all counts are 0
        ...filters.blocks.map((blockId) => getBlockFloorCount(blockId))
      );
    }
    // If no blocks selected, find the max floor count among ALL available blocks
    else if (availableBlocks.length > 0) {
      maxFloor = Math.max(
        0,
        ...availableBlocks.map((block) => getBlockFloorCount(block.id))
      );
    } else {
      // Default case if no blocks are available at all (e.g., during initial load)
      maxFloor = 12; // Or some reasonable default
    }

    // If maxFloor is 0 (e.g., API returned 0 or error), return empty or default
    if (maxFloor <= 0) {
      return []; // Or maybe [1] if a single floor should always show?
    }

    // Generate array from 1 to maxFloor
    return Array.from({ length: maxFloor }, (_, i) => i + 1);
  };

  const activeFiltersCount = Object.values(filters).reduce(
    (count, arr) => count + arr.length,
    0
  );

  // Helper to get block name based on current language
  const getBlockName = (block) => {
    if (locale === "en") {
      // For English, use name_en if available, otherwise fallback to "{ID} Block"
      return block.name_en || `${block.id} Block`;
    }
    // For Georgian, use the name field
    return block.name;
  };

  // Helper to get block name from id
  const getBlockNameById = (blockId) => {
    const block = availableBlocks.find((b) => b.id === blockId);
    if (!block) return blockId;
    return getBlockName(block);
  };

  const getStatusLabel = (status) => {
    return t[status] || status;
  };

  return (
    <>
      <div className="relative bg-white border-b border-black/30">
        <div className="max-w-[1400px] mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <Link
              href={pathname.includes("/floor") ? "/choose-apartment" : "/"}
              className=" items-center gap-2 px-4 py-2 rounded-lg
             bg-[#FBB200] font-medium
             transition-colors duration-200
             border border-[#FBB200] text-black hidden sm:block md:hidden lg:block "
            >
              <span className="text-black hover:text-black min-w-[100px]">
                {t.back}
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-2">
              {/* Project Filter Button */}
              {/* <FilterButton
                label={
                  <div className="flex items-center gap-2">
                    <span>{t.project}</span>
                    {filters.projects.length > 0 && (
                      <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#00326b] text-white text-xs">
                        {filters.projects.length}
                      </span>
                    )}
                  </div>
                }
                isActive={filters.projects.length > 0}
                isOpen={openFilter === "projects"}
                onToggle={() =>
                  setOpenFilter(openFilter === "projects" ? null : "projects")
                }
              >
                <div className="p-3 max-h-60 overflow-y-auto">
                  {projects.map((project) => (
                    <div
                      key={project.id}
                      className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-100 px-2 rounded"
                      onClick={() =>
                        handleFilterToggle("projects", project.id.toString())
                      }
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          filters.projects.includes(project.id.toString())
                            ? "bg-[#00326b] border-[#00326b]"
                            : "border-gray-400"
                        }`}
                      >
                        {filters.projects.includes(project.id.toString()) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span>
                        {locale === "ka"
                          ? project.title_ge
                          : project.title_en || project.title_ge}
                      </span>
                    </div>
                  ))}
                </div>
              </FilterButton> */}

              {/* Block Filter Button */}
              <FilterButton
                label={
                  <div className="flex items-center gap-2">
                    <span>{t.block}</span>
                    {filters.blocks.length > 0 && (
                      <>
                        <span className="w-5 h-5 rounded-full flex items-center justify-center bg-[#00326b] text-white text-xs">
                          {filters.blocks.length}
                        </span>
                        <span className="ml-1 text-xs max-w-[80px] truncate">
                          {filters.blocks
                            .map((blockId) => {
                              const block = availableBlocks.find(
                                (b) => b.id === blockId
                              );
                              return block ? getBlockName(block) : blockId;
                            })
                            .join(", ")}
                        </span>
                      </>
                    )}
                  </div>
                }
                isActive={filters.blocks.length > 0}
                isOpen={openFilter === "blocks"}
                onToggle={() =>
                  setOpenFilter(openFilter === "blocks" ? null : "blocks")
                }
              >
                <div className="p-3 max-h-60 overflow-y-auto">
                  {availableBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="flex items-center gap-2 py-1.5 cursor-pointer hover:bg-gray-100 px-2 rounded"
                      onClick={() => handleFilterToggle("blocks", block.id)}
                    >
                      <div
                        className={`w-4 h-4 rounded border flex items-center justify-center ${
                          filters.blocks.includes(block.id)
                            ? "bg-[#00326b] border-[#00326b]"
                            : "border-gray-400"
                        }`}
                      >
                        {filters.blocks.includes(block.id) && (
                          <Check size={12} className="text-white" />
                        )}
                      </div>
                      <span>{getBlockName(block)}</span>
                    </div>
                  ))}
                </div>
              </FilterButton>

              <FilterButton
                label={
                  filters.areas.length > 0
                    ? `${filters.areas[0]} ${t.squareMeters}`
                    : t.area
                }
                isActive={filters.areas.length > 0}
                isOpen={openFilter === "area"}
                onToggle={() =>
                  setOpenFilter(openFilter === "area" ? null : "area")
                }
              >
                <div className="space-y-1">
                  {areaRanges.map((range) => (
                    <label
                      key={range.value}
                      className="flex items-center gap-2 px-2 py-1.5 
                                hover:bg-black/5 rounded cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFilterToggle("areas", range.value, true);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.areas.includes(range.value)}
                        className="text-[#FBB200]"
                        onChange={(e) => {
                          e.stopPropagation();
                          handleFilterToggle("areas", range.value, false);
                        }}
                      />
                      <span className="text-black">{range.label}</span>
                    </label>
                  ))}
                </div>
              </FilterButton>

              <FilterButton
                label={
                  filters.floors.length > 0
                    ? `${filters.floors.length} ${t.floors}`
                    : t.floor
                }
                isActive={filters.floors.length > 0}
                isOpen={openFilter === "floor"}
                onToggle={() =>
                  setOpenFilter(openFilter === "floor" ? null : "floor")
                }
              >
                <div className="space-y-1">
                  {getAvailableFloors().map((floor) => (
                    <label
                      key={floor}
                      className="flex items-center gap-2 px-2 py-1.5 
                                hover:bg-black/5 rounded cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFilterToggle("floors", floor, true);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.floors.includes(floor)}
                        className="text-[#FBB200]"
                        onChange={(e) => {
                          e.stopPropagation();
                          handleFilterToggle("floors", floor, false);
                        }}
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
                  filters.statuses.length > 0
                    ? filters.statuses
                        .map((status) => getStatusLabel(status))
                        .join(" & ")
                    : t.status
                }
                isActive={filters.statuses.length > 0}
                isOpen={openFilter === "status"}
                onToggle={() =>
                  setOpenFilter(openFilter === "status" ? null : "status")
                }
              >
                <div className="space-y-1">
                  {[
                    { value: "available", label: t.available },
                    { value: "booked", label: t.booked },
                    { value: "sold", label: t.sold },
                  ].map(({ value, label }) => (
                    <label
                      key={value}
                      className="flex items-center gap-2 px-2 py-1.5 
                                hover:bg-black/5 rounded cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        handleFilterToggle("statuses", value, true);
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={filters.statuses.includes(value)}
                        className="text-[#FBB200]"
                        onChange={(e) => {
                          e.stopPropagation();
                          handleFilterToggle("statuses", value, false);
                        }}
                      />
                      <span className="text-black">{label}</span>
                    </label>
                  ))}
                </div>
              </FilterButton>

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

              <Button
                className="flex items-center gap-2 px-4 py-2 rounded-lg
                         bg-[#FBB200] hover:bg-[#FBB200]/90 text-black
                         transition-colors duration-200"
                onClick={handleSearch}
                disabled={activeFiltersCount === 0}
              >
                <Search size={18} />
                {t.search}
                {activeFiltersCount > 0 && (
                  <span
                    className="flex items-center justify-center w-5 h-5 text-xs 
                              bg-black text-[#FBB200] rounded-full ml-1"
                  >
                    {activeFiltersCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Filter Button */}
      <button
        onClick={() => setIsDrawerOpen(true)}
        className={`absolute ${
          pathname === "/ka/homes-list" || "/ka/homes-list"
            ? "max-md:top-20"
            : "top-0"
        } 
                  w-[90%] flex justify-center items-center h-[50px] bottom-6 right-6 p-4 
                  rounded-md bg-[#FBB200] hover:bg-[#FBB200]/90 text-black shadow-xl 
                  transition-all duration-200 md:hidden text-center gap-2`}
      >
        <Search size={20} />
        <span className="font-medium">{t.filter}</span>
        {activeFiltersCount > 0 && (
          <span
            className="flex items-center justify-center w-5 h-5 text-xs 
                        bg-black text-[#FBB200] rounded-full"
          >
            {activeFiltersCount}
          </span>
        )}
      </button>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div
            className="fixed inset-y-0 right-0 w-full max-w-md bg-gray-900 
                        z-50 transform transition-all duration-300 ease-out p-4"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-white">{t.filters}</h2>
              <Button
                variant="ghost"
                className="text-white/70 hover:text-white"
                onClick={() => setIsDrawerOpen(false)}
              >
                <X size={24} />
              </Button>
            </div>

            {/* Mobile Filters Content */}
            <div className="space-y-6">
              {/* Projects */}
              <div>
                <h3 className="text-white/90 mb-3">{t.project}</h3>
                {/* <div className="grid grid-cols-2 gap-2">
                  {projects.map((project) => (
                    <button
                      key={project.id}
                      onClick={() =>
                        handleFilterToggle("projects", project.id.toString())
                      }
                      className={`p-3 rounded-lg text-center font-medium
                                ${
                                  filters.projects.includes(
                                    project.id.toString()
                                  )
                                    ? "bg-[#FBB200] text-black"
                                    : "bg-white/10 text-white/90"
                                }`}
                    >
                      {project.title_ge}
                    </button>
                  ))}
                </div> */}
              </div>

              {/* Blocks */}
              <div>
                <h3 className="text-white/90 mb-3">{t.block}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {availableBlocks.map((block) => (
                    <button
                      key={block.id}
                      onClick={() => handleFilterToggle("blocks", block.id)}
                      className={`p-3 rounded-lg text-center font-medium
                                ${
                                  filters.blocks.includes(block.id)
                                    ? "bg-[#FBB200] text-black"
                                    : "bg-white/10 text-white/90"
                                }`}
                      disabled={
                        (block.id === "D" &&
                          filters.blocks.some((b) => b === "A" || b === "B")) ||
                        ((block.id === "A" || block.id === "B") &&
                          filters.blocks.includes("D"))
                      }
                    >
                      {getBlockName(block)}
                    </button>
                  ))}
                </div>
              </div>

              {/* Floors */}
              <div>
                <h3 className="text-white/90 mb-3">{t.floor}</h3>
                <div className="grid grid-cols-4 gap-2">
                  {getAvailableFloors().map((floor) => (
                    <button
                      key={floor}
                      onClick={() => handleFilterToggle("floors", floor)}
                      className={`p-3 rounded-lg text-center font-medium
                                ${
                                  filters.floors.includes(floor)
                                    ? "bg-[#FBB200] text-black"
                                    : "bg-black/20 text-white/90"
                                }`}
                    >
                      {floor}
                    </button>
                  ))}
                </div>
              </div>

              {/* Statuses */}
              <div>
                <h3 className="text-white/90 mb-3">{t.status}</h3>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "available", label: t.available },
                    { value: "booked", label: t.booked },
                    { value: "sold", label: t.sold },
                  ].map(({ value, label }) => (
                    <button
                      key={value}
                      onClick={() => handleFilterToggle("statuses", value)}
                      className={`p-3 rounded-lg text-center font-medium
                                ${
                                  filters.statuses.includes(value)
                                    ? "bg-[#FBB200] text-black"
                                    : "bg-white/10 text-white/90"
                                }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Add Area filter section for mobile */}
            <div>
              <h3 className="text-white/90 mb-3">{t.area}</h3>
              <div className="grid grid-cols-2 gap-2">
                {areaRanges.map((range) => (
                  <button
                    key={range.value}
                    onClick={() => handleFilterToggle("areas", range.value)}
                    className={`p-3 rounded-lg text-center font-medium
                                ${
                                  filters.areas.includes(range.value)
                                    ? "bg-[#FBB200] text-black"
                                    : "bg-white/10 text-white/90"
                                }`}
                  >
                    {range.label}
                  </button>
                ))}
              </div>
            </div>
            {/* Mobile Action Buttons */}
            <div
              className="absolute bottom-0 left-0 right-0 p-4 
                          border-t border-white/10 bg-gray-900"
            >
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
                <Button
                  className="flex-1 bg-[#FBB200] hover:bg-[#FBB200]/90 text-black"
                  onClick={handleSearch}
                  disabled={activeFiltersCount === 0}
                >
                  <Search size={18} className="mr-2" />
                  {t.search}
                  {activeFiltersCount > 0 && (
                    <span
                      className="ml-1 flex items-center justify-center w-5 h-5 
                                   bg-black text-[#FBB200] rounded-full"
                    >
                      {activeFiltersCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default FloorFilters;
