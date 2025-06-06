// app/(admin)/admin/dashboard/blog/[id]/page.jsx
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ImagePlus, Loader2, Globe, Languages } from "lucide-react";
import { Label } from "@/components/ui/label";

export default function EditBlogPost({ params }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("georgian");
  const [formData, setFormData] = useState({
    title_ge: "",
    title_en: "",
    description_ge: "",
    description_en: "",
    image_url: "",
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const response = await fetch(`/api/blog/${params.id}`);
        const result = await response.json();

        if (result.status === "success" && result.data) {
          setFormData(result.data);
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPost();
  }, [params.id]);

  const handleUploadSuccess = (result) => {
    setFormData((prev) => ({
      ...prev,
      image_url: result.info.secure_url,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitLoading(true);

    try {
      const response = await fetch(`/api/blog/${params.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/dashboard/blog");
      } else {
        throw new Error("Failed to update post");
      }
    } catch (error) {
      console.error("Error updating post:", error);
      alert("Error updating post");
    } finally {
      setSubmitLoading(false);
    }
  };

  const isFormValid = () => {
    return (
      formData.title_ge.trim() !== "" &&
      formData.title_en.trim() !== "" &&
      formData.description_ge.trim() !== "" &&
      formData.description_en.trim() !== "" &&
      formData.image_url !== ""
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            პოსტის რედაქტირება
          </h1>
          <p className="text-gray-500 mt-1">შეცვალეთ ინფორმაცია ორივე ენაზე</p>
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
                      className="w-full h-32 border-dashed"
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

          {/* Content Tabs */}
          <Card>
            <CardContent className="p-6">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2 mb-6">
                  <TabsTrigger
                    value="georgian"
                    className="flex items-center gap-2"
                  >
                    <Globe className="h-4 w-4" />
                    ქართული
                  </TabsTrigger>
                  <TabsTrigger
                    value="english"
                    className="flex items-center gap-2"
                  >
                    <Languages className="h-4 w-4" />
                    English
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="georgian" className="space-y-4">
                  <div className="space-y-2">
                    <Label>სათაური</Label>
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
                    <Label>აღწერა</Label>
                    <Textarea
                      placeholder="შეიყვანეთ აღწერა"
                      value={formData.description_ge}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description_ge: e.target.value,
                        }))
                      }
                      className="min-h-[200px]"
                    />
                  </div>
                </TabsContent>

                <TabsContent value="english" className="space-y-4">
                  <div className="space-y-2">
                    <Label>Title</Label>
                    <Input
                      placeholder="Enter title"
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
                    <Label>Description</Label>
                    <Textarea
                      placeholder="Enter description"
                      value={formData.description_en}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          description_en: e.target.value,
                        }))
                      }
                      className="min-h-[200px]"
                    />
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end gap-4">
            <Button
              variant="outline"
              onClick={() => router.back()}
              disabled={submitLoading}
            >
              გაუქმება
            </Button>
            <Button
              type="submit"
              disabled={submitLoading || !isFormValid()}
              className="min-w-[150px]"
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
