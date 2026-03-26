import HeroSection from "@/components/sections/HeroSection";
import EditorialSplit from "@/components/sections/EditorialSplit";
import ProductGrid from "@/components/sections/ProductGrid";
import BrandStory from "@/components/sections/BrandStory";
import TestimonialSlider from "@/components/sections/TestimonialSlider";
import FeaturedProducts from "@/components/sections/FeaturedProducts";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <EditorialSplit />
      <ProductGrid title="The Spring Collection" />
      <BrandStory />
      <FeaturedProducts />
      <TestimonialSlider />
    </main>
  );
}
