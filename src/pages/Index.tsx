import Navbar from "@/components/layout/Navbar";
import HeroSection from "@/components/sections/HeroSection";
import AboutSection from "@/components/sections/AboutSection";
import SolutionsSection from "@/components/sections/SolutionsSection";
import DifferentialsSection from "@/components/sections/DifferentialsSection";
import PartnersSection from "@/components/sections/PartnersSection";
import ProjectsSection from "@/components/sections/ProjectsSection";
import InstagramSection from "@/components/sections/InstagramSection";
import CTASection from "@/components/sections/CTASection";
import Footer from "@/components/sections/Footer";

const Index = () => {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <AboutSection />
      <SolutionsSection />
      <DifferentialsSection />
      <PartnersSection />
      <ProjectsSection />
      <InstagramSection />
      <CTASection />
      <Footer />
    </main>
  );
};

export default Index;

