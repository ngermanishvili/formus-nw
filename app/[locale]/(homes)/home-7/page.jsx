import Footer7 from "@/components/footers/Footer7";
import Header7 from "@/components/headers/Header7";
import MobailHeader1 from "@/components/headers/MobailHeader1";
import Blogs from "@/components/homes/common/blogs/Blogs";
import Cities from "@/components/homes/common/cities/Cities";
import Partners from "@/components/homes/common/partners/Partners2";
import DownloadApp from "@/components/homes/home-7/DownloadApp";

import Features from "@/components/homes/home-7/Features";
import Hero from "@/components/homes/home-7/Hero";
import Process from "@/components/homes/home-7/Process";
import Services from "@/components/homes/home-7/Services";
import Services2 from "@/components/homes/home-7/Services2";
import Testimonials from "@/components/homes/home-7/Testimonials";
export const metadata = {
  title: "FORMUS | ფორმუსი - სამშენებლო კომპანია ",
  description:
    "ფორმუსი სამშენებლო კომპანია, რომელიც გთავაზობთ სრულყოფილ სამშენებლო მომსახურებას და სამშენებლო პროექტებს სრულყოფილი სამშენებლო მომსახურების სფეროში.",
};

export default function page() {
  return (
    <>
      <Header7 /> <MobailHeader1 />
      <main className="main">
        <Hero />
        <Process />
        <Services />
        <Cities />
        <Services2 />
        <Testimonials />
        <Features />
        <Blogs />
        <Partners />
        <DownloadApp />
      </main>
      <Footer7 />
    </>
  );
}
