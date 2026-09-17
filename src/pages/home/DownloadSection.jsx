export default function DownloadSection() {
  return (
    <section className="py-20 bg-ink-900 relative overflow-hidden">
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl" />
      </div>
      <div className="relative max-w-4xl mx-auto px-4 text-center">
        <p className="section-label text-brand-400 mb-3">Mobile App</p>
        <h2 className="font-display font-bold text-3xl sm:text-5xl text-white mb-5">
          Ride smarter, anytime
        </h2>
        <p className="text-ink-400 mb-10 max-w-lg mx-auto">
          Download the RideMate app and get your first ride free. Available on iOS and Android.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="#" className="inline-flex items-center gap-3 bg-white text-ink-900 px-6 py-3.5 rounded-2xl font-semibold hover:bg-ink-50 transition-colors">
            <span className="text-2xl">🍎</span>
            <div className="text-left">
              <p className="text-xs text-ink-400 leading-none">Download on the</p>
              <p className="font-bold text-sm">App Store</p>
            </div>
          </a>
          <a href="#" className="inline-flex items-center gap-3 bg-white text-ink-900 px-6 py-3.5 rounded-2xl font-semibold hover:bg-ink-50 transition-colors">
            <span className="text-2xl">🤖</span>
            <div className="text-left">
              <p className="text-xs text-ink-400 leading-none">Get it on</p>
              <p className="font-bold text-sm">Google Play</p>
            </div>
          </a>
        </div>
      </div>
    </section>
  )
}
