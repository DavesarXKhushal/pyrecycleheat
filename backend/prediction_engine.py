import math
import numpy as np
from typing import Dict, List, Optional, Tuple
from datetime import datetime, timedelta
from geopy.distance import geodesic
from dataclasses import dataclass
from functools import lru_cache
import asyncio
from concurrent.futures import ThreadPoolExecutor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@dataclass
class OptimizedPredictionInput:
    """Optimized input structure for batch calculations"""
    data_center_specs: Dict
    carbon_credit_specs: Dict
    heat_sink_specs: Dict
    analysis_years: int = 10
    discount_rate: float = 0.08
    
@dataclass
class OptimizedPredictionResult:
    """Optimized result structure with pre-calculated metrics"""
    energy_metrics: Dict
    financial_metrics: Dict
    carbon_metrics: Dict
    heat_recovery_metrics: Dict
    yearly_breakdown: List[Dict]
    sensitivity_analysis: Dict

class DataCenterPredictionEngine:
    """
    High-performance prediction engine with caching and vectorized calculations
    Based on industry standards and similar to Carbon Reform calculator
    """
    
    def __init__(self):
        self.executor = ThreadPoolExecutor(max_workers=4)
        self._cache_stats = {"hits": 0, "misses": 0}
        
        # Industry standard constants - Based on real-world data center metrics
        self.CO2_EMISSION_FACTOR_KWH = 0.4  # kg CO2 per kWh (US grid average)
        self.HEAT_RECOVERY_EFFICIENCY = 0.75  # 75% heat recovery efficiency (industry standard)
        self.COOLING_LOAD_FACTOR = 0.4  # 40% of total power goes to cooling
        self.IT_HEAT_GENERATION_FACTOR = 0.95  # 95% of IT power becomes heat (thermodynamics)
        
        # Enhanced physics-based constants for accurate calculations
        self.THERMAL_EFFICIENCY_FACTOR = 0.85  # Heat exchanger thermal efficiency
        self.PIPE_HEAT_LOSS_PER_KM = 0.02  # 2% heat loss per km of piping
        self.CARNOT_EFFICIENCY_FACTOR = 0.6  # Carnot cycle efficiency for heat pumps
        self.SPECIFIC_HEAT_WATER = 4.186  # kJ/kg·K - specific heat of water
        self.WATER_DENSITY = 1000  # kg/m³ - density of water
        
        # Economic constants
        self.DISCOUNT_RATE_DEFAULT = 0.08  # 8% discount rate (standard for infrastructure projects)
        self.INFLATION_RATE = 0.03  # 3% inflation
        
    def calculate_energy_consumption(self, 
                                   it_load_kw: float, 
                                   pue: float, 
                                   utilization_percent: float,
                                   operating_hours_year: int = 8760) -> Dict[str, float]:
        """Calculate annual energy consumption breakdown"""
        
        # Calculate actual IT load based on utilization
        actual_it_load_kw = it_load_kw * (utilization_percent / 100)
        
        # Total facility load including cooling, lighting, etc.
        total_facility_load_kw = actual_it_load_kw * pue
        
        # Annual energy consumption
        annual_energy_kwh = total_facility_load_kw * operating_hours_year
        
        # Breakdown by component
        it_energy_kwh = actual_it_load_kw * operating_hours_year
        cooling_energy_kwh = (total_facility_load_kw - actual_it_load_kw) * operating_hours_year
        
        return {
            "total_annual_kwh": annual_energy_kwh,
            "it_energy_kwh": it_energy_kwh,
            "cooling_energy_kwh": cooling_energy_kwh,
            "average_power_kw": total_facility_load_kw,
            "peak_power_kw": it_load_kw * pue  # Assuming peak utilization
        }
    
    def calculate_carbon_emissions(self, 
                                 annual_energy_kwh: float,
                                 renewable_percent: float = 0.0,
                                 emission_factor: float = None) -> Dict[str, float]:
        """Calculate CO2 emissions and carbon offset requirements"""
        
        if emission_factor is None:
            emission_factor = self.CO2_EMISSION_FACTOR_KWH
        
        # Grid energy consumption (non-renewable)
        grid_energy_kwh = annual_energy_kwh * (1 - renewable_percent / 100)
        
        # CO2 emissions in tons
        annual_co2_tons = (grid_energy_kwh * emission_factor) / 1000
        
        # Renewable energy savings
        renewable_co2_avoided_tons = (annual_energy_kwh * renewable_percent / 100 * emission_factor) / 1000
        
        return {
            "annual_co2_tons": annual_co2_tons,
            "grid_energy_kwh": grid_energy_kwh,
            "renewable_energy_kwh": annual_energy_kwh * renewable_percent / 100,
            "co2_avoided_renewable_tons": renewable_co2_avoided_tons
        }
    
    def calculate_heat_recovery_potential(self,
                                        it_load_kw: float,
                                        utilization_percent: float,
                                        operating_hours_year: int = 8760,
                                        distance_to_sink_km: float = 0.0) -> Dict[str, float]:
        """
        Calculate waste heat recovery potential with physics-based accuracy
        Based on thermodynamic principles and real-world heat recovery systems
        """
        
        # IT equipment generates heat equal to power consumption (First Law of Thermodynamics)
        actual_it_load_kw = it_load_kw * (utilization_percent / 100)
        heat_generated_kw = actual_it_load_kw * self.IT_HEAT_GENERATION_FACTOR
        
        # Account for heat exchanger efficiency and pipe losses
        heat_exchanger_efficiency = self.THERMAL_EFFICIENCY_FACTOR
        pipe_loss_factor = 1 - (distance_to_sink_km * self.PIPE_HEAT_LOSS_PER_KM)
        pipe_loss_factor = max(0.5, pipe_loss_factor)  # Minimum 50% efficiency
        
        # Total system efficiency
        system_efficiency = self.HEAT_RECOVERY_EFFICIENCY * heat_exchanger_efficiency * pipe_loss_factor
        
        # Recoverable heat accounting for all losses
        recoverable_heat_kw = heat_generated_kw * system_efficiency
        
        # Annual recoverable heat
        annual_recoverable_heat_kwh = recoverable_heat_kw * operating_hours_year
        
        # Calculate thermal energy in BTU/hr for industry compatibility
        recoverable_heat_btu_hr = recoverable_heat_kw * 3412.14  # kW to BTU/hr conversion
        
        # Calculate equivalent heating capacity (for district heating)
        equivalent_homes_heated = recoverable_heat_kw / 15  # Assuming 15kW average home heating load
        
        return {
            "heat_generated_kw": heat_generated_kw,
            "recoverable_heat_kw": recoverable_heat_kw,
            "annual_recoverable_heat_kwh": annual_recoverable_heat_kwh,
            "recoverable_heat_btu_hr": recoverable_heat_btu_hr,
            "system_efficiency": system_efficiency,
            "heat_exchanger_efficiency": heat_exchanger_efficiency,
            "pipe_loss_factor": pipe_loss_factor,
            "equivalent_homes_heated": equivalent_homes_heated,
            "distance_to_sink_km": distance_to_sink_km
        }
    
    def calculate_distance_to_heat_sink(self,
                                      dc_lat: float, dc_lng: float,
                                      sink_lat: float, sink_lng: float) -> float:
        """Calculate distance between data center and heat sink"""
        
        dc_coords = (dc_lat, dc_lng)
        sink_coords = (sink_lat, sink_lng)
        
        # Calculate geodesic distance in kilometers
        distance_km = geodesic(dc_coords, sink_coords).kilometers
        
        return distance_km
    
    def calculate_capex(self,
                       it_load_kw: float,
                       heat_recovery_enabled: bool = False,
                       distance_to_sink_km: float = 0.0,
                       connection_cost_per_km: float = 100000,
                       heat_exchanger_size_factor: float = 1.0) -> Dict[str, float]:
        """
        Calculate Capital Expenditure (CAPEX) with detailed cost breakdown
        Based on industry benchmarks and engineering estimates
        """
        
        # Base infrastructure CAPEX (per kW of IT load) - Industry standard
        base_capex_per_kw = 5000  # $5,000 per kW (Uptime Institute data)
        infrastructure_capex = it_load_kw * base_capex_per_kw
        
        # Heat recovery system CAPEX with detailed breakdown
        heat_recovery_capex = 0.0
        heat_exchanger_cost = 0.0
        pipeline_cost = 0.0
        pumping_system_cost = 0.0
        
        if heat_recovery_enabled:
            # Heat exchanger cost - scales with thermal capacity
            heat_exchanger_cost = it_load_kw * 500 * heat_exchanger_size_factor  # $500 per kW base
            
            # Pipeline cost - includes materials, labor, and installation
            pipeline_cost_per_km = connection_cost_per_km
            pipeline_cost = distance_to_sink_km * pipeline_cost_per_km
            
            # Pumping system cost - for circulating heat transfer fluid
            pumping_system_cost = it_load_kw * 150  # $150 per kW for pumps and controls
            
            # Additional system components
            control_system_cost = it_load_kw * 100  # $100 per kW for automation
            
            heat_recovery_capex = (heat_exchanger_cost + pipeline_cost + 
                                 pumping_system_cost + control_system_cost)
        
        # Carbon offset infrastructure (monitoring and verification systems)
        carbon_offset_capex = it_load_kw * 50 if heat_recovery_enabled else 0  # $50 per kW
        
        total_capex = infrastructure_capex + heat_recovery_capex + carbon_offset_capex
        
        return {
            "infrastructure_capex": infrastructure_capex,
            "heat_exchanger_cost": heat_exchanger_cost,
            "pipeline_cost": pipeline_cost,
            "pumping_system_cost": pumping_system_cost,
            "heat_recovery_capex": heat_recovery_capex,
            "carbon_offset_capex": carbon_offset_capex,
            "total_capex": total_capex,
            "capex_per_kw": total_capex / it_load_kw
        }
    
    def calculate_opex(self,
                      it_load_kw: float,
                      annual_energy_consumption_kwh: float,
                      heat_recovery_enabled: bool = False,
                      distance_to_sink_km: float = 0.0,
                      electricity_rate_per_kwh: float = 0.15,
                      maintenance_rate: float = 0.03) -> Dict[str, float]:
        """
        Calculate Operational Expenditure (OPEX) with detailed breakdown
        Based on industry standards and operational requirements
        """
        
        # Energy costs - primary operational expense
        annual_energy_cost = annual_energy_consumption_kwh * electricity_rate_per_kwh
        
        # Base maintenance costs (percentage of infrastructure CAPEX)
        base_infrastructure_capex = it_load_kw * 5000  # From CAPEX calculation
        base_maintenance_cost = base_infrastructure_capex * maintenance_rate
        
        # Heat recovery system OPEX
        heat_recovery_maintenance = 0.0
        pumping_energy_cost = 0.0
        monitoring_cost = 0.0
        
        if heat_recovery_enabled:
            # Heat recovery system maintenance (higher rate due to complexity)
            heat_recovery_capex = it_load_kw * 750  # Estimated heat recovery CAPEX
            heat_recovery_maintenance = heat_recovery_capex * (maintenance_rate + 0.02)  # +2% for complexity
            
            # Pumping energy costs for heat transfer fluid circulation
            pump_power_kw = it_load_kw * 0.05  # 5% of IT load for pumping
            pumping_hours_per_year = 8760  # Continuous operation
            pumping_energy_kwh = pump_power_kw * pumping_hours_per_year
            pumping_energy_cost = pumping_energy_kwh * electricity_rate_per_kwh
            
            # Monitoring and verification costs for carbon credits
            monitoring_cost = it_load_kw * 25  # $25 per kW annually for monitoring
        
        # Carbon offset costs (if purchasing offsets instead of generating)
        carbon_offset_cost = 0.0  # Assumed to be revenue-generating through heat recovery
        
        # Staff and operational overhead
        operational_overhead = it_load_kw * 100  # $100 per kW annually
        
        total_opex = (annual_energy_cost + base_maintenance_cost + 
                     heat_recovery_maintenance + pumping_energy_cost + 
                     monitoring_cost + carbon_offset_cost + operational_overhead)
        
        return {
            "annual_energy_cost": annual_energy_cost,
            "base_maintenance_cost": base_maintenance_cost,
            "heat_recovery_maintenance": heat_recovery_maintenance,
            "pumping_energy_cost": pumping_energy_cost,
            "monitoring_cost": monitoring_cost,
            "carbon_offset_cost": carbon_offset_cost,
            "operational_overhead": operational_overhead,
            "total_opex": total_opex,
            "opex_per_kw": total_opex / it_load_kw,
            "energy_cost_percentage": (annual_energy_cost / total_opex) * 100
        }
    
    def calculate_savings_scenarios(self,
                                  base_case: Dict,
                                  improved_case: Dict) -> Dict[str, float]:
        """Calculate savings between base case and improved scenario"""
        
        # Energy savings - compare total OPEX
        base_total_opex = base_case.get("total_opex", 0)
        improved_total_opex = improved_case.get("total_opex", 0)
        energy_savings_annual = base_total_opex - improved_total_opex
        
        # Heat recovery revenue (new income stream from waste heat)
        heat_recovery_revenue = 0.0
        if improved_case.get("heat_recovery_enabled", False):
            # Calculate revenue from heat recovery based on recoverable heat
            recoverable_heat_mw = improved_case.get("recoverable_heat_mw", 0)
            # Assume $50 per MWh thermal energy value
            heat_recovery_revenue = recoverable_heat_mw * 8760 * 50  # Annual revenue
        
        # Carbon credit revenue from reduced emissions
        base_emissions = base_case.get("annual_co2_tons", 0)
        improved_emissions = improved_case.get("annual_co2_tons", 0)
        co2_reduction_tons = base_emissions - improved_emissions
        carbon_credit_revenue = co2_reduction_tons * 45  # $45 per ton CO2
        
        # Total annual savings
        total_savings_annual = (energy_savings_annual + 
                              heat_recovery_revenue + 
                              carbon_credit_revenue)
        
        return {
            "energy_savings_annual": energy_savings_annual,
            "heat_recovery_revenue_annual": heat_recovery_revenue,
            "carbon_credit_revenue_annual": carbon_credit_revenue,
            "co2_reduction_tons": co2_reduction_tons,
            "total_savings_annual": total_savings_annual
        }
    
    def calculate_financial_metrics(self,
                                  total_capex: float,
                                  annual_savings: float,
                                  project_years: int = 10,
                                  discount_rate: float = None,
                                  escalation_rate: float = 0.03,
                                  tax_rate: float = 0.25,
                                  depreciation_years: int = 7) -> Dict[str, float]:
        """
        Calculate comprehensive financial metrics including NPV, IRR, ROI, and payback period
        Uses industry-standard financial analysis methods
        """
        
        if discount_rate is None:
            discount_rate = self.DISCOUNT_RATE_DEFAULT
        
        # Calculate NPV with escalating cash flows
        npv = -total_capex  # Initial investment (negative cash flow)
        cumulative_cash_flow = -total_capex
        payback_achieved = False
        payback_period_years = 999.0
        
        yearly_cash_flows = []
        
        for year in range(1, project_years + 1):
            # Escalate annual savings
            escalated_savings = annual_savings * ((1 + escalation_rate) ** (year - 1))
            
            # Calculate tax benefits from depreciation (MACRS 7-year)
            if year <= depreciation_years:
                # Simplified straight-line depreciation for clarity
                annual_depreciation = total_capex / depreciation_years
                tax_shield = annual_depreciation * tax_rate
            else:
                tax_shield = 0
            
            # Net cash flow after taxes
            net_cash_flow = escalated_savings + tax_shield
            yearly_cash_flows.append(net_cash_flow)
            
            # Discount to present value
            discounted_cash_flow = net_cash_flow / ((1 + discount_rate) ** year)
            npv += discounted_cash_flow
            
            # Track cumulative cash flow for payback calculation
            cumulative_cash_flow += net_cash_flow
            if not payback_achieved and cumulative_cash_flow >= 0:
                payback_period_years = year
                payback_achieved = True
        
        # Calculate IRR using Newton-Raphson method
        irr = self._calculate_irr([-total_capex] + yearly_cash_flows)
        
        # Calculate ROI (simple return on investment)
        total_undiscounted_savings = sum(yearly_cash_flows)
        roi_percent = ((total_undiscounted_savings - total_capex) / total_capex) * 100
        
        # Calculate profitability index
        present_value_inflows = npv + total_capex
        profitability_index = present_value_inflows / total_capex
        
        # Calculate annualized return
        if npv > 0:
            annualized_return = ((present_value_inflows / total_capex) ** (1/project_years) - 1) * 100
        else:
            annualized_return = -100
        
        return {
            "net_present_value": round(npv, 2),
            "internal_rate_of_return_percent": round(irr * 100, 2) if irr else 0,
            "return_on_investment_percent": round(roi_percent, 2),
            "payback_period_years": round(payback_period_years, 2),
            "profitability_index": round(profitability_index, 3),
            "annualized_return_percent": round(annualized_return, 2),
            "total_project_savings": round(total_undiscounted_savings, 2),
            "present_value_inflows": round(present_value_inflows, 2),
            "investment_grade": self._get_investment_grade(npv, irr, payback_period_years)
        }
    
    def _calculate_irr(self, cash_flows: List[float], max_iterations: int = 100, tolerance: float = 1e-6) -> float:
        """Calculate Internal Rate of Return using Newton-Raphson method"""
        
        def npv_function(rate):
            return sum(cf / ((1 + rate) ** i) for i, cf in enumerate(cash_flows))
        
        def npv_derivative(rate):
            return sum(-i * cf / ((1 + rate) ** (i + 1)) for i, cf in enumerate(cash_flows))
        
        # Initial guess
        rate = 0.1
        
        for _ in range(max_iterations):
            npv_val = npv_function(rate)
            if abs(npv_val) < tolerance:
                return rate
            
            npv_deriv = npv_derivative(rate)
            if abs(npv_deriv) < tolerance:
                break
            
            rate = rate - npv_val / npv_deriv
            
            # Prevent negative rates
            if rate < -0.99:
                rate = -0.99
        
        return rate if rate > -0.99 else None
    
    def _get_investment_grade(self, npv: float, irr: float, payback_years: float) -> str:
        """Assign investment grade based on financial metrics"""
        
        if npv > 1000000 and irr and irr > 0.20 and payback_years < 3:
            return "Excellent (A+)"
        elif npv > 500000 and irr and irr > 0.15 and payback_years < 5:
            return "Very Good (A)"
        elif npv > 100000 and irr and irr > 0.10 and payback_years < 7:
            return "Good (B+)"
        elif npv > 0 and irr and irr > 0.08 and payback_years < 10:
            return "Acceptable (B)"
        else:
            return "Poor (C)"
    
    def generate_yearly_breakdown(self,
                                annual_savings: float,
                                project_years: int = 10,
                                escalation_rate: float = 0.03) -> List[Dict]:
        """Generate year-by-year breakdown of savings"""
        
        yearly_data = []
        cumulative_savings = 0
        
        for year in range(1, project_years + 1):
            # Apply escalation to savings
            year_savings = annual_savings * ((1 + escalation_rate) ** (year - 1))
            cumulative_savings += year_savings
            
            yearly_data.append({
                "year": year,
                "annual_savings": round(year_savings, 2),
                "cumulative_savings": round(cumulative_savings, 2),
                "discount_factor": round(1 / ((1 + self.DISCOUNT_RATE_DEFAULT) ** year), 4)
            })
        
        return yearly_data
    
    def perform_sensitivity_analysis(self,
                                   base_inputs: Dict,
                                   sensitivity_ranges: Dict) -> Dict:
        """Perform sensitivity analysis on key parameters"""
        
        sensitivity_results = {}
        
        for param, range_values in sensitivity_ranges.items():
            param_results = []
            
            for value in range_values:
                # Create modified inputs
                modified_inputs = base_inputs.copy()
                modified_inputs[param] = value
                
                # Recalculate with modified parameter
                # This would call the main prediction function
                # For now, we'll create a placeholder structure
                param_results.append({
                    "parameter_value": value,
                    "total_savings": 0,  # Would be calculated
                    "npv": 0,  # Would be calculated
                    "roi": 0   # Would be calculated
                })
            
            sensitivity_results[param] = param_results
        
        return sensitivity_results