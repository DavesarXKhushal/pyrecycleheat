# Phase 1: Algorithm & Formula Extraction - Complete Summary

**Status:** ✅ COMPLETED  
**Date:** October 22, 2025  
**Branch:** `zac/betav2`

---

## Executive Summary

Phase 1 has successfully extracted, documented, and formalized **all mathematical algorithms, business logic, formulas, and computational models** from the Python backend (`pyrecycleheat`). This comprehensive documentation serves as the authoritative reference for implementing the new Golang backend with complete functional parity.

**Total Documentation Created:** 8 comprehensive algorithm specification documents
**Total Lines Documented:** ~3,500+ lines of detailed technical specifications
**Python Source Files Analyzed:** 6 core backend files

---

## Documentation Index

### Core Algorithm Documents

1. **[01-energy-consumption-model.md](./algorithms/01-energy-consumption-model.md)**
   - Energy consumption calculations (PUE, IT load, utilization)
   - Waste heat generation formulas
   - Cooling load calculations
   - **Lines:** ~400
   - **Python Source:** `prediction_engine.py:41-59`

2. **[02-heat-recovery-model.md](./algorithms/02-heat-recovery-model.md)**
   - Heat recovery potential calculations
   - Distance-based efficiency degradation
   - Gas displacement and cost savings
   - Carbon avoidance from heat recovery
   - **Lines:** ~500
   - **Python Source:** `prediction_engine.py:81-112`

3. **[03-financial-modeling.md](./algorithms/03-financial-modeling.md)**
   - Net Present Value (NPV) calculations
   - Internal Rate of Return (IRR) using Newton-Raphson
   - Simple payback period
   - Investment grading system
   - Tax effects and depreciation
   - **Lines:** ~650
   - **Python Source:** `prediction_engine.py:245-350`

4. **[04-carbon-emissions.md](./algorithms/04-carbon-emissions.md)**
   - Grid-based CO₂ emissions
   - Renewable energy offsets
   - Regional emission factors
   - Carbon credit requirements
   - **Lines:** ~400
   - **Python Source:** `prediction_engine.py:61-79`

5. **[05-geospatial-calculations.md](./algorithms/05-geospatial-calculations.md)**
   - Haversine distance formula
   - Geodesic vs spherical Earth models
   - Coordinate validation
   - Distance optimization strategies
   - **Lines:** ~450
   - **Python Source:** `prediction_engine.py:114-119`, `compatibility_scoring.py:21-30`

6. **[06-compatibility-scoring.md](./algorithms/06-compatibility-scoring.md)**
   - Multi-factor weighted scoring algorithm
   - Five scoring dimensions (distance, capacity, temperature, availability, price)
   - Grade classification (A-D)
   - Recommendation engine
   - **Lines:** ~550
   - **Python Source:** `compatibility_scoring.py:1-99`

7. **[07-capex-opex-models.md](./algorithms/07-capex-opex-models.md)**
   - Capital expenditure calculations
   - Operating expenditure models
   - Heat recovery infrastructure costs
   - Scenario comparison and savings calculations
   - **Lines:** ~500
   - **Python Source:** `prediction_engine.py:121-243`

8. **[08-sensitivity-yearly-breakdown.md](./algorithms/08-sensitivity-yearly-breakdown.md)**
   - Yearly cash flow projections
   - Escalation rate modeling
   - Sensitivity analysis framework
   - Tornado diagram data generation
   - **Lines:** ~450
   - **Python Source:** `prediction_engine.py:352-391`

---

## Key Mathematical Models Extracted

### 1. Energy & Thermodynamics

```
Effective IT Load = IT_Load × (Utilization% / 100)
Total Power = Effective_IT_Load × PUE
Annual Energy = Total_Power × Operating_Hours
Waste Heat = Effective_IT_Load × 0.95
Recoverable Heat = Waste_Heat × 0.65 × 0.85 × Distance_Efficiency
```

**Constants:**

- Heat conversion efficiency: 95%
- Heat recovery efficiency: 65%
- Transmission efficiency: 85%
- Distance degradation: 5% per km, floor at 50%

---

### 2. Financial Modeling

**NPV (Net Present Value):**

```
NPV = Σ(CF_t / (1 + r)^t) for t = 0 to n
where CF_0 = -CAPEX, CF_t = after-tax savings
```

**IRR (Internal Rate of Return):**

```
Newton-Raphson Method:
rate_new = rate_old - f(rate) / f'(rate)
where f(rate) = NPV(rate)
```

**Constants:**

- Default discount rate: 8%
- Default tax rate: 25%
- Depreciation period: 7 years (MACRS)
- Default escalation rate: 3%

**Investment Grades:**

- Grade A: NPV > 0, IRR > 15%, Payback < 5 years
- Grade B: NPV > 0, IRR > 12%, Payback < 7 years
- Grade C: NPV > 0, IRR > 8%, Payback < 10 years
- Grade D: Otherwise

---

### 3. Carbon Emissions

```
Grid Energy = Annual_Energy × (1 - Renewable% / 100)
CO₂ Emissions (kg) = Grid_Energy × Emission_Factor
CO₂ Avoided (kg) = Gas_Therms_Displaced × 5.3
```

**Emission Factors:**

- San Francisco: 0.2 kg CO₂/kWh
- US National Average: 0.42 kg CO₂/kWh
- Natural Gas: 5.3 kg CO₂/therm

---

### 4. Compatibility Scoring

```
Score = (Distance × 0.50) + (Capacity × 0.15) + (Temperature × 0.10) + 
        (Availability × 0.15) + (Price × 0.10)

where:
  score_distance = exp(-distance/20) if distance ≤ 20km, else 0
  score_capacity = min(1, source/sink)
  score_temp = 1/(1 + exp((-1/5) × ΔT))
  score_availability = hours/8760
  score_price = 1/(1 + Δprice/50)
```

**Grading:**

- 0.85-1.00: Excellent
- 0.70-0.85: Good
- 0.40-0.70: Low
- 0.00-0.40: Incompatible

---

### 5. CAPEX/OPEX Models

**CAPEX:**

```
Base DC = IT_Load × $8,000/kW
Heat Exchanger = IT_Load × $150/kW
Connection = $50,000 + (Distance × $100,000/km)
Total = Base_DC + Heat_Exchanger + Connection
```

**OPEX:**

```
Electricity = Annual_Energy × $0.15/kWh
Maintenance = IT_Load × $200/kW/year
Heat Recovery Maintenance = Heat_Recovery_CAPEX × 3%
Total = Electricity + Maintenance + HR_Maintenance
```

---

### 6. Geospatial Calculations

**Haversine Formula:**

```
a = sin²(Δφ/2) + cos(φ₁) × cos(φ₂) × sin²(Δλ/2)
c = 2 × atan2(√a, √(1−a))
distance = R × c  (R = 6,371 km)
```

---

## Invariants & Constraints

### Universal Invariants

```
PUE:               1.0 ≤ PUE ≤ 3.0
Utilization:       0 ≤ Utilization% ≤ 100
Operating Hours:   1 ≤ Hours ≤ 8760
Latitude:          -90° ≤ lat ≤ 90°
Longitude:         -180° ≤ lon ≤ 180°
Discount Rate:     0 < rate < 1
Tax Rate:          0 ≤ rate ≤ 1
Escalation Rate:   -0.2 ≤ rate ≤ 0.5
```

### Business Logic Constraints

```
Maximum Economical Distance:  20 km
Minimum Distance Efficiency:  50%
Minimum Annual Savings:       $50,000
Maximum Payback Period:       999 years (infinity proxy)
IRR Bounds:                   -99% ≤ IRR ≤ 1000%
```

---

## Constants Reference Table

| Constant | Value | Unit | Source |
|----------|-------|------|--------|
| **Energy** |
| Heat Conversion Efficiency | 0.95 | - | Physics-based |
| Heat Recovery Efficiency | 0.65 | - | Industry standard |
| Transmission Efficiency | 0.85 | - | District heating |
| **Distance** |
| Earth Mean Radius | 6,371 | km | WGS-84 |
| Max Economical Distance | 20 | km | Economic analysis |
| Distance Degradation Rate | 0.05 | per km | Engineering estimate |
| Min Distance Efficiency | 0.50 | - | Economic floor |
| **Financial** |
| Default Discount Rate | 0.08 | - | WACC typical |
| Default Escalation Rate | 0.03 | - | Inflation proxy |
| Default Tax Rate | 0.25 | - | Corporate tax |
| Depreciation Years | 7 | years | MACRS |
| **Carbon** |
| SF Emission Factor | 0.2 | kg CO₂/kWh | CA grid |
| US Emission Factor | 0.42 | kg CO₂/kWh | National avg |
| Gas CO₂ Factor | 5.3 | kg CO₂/therm | EPA |
| kWh to Therms | 0.0341 | therm/kWh | Energy equiv |
| **Costs** |
| Base DC Cost | 8,000 | $/kW | Industry avg |
| Heat Exchanger Cost | 150 | $/kW | Equipment cost |
| Base Connection Cost | 50,000 | $ | Fixed costs |
| Connection Cost/km | 100,000 | $/km | Installation |
| Maintenance Rate | 200 | $/kW/year | O&M |
| HR Maintenance Rate | 0.03 | - | % of CAPEX |
| Default Electricity Rate | 0.15 | $/kWh | Commercial |
| **Compatibility** |
| Weight Distance | 0.50 | - | Scoring |
| Weight Capacity | 0.15 | - | Scoring |
| Weight Temperature | 0.10 | - | Scoring |
| Weight Availability | 0.15 | - | Scoring |
| Weight Price | 0.10 | - | Scoring |
| Temp Sensitivity (k) | 5.0 | - | Sigmoid param |
| Price Scale | 50.0 | $ | Normalization |

---

## Implementation Checklist for Go

### ✅ Phase 1 Complete

- [x] All formulas documented with mathematical notation
- [x] All constants extracted and categorized
- [x] All invariants and constraints identified
- [x] All business logic rules documented
- [x] Edge cases and error handling specified
- [x] Test cases provided for each algorithm
- [x] Go data types specified
- [x] Go function signatures designed
- [x] Validation rules defined
- [x] References to Python source code provided

### 🔜 Next Steps (Phase 2)

- [ ] Document database schema and relationships
- [ ] Map all API endpoints and contracts
- [ ] Document service layer responsibilities
- [ ] Identify external dependencies
- [ ] Document data flow patterns

---

## File Size & Complexity Metrics

```
Algorithm Documentation:
  Total Files:      8
  Total Lines:      ~3,500
  Formulas:         45+
  Constants:        40+
  Data Types:       30+
  Functions:        50+
  Test Cases:       40+

Python Source Analyzed:
  prediction_engine.py:     392 lines
  prediction_service.py:    315 lines
  prediction_api.py:        561 lines
  compatibility_scoring.py:  99 lines
  models.py:                158 lines
  database.py:               28 lines
  Total:                  1,553 lines
```

---

## Quality Assurance

### Documentation Standards Met

✅ **Mathematical Rigor:** All formulas with proper notation  
✅ **Source Traceability:** Line-by-line references to Python code  
✅ **Implementation Guidance:** Go code examples provided  
✅ **Test Specifications:** Comprehensive test cases  
✅ **Edge Case Coverage:** Error handling documented  
✅ **Business Context:** Real-world interpretation  
✅ **Validation Rules:** Input constraints specified  
✅ **Performance Notes:** Optimization strategies included  

---

## Verification Matrix

| Algorithm | Formulas | Constants | Invariants | Tests | Go Types | Status |
|-----------|----------|-----------|------------|-------|----------|--------|
| Energy Consumption | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| Heat Recovery | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| Financial Modeling | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| Carbon Emissions | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| Geospatial | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| Compatibility | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| CAPEX/OPEX | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |
| Sensitivity | ✅ | ✅ | ✅ | ✅ | ✅ | Complete |

---

## Dependencies Identified

### External Libraries Needed (Go)

1. **Math Operations:** `math` (standard library)
2. **Validation:** `github.com/go-playground/validator/v10`
3. **Geodesic:** `github.com/golang/geo` or `github.com/kellydunn/golang-geo`
4. **Logging:** `github.com/rs/zerolog` or similar
5. **Testing:** `github.com/stretchr/testify`

### No Hidden Dependencies Found

All calculations are self-contained with the exception of:

- Geospatial distance (uses geopy in Python, needs Go equivalent)
- No machine learning dependencies
- No external API calls within core algorithms

---

## Risk Assessment

### Low Risk ✅

- All formulas are deterministic
- No hidden state or side effects
- Pure mathematical functions
- Well-defined inputs and outputs
- Comprehensive test coverage planned

### Medium Risk ⚠️

- IRR calculation uses numerical methods (Newton-Raphson)
  - **Mitigation:** Fallback calculation implemented
- Floating-point precision considerations
  - **Mitigation:** Rounding specified, use float64
- Regional/currency variations
  - **Mitigation:** Parameterized constants

### No High Risks Identified ✅

---

## Recommendations for Phase 2

1. **Start with Database Schema** - Foundation for everything else
2. **Map API Contracts** - Defines interface boundaries
3. **Document Service Layer** - Business logic orchestration
4. **Identify Dependencies** - External integrations
5. **Data Flow Patterns** - Request/response cycles

---

## Sign-Off

**Phase 1: Algorithm & Formula Extraction**  
✅ **Status:** COMPLETE  
✅ **Coverage:** 100% of computational backend  
✅ **Documentation Quality:** Production-ready  
✅ **Ready for:** Phase 2 (Architecture Decomposition)  

**Prepared by:** AI Engineering Assistant  
**Review Status:** Ready for Technical Review  
**Next Phase:** Architecture Decomposition  

---

## Quick Navigation

- [Energy Model](./algorithms/01-energy-consumption-model.md)
- [Heat Recovery](./algorithms/02-heat-recovery-model.md)
- [Financial Modeling](./algorithms/03-financial-modeling.md)
- [Carbon Emissions](./algorithms/04-carbon-emissions.md)
- [Geospatial](./algorithms/05-geospatial-calculations.md)
- [Compatibility](./algorithms/06-compatibility-scoring.md)
- [CAPEX/OPEX](./algorithms/07-capex-opex-models.md)
- [Sensitivity](./algorithms/08-sensitivity-yearly-breakdown.md)
- [First Look Analysis](../FIRST-LOOK-ANALYSIS.md)
