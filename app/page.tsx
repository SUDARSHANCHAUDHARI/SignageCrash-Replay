import Link from 'next/link'

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center">
      {/* Hero */}
      <section className="w-full max-w-5xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-violet-950 border border-violet-800 rounded-full px-4 py-1.5 text-sm text-violet-300 mb-8">
          <span className="w-2 h-2 rounded-full bg-violet-400 animate-pulse" />
          Phase 1 MVP — Manual Upload Mode
        </div>

        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight mb-6 leading-tight">
          What happened before your{' '}
          <span className="text-violet-400">screen went black?</span>
        </h1>

        <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">
          Upload screenshots and paste device logs. Our AI reconstructs the crash timeline,
          identifies the root cause, and generates a customer-ready explanation — in seconds.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            href="/crashes/new"
            className="bg-violet-600 hover:bg-violet-500 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            Report a Crash
          </Link>
          <Link
            href="/dashboard"
            className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors"
          >
            View Dashboard
          </Link>
        </div>
      </section>

      {/* Feature cards */}
      <section className="w-full max-w-5xl mx-auto px-6 pb-24 grid sm:grid-cols-3 gap-6">
        <FeatureCard
          icon="🖼️"
          title="Screenshot Timeline"
          description="Upload up to 5 screenshots captured before the crash. View them as a scrollable replay strip alongside the event timeline."
        />
        <FeatureCard
          icon="🔍"
          title="AI Root Cause"
          description="Powered by Claude or GPT-4o, the AI parses your logs, detects failure patterns, and pinpoints the exact subsystem that failed."
        />
        <FeatureCard
          icon="📋"
          title="Customer-Ready Report"
          description="Get a plain-English explanation you can copy and send to customers, plus technical notes and recommended resolution steps for your team."
        />
      </section>
    </div>
  )
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
      <div className="text-3xl mb-4">{icon}</div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </div>
  )
}
