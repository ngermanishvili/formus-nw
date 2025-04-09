"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ImagePlus, Loader2, Link as LinkIcon, ArrowLeft } from "lucide-react";

export default function EditGalleryPhoto({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_path: "",
    project_link: "",
    category: "exterior", // We'll keep the category for database compatibility
    display_order: 0,
    is_active: true,
  });

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        // ცადეთ ფოტოს ჩატვირთვა, cache-ის გარეშე
        const response = await fetch(`/api/gallery-photos/${params.id}`, {
          cache: "no-store",
          headers: {
            "Cache-Control": "no-cache",
          },
        });

        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }

        const result = await response.json();

        if (result.status === "success" && result.data) {
          // ვრცელი ლოგი დებაგინგისთვის
          setFormData(result.data);
        } else {
          alert("ფოტო ვერ მოიძებნა");
          router.push("/admin/dashboard/gallery-photos");
        }
      } catch (error) {
        console.error("Error fetching gallery photo:", error);
        alert("ფოტოს მოძიებისას დაფიქსირდა შეცდომა: " + error.message);
        router.push("/admin/dashboard/gallery-photos");
      } finally {
        setLoading(false);
      }
    };

    fetchPhoto();
  }, [params.id, router]);

  const handleUploadSuccess = (result) => {
    setFormData((prev) => ({
      ...prev,
      image_path: result.info.secure_url,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const response = await fetch(`/api/gallery-photos/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        alert("ფოტო წარმატებით განახლდა!");
        router.push("/admin/dashboard/gallery-photos");
      } else {
        const errorText = await response.text();
        console.error("Error response:", errorText);

        let errorMessage = "შეცდომა ფოტოს განახლებისას";
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          // თუ JSON პარსინგი ვერ მოხდა, გამოვიყენოთ სტანდარტული შეტყობინება
        }

        alert(errorMessage);
      }
    } catch (error) {
      console.error("Error updating gallery photo:", error);
      alert("შეცდომა ფოტოს განახლებისას: " + error.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title &&
      formData.title.trim() !== "" &&
      formData.image_path &&
      formData.image_path !== "" &&
      formData.project_link &&
      formData.project_link !== ""
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center mb-8">
        <Button variant="ghost" onClick={() => router.back()} className="mr-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          უკან
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            სლაიდერის ფოტოს რედაქტირება
          </h1>
          <p className="text-gray-500 mt-1">შეცვალეთ ფოტოს ინფორმაცია</p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8">
          {/* Image Upload */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-base font-semibold mb-4 block">ფოტო</Label>
              <CldUploadWidget
                uploadPreset="formus_test"
                onSuccess={handleUploadSuccess}
              >
                {({ open }) => (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => open()}
                    className="w-full h-64 border-dashed"
                  >
                    {formData.image_path ? (
                      <img
                        src={formData.image_path}
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
                )}
              </CldUploadWidget>
            </CardContent>
          </Card>

          {/* Content Details */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">სათაური</Label>
                <Input
                  id="title"
                  placeholder="შეიყვანეთ სათაური"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">აღწერა (არასავალდებულო)</Label>
                <Textarea
                  id="description"
                  placeholder="შეიყვანეთ აღწერა"
                  value={formData.description || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="min-h-[100px]"
                />
              </div>

              {/* Project Link */}
              <div className="space-y-2">
                <Label
                  htmlFor="project_link"
                  className="flex items-center gap-1"
                >
                  <LinkIcon className="h-4 w-4" />
                  პროექტის ბმული
                </Label>
                <Input
                  id="project_link"
                  placeholder="შეიყვანეთ პროექტის ბმული"
                  value={formData.project_link}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      project_link: e.target.value,
                    }))
                  }
                />
                <p className="text-xs text-gray-500">
                  მიუთითეთ პროექტის ბმული, რომელზეც გადავა მომხმარებელი ფოტოზე
                  დაჭერისას
                </p>
              </div>

              {/* Display Order */}
              <div className="space-y-2">
                <Label htmlFor="display_order">რიგითობა</Label>
                <Input
                  id="display_order"
                  type="number"
                  placeholder="0"
                  value={formData.display_order}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      display_order: parseInt(e.target.value) || 0,
                    }))
                  }
                />
                <p className="text-xs text-gray-500">
                  დაბალი რიცხვი წინ გამოჩნდება
                </p>
              </div>

              {/* Is Active */}
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="is_active" className="mb-1 block">
                    აქტიურია
                  </Label>
                  <p className="text-xs text-gray-500">
                    გამორთეთ თუ არ გსურთ ამ ფოტოს გამოჩენა სლაიდერში
                  </p>
                </div>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_active: checked,
                    }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              disabled={submitLoading}
            >
              გაუქმება
            </Button>
            <Button
              type="submit"
              disabled={submitLoading || !isFormValid()}
              className="bg-blue-500 hover:bg-blue-600 text-white min-w-[150px]"
            >
              {submitLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  იტვირთება...
                </>
              ) : (
                "განახლება"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
