import React, { useMemo } from 'react';
import { Activity, Zap, Database, TrendingUp, MapPin, Building2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
  // Calculate statistics with proper error handling
  const stats = useMemo(() => {
    try {
      // Heat Centers Statistics
      const activeHeatCenters = heatCenters.filter(center => 
        center.is_active === true
      ).length;
      const inactiveHeatCenters = heatCenters.length - activeHeatCenters;
      
      // Demand Sites Statistics  
      const activeDemandSites = demandSites.filter(site => 
        site.is_connected === true
      ).length;
      const inactiveDemandSites = demandSites.length - activeDemandSites;
      
      // Energy Statistics
      const maxHeatOutput = heatCenters.reduce((max, center) => {
        const output = center.current_output_mw || 0;
        return output > max ? output : max;
      }, 0);
      
      const maxDemand = demandSites.reduce((max, site) => {
        const demand = site.peak_demand_mw || 0;
        return demand > max ? demand : max;
      }, 0);
      
      const totalCapacity = heatCenters.reduce((sum, center) => {
        return sum + (center.current_output_mw || 0);
      }, 0);
      
      const totalDemand = demandSites.reduce((sum, site) => {
        return sum + (site.peak_demand_mw || 0);
      }, 0);

      return {
        heatCenters: {
          active: activeHeatCenters,
          inactive: inactiveHeatCenters,
          total: heatCenters.length,
          maxOutput: maxHeatOutput,
          totalCapacity
        },
        demandSites: {
          active: activeDemandSites,
          inactive: inactiveDemandSites,
          total: demandSites.length,
          maxDemand,
          totalDemand
        },
        overall: {
          totalSites: heatCenters.length + demandSites.length,
          activeConnections: activeHeatCenters + activeDemandSites,
          energyEfficiency: totalCapacity > 0 ? ((totalDemand / totalCapacity) * 100) : 0
        }
      };
    } catch (error) {
      console.error('Error calculating statistics:', error);
      return {
        heatCenters: { active: 0, inactive: 0, total: 0, maxOutput: 0, totalCapacity: 0 },
        demandSites: { active: 0, inactive: 0, total: 0, maxDemand: 0, totalDemand: 0 },
        overall: { totalSites: 0, activeConnections: 0, energyEfficiency: 0 }
      };
    }
  }, [heatCenters, demandSites]);

  const formatEnergy = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)} GW`;
    }
    return `${value.toFixed(1)} MW`;
  };

  if (isLoading) {
    return (
      <div className="w-80 bg-sidebar backdrop-blur-md border-r border-sidebar-border shadow-lg p-4 space-y-4 text-sidebar-foreground">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-muted rounded"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded"></div>
            <div className="h-4 bg-muted rounded w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-80 bg-sidebar backdrop-blur-md border-r border-sidebar-border shadow-lg overflow-y-auto text-sidebar-foreground">
      <div className="p-4 space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-6 w-6 text-primary" />
          <h2 className="text-xl font-bold text-foreground">System Overview</h2>
        </div>

        {/* Heat Centers Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Zap className="h-5 w-5" />
              Heat Centers
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Active</span>
              <Badge variant="default" className="bg-primary/20 text-primary-foreground">
                {stats.heatCenters.active}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Inactive</span>
              <Badge variant="secondary" className="bg-destructive/20 text-destructive-foreground">
                {stats.heatCenters.inactive}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Max Output</span>
                <span className="text-sm font-bold text-primary">
                  {formatEnergy(stats.heatCenters.maxOutput)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Capacity</span>
                <span className="text-sm font-bold text-primary">
                  {formatEnergy(stats.heatCenters.totalCapacity)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Demand Sites Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <Building2 className="h-5 w-5" />
              Demand Sites
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Active</span>
              <Badge variant="default" className="bg-primary/20 text-primary-foreground">
                {stats.demandSites.active}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Inactive</span>
              <Badge variant="secondary" className="bg-destructive/20 text-destructive-foreground">
                {stats.demandSites.inactive}
              </Badge>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Peak Demand</span>
                <span className="text-sm font-bold text-primary">
                  {formatEnergy(stats.demandSites.maxDemand)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-muted-foreground">Total Demand</span>
                <span className="text-sm font-bold text-primary">
                  {formatEnergy(stats.demandSites.totalDemand)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Overall Statistics Card */}
        <Card className="border-border bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-foreground">
              <TrendingUp className="h-5 w-5" />
              System Metrics
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Total Sites</span>
              <Badge variant="outline" className="border-border text-foreground">
                {stats.overall.totalSites}
              </Badge>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-muted-foreground">Active Connections</span>
              <Badge variant="default" className="bg-primary/20 text-primary-foreground">
                {stats.overall.activeConnections}
              </Badge>
            </div>
            <Separator />
            <div className="flex justify-between items-center">
              <span className="text-xs text-muted-foreground">System Utilization</span>
              <span className="text-sm font-bold text-primary">
                {stats.overall.energyEfficiency.toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-muted rounded-lg p-3 text-center">
            <MapPin className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold text-foreground">{stats.heatCenters.total}</div>
            <div className="text-xs text-muted-foreground">Heat Centers</div>
          </div>
          <div className="bg-muted rounded-lg p-3 text-center">
            <Database className="h-4 w-4 mx-auto mb-1 text-muted-foreground" />
            <div className="text-lg font-bold text-foreground">{stats.demandSites.total}</div>
            <div className="text-xs text-muted-foreground">Demand Sites</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatsSidebar;