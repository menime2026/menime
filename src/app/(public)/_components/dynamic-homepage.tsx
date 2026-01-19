import { prisma } from "@/lib/db";
import HomeCarousel from "./home-carousel";
import ShopByCategory from "./shop-by-category";
import NewArrivals from "./new-arrival-page";
import PromoBanner from "./promo-banner";
import VideoBanner from "./video-banner";
import CuratedForYou from "./curated-for-you";
import TrendingNow from "./trending-now";
import TheEdit from "./the-edit";
import EditorialSection from "./editorial-section";
import {
  HeroSectionContent,
  CategorySectionContent,
  PromoSectionContent,
  VideoSectionContent,
  NewArrivalsSectionContent,
  CuratedSectionContent,
  TrendingNowSectionContent,
  TheEditSectionContent,
  EditorialSectionContent,
} from "@/lib/storefront/types";

export default async function DynamicHomepage() {
  let elements;
  try {
    elements = await prisma.homePageElement.findMany({
      where: { isActive: true },
      orderBy: { order: "asc" },
    });
  } catch (error) {
    console.error("Failed to fetch homepage elements:", error);
    return <StaticHomepage />;
  }

  return (
    <div className="flex flex-col gap-24 pb-20">
      {elements.map((element: { id: string; sectionType: string; content: unknown }) => {
        const content = element.content as any;

        switch (element.sectionType) {
          case "HERO":
            return (
              <HomeCarousel
                key={element.id}
                slides={(content as HeroSectionContent).slides}
              />
            );
          case "CATEGORY":
            return (
              <ShopByCategory
                key={element.id}
                categories={(content as CategorySectionContent).categories}
              />
            );
          case "NEW_ARRIVALS":
            return (
              <NewArrivals
                key={element.id}
                items={(content as NewArrivalsSectionContent).items}
              />
            );
          case "CURATED":
            return (
              <CuratedForYou
                key={element.id}
                items={(content as CuratedSectionContent).curatedItems}
              />
            );
          case "PROMO":
            return (
              <PromoBanner
                key={element.id}
                {...(content as PromoSectionContent)}
              />
            );
          case "TRENDING_NOW":
            return (
              <TrendingNow
                key={element.id}
                items={(content as TrendingNowSectionContent).trendingItems}
              />
            );
          case "THE_EDIT":
            return (
              <TheEdit
                key={element.id}
                items={(content as TheEditSectionContent).editItems}
              />
            );
          case "EDITORIAL":
            return (
              <EditorialSection
                key={element.id}
                items={(content as EditorialSectionContent).editorialItems}
              />
            );
          case "VIDEO_BANNER":
            return (
              <VideoBanner
                key={element.id}
                videos={(content as VideoSectionContent).videos}
              />
            );
          default:
            return null;
        }
      })}
    </div>
  );
}

function StaticHomepage() {
  return (
    <div className="flex flex-col gap-24 pb-20">
      <HomeCarousel />
      <ShopByCategory />
      <NewArrivals />
      <CuratedForYou />
      <PromoBanner />
      <VideoBanner />
    </div>
  );
}
