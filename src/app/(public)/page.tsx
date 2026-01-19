import NewsletterSection from "./_components/newsletter-section";
import FeaturesBar from "./_components/features-bar";
import DynamicHomepage from "./_components/dynamic-homepage";

const HomePage = () => {
  return (
    <main className="flex flex-col gap-24 bg-white pb-0">
      <DynamicHomepage />
      {/* <FeaturesBar /> */}
      <NewsletterSection />
    </main>
  );
};

export default HomePage;
