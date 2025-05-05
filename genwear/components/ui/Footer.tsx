import Link from 'next/link'
import { Facebook, Instagram, Twitter } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-black text-white mt-16">
      <div className="max-w-7xl mx-auto px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About GenWear</h3>
            <p className="text-gray-400">
              Your premier destination for trendy and sustainable fashion. We bring you the latest styles while keeping our planet in mind.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><Link href="/new-arrivals" className="text-gray-400 hover:text-white transition">New Arrivals</Link></li>
              <li><Link href="/best-sellers" className="text-gray-400 hover:text-white transition">Best Sellers</Link></li>
              <li><Link href="/sales" className="text-gray-400 hover:text-white transition">Sales</Link></li>
              <li><Link href="/collections" className="text-gray-400 hover:text-white transition">Collections</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Customer Service</h3>
            <ul className="space-y-2">
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/shipping" className="text-gray-400 hover:text-white transition">Shipping Info</Link></li>
              <li><Link href="/returns" className="text-gray-400 hover:text-white transition">Returns</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition">FAQ</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
            <div className="flex space-x-4">
              <Link href="https://facebook.com" className="text-gray-400 hover:text-white transition">
                <Facebook size={24} />
              </Link>
              <Link href="https://instagram.com" className="text-gray-400 hover:text-white transition">
                <Instagram size={24} />
              </Link>
              <Link href="https://twitter.com" className="text-gray-400 hover:text-white transition">
                <Twitter size={24} />
              </Link>
            </div>
            <div className="mt-4">
              <h4 className="text-sm font-medium mb-2">Subscribe to our newsletter</h4>
              <div className="flex">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="bg-gray-800 text-white px-4 py-2 rounded-l-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button className="bg-blue-600 px-4 py-2 rounded-r-md hover:bg-blue-700 transition">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} GenWear. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer 