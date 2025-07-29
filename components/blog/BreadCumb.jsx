"use client";
import React from "react";
import { useLocale } from "next-intl";

const translations = {
  en: {
    projects: "News",
    decorativeShape: "Decorative shape",
  },
  ka: {
    projects: "სიახლეები",
    decorativeShape: "დეკორატიული ფორმა",
  },
};

export default function BreadCumb() {
  const locale = useLocale();
  const t = translations[locale];

  return (
    <div className="section pt-60 mt-[50px] bg-white relative">
      <div className="container-sub relative">
        <div className="absolute mr-[24px]  top-[20px] transform -translate-y-1/2">
          <img
            src="/assets/shapes/home/2.png"
            alt={t.decorativeShape}
            width={90}
            height={90}
          />
        </div>
        <h1 className="heading-44-medium color-black mb-5 relative z-10">
          {t.projects}
        </h1>
        <div className="box-breadcrumb"></div>
      </div>
    </div>
  );
}
