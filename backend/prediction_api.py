"""
Data Center Savings Prediction API

FastAPI endpoints for the data center savings prediction system,
including CRUD operations for data centers, carbon credits, heat sinks,
and comprehensive prediction calculations.

Author: Development Team
Version: 1.0.0
"""

from fastapi import APIRouter, HTTPException, Depends, Query, BackgroundTasks
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime
import json

# Import prediction models and services
from prediction_models import (
    DataCenter, CarbonCredit, HeatSink, SavingsPrediction, PredictionScenario
)
from prediction_service import PredictionService
from prediction_engine import DataCenterPredictionEngine

# Import database dependency
from database import get_db

# Create router for prediction endpoints
router = APIRouter(prefix="/api/v1/predictions", tags=["Predictions"])

# Pydantic models for API requests/responses

class DataCenterBase(BaseModel):
    name: str
    location_lat: float
    location_lng: float
    address: Optional[str] = None
    
    # Technical Specifications - matching database model fields
    dc_type: str = Field("enterprise", description="Data center type")
    total_it_load_kw: float = Field(..., gt=0, description="Total IT load in kW")
    pue: float = Field(1.4, ge=1.0, le=3.0, description="Power Usage Effectiveness")
    cooling_type: str = Field("air_cooled", description="Primary cooling system type")
    energy_source: str = Field("grid", description="Energy source type")
    
    # Physical Specifications
    floor_area_sqm: Optional[float] = Field(None, ge=0, description="Floor area in square meters")
    rack_count: Optional[int] = Field(None, ge=1, description="Number of server racks")
    server_count: Optional[int] = Field(None, ge=1, description="Number of servers")
    storage_capacity_tb: Optional[float] = Field(None, ge=0, description="Storage capacity in TB")
    
    # Operational Parameters
    utilization_percent: float = Field(70.0, ge=0, le=100, description="Average utilization percentage")
    operating_hours_year: int = Field(8760, ge=1, le=8760, description="Operating hours per year")
    ambient_temp_celsius: float = Field(25.0, ge=0, le=50, description="Ambient temperature in Celsius")
    
    # Cost Parameters
    electricity_cost_kwh: float = Field(..., gt=0, description="Electricity cost per kWh")
    cooling_cost_kwh: Optional[float] = Field(None, ge=0, description="Additional cooling cost per kWh")
    maintenance_cost_annual: Optional[float] = Field(None, ge=0, description="Annual maintenance cost")

class DataCenterCreate(DataCenterBase):
    pass

class DataCenterUpdate(BaseModel):
    name: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    address: Optional[str] = None
    dc_type: Optional[str] = None
    total_it_load_kw: Optional[float] = None
    pue: Optional[float] = None
    cooling_type: Optional[str] = None
    energy_source: Optional[str] = None
    floor_area_sqm: Optional[float] = None
    rack_count: Optional[int] = None
    server_count: Optional[int] = None
    storage_capacity_tb: Optional[float] = None
    utilization_percent: Optional[float] = None
    operating_hours_year: Optional[int] = None
    ambient_temp_celsius: Optional[float] = None
    electricity_cost_kwh: Optional[float] = None
    cooling_cost_kwh: Optional[float] = None
    maintenance_cost_annual: Optional[float] = None

class DataCenterResponse(DataCenterBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class CarbonCreditBase(BaseModel):
    name: str
    price_per_ton_co2: float = Field(..., gt=0, description="Price per ton of CO2")
    validity_years: int = Field(5, ge=1, le=20, description="Validity period in years")
    certification_standard: str = Field("VCS", description="Certification standard")
    project_type: str = Field("Renewable Energy", description="Project type")
    region: str = Field("North America", description="Geographic region")
    vintage_year: int = Field(2024, ge=2000, description="Vintage year")
    market_price_trend: float = Field(0.05, ge=-0.2, le=0.5, description="Annual price trend")
    availability_tons: Optional[float] = Field(None, ge=0, description="Available volume in tons")
    description: Optional[str] = None

class CarbonCreditCreate(CarbonCreditBase):
    pass

class CarbonCreditResponse(CarbonCreditBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class HeatSinkBase(BaseModel):
    name: str
    location_lat: float
    location_lng: float
    address: Optional[str] = None
    sink_type: str = Field("district_heating", description="Type of heat sink")
    heat_demand_kw: float = Field(..., gt=0, description="Heat demand in kW")
    operating_temp_celsius: float = Field(60.0, ge=30, le=150, description="Operating temperature in Celsius")
    heat_price_kwh: Optional[float] = Field(None, gt=0, description="Heat price per kWh")
    connection_cost_km: Optional[float] = Field(100000, gt=0, description="Connection cost per km")
    seasonal_factor: float = Field(1.0, ge=0.1, le=2.0, description="Seasonal demand factor")
    efficiency_percent: float = Field(85.0, ge=0, le=100, description="Heat transfer efficiency percentage")

class HeatSinkCreate(HeatSinkBase):
    pass

class HeatSinkResponse(HeatSinkBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PredictionRequest(BaseModel):
    data_center_id: int
    carbon_credit_id: int
    heat_sink_ids: Optional[List[int]] = None
    scenario_name: str = Field("Base Case", description="Scenario name")
    analysis_years: int = Field(10, ge=1, le=30, description="Analysis period in years")
    discount_rate: float = Field(0.08, ge=0, le=0.3, description="Discount rate for NPV")
    
    # Override parameters (optional)
    custom_pue: Optional[float] = None
    custom_efficiency: Optional[float] = None
    custom_electricity_rate: Optional[float] = None
    custom_carbon_price: Optional[float] = None

class PredictionResponse(BaseModel):
    prediction_id: int
    data_center_name: str
    scenario_name: str
    prediction_date: datetime
    
    # Energy Metrics
    annual_energy_consumption_mwh: float
    energy_cost_per_year: float
    energy_savings_mwh: float
    energy_savings_percentage: float
    
    # Carbon Metrics
    annual_co2_emissions_tons: float
    co2_reduction_tons: float
    co2_reduction_percentage: float
    carbon_credit_cost: float
    
    # Financial Metrics
    total_capex: float
    annual_opex: float
    annual_savings: float
    net_present_value: float
    return_on_investment: float
    payback_period_years: float
    
    # Heat Recovery
    recoverable_heat_mw: float
    heat_utilization_percentage: float
    nearest_heat_sink_distance_km: float
    heat_sink_name: Optional[str] = None
    
    # Yearly Breakdown
    yearly_breakdown: List[Dict[str, float]]
    
    # Sensitivity Analysis
    sensitivity_analysis: Optional[Dict[str, float]] = None

    class Config:
        from_attributes = True

# Dependency to get prediction service
def get_prediction_service(db: Session = Depends(get_db)) -> PredictionService:
    return PredictionService(db)

# Data Center endpoints
@router.get("/data-centers", response_model=List[DataCenterResponse])
async def get_data_centers(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all data centers with pagination."""
    data_centers = db.query(DataCenter).offset(skip).limit(limit).all()
    return data_centers

@router.post("/data-centers", response_model=DataCenterResponse)
async def create_data_center(
    data_center: DataCenterCreate, 
    db: Session = Depends(get_db)
):
    """Create a new data center."""
    service = get_prediction_service(db)
    try:
        new_data_center = service.create_data_center(data_center.dict())
        return new_data_center
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/data-centers/{data_center_id}", response_model=DataCenterResponse)
async def get_data_center(data_center_id: int, db: Session = Depends(get_db)):
    """Get a specific data center by ID."""
    data_center = db.query(DataCenter).filter(DataCenter.id == data_center_id).first()
    if not data_center:
        raise HTTPException(status_code=404, detail="Data center not found")
    return data_center

@router.put("/data-centers/{data_center_id}", response_model=DataCenterResponse)
async def update_data_center(
    data_center_id: int,
    data_center_update: DataCenterUpdate,
    db: Session = Depends(get_db)
):
    """Update a data center."""
    data_center = db.query(DataCenter).filter(DataCenter.id == data_center_id).first()
    if not data_center:
        raise HTTPException(status_code=404, detail="Data center not found")
    
    update_data = data_center_update.dict(exclude_unset=True)
    for field, value in update_data.items():
        setattr(data_center, field, value)
    
    data_center.updated_at = datetime.utcnow()
    db.commit()
    db.refresh(data_center)
    return data_center

@router.delete("/data-centers/{data_center_id}")
async def delete_data_center(data_center_id: int, db: Session = Depends(get_db)):
    """Delete a data center."""
    data_center = db.query(DataCenter).filter(DataCenter.id == data_center_id).first()
    if not data_center:
        raise HTTPException(status_code=404, detail="Data center not found")
    
    db.delete(data_center)
    db.commit()
    return {"message": "Data center deleted successfully"}

# Carbon Credit endpoints
@router.get("/carbon-credits", response_model=List[CarbonCreditResponse])
async def get_carbon_credits(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db)
):
    """Get all carbon credits with pagination."""
    carbon_credits = db.query(CarbonCredit).offset(skip).limit(limit).all()
    return carbon_credits

@router.post("/carbon-credits", response_model=CarbonCreditResponse)
async def create_carbon_credit(
    carbon_credit: CarbonCreditCreate, 
    db: Session = Depends(get_db)
):
    """Create a new carbon credit."""
    service = get_prediction_service(db)
    try:
        new_carbon_credit = service.create_carbon_credit(carbon_credit.dict())
        return new_carbon_credit
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/carbon-credits/{carbon_credit_id}", response_model=CarbonCreditResponse)
async def get_carbon_credit(carbon_credit_id: int, db: Session = Depends(get_db)):
    """Get a specific carbon credit by ID."""
    carbon_credit = db.query(CarbonCredit).filter(CarbonCredit.id == carbon_credit_id).first()
    if not carbon_credit:
        raise HTTPException(status_code=404, detail="Carbon credit not found")
    return carbon_credit

# Heat Sink endpoints
@router.get("/heat-sinks", response_model=List[HeatSinkResponse])
async def get_heat_sinks(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    available_only: bool = Query(False),
    db: Session = Depends(get_db)
):
    """Get all heat sinks with pagination."""
    query = db.query(HeatSink)
    if available_only:
        query = query.filter(HeatSink.is_available == True)
    
    heat_sinks = query.offset(skip).limit(limit).all()
    return heat_sinks

@router.post("/heat-sinks", response_model=HeatSinkResponse)
async def create_heat_sink(
    heat_sink: HeatSinkCreate, 
    db: Session = Depends(get_db)
):
    """Create a new heat sink."""
    service = get_prediction_service(db)
    try:
        new_heat_sink = service.create_heat_sink(heat_sink.dict())
        return new_heat_sink
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/heat-sinks/{heat_sink_id}", response_model=HeatSinkResponse)
async def get_heat_sink(heat_sink_id: int, db: Session = Depends(get_db)):
    """Get a specific heat sink by ID."""
    heat_sink = db.query(HeatSink).filter(HeatSink.id == heat_sink_id).first()
    if not heat_sink:
        raise HTTPException(status_code=404, detail="Heat sink not found")
    return heat_sink

@router.get("/heat-sinks/nearby/{data_center_id}")
async def get_nearby_heat_sinks(
    data_center_id: int,
    max_distance_km: float = Query(50.0, ge=1.0, le=500.0),
    limit: int = Query(10, ge=1, le=50),
    db: Session = Depends(get_db)
):
    """Get heat sinks near a data center."""
    service = get_prediction_service(db)
    try:
        nearby_sinks = service.find_nearby_heat_sinks(data_center_id, max_distance_km, limit)
        return nearby_sinks
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

# Prediction endpoints
@router.post("/calculate", response_model=PredictionResponse)
async def calculate_savings_prediction(
    prediction_request: PredictionRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """Calculate comprehensive savings prediction for a data center."""
    service = get_prediction_service(db)
    
    try:
        # Validate that data center and carbon credit exist
        data_center = db.query(DataCenter).filter(DataCenter.id == prediction_request.data_center_id).first()
        if not data_center:
            raise HTTPException(status_code=404, detail="Data center not found")
        
        carbon_credit = db.query(CarbonCredit).filter(CarbonCredit.id == prediction_request.carbon_credit_id).first()
        if not carbon_credit:
            raise HTTPException(status_code=404, detail="Carbon credit not found")
        
        # Calculate prediction
        prediction_result = service.calculate_prediction(
            data_center_id=prediction_request.data_center_id,
            carbon_credit_id=prediction_request.carbon_credit_id,
            heat_sink_id=prediction_request.heat_sink_ids[0] if prediction_request.heat_sink_ids else None,
            prediction_years=prediction_request.analysis_years,
            scenarios=[prediction_request.scenario_name]
        )
        
        # Transform the result to match PredictionResponse model
        base_case = prediction_result.get("base_case", {})
        scenario_data = prediction_result.get("scenarios", {}).get(prediction_request.scenario_name, {})
        heat_sink_analysis = prediction_result.get("heat_sink_analysis", {})
        
        # Create response matching the expected model
        response = PredictionResponse(
            prediction_id=0,  # Will be set when saved
            data_center_name=prediction_result.get("data_center", {}).get("name", "Unknown"),
            scenario_name=prediction_request.scenario_name,
            prediction_date=datetime.utcnow(),
            
            # Energy Metrics
            annual_energy_consumption_mwh=base_case.get("total_annual_kwh", 0) / 1000,  # Convert kWh to MWh
            energy_cost_per_year=base_case.get("energy_opex_annual", 0),
            energy_savings_mwh=scenario_data.get("energy_savings_annual", 0) / 1000,
            energy_savings_percentage=0.0,  # Calculate if needed
            
            # Carbon Metrics
            annual_co2_emissions_tons=base_case.get("annual_co2_tons", 0),
            co2_reduction_tons=scenario_data.get("carbon_savings_annual", 0),
            co2_reduction_percentage=0.0,  # Calculate if needed
            carbon_credit_cost=base_case.get("carbon_credit_opex_annual", 0),
            
            # Financial Metrics
            total_capex=base_case.get("total_capex", 0),
            annual_opex=base_case.get("total_opex_annual", 0),
            annual_savings=scenario_data.get("total_savings_annual", 0),
            net_present_value=scenario_data.get("net_present_value", 0),
            return_on_investment=scenario_data.get("return_on_investment_percent", 0),
            payback_period_years=scenario_data.get("payback_period_years", 999.0),  # Use 999 instead of inf
            
            # Heat Recovery
            recoverable_heat_mw=0.0,  # Calculate if needed
            heat_utilization_percentage=0.0,
            nearest_heat_sink_distance_km=heat_sink_analysis.get("distance_km", 0),
            heat_sink_name=heat_sink_analysis.get("selected_sink"),
            
            # Yearly Breakdown
            yearly_breakdown=prediction_result.get("yearly_breakdown", []),
            
            # Sensitivity Analysis
            sensitivity_analysis=None
        )
        
        # Save prediction in background
        background_tasks.add_task(
            service.save_prediction,
            prediction_result
        )
        
        return response
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Internal server error: {str(e)}")

@router.get("/predictions", response_model=List[Dict[str, Any]])
async def get_predictions(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=200),
    data_center_id: Optional[int] = Query(None),
    db: Session = Depends(get_db)
):
    """Get saved predictions with pagination."""
    query = db.query(SavingsPrediction)
    
    if data_center_id:
        query = query.filter(SavingsPrediction.data_center_id == data_center_id)
    
    predictions = query.order_by(SavingsPrediction.created_at.desc()).offset(skip).limit(limit).all()
    
    return [
        {
            "id": p.id,
            "data_center_id": p.data_center_id,
            "scenario_name": p.scenario_name,
            "annual_savings": p.annual_savings,
            "roi_percentage": p.roi_percentage,
            "payback_period_years": p.payback_period_years,
            "created_at": p.created_at,
            "prediction_results": json.loads(p.prediction_results) if p.prediction_results else None
        }
        for p in predictions
    ]

@router.get("/predictions/{prediction_id}", response_model=Dict[str, Any])
async def get_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """Get a specific prediction by ID."""
    prediction = db.query(SavingsPrediction).filter(SavingsPrediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    return {
        "id": prediction.id,
        "data_center_id": prediction.data_center_id,
        "carbon_credit_id": prediction.carbon_credit_id,
        "scenario_name": prediction.scenario_name,
        "annual_savings": prediction.annual_savings,
        "roi_percentage": prediction.roi_percentage,
        "payback_period_years": prediction.payback_period_years,
        "created_at": prediction.created_at,
        "prediction_results": json.loads(prediction.prediction_results) if prediction.prediction_results else None
    }

@router.delete("/predictions/{prediction_id}")
async def delete_prediction(prediction_id: int, db: Session = Depends(get_db)):
    """Delete a prediction."""
    prediction = db.query(SavingsPrediction).filter(SavingsPrediction.id == prediction_id).first()
    if not prediction:
        raise HTTPException(status_code=404, detail="Prediction not found")
    
    db.delete(prediction)
    db.commit()
    return {"message": "Prediction deleted successfully"}

# Analytics endpoints
@router.get("/analytics/summary")
async def get_prediction_analytics(db: Session = Depends(get_db)):
    """Get summary analytics for all predictions."""
    total_predictions = db.query(SavingsPrediction).count()
    total_data_centers = db.query(DataCenter).count()
    total_carbon_credits = db.query(CarbonCredit).count()
    total_heat_sinks = db.query(HeatSink).count()
    
    # Calculate average metrics
    avg_savings = db.query(func.avg(SavingsPrediction.annual_savings)).scalar() or 0
    avg_roi = db.query(func.avg(SavingsPrediction.roi_percentage)).scalar() or 0
    avg_payback = db.query(func.avg(SavingsPrediction.payback_period_years)).scalar() or 0
    
    return {
        "summary": {
            "total_predictions": total_predictions,
            "total_data_centers": total_data_centers,
            "total_carbon_credits": total_carbon_credits,
            "total_heat_sinks": total_heat_sinks
        },
        "averages": {
            "annual_savings": round(avg_savings, 2),
            "roi_percentage": round(avg_roi, 2),
            "payback_period_years": round(avg_payback, 2)
        }
    }

# Health check for prediction system
@router.get("/health")
async def prediction_health_check():
    """Health check for prediction system."""
    return {
        "status": "healthy",
        "service": "Data Center Savings Prediction API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }