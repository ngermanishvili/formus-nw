// app/[locale]/admin/dashboard/sliders/[id]/edit/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

export default function EditSlider({ params }) {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title_ge: "",
    description_ge: "",
    title_en: "",
    description_en: "",
    image_url: "",
    order_position: 1,
  });

  useEffect(() => {
    fetchSlider();
  }, []);

  const fetchSlider = async () => {
    try {
      const response = await fetch(`/api/sliders/${params.id}`);
      const data = await response.json();

      if (data.status === "success") {
        setFormData(data.data);
      }
    } catch (error) {
      console.error("Error fetching slider:", error);
      toast({
        title: "შეცდომა",
        description: "სლაიდერის ჩატვირთვა ვერ მოხერხდა",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = (result) => {
    setFormData((prev) => ({
      ...prev,
      image_url: result.info.secure_url,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`/api/sliders/${params.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title_ge: formData.title_ge,
          title_en: formData.title_en,
          description_ge: formData.description_ge,
          description_en: formData.description_en,
          image_url: formData.image_url,
          order_position: formData.order_position,
        }),
      });

      if (response.ok) {
        toast({
          title: "წარმატება",
          description: "სლაიდერი განახლდა",
        });
        router.push("/admin/dashboard/sliders");
      }
    } catch (error) {
      console.error("Error updating slider:", error);
      toast({
        title: "შეცდომა",
        description: "სლაიდერის განახლება ვერ მოხერხდა",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            სლაიდერის რედაქტირება
          </h1>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8">
          {/* Image Upload Section */}
          <Card>
            <CardContent className="p-6">
              <Label className="text-base font-semibold mb-4 block">
                სურათი
              </Label>
              <CldUploadWidget
                uploadPreset="formus_test"
                onSuccess={handleUploadSuccess}
              >
                {({ open }) => (
                  <div className="space-y-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => open()}
                      className="w-full h-64 border-dashed"
                    >
                      {formData.image_url ? (
                        <img
                          src={formData.image_url}
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
                  </div>
                )}
              </CldUploadWidget>
            </CardContent>
          </Card>

          {/* Content Section */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-2">
                <Label>სათაური (ქართული)</Label>
                <Input
                  placeholder="შეიყვანეთ სათაური"
                  value={formData.title_ge}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title_ge: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>აღწერა (ქართული)</Label>
                <Textarea
                  placeholder="შეიყვანეთ აღწერა"
                  value={formData.description_ge}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description_ge: e.target.value,
                    }))
                  }
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>სათაური (ENGLISH)</Label>
                <Input
                  placeholder="შეიყვანეთ სათაური"
                  value={formData.title_en}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      title_en: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label>აღწერა (ENGLISH)</Label>
                <Textarea
                  placeholder="შეიყვანეთ აღწერა"
                  value={formData.description_en}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description_en: e.target.value,
                    }))
                  }
                  className="min-h-[100px]"
                />
              </div>

              <div className="space-y-2">
                <Label>პოზიცია</Label>
                <Input
                  type="number"
                  placeholder="მიუთითეთ პოზიცია"
                  value={formData.order_position}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      order_position: parseInt(e.target.value) || 1,
                    }))
                  }
                  min="1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Submit Buttons */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.push("/admin/dashboard/sliders")}
              disabled={saving}
            >
              გაუქმება
            </Button>
            <Button type="submit" disabled={saving} className="min-w-[150px]">
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ინახება...
                </>
              ) : (
                "შენახვა"
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
