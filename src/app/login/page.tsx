"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, Eye, EyeOff } from "lucide-react"
import { useRouter } from "next/navigation"

interface User {
  id: string
  email: string
  name: string
  role: 'INVESTIGATOR' | 'SUPERVISOR' | 'ADMIN'
}

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Mock users for demonstration
  const mockUsers: User[] = [
    {
      id: '1',
      email: 'investigator@police.go.th',
      name: 'สมชาย ใจดี',
      role: 'INVESTIGATOR'
    },
    {
      id: '2',
      email: 'supervisor@police.go.th',
      name: 'สมศรี รักดี',
      role: 'SUPERVISOR'
    },
    {
      id: '3',
      email: 'admin@police.go.th',
      name: 'วิชัย มานะ',
      role: 'ADMIN'
    }
  ]

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))

      const user = mockUsers.find(u => u.email === email)
      
      if (!user) {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
        return
      }

      // Mock password validation (in real app, this would be hashed)
      if (password !== "password123") {
        setError("อีเมลหรือรหัสผ่านไม่ถูกต้อง")
        return
      }

      // Store user in localStorage (in real app, use secure cookies)
      localStorage.setItem('user', JSON.stringify(user))
      
      // Redirect to dashboard
      router.push('/')
      
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเข้าสู่ระบบ")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Shield className="h-16 w-16 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">AI Investigation Assistant</h1>
          <p className="text-gray-600">Nikhompattana Police Station</p>
          <p className="text-sm text-gray-500 mt-2">ระบบช่วยเหลือการสอบสวนอัจฉริยะ</p>
        </div>

        {/* Login Card */}
        <Card>
          <CardHeader>
            <CardTitle>เข้าสู่ระบบ</CardTitle>
            <CardDescription>
              กรุณากรอกอีเมลและรหัสผ่านเพื่อเข้าสู่ระบบ
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">อีเมล</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="กรอกอีเมล"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">รหัสผ่าน</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="กรอกรหัสผ่าน"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full" 
                disabled={isLoading}
              >
                {isLoading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            <div className="mt-6 pt-6 border-t">
              <div className="text-sm text-gray-600 mb-4">บัญชีทดสอบ:</div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span>นักสืบ:</span>
                  <span className="font-mono">investigator@police.go.th</span>
                </div>
                <div className="flex justify-between">
                  <span>ผู้ควบคุม:</span>
                  <span className="font-mono">supervisor@police.go.th</span>
                </div>
                <div className="flex justify-between">
                  <span>ผู้ดูแลระบบ:</span>
                  <span className="font-mono">admin@police.go.th</span>
                </div>
                <div className="flex justify-between mt-2 pt-2 border-t">
                  <span>รหัสผ่าน:</span>
                  <span className="font-mono">password123</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 text-sm text-gray-500">
          <p>© 2024 Nikhompattana Police Station. All rights reserved.</p>
          <p className="mt-1">ระบบนี้สำหรับเจ้าหน้าที่ตำรวจเท่านั้น</p>
        </div>
      </div>
    </div>
  )
}