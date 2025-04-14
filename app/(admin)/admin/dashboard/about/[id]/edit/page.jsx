"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import { CldUploadWidget } from "next-cloudinary";
import { ImagePlus } from "lucide-react";

// სურათის ატვირთვის კომპონენტი
const ImageUpload = ({ value, onChange }) => {
  const handleSuccess = (result) => {
    console.log("Image upload success:", result);
    if (result?.info?.secure_url) {
      onChange(result.info.secure_url);
    } else {
      console.error("No secure_url found in upload result", result);
      toast.error("სურათის ატვირთვა ვერ მოხერხდა - URL არ მოიძებნა");
    }
  };

  const handleError = (error) => {
    console.error("Image upload error:", error);
    toast.error("სურათის ატვირთვისას დაფიქსირდა შეცდომა");
  };

  return (
    <Card>
      <CardContent className="p-6">
        <Label className="text-base font-semibold mb-4 block">სურათი</Label>
        <CldUploadWidget
          uploadPreset="formus_test"
          onSuccess={handleSuccess}
          onError={handleError}
          options={{
            maxFiles: 1,
            resourceType: "image",
          }}
        >
          {({ open }) => (
            <div className="space-y-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => open()}
                className="w-full h-64 border-dashed"
              >
                {value ? (
                  <img
                    src={value}
                    alt="Preview"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center">
                    <ImagePlus className="h-8 w-8 mb-2 text-gray-400" />
                    <span className="text-sm text-gray-500">
                      აირჩიეთ ან ჩააგდეთ სურათი
                    </span>
                  </div>
                )}
              </Button>
              {value && (
                <p className="text-xs text-gray-500 break-all">
                  Current image URL: {value}
                </p>
              )}
            </div>
          )}
        </CldUploadWidget>
      </CardContent>
    </Card>
  );
};

export default function EditAbout({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);
  const [formData, setFormData] = useState({
    title_ge: "",
    title_en: "",
    description_ge: "",
    description_en: "",
    image_url: "",
    map_url: "",
    address_ge: "",
    address_en: "",
    phone: "",
    email: "",
  });

  useEffect(() => {
    const fetchContent = async () => {
      setFetchLoading(true);
      try {
        console.log("Fetching about data for ID:", params.id);
        const res = await fetch(`/api/about/${params.id}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        });

        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }

        const data = await res.json();
        console.log("Fetched about data:", data);

        if (data.status === "success" && data.data) {
          setFormData({
            title_ge: data.data.title_ge || "",
            title_en: data.data.title_en || "",
            description_ge: data.data.description_ge || "",
            description_en: data.data.description_en || "",
            image_url: data.data.image_url || "",
            map_url: data.data.map_url || "",
            address_ge: data.data.address_ge || "",
            address_en: data.data.address_en || "",
            phone: data.data.phone || "",
            email: data.data.email || "",
          });
        } else {
          toast.error("მონაცემების ჩატვირთვისას დაფიქსირდა შეცდომა");
        }
      } catch (error) {
        console.error("Error fetching about data:", error);
        toast.error(
          `მონაცემების ჩატვირთვისას დაფიქსირდა შეცდომა: ${error.message}`
        );
      } finally {
        setFetchLoading(false);
      }
    };

    fetchContent();
  }, [params.id]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log("Submitting about data:", formData);

      const res = await fetch(`/api/about/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
        body: JSON.stringify(formData),
      });

      // Log the raw response for debugging
      console.log("Response status:", res.status);

      const data = await res.json();
      console.log("Response data:", data);

      if (data.status === "success") {
        toast.success("ინფორმაცია წარმატებით განახლდა");
        router.push("/admin/dashboard/about");
        router.refresh();
      } else {
        toast.error(data.message || "განახლებისას დაფიქსირდა შეცდომა");
      }
    } catch (error) {
      console.error("Error updating about data:", error);
      toast.error(`განახლებისას დაფიქსირდა შეცდომა: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (fetchLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">მონაცემები იტვირთება...</span>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card className="max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">
            ინფორმაციის რედაქტირება
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <ImageUpload
              value={formData.image_url}
              onChange={(url) => {
                console.log("Image URL updated:", url);
                setFormData({ ...formData, image_url: url });
              }}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium mb-1">
                  სათაური (ქართ.)
                </Label>
                <Input
                  value={formData.title_ge}
                  onChange={(e) =>
                    setFormData({ ...formData, title_ge: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">
                  სათაური (ინგლ.)
                </Label>
                <Input
                  value={formData.title_en}
                  onChange={(e) =>
                    setFormData({ ...formData, title_en: e.target.value })
                  }
                  required
                />
              </div>
              <div className="md:col-span-2">
                <Label className="block text-sm font-medium mb-1">
                  აღწერა (ქართ.)
                </Label>
                <Textarea
                  value={formData.description_ge}
                  onChange={(e) =>
                    setFormData({ ...formData, description_ge: e.target.value })
                  }
                  required
                  rows={4}
                />
              </div>
              <div className="md:col-span-2">
                <Label className="block text-sm font-medium mb-1">
                  აღწერა (ინგლ.)
                </Label>
                <Textarea
                  value={formData.description_en}
                  onChange={(e) =>
                    setFormData({ ...formData, description_en: e.target.value })
                  }
                  required
                  rows={4}
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">
                  რუკის URL
                </Label>
                <Input
                  value={formData.map_url}
                  onChange={(e) =>
                    setFormData({ ...formData, map_url: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">
                  ტელეფონი
                </Label>
                <Input
                  value={formData.phone}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">
                  მისამართი (ქართ.)
                </Label>
                <Input
                  value={formData.address_ge}
                  onChange={(e) =>
                    setFormData({ ...formData, address_ge: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">
                  მისამართი (ინგლ.)
                </Label>
                <Input
                  value={formData.address_en}
                  onChange={(e) =>
                    setFormData({ ...formData, address_en: e.target.value })
                  }
                />
              </div>
              <div>
                <Label className="block text-sm font-medium mb-1">
                  ელ-ფოსტა
                </Label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                type="submit"
                disabled={loading}
                className="min-w-[150px]"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    იტვირთება...
                  </>
                ) : (
                  "შენახვა"
                )}
              </Button>

              <Button
                type="button"
                variant="outline"
                onClick={() => router.push("/admin/dashboard/about")}
              >
                გაუქმება
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
