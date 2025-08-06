"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { 
  FolderOpen, 
  Plus, 
  Search, 
  Filter, 
  Calendar, 
  Clock, 
  AlertTriangle,
  CheckCircle,
  Archive,
  Users,
  BarChart3,
  FileText,
  Bell,
  Mail,
  Eye,
  Edit,
  MoreHorizontal,
  MapPin,
  Phone
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface Case {
  id: string
  caseNumber: string
  title: string
  description: string
  status: CaseStatus
  priority: Priority
  location: string
  assignedTo: string
  dueDate: Date
  createdAt: Date
  updatedAt: Date
  evidenceCount: number
  transcriptionCount: number
  reportCount: number
  latitude?: number
  longitude?: number
}

interface CaseStats {
  total: number
  underInvestigation: number
  reportSubmitted: number
  closed: number
  archived: number
  overdue: number
  dueSoon: number
  onTrack: number
}

enum CaseStatus {
  UNDER_INVESTIGATION = 'UNDER_INVESTIGATION',
  REPORT_SUBMITTED = 'REPORT_SUBMITTED',
  CLOSED = 'CLOSED',
  ARCHIVED = 'ARCHIVED'
}

enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  URGENT = 'URGENT'
}

function CaseManagementPageContent() {
  const [cases, setCases] = useState<Case[]>([
    {
      id: '1',
      caseNumber: 'CASE-2024-001',
      title: 'การลักทรัพย์ในร้านค้า',
      description: 'การลักทรัพย์ที่ร้านค้าในเขตพื้นที่',
      status: CaseStatus.UNDER_INVESTIGATION,
      priority: Priority.HIGH,
      location: 'กรุงเทพมหานคร',
      assignedTo: 'สมชาย ใจดี',
      dueDate: new Date('2024-01-15'),
      createdAt: new Date('2024-01-01'),
      updatedAt: new Date('2024-01-10'),
      evidenceCount: 5,
      transcriptionCount: 2,
      reportCount: 1
    },
    {
      id: '2',
      caseNumber: 'CASE-2024-002',
      title: 'การทำร้ายร่างกาย',
      description: 'เหตุทำร้ายร่างกายในสถานบันเทิง',
      status: CaseStatus.REPORT_SUBMITTED,
      priority: Priority.MEDIUM,
      location: 'สมุทรปราการ',
      assignedTo: 'สมศรี รักดี',
      dueDate: new Date('2024-01-10'),
      createdAt: new Date('2024-01-02'),
      updatedAt: new Date('2024-01-08'),
      evidenceCount: 3,
      transcriptionCount: 1,
      reportCount: 1
    },
    {
      id: '3',
      caseNumber: 'CASE-2024-003',
      title: 'การฉ้อโกง',
      description: 'การฉ้อโกงทางออนไลน์',
      status: CaseStatus.UNDER_INVESTIGATION,
      priority: Priority.URGENT,
      location: 'นนทบุรี',
      assignedTo: 'วิชัย มานะ',
      dueDate: new Date('2024-01-08'),
      createdAt: new Date('2024-01-03'),
      updatedAt: new Date('2024-01-07'),
      evidenceCount: 8,
      transcriptionCount: 3,
      reportCount: 0
    },
    {
      id: '4',
      caseNumber: 'CASE-2024-004',
      title: 'การบุกรุกเคหะสถาน',
      description: 'การบุกรุกเคหะสถานในช่วงกลางคืน',
      status: CaseStatus.CLOSED,
      priority: Priority.HIGH,
      location: 'ปทุมธานี',
      assignedTo: 'มานี มีใจ',
      dueDate: new Date('2024-01-05'),
      createdAt: new Date('2023-12-20'),
      updatedAt: new Date('2024-01-05'),
      evidenceCount: 6,
      transcriptionCount: 2,
      reportCount: 2
    }
  ])

  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedPriority, setSelectedPriority] = useState<string>("all")
  const [selectedOfficer, setSelectedOfficer] = useState<string>("all")
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  const getStatusColor = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.UNDER_INVESTIGATION: return 'bg-yellow-100 text-yellow-800'
      case CaseStatus.REPORT_SUBMITTED: return 'bg-blue-100 text-blue-800'
      case CaseStatus.CLOSED: return 'bg-green-100 text-green-800'
      case CaseStatus.ARCHIVED: return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: CaseStatus) => {
    switch (status) {
      case CaseStatus.UNDER_INVESTIGATION: return <Clock className="h-4 w-4" />
      case CaseStatus.REPORT_SUBMITTED: return <AlertTriangle className="h-4 w-4" />
      case CaseStatus.CLOSED: return <CheckCircle className="h-4 w-4" />
      case CaseStatus.ARCHIVED: return <Archive className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const getPriorityColor = (priority: Priority) => {
    switch (priority) {
      case Priority.LOW: return 'bg-green-100 text-green-800'
      case Priority.MEDIUM: return 'bg-yellow-100 text-yellow-800'
      case Priority.HIGH: return 'bg-orange-100 text-orange-800'
      case Priority.URGENT: return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getDeadlineStatus = (dueDate: Date) => {
    const now = new Date()
    const diffTime = dueDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) return { status: 'overdue', color: 'text-red-600', label: 'เกินกำหนด' }
    if (diffDays <= 3) return { status: 'dueSoon', color: 'text-yellow-600', label: 'ใกล้ถึงกำหนด' }
    return { status: 'onTrack', color: 'text-green-600', label: 'ตามแผน' }
  }

  const caseStats: CaseStats = {
    total: cases.length,
    underInvestigation: cases.filter(c => c.status === CaseStatus.UNDER_INVESTIGATION).length,
    reportSubmitted: cases.filter(c => c.status === CaseStatus.REPORT_SUBMITTED).length,
    closed: cases.filter(c => c.status === CaseStatus.CLOSED).length,
    archived: cases.filter(c => c.status === CaseStatus.ARCHIVED).length,
    overdue: cases.filter(c => getDeadlineStatus(c.dueDate).status === 'overdue').length,
    dueSoon: cases.filter(c => getDeadlineStatus(c.dueDate).status === 'dueSoon').length,
    onTrack: cases.filter(c => getDeadlineStatus(c.dueDate).status === 'onTrack').length
  }

  const filteredCases = cases.filter(case_item => {
    const matchesSearch = case_item.caseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         case_item.description.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = selectedStatus === "all" || case_item.status === selectedStatus
    const matchesPriority = selectedPriority === "all" || case_item.priority === selectedPriority
    const matchesOfficer = selectedOfficer === "all" || case_item.assignedTo === selectedOfficer
    
    return matchesSearch && matchesStatus && matchesPriority && matchesOfficer
  })

  const officers = Array.from(new Set(cases.map(c => c.assignedTo)))

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
                <h1 className="text-xl font-bold text-gray-900">Case Management & Reporting</h1>
                <p className="text-sm text-gray-500">ระบบจัดการคดีและรายงานอัจฉริยะ</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm">
                <Bell className="h-4 w-4 mr-2" />
                แจ้งเตือน
              </Button>
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    สร้างคดีใหม่
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>สร้างคดีใหม่</DialogTitle>
                    <DialogDescription>กรอกข้อมูลเพื่อสร้างคดีใหม่ในระบบ</DialogDescription>
                  </DialogHeader>
                  <CreateCaseForm onClose={() => setIsCreateDialogOpen(false)} />
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">คดีทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900">{caseStats.total}</p>
                </div>
                <FolderOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">กำลังสอบสวน</p>
                  <p className="text-2xl font-bold text-gray-900">{caseStats.underInvestigation}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">เกินกำหนด</p>
                  <p className="text-2xl font-bold text-red-600">{caseStats.overdue}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">ปิดคดีแล้ว</p>
                  <p className="text-2xl font-bold text-gray-900">{caseStats.closed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Panel - Filters */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Filter className="h-5 w-5 mr-2" />
                  ตัวกรอง
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>ค้นหา</Label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="ค้นหาคดี..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>สถานะ</Label>
                  <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value={CaseStatus.UNDER_INVESTIGATION}>กำลังสอบสวน</SelectItem>
                      <SelectItem value={CaseStatus.REPORT_SUBMITTED}>ส่งรายงานแล้ว</SelectItem>
                      <SelectItem value={CaseStatus.CLOSED}>ปิดคดี</SelectItem>
                      <SelectItem value={CaseStatus.ARCHIVED}>เก็บถาวร</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ความสำคัญ</Label>
                  <Select value={selectedPriority} onValueChange={setSelectedPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      <SelectItem value={Priority.LOW}>ต่ำ</SelectItem>
                      <SelectItem value={Priority.MEDIUM}>ปานกลาง</SelectItem>
                      <SelectItem value={Priority.HIGH}>สูง</SelectItem>
                      <SelectItem value={Priority.URGENT}>เร่งด่วน</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>ผู้รับผิดชอบ</Label>
                  <Select value={selectedOfficer} onValueChange={setSelectedOfficer}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">ทั้งหมด</SelectItem>
                      {officers.map(officer => (
                        <SelectItem key={officer} value={officer}>{officer}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <Button variant="outline" className="w-full" onClick={() => {
                  setSearchTerm("")
                  setSelectedStatus("all")
                  setSelectedPriority("all")
                  setSelectedOfficer("all")
                }}>
                  ล้างตัวกรอง
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Cases List */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FolderOpen className="h-5 w-5 mr-2" />
                    รายการคดี ({filteredCases.length})
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <BarChart3 className="h-4 w-4 mr-2" />
                      สถิติ
                    </Button>
                    <Button variant="outline" size="sm">
                      <FileText className="h-4 w-4 mr-2" />
                      ส่งออก
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {filteredCases.length === 0 ? (
                    <div className="text-center py-8">
                      <FolderOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">ไม่พบคดีที่ตรงกับเงื่อนไข</p>
                      <p className="text-sm text-gray-400">ลองปรับตัวกรองหรือสร้างคดีใหม่</p>
                    </div>
                  ) : (
                    filteredCases.map((case_item) => {
                      const deadlineStatus = getDeadlineStatus(case_item.dueDate)
                      return (
                        <div key={case_item.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="font-medium text-gray-900">{case_item.caseNumber}</span>
                                <Badge className={getStatusColor(case_item.status)} variant="secondary">
                                  {getStatusIcon(case_item.status)}
                                  <span className="ml-1">
                                    {case_item.status === 'UNDER_INVESTIGATION' ? 'กำลังสอบสวน' :
                                     case_item.status === 'REPORT_SUBMITTED' ? 'ส่งรายงานแล้ว' :
                                     case_item.status === 'CLOSED' ? 'ปิดคดี' :
                                     case_item.status === 'ARCHIVED' ? 'เก็บถาวร' : case_item.status}
                                  </span>
                                </Badge>
                                <Badge className={getPriorityColor(case_item.priority)} variant="secondary">
                                  {case_item.priority === 'LOW' ? 'ต่ำ' :
                                   case_item.priority === 'MEDIUM' ? 'ปานกลาง' :
                                   case_item.priority === 'HIGH' ? 'สูง' :
                                   case_item.priority === 'URGENT' ? 'เร่งด่วน' : case_item.priority}
                                </Badge>
                              </div>
                              <h3 className="text-lg font-semibold text-gray-900 mb-1">{case_item.title}</h3>
                              <p className="text-sm text-gray-600 mb-2">{case_item.description}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500">
                                <span className="flex items-center">
                                  <MapPin className="h-3 w-3 mr-1" />
                                  {case_item.location}
                                </span>
                                <span className="flex items-center">
                                  <Users className="h-3 w-3 mr-1" />
                                  {case_item.assignedTo}
                                </span>
                                <span className="flex items-center">
                                  <Calendar className="h-3 w-3 mr-1" />
                                  {case_item.dueDate.toLocaleDateString('th-TH')}
                                </span>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between pt-3 border-t">
                            <div className="flex items-center space-x-4 text-xs">
                              <span className="flex items-center text-gray-500">
                                <FileText className="h-3 w-3 mr-1" />
                                หลักฐาน: {case_item.evidenceCount}
                              </span>
                              <span className="flex items-center text-gray-500">
                                <Phone className="h-3 w-3 mr-1" />
                                บันทึกเสียง: {case_item.transcriptionCount}
                              </span>
                              <span className="flex items-center text-gray-500">
                                <FileText className="h-3 w-3 mr-1" />
                                รายงาน: {case_item.reportCount}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <span className={`text-xs font-medium ${deadlineStatus.color}`}>
                                {deadlineStatus.label}
                              </span>
                              <Clock className="h-3 w-3 text-gray-400" />
                            </div>
                          </div>
                        </div>
                      )
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

function CreateCaseForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM',
    location: '',
    assignedTo: '',
    dueDate: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle form submission
    console.log('Creating case:', formData)
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">ชื่อคดี *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="priority">ความสำคัญ *</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="LOW">ต่ำ</SelectItem>
              <SelectItem value="MEDIUM">ปานกลาง</SelectItem>
              <SelectItem value="HIGH">สูง</SelectItem>
              <SelectItem value="URGENT">เร่งด่วน</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">คำอธิบาย</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="location">สถานที่ *</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="dueDate">วันครบกำหนด *</Label>
          <Input
            id="dueDate"
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
            required
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedTo">ผู้รับผิดชอบ *</Label>
        <Select value={formData.assignedTo} onValueChange={(value) => setFormData(prev => ({ ...prev, assignedTo: value }))}>
          <SelectTrigger>
            <SelectValue placeholder="เลือกผู้รับผิดชอบ" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="สมชาย ใจดี">สมชาย ใจดี</SelectItem>
            <SelectItem value="สมศรี รักดี">สมศรี รักดี</SelectItem>
            <SelectItem value="วิชัย มานะ">วิชัย มานะ</SelectItem>
            <SelectItem value="มานี มีใจ">มานี มีใจ</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end space-x-2 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>
          ยกเลิก
        </Button>
        <Button type="submit">
          สร้างคดี
        </Button>
      </div>
    </form>
  )
}

export default function CaseManagementPage() {
  return (
    <ProtectedRoute>
      <CaseManagementPageContent />
    </ProtectedRoute>
  )
}