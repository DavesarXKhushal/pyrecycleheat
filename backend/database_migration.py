"""
Database Migration Script for Data Center Savings Prediction System
This script creates the necessary tables for the prediction system while preserving existing data.
"""

import os
import sys
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
from datetime import datetime

# Add the backend directory to the Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from models import Base, HeatCenter, DemandSite, Route
from prediction_models import DataCenter, CarbonCredit, HeatSink, SavingsPrediction, PredictionScenario

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./district_heating.db")

def create_migration_engine():
    """Create database engine for migration"""
    engine = create_engine(DATABASE_URL, echo=True)
    return engine

def backup_existing_data(engine):
    """Backup existing data before migration"""
    print("Creating backup of existing data...")
    
    backup_queries = [
        "CREATE TABLE IF NOT EXISTS heat_centers_backup AS SELECT * FROM heat_centers;",
        "CREATE TABLE IF NOT EXISTS demand_sites_backup AS SELECT * FROM demand_sites;",
        "CREATE TABLE IF NOT EXISTS routes_backup AS SELECT * FROM routes;"
    ]
    
    with engine.connect() as conn:
        for query in backup_queries:
            try:
                conn.execute(text(query))
                conn.commit()
                print(f"✓ Executed: {query}")
            except Exception as e:
                print(f"⚠ Warning during backup: {e}")

def create_prediction_tables(engine):
    """Create new prediction system tables"""
    print("Creating new prediction system tables...")
    
    # Create all tables defined in prediction_models.py
    Base.metadata.create_all(bind=engine, tables=[
        DataCenter.__table__,
        CarbonCredit.__table__,
        HeatSink.__table__,
        SavingsPrediction.__table__,
        PredictionScenario.__table__
    ])
    
    print("✓ Prediction system tables created successfully")

def seed_sample_data(engine):
    """Seed sample data for testing"""
    print("Seeding sample data...")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if sample data already exists
        existing_dc = db.query(DataCenter).first()
        if existing_dc:
            print("Sample data already exists, skipping seeding")
            return
        
        # Sample Data Center
        sample_dc = DataCenter(
            name="San Francisco Tech Hub DC",
            location_lat=37.7749,
            location_lng=-122.4194,
            total_it_load_kw=5000.0,
            pue=1.4,
            cooling_system="Air-cooled chillers",
            server_count=2000,
            rack_count=250,
            floor_area_sqm=2500.0,
            ceiling_height_m=3.5,
            annual_energy_cost=750000.0,
            electricity_rate_kwh=0.15,
            cooling_capacity_kw=3500.0,
            backup_power_kw=6000.0,
            network_capacity_gbps=100.0,
            storage_capacity_tb=5000.0,
            cpu_utilization_avg=65.0,
            memory_utilization_avg=70.0,
            storage_utilization_avg=80.0,
            uptime_percentage=99.9,
            maintenance_cost_annual=50000.0,
            staff_cost_annual=200000.0,
            lease_cost_annual=300000.0,
            insurance_cost_annual=25000.0
        )
        
        # Sample Carbon Credit
        sample_cc = CarbonCredit(
            name="California Forest Carbon Credits",
            price_per_ton_co2=45.0,
            certification_standard="VCS",
            project_type="Forestry",
            vintage_year=2024,
            expiry_date=datetime(2034, 12, 31),
            geographic_location="California, USA",
            additionality_verified=True,
            permanence_rating="High",
            co_benefits="Biodiversity, Water quality",
            verification_body="SCS Global Services",
            registry="Verra Registry",
            project_developer="California Forest Initiative",
            monitoring_frequency="Annual",
            risk_rating="Low"
        )
        
        # Sample Heat Sink
        sample_hs = HeatSink(
            name="Downtown District Heating Network",
            location_lat=37.7849,
            location_lng=-122.4094,
            capacity_mw=15.0,
            current_demand_mw=8.5,
            temperature_supply_c=80.0,
            temperature_return_c=60.0,
            connection_cost_per_km=150000.0,
            operational_cost_annual=75000.0,
            efficiency_percentage=92.0,
            heat_sink_type="District heating",
            connection_availability=True,
            peak_demand_mw=12.0,
            base_demand_mw=6.0,
            seasonal_variation=0.3,
            heat_price_per_mwh=35.0
        )
        
        # Add to database
        db.add(sample_dc)
        db.add(sample_cc)
        db.add(sample_hs)
        db.commit()
        
        print("✓ Sample data seeded successfully")
        
    except Exception as e:
        print(f"✗ Error seeding sample data: {e}")
        db.rollback()
    finally:
        db.close()

def verify_migration(engine):
    """Verify that migration was successful"""
    print("Verifying migration...")
    
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Check if new tables exist and have data
        dc_count = db.query(DataCenter).count()
        cc_count = db.query(CarbonCredit).count()
        hs_count = db.query(HeatSink).count()
        
        print(f"✓ Data Centers: {dc_count}")
        print(f"✓ Carbon Credits: {cc_count}")
        print(f"✓ Heat Sinks: {hs_count}")
        
        # Check if old tables still exist
        try:
            hc_count = db.query(HeatCenter).count()
            ds_count = db.query(DemandSite).count()
            print(f"✓ Heat Centers (preserved): {hc_count}")
            print(f"✓ Demand Sites (preserved): {ds_count}")
        except Exception as e:
            print(f"⚠ Old tables check: {e}")
        
        print("✓ Migration verification completed")
        
    except Exception as e:
        print(f"✗ Migration verification failed: {e}")
    finally:
        db.close()

def run_migration():
    """Run the complete migration process"""
    print("=" * 60)
    print("DATA CENTER SAVINGS PREDICTION SYSTEM MIGRATION")
    print("=" * 60)
    print(f"Started at: {datetime.now()}")
    print(f"Database URL: {DATABASE_URL}")
    print()
    
    try:
        # Create engine
        engine = create_migration_engine()
        
        # Step 1: Backup existing data
        backup_existing_data(engine)
        print()
        
        # Step 2: Create new tables
        create_prediction_tables(engine)
        print()
        
        # Step 3: Seed sample data
        seed_sample_data(engine)
        print()
        
        # Step 4: Verify migration
        verify_migration(engine)
        print()
        
        print("=" * 60)
        print("✓ MIGRATION COMPLETED SUCCESSFULLY")
        print("=" * 60)
        print(f"Completed at: {datetime.now()}")
        
    except Exception as e:
        print("=" * 60)
        print("✗ MIGRATION FAILED")
        print("=" * 60)
        print(f"Error: {e}")
        print(f"Failed at: {datetime.now()}")
        raise

if __name__ == "__main__":
    run_migration()