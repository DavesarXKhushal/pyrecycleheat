from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime
import enum

Base = declarative_base()

class DataCenterType(enum.Enum):
    HYPERSCALE = "hyperscale"
    ENTERPRISE = "enterprise"
    COLOCATION = "colocation"
    EDGE = "edge"
    CLOUD = "cloud"

class CoolingType(enum.Enum):
    AIR_COOLED = "air_cooled"
    WATER_COOLED = "water_cooled"
    LIQUID_COOLED = "liquid_cooled"
    IMMERSION = "immersion"
    HYBRID = "hybrid"

class EnergySource(enum.Enum):
    GRID = "grid"
    RENEWABLE = "renewable"
    HYBRID = "hybrid"
    DIESEL = "diesel"

class DataCenter(Base):
    """Data center specifications for savings prediction"""
    __tablename__ = "data_centers"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    address = Column(String(500))
    
    # Data Center Specifications
    dc_type = Column(Enum(DataCenterType), nullable=False)
    total_it_load_kw = Column(Float, nullable=False)  # Total IT load in kW
    pue = Column(Float, default=1.5)  # Power Usage Effectiveness
    cooling_type = Column(Enum(CoolingType), nullable=False)
    energy_source = Column(Enum(EnergySource), default=EnergySource.GRID)
    
    # Physical Specifications
    floor_area_sqm = Column(Float)
    rack_count = Column(Integer)
    server_count = Column(Integer)
    storage_capacity_tb = Column(Float)
    
    # Operational Parameters
    utilization_percent = Column(Float, default=70.0)  # Average utilization
    operating_hours_year = Column(Integer, default=8760)  # Hours per year
    ambient_temp_celsius = Column(Float, default=25.0)
    
    # Cost Parameters
    electricity_cost_kwh = Column(Float, nullable=False)  # Cost per kWh
    cooling_cost_kwh = Column(Float)  # Additional cooling cost per kWh
    maintenance_cost_annual = Column(Float)
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    predictions = relationship("SavingsPrediction", back_populates="data_center")

class CarbonCredit(Base):
    """Carbon credit details for savings calculation"""
    __tablename__ = "carbon_credits"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    
    # Carbon Credit Specifications
    price_per_ton_co2 = Column(Float, nullable=False)  # Price per ton of CO2
    validity_years = Column(Integer, default=5)
    certification_standard = Column(String(100))  # VCS, Gold Standard, etc.
    project_type = Column(String(100))  # Renewable energy, forestry, etc.
    
    # Geographic and Temporal
    region = Column(String(100))
    vintage_year = Column(Integer)
    
    # Market Data
    market_price_trend = Column(Float, default=0.0)  # Annual price increase %
    availability_tons = Column(Float)  # Available tons for purchase
    
    # Metadata
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class HeatSink(Base):
    """Heat sink locations for waste heat recovery"""
    __tablename__ = "heat_sinks"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    location_lat = Column(Float, nullable=False)
    location_lng = Column(Float, nullable=False)
    address = Column(String(500))
    
    # Heat Sink Specifications
    sink_type = Column(String(100))  # District heating, industrial, greenhouse, etc.
    heat_demand_kw = Column(Float, nullable=False)  # Heat demand in kW
    operating_temp_celsius = Column(Float, default=60.0)  # Required temperature
    
    # Economic Parameters
    heat_price_kwh = Column(Float)  # Price paid for heat per kWh
    connection_cost_km = Column(Float)  # Cost per km for connection
    
    # Operational
    seasonal_factor = Column(Float, default=1.0)  # Seasonal demand variation
    efficiency_percent = Column(Float, default=85.0)  # Heat transfer efficiency
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

class SavingsPrediction(Base):
    """Savings prediction results"""
    __tablename__ = "savings_predictions"
    
    id = Column(Integer, primary_key=True, index=True)
    data_center_id = Column(Integer, ForeignKey("data_centers.id"), nullable=False)
    carbon_credit_id = Column(Integer, ForeignKey("carbon_credits.id"))
    heat_sink_id = Column(Integer, ForeignKey("heat_sinks.id"))
    
    # Input Parameters (stored for reference)
    prediction_years = Column(Integer, default=10)
    discount_rate = Column(Float, default=0.08)  # 8% discount rate
    
    # Energy Usage Predictions
    annual_energy_consumption_kwh = Column(Float, nullable=False)
    annual_cooling_energy_kwh = Column(Float)
    total_energy_cost_annual = Column(Float, nullable=False)
    
    # Heat Recovery Predictions
    recoverable_heat_kwh_annual = Column(Float, default=0.0)
    heat_recovery_revenue_annual = Column(Float, default=0.0)
    distance_to_heat_sink_km = Column(Float)
    
    # Carbon Emissions
    annual_co2_emissions_tons = Column(Float, nullable=False)
    carbon_credit_cost_annual = Column(Float, default=0.0)
    carbon_savings_tons_annual = Column(Float, default=0.0)
    
    # CAPEX (Capital Expenditure)
    infrastructure_capex = Column(Float, default=0.0)
    heat_recovery_capex = Column(Float, default=0.0)
    carbon_offset_capex = Column(Float, default=0.0)
    total_capex = Column(Float, nullable=False)
    
    # OPEX (Operational Expenditure)
    energy_opex_annual = Column(Float, nullable=False)
    maintenance_opex_annual = Column(Float, default=0.0)
    carbon_credit_opex_annual = Column(Float, default=0.0)
    total_opex_annual = Column(Float, nullable=False)
    
    # Total Savings
    energy_savings_annual = Column(Float, default=0.0)
    carbon_savings_annual = Column(Float, default=0.0)
    heat_recovery_savings_annual = Column(Float, default=0.0)
    total_savings_annual = Column(Float, nullable=False)
    
    # NPV and ROI
    net_present_value = Column(Float)
    return_on_investment_percent = Column(Float)
    payback_period_years = Column(Float)
    
    # Detailed breakdown (JSON for flexibility)
    yearly_breakdown = Column(JSON)  # Year-by-year breakdown
    sensitivity_analysis = Column(JSON)  # Sensitivity to key parameters
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    data_center = relationship("DataCenter", back_populates="predictions")

class PredictionScenario(Base):
    """Different scenarios for comparison"""
    __tablename__ = "prediction_scenarios"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    
    # Scenario Parameters
    base_case = Column(Boolean, default=False)
    pue_improvement = Column(Float, default=0.0)  # PUE reduction
    renewable_energy_percent = Column(Float, default=0.0)
    heat_recovery_enabled = Column(Boolean, default=False)
    carbon_offset_enabled = Column(Boolean, default=False)
    
    # Economic Assumptions
    energy_price_escalation = Column(Float, default=0.03)  # 3% annual increase
    carbon_price_escalation = Column(Float, default=0.05)  # 5% annual increase
    
    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())