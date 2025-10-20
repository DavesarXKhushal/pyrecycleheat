import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Calculator, 
  Building2, 
  Leaf, 
  Thermometer, 
  TrendingUp, 
  Settings, 
  History,
  Plus,
  Search,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';

// Import our custom components
import DataCenterInputForm, { DataCenterFormData } from './DataCenterInputForm';
import CarbonCreditForm, { CarbonCreditFormData } from './CarbonCreditForm';
import SavingsPredictionResults, { SavingsPredictionResult } from './SavingsPredictionResults';

interface SavingsPredictionDashboardProps {
  className?: string;
}

interface DataCenter {
  id: number;
  name: string;
  location_lat: number;
  location_lng: number;
  total_it_load_kw: number;
  pue: number;
  created_at: string;
}

interface CarbonCredit {
  id: number;
  name: string;
  price_per_ton_co2: number;
  certification_standard: string;
  project_type: string;
  created_at: string;
}

interface PredictionHistory {
  id: number;
  data_center_id: number;
  scenario_name: string;
  annual_savings: number;
  roi_percentage: number;
  payback_period_years: number;
  created_at: string;
}

const SavingsPredictionDashboard: React.FC<SavingsPredictionDashboardProps> = ({
  className = ""
}) => {
  // State management
  const [activeTab, setActiveTab] = useState<string>("calculate");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Data state
  const [dataCenters, setDataCenters] = useState<DataCenter[]>([]);
  const [carbonCredits, setCarbonCredits] = useState<CarbonCredit[]>([]);
  const [predictionHistory, setPredictionHistory] = useState<PredictionHistory[]>([]);
  const [currentPrediction, setCurrentPrediction] = useState<SavingsPredictionResult | null>(null);
  
  // Form state
  const [selectedDataCenter, setSelectedDataCenter] = useState<number | null>(null);
  const [selectedCarbonCredit, setSelectedCarbonCredit] = useState<number | null>(null);
  const [showDataCenterForm, setShowDataCenterForm] = useState(false);
  const [showCarbonCreditForm, setShowCarbonCreditForm] = useState(false);

  // API base URL
  const API_BASE = 'http://localhost:8000/api/v1/predictions';

  // Load initial data
  useEffect(() => {
    loadDataCenters();
    loadCarbonCredits();
    loadPredictionHistory();
  }, []);

  const loadDataCenters = async () => {
    try {
      const response = await fetch(`${API_BASE}/data-centers`);
      if (response.ok) {
        const data = await response.json();
        setDataCenters(data);
      }
    } catch (error) {
      console.error('Failed to load data centers:', error);
    }
  };

  const loadCarbonCredits = async () => {
    try {
      const response = await fetch(`${API_BASE}/carbon-credits`);
      if (response.ok) {
        const data = await response.json();
        setCarbonCredits(data);
      }
    } catch (error) {
      console.error('Failed to load carbon credits:', error);
    }
  };

  const loadPredictionHistory = async () => {
    try {
      const response = await fetch(`${API_BASE}/predictions?limit=10`);
      if (response.ok) {
        const data = await response.json();
        setPredictionHistory(data);
      }
    } catch (error) {
      console.error('Failed to load prediction history:', error);
    }
  };

  const handleDataCenterSubmit = async (formData: DataCenterFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/data-centers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newDataCenter = await response.json();
        setDataCenters(prev => [...prev, newDataCenter]);
        setSelectedDataCenter(newDataCenter.id);
        setShowDataCenterForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create data center');
      }
    } catch (error) {
      setError('Network error occurred while creating data center');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCarbonCreditSubmit = async (formData: CarbonCreditFormData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/carbon-credits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const newCarbonCredit = await response.json();
        setCarbonCredits(prev => [...prev, newCarbonCredit]);
        setSelectedCarbonCredit(newCarbonCredit.id);
        setShowCarbonCreditForm(false);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to create carbon credit');
      }
    } catch (error) {
      setError('Network error occurred while creating carbon credit');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCalculatePrediction = async () => {
    if (!selectedDataCenter || !selectedCarbonCredit) {
      setError('Please select both a data center and carbon credit');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/calculate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data_center_id: selectedDataCenter,
          carbon_credit_id: selectedCarbonCredit,
          scenario_name: 'Base Case Analysis',
          analysis_years: 10,
          discount_rate: 0.08
        }),
      });

      if (response.ok) {
        const predictionResult = await response.json();
        setCurrentPrediction(predictionResult);
        setActiveTab('results');
        loadPredictionHistory(); // Refresh history
      } else {
        const errorData = await response.json();
        setError(errorData.detail || 'Failed to calculate prediction');
      }
    } catch (error) {
      setError('Network error occurred while calculating prediction');
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className={`w-full max-w-7xl mx-auto p-6 space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <Calculator className="h-8 w-8 text-blue-600" />
            Data Center Savings Prediction
          </h1>
          <p className="text-gray-600 mt-2">
            Calculate energy savings, carbon reduction, and financial returns for data center optimization
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadPredictionHistory}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="calculate" className="flex items-center gap-2">
            <Calculator className="h-4 w-4" />
            Calculate
          </TabsTrigger>
          <TabsTrigger value="results" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Results
          </TabsTrigger>
          <TabsTrigger value="manage" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Manage
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Calculate Tab */}
        <TabsContent value="calculate" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Data Center Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5 text-blue-600" />
                  Select Data Center
                </CardTitle>
                <CardDescription>
                  Choose an existing data center or create a new one
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {dataCenters.length > 0 ? (
                  <div className="space-y-2">
                    {dataCenters.map((dc) => (
                      <div
                        key={dc.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedDataCenter === dc.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedDataCenter(dc.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{dc.name}</h4>
                            <p className="text-sm text-gray-600">
                              {dc.total_it_load_kw} kW • PUE {dc.pue}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {formatDate(dc.created_at)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No data centers available
                  </p>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowDataCenterForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Data Center
                </Button>
              </CardContent>
            </Card>

            {/* Carbon Credit Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5 text-green-600" />
                  Select Carbon Credit
                </CardTitle>
                <CardDescription>
                  Choose carbon credit parameters for offset calculations
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {carbonCredits.length > 0 ? (
                  <div className="space-y-2">
                    {carbonCredits.map((cc) => (
                      <div
                        key={cc.id}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          selectedCarbonCredit === cc.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedCarbonCredit(cc.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{cc.name}</h4>
                            <p className="text-sm text-gray-600">
                              ${cc.price_per_ton_co2}/ton • {cc.certification_standard}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {cc.project_type}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-center py-4">
                    No carbon credits available
                  </p>
                )}
                
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowCarbonCreditForm(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add New Carbon Credit
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Calculate Button */}
          <div className="flex justify-center">
            <Button
              size="lg"
              onClick={handleCalculatePrediction}
              disabled={!selectedDataCenter || !selectedCarbonCredit || isLoading}
              className="px-8 py-3"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Calculator className="h-5 w-5 mr-2" />
                  Calculate Savings Prediction
                </>
              )}
            </Button>
          </div>
        </TabsContent>

        {/* Results Tab */}
        <TabsContent value="results">
          {currentPrediction ? (
            <SavingsPredictionResults 
              prediction={currentPrediction}
              isLoading={isLoading}
            />
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No Prediction Results
                </h3>
                <p className="text-gray-600 mb-4">
                  Calculate a savings prediction to see detailed results and analysis.
                </p>
                <Button onClick={() => setActiveTab('calculate')}>
                  Start Calculation
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Manage Tab */}
        <TabsContent value="manage" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Data Centers ({dataCenters.length})</CardTitle>
                <CardDescription>
                  Manage your data center configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {dataCenters.slice(0, 5).map((dc) => (
                    <div key={dc.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{dc.name}</p>
                        <p className="text-sm text-gray-600">{dc.total_it_load_kw} kW</p>
                      </div>
                      <Badge variant="outline">{formatDate(dc.created_at)}</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Data Centers
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Carbon Credits ({carbonCredits.length})</CardTitle>
                <CardDescription>
                  Manage your carbon credit configurations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {carbonCredits.slice(0, 5).map((cc) => (
                    <div key={cc.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{cc.name}</p>
                        <p className="text-sm text-gray-600">${cc.price_per_ton_co2}/ton</p>
                      </div>
                      <Badge variant="outline">{cc.certification_standard}</Badge>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Carbon Credits
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Prediction History</CardTitle>
              <CardDescription>
                View and manage your previous savings calculations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {predictionHistory.length > 0 ? (
                <div className="space-y-3">
                  {predictionHistory.map((prediction) => (
                    <div key={prediction.id} className="p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{prediction.scenario_name}</h4>
                          <p className="text-sm text-gray-600">
                            Data Center ID: {prediction.data_center_id}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-green-600">
                            {formatCurrency(prediction.annual_savings)}/year
                          </p>
                          <p className="text-sm text-gray-600">
                            {prediction.roi_percentage.toFixed(1)}% ROI
                          </p>
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-2">
                        <Badge variant="secondary">
                          {prediction.payback_period_years.toFixed(1)} year payback
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(prediction.created_at)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">No prediction history available</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Forms */}
      {showDataCenterForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add New Data Center</h2>
              <Button variant="ghost" onClick={() => setShowDataCenterForm(false)}>
                ×
              </Button>
            </div>
            <div className="p-4">
              <DataCenterInputForm
                onSubmit={handleDataCenterSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}

      {showCarbonCreditForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-xl font-semibold">Add New Carbon Credit</h2>
              <Button variant="ghost" onClick={() => setShowCarbonCreditForm(false)}>
                ×
              </Button>
            </div>
            <div className="p-4">
              <CarbonCreditForm
                onSubmit={handleCarbonCreditSubmit}
                isLoading={isLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SavingsPredictionDashboard;