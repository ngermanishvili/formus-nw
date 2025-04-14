import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";

const translations = {
  ka: {
    project: "პროექტი",
    location: "მდებარეობა",
    area: "ფართი",
    search: "ძებნა",
    ortachalaHills: "ორთაჭალა ჰილსი",
    tbilisi: "თბილისი",
    choose: "არჩევა",
    areaUnit: "მ²",
  },
  en: {
    project: "Project",
    location: "Location",
    area: "Area",
    search: "Search",
    ortachalaHills: "Ortachala Hills",
    tbilisi: "Tbilisi",
    choose: "Choose",
    areaUnit: "m²",
  },
};

export default function SearchForm() {
  const { locale = "ka" } = useParams() || {};
  const router = useRouter();
  const t = translations[locale] || translations.ka;
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);

  const areaUnit = t.areaUnit;

  const areaRanges = [
    { value: "20-40", label: `20-40 ${areaUnit}` },
    { value: "40-60", label: `40-60 ${areaUnit}` },
    { value: "60-80", label: `60-80 ${areaUnit}` },
    { value: "80-100", label: `80-100 ${areaUnit}` },
    { value: "100-120", label: `100-120 ${areaUnit}` },
    { value: "120-150", label: `120-150 ${areaUnit}` },
    { value: "150-1000", label: `>150 ${areaUnit}` },
  ];

  const [searchParams, setSearchParams] = useState({
    project: "",
    location: "tbilisi",
    areaRange: "",
  });

  // Fetch active projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        setIsProjectsLoading(true);
        const timestamp = new Date().getTime();
        // Add cache-busting headers to the fetch request
        const response = await fetch(`/api/projects?t=${timestamp}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
        });

        if (response.ok) {
          const data = await response.json();
          console.log("Projects data:", data);

          if (data && data.data) {
            // ფილტრაცია, რომ მხოლოდ აქტიური პროექტები გამოჩნდეს
            const activeProjects = data.data.filter(
              (project) => project.is_active === true
            );

            console.log("Active projects:", activeProjects);
            setProjects(activeProjects);

            // პირველი აქტიური პროექტის არჩევა, თუ არსებობს
            if (activeProjects.length > 0) {
              setSearchParams((prev) => ({
                ...prev,
                project: activeProjects[0].id.toString(),
              }));
            }
          } else {
            console.error("Invalid projects data format:", data);
            setProjects([]);
          }
        } else {
          console.error(
            "Failed to fetch projects:",
            response.status,
            response.statusText
          );
          setProjects([]);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
        setProjects([]);
      } finally {
        setIsProjectsLoading(false);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  const handleSelect = (value, type) => {
    setSearchParams((prev) => ({ ...prev, [type]: value }));
  };

  const handleSearch = () => {
    // ჯერ შევამოწმოთ, რომ არჩეული პროექტი ნამდვილად არსებობს და აქტიურია
    if (searchParams.project) {
      // ვიპოვოთ არჩეული პროექტი
      const selectedProject = projects.find(
        (p) => p.id.toString() === searchParams.project
      );

      // თუ პროექტი არაა აქტიური, შევირჩიოთ პირველი აქტიური პროექტი
      if (!selectedProject || !selectedProject.is_active) {
        if (projects.length > 0) {
          setSearchParams((prev) => ({
            ...prev,
            project: projects[0].id.toString(),
          }));
          return;
        }
      }

      // შევქმნათ query პარამეტრები
      const params = new URLSearchParams();

      // პირველად დავამატოთ პროექტის ID
      params.set("projects", searchParams.project);

      // შემდეგ დავამატოთ available სტატუსი
      params.set("statuses", "available");

      // დავამატოთ area range თუ არჩეულია
      if (searchParams.areaRange) {
        const [minArea, maxArea] = searchParams.areaRange.split("-");
        params.set("totalAreaMin", minArea);
        params.set("totalAreaMax", maxArea);
      }

      // Use router.push instead of window.location to avoid full page reload
      const url = `/${locale}/homes-list?${params.toString()}`;
      console.log("Navigating to:", url);

      try {
        // Try using router.push first (client-side navigation)
        router.push(url);
      } catch (error) {
        console.error(
          "Router navigation failed, using window.location:",
          error
        );
        window.location.href = url;
      }
    } else {
      // If no project selected, just go to homes-list with available status
      const params = new URLSearchParams();
      params.set("statuses", "available");

      // Add area range if selected
      if (searchParams.areaRange) {
        const [minArea, maxArea] = searchParams.areaRange.split("-");
        params.set("totalAreaMin", minArea);
        params.set("totalAreaMax", maxArea);
      }

      const url = `/${locale}/homes-list?${params.toString()}`;
      console.log("Navigating to:", url);

      try {
        router.push(url);
      } catch (error) {
        console.error(
          "Router navigation failed, using window.location:",
          error
        );
        window.location.href = url;
      }
    }
  };

  return (
    <div className="flex flex-col gap-4 px-4 md:px-6 lg:px-8">
      <div className="flex flex-col md:flex-row w-full">
        <div
          className="w-full backdrop-blur-md bg-white/90 shadow-xl p-4 md:p-6 
                    flex flex-col md:flex-row items-stretch gap-4 md:gap-2 
                    max-w-6xl rounded-t-xl md:rounded-l-xl md:rounded-tr-none"
        >
          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-sm mb-1 text-left">{t.project}</p>
            <Select
              value={searchParams.project}
              onValueChange={(value) => handleSelect(value, "project")}
            >
              <SelectTrigger
                className="h-12 bg-gray-50 border-none rounded-xl 
                                   focus:ring-2 focus:ring-green-400 transition-all text-left"
              >
                <SelectValue
                  placeholder={isProjectsLoading ? "იტვირთება..." : t.choose}
                />
              </SelectTrigger>
              <SelectContent>
                {projects.length > 0 ? (
                  projects.map((project) => (
                    <SelectItem
                      key={project.id}
                      value={project.id?.toString() || `project-${project.id}`}
                    >
                      {locale === "ka"
                        ? project.title_ge
                        : project.title_en || project.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-projects" disabled>
                    {locale === "ka"
                      ? "პროექტები არ არის"
                      : "No projects available"}
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-sm mb-1 text-left">{t.location}</p>
            <Select
              value="tbilisi"
              onValueChange={(value) => handleSelect(value, "location")}
            >
              <SelectTrigger
                className="h-12 bg-gray-50 border-none rounded-xl 
                                   focus:ring-2 focus:ring-green-400 transition-all text-left"
              >
                <SelectValue placeholder={t.tbilisi} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tbilisi">{t.tbilisi}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-gray-500 text-sm mb-1 text-left">{t.area}</p>
            <Select
              value={searchParams.areaRange || "no-area-selected"}
              onValueChange={(value) =>
                handleSelect(
                  value === "no-area-selected" ? "" : value,
                  "areaRange"
                )
              }
            >
              <SelectTrigger
                className="h-12 bg-gray-50 border-none rounded-xl 
                                   focus:ring-2 focus:ring-green-400 transition-all text-left"
              >
                <SelectValue placeholder={t.choose} className="text-left" />
              </SelectTrigger>
              <SelectContent align="start">
                <SelectItem value="no-area-selected" className="text-left">
                  {t.choose}
                </SelectItem>
                {areaRanges.map((range) => (
                  <SelectItem
                    key={range.value || `range-${range.label}`}
                    value={range.value || `range-${range.label}`}
                    className="text-left"
                  >
                    {range.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <button
          onClick={handleSearch}
          className="w-full md:w-[200px] bg-[#FBB200] p-4 md:p-6 
                   flex items-center justify-center gap-2
                   text-center transition-all cursor-pointer
                   hover:bg-[#e6a300] rounded-b-xl md:rounded-r-xl md:rounded-bl-none"
        >
          <Search className="w-5 h-5" />
          <span>{t.search}</span>
        </button>
      </div>
    </div>
  );
}
