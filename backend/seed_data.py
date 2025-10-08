#!/usr/bin/env python3
"""
Seed script to populate the database with sample data for testing
"""
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from datetime import datetime, timedelta
import os

from models import Base, HeatCenter, DemandSite, Route, RouteStatus

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def seed_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Clear existing data
        db.query(Route).delete()
        db.query(DemandSite).delete()
        db.query(HeatCenter).delete()
        
        # Sample Heat Centers (converted from existing data centers)
        heat_centers = [
            HeatCenter(
                name="Digital Realty Heat Center - 365 Main",
                location_lat=37.7879,
                location_lng=-122.3972,
                address="365 Main Street, San Francisco, CA 94105",
                max_capacity_mw=45.0,
                current_output_mw=32.5,
                efficiency_percent=88.5,
                fuel_type="Natural Gas",
                is_active=True,
                commissioning_date=datetime(2001, 6, 15),
                last_maintenance=datetime.now() - timedelta(days=30),
                description="Premier district heating facility in downtown San Francisco with high-efficiency cogeneration system."
            ),
            HeatCenter(
                name="Digital Realty Heat Center - 200 Paul",
                location_lat=37.7529,
                location_lng=-122.3890,
                address="200 Paul Avenue, San Francisco, CA 94124",
                max_capacity_mw=75.0,
                current_output_mw=58.2,
                efficiency_percent=91.2,
                fuel_type="Biomass",
                is_active=True,
                commissioning_date=datetime(2000, 3, 20),
                last_maintenance=datetime.now() - timedelta(days=15),
                description="Large-scale biomass heating facility serving industrial and residential areas."
            ),
            HeatCenter(
                name="Fortress Green Heat Center",
                location_lat=37.7749,
                location_lng=-122.4094,
                address="274 Brannan Street, San Francisco, CA 94107",
                max_capacity_mw=35.0,
                current_output_mw=28.7,
                efficiency_percent=94.1,
                fuel_type="Geothermal",
                is_active=True,
                commissioning_date=datetime(2020, 9, 10),
                last_maintenance=datetime.now() - timedelta(days=7),
                description="Modern geothermal heating system with advanced heat pump technology."
            ),
            HeatCenter(
                name="Colocation Heat Hub - Paul Ave",
                location_lat=37.7530,
                location_lng=-122.3885,
                address="200 Paul Ave, San Francisco, CA 94124",
                max_capacity_mw=25.0,
                current_output_mw=19.8,
                efficiency_percent=86.7,
                fuel_type="Solar Thermal",
                is_active=True,
                commissioning_date=datetime(2015, 11, 5),
                last_maintenance=datetime.now() - timedelta(days=45),
                description="Solar thermal heating system with backup natural gas boilers."
            )
        ]
        
        # Add heat centers to database
        for center in heat_centers:
            db.add(center)
        
        db.commit()
        
        # Sample Demand Sites (hotels, residential, commercial)
        demand_sites = [
            DemandSite(
                name="Marriott Downtown Hotel",
                location_lat=37.7851,
                location_lng=-122.4020,
                address="55 4th Street, San Francisco, CA 94103",
                site_type="Hotel",
                peak_demand_mw=8.5,
                current_demand_mw=6.2,
                annual_consumption_mwh=45600,
                is_connected=True,
                connection_date=datetime(2018, 4, 12),
                priority_level=2,
                floor_area_sqm=35000,
                building_age_years=15,
                insulation_rating="B+",
                description="Large downtown hotel with 500 rooms requiring consistent heating and hot water."
            ),
            DemandSite(
                name="SOMA Residential Complex",
                location_lat=37.7749,
                location_lng=-122.4194,
                address="123 Folsom Street, San Francisco, CA 94107",
                site_type="Residential",
                peak_demand_mw=12.3,
                current_demand_mw=8.9,
                annual_consumption_mwh=67800,
                is_connected=True,
                connection_date=datetime(2019, 8, 22),
                priority_level=1,
                floor_area_sqm=48000,
                building_age_years=8,
                insulation_rating="A",
                description="Modern residential complex with 200 units and energy-efficient design."
            ),
            DemandSite(
                name="Financial District Office Tower",
                location_lat=37.7946,
                location_lng=-122.3999,
                address="101 California Street, San Francisco, CA 94111",
                site_type="Commercial",
                peak_demand_mw=15.7,
                current_demand_mw=11.4,
                annual_consumption_mwh=89200,
                is_connected=True,
                connection_date=datetime(2017, 2, 8),
                priority_level=2,
                floor_area_sqm=62000,
                building_age_years=25,
                insulation_rating="B",
                description="High-rise office building with modern HVAC systems and high heating demands."
            ),
            DemandSite(
                name="Mission Bay Hospital",
                location_lat=37.7665,
                location_lng=-122.3927,
                address="1825 4th Street, San Francisco, CA 94158",
                site_type="Healthcare",
                peak_demand_mw=22.1,
                current_demand_mw=18.5,
                annual_consumption_mwh=125400,
                is_connected=False,
                connection_date=None,
                priority_level=1,
                floor_area_sqm=85000,
                building_age_years=12,
                insulation_rating="A-",
                description="Major medical facility requiring reliable heating for patient care and sterilization."
            ),
            DemandSite(
                name="Bayview Industrial Park",
                location_lat=37.7380,
                location_lng=-122.3916,
                address="2000 3rd Street, San Francisco, CA 94124",
                site_type="Industrial",
                peak_demand_mw=28.9,
                current_demand_mw=21.7,
                annual_consumption_mwh=156800,
                is_connected=False,
                connection_date=None,
                priority_level=3,
                floor_area_sqm=120000,
                building_age_years=35,
                insulation_rating="C+",
                description="Large industrial facility with manufacturing processes requiring process heating."
            )
        ]
        
        # Add demand sites to database
        for site in demand_sites:
            db.add(site)
        
        db.commit()
        
        # Get IDs for creating routes
        centers = db.query(HeatCenter).all()
        sites = db.query(DemandSite).all()
        
        # Sample Routes (connections between heat centers and demand sites)
        routes = [
            # Digital Realty 365 Main -> Marriott Hotel
            Route(
                heat_center_id=centers[0].id,
                demand_site_id=sites[0].id,
                distance_km=0.8,
                pipe_diameter_mm=300,
                max_flow_capacity_mw=10.0,
                current_flow_mw=6.2,
                supply_temp_celsius=85.0,
                return_temp_celsius=45.0,
                pressure_bar=18.0,
                heat_loss_percent=1.8,
                installation_year=2018,
                pipe_material="Pre-insulated steel",
                insulation_type="Polyurethane foam",
                status=RouteStatus.ACTIVE,
                is_bidirectional=False,
                maintenance_due=datetime.now() + timedelta(days=180),
                construction_cost=450000.0,
                annual_maintenance_cost=12000.0
            ),
            # Fortress Green -> SOMA Residential
            Route(
                heat_center_id=centers[2].id,
                demand_site_id=sites[1].id,
                distance_km=1.2,
                pipe_diameter_mm=400,
                max_flow_capacity_mw=15.0,
                current_flow_mw=8.9,
                supply_temp_celsius=80.0,
                return_temp_celsius=40.0,
                pressure_bar=16.0,
                heat_loss_percent=2.1,
                installation_year=2019,
                pipe_material="Pre-insulated steel",
                insulation_type="Mineral wool",
                status=RouteStatus.ACTIVE,
                is_bidirectional=False,
                maintenance_due=datetime.now() + timedelta(days=90),
                construction_cost=680000.0,
                annual_maintenance_cost=18500.0
            ),
            # Digital Realty 200 Paul -> Financial District Office
            Route(
                heat_center_id=centers[1].id,
                demand_site_id=sites[2].id,
                distance_km=2.1,
                pipe_diameter_mm=450,
                max_flow_capacity_mw=20.0,
                current_flow_mw=11.4,
                supply_temp_celsius=90.0,
                return_temp_celsius=50.0,
                pressure_bar=20.0,
                heat_loss_percent=3.2,
                installation_year=2017,
                pipe_material="Pre-insulated steel",
                insulation_type="Polyurethane foam",
                status=RouteStatus.ACTIVE,
                is_bidirectional=False,
                maintenance_due=datetime.now() + timedelta(days=45),
                construction_cost=1200000.0,
                annual_maintenance_cost=28000.0
            )
        ]
        
        # Add routes to database
        for route in routes:
            db.add(route)
        
        db.commit()
        
        print("✅ Database seeded successfully!")
        print(f"   - {len(heat_centers)} Heat Centers")
        print(f"   - {len(demand_sites)} Demand Sites")
        print(f"   - {len(routes)} Routes")
        
    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()