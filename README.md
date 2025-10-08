# SF Data Map Explorer

A modern, interactive web application for visualizing and managing San Francisco's district heating infrastructure. This application provides real-time monitoring, analytics, and management capabilities for heat centers, demand sites, and distribution networks.

## 🌟 Features

### Interactive Map Visualization
- **3D Map Experience**: Immersive 3D visualization of San Francisco with terrain and building data
- **Smart Markers**: Liquid glass-effect markers with hover animations and status indicators
- **Responsive Popups**: Detailed information panels with smart positioning to prevent overflow
- **Real-time Data**: Live updates of heat center and demand site status

### Statistics Dashboard
- **Live Statistics Sidebar**: Real-time counts of active/inactive centers and sites
- **Energy Metrics**: Maximum output, demand tracking, and system capacity monitoring
- **Professional Header**: System status overview with connection statistics

### Data Management
- **Heat Centers**: Monitor power plants, waste-to-energy facilities, and geothermal plants
- **Demand Sites**: Track residential, commercial, and industrial heating demands
- **Distribution Routes**: Visualize and manage heating distribution networks
- **Analytics**: Comprehensive system performance metrics and insights

## 🚀 Technology Stack

### Frontend
- **React 18** with TypeScript for type-safe development
- **Vite** for fast development and optimized builds
- **Tailwind CSS** for modern, responsive styling
- **MapLibre GL JS** for interactive 3D mapping
- **Tanstack Query** for efficient data fetching and caching
- **Lucide React** for consistent iconography

### Backend
- **FastAPI** for high-performance API development
- **SQLAlchemy** for robust database operations
- **Pydantic** for data validation and serialization
- **SQLite** for development (easily configurable for production databases)

## 📦 Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- Git

### Backend Setup
```bash
# Navigate to backend directory
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Start the development server
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8000
- API Documentation: http://localhost:8000/docs

## 🏗️ Project Structure

```
sf-datamap-explorer/
├── backend/
│   ├── app.py              # FastAPI application
│   ├── models.py           # Database models
│   ├── requirements.txt    # Python dependencies
│   └── test.db            # SQLite database
├── frontend/
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── types/         # TypeScript type definitions
│   │   └── main.tsx       # Application entry point
│   ├── package.json       # Node.js dependencies
│   └── vite.config.ts     # Vite configuration
└── README.md              # Project documentation
```

## 🎨 Key Components

### MapComponent
The heart of the application, featuring:
- 3D terrain visualization with San Francisco bounds
- Custom liquid glass markers with hover effects
- Smart popup positioning system
- Real-time data integration

### StatsSidebar
Professional statistics panel displaying:
- Active/inactive heat centers and demand sites
- Maximum energy output and demand metrics
- Total system capacity and utilization

### Header
System navigation and status overview:
- Application branding and navigation
- Real-time connection statistics
- Professional design with loading states

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the backend directory:
```env
DATABASE_URL=sqlite:///./test.db
# For production, use PostgreSQL:
# DATABASE_URL=postgresql://user:password@localhost/dbname
```

### Development vs Production
The application is configured for easy deployment:
- Development: SQLite database with hot reloading
- Production: Configurable database with optimized builds

## 📊 API Endpoints

### Heat Centers
- `GET /heat-centers` - List all heat centers
- `POST /heat-centers` - Create new heat center
- `GET /heat-centers/{id}` - Get specific heat center
- `PUT /heat-centers/{id}` - Update heat center
- `DELETE /heat-centers/{id}` - Delete heat center

### Demand Sites
- `GET /demand-sites` - List all demand sites
- `POST /demand-sites` - Create new demand site
- `GET /demand-sites/{id}` - Get specific demand site
- `PUT /demand-sites/{id}` - Update demand site
- `DELETE /demand-sites/{id}` - Delete demand site

### Analytics
- `GET /analytics/overview` - System overview statistics
- `GET /analytics/heat-center/{id}` - Heat center analytics
- `GET /analytics/demand-site/{id}` - Demand site analytics

## 🚀 Deployment

### Frontend Deployment
```bash
cd frontend
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd backend
# Configure production database
# Deploy using Docker, Heroku, or your preferred platform
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- OpenStreetMap for base map tiles
- MapTiler for 3D terrain and building data
- The FastAPI and React communities for excellent documentation
- San Francisco for being an inspiring city for urban technology

---

**Built with ❤️ for sustainable urban heating solutions**
