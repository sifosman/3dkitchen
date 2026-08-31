export default function Header() {
  return (
    <header className="bg-slate-800 border-b border-slate-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-lg">HDS</span>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white">Kitchen Visualizer</h1>
            <p className="text-xs text-slate-400">See your board colors in 3D</p>
          </div>
        </div>
        
        <a 
          href="https://hdsgroup.co.za" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
          hdsgroup.co.za →
        </a>
      </div>
    </header>
  )
}
