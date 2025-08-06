"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { 
  Mic, 
  MicOff, 
  Play, 
  Pause, 
  Square, 
  Download, 
  FileText, 
  FileSpreadsheet,
  Clock,
  Users,
  Volume2,
  Settings,
  Save,
  Send,
  RefreshCw,
  AlertCircle,
  CheckCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { ProtectedRoute } from "@/components/auth/ProtectedRoute"

interface TranscriptionSegment {
  id: string
  speaker: string
  text: string
  timestamp: string
  confidence: number
}

interface TranscriptionSession {
  id: string
  title: string
  caseId?: string
  startTime: Date
  endTime?: Date
  duration?: number
  status: 'idle' | 'recording' | 'processing' | 'completed'
  segments: TranscriptionSegment[]
  formattedTranscript?: string
}

function InterrogationPageContent() {
  const [sessions, setSessions] = useState<TranscriptionSession[]>([])
  const [currentSession, setCurrentSession] = useState<TranscriptionSession | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [audioUrl, setAudioUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [sheetId, setSheetId] = useState("")
  const [caseId, setCaseId] = useState("")
  const [interrogatorName, setInterrogatorName] = useState("")
  const [suspectName, setSuspectName] = useState("")
  const [location, setLocation] = useState("")
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const chunksRef = useRef<Blob[]>([])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true
        } 
      })
      
      mediaRecorderRef.current = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      
      chunksRef.current = []
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data)
        }
      }
      
      mediaRecorderRef.current.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        const url = URL.createObjectURL(blob)
        setAudioUrl(url)
        
        // Create audio element for playback
        const audio = new Audio(url)
        audioRef.current = audio
        
        audio.addEventListener('loadedmetadata', () => {
          setDuration(audio.duration)
        })
        
        audio.addEventListener('timeupdate', () => {
          setCurrentTime(audio.currentTime)
        })
        
        audio.addEventListener('ended', () => {
          setIsPlaying(false)
          setCurrentTime(0)
        })
      }
      
      mediaRecorderRef.current.start()
      
      // Create new session
      const newSession: TranscriptionSession = {
        id: Math.random().toString(36).substr(2, 9),
        title: `การสอบสวน ${new Date().toLocaleDateString('th-TH')}`,
        caseId: caseId || undefined,
        startTime: new Date(),
        status: 'recording',
        segments: []
      }
      
      setCurrentSession(newSession)
      setIsRecording(true)
      
      // Simulate real-time transcription
      simulateRealTimeTranscription(newSession.id)
      
    } catch (error) {
      console.error('Error starting recording:', error)
      alert('ไม่สามารถเข้าถึงไมโครโฟนได้ กรุณาตรวจสอบการตั้งค่า')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop())
      setIsRecording(false)
      
      if (currentSession) {
        const updatedSession = {
          ...currentSession,
          endTime: new Date(),
          duration: (new Date().getTime() - currentSession.startTime.getTime()) / 1000,
          status: 'completed' as const
        }
        setCurrentSession(updatedSession)
        setSessions(prev => [updatedSession, ...prev])
      }
    }
  }

  const simulateRealTimeTranscription = (sessionId: string) => {
    const mockTranscripts = [
      { speaker: 'Investigator', text: 'สวัสดีครับ วันนี้ผมต้องการสอบถามเกี่ยวกับเหตุการณ์ที่เกิดขึ้น', confidence: 0.95 },
      { speaker: 'Suspect', text: 'สวัสดีครับ ผมพร้อมที่จะให้การแล้วครับ', confidence: 0.92 },
      { speaker: 'Investigator', text: 'กรุณาเล่าให้ฟังว่าเมื่อวานนี้ตอนบ่ายสองโมงคุณอยู่ที่ไหน', confidence: 0.89 },
      { speaker: 'Suspect', text: 'ตอนนั้นผมอยู่ที่บ้านครับ กำลังดูทีวีอยู่', confidence: 0.87 },
      { speaker: 'Investigator', text: 'มีใครเป็นพยานได้ยินว่าคุณอยู่ที่บ้านไหม', confidence: 0.91 },
      { speaker: 'Suspect', text: 'มีครับ ภรรยาผมอยู่บ้านด้วยกัน', confidence: 0.93 }
    ]
    
    let index = 0
    const interval = setInterval(() => {
      if (index < mockTranscripts.length && currentSession?.id === sessionId) {
        const transcript = mockTranscripts[index]
        const segment: TranscriptionSegment = {
          id: Math.random().toString(36).substr(2, 9),
          speaker: transcript.speaker,
          text: transcript.text,
          timestamp: formatTime(currentTime),
          confidence: transcript.confidence
        }
        
        setCurrentSession(prev => prev ? {
          ...prev,
          segments: [...prev.segments, segment]
        } : null)
        
        index++
      } else {
        clearInterval(interval)
      }
    }, 3000)
  }

  const togglePlayback = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
      } else {
        audioRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const formatTranscript = () => {
    if (!currentSession) return
    
    // Simulate AI formatting with Gemini API
    const formatted = currentSession.segments.map(segment => 
      `[${segment.timestamp}] ${segment.speaker}: ${segment.text}`
    ).join('\n\n')
    
    setCurrentSession(prev => prev ? {
      ...prev,
      formattedTranscript: formatted
    } : null)
  }

  const exportToGoogleSheets = () => {
    if (!currentSession || !sheetId) {
      alert('กรุณากรอก Google Sheets ID และมีข้อมูลการสอบสวน')
      return
    }
    
    // Simulate Google Sheets export
    alert(`กำลังส่งข้อมูลไปยัง Google Sheets: ${sheetId}`)
  }

  const exportTranscript = (format: 'pdf' | 'docx' | 'txt') => {
    if (!currentSession) {
      alert('ไม่มีข้อมูลการสอบสวนที่จะส่งออก')
      return
    }
    
    alert(`กำลังส่งออกไฟล์ ${format.toUpperCase()}`)
  }

  const seekAudio = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time
      setCurrentTime(time)
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
                <h1 className="text-xl font-bold text-gray-900">Interrogation Support</h1>
                <p className="text-sm text-gray-500">ระบบถอดความเสียงการสอบสวนแบบเรียลไทม์</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Controls and Settings */}
          <div className="lg:col-span-1 space-y-6">
            {/* Recording Controls */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Mic className="h-5 w-5 mr-2" />
                  การควบคุมการบันทึก
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <Button
                    size="lg"
                    className={cn(
                      "w-32 h-32 rounded-full text-lg font-semibold transition-all",
                      isRecording 
                        ? "bg-red-500 hover:bg-red-600 animate-pulse" 
                        : "bg-blue-500 hover:bg-blue-600"
                    )}
                    onClick={isRecording ? stopRecording : startRecording}
                  >
                    {isRecording ? (
                      <div className="flex items-center space-x-2">
                        <Square className="h-6 w-6" />
                        <span>หยุด</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <Mic className="h-6 w-6" />
                        <span>บันทึก</span>
                      </div>
                    )}
                  </Button>
                  <p className="text-sm text-gray-500 mt-2">
                    {isRecording ? 'กำลังบันทึกเสียง...' : 'คลิกเพื่อเริ่มบันทึก'}
                  </p>
                </div>

                {currentSession && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>ระยะเวลา:</span>
                      <span className="font-medium">
                        {currentSession.duration 
                          ? formatTime(currentSession.duration)
                          : formatTime((new Date().getTime() - currentSession.startTime.getTime()) / 1000)
                        }
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>สถานะ:</span>
                      <Badge className={
                        currentSession.status === 'recording' ? 'bg-red-100 text-red-800' :
                        currentSession.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-yellow-100 text-yellow-800'
                      }>
                        {currentSession.status === 'recording' ? 'กำลังบันทึก' :
                         currentSession.status === 'completed' ? 'บันทึกเสร็จสิ้น' :
                         currentSession.status}
                      </Badge>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Settings className="h-5 w-5 mr-2" />
                  การตั้งค่า
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="caseId">หมายเลขคดี</Label>
                  <Input
                    id="caseId"
                    placeholder="กรอกหมายเลขคดี"
                    value={caseId}
                    onChange={(e) => setCaseId(e.target.value)}
                    disabled={isRecording}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="interrogator">ผู้สอบสวน</Label>
                  <Input
                    id="interrogator"
                    placeholder="ชื่อผู้สอบสวน"
                    value={interrogatorName}
                    onChange={(e) => setInterrogatorName(e.target.value)}
                    disabled={isRecording}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="suspect">ผู้ต้องสงสัย</Label>
                  <Input
                    id="suspect"
                    placeholder="ชื่อผู้ต้องสงสัย"
                    value={suspectName}
                    onChange={(e) => setSuspectName(e.target.value)}
                    disabled={isRecording}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">สถานที่</Label>
                  <Input
                    id="location"
                    placeholder="สถานที่สอบสวน"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    disabled={isRecording}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sheetId">Google Sheets ID</Label>
                  <Input
                    id="sheetId"
                    placeholder="ใส่ Google Sheets ID"
                    value={sheetId}
                    onChange={(e) => setSheetId(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  ส่งออกข้อมูล
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={exportToGoogleSheets}
                  disabled={!currentSession || !sheetId}
                >
                  <FileSpreadsheet className="h-4 w-4 mr-2" />
                  ส่งไป Google Sheets
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => exportTranscript('pdf')}
                  disabled={!currentSession}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  ส่งออก PDF
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => exportTranscript('docx')}
                  disabled={!currentSession}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  ส่งออก DOCX
                </Button>
                
                <Button 
                  className="w-full justify-start" 
                  variant="outline"
                  onClick={() => exportTranscript('txt')}
                  disabled={!currentSession}
                >
                  <FileText className="h-4 w-4 mr-2" />
                  ส่งออก TXT
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Transcription and Audio */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Player */}
            {audioUrl && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Volume2 className="h-5 w-5 mr-2" />
                    การเล่นเสียง
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={togglePlayback}
                      >
                        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      
                      <div className="flex-1">
                        <div className="bg-gray-200 rounded-full h-2 cursor-pointer"
                          onClick={(e) => {
                            const rect = e.currentTarget.getBoundingClientRect()
                            const x = e.clientX - rect.left
                            const percentage = x / rect.width
                            seekAudio(percentage * duration)
                          }}
                        >
                          <div 
                            className="bg-blue-500 h-2 rounded-full transition-all"
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                          />
                        </div>
                      </div>
                      
                      <span className="text-sm text-gray-500 min-w-20">
                        {formatTime(currentTime)} / {formatTime(duration)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Transcription */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    การถอดความเสียง
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={formatTranscript}
                      disabled={!currentSession || currentSession.segments.length === 0}
                    >
                      <RefreshCw className="h-4 w-4 mr-2" />
                      วิเคราะห์และจัดรูปแบบ
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={exportToGoogleSheets}
                      disabled={!currentSession || !sheetId}
                    >
                      <Send className="h-4 w-4 mr-2" />
                      ส่งข้อมูล
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="live" className="h-full">
                  <TabsList>
                    <TabsTrigger value="live">ถอดความสด</TabsTrigger>
                    <TabsTrigger value="formatted">จัดรูปแบบแล้ว</TabsTrigger>
                  </TabsList>

                  <TabsContent value="live" className="space-y-4">
                    {currentSession && currentSession.segments.length > 0 ? (
                      <div className="space-y-3 max-h-96 overflow-y-auto">
                        {currentSession.segments.map((segment) => (
                          <div key={segment.id} className="p-3 bg-gray-50 rounded-lg">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                <Badge variant={segment.speaker === 'Investigator' ? 'default' : 'secondary'}>
                                  <Users className="h-3 w-3 mr-1" />
                                  {segment.speaker}
                                </Badge>
                                <span className="text-xs text-gray-500">{segment.timestamp}</span>
                              </div>
                              <Badge variant="outline" className="text-xs">
                                {(segment.confidence * 100).toFixed(1)}%
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-700">{segment.text}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <Mic className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">
                          {isRecording ? 'กำลังถอดความเสียง...' : 'เริ่มบันทึกเสียงเพื่อถอดความ'}
                        </p>
                        <p className="text-sm text-gray-400">
                          ระบบจะถอดความเสียงภาษาไทยแบบเรียลไทม์
                        </p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="formatted">
                    {currentSession?.formattedTranscript ? (
                      <div className="space-y-4">
                        <Textarea
                          value={currentSession.formattedTranscript}
                          readOnly
                          className="min-h-64 font-mono text-sm"
                        />
                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" size="sm">
                            <Save className="h-4 w-4 mr-2" />
                            บันทึก
                          </Button>
                          <Button variant="outline" size="sm">
                            <Download className="h-4 w-4 mr-2" />
                            ดาวน์โหลด
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-500 mb-2">ยังไม่มีข้อความที่จัดรูปแบบแล้ว</p>
                        <p className="text-sm text-gray-400">
                          คลิก "วิเคราะห์และจัดรูปแบบ" เพื่อจัดรูปแบบข้อความ
                        </p>
                      </div>
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>

            {/* Session History */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Clock className="h-5 w-5 mr-2" />
                    ประวัติการสอบสวน
                  </span>
                  <Badge variant="secondary">{sessions.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {sessions.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">ยังไม่มีประวัติการสอบสวน</p>
                  ) : (
                    sessions.map((session) => (
                      <div key={session.id} className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-sm">{session.title}</span>
                          <Badge variant="outline" className="text-xs">
                            {formatTime(session.duration || 0)}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-xs text-gray-500">
                          <span>{session.startTime.toLocaleDateString('th-TH')}</span>
                          <span>{session.segments.length} ส่วน</span>
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

export default function InterrogationPage() {
  return (
    <ProtectedRoute>
      <InterrogationPageContent />
    </ProtectedRoute>
  )
}