export default function Header() {
  return (
    <header className="bg-black border-b border-gray-800 px-6 py-4">
      <div className="flex items-center justify-between max-w-7xl mx-auto">
        {/* HDS Logo */}
        <div className="flex items-center gap-4">
          <img 
            src="/images/hds-logo.webp" 
            alt="HDS Group" 
            className="h-10 w-auto"
          />
          <div className="hidden md:block border-l border-gray-700 pl-4">
            <h1 className="hds-heading text-white text-lg">Kitchen Visualizer</h1>
            <p className="hds-label text-gray-400 text-xs">Board Color Preview</p>
          </div>
        </div>
        
        {/* Navigation */}
        <nav className="flex items-center gap-6">
          <a 
            href="https://hdsgroup.co.za" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hds-label text-white hover:text-gray-300 transition-colors text-sm"
          >
            hdsgroup.co.za
          </a>
          <a 
            href="https://hdsgroup.co.za/contact" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hds-btn-outline-white text-xs px-4 py-2"
          >
            Contact Us
          </a>
        </nav>
      </div>
    </header>
  )
}
