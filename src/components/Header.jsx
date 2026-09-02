import { useState } from 'react'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="fixed top-0 left-0 right-0 z-50 hds-glass border-b border-white/[0.06]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo + Brand */}
          <div className="flex items-center gap-3 sm:gap-4">
            <img 
              src="/images/hds-logo.webp" 
              alt="HDS Group" 
              className="h-8 sm:h-10 w-auto"
            />
            <div className="hidden sm:block">
              <h1 className="font-heading text-white text-sm sm:text-base font-semibold tracking-tight leading-tight">
                Kitchen Visualizer
              </h1>
              <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-hds-gold font-medium">
                Board Color Preview
              </p>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-4">
            <a 
              href="https://hdsgroup.co.za" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm text-white/60 hover:text-white transition-colors duration-200"
            >
              hdsgroup.co.za
            </a>
            <a 
              href="https://hdsgroup.co.za/contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="hds-btn hds-btn-outline text-xs !py-2 !px-5"
            >
              Contact Us
            </a>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-lg border border-white/[0.08] bg-white/[0.03] text-white/70 hover:text-white hover:bg-white/[0.06] transition-all"
            aria-label="Toggle menu"
          >
            {menuOpen ? (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>

        {/* Mobile dropdown */}
        {menuOpen && (
          <div className="md:hidden pb-4 animate-fade-in border-t border-white/[0.06] pt-3">
            <div className="sm:hidden mb-3 px-1">
              <h1 className="font-heading text-white text-sm font-semibold">Kitchen Visualizer</h1>
              <p className="text-[10px] uppercase tracking-[0.15em] text-hds-gold font-medium">
                Board Color Preview
              </p>
            </div>
            <a 
              href="https://hdsgroup.co.za" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full text-center text-sm text-white/60 hover:text-white py-2.5 rounded-lg border border-white/[0.06] bg-white/[0.02] mb-2 transition-all"
            >
              hdsgroup.co.za
            </a>
            <a 
              href="https://hdsgroup.co.za/contact" 
              target="_blank" 
              rel="noopener noreferrer"
              className="block w-full text-center hds-btn hds-btn-outline text-xs !py-2.5"
            >
              Contact Us
            </a>
          </div>
        )}
      </div>
    </header>
  )
}