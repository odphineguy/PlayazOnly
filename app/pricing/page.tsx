import CustomClerkPricing from "@/components/custom-clerk-pricing";

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <section className="bg-muted/50 py-16 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <div className="mb-12 mx-auto max-w-2xl space-y-6 text-center">
              <h1 className="text-center text-4xl font-semibold lg:text-5xl">Pricing that Scales with You</h1>
              <p>Gemini is evolving to be more than just the models. It supports an entire to the APIs and platforms helping developers and businesses innovate.</p>
          </div>
          <CustomClerkPricing />
        </div>
      </section>
    </div>
  );
}
