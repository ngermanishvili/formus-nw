"use client";

import { useParams } from "next/navigation";
import Footer5 from "@/components/footers/Footer5";
import Header5 from "@/components/headers/Header5";
import Partners from "@/components/common/partners/Partners";
import Blogs from "@/components/homes/home-5/Blogs";
import Cities from "@/components/homes/home-5/Cities";
import Faq from "@/components/homes/home-5/Faq";
import Feet from "@/components/homes/home-5/Feet";
import Hero from "@/components/homes/home-5/Hero";
import Service from "@/components/homes/home-5/Service";
import MobailHeader1 from "@/components/headers/MobailHeader1";
import DownloadApp from "@/components/common/downloadApp/DownloadApp";
import HeroOrtachala from "@/components/homes/home-5/hero-ortachala";
import HeroSectionContent from "@/components/ortachala/hero-content";
import FaqLeft from "@/components/ortachala/hero-content-faq";
import GreenSection from "@/components/ortachala/3d-photo";
import Footer1 from "@/components/footers/Footer1";

export default function Page() {
  const params = useParams();
  const projectId = params.id;

  return (
    <>
      <Header5 /> <MobailHeader1 />
      <main className="main" style={{ maxWidth: "100vw", overflow: "hidden" }}>
        <HeroOrtachala />
        <div className="border-bottom"></div>
        <HeroSectionContent />
        <FaqLeft />
        {projectId === "1" && <GreenSection />}
        <DownloadApp />
      </main>
      <Footer1 />
    </>
  );
}
