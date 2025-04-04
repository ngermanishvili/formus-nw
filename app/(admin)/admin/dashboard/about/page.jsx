"use client";

import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { CldUploadWidget } from "next-cloudinary";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Edit, ImagePlus, Loader2 } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

// სურათის ატვირთვის კომპონენტი
const ImageUpload = ({ value, onChange }) => {
  return (
    <Card>
      <CardContent className="p-6">
        <Label className="text-base font-semibold mb-4 block">სურათი</Label>
        <CldUploadWidget
          uploadPreset="formus_test"
          onSuccess={(result) => onChange(result.info.secure_url)}
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
            </div>
          )}
        </CldUploadWidget>
      </CardContent>
    </Card>
  );
};

export default function AboutPage() {
  const [loading, setLoading] = useState(false);
  const [aboutData, setAboutData] = useState([]);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const res = await fetch("/api/about");
      const data = await res.json();
      if (data.status === "success") {
        setAboutData(data.data);
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "შეცდომა",
        description: "მონაცემების ჩატვირთვა ვერ მოხერხდა",
      });
    }
  };

  const handleEdit = (item) => {
    router.push(`/admin/dashboard/about/${item.id}/edit`);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">ჩვენ შესახებ</h1>
      <div className="bg-white rounded-lg shadow">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">სურათი</TableHead>
              <TableHead>სათაური</TableHead>
              <TableHead>აღწერა</TableHead>
              <TableHead className="text-right">მოქმედება</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {aboutData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-10">
                  ინფორმაცია არ მოიძებნა
                </TableCell>
              </TableRow>
            ) : (
              aboutData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>
                    {item.image_url && (
                      <div className="relative w-20 h-20">
                        <Image
                          src={item.image_url}
                          alt={item.title_ge}
                          fill
                          className="object-cover rounded"
                        />
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="font-medium">{item.title_ge}</div>
                      <div className="text-sm text-gray-500">
                        {item.title_en}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="line-clamp-2">{item.description_ge}</div>
                      <div className="text-sm text-gray-500 line-clamp-2">
                        {item.description_en}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(item)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
