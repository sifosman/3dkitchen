# HDS Kitchen Visualizer

A 3D kitchen visualization tool for HDS Group customers to preview board colors on a virtual kitchen.

## Features

- **3D Kitchen Scene**: Interactive 3D kitchen with orbit controls
- **Real Board Colors**: All HDS board colors from the product catalog
- **Multiple Finishes**: Gloss, SilkTouch (super matte), Wood Grain, Foil, Acrylic
- **Responsive Design**: Works on desktop and mobile devices
- **Fast Loading**: Optimized 3D rendering with React Three Fiber

## Tech Stack

- React 18
- React Three Fiber + Drei
- Three.js
- Tailwind CSS
- Vite

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Deployment to Vercel

1. Push this repository to GitHub/GitLab/Bitbucket
2. Import project in Vercel
3. Vercel will auto-detect Vite and deploy

Or use Vercel CLI:

```bash
npm i -g vercel
vercel
```

## Project Structure

```
kitchen-visualizer/
├── src/
│   ├── components/
│   │   ├── Header.jsx          # App header
│   │   ├── KitchenScene.jsx    # 3D kitchen scene
│   │   └── ColorPalette.jsx    # Color selection UI
│   ├── data/
│   │   └── boardColors.js      # HDS board color data
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── public/                     # Static assets
├── index.html                  # HTML template
├── vite.config.js              # Vite configuration
├── tailwind.config.js          # Tailwind configuration
└── vercel.json                 # Vercel deployment config
```

## Color Data

Board colors are sourced from the HDS Group product catalog (Supabase). Each color includes:

- Name and SKU
- Color family (Oak Tones, Blacks, Greys, etc.)
- Category (Chrometree Gloss, SilkTouch, Wood Grain, etc.)
- Hex color approximation for 3D rendering
- Product image URL
- Price

## Customization

### Adding New Colors

Edit `src/data/boardColors.js` and add new entries:

```javascript
{
  id: 'unique-id',
  name: 'Color Name',
  family: 'Color Family',
  category: 'Product Category',
  hex: '#RRGGBB',
  texture: 'gloss|matte|woodgrain|etc',
  image: 'https://...',
  sku: 'SKU123',
  price: 0
}
```

### Modifying the 3D Scene

Edit `src/components/KitchenScene.jsx` to:
- Add/remove cabinets
- Change kitchen layout
- Add appliances
- Modify lighting

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

WebGL required for 3D rendering.

## License

Proprietary - HDS Group
