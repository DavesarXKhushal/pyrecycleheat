from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
import json
from datetime import datetime

from prediction_models import (
    DataCenter, CarbonCredit, HeatSink, SavingsPrediction, 
    PredictionScenario, DataCenterType, CoolingType, EnergySource
)
from prediction_engine import DataCenterPredictionEngine

class PredictionService:
    """Service layer for data center savings predictions"""
    
    def __init__(self, db: Session):
        self.db = db
        self.engine = DataCenterPredictionEngine()
    
    def create_data_center(self, data_center_data: Dict) -> DataCenter:
        """Create a new data center entry"""
        
        data_center = DataCenter(
            name=data_center_data["name"],
            location_lat=data_center_data["location_lat"],
            location_lng=data_center_data["location_lng"],
            address=data_center_data.get("address"),
            dc_type=DataCenterType(data_center_data["dc_type"]),
            total_it_load_kw=data_center_data["total_it_load_kw"],
            pue=data_center_data.get("pue", 1.5),
            cooling_type=CoolingType(data_center_data["cooling_type"]),
            energy_source=EnergySource(data_center_data.get("energy_source", "grid")),
            floor_area_sqm=data_center_data.get("floor_area_sqm"),
            rack_count=data_center_data.get("rack_count"),
            server_count=data_center_data.get("server_count"),
            storage_capacity_tb=data_center_data.get("storage_capacity_tb"),
            utilization_percent=data_center_data.get("utilization_percent", 70.0),
            operating_hours_year=data_center_data.get("operating_hours_year", 8760),
            ambient_temp_celsius=data_center_data.get("ambient_temp_celsius", 25.0),
            electricity_cost_kwh=data_center_data["electricity_cost_kwh"],
            cooling_cost_kwh=data_center_data.get("cooling_cost_kwh"),
            maintenance_cost_annual=data_center_data.get("maintenance_cost_annual", 0.0)
        )
        
        self.db.add(data_center)
        self.db.commit()
        self.db.refresh(data_center)
        
        return data_center
    
    def create_carbon_credit(self, carbon_credit_data: Dict) -> CarbonCredit:
        """Create a new carbon credit entry"""
        
        carbon_credit = CarbonCredit(
            name=carbon_credit_data["name"],
            price_per_ton_co2=carbon_credit_data["price_per_ton_co2"],
            validity_years=carbon_credit_data.get("validity_years", 5),
            certification_standard=carbon_credit_data.get("certification_standard"),
            project_type=carbon_credit_data.get("project_type"),
            region=carbon_credit_data.get("region"),
            vintage_year=carbon_credit_data.get("vintage_year"),
            market_price_trend=carbon_credit_data.get("market_price_trend", 0.0),
            availability_tons=carbon_credit_data.get("availability_tons"),
            description=carbon_credit_data.get("description")
        )
        
        self.db.add(carbon_credit)
        self.db.commit()
        self.db.refresh(carbon_credit)
        
        return carbon_credit
    
    def create_heat_sink(self, heat_sink_data: Dict) -> HeatSink:
        """Create a new heat sink entry"""
        
        heat_sink = HeatSink(
            name=heat_sink_data["name"],
            location_lat=heat_sink_data["location_lat"],
            location_lng=heat_sink_data["location_lng"],
            address=heat_sink_data.get("address"),
            sink_type=heat_sink_data["sink_type"],
            heat_demand_kw=heat_sink_data["heat_demand_kw"],
            operating_temp_celsius=heat_sink_data.get("operating_temp_celsius", 60.0),
            heat_price_kwh=heat_sink_data.get("heat_price_kwh"),
            connection_cost_km=heat_sink_data.get("connection_cost_km", 100000),
            seasonal_factor=heat_sink_data.get("seasonal_factor", 1.0),
            efficiency_percent=heat_sink_data.get("efficiency_percent", 85.0)
        )
        
        self.db.add(heat_sink)
        self.db.commit()
        self.db.refresh(heat_sink)
        
        return heat_sink
    
    def find_nearby_heat_sinks(self, 
                              dc_lat: float, 
                              dc_lng: float, 
                              max_distance_km: float = 50.0) -> List[Dict]:
        """Find heat sinks within specified distance of data center"""
        
        heat_sinks = self.db.query(HeatSink).all()
        nearby_sinks = []
        
        for sink in heat_sinks:
            distance = self.engine.calculate_distance_to_heat_sink(
                dc_lat, dc_lng, sink.location_lat, sink.location_lng
            )
            
            if distance <= max_distance_km:
                nearby_sinks.append({
                    "heat_sink": sink,
                    "distance_km": distance,
                    "connection_feasible": distance <= 20.0  # Economically feasible within 20km
                })
        
        # Sort by distance
        nearby_sinks.sort(key=lambda x: x["distance_km"])
        
        return nearby_sinks
    
    def calculate_prediction(self,
                           data_center_id: int,
                           carbon_credit_id: Optional[int] = None,
                           heat_sink_id: Optional[int] = None,
                           prediction_years: int = 10,
                           scenarios: List[str] = None) -> Dict:
        """Calculate comprehensive savings prediction"""
        
        # Get data center
        data_center = self.db.query(DataCenter).filter(DataCenter.id == data_center_id).first()
        if not data_center:
            raise ValueError(f"Data center with ID {data_center_id} not found")
        
        # Get carbon credit if specified
        carbon_credit = None
        if carbon_credit_id:
            carbon_credit = self.db.query(CarbonCredit).filter(CarbonCredit.id == carbon_credit_id).first()
        
        # Get heat sink if specified
        heat_sink = None
        distance_to_sink = 0.0
        if heat_sink_id:
            heat_sink = self.db.query(HeatSink).filter(HeatSink.id == heat_sink_id).first()
            if heat_sink:
                distance_to_sink = self.engine.calculate_distance_to_heat_sink(
                    data_center.location_lat, data_center.location_lng,
                    heat_sink.location_lat, heat_sink.location_lng
                )
        
        # Calculate base case (current state)
        base_case = self._calculate_base_case(data_center, carbon_credit, distance_to_sink)
        
        # Calculate improved scenarios
        scenarios_results = {}
        if scenarios:
            for scenario_name in scenarios:
                scenarios_results[scenario_name] = self._calculate_scenario(
                    data_center, carbon_credit, heat_sink, distance_to_sink, scenario_name
                )
        
        # Calculate savings for each scenario
        savings_results = {}
        for scenario_name, scenario_data in scenarios_results.items():
            savings = self.engine.calculate_savings_scenarios(base_case, scenario_data)
            financial_metrics = self.engine.calculate_financial_metrics(
                scenario_data["total_capex"],
                savings["total_savings_annual"],
                prediction_years
            )
            
            savings_results[scenario_name] = {
                **savings,
                **financial_metrics,
                "scenario_data": scenario_data
            }
        
        # Generate yearly breakdown for best scenario
        best_scenario = max(savings_results.items(), key=lambda x: x[1]["total_savings_annual"]) if savings_results else None
        yearly_breakdown = []
        if best_scenario:
            yearly_breakdown = self.engine.generate_yearly_breakdown(
                best_scenario[1]["total_savings_annual"],
                prediction_years
            )
        
        return {
            "data_center": {
                "id": data_center.id,
                "name": data_center.name,
                "location": {"lat": data_center.location_lat, "lng": data_center.location_lng},
                "specifications": {
                    "it_load_kw": data_center.total_it_load_kw,
                    "pue": data_center.pue,
                    "utilization_percent": data_center.utilization_percent,
                    "electricity_cost_kwh": data_center.electricity_cost_kwh
                }
            },
            "base_case": base_case,
            "scenarios": savings_results,
            "yearly_breakdown": yearly_breakdown,
            "heat_sink_analysis": {
                "selected_sink": heat_sink.name if heat_sink else None,
                "distance_km": distance_to_sink,
                "connection_feasible": distance_to_sink <= 20.0 if heat_sink else False
            },
            "carbon_credit": {
                "name": carbon_credit.name if carbon_credit else None,
                "price_per_ton": carbon_credit.price_per_ton_co2 if carbon_credit else 0
            }
        }
    
    def _calculate_base_case(self, 
                           data_center: DataCenter, 
                           carbon_credit: Optional[CarbonCredit],
                           distance_to_sink: float) -> Dict:
        """Calculate base case scenario (current state)"""
        
        # Energy consumption
        energy_data = self.engine.calculate_energy_consumption(
            data_center.total_it_load_kw,
            data_center.pue,
            data_center.utilization_percent,
            data_center.operating_hours_year
        )
        
        # Carbon emissions
        carbon_data = self.engine.calculate_carbon_emissions(
            energy_data["total_annual_kwh"],
            renewable_percent=20.0 if data_center.energy_source.value == "renewable" else 0.0
        )
        
        # CAPEX (minimal for base case)
        capex_data = self.engine.calculate_capex(
            data_center.total_it_load_kw,
            heat_recovery_enabled=False,
            distance_to_sink_km=0.0
        )
        
        # OPEX
        carbon_price = carbon_credit.price_per_ton_co2 if carbon_credit else 0.0
        opex_data = self.engine.calculate_opex(
            it_load_kw=data_center.total_it_load_kw,
            annual_energy_consumption_kwh=energy_data["total_annual_kwh"],
            heat_recovery_enabled=False,
            distance_to_sink_km=distance_to_sink,
            electricity_rate_per_kwh=data_center.electricity_cost_kwh,
            maintenance_rate=0.03
        )
        
        return {
            **energy_data,
            **carbon_data,
            **capex_data,
            **opex_data
        }
    
    def _calculate_scenario(self,
                          data_center: DataCenter,
                          carbon_credit: Optional[CarbonCredit],
                          heat_sink: Optional[HeatSink],
                          distance_to_sink: float,
                          scenario_name: str) -> Dict:
        """Calculate specific improvement scenario"""
        
        # Scenario-specific improvements
        pue_improvement = 0.0
        renewable_percent = 0.0
        heat_recovery_enabled = False
        
        if scenario_name == "efficiency_improvement":
            pue_improvement = 0.3  # 30% PUE improvement
        elif scenario_name == "renewable_energy":
            renewable_percent = 80.0  # 80% renewable energy
        elif scenario_name == "heat_recovery":
            heat_recovery_enabled = True
        elif scenario_name == "comprehensive":
            pue_improvement = 0.2
            renewable_percent = 60.0
            heat_recovery_enabled = True
        
        # Improved PUE
        improved_pue = data_center.pue * (1 - pue_improvement)
        
        # Energy consumption with improvements
        energy_data = self.engine.calculate_energy_consumption(
            data_center.total_it_load_kw,
            improved_pue,
            data_center.utilization_percent,
            data_center.operating_hours_year
        )
        
        # Carbon emissions with improvements
        carbon_data = self.engine.calculate_carbon_emissions(
            energy_data["total_annual_kwh"],
            renewable_percent=renewable_percent
        )
        
        # Heat recovery potential
        heat_recovery_revenue = 0.0
        if heat_recovery_enabled and heat_sink:
            heat_data = self.engine.calculate_heat_recovery_potential(
                data_center.total_it_load_kw,
                data_center.utilization_percent,
                data_center.operating_hours_year
            )
            
            # Calculate revenue from heat sales
            recoverable_heat = min(
                heat_data["annual_recoverable_heat_kwh"],
                heat_sink.heat_demand_kw * heat_sink.seasonal_factor * data_center.operating_hours_year
            )
            heat_recovery_revenue = recoverable_heat * (heat_sink.heat_price_kwh or 0.05)
        
        # CAPEX with improvements
        capex_data = self.engine.calculate_capex(
            data_center.total_it_load_kw,
            heat_recovery_enabled=heat_recovery_enabled,
            distance_to_sink_km=distance_to_sink,
            connection_cost_per_km=heat_sink.connection_cost_km if heat_sink else 100000
        )
        
        # OPEX with improvements
        carbon_price = carbon_credit.price_per_ton_co2 if carbon_credit else 0.0
        opex_data = self.engine.calculate_opex(
            it_load_kw=data_center.total_it_load_kw,
            annual_energy_consumption_kwh=energy_data["total_annual_kwh"],
            heat_recovery_enabled=heat_recovery_enabled,
            distance_to_sink_km=distance_to_sink,
            electricity_rate_per_kwh=data_center.electricity_cost_kwh,
            maintenance_rate=0.03
        )
        
        return {
            **energy_data,
            **carbon_data,
            **capex_data,
            **opex_data,
            "improvements": {
                "pue_improvement": pue_improvement,
                "renewable_percent": renewable_percent,
                "heat_recovery_enabled": heat_recovery_enabled,
                "improved_pue": improved_pue
            }
        }
    
    def save_prediction(self, prediction_data: Dict) -> SavingsPrediction:
        """Save prediction results to database"""
        
        prediction = SavingsPrediction(
            data_center_id=prediction_data["data_center_id"],
            carbon_credit_id=prediction_data.get("carbon_credit_id"),
            heat_sink_id=prediction_data.get("heat_sink_id"),
            prediction_years=prediction_data.get("prediction_years", 10),
            discount_rate=prediction_data.get("discount_rate", 0.08),
            annual_energy_consumption_kwh=prediction_data["annual_energy_consumption_kwh"],
            annual_cooling_energy_kwh=prediction_data.get("annual_cooling_energy_kwh", 0),
            total_energy_cost_annual=prediction_data["total_energy_cost_annual"],
            recoverable_heat_kwh_annual=prediction_data.get("recoverable_heat_kwh_annual", 0),
            heat_recovery_revenue_annual=prediction_data.get("heat_recovery_revenue_annual", 0),
            distance_to_heat_sink_km=prediction_data.get("distance_to_heat_sink_km", 0),
            annual_co2_emissions_tons=prediction_data["annual_co2_emissions_tons"],
            carbon_credit_cost_annual=prediction_data.get("carbon_credit_cost_annual", 0),
            carbon_savings_tons_annual=prediction_data.get("carbon_savings_tons_annual", 0),
            infrastructure_capex=prediction_data.get("infrastructure_capex", 0),
            heat_recovery_capex=prediction_data.get("heat_recovery_capex", 0),
            carbon_offset_capex=prediction_data.get("carbon_offset_capex", 0),
            total_capex=prediction_data["total_capex"],
            energy_opex_annual=prediction_data["energy_opex_annual"],
            maintenance_opex_annual=prediction_data.get("maintenance_opex_annual", 0),
            carbon_credit_opex_annual=prediction_data.get("carbon_credit_opex_annual", 0),
            total_opex_annual=prediction_data["total_opex_annual"],
            energy_savings_annual=prediction_data.get("energy_savings_annual", 0),
            carbon_savings_annual=prediction_data.get("carbon_savings_annual", 0),
            heat_recovery_savings_annual=prediction_data.get("heat_recovery_savings_annual", 0),
            total_savings_annual=prediction_data["total_savings_annual"],
            net_present_value=prediction_data.get("net_present_value"),
            return_on_investment_percent=prediction_data.get("return_on_investment_percent"),
            payback_period_years=prediction_data.get("payback_period_years"),
            yearly_breakdown=prediction_data.get("yearly_breakdown"),
            sensitivity_analysis=prediction_data.get("sensitivity_analysis")
        )
        
        self.db.add(prediction)
        self.db.commit()
        self.db.refresh(prediction)
        
        return prediction
    
    def get_all_data_centers(self) -> List[DataCenter]:
        """Get all data centers"""
        return self.db.query(DataCenter).all()
    
    def get_all_carbon_credits(self) -> List[CarbonCredit]:
        """Get all carbon credits"""
        return self.db.query(CarbonCredit).all()
    
    def get_all_heat_sinks(self) -> List[HeatSink]:
        """Get all heat sinks"""
        return self.db.query(HeatSink).all()
    
    def get_predictions_by_data_center(self, data_center_id: int) -> List[SavingsPrediction]:
        """Get all predictions for a specific data center"""
        return self.db.query(SavingsPrediction).filter(
            SavingsPrediction.data_center_id == data_center_id
        ).all()