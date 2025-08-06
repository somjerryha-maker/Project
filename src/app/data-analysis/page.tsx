"use client"

import { useState, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { 
  Upload, 
  FileImage, 
  FileVideo, 
  FileSpreadsheet, 
  FileText, 
  Eye, 
  Network, 
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Search,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface EvidenceFile {
  id: string
  name: string
  type: 'image' | 'video' | 'csv' | 'xlsx' | 'pdf' | 'text'
  size: number
  status: 'uploading' | 'analyzing' | 'completed' | 'error'
  progress: number
  analysisResult?: any
  uploadedAt: Date
}

interface AnalysisResult {
  objects?: Array<{
    name: string
    confidence: number
    boundingBox?: {
      x: number
      y: number
      width: number
      height: number
    }
  }>
  timeline?: Array<{
    timestamp: string
    event: string
    value: number
  }>
  connections?: Array<{
    from: string
    to: string
    strength: number
    type: string
  }>
  entities?: Array<{
    name: string
    type: string
    confidence: number
    context: string
  }>
  sentiment?: {
    overall: string
    score: number
  }
}

function DataAnalysisPageContent() {
  const [files, setFiles] = useState<EvidenceFile[]>([])
  const [selectedFile, setSelectedFile] = useState<EvidenceFile | null>(null)
  const [caseId, setCaseId] = useState("")
  const [description, setDescription] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return <FileImage className="h-8 w-8 text-blue-500" />
      case 'video': return <FileVideo className="h-8 w-8 text-green-500" />
      case 'csv':
      case 'xlsx': return <FileSpreadsheet className="h-8 w-8 text-orange-500" />
      case 'pdf': return <FileText className="h-8 w-8 text-red-500" />
      case 'text': return <FileText className="h-8 w-8 text-gray-500" />
      default: return <FileText className="h-8 w-8 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'bg-blue-100 text-blue-800'
      case 'analyzing': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <Upload className="h-4 w-4" />
      case 'analyzing': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])
    
    uploadedFiles.forEach(file => {
      const fileType = file.type.split('/')[0]
      let mappedType: EvidenceFile['type'] = 'text'
      
      if (fileType === 'image') mappedType = 'image'
      else if (fileType === 'video') mappedType = 'video'
      else if (file.name.endsWith('.csv')) mappedType = 'csv'
      else if (file.name.endsWith('.xlsx')) mappedType = 'xlsx'
      else if (file.name.endsWith('.pdf')) mappedType = 'pdf'
      
      const newFile: EvidenceFile = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: mappedType,
        size: file.size,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date()
      }
      
      setFiles(prev => [...prev, newFile])
      
      // Simulate upload progress
      simulateUploadProgress(newFile.id)
    })
  }

  const simulateUploadProgress = (fileId: string) => {
    const interval = setInterval(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = Math.min(file.progress + Math.random() * 20, 100)
          let newStatus = file.status
          
          if (newProgress >= 100 && file.status === 'uploading') {
            newStatus = 'analyzing'
            // Start analysis after upload
            setTimeout(() => simulateAnalysis(fileId), 1000)
          }
          
          return { ...file, progress: newProgress, status: newStatus }
        }
        return file
      }))
      
      const file = files.find(f => f.id === fileId)
      if (file && file.progress >= 100) {
        clearInterval(interval)
      }
    }, 200)
  }

  const simulateAnalysis = (fileId: string) => {
    setTimeout(() => {
      setFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          // Generate mock analysis results based on file type
          let analysisResult: AnalysisResult = {}
          
          switch (file.type) {
            case 'image':
            case 'video':
              analysisResult = {
                objects: [
                  { name: 'person', confidence: 0.95, boundingBox: { x: 100, y: 50, width: 80, height: 120 } },
                  { name: 'vehicle', confidence: 0.87, boundingBox: { x: 200, y: 100, width: 120, height: 80 } },
                  { name: 'license_plate', confidence: 0.92, boundingBox: { x: 220, y: 140, width: 40, height: 20 } }
                ]
              }
              break
            case 'csv':
            case 'xlsx':
              analysisResult = {
                timeline: [
                  { timestamp: '2024-01-01 10:00', event: 'call_started', value: 1 },
                  { timestamp: '2024-01-01 10:05', event: 'call_ended', value: 0 }
                ],
                connections: [
                  { from: '081-234-5678', to: '082-345-6789', strength: 0.8, type: 'frequent_calls' }
                ]
              }
              break
            case 'text':
            case 'pdf':
              analysisResult = {
                entities: [
                  { name: 'สมชาย ใจดี', type: 'PERSON', confidence: 0.95, context: 'ผู้ต้องสงสัย' },
                  { name: 'กรุงเทพมหานคร', type: 'LOCATION', confidence: 0.98, context: 'สถานที่เกิดเหตุ' }
                ],
                sentiment: { overall: 'neutral', score: 0.1 }
              }
              break
          }
          
          return { 
            ...file, 
            status: 'completed', 
            analysisResult 
          }
        }
        return file
      }))
    }, 3000)
  }

  const removeFile = (fileId: string) => {
    setFiles(prev => prev.filter(file => file.id !== fileId))
    if (selectedFile?.id === fileId) {
      setSelectedFile(null)
    }
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
                <h1 className="text-xl font-bold text-gray-900">Data Analysis & Processing</h1>
                <p className="text-sm text-gray-500">วิเคราะห์หลักฐานและสกัดข้อมูลเชิงลึก</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload and File List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  อัปโหลดหลักฐาน
                </CardTitle>
                <CardDescription>
                  รองรับไฟล์ภาพ, วิดีโอ, CSV, XLSX, PDF, ข้อความ (สูงสุด 100MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">คลิกเพื่ออัปโหลดไฟล์</p>
                  <p className="text-sm text-gray-500">หรือลากและวางไฟล์ที่นี่</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*,.csv,.xlsx,.pdf,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="space-y-2">
                  <Label htmlFor="caseId">หมายเลขคดี</Label>
                  <Input
                    id="caseId"
                    placeholder="กรอกหมายเลขคดี"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">คำอธิบาย</Label>
                  <Textarea
                    id="description"
                    placeholder="กรอกคำอธิบายหลักฐาน"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* File List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    ไฟล์ที่อัปโหลด
                  </span>
                  <Badge variant="secondary">{files.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {files.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">ยังไม่มีไฟล์ที่อัปโหลด</p>
                  ) : (
                    files.map((file) => (
                      <div
                        key={file.id}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-colors",
                          selectedFile?.id === file.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setSelectedFile(file)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            {getFileIcon(file.type)}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {file.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(file.size)}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getStatusColor(file.status)} variant="secondary">
                                  {getStatusIcon(file.status)}
                                  <span className="ml-1 text-xs">
                                    {file.status === 'uploading' ? 'กำลังอัปโหลด' :
                                     file.status === 'analyzing' ? 'กำลังวิเคราะห์' :
                                     file.status === 'completed' ? 'วิเคราะห์เสร็จสิ้น' :
                                     file.status === 'error' ? 'ผิดพลาด' : file.status}
                                  </span>
                                </Badge>
                              </div>
                              {(file.status === 'uploading' || file.status === 'analyzing') && (
                                <Progress value={file.progress} className="mt-2 h-1" />
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile(file.id)
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Analysis Results */}
          <div className="lg:col-span-2">
            <Card className="h-full">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Eye className="h-5 w-5 mr-2" />
                    ผลการวิเคราะห์
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <Filter className="h-4 w-4 mr-2" />
                      กรอง
                    </Button>
                    <Button variant="outline" size="sm">
                      <Search className="h-4 w-4 mr-2" />
                      ค้นหา
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedFile ? (
                  <Tabs defaultValue="overview" className="h-full">
                    <TabsList className="grid w-full grid-cols-4">
                      <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
                      <TabsTrigger value="details">รายละเอียด</TabsTrigger>
                      <TabsTrigger value="visualization">การแสดงผล</TabsTrigger>
                      <TabsTrigger value="export">ส่งออก</TabsTrigger>
                    </TabsList>

                    <TabsContent value="overview" className="space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">ข้อมูลไฟล์</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>ชื่อไฟล์:</span>
                              <span className="font-medium">{selectedFile.name}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>ขนาด:</span>
                              <span className="font-medium">{formatFileSize(selectedFile.size)}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>ประเภท:</span>
                              <span className="font-medium">{selectedFile.type.toUpperCase()}</span>
                            </div>
                            <div className="flex justify-between text-sm">
                              <span>สถานะ:</span>
                              <Badge className={getStatusColor(selectedFile.status)} variant="secondary">
                                {getStatusIcon(selectedFile.status)}
                                <span className="ml-1 text-xs">
                                  {selectedFile.status === 'uploading' ? 'กำลังอัปโหลด' :
                                   selectedFile.status === 'analyzing' ? 'กำลังวิเคราะห์' :
                                   selectedFile.status === 'completed' ? 'วิเคราะห์เสร็จสิ้น' :
                                   selectedFile.status === 'error' ? 'ผิดพลาด' : selectedFile.status}
                                </span>
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-2">
                            <CardTitle className="text-sm">ผลการวิเคราะห์</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-2">
                            {selectedFile.analysisResult?.objects && (
                              <div className="flex justify-between text-sm">
                                <span>วัตถุที่ตรวจพบ:</span>
                                <span className="font-medium">{selectedFile.analysisResult.objects.length}</span>
                              </div>
                            )}
                            {selectedFile.analysisResult?.entities && (
                              <div className="flex justify-between text-sm">
                                <span>เอนทิตี้ที่สกัด:</span>
                                <span className="font-medium">{selectedFile.analysisResult.entities.length}</span>
                              </div>
                            )}
                            {selectedFile.analysisResult?.connections && (
                              <div className="flex justify-between text-sm">
                                <span>การเชื่อมต่อ:</span>
                                <span className="font-medium">{selectedFile.analysisResult.connections.length}</span>
                              </div>
                            )}
                            {selectedFile.analysisResult?.sentiment && (
                              <div className="flex justify-between text-sm">
                                <span>sentiment:</span>
                                <span className="font-medium">{selectedFile.analysisResult.sentiment.overall}</span>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </div>

                      {/* Analysis Results */}
                      {selectedFile.analysisResult && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="text-lg">ผลการวิเคราะห์โดยละเอียด</CardTitle>
                          </CardHeader>
                          <CardContent>
                            {selectedFile.analysisResult.objects && (
                              <div className="space-y-3">
                                <h4 className="font-medium">วัตถุที่ตรวจพบ:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {selectedFile.analysisResult.objects.map((obj, index) => (
                                    <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                                      <span className="text-sm font-medium">{obj.name}</span>
                                      <Badge variant="secondary">
                                        {(obj.confidence * 100).toFixed(1)}%
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {selectedFile.analysisResult.entities && (
                              <div className="space-y-3 mt-4">
                                <h4 className="font-medium">เอนทิตี้ที่สกัด:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  {selectedFile.analysisResult.entities.map((entity, index) => (
                                    <div key={index} className="p-2 bg-gray-50 rounded">
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm font-medium">{entity.name}</span>
                                        <Badge variant="outline">{entity.type}</Badge>
                                      </div>
                                      <p className="text-xs text-gray-600">{entity.context}</p>
                                      <div className="flex items-center justify-between mt-1">
                                        <span className="text-xs text-gray-500">confidence:</span>
                                        <span className="text-xs font-medium">{(entity.confidence * 100).toFixed(1)}%</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      )}
                    </TabsContent>

                    <TabsContent value="details">
                      <Card>
                        <CardHeader>
                          <CardTitle>รายละเอียดการวิเคราะห์</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-500">รายละเอียดการวิเคราะห์ข้อมูลจะแสดงที่นี่...</p>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="visualization">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center">
                            <BarChart3 className="h-5 w-5 mr-2" />
                            การแสดงผลข้อมูล
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                            <div className="text-center">
                              <Network className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                              <p className="text-gray-500">การแสดงผลข้อมูลจะแสดงที่นี่...</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="export">
                      <Card>
                        <CardHeader>
                          <CardTitle>ส่งออกผลการวิเคราะห์</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Button variant="outline" className="h-20 flex-col">
                              <FileText className="h-6 w-6 mb-2" />
                              ส่งออกเป็น PDF
                            </Button>
                            <Button variant="outline" className="h-20 flex-col">
                              <FileSpreadsheet className="h-6 w-6 mb-2" />
                              ส่งออกเป็น Excel
                            </Button>
                            <Button variant="outline" className="h-20 flex-col">
                              <FileText className="h-6 w-6 mb-2" />
                              ส่งออกเป็น JSON
                            </Button>
                            <Button variant="outline" className="h-20 flex-col">
                              <Network className="h-6 w-6 mb-2" />
                              ส่งออกข้อมูลกราฟ
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </TabsContent>
                  </Tabs>
                ) : (
                  <div className="h-96 flex items-center justify-center">
                    <div className="text-center">
                      <Eye className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">เลือกไฟล์เพื่อดูผลการวิเคราะห์</p>
                      <p className="text-sm text-gray-400">ไฟล์ที่อัปโหลดและวิเคราะห์เสร็จสิ้นจะแสดงผลที่นี่</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function DataAnalysisPage() {
  return (
    <ProtectedRoute>
      <DataAnalysisPageContent />
    </ProtectedRoute>
  )
}