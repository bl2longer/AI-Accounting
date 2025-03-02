import { useState, useEffect, useRef } from 'react'
import { Camera, Mic, Type, Check, X, Loader2, BarChart } from 'lucide-react'
import { Button } from './components/ui/button'
import { Card, CardContent } from './components/ui/card'
import { Input } from './components/ui/input'
import { Tabs, TabsList, TabsTrigger } from './components/ui/tabs'
import { Textarea } from './components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select'
import { format } from 'date-fns'
import { expenseApi, recognitionApi } from './services/api'
import ReportView from './components/ReportView'
import './App.css'

// 定义类型
interface ExpenseRecord {
  id: number
  merchant: string
  date: string
  total_amount: number
  items: ExpenseItem[]
  category?: string
}

interface ExpenseItem {
  id?: number
  name: string
  amount: number
  needed_confirmation?: boolean
}

interface RecognitionResult {
  merchant: string
  date: string
  total: number
  items: {
    name: string
    amount: number
    needConfirm: boolean
  }[]
}

function App() {
  // 状态管理
  const [currentView, setCurrentView] = useState<'home' | 'input' | 'confirm' | 'records' | 'report'>('home')
  const [inputMethod, setInputMethod] = useState<'camera' | 'voice' | 'text' | null>(null)
  const [recognitionResult, setRecognitionResult] = useState<RecognitionResult | null>(null)
  const [editItemValue, setEditItemValue] = useState('')
  const [recentRecords, setRecentRecords] = useState<ExpenseRecord[]>([])
  const [allRecords, setAllRecords] = useState<ExpenseRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [textInput, setTextInput] = useState('')
  const [categories, setCategories] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [notes, setNotes] = useState('')
  
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // 获取最近记录
  useEffect(() => {
    const fetchRecentRecords = async () => {
      try {
        setIsLoading(true);
        const data = await expenseApi.getExpenses({ limit: 5 });
        setRecentRecords(data);
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching recent records:', err);
        setError('获取最近记录失败');
        setIsLoading(false);
      }
    };
    
    fetchRecentRecords();
  }, [currentView]);
  
  // 获取所有记录
  useEffect(() => {
    if (currentView === 'records') {
      const fetchAllRecords = async () => {
        try {
          setIsLoading(true);
          const data = await expenseApi.getExpenses({ limit: 100 });
          setAllRecords(data);
          setIsLoading(false);
        } catch (err) {
          console.error('Error fetching all records:', err);
          setError('获取记录失败');
          setIsLoading(false);
        }
      };
      
      fetchAllRecords();
    }
  }, [currentView]);
  
  // 获取分类列表
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await expenseApi.getCategories();
        setCategories(data);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    
    fetchCategories();
  }, []);
  
  // 处理文件选择
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      setSelectedFile(event.target.files[0]);
    }
  };
  
  // 处理输入方法选择
  const handleInputMethodSelect = (method: 'camera' | 'voice' | 'text') => {
    setInputMethod(method);
    setError(null);
    
    if (method === 'camera' || method === 'voice') {
      // 触发文件选择
      if (fileInputRef.current) {
        fileInputRef.current.click();
      }
    }
  };
  
  // 处理输入提交
  const handleInputSubmit = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      if (!inputMethod) {
        setError('请选择输入方式');
        setIsLoading(false);
        return;
      }
      
      if ((inputMethod === 'camera' || inputMethod === 'voice') && !selectedFile) {
        setError('请选择文件');
        setIsLoading(false);
        return;
      }
      
      if (inputMethod === 'text' && !textInput) {
        setError('请输入文字描述');
        setIsLoading(false);
        return;
      }
      
      // 调用API处理输入
      let result;
      if (inputMethod === 'camera') {
        result = await recognitionApi.processInput('image', selectedFile || undefined);
      } else if (inputMethod === 'voice') {
        result = await recognitionApi.processInput('voice', selectedFile || undefined);
      } else {
        result = await recognitionApi.processInput('text', undefined, textInput);
      }
      
      setRecognitionResult(result);
      setCurrentView('confirm');
      setIsLoading(false);
    } catch (err) {
      console.error('Error processing input:', err);
      setError('处理输入失败');
      setIsLoading(false);
    }
  };
  
  // 保存记录到数据库
  const saveExpenseRecord = async () => {
    if (!recognitionResult) return;
    
    try {
      setIsLoading(true);
      
      // 将日期字符串转换为ISO格式
      const dateParts = recognitionResult.date.split('/');
      const dateObj = new Date(
        parseInt(dateParts[0]), 
        parseInt(dateParts[1]) - 1, 
        parseInt(dateParts[2])
      );
      
      // 准备数据
      const expenseData = {
        merchant: recognitionResult.merchant,
        date: dateObj.toISOString(),
        total_amount: recognitionResult.total,
        input_type: inputMethod,
        category: selectedCategory || null,
        notes: notes || null,
        is_confirmed: true,
        items: recognitionResult.items.map(item => ({
          name: item.name,
          amount: item.amount,
          needed_confirmation: item.needConfirm
        }))
      };
      
      // 调用API创建记录
      await expenseApi.createExpense(expenseData);
      
      // 重置状态
      setRecognitionResult(null);
      setSelectedFile(null);
      setTextInput('');
      setSelectedCategory('');
      setNotes('');
      setInputMethod(null);
      
      setCurrentView('home');
      setIsLoading(false);
    } catch (err) {
      console.error('Error saving expense record:', err);
      setError('保存记录失败');
      setIsLoading(false);
    }
  };
  
  // 格式化日期显示
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return format(date, 'yyyy年MM月dd日');
    } catch (err) {
      return dateString;
    }
  };
  
  // 获取相对日期描述
  const getRelativeDateDescription = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (date.toDateString() === today.toDateString()) {
        return '今天';
      } else if (date.toDateString() === yesterday.toDateString()) {
        return '昨天';
      } else {
        return format(date, 'MM/dd');
      }
    } catch (err) {
      return '';
    }
  };

  // 主页/首页
  const HomeView = () => (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">智能记账助手</h1>
      
      <Button 
        className="w-full py-6 mb-8 text-lg" 
        onClick={() => setCurrentView('input')}
      >
        添加新消费记录
      </Button>
      
      <div className="w-full">
        <h2 className="text-xl mb-4">最近记录:</h2>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : recentRecords.length > 0 ? (
          <div className="space-y-2">
            {recentRecords.map(record => (
              <Card key={record.id} className="w-full">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="font-medium">{record.merchant}</p>
                    <p className="text-sm text-gray-500">{getRelativeDateDescription(record.date)}</p>
                  </div>
                  <p className="font-bold">¥{record.total_amount.toFixed(2)}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-4">暂无记录</p>
        )}
        
        <div className="grid grid-cols-2 gap-4 mt-4">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={() => setCurrentView('records')}
          >
            查看所有记录
          </Button>
          
          <Button 
            variant="outline" 
            className="w-full flex items-center justify-center"
            onClick={() => setCurrentView('report')}
          >
            <BarChart className="h-4 w-4 mr-2" />
            消费报表
          </Button>
        </div>
      </div>
    </div>
  )

  // 数据录入界面
  const InputView = () => (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">添加消费记录</h1>
      
      <p className="mb-6 text-center">选择输入方式:</p>
      
      <div className="grid grid-cols-3 gap-4 w-full mb-6">
        <Button 
          variant={inputMethod === 'camera' ? 'default' : 'outline'} 
          className="flex flex-col items-center p-4 h-auto"
          onClick={() => handleInputMethodSelect('camera')}
        >
          <Camera size={32} className="mb-2" />
          <span>拍照</span>
        </Button>
        
        <Button 
          variant={inputMethod === 'voice' ? 'default' : 'outline'} 
          className="flex flex-col items-center p-4 h-auto"
          onClick={() => handleInputMethodSelect('voice')}
        >
          <Mic size={32} className="mb-2" />
          <span>语音记录</span>
        </Button>
        
        <Button 
          variant={inputMethod === 'text' ? 'default' : 'outline'} 
          className="flex flex-col items-center p-4 h-auto"
          onClick={() => handleInputMethodSelect('text')}
        >
          <Type size={32} className="mb-2" />
          <span>手动输入</span>
        </Button>
      </div>
      
      {/* 隐藏的文件输入 */}
      <input 
        type="file" 
        ref={fileInputRef}
        className="hidden"
        onChange={handleFileSelect}
        accept={inputMethod === 'camera' ? 'image/*' : 'audio/*'}
      />
      
      {/* 显示已选择的文件 */}
      {selectedFile && (inputMethod === 'camera' || inputMethod === 'voice') && (
        <div className="w-full mb-4 p-3 border rounded-md">
          <p className="text-sm">已选择: {selectedFile.name}</p>
        </div>
      )}
      
      {/* 文字输入 */}
      {inputMethod === 'text' && (
        <div className="w-full mb-4">
          <Textarea
            placeholder="请输入消费描述，例如：在星巴克买了一杯拿铁，花了32元"
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
      )}
      
      {/* 错误提示 */}
      {error && (
        <div className="w-full mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          <p>{error}</p>
        </div>
      )}
      
      <div className="bg-gray-100 p-4 rounded-md w-full mb-6">
        <p className="text-sm">提示: 拍摄收据时可分多张拍摄，系统会自动处理重复内容</p>
      </div>
      
      <div className="flex space-x-4 w-full">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => {
            setInputMethod(null);
            setSelectedFile(null);
            setTextInput('');
            setError(null);
            setCurrentView('home');
          }}
        >
          返回
        </Button>
        
        {inputMethod && (
          <Button 
            className="flex-1"
            onClick={handleInputSubmit}
            disabled={isLoading || 
              (inputMethod === 'text' && !textInput) || 
              ((inputMethod === 'camera' || inputMethod === 'voice') && !selectedFile)
            }
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            处理
          </Button>
        )}
      </div>
    </div>
  )

  // AI处理与确认界面
  const ConfirmView = () => {
    if (!recognitionResult) {
      // 如果没有识别结果，返回输入界面
      setCurrentView('input');
      return null;
    }
    
    const hasItemsToConfirm = recognitionResult.items.some(item => item.needConfirm);
    
    // 处理确认项目
    const handleConfirmItem = (index: number, confirmed: boolean) => {
      const updatedItems = [...recognitionResult.items];
      if (confirmed) {
        updatedItems[index].needConfirm = false;
      } else {
        // 如果不确认，可以提供修改选项
        if (editItemValue) {
          updatedItems[index].name = editItemValue;
          updatedItems[index].needConfirm = false;
          setEditItemValue('');
        }
      }
      setRecognitionResult({...recognitionResult, items: updatedItems});
    };
    
    // 保存记录
    const handleSaveRecord = () => {
      saveExpenseRecord();
    };
    
    return (
      <div className="flex flex-col items-center p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">处理结果确认</h1>
        
        <Card className="w-full mb-6">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-4">已识别信息:</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">商家:</span>
                <span>{recognitionResult.merchant}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">日期:</span>
                <span>{recognitionResult.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">总额:</span>
                <span className="font-bold">¥{recognitionResult.total.toFixed(2)}</span>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="w-full mb-6">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-4">项目:</h2>
            <div className="space-y-3">
              {recognitionResult.items.map((item, index) => (
                <div key={index} className="flex justify-between items-center">
                  <div className="flex items-center">
                    <span className={item.needConfirm ? "text-amber-500 font-medium" : ""}>
                      {item.name}
                    </span>
                    {item.needConfirm && <span className="ml-2 text-amber-500">[需确认?]</span>}
                  </div>
                  <span>¥{item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        {/* 分类选择 */}
        <Card className="w-full mb-6">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-4">分类:</h2>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="选择分类" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category, index) => (
                  <SelectItem key={index} value={category}>
                    {category}
                  </SelectItem>
                ))}
                <SelectItem value="餐饮">餐饮</SelectItem>
                <SelectItem value="交通">交通</SelectItem>
                <SelectItem value="购物">购物</SelectItem>
                <SelectItem value="娱乐">娱乐</SelectItem>
                <SelectItem value="其他">其他</SelectItem>
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
        
        {/* 备注 */}
        <Card className="w-full mb-6">
          <CardContent className="p-4">
            <h2 className="text-lg font-medium mb-4">备注:</h2>
            <Textarea
              placeholder="添加备注（可选）"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </CardContent>
        </Card>
        
        {hasItemsToConfirm && (
          <Card className="w-full mb-6 border-amber-300">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4 text-amber-600">[需确认] 请确认标记项目:</h2>
              
              {recognitionResult.items.map((item, index) => (
                item.needConfirm && (
                  <div key={index} className="mb-4">
                    <p className="mb-2">这是{item.name}吗?</p>
                    <div className="flex space-x-2 mb-3">
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => handleConfirmItem(index, true)}
                      >
                        <Check className="mr-1 h-4 w-4" /> 是
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center"
                        onClick={() => handleConfirmItem(index, false)}
                      >
                        <X className="mr-1 h-4 w-4" /> 否
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm mb-1">如果不是，请修改:</p>
                      <div className="flex space-x-2">
                        <Input 
                          value={editItemValue} 
                          onChange={(e) => setEditItemValue(e.target.value)}
                          placeholder="输入正确的项目名称"
                        />
                        <Button 
                          size="sm"
                          onClick={() => handleConfirmItem(index, false)}
                          disabled={!editItemValue}
                        >
                          确认
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              ))}
            </CardContent>
          </Card>
        )}
        
        {/* 错误提示 */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            <p>{error}</p>
          </div>
        )}
        
        <div className="flex space-x-4 w-full">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => setCurrentView('input')}
            disabled={isLoading}
          >
            取消
          </Button>
          <Button 
            className="flex-1"
            onClick={handleSaveRecord}
            disabled={hasItemsToConfirm || isLoading}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : null}
            保存记录
          </Button>
        </div>
      </div>
    );
  }

  // 记录查看界面
  const RecordsView = () => {
    // 按日期分组记录
    const groupRecordsByDate = () => {
      const grouped: Record<string, ExpenseRecord[]> = {};
      
      allRecords.forEach(record => {
        const dateKey = formatDate(record.date);
        if (!grouped[dateKey]) {
          grouped[dateKey] = [];
        }
        grouped[dateKey].push(record);
      });
      
      return grouped;
    };
    
    const groupedRecords = groupRecordsByDate();
    const dateKeys = Object.keys(groupedRecords).sort().reverse();
    
    // 获取项目名称列表
    const getItemNames = (items: ExpenseItem[]) => {
      if (!items || items.length === 0) return '';
      
      const names = items.map(item => item.name);
      if (names.length <= 3) {
        return `(${names.join(', ')})`;
      } else {
        return `(${names.slice(0, 2).join(', ')}... 等${names.length}项)`;
      }
    };
    
    return (
      <div className="flex flex-col items-center p-4 max-w-md mx-auto">
        <h1 className="text-2xl font-bold mb-6">消费记录</h1>
        
        <Tabs defaultValue="all" className="w-full mb-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">全部</TabsTrigger>
            <TabsTrigger value="week">本周</TabsTrigger>
            <TabsTrigger value="month">本月</TabsTrigger>
          </TabsList>
        </Tabs>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : allRecords.length > 0 ? (
          <div className="w-full">
            {dateKeys.map(dateKey => (
              <div key={dateKey} className="mb-6">
                <h2 className="text-lg font-medium mb-3">{dateKey}</h2>
                <div className="space-y-3">
                  {groupedRecords[dateKey].map(record => (
                    <Card key={record.id} className="w-full">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-center mb-2">
                          <div className="flex items-center">
                            <span className="font-medium">{record.merchant}</span>
                            {record.category && (
                              <span className="ml-2 text-xs bg-gray-100 px-2 py-1 rounded-full">
                                {record.category}
                              </span>
                            )}
                          </div>
                          <span className="font-bold">¥{record.total_amount.toFixed(2)}</span>
                        </div>
                        {record.items && record.items.length > 0 && (
                          <p className="text-sm text-gray-500">{getItemNames(record.items)}</p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-gray-500 py-8">暂无记录</p>
        )}
        
        {error && (
          <div className="w-full mb-4 p-3 bg-red-50 text-red-600 rounded-md">
            <p>{error}</p>
          </div>
        )}
        
        <Button 
          className="w-full mt-6"
          onClick={() => setCurrentView('home')}
        >
          返回首页
        </Button>
      </div>
    );
  };

  // 根据当前视图渲染对应的界面
  const renderView = () => {
    switch (currentView) {
      case 'home':
        return <HomeView />
      case 'input':
        return <InputView />
      case 'confirm':
        return <ConfirmView />
      case 'records':
        return <RecordsView />
      case 'report':
        return <ReportView onBack={() => setCurrentView('home')} />
      default:
        return <HomeView />
    }
  }

  return (
    <div className="min-h-screen bg-white">
      {renderView()}
    </div>
  )
}

export default App
