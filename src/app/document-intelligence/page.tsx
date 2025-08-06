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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Upload, 
  FileText, 
  Search, 
  Filter, 
  Network, 
  Users, 
  MapPin, 
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Eye,
  Download,
  RefreshCw,
  Zap
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface Document {
  id: string
  name: string
  type: 'pdf' | 'docx' | 'text'
  size: number
  status: 'uploading' | 'processing' | 'completed' | 'error'
  progress: number
  uploadedAt: Date
  entities?: Entity[]
}

interface Entity {
  id: string
  name: string
  type: EntityType
  confidence: number
  context: string
  documentId: string
  caseId?: string
  linkedEntities: string[]
}

interface KnowledgeGraphNode {
  id: string
  label: string
  type: EntityType
  confidence: number
  x?: number
  y?: number
}

interface KnowledgeGraphEdge {
  from: string
  to: string
  label: string
  weight: number
}

enum EntityType {
  PERSON = 'PERSON',
  ORGANIZATION = 'ORGANIZATION',
  LOCATION = 'LOCATION',
  DATE = 'DATE',
  TIME = 'TIME',
  PHONE_NUMBER = 'PHONE_NUMBER',
  VEHICLE = 'VEHICLE',
  LICENSE_PLATE = 'LICENSE_PLATE',
  CASE_NUMBER = 'CASE_NUMBER'
}

function DocumentIntelligencePageContent() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null)
  const [entities, setEntities] = useState<Entity[]>([])
  const [filteredEntities, setFilteredEntities] = useState<Entity[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedEntityType, setSelectedEntityType] = useState<string>("all")
  const [selectedCase, setSelectedCase] = useState<string>("all")
  const [knowledgeGraphNodes, setKnowledgeGraphNodes] = useState<KnowledgeGraphNode[]>([])
  const [knowledgeGraphEdges, setKnowledgeGraphEdges] = useState<KnowledgeGraphEdge[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getEntityIcon = (type: EntityType) => {
    switch (type) {
      case EntityType.PERSON: return <Users className="h-4 w-4" />
      case EntityType.ORGANIZATION: return <Users className="h-4 w-4" />
      case EntityType.LOCATION: return <MapPin className="h-4 w-4" />
      case EntityType.DATE: return <Calendar className="h-4 w-4" />
      case EntityType.TIME: return <Clock className="h-4 w-4" />
      case EntityType.PHONE_NUMBER: return <Zap className="h-4 w-4" />
      case EntityType.VEHICLE: return <Zap className="h-4 w-4" />
      case EntityType.LICENSE_PLATE: return <Zap className="h-4 w-4" />
      case EntityType.CASE_NUMBER: return <FileText className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getEntityColor = (type: EntityType) => {
    switch (type) {
      case EntityType.PERSON: return 'bg-blue-100 text-blue-800'
      case EntityType.ORGANIZATION: return 'bg-purple-100 text-purple-800'
      case EntityType.LOCATION: return 'bg-green-100 text-green-800'
      case EntityType.DATE: return 'bg-orange-100 text-orange-800'
      case EntityType.TIME: return 'bg-yellow-100 text-yellow-800'
      case EntityType.PHONE_NUMBER: return 'bg-red-100 text-red-800'
      case EntityType.VEHICLE: return 'bg-indigo-100 text-indigo-800'
      case EntityType.LICENSE_PLATE: return 'bg-pink-100 text-pink-800'
      case EntityType.CASE_NUMBER: return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'uploading': return 'bg-blue-100 text-blue-800'
      case 'processing': return 'bg-yellow-100 text-yellow-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'error': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'uploading': return <Upload className="h-4 w-4" />
      case 'processing': return <Clock className="h-4 w-4" />
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'error': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const uploadedFiles = Array.from(event.target.files || [])
    
    uploadedFiles.forEach(file => {
      let fileType: Document['type'] = 'text'
      
      if (file.name.endsWith('.pdf')) fileType = 'pdf'
      else if (file.name.endsWith('.docx')) fileType = 'docx'
      else if (file.name.endsWith('.txt')) fileType = 'text'
      
      const newDocument: Document = {
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        type: fileType,
        size: file.size,
        status: 'uploading',
        progress: 0,
        uploadedAt: new Date()
      }
      
      setDocuments(prev => [...prev, newDocument])
      
      // Simulate upload progress
      simulateUploadProgress(newDocument.id)
    })
  }

  const simulateUploadProgress = (documentId: string) => {
    const interval = setInterval(() => {
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          const newProgress = Math.min(doc.progress + Math.random() * 25, 100)
          let newStatus = doc.status
          
          if (newProgress >= 100 && doc.status === 'uploading') {
            newStatus = 'processing'
            // Start processing after upload
            setTimeout(() => simulateProcessing(documentId), 1000)
          }
          
          return { ...doc, progress: newProgress, status: newStatus }
        }
        return doc
      }))
      
      const doc = documents.find(d => d.id === documentId)
      if (doc && doc.progress >= 100) {
        clearInterval(interval)
      }
    }, 200)
  }

  const simulateProcessing = (documentId: string) => {
    setTimeout(() => {
      setDocuments(prev => prev.map(doc => {
        if (doc.id === documentId) {
          // Generate mock entities
          const mockEntities: Entity[] = [
            {
              id: Math.random().toString(36).substr(2, 9),
              name: 'สมชาย ใจดี',
              type: EntityType.PERSON,
              confidence: 0.95,
              context: 'ผู้ต้องสงสัยในคดี',
              documentId: documentId,
              linkedEntities: []
            },
            {
              id: Math.random().toString(36).substr(2, 9),
              name: 'บริษัท ไทย จำกัด',
              type: EntityType.ORGANIZATION,
              confidence: 0.88,
              context: 'สถานที่เกิดเหตุ',
              documentId: documentId,
              linkedEntities: []
            },
            {
              id: Math.random().toString(36).substr(2, 9),
              name: 'กรุงเทพมหานคร',
              type: EntityType.LOCATION,
              confidence: 0.98,
              context: 'สถานที่เกิดเหตุ',
              documentId: documentId,
              linkedEntities: []
            },
            {
              id: Math.random().toString(36).substr(2, 9),
              name: '15 มกราคม 2024',
              type: EntityType.DATE,
              confidence: 0.92,
              context: 'วันที่เกิดเหตุ',
              documentId: documentId,
              linkedEntities: []
            },
            {
              id: Math.random().toString(36).substr(2, 9),
              name: '14:30',
              type: EntityType.TIME,
              confidence: 0.89,
              context: 'เวลาเกิดเหตุ',
              documentId: documentId,
              linkedEntities: []
            },
            {
              id: Math.random().toString(36).substr(2, 9),
              name: '081-234-5678',
              type: EntityType.PHONE_NUMBER,
              confidence: 0.91,
              context: 'เบอร์โทรศัพท์ผู้ต้องสงสัย',
              documentId: documentId,
              linkedEntities: []
            },
            {
              id: Math.random().toString(36).substr(2, 9),
              name: 'CASE-2024-001',
              type: EntityType.CASE_NUMBER,
              confidence: 0.99,
              context: 'หมายเลขคดี',
              documentId: documentId,
              linkedEntities: []
            }
          ]
          
          // Add some random links between entities
          mockEntities[0].linkedEntities = [mockEntities[2].id, mockEntities[5].id] // Person linked to Location and Phone
          mockEntities[2].linkedEntities = [mockEntities[0].id] // Location linked to Person
          mockEntities[5].linkedEntities = [mockEntities[0].id] // Phone linked to Person
          
          setEntities(prev => [...prev, ...mockEntities])
          
          return { 
            ...doc, 
            status: 'completed', 
            entities: mockEntities 
          }
        }
        return doc
      }))
      
      // Update knowledge graph
      updateKnowledgeGraph()
    }, 4000)
  }

  const updateKnowledgeGraph = () => {
    const nodes: KnowledgeGraphNode[] = entities.map(entity => ({
      id: entity.id,
      label: entity.name,
      type: entity.type,
      confidence: entity.confidence,
      x: Math.random() * 400,
      y: Math.random() * 300
    }))
    
    const edges: KnowledgeGraphEdge[] = []
    entities.forEach(entity => {
      entity.linkedEntities.forEach(linkedId => {
        if (entities.find(e => e.id === linkedId)) {
          edges.push({
            from: entity.id,
            to: linkedId,
            label: 'related',
            weight: 0.8
          })
        }
      })
    })
    
    setKnowledgeGraphNodes(nodes)
    setKnowledgeGraphEdges(edges)
  }

  const removeDocument = (documentId: string) => {
    setDocuments(prev => prev.filter(doc => doc.id !== documentId))
    setEntities(prev => prev.filter(entity => entity.documentId !== documentId))
    if (selectedDocument?.id === documentId) {
      setSelectedDocument(null)
    }
    updateKnowledgeGraph()
  }

  const filterEntities = () => {
    let filtered = entities
    
    if (searchTerm) {
      filtered = filtered.filter(entity => 
        entity.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        entity.context.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    if (selectedEntityType !== "all") {
      filtered = filtered.filter(entity => entity.type === selectedEntityType)
    }
    
    setFilteredEntities(filtered)
  }

  // Filter entities whenever search term or entity type changes
  useState(() => {
    filterEntities()
  })

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
                <h1 className="text-xl font-bold text-gray-900">Document Intelligence & Knowledge Graph</h1>
                <p className="text-sm text-gray-500">การวิเคราะห์เอกสารและสร้างกราฟความรู้</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload and Document List */}
          <div className="lg:col-span-1 space-y-6">
            {/* Upload Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  อัปโหลดเอกสาร
                </CardTitle>
                <CardDescription>
                  รองรับไฟล์ PDF, DOCX, ข้อความ (สูงสุด 50MB)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div
                  className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-gray-400 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 mb-2">คลิกเพื่ออัปโหลดเอกสาร</p>
                  <p className="text-sm text-gray-500">หรือลากและวางไฟล์ที่นี่</p>
                </div>
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept=".pdf,.docx,.txt"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                <div className="space-y-2">
                  <Label htmlFor="caseSelect">เชื่อมโยงกับคดี</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="เลือกคดี" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="case-1">CASE-2024-001</SelectItem>
                      <SelectItem value="case-2">CASE-2024-002</SelectItem>
                      <SelectItem value="case-3">CASE-2024-003</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Document List */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    เอกสารที่อัปโหลด
                  </span>
                  <Badge variant="secondary">{documents.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {documents.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">ยังไม่มีเอกสารที่อัปโหลด</p>
                  ) : (
                    documents.map((doc) => (
                      <div
                        key={doc.id}
                        className={cn(
                          "p-3 border rounded-lg cursor-pointer transition-colors",
                          selectedDocument?.id === doc.id ? "border-blue-500 bg-blue-50" : "border-gray-200 hover:border-gray-300"
                        )}
                        onClick={() => setSelectedDocument(doc)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3 flex-1">
                            <FileText className="h-8 w-8 text-blue-500" />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {doc.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {formatFileSize(doc.size)}
                              </p>
                              <div className="flex items-center space-x-2 mt-1">
                                <Badge className={getStatusColor(doc.status)} variant="secondary">
                                  {getStatusIcon(doc.status)}
                                  <span className="ml-1 text-xs">
                                    {doc.status === 'uploading' ? 'กำลังอัปโหลด' :
                                     doc.status === 'processing' ? 'กำลังประมวลผล' :
                                     doc.status === 'completed' ? 'ประมวลผลเสร็จสิ้น' :
                                     doc.status === 'error' ? 'ผิดพลาด' : doc.status}
                                  </span>
                                </Badge>
                                {doc.entities && (
                                  <Badge variant="outline">
                                    {doc.entities.length} entities
                                  </Badge>
                                )}
                              </div>
                              {(doc.status === 'uploading' || doc.status === 'processing') && (
                                <Progress value={doc.progress} className="mt-2 h-1" />
                              )}
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeDocument(doc.id)
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

          {/* Right Panel - Knowledge Graph and Entities */}
          <div className="lg:col-span-2 space-y-6">
            {/* Knowledge Graph */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Network className="h-5 w-5 mr-2" />
                    Knowledge Graph
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      รีเฟรช
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-4 w-4 mr-2" />
                      ส่งออก
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-96 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                  <div className="text-center">
                    <Network className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 mb-2">Knowledge Graph Visualization</p>
                    <p className="text-sm text-gray-400">
                      {knowledgeGraphNodes.length > 0 
                        ? `แสดง ${knowledgeGraphNodes.length} nodes และ ${knowledgeGraphEdges.length} edges`
                        : 'อัปโหลดเอกสารเพื่อสร้างกราฟความรู้'
                      }
                    </p>
                    {knowledgeGraphNodes.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2 max-w-md mx-auto">
                        {Object.values(EntityType).map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Entities */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    เอนทิตี้ที่สกัด ({entities.length})
                  </span>
                  <div className="flex items-center space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="ค้นหาเอนทิตี้..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10 w-64"
                      />
                    </div>
                    <Select value={selectedEntityType} onValueChange={setSelectedEntityType}>
                      <SelectTrigger className="w-40">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">ทั้งหมด</SelectItem>
                        {Object.values(EntityType).map(type => (
                          <SelectItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {entities.length === 0 ? (
                    <div className="text-center py-8">
                      <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-500 mb-2">ยังไม่มีเอนทิตี้ที่สกัด</p>
                      <p className="text-sm text-gray-400">อัปโหลดเอกสารเพื่อเริ่มสกัดเอนทิตี้</p>
                    </div>
                  ) : (
                    entities.map((entity) => (
                      <div key={entity.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            {getEntityIcon(entity.type)}
                            <span className="font-medium text-gray-900">{entity.name}</span>
                            <Badge className={getEntityColor(entity.type)} variant="secondary">
                              {entity.type.replace('_', ' ')}
                            </Badge>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {(entity.confidence * 100).toFixed(1)}%
                            </Badge>
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{entity.context}</p>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>จากเอกสาร: {documents.find(d => d.id === entity.documentId)?.name || 'Unknown'}</span>
                          {entity.linkedEntities.length > 0 && (
                            <span>เชื่อมโยงกับ {entity.linkedEntities.length} เอนทิตี้</span>
                          )}
                        </div>
                      </div>
                    ))
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

export default function DocumentIntelligencePage() {
  return (
    <ProtectedRoute>
      <DocumentIntelligencePageContent />
    </ProtectedRoute>
  )
}