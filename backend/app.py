"""
District Heating System API

A comprehensive FastAPI application for managing district heating infrastructure,
including heat centers, demand sites, and distribution routes. This system provides
real-time monitoring, analytics, and management capabilities for urban heating networks.

Author: Development Team
Version: 1.0.0
"""

from fastapi import FastAPI, HTTPException, Depends, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, and_, func
from sqlalchemy.orm import sessionmaker, Session
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import json
import os

# Import database models
from models import (
    Base, HeatCenter, DemandSite, Route, SystemConfig, 
    HeatCenterMetrics, DemandSiteMetrics, RouteMetrics, RouteStatus
)

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(
    DATABASE_URL, 
    connect_args={"check_same_thread": False}  # Required for SQLite
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Initialize database tables
Base.metadata.create_all(bind=engine)

# FastAPI application instance
app = FastAPI(
    title="District Heating System API",
    description="API for managing district heating supply, demand, and distribution networks",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS for frontend integration
# Allow multiple development ports for flexibility
ALLOWED_ORIGINS = [
    "http://localhost:5173",  # Vite default
    "http://localhost:8080",  # Alternative dev server
    "http://localhost:8081",  # Alternative dev server
    "http://localhost:3000"   # React default
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)

def get_db() -> Session:
    """
    Database dependency injection.
    
    Provides a database session for each request and ensures proper cleanup.
    This is the standard pattern for FastAPI database integration.
    
    Yields:
        Session: SQLAlchemy database session
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# ============================================================================
# Pydantic Models for Request/Response Validation
# ============================================================================

class HeatCenterBase(BaseModel):
    """
    Base model for heat center data validation.
    
    Heat centers are the supply points in the district heating network,
    typically power plants, waste-to-energy facilities, or geothermal plants.
    """
    name: str
    location_lat: float
    location_lng: float
    address: Optional[str] = None
    max_capacity_mw: float
    current_output_mw: Optional[float] = 0.0
    efficiency_percent: Optional[float] = 85.0
    fuel_type: Optional[str] = None
    is_active: Optional[bool] = True
    commissioning_date: Optional[datetime] = None
    last_maintenance: Optional[datetime] = None
    description: Optional[str] = None

class HeatCenterCreate(HeatCenterBase):
    pass

class HeatCenterUpdate(BaseModel):
    name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    address: Optional[str] = None
    max_capacity_mw: Optional[float] = None
    current_output_mw: Optional[float] = None
    efficiency_percent: Optional[float] = None
    fuel_type: Optional[str] = None
    is_active: Optional[bool] = None
    commissioning_date: Optional[datetime] = None
    last_maintenance: Optional[datetime] = None
    description: Optional[str] = None

class HeatCenterResponse(HeatCenterBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class DemandSiteBase(BaseModel):
    name: str
    location_lat: float
    location_lng: float
    address: Optional[str] = None
    site_type: Optional[str] = None
    peak_demand_mw: float
    current_demand_mw: Optional[float] = 0.0
    annual_consumption_mwh: Optional[float] = None
    is_connected: Optional[bool] = False
    connection_date: Optional[datetime] = None
    priority_level: Optional[int] = 1
    floor_area_sqm: Optional[float] = None
    building_age_years: Optional[int] = None
    insulation_rating: Optional[str] = None
    description: Optional[str] = None

class DemandSiteCreate(DemandSiteBase):
    pass

class DemandSiteUpdate(BaseModel):
    name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    address: Optional[str] = None
    site_type: Optional[str] = None
    peak_demand_mw: Optional[float] = None
    current_demand_mw: Optional[float] = None
    annual_consumption_mwh: Optional[float] = None
    is_connected: Optional[bool] = None
    connection_date: Optional[datetime] = None
    priority_level: Optional[int] = None
    floor_area_sqm: Optional[float] = None
    building_age_years: Optional[int] = None
    insulation_rating: Optional[str] = None
    description: Optional[str] = None

class DemandSiteResponse(DemandSiteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class RouteBase(BaseModel):
    heat_center_id: int
    demand_site_id: int
    distance_km: float
    pipe_diameter_mm: Optional[int] = None
    max_flow_capacity_mw: float
    current_flow_mw: Optional[float] = 0.0
    supply_temp_celsius: Optional[float] = 80.0
    return_temp_celsius: Optional[float] = 40.0
    pressure_bar: Optional[float] = 16.0
    heat_loss_percent: Optional[float] = 2.0
    installation_year: Optional[int] = None
    pipe_material: Optional[str] = None
    insulation_type: Optional[str] = None
    status: Optional[RouteStatus] = RouteStatus.ACTIVE
    is_bidirectional: Optional[bool] = False
    maintenance_due: Optional[datetime] = None
    construction_cost: Optional[float] = None
    annual_maintenance_cost: Optional[float] = None

class RouteCreate(RouteBase):
    pass

class RouteResponse(RouteBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# HEAT CENTERS ENDPOINTS
@app.get("/heat-centers", response_model=List[HeatCenterResponse])
async def get_heat_centers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    active_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get all heat centers with optional filtering"""
    query = db.query(HeatCenter)
    if active_only:
        query = query.filter(HeatCenter.is_active == True)
    
    centers = query.offset(skip).limit(limit).all()
    return centers

@app.post("/heat-centers", response_model=HeatCenterResponse)
async def create_heat_center(center: HeatCenterCreate, db: Session = Depends(get_db)):
    """Create a new heat center"""
    db_center = HeatCenter(**center.dict())
    db.add(db_center)
    db.commit()
    db.refresh(db_center)
    return db_center

@app.get("/heat-centers/{center_id}", response_model=HeatCenterResponse)
async def get_heat_center(center_id: int, db: Session = Depends(get_db)):
    """Get details of a specific heat center"""
    center = db.query(HeatCenter).filter(HeatCenter.id == center_id).first()
    if not center:
        raise HTTPException(status_code=404, detail="Heat center not found")
    return center

@app.put("/heat-centers/{center_id}", response_model=HeatCenterResponse)
async def update_heat_center(
    center_id: int, 
    center_update: HeatCenterUpdate, 
    db: Session = Depends(get_db)
):
    """Update a heat center"""
    center = db.query(HeatCenter).filter(HeatCenter.id == center_id).first()
    if not center:
        raise HTTPException(status_code=404, detail="Heat center not found")
    
    update_data = center_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(center, field, value)
    
    db.commit()
    db.refresh(center)
    return center

@app.delete("/heat-centers/{center_id}")
async def delete_heat_center(center_id: int, db: Session = Depends(get_db)):
    """Delete a heat center"""
    center = db.query(HeatCenter).filter(HeatCenter.id == center_id).first()
    if not center:
        raise HTTPException(status_code=404, detail="Heat center not found")
    
    # Check if center has active routes
    active_routes = db.query(Route).filter(Route.heat_center_id == center_id).count()
    if active_routes > 0:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete heat center with active routes"
        )
    
    db.delete(center)
    db.commit()
    return {"message": "Heat center deleted successfully"}

# DEMAND SITES ENDPOINTS
@app.get("/demand-sites", response_model=List[DemandSiteResponse])
async def get_demand_sites(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    connected_only: bool = Query(False),
    site_type: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all demand sites with optional filtering"""
    query = db.query(DemandSite)
    
    if connected_only:
        query = query.filter(DemandSite.is_connected == True)
    if site_type:
        query = query.filter(DemandSite.site_type == site_type)
    
    sites = query.offset(skip).limit(limit).all()
    return sites

@app.post("/demand-sites", response_model=DemandSiteResponse)
async def create_demand_site(site: DemandSiteCreate, db: Session = Depends(get_db)):
    """Create a new demand site"""
    db_site = DemandSite(**site.dict())
    db.add(db_site)
    db.commit()
    db.refresh(db_site)
    return db_site

@app.get("/demand-sites/{site_id}", response_model=DemandSiteResponse)
async def get_demand_site(site_id: int, db: Session = Depends(get_db)):
    """Get details of a specific demand site"""
    site = db.query(DemandSite).filter(DemandSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Demand site not found")
    return site

@app.put("/demand-sites/{site_id}", response_model=DemandSiteResponse)
async def update_demand_site(
    site_id: int, 
    site_update: DemandSiteUpdate, 
    db: Session = Depends(get_db)
):
    """Update a demand site"""
    site = db.query(DemandSite).filter(DemandSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Demand site not found")
    
    update_data = site_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(site, field, value)
    
    db.commit()
    db.refresh(site)
    return site

@app.delete("/demand-sites/{site_id}")
async def delete_demand_site(site_id: int, db: Session = Depends(get_db)):
    """Delete a demand site"""
    site = db.query(DemandSite).filter(DemandSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Demand site not found")
    
    # Check if site has active routes
    active_routes = db.query(Route).filter(Route.demand_site_id == site_id).count()
    if active_routes > 0:
        raise HTTPException(
            status_code=400, 
            detail="Cannot delete demand site with active routes"
        )
    
    db.delete(site)
    db.commit()
    return {"message": "Demand site deleted successfully"}

# ROUTES ENDPOINTS
@app.get("/routes", response_model=List[RouteResponse])
async def get_routes(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    status: Optional[RouteStatus] = Query(None),
    heat_center_id: Optional[int] = Query(None),
    demand_site_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Get all routes with optional filtering"""
    query = db.query(Route)
    
    if status:
        query = query.filter(Route.status == status)
    if heat_center_id:
        query = query.filter(Route.heat_center_id == heat_center_id)
    if demand_site_id:
        query = query.filter(Route.demand_site_id == demand_site_id)
    
    routes = query.offset(skip).limit(limit).all()
    return routes

@app.post("/routes", response_model=RouteResponse)
async def create_route(route: RouteCreate, db: Session = Depends(get_db)):
    """Create a new route"""
    # Verify heat center and demand site exist
    heat_center = db.query(HeatCenter).filter(HeatCenter.id == route.heat_center_id).first()
    if not heat_center:
        raise HTTPException(status_code=404, detail="Heat center not found")
    
    demand_site = db.query(DemandSite).filter(DemandSite.id == route.demand_site_id).first()
    if not demand_site:
        raise HTTPException(status_code=404, detail="Demand site not found")
    
    # Check for duplicate route
    existing_route = db.query(Route).filter(
        and_(
            Route.heat_center_id == route.heat_center_id,
            Route.demand_site_id == route.demand_site_id
        )
    ).first()
    if existing_route:
        raise HTTPException(
            status_code=400, 
            detail="Route already exists between these locations"
        )
    
    db_route = Route(**route.dict())
    db.add(db_route)
    db.commit()
    db.refresh(db_route)
    return db_route

@app.get("/routes/{route_id}", response_model=RouteResponse)
async def get_route(route_id: int, db: Session = Depends(get_db)):
    """Get details of a specific route"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    return route

@app.delete("/routes/{route_id}")
async def delete_route(route_id: int, db: Session = Depends(get_db)):
    """Delete a route"""
    route = db.query(Route).filter(Route.id == route_id).first()
    if not route:
        raise HTTPException(status_code=404, detail="Route not found")
    
    db.delete(route)
    db.commit()
    return {"message": "Route deleted successfully"}

# ANALYTICS ENDPOINTS
@app.get("/analytics/overview")
async def get_analytics_overview(db: Session = Depends(get_db)):
    """Get overall system statistics"""
    # Basic counts and totals
    total_heat_centers = db.query(HeatCenter).count()
    active_heat_centers = db.query(HeatCenter).filter(HeatCenter.is_active == True).count()
    total_demand_sites = db.query(DemandSite).count()
    connected_demand_sites = db.query(DemandSite).filter(DemandSite.is_connected == True).count()
    total_routes = db.query(Route).count()
    active_routes = db.query(Route).filter(Route.status == RouteStatus.ACTIVE).count()
    
    # Capacity calculations
    total_capacity = db.query(func.sum(HeatCenter.max_capacity_mw)).scalar() or 0
    current_output = db.query(func.sum(HeatCenter.current_output_mw)).scalar() or 0
    total_demand = db.query(func.sum(DemandSite.peak_demand_mw)).scalar() or 0
    current_demand = db.query(func.sum(DemandSite.current_demand_mw)).scalar() or 0
    
    # Network statistics
    total_pipeline_km = db.query(func.sum(Route.distance_km)).scalar() or 0
    
    return {
        "infrastructure": {
            "heat_centers": {
                "total": total_heat_centers,
                "active": active_heat_centers
            },
            "demand_sites": {
                "total": total_demand_sites,
                "connected": connected_demand_sites
            },
            "routes": {
                "total": total_routes,
                "active": active_routes
            }
        },
        "capacity": {
            "total_generation_capacity_mw": float(total_capacity),
            "current_generation_mw": float(current_output),
            "capacity_utilization_percent": round((current_output / total_capacity * 100) if total_capacity > 0 else 0, 2),
            "total_peak_demand_mw": float(total_demand),
            "current_demand_mw": float(current_demand),
            "demand_coverage_percent": round((total_capacity / total_demand * 100) if total_demand > 0 else 0, 2)
        },
        "network": {
            "total_pipeline_km": float(total_pipeline_km),
            "average_route_distance_km": round(total_pipeline_km / total_routes, 2) if total_routes > 0 else 0
        }
    }

@app.get("/analytics/heat-center/{center_id}")
async def get_heat_center_analytics(center_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific heat center"""
    center = db.query(HeatCenter).filter(HeatCenter.id == center_id).first()
    if not center:
        raise HTTPException(status_code=404, detail="Heat center not found")
    
    # Get connected routes and demand sites
    routes = db.query(Route).filter(Route.heat_center_id == center_id).all()
    connected_demand = sum(route.current_flow_mw for route in routes)
    
    return {
        "center_info": {
            "id": center.id,
            "name": center.name,
            "fuel_type": center.fuel_type,
            "max_capacity_mw": center.max_capacity_mw,
            "current_output_mw": center.current_output_mw,
            "efficiency_percent": center.efficiency_percent,
            "is_active": center.is_active
        },
        "performance": {
            "capacity_utilization_percent": round((center.current_output_mw / center.max_capacity_mw * 100) if center.max_capacity_mw > 0 else 0, 2),
            "connected_demand_mw": float(connected_demand),
            "number_of_routes": len(routes)
        },
        "routes": [
            {
                "route_id": route.id,
                "demand_site_id": route.demand_site_id,
                "distance_km": route.distance_km,
                "current_flow_mw": route.current_flow_mw,
                "max_capacity_mw": route.max_flow_capacity_mw,
                "status": route.status.value
            }
            for route in routes
        ]
    }

@app.get("/analytics/demand-site/{site_id}")
async def get_demand_site_analytics(site_id: int, db: Session = Depends(get_db)):
    """Get analytics for a specific demand site"""
    site = db.query(DemandSite).filter(DemandSite.id == site_id).first()
    if not site:
        raise HTTPException(status_code=404, detail="Demand site not found")
    
    # Get incoming routes
    routes = db.query(Route).filter(Route.demand_site_id == site_id).all()
    total_supply_capacity = sum(route.max_flow_capacity_mw for route in routes)
    current_supply = sum(route.current_flow_mw for route in routes)
    
    return {
        "site_info": {
            "id": site.id,
            "name": site.name,
            "site_type": site.site_type,
            "peak_demand_mw": site.peak_demand_mw,
            "current_demand_mw": site.current_demand_mw,
            "is_connected": site.is_connected,
            "priority_level": site.priority_level
        },
        "supply": {
            "total_supply_capacity_mw": float(total_supply_capacity),
            "current_supply_mw": float(current_supply),
            "demand_coverage_percent": round((total_supply_capacity / site.peak_demand_mw * 100) if site.peak_demand_mw > 0 else 0, 2),
            "current_utilization_percent": round((site.current_demand_mw / site.peak_demand_mw * 100) if site.peak_demand_mw > 0 else 0, 2)
        },
        "routes": [
            {
                "route_id": route.id,
                "heat_center_id": route.heat_center_id,
                "distance_km": route.distance_km,
                "current_flow_mw": route.current_flow_mw,
                "max_capacity_mw": route.max_flow_capacity_mw,
                "status": route.status.value
            }
            for route in routes
        ]
    }

# UTILITY ENDPOINTS
@app.get("/health")
async def health_check():
    """API health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.now(),
        "version": "1.0.0"
    }

@app.get("/config")
async def get_config(db: Session = Depends(get_db)):
    """Get map display settings and system configuration"""
    configs = db.query(SystemConfig).filter(SystemConfig.is_active == True).all()
    
    config_dict = {}
    for config in configs:
        value = config.config_value
        
        # Convert based on config_type
        if config.config_type == "integer":
            value = int(value)
        elif config.config_type == "float":
            value = float(value)
        elif config.config_type == "boolean":
            value = value.lower() in ("true", "1", "yes", "on")
        elif config.config_type == "json":
            value = json.loads(value)
        
        config_dict[config.config_key] = value
    
    # Default map settings if not configured
    if not config_dict:
        config_dict = {
            "default_zoom": 10,
            "center_lat": 59.3293,  # Stockholm coordinates as example
            "center_lng": 18.0686,
            "heat_center_icon": "power-plant",
            "demand_site_icon": "building",
            "route_color": "#ff4444",
            "route_width": 3,
            "max_zoom": 18,
            "min_zoom": 5
        }
    
    return {"map_config": config_dict}

# Optional: Add configuration management endpoints
@app.post("/config")
async def set_config(
    config_key: str, 
    config_value: str, 
    config_type: str = "string",
    description: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """Set a configuration value"""
    config = db.query(SystemConfig).filter(SystemConfig.config_key == config_key).first()
    
    if config:
        config.config_value = config_value
        config.config_type = config_type
        if description:
            config.description = description
    else:
        config = SystemConfig(
            config_key=config_key,
            config_value=config_value,
            config_type=config_type,
            description=description
        )
        db.add(config)
    
    db.commit()
    return {"message": f"Configuration '{config_key}' updated successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)