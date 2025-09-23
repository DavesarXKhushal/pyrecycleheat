# SF DataMap Explorer

An interactive map visualization tool for exploring data centers across San Francisco. Built with modern web technologies to provide a smooth, responsive experience for discovering and learning about the city's digital infrastructure.

## Features

- **Interactive Map**: Explore San Francisco with smooth pan and zoom controls
- **3D/2D Toggle**: Switch between 2D and 3D map views for different perspectives
- **Data Center Markers**: Discover data centers with detailed information popups
- **Search Functionality**: Quickly find specific locations or data centers
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Modern UI**: Clean, glass-morphism design with intuitive controls

## Tech Stack

- **React 18** - Modern React with hooks and functional components
- **TypeScript** - Type-safe development experience
- **Vite** - Fast build tool and development server
- **MapLibre GL** - High-performance vector map rendering
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **React Query** - Server state management

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd sf-datamap-explorer
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open your browser and navigate to `http://localhost:8080`

## Project Structure

```
src/
├── components/          # React components
│   ├── MapComponent.tsx # Main map interface
│   ├── SearchBar.tsx    # Search functionality
│   ├── MapControls.tsx  # Map control buttons
│   └── DataCenterPopup.tsx # Info popups
├── data/               # Static data files
│   └── dataCenters.json # Data center information
├── hooks/              # Custom React hooks
├── lib/                # Utility functions
└── pages/              # Page components
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the [MIT License](LICENSE).

## Acknowledgments

- Map data provided by MapTiler
- Icons from Lucide React
- UI components built with Radix UI primitives
