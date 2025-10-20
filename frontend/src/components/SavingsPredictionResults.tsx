import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Zap, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Leaf, 
  Clock, 
  MapPin, 
  Thermometer,
  BarChart3,
  PieChart,
  Calculator,
  Target
} from 'lucide-react';

interface SavingsPredictionResultsProps {
  prediction: SavingsPredictionResult;
  isLoading?: boolean;
}

export interface SavingsPredictionResult {
  // Basic Information
  data_center_name: string;
  prediction_date: string;
  scenario_name: string;
  
  // Energy Metrics
  annual_energy_consumption_mwh: number;
  energy_cost_per_year: number;
  energy_savings_mwh: number;
  energy_savings_percentage: number;
  
  // Carbon Metrics
  annual_co2_emissions_tons: number;
  co2_reduction_tons: number;
  co2_reduction_percentage: number;
  carbon_credit_cost: number;
  
  // Financial Metrics
  total_capex: number;
  annual_opex: number;
  annual_savings: number;
  net_present_value: number;
  return_on_investment: number;
  payback_period_years: number;
  
  // Heat Recovery
  recoverable_heat_mw: number;
  heat_utilization_percentage: number;
  nearest_heat_sink_distance_km: number;
  heat_sink_name?: string;
  
  // Yearly Breakdown (first 10 years)
  yearly_breakdown: Array<{
    year: number;
    energy_cost: number;
    energy_savings: number;
    carbon_cost: number;
    net_savings: number;
    cumulative_savings: number;
  }>;
  
  // Sensitivity Analysis
  sensitivity_analysis?: {
    energy_price_impact: number;
    carbon_price_impact: number;
    efficiency_impact: number;
  };
}

const SavingsPredictionResults: React.FC<SavingsPredictionResultsProps> = ({
  prediction,
  isLoading = false
}) => {
  if (isLoading) {
    return (
      <div className="w-full max-w-6xl mx-auto space-y-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <span className="ml-3 text-lg">Calculating savings prediction...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number, decimals: number = 1): string => {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(num);
  };

  const getROIColor = (roi: number): string => {
    if (roi >= 20) return 'text-green-600';
    if (roi >= 10) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getPaybackColor = (years: number): string => {
    if (years <= 3) return 'text-green-600';
    if (years <= 7) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Header Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-6 w-6 text-blue-600" />
            Savings Prediction Results
          </CardTitle>
          <CardDescription>
            Analysis for {prediction.data_center_name} • Generated on {new Date(prediction.prediction_date).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {formatCurrency(prediction.annual_savings)}
              </div>
              <div className="text-sm text-green-700">Annual Savings</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">
                {formatNumber(prediction.return_on_investment)}%
              </div>
              <div className="text-sm text-blue-700">ROI</div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {formatNumber(prediction.payback_period_years, 1)} years
              </div>
              <div className="text-sm text-purple-700">Payback Period</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-2xl font-bold text-orange-600">
                {formatNumber(prediction.co2_reduction_tons)} tons
              </div>
              <div className="text-sm text-orange-700">CO₂ Reduction/Year</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Energy Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-yellow-600" />
              Energy Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Annual Consumption</span>
                <span className="font-semibold">{formatNumber(prediction.annual_energy_consumption_mwh)} MWh</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Energy Cost/Year</span>
                <span className="font-semibold">{formatCurrency(prediction.energy_cost_per_year)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">Energy Savings</span>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatNumber(prediction.energy_savings_mwh)} MWh
                  </div>
                  <div className="text-xs text-green-600">
                    ({formatNumber(prediction.energy_savings_percentage)}% reduction)
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Energy Efficiency</span>
                  <span>{formatNumber(prediction.energy_savings_percentage)}%</span>
                </div>
                <Progress value={prediction.energy_savings_percentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Carbon Impact */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-green-600" />
              Carbon Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Current CO₂ Emissions</span>
                <span className="font-semibold">{formatNumber(prediction.annual_co2_emissions_tons)} tons/year</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">CO₂ Reduction</span>
                <div className="text-right">
                  <div className="font-semibold text-green-600">
                    {formatNumber(prediction.co2_reduction_tons)} tons/year
                  </div>
                  <div className="text-xs text-green-600">
                    ({formatNumber(prediction.co2_reduction_percentage)}% reduction)
                  </div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Carbon Credit Cost</span>
                <span className="font-semibold">{formatCurrency(prediction.carbon_credit_cost)}/year</span>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Carbon Reduction</span>
                  <span>{formatNumber(prediction.co2_reduction_percentage)}%</span>
                </div>
                <Progress value={prediction.co2_reduction_percentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Financial Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600" />
              Financial Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Total CAPEX</span>
                <span className="font-semibold">{formatCurrency(prediction.total_capex)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Annual OPEX</span>
                <span className="font-semibold">{formatCurrency(prediction.annual_opex)}</span>
              </div>
              
              <Separator />
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-green-700">Annual Savings</span>
                <span className="font-semibold text-green-600">{formatCurrency(prediction.annual_savings)}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Net Present Value</span>
                <span className={`font-semibold ${prediction.net_present_value > 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(prediction.net_present_value)}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className={`text-lg font-bold ${getROIColor(prediction.return_on_investment)}`}>
                    {formatNumber(prediction.return_on_investment)}%
                  </div>
                  <div className="text-xs text-gray-600">ROI</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded">
                  <div className={`text-lg font-bold ${getPaybackColor(prediction.payback_period_years)}`}>
                    {formatNumber(prediction.payback_period_years, 1)}y
                  </div>
                  <div className="text-xs text-gray-600">Payback</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Heat Recovery */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-red-600" />
              Heat Recovery
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Recoverable Heat</span>
                <span className="font-semibold">{formatNumber(prediction.recoverable_heat_mw)} MW</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">Heat Utilization</span>
                <span className="font-semibold">{formatNumber(prediction.heat_utilization_percentage)}%</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  Nearest Heat Sink
                </span>
                <div className="text-right">
                  <div className="font-semibold">{formatNumber(prediction.nearest_heat_sink_distance_km)} km</div>
                  {prediction.heat_sink_name && (
                    <div className="text-xs text-gray-600">{prediction.heat_sink_name}</div>
                  )}
                </div>
              </div>
              
              <div className="pt-2">
                <div className="flex justify-between text-xs mb-1">
                  <span>Heat Utilization Efficiency</span>
                  <span>{formatNumber(prediction.heat_utilization_percentage)}%</span>
                </div>
                <Progress value={prediction.heat_utilization_percentage} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Yearly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-blue-600" />
            10-Year Financial Projection
          </CardTitle>
          <CardDescription>
            Annual savings and cumulative benefits over time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Year</th>
                  <th className="text-right p-2">Energy Cost</th>
                  <th className="text-right p-2">Energy Savings</th>
                  <th className="text-right p-2">Carbon Cost</th>
                  <th className="text-right p-2">Net Savings</th>
                  <th className="text-right p-2">Cumulative</th>
                </tr>
              </thead>
              <tbody>
                {prediction.yearly_breakdown.map((year) => (
                  <tr key={year.year} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{year.year}</td>
                    <td className="p-2 text-right">{formatCurrency(year.energy_cost)}</td>
                    <td className="p-2 text-right text-green-600">{formatCurrency(year.energy_savings)}</td>
                    <td className="p-2 text-right">{formatCurrency(year.carbon_cost)}</td>
                    <td className="p-2 text-right font-medium text-green-600">{formatCurrency(year.net_savings)}</td>
                    <td className="p-2 text-right font-bold text-blue-600">{formatCurrency(year.cumulative_savings)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sensitivity Analysis */}
      {prediction.sensitivity_analysis && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-purple-600" />
              Sensitivity Analysis
            </CardTitle>
            <CardDescription>
              Impact of key variables on overall savings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-blue-600">
                  {formatNumber(prediction.sensitivity_analysis.energy_price_impact)}%
                </div>
                <div className="text-sm text-gray-600">Energy Price Impact</div>
                <div className="text-xs text-gray-500 mt-1">Per 10% price change</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-green-600">
                  {formatNumber(prediction.sensitivity_analysis.carbon_price_impact)}%
                </div>
                <div className="text-sm text-gray-600">Carbon Price Impact</div>
                <div className="text-xs text-gray-500 mt-1">Per 10% price change</div>
              </div>
              <div className="text-center p-4 border rounded-lg">
                <div className="text-lg font-bold text-purple-600">
                  {formatNumber(prediction.sensitivity_analysis.efficiency_impact)}%
                </div>
                <div className="text-sm text-gray-600">Efficiency Impact</div>
                <div className="text-xs text-gray-500 mt-1">Per 1% efficiency change</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Key Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="h-5 w-5 text-indigo-600" />
            Key Insights & Recommendations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {prediction.return_on_investment > 15 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <TrendingUp className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Excellent ROI</div>
                  <div className="text-sm text-green-700">
                    With {formatNumber(prediction.return_on_investment)}% ROI, this project shows strong financial returns.
                  </div>
                </div>
              </div>
            )}
            
            {prediction.payback_period_years <= 5 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
                <Clock className="h-4 w-4 text-blue-600 mt-0.5" />
                <div>
                  <div className="font-medium text-blue-800">Quick Payback</div>
                  <div className="text-sm text-blue-700">
                    Payback period of {formatNumber(prediction.payback_period_years, 1)} years is excellent for infrastructure investments.
                  </div>
                </div>
              </div>
            )}
            
            {prediction.co2_reduction_percentage > 20 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 rounded-lg">
                <Leaf className="h-4 w-4 text-green-600 mt-0.5" />
                <div>
                  <div className="font-medium text-green-800">Significant Carbon Impact</div>
                  <div className="text-sm text-green-700">
                    {formatNumber(prediction.co2_reduction_percentage)}% CO₂ reduction contributes meaningfully to sustainability goals.
                  </div>
                </div>
              </div>
            )}
            
            {prediction.nearest_heat_sink_distance_km > 10 && (
              <div className="flex items-start gap-2 p-3 bg-yellow-50 rounded-lg">
                <MapPin className="h-4 w-4 text-yellow-600 mt-0.5" />
                <div>
                  <div className="font-medium text-yellow-800">Distance Consideration</div>
                  <div className="text-sm text-yellow-700">
                    Heat sink is {formatNumber(prediction.nearest_heat_sink_distance_km)} km away. Consider infrastructure costs for heat distribution.
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SavingsPredictionResults;