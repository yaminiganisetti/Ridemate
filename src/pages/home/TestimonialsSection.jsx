const TESTIMONIALS = [
  { name: 'Priya S.', role: 'Daily commuter, Bangalore', avatar: '👩', rating: 5, text: 'RideMate has completely transformed my daily commute. The shared rides save me so much money every month!' },
  { name: 'Rahul M.', role: 'IT Professional, Hyderabad', avatar: '👨', rating: 5, text: 'Drivers are always on time and the app is super clean. Best ride-booking experience I\'ve had in India.' },
  { name: 'Ananya K.', role: 'Student, Chennai', avatar: '🧑', rating: 5, text: 'The bike booking is incredibly fast and affordable. Perfect for getting to college every day without burning a hole in my pocket.' },
]

export default function TestimonialsSection() {
  return (
    <section className="py-20 bg-ink-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <p className="section-label mb-3">Testimonials</p>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-ink-900">Loved by millions</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, role, avatar, rating, text }) => (
            <div key={name} className="card">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: rating }).map((_, i) => (
                  <span key={i} className="text-brand-400 text-base">★</span>
                ))}
              </div>
              <p className="text-ink-600 text-sm leading-relaxed mb-5">"{text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-brand-100 rounded-full flex items-center justify-center text-xl">{avatar}</div>
                <div>
                  <p className="font-semibold text-ink-900 text-sm">{name}</p>
                  <p className="text-ink-400 text-xs">{role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
