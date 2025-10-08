from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

Base = declarative_base()

class RouteStatus(enum.Enum):
    ACTIVE = "active"
    INACTIVE = "inactive"
    MAINTENANCE = "maintenance"
    PLANNED = "planned"

class HeatCenter(Base):
    """Supply points - power plants, geothermal sources, etc."""
    __tablename__ = "heat_centers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    address = Column(String(500))
    
    # Technical specifications
    max_capacity_mw = Column(Float, nullable=False)  # Maximum heat output in MW
    current_output_mw = Column(Float, default=0.0)  # Current heat output
    efficiency_percent = Column(Float, default=85.0)  # Operating efficiency
    fuel_type = Column(String(100))  # gas, biomass, geothermal, etc.
    
    # Operational status
    is_active = Column(Boolean, default=True)
    commissioning_date = Column(DateTime)
    last_maintenance = Column(DateTime)
    
    # Metadata
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    outgoing_routes = relationship("Route", foreign_keys="Route.heat_center_id", back_populates="heat_center")

class DemandSite(Base):
    """Demand points - hotels, residential areas, industrial sites, etc."""
    __tablename__ = "demand_sites"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    address = Column(String(500))
    
    # Demand characteristics
    site_type = Column(String(100))  # hotel, residential, industrial, commercial
    peak_demand_mw = Column(Float, nullable=False)  # Peak heat demand in MW
    current_demand_mw = Column(Float, default=0.0)  # Current heat demand
    annual_consumption_mwh = Column(Float)  # Annual consumption estimate
    
    # Connection details
    is_connected = Column(Boolean, default=False)
    connection_date = Column(DateTime)
    priority_level = Column(Integer, default=1)  # 1=high, 2=medium, 3=low
    
    # Building/site info
    floor_area_sqm = Column(Float)  # Floor area in square meters
    building_age_years = Column(Integer)
    insulation_rating = Column(String(10))  # A, B, C, D, etc.
    
    # Metadata
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    incoming_routes = relationship("Route", foreign_keys="Route.demand_site_id", back_populates="demand_site")

class Route(Base):
    """Connections between heat centers and demand sites (pipelines)"""
    __tablename__ = "routes"
    
    id = Column(Integer, primary_key=True, index=True)
    heat_center_id = Column(Integer, ForeignKey("heat_centers.id"), nullable=False, index=True)
    demand_site_id = Column(Integer, ForeignKey("demand_sites.id"), nullable=False, index=True)
    
    # Route characteristics
    distance_km = Column(Float, nullable=False)
    pipe_diameter_mm = Column(Integer)  # Pipe diameter in millimeters
    max_flow_capacity_mw = Column(Float, nullable=False)  # Maximum heat flow capacity
    current_flow_mw = Column(Float, default=0.0)  # Current heat flow
    
    # Temperatures
    supply_temp_celsius = Column(Float, default=80.0)  # Supply temperature
    return_temp_celsius = Column(Float, default=40.0)  # Return temperature
    
    # Technical details
    pressure_bar = Column(Float, default=16.0)  # Operating pressure
    heat_loss_percent = Column(Float, default=2.0)  # Heat loss over distance
    installation_year = Column(Integer)
    pipe_material = Column(String(100))  # steel, plastic, etc.
    insulation_type = Column(String(100))
    
    # Operational status
    status = Column(Enum(RouteStatus), default=RouteStatus.ACTIVE)
    is_bidirectional = Column(Boolean, default=False)  # Can flow both ways
    maintenance_due = Column(DateTime)
    
    # Cost information
    construction_cost = Column(Float)  # Construction cost
    annual_maintenance_cost = Column(Float)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    heat_center = relationship("HeatCenter", foreign_keys=[heat_center_id], back_populates="outgoing_routes")
    demand_site = relationship("DemandSite", foreign_keys=[demand_site_id], back_populates="incoming_routes")

class SystemConfig(Base):
    """Configuration settings for map display and system parameters"""
    __tablename__ = "system_config"
    
    id = Column(Integer, primary_key=True, index=True)
    config_key = Column(String(100), unique=True, nullable=False, index=True)
    config_value = Column(Text, nullable=False)
    config_type = Column(String(50), default="string")  # string, integer, float, boolean, json
    description = Column(Text)
    is_active = Column(Boolean, default=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

# Optional: Historical data tracking for analytics
class HeatCenterMetrics(Base):
    """Historical metrics for heat centers"""
    __tablename__ = "heat_center_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    heat_center_id = Column(Integer, ForeignKey("heat_centers.id"), nullable=False, index=True)
    
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    output_mw = Column(Float, nullable=False)
    efficiency_percent = Column(Float)
    fuel_consumption = Column(Float)  # Fuel consumption rate
    operational_cost_hour = Column(Float)  # Cost per hour of operation
    
    # Environmental metrics
    co2_emissions_kg_hour = Column(Float)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class DemandSiteMetrics(Base):
    """Historical metrics for demand sites"""
    __tablename__ = "demand_site_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    demand_site_id = Column(Integer, ForeignKey("demand_sites.id"), nullable=False, index=True)
    
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    demand_mw = Column(Float, nullable=False)
    supply_temp_celsius = Column(Float)
    return_temp_celsius = Column(Float)
    flow_rate_m3_hour = Column(Float)  # Flow rate in cubic meters per hour
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class RouteMetrics(Base):
    """Historical metrics for routes"""
    __tablename__ = "route_metrics"
    
    id = Column(Integer, primary_key=True, index=True)
    route_id = Column(Integer, ForeignKey("routes.id"), nullable=False, index=True)
    
    timestamp = Column(DateTime(timezone=True), nullable=False, index=True)
    flow_mw = Column(Float, nullable=False)
    supply_temp_celsius = Column(Float)
    return_temp_celsius = Column(Float)
    pressure_bar = Column(Float)
    heat_loss_mw = Column(Float)  # Actual heat loss
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())