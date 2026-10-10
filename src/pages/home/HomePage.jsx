import HeroSection from './HeroSection'
import FeaturesSection from './FeaturesSection'
import SharedRideSection from './SharedRideSection'
import VehicleSection from './VehicleSection'
import TestimonialsSection from './TestimonialsSection'
import DownloadSection from './DownloadSection'
import FAQSection from './FAQSection'

export default function HomePage() {
  return (
    <div>
      <HeroSection />
      <FeaturesSection />
      <VehicleSection />
      <SharedRideSection />
      <TestimonialsSection />
      <DownloadSection />
      <FAQSection />
    </div>
  )
}
