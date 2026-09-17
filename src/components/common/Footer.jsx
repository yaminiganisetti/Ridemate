import { Link } from 'react-router-dom'
import { Car, Twitter, Instagram, Linkedin, Mail, Phone, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-ink-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-12">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <Car size={18} className="text-white" />
              </div>
              <span className="font-display font-bold text-lg">
                Ride<span className="text-brand-400">Mate</span>
              </span>
            </div>
            <p className="text-ink-400 text-sm leading-relaxed">
              India's smartest ride-booking platform. Book rides, share routes, save money.
            </p>
            <div className="flex gap-3 mt-5">
              {[Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 bg-ink-800 rounded-xl flex items-center justify-center hover:bg-brand-500 transition-colors">
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-white">Company</h4>
            <ul className="space-y-2.5">
              {['About Us', 'Careers', 'Blog', 'Press'].map(l => (
                <li key={l}><a href="#" className="text-ink-400 text-sm hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-white">Services</h4>
            <ul className="space-y-2.5">
              {['Book a Ride', 'Shared Rides', 'Become a Driver', 'Business'].map(l => (
                <li key={l}><a href="#" className="text-ink-400 text-sm hover:text-white transition-colors">{l}</a></li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-white">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2 text-ink-400 text-sm">
                <Mail size={15} className="mt-0.5 shrink-0" />
                <span>hello@ridemate.in</span>
              </li>
              <li className="flex items-start gap-2 text-ink-400 text-sm">
                <Phone size={15} className="mt-0.5 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-start gap-2 text-ink-400 text-sm">
                <MapPin size={15} className="mt-0.5 shrink-0" />
                <span>Bangalore, Karnataka, India</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-ink-800 pt-8 flex flex-col sm:flex-row justify-between gap-4 text-sm text-ink-500">
          <p>© 2024 RideMate. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  )
}
