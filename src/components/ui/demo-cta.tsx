import { CTASection } from "@/components/ui/cta-with-glow";

export function CTADemo() {
  return (
    <CTASection
      title="Experience the Future of Mental Health"
      action={{
        text: "Get Started Today",
        href: "/register",
        variant: "glow"
      }}
      className="bg-gradient-to-br from-primary-900 to-secondary-900 text-white"
    />
  );
}