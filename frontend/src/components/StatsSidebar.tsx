import React, { useMemo } from 'react';
import { Activity, Thermometer, Building2, TrendingUp } from 'lucide-react';
import { HeatCenter, DemandSite } from '@/services/api';

interface StatsSidebarProps {
  heatCenters: HeatCenter[];
  demandSites: DemandSite[];
  isLoading?: boolean;
}

const StatsSidebar: React.FC<StatsSidebarProps> = ({ 
  heatCenters = [], 
  demandSites = [], 
  isLoading = false 
}) => {
  const stats = useMemo(() => {
    const heatCenterStats = {
      total: heatCenters.length,
      active: heatCenters.filter(hc => hc.is_active === true).length,
      inactive: heatCenters.filter(hc => hc.is_active === false).length,
      maxOutput: Math.max(...heatCenters.map(hc => hc.current_output_mw || 0), 0),
      totalOutput: heatCenters.reduce((sum, hc) => sum + (hc.current_output_mw || 0), 0)
    };

    const demandSiteStats = {
      total: demandSites.length,
      active: demandSites.filter(ds => ds.is_connected === true).length,
      inactive: demandSites.filter(ds => ds.is_connected === false).length,
      totalDemand: demandSites.reduce((sum, ds) => sum + (ds.current_demand_mw || 0), 0),
      avgDemand: demandSites.length > 0 ? demandSites.reduce((sum, ds) => sum + (ds.current_demand_mw || 0), 0) / demandSites.length : 0
    };

    return {
      heatCenters: heatCenterStats,
      demandSites: demandSiteStats,
      efficiency: heatCenterStats.totalOutput > 0 ? Math.round((demandSiteStats.totalDemand / heatCenterStats.totalOutput) * 100) : 0
    };
  }, [heatCenters, demandSites]);

  if (isLoading) {
    return (
      <div className="w-80 h-full bg-white/10 backdrop-blur-md border-l border-white/20 flex items-center justify-center">
        <div className="text-gray-600 font-medium">Loading...</div>
      </div>
    );
  }

  return (
    <div 
      className="w-80 h-full overflow-y-auto"
      style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.25), rgba(255, 255, 255, 0.1))',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderLeft: '1px solid rgba(255, 255, 255, 0.2)',
        boxShadow: 'inset 1px 0 0 rgba(255, 255, 255, 0.3), -10px 0 30px rgba(0, 0, 0, 0.1)'
      }}
    >
      {/* Header */}
      <div 
        className="p-4 border-b border-white/20"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.05))',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center shadow-lg">
            <Activity className="h-4 w-4 text-white" />
          </div>
          <h2 className="text-lg font-semibold text-gray-800">System Overview</h2>
        </div>
      </div>

      <div className="p-4 space-y-4">

        {/* Heat Centers */}
        <div 
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Thermometer className="h-4 w-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800">Heat Centers</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Active / Inactive:</span>
              <span className="font-semibold text-gray-900">{stats.heatCenters.active} / {stats.heatCenters.inactive}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Max / Total Output:</span>
              <span className="font-semibold text-gray-900">{stats.heatCenters.maxOutput} / {stats.heatCenters.totalOutput} MW</span>
            </div>
          </div>
        </div>

        {/* Demand Sites */}
        <div 
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Building2 className="h-4 w-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800">Demand Sites</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Active / Inactive:</span>
              <span className="font-semibold text-gray-900">{stats.demandSites.active} / {stats.demandSites.inactive}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Demand:</span>
              <span className="font-semibold text-gray-900">{stats.demandSites.totalDemand.toFixed(1)} MW</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Avg Demand:</span>
              <span className="font-semibold text-gray-900">{stats.demandSites.avgDemand.toFixed(1)} MW</span>
            </div>
          </div>
        </div>

        {/* System Metrics */}
        <div 
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
          }}
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp className="h-4 w-4 text-gray-600" />
            <h3 className="text-sm font-semibold text-gray-800">System Metrics</h3>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Network Efficiency:</span>
              <span className="font-semibold text-gray-900">{stats.efficiency}%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Centers:</span>
              <span className="font-semibold text-gray-900">{stats.heatCenters.total}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">Total Sites:</span>
              <span className="font-semibold text-gray-900">{stats.demandSites.total}</span>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div 
          className="rounded-xl p-4"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2), rgba(255, 255, 255, 0.1))',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid rgba(255, 255, 255, 0.3)',
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.3)'
          }}
        >
          <h3 className="text-sm font-semibold text-gray-800 mb-3 text-center">Quick Stats</h3>
          
          <div className="grid grid-cols-2 gap-3">
            <div 
              className="text-center p-3 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="text-lg font-bold text-gray-900">{stats.heatCenters.total}</div>
              <div className="text-xs text-gray-700 font-medium">Heat Centers</div>
            </div>
            
            <div 
              className="text-center p-3 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="text-lg font-bold text-gray-900">{stats.demandSites.total}</div>
              <div className="text-xs text-gray-700 font-medium">Demand Sites</div>
            </div>
            
            <div 
              className="text-center p-3 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="text-lg font-bold text-gray-900">{stats.heatCenters.totalOutput}</div>
              <div className="text-xs text-gray-700 font-medium">Total MW</div>
            </div>
            
            <div 
              className="text-center p-3 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.15), rgba(255, 255, 255, 0.08))',
                backdropFilter: 'blur(5px)',
                WebkitBackdropFilter: 'blur(5px)',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
            >
              <div className="text-lg font-bold text-gray-900">{stats.efficiency}%</div>
              <div className="text-xs text-gray-700 font-medium">Efficiency</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSidebar;