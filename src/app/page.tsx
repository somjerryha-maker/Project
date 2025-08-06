"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  FileSearch, 
  Mic, 
  FolderOpen, 
  MapPin, 
  BarChart3, 
  Users, 
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Archive,
  FileText,
  LogOut
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

function DashboardContent() {
  const [activeModule, setActiveModule] = useState("dashboard")
  const { user, logout } = useAuth()

  const handleModuleClick = (moduleId: string) => {
    switch (moduleId) {
      case "data-analysis":
        window.location.href = '/data-analysis'
        break
      case "document-intelligence":
        window.location.href = '/document-intelligence'
        break
      case "interrogation":
        window.location.href = '/interrogation'
        break
      case "case-management":
        window.location.href = '/case-management'
        break
      case "predictive-policing":
        window.location.href = '/predictive-policing'
        break
      default:
        alert(`Module ${moduleId} is under development`)
    }
  }

  const modules = [
    {
      id: "data-analysis",
      title: "Data Analysis & Processing",
      description: "Analyze evidence files, extract insights, and build knowledge graphs",
      icon: FileSearch,
      color: "bg-blue-500",
      features: ["Evidence Analysis", "Document Intelligence", "Knowledge Graph"]
    },
    {
      id: "document-intelligence",
      title: "Document Intelligence & Knowledge Graph",
      description: "Extract entities from documents and build interactive knowledge graphs",
      icon: FileText,
      color: "bg-purple-500",
      features: ["Entity Extraction", "Knowledge Graph", "Document Analysis"]
    },
    {
      id: "case-management",
      title: "Case Management & Reporting",
      description: "Track cases, deadlines, and generate automated reports",
      icon: FolderOpen,
      color: "bg-orange-500",
      features: ["Case Dashboard", "Deadline Tracking", "Report Generation"]
    },
    {
      id: "interrogation",
      title: "Interrogation Support",
      description: "Real-time transcription and AI-powered question suggestions",
      icon: Mic,
      color: "bg-green-500",
      features: ["Live Transcription", "Question Suggestions", "Export Options"]
    },
    {
      id: "predictive-policing",
      title: "Predictive Policing",
      description: "Crime hotspot analysis and trend prediction",
      icon: MapPin,
      color: "bg-red-500",
      features: ["Hotspot Analysis", "Trend Prediction", "Statistical Reports"]
    }
  ]

  const stats = [
    {
      title: "Active Cases",
      value: "24",
      change: "+3",
      icon: FolderOpen,
      color: "text-blue-600"
    },
    {
      title: "Evidence Analyzed",
      value: "156",
      change: "+12",
      icon: FileSearch,
      color: "text-green-600"
    },
    {
      title: "Transcriptions",
      value: "89",
      change: "+5",
      icon: Mic,
      color: "text-purple-600"
    },
    {
      title: "Reports Generated",
      value: "67",
      change: "+8",
      icon: BarChart3,
      color: "text-orange-600"
    }
  ]

  const recentCases = [
    {
      id: "CASE-2024-001",
      title: "Theft Investigation",
      status: "UNDER_INVESTIGATION",
      priority: "HIGH",
      assignedTo: "สมชาย ใจดี",
      dueDate: "2024-01-15"
    },
    {
      id: "CASE-2024-002",
      title: "Assault Case",
      status: "REPORT_SUBMITTED",
      priority: "MEDIUM",
      assignedTo: "สมศรี รักดี",
      dueDate: "2024-01-10"
    },
    {
      id: "CASE-2024-003",
      title: "Fraud Investigation",
      status: "UNDER_INVESTIGATION",
      priority: "URGENT",
      assignedTo: "วิชัย มานะ",
      dueDate: "2024-01-08"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case "UNDER_INVESTIGATION": return "bg-yellow-100 text-yellow-800"
      case "REPORT_SUBMITTED": return "bg-blue-100 text-blue-800"
      case "CLOSED": return "bg-green-100 text-green-800"
      case "ARCHIVED": return "bg-gray-100 text-gray-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "LOW": return "bg-green-100 text-green-800"
      case "MEDIUM": return "bg-yellow-100 text-yellow-800"
      case "HIGH": return "bg-orange-100 text-orange-800"
      case "URGENT": return "bg-red-100 text-red-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "UNDER_INVESTIGATION": return <Clock className="h-4 w-4" />
      case "REPORT_SUBMITTED": return <AlertTriangle className="h-4 w-4" />
      case "CLOSED": return <CheckCircle className="h-4 w-4" />
      case "ARCHIVED": return <Archive className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">AI Investigation Assistant</h1>
                <p className="text-sm text-gray-500">Nikhompattana Police Station</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Users className="h-4 w-4 mr-2" />
                {user?.name || "ผู้ใช้งาน"}
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="h-4 w-4 mr-2" />
                ออกจากระบบ
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">ยินดีต้อนรับสู่ระบบช่วยเหลือการสอบสวนอัจฉริยะ</h2>
          <p className="text-gray-600">ระบบช่วยเหลือการสอบสวนที่ใช้ AI เพื่อเพิ่มประสิทธิภาพการทำงานของเจ้าหน้าที่ตำรวจ</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                    <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-sm text-green-600">{stat.change} this week</p>
                  </div>
                  <stat.icon className={cn("h-8 w-8", stat.color)} />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeModule} onValueChange={setActiveModule} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="dashboard">ภาพรวม</TabsTrigger>
            <TabsTrigger value="modules">โมดูล</TabsTrigger>
            <TabsTrigger value="cases">คดีล่าสุด</TabsTrigger>
            <TabsTrigger value="analytics">วิเคราะห์</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Cases */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2" />
                    คดีล่าสุด
                  </CardTitle>
                  <CardDescription>คดีที่กำลังดำเนินการ</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentCases.map((case_item, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <span className="font-medium text-sm">{case_item.id}</span>
                            <Badge className={getStatusColor(case_item.status)}>
                              {getStatusIcon(case_item.status)}
                              <span className="ml-1">{case_item.status.replace('_', ' ')}</span>
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600">{case_item.title}</p>
                          <p className="text-xs text-gray-500">ผู้รับผิดชอบ: {case_item.assignedTo}</p>
                        </div>
                        <div className="text-right">
                          <Badge className={getPriorityColor(case_item.priority)}>
                            {case_item.priority}
                          </Badge>
                          <p className="text-xs text-gray-500 mt-1">{case_item.dueDate}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>การกระทำด่วน</CardTitle>
                  <CardDescription>เข้าถึงฟีเจอร์หลักได้อย่างรวดเร็ว</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/data-analysis'}>
                    <FileSearch className="h-4 w-4 mr-2" />
                    วิเคราะห์หลักฐานใหม่
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/interrogation'}>
                    <Mic className="h-4 w-4 mr-2" />
                    เริ่มการบันทึกการสอบสวน
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/case-management'}>
                    <FolderOpen className="h-4 w-4 mr-2" />
                    สร้างคดีใหม่
                  </Button>
                  <Button className="w-full justify-start" variant="outline" onClick={() => window.location.href = '/case-management'}>
                    <BarChart3 className="h-4 w-4 mr-2" />
                    สร้างรายงาน
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="modules" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {modules.map((module) => (
                <Card key={module.id} className="hover:shadow-lg transition-all hover:scale-105">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className={cn("p-2 rounded-lg", module.color)}>
                        <module.icon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 mb-4">
                      {module.features.map((feature, index) => (
                        <div key={index} className="flex items-center text-sm text-gray-600">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mr-2" />
                          {feature}
                        </div>
                      ))}
                    </div>
                    <Button className="w-full" onClick={() => handleModuleClick(module.id)}>
                      เปิดโมดูล
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="cases" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>所有案件</CardTitle>
                <CardDescription>管理和跟踪所有调查案件</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">案件管理功能正在开发中...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>数据分析</CardTitle>
                <CardDescription>查看犯罪趋势和分析报告</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">分析功能正在开发中...</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function Home() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}