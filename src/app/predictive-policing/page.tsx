"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Upload, 
  MapPin, 
  BarChart3, 
  Filter, 
  Calendar,
  Clock,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Download,
  RefreshCw,
  Search,
  Activity,
  Zap,
  Eye,
  Settings,
  Maximize,
  FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface CrimeData {
  id: string
  crimeType: string
  latitude: number
  longitude: number
  date: Date
  time: string
  description?: string
  severity: number
}

interface Hotspot {
  id: string
  centerLat: number
  centerLng: number
  radius: number
  crimeCount: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  topCrimeType: string
}

interface CrimeTrend {
  crimeType: string
  period: string
  count: number
  change: number
  trend: 'increasing' | 'decreasing' | 'stable'
}

function PredictivePolicingPageContent() {
  const [crimeData, setCrimeData] = useState<CrimeData[]>([])
  const [hotspots, setHotspots] = useState<Hotspot[]>([])
  const [trends, setTrends] = useState<CrimeTrend[]>([])
  const [selectedCrimeType, setSelectedCrimeType] = useState<string>("all")
  const [selectedTimeRange, setSelectedTimeRange] = useState<string>("30d")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Mock crime data for demonstration
  const mockCrimeData: CrimeData[] = [
    {
      id: '1',
      crimeType: 'theft',
      latitude: 13.7563,
      longitude: 100.5018,
      date: new Date('2024-01-01'),
      time: '14:30',
      description: 'การลักทรัพย์ในร้านค้า',
      severity: 2
    },
    {
      id: '2',
      crimeType: 'assault',
      latitude: 13.7563,
      longitude: 100.5018,
      date: new Date('2024-01-02'),
      time: '20:15',
      description: 'การทำร้ายร่างกาย',
      severity: 3
    },
    {
      id: '3',
      crimeType: 'burglary',
      latitude: 13.7463,
      longitude: 100.4918,
      date: new Date('2024-01-03'),
      time: '03:00',
      description: 'การบุกรุกเคหะสถาน',
      severity: 3
    },
    {
      id: '4',
      crimeType: 'theft',
      latitude: 13.7663,
      longitude: 100.5118,
      date: new Date('2024-01-04'),
      time: '16:45',
      description: 'การลักทรัพย์',
      severity: 1
    },
    {
      id: '5',
      crimeType: 'fraud',
      latitude: 13.7563,
      longitude: 100.5018,
      date: new Date('2024-01-05'),
      time: '10:00',
      description: 'การฉ้อโกงออนไลน์',
      severity: 2
    }
  ]

  const mockHotspots: Hotspot[] = [
    {
      id: '1',
      centerLat: 13.7563,
      centerLng: 100.5018,
      radius: 1000,
      crimeCount: 15,
      riskLevel: 'high',
      topCrimeType: 'theft'
    },
    {
      id: '2',
      centerLat: 13.7463,
      centerLng: 100.4918,
      radius: 800,
      crimeCount: 8,
      riskLevel: 'medium',
      topCrimeType: 'burglary'
    },
    {
      id: '3',
      centerLat: 13.7663,
      centerLng: 100.5118,
      radius: 600,
      crimeCount: 5,
      riskLevel: 'low',
      topCrimeType: 'fraud'
    }
  ]

  const mockTrends: CrimeTrend[] = [
    {
      crimeType: 'theft',
      period: '7d',
      count: 12,
      change: 15,
      trend: 'increasing'
    },
    {
      crimeType: 'assault',
      period: '7d',
      count: 5,
      change: -20,
      trend: 'decreasing'
    },
    {
      crimeType: 'burglary',
      period: '7d',
      count: 8,
      change: 0,
      trend: 'stable'
    },
    {
      crimeType: 'fraud',
      period: '7d',
      count: 3,
      change: 50,
      trend: 'increasing'
    }
  ]

  const crimeTypes = [
    { value: 'theft', label: 'การลักทรัพย์' },
    { value: 'assault', label: 'การทำร้ายร่างกาย' },
    { value: 'burglary', label: 'การบุกรุกเคหะสถาน' },
    { value: 'fraud', label: 'การฉ้อโกง' },
    { value: 'vandalism', label: 'การทำลายทรัพย์' },
    { value: 'drug', label: 'ยาเสพติด' }
  ]

  const timeRanges = [
    { value: '7d', label: '7 วัน' },
    { value: '30d', label: '30 วัน' },
    { value: '90d', label: '90 วัน' },
    { value: '1y', label: '1 ปี' }
  ]

  const severityLevels = [
    { value: '1', label: 'ระดับ 1 (ต่ำ)' },
    { value: '2', label: 'ระดับ 2 (ปานกลาง)' },
    { value: '3', label: 'ระดับ 3 (สูง)' },
    { value: '4', label: 'ระดับ 4 (วิกฤต)' }
  ]

  const getRiskColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low': return 'bg-green-100 text-green-800'
      case 'medium': return 'bg-yellow-100 text-yellow-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing': return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'decreasing': return <TrendingUp className="h-4 w-4 text-green-500 rotate-180" />
      case 'stable': return <Activity className="h-4 w-4 text-blue-500" />
      default: return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'increasing': return 'text-red-600'
      case 'decreasing': return 'text-green-600'
      case 'stable': return 'text-blue-600'
      default: return 'text-gray-600'
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    
    // Simulate file processing
    setTimeout(() => {
      setCrimeData(mockCrimeData)
      setHotspots(mockHotspots)
      setTrends(mockTrends)
      setIsLoading(false)
    }, 2000)
  }

  const generateHeatmap = () => {
    setIsLoading(true)
    
    // Simulate heatmap generation
    setTimeout(() => {
      setHotspots(mockHotspots)
      setIsLoading(false)
    }, 1500)
  }

  const exportData = (format: 'csv' | 'pdf' | 'json') => {
    alert(`กำลังส่งออกข้อมูลในรูปแบบ ${format.toUpperCase()}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Button variant="ghost" size="sm" className="mr-4">
                ← กลับหน้าหลัก
              </Button>
              <div>
                <h1 className="text-xl font-bold text-gray-900">Predictive Policing</h1>
                <p className="text-sm text-gray-500">การวิเคราะห์จุดเสี่ยงและทำนายแนวโน้มอาชญากรรม</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                ตั้งค่า
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                ส่งออก
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">จำนวนอาชญากรรม</p>
                  <p className="text-2xl font-bold text-gray-900">{crimeData.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">จุดเสี่ยงสูง</p>
                  <p className="text-2xl font-bold text-red-600">
                    {hotspots.filter(h => h.riskLevel === 'high' || h.riskLevel === 'critical').length}
                  </p>
                </div>
                <MapPin className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">แนวโน้มเพิ่มขึ้น</p>
                  <p className="text-2xl font-bold text-red-600">
                    {trends.filter(t => t.trend === 'increasing').length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ความแม่นยำ</p>
                  <p className="text-2xl font-bold text-green-600">87%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Controls and Upload */}
          <div className="lg:col-span-1 space-y-6">
            {/* Data Upload */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  อัปโหลดข้อมูล
                </CardTitle>
                <CardDescription>
                  อัปโหลดไฟล์ CSV ที่มีข้อมูลอาชญากรรม
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">คลิกเพื่ออัปโหลดไฟล์ CSV</p>
                  <p className="text-sm text-gray-500">ต้องมีคอลัมน์: crime_type, latitude, longitude, date, time</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {isLoading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>กำลังประมวลผล...</span>
                      <span className="text-blue-600">50%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full w-1/2 transition-all"></div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  ตัวกรอง
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ประเภทอาชญากรรม</Label>
                  <Select value={selectedCrimeType} onValueChange={setSelectedCrimeType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      {crimeTypes.map(type => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ช่วงเวลา</Label>
                  <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {timeRanges.map(range => (
                        <SelectItem key={range.value} value={range.value}>
                          {range.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ระดับความรุนแรง</Label>
                  <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      {severityLevels.map(level => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button 
                  className="w-full" 
                  onClick={generateHeatmap}
                  disabled={isLoading}
                >
                  <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
                  สร้าง Heatmap
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Visualizations */}
          <div className="lg:col-span-3 space-y-6">
            {/* Heatmap */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <MapPin className="h-5 w-5 mr-2" />
                    แผนที่ความเสี่ยง (Heatmap)
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Maximize className="h-4 w-4 mr-2" />
                      ขยาย
                    </Button>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      ดูรายละเอียด
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-100 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center relative overflow-hidden">
                  {isLoading ? (
                    <div className="text-center">
                      <RefreshCw className="h-16 w-16 text-gray-400 mx-auto mb-4 animate-spin" />
                      <p className="text-gray-500">กำลังสร้าง Heatmap...</p>
                    </div>
                  ) : hotspots.length > 0 ? (
                    <div className="relative w-full h-full">
                      {/* Mock heatmap visualization */}
                      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-yellow-100 to-red-100 opacity-60"></div>
                      
                      {/* Hotspot indicators */}
                      {hotspots.map((hotspot, index) => (
                        <div
                          key={hotspot.id}
                          className={cn(
                            "absolute rounded-full border-2 border-white shadow-lg",
                            hotspot.riskLevel === 'low' ? 'bg-green-400' :
                            hotspot.riskLevel === 'medium' ? 'bg-yellow-400' :
                            hotspot.riskLevel === 'high' ? 'bg-orange-400' :
                            'bg-red-400'
                          )}
                          style={{
                            width: `${hotspot.radius / 10}px`,
                            height: `${hotspot.radius / 10}px`,
                            left: `${50 + (hotspot.longitude - 100.5) * 100}%`,
                            top: `${50 - (hotspot.latitude - 13.75) * 100}%`,
                            transform: 'translate(-50%, -50%)'
                          }}
                        >
                          <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow text-xs whitespace-nowrap">
                            <div className="font-medium">{hotspot.crimeCount} คดี</div>
                            <div className="text-gray-500">{hotspot.topCrimeType}</div>
                          </div>
                        </div>
                      ))}
                      
                      {/* Legend */}
                      <div className="absolute bottom-4 left-4 bg-white p-3 rounded-lg shadow-md">
                        <div className="text-sm font-medium mb-2">ระดับความเสี่ยง</div>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                            <span className="text-xs">ต่ำ</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>
                            <span className="text-xs">ปานกลาง</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-orange-400 rounded-full"></div>
                            <span className="text-xs">สูง</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                            <span className="text-xs">วิกฤต</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center">
                      <MapPin className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">ยังไม่มีข้อมูลแผนที่ความเสี่ยง</p>
                      <p className="text-sm text-gray-400">อัปโหลดข้อมูลอาชญากรรมเพื่อสร้าง Heatmap</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Crime Trends */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Trends Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BarChart3 className="h-5 w-5 mr-2" />
                    แนวโน้มอาชญากรรม
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {trends.length > 0 ? (
                    <div className="space-y-3">
                      {trends.map((trend, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            {getTrendIcon(trend.trend)}
                            <div>
                              <div className="font-medium text-sm">
                                {crimeTypes.find(ct => ct.value === trend.crimeType)?.label || trend.crimeType}
                              </div>
                              <div className="text-xs text-gray-500">{trend.period}</div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-medium text-sm">{trend.count} คดี</div>
                            <div className={cn("text-xs font-medium", getTrendColor(trend.trend))}>
                              {trend.change > 0 ? '+' : ''}{trend.change}%
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">ยังไม่มีข้อมูลแนวโน้ม</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Hotspot Summary */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Zap className="h-5 w-5 mr-2" />
                    สรุปจุดเสี่ยง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {hotspots.length > 0 ? (
                    <div className="space-y-3">
                      {hotspots.map((hotspot, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={getRiskColor(hotspot.riskLevel)}>
                              {hotspot.riskLevel === 'low' ? 'ต่ำ' :
                               hotspot.riskLevel === 'medium' ? 'ปานกลาง' :
                               hotspot.riskLevel === 'high' ? 'สูง' :
                               hotspot.riskLevel === 'critical' ? 'วิกฤต' : hotspot.riskLevel}
                            </Badge>
                            <span className="text-sm font-medium">{hotspot.crimeCount} คดี</span>
                          </div>
                          <div className="text-xs text-gray-600">
                            รัศมี: {hotspot.radius}m | อาชญากรรมหลัก: {hotspot.topCrimeType}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Zap className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 text-sm">ยังไม่มีข้อมูลจุดเสี่ยง</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  ส่งออกข้อมูล
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-4">
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => exportData('csv')}
                    disabled={crimeData.length === 0}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    CSV
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => exportData('pdf')}
                    disabled={crimeData.length === 0}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    PDF
                  </Button>
                  <Button 
                    variant="outline" 
                    className="h-20 flex-col"
                    onClick={() => exportData('json')}
                    disabled={crimeData.length === 0}
                  >
                    <FileText className="h-6 w-6 mb-2" />
                    JSON
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function PredictivePolicingPage() {
  return (
    <ProtectedRoute>
      <PredictivePolicingPageContent />
    </ProtectedRoute>
  )
}