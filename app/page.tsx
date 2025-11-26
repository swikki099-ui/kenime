import Link from 'next/link';
import { Rocket, Zap, Shield, BarChart3 } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <nav className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Rocket className="w-8 h-8 text-blue-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                KENIME
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-700 hover:text-blue-600 transition"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <main>
        <section className="pt-20 pb-16 px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-extrabold mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Deploy Static Sites
              </span>
              <br />
              <span className="text-gray-900">In Seconds</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Upload your HTML, CSS, and JavaScript. Get a live URL instantly. Simple, fast, and secure.
            </p>
            <div className="flex justify-center space-x-4">
              <Link
                href="/signup"
                className="bg-blue-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-blue-700 transition shadow-lg"
              >
                Start Hosting Free
              </Link>
              <Link
                href="/dashboard"
                className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-50 transition border-2 border-blue-600"
              >
                View Dashboard
              </Link>
            </div>
          </div>
        </section>

        <section className="py-16 px-4">
          <div className="max-w-7xl mx-auto">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <FeatureCard
                icon={<Zap className="w-8 h-8 text-blue-600" />}
                title="Lightning Fast"
                description="Upload a ZIP and go live instantly. No build process, no waiting."
              />
              <FeatureCard
                icon={<Shield className="w-8 h-8 text-blue-600" />}
                title="Secure by Design"
                description="Static-only hosting. No server-side code execution. Your sites are safe."
              />
              <FeatureCard
                icon={<BarChart3 className="w-8 h-8 text-blue-600" />}
                title="Analytics Included"
                description="Track page views, storage usage, and bandwidth for all your sites."
              />
              <FeatureCard
                icon={<Rocket className="w-8 h-8 text-blue-600" />}
                title="Path-Based URLs"
                description="Your site lives at kenime.cc/yourname - simple and memorable."
              />
            </div>
          </div>
        </section>

        <section className="py-16 px-4 bg-blue-600 text-white">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">Ready to Deploy?</h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of developers hosting their static sites on KENIME
            </p>
            <Link
              href="/signup"
              className="bg-white text-blue-600 px-8 py-3 rounded-lg text-lg font-semibold hover:bg-gray-100 transition inline-block shadow-lg"
            >
              Create Free Account
            </Link>
          </div>
        </section>
      </main>

      <footer className="bg-gray-900 text-white py-8 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-gray-400">© 2025 KENIME. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-xl transition border border-gray-100">
      <div className="mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2 text-gray-900">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}
