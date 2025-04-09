"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { DeleteApartment } from "./DeleteApartment";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// ImageUpload კომპონენტი
const ImageUpload = ({ value, onChange, title }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <Label className="text-base font-semibold">{title}</Label>
          {value && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onChange("")}
              className="text-red-500 hover:text-red-600"
            >
              წაშლა
            </Button>
          )}
        </div>
        <CldUploadWidget
          uploadPreset="formus_test"
          onSuccess={(result) => onChange(result.info.secure_url)}
        >
          {({ open }) => (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => open()}
                className="w-full h-64 border-dashed relative group"
              >
                {value ? (
                  <div className="relative w-full h-full">
                    <img
                      src={value}
                      alt="Preview"
                      className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-white text-sm">შეცვლა</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <ImagePlus className="h-8 w-8 mb-2 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      აირჩიეთ ან ჩააგდეთ სურათი
                    </span>
                  </div>
                )}
              </Button>
            </div>
          )}
        </CldUploadWidget>
      </CardContent>
    </Card>
  );
};

export default function EditApartmentPage({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [apartment, setApartment] = useState(null);
  const [loading, setLoading] = useState(false);
  const [blocks, setBlocks] = useState([]);

  const apartmentStatuses = [
    { value: "available", label: "თავისუფალი" },
    { value: "sold", label: "გაყიდული" },
    { value: "reserved", label: "დაჯავშნილი" },
    { value: "in_progress", label: "მშენებარე" },
  ];

  useEffect(() => {
    const fetchApartment = async () => {
      try {
        const response = await fetch(`/api/apartments/${params.id}`);
        const data = await response.json();
        if (data.status === "success") {
          setApartment(data.data);
          console.log("Apartment data:", data.data);

          // After fetching apartment, fetch blocks for the apartment's project
          const projectId = data.data.project_id || "1"; // Default to project ID 1 if none found
          console.log("Using project ID for blocks:", projectId);
          fetchBlocks(projectId);
        }
      } catch (error) {
        console.error("Error fetching apartment:", error);
        toast({
          variant: "destructive",
          title: "შეცდომა",
          description: "ბინის მონაცემების ჩატვირთვა ვერ მოხერხდა",
        });
      }
    };

    fetchApartment();
  }, [params.id, toast]);

  // When blocks load, check if the apartment's block_id is in the blocks list
  useEffect(() => {
    if (blocks.length > 0 && apartment) {
      console.log("Checking if apartment block exists in blocks list");
      console.log("Apartment block_id:", apartment.block_id);
      console.log(
        "Available blocks:",
        blocks.map((b) => ({ id: b.id, code: b.block_code, name: b.name }))
      );

      // Ensure block_id is never null/undefined/empty
      if (!apartment.block_id || apartment.block_id.trim() === "") {
        console.log("Empty block_id found, setting temporary value");
        setApartment((prev) => ({
          ...prev,
          block_id: "no-block",
        }));
      } else {
        const blockExists = blocks.some(
          (block) => block.block_code === apartment.block_id
        );
        console.log("Block exists in list:", blockExists);
      }
    }
  }, [blocks, apartment]);

  // Function to fetch blocks for a project
  const fetchBlocks = async (projectId) => {
    try {
      console.log(`Fetching blocks for project ID: ${projectId}`);
      const timestamp = new Date().getTime(); // Add timestamp to prevent caching
      const response = await fetch(
        `/api/building_blocks?project_id=${projectId}&t=${timestamp}`
      );

      if (response.ok) {
        const responseData = await response.json();
        console.log("Blocks fetch response:", responseData);

        if (responseData.status === "success" && responseData.data) {
          console.log("Blocks data loaded:", responseData.data);
          setBlocks(responseData.data);
        } else {
          console.error("Error in blocks response:", responseData);
          setBlocks([]);
        }
      } else {
        console.error("Blocks fetch failed with status:", response.status);
        setBlocks([]);
      }
    } catch (error) {
      console.error("Error fetching blocks:", error);
      setBlocks([]);
    }
  };

  const handleUpdateApartment = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch(`/api/apartments/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apartment),
      });

      if (response.ok) {
        toast({
          title: "წარმატება",
          description: "ბინის მონაცემები წარმატებით განახლდა",
        });
        setTimeout(() => {
          router.push("/admin/dashboard");
        }, 2000);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "შეცდომა",
        description: "მონაცემების განახლება ვერ მოხერხდა",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!apartment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="p-6">
      <Card>
        <CardContent className="p-6">
          <h2 className="text-2xl font-bold mb-6">ბინის რედაქტირება</h2>
          <form onSubmit={handleUpdateApartment} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">ბინის ნომერი</label>
                <Input
                  type="text"
                  value={apartment.apartment_number}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      apartment_number: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">სართული</label>
                <Input
                  type="number"
                  value={apartment.floor}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      floor: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ბლოკი</label>
                <Select
                  value={apartment.block_id || "no-block"}
                  onValueChange={(value) => {
                    console.log("Block selection changed to:", value);
                    setApartment({
                      ...apartment,
                      block_id: value === "no-block" ? "" : value,
                    });
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ ბლოკი" />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Include current block if it's not in the blocks list */}
                    {apartment.block_id &&
                      apartment.block_id.trim() !== "" &&
                      !blocks.some(
                        (block) =>
                          (block.block_code || "") === apartment.block_id
                      ) && (
                        <SelectItem
                          key="current-block"
                          value={apartment.block_id}
                        >
                          ბლოკი {apartment.block_id} (მიმდინარე)
                        </SelectItem>
                      )}

                    {/* Display all available blocks */}
                    {blocks
                      .filter(
                        (block) =>
                          block.block_code && block.block_code.trim() !== ""
                      )
                      .map((block) => (
                        <SelectItem
                          key={block.id || `block-${block.block_code}`}
                          value={block.block_code || `fallback-${block.id}`}
                        >
                          ბლოკი {block.name || block.block_code || "უცნობი"}
                        </SelectItem>
                      ))}

                    {/* Show an option if no blocks or no current block */}
                    {(!blocks ||
                      blocks.length === 0 ||
                      (!apartment.block_id && blocks.length === 0)) && (
                      <SelectItem value="no-block">აირჩიეთ ბლოკი</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">სტატუსი</label>
                <Select
                  value={apartment.status}
                  onValueChange={(value) =>
                    setApartment({
                      ...apartment,
                      status: value,
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="აირჩიეთ სტატუსი" />
                  </SelectTrigger>
                  <SelectContent>
                    {apartmentStatuses.map((status) => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">საერთო ფართი (მ²)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={apartment.total_area}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      total_area: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">სტუდიო (მ²)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={apartment.studio_area}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      studio_area: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">საძინებელი 1 (მ²)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={apartment.bedroom_area}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      bedroom_area: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">საძინებელი 2 (მ²)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={apartment.bedroom2_area}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      bedroom2_area: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">აბაზანა 1 (მ²)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={apartment.bathroom_area}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      bathroom_area: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">აბაზანა 2 (მ²)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={apartment.bathroom2_area}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      bathroom2_area: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">მისაღები (მ²)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={apartment.living_room_area}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      living_room_area: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">აივანი 1 (მ²)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={apartment.balcony_area}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      balcony_area: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">აივანი 2 (მ²)</label>
                <Input
                  type="number"
                  step="0.01"
                  value={apartment.balcony2_area}
                  onChange={(e) =>
                    setApartment({
                      ...apartment,
                      balcony2_area: e.target.value,
                    })
                  }
                />
              </div>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">ბინის ვიზუალები</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <ImageUpload
                  title="2D სურათი"
                  value={apartment.home_2d}
                  onChange={(url) =>
                    setApartment((prevState) => ({
                      ...prevState,
                      home_2d: url,
                    }))
                  }
                />
                <ImageUpload
                  title="3D სურათი"
                  value={apartment.home_3d}
                  onChange={(url) =>
                    setApartment((prevState) => ({
                      ...prevState,
                      home_3d: url,
                    }))
                  }
                />
              </div>
            </div>
            <DeleteApartment apartmentId={params.id} />
            <Button type="submit" loading={loading}>
              განახლება
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
