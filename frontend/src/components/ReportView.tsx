import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Loader2, ArrowLeft } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { expenseApi } from '../services/api';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Define types
interface CategorySummary {
  category: string;
  total_amount: number;
  count: number;
}

interface MerchantSummary {
  merchant: string;
  total_amount: number;
  count: number;
}

interface ExpenseSummary {
  total_expenses: number;
  total_count: number;
  by_category: CategorySummary[];
  by_merchant: MerchantSummary[];
  by_date: Record<string, number>;
}

interface ReportViewProps {
  onBack: () => void;
}

// Colors for charts
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#8DD1E1'];

const ReportView = ({ onBack }: ReportViewProps) => {
  const [reportData, setReportData] = useState<ExpenseSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');
  
  useEffect(() => {
    fetchReportData();
  }, [timeRange]);
  
  const fetchReportData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Calculate date range based on selected time range
      const endDate = new Date();
      const startDate = new Date();
      
      if (timeRange === 'week') {
        startDate.setDate(startDate.getDate() - 7);
      } else if (timeRange === 'month') {
        startDate.setMonth(startDate.getMonth() - 1);
      } else if (timeRange === 'year') {
        startDate.setFullYear(startDate.getFullYear() - 1);
      }
      
      // Format dates for API
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');
      
      // Fetch report data
      const data = await expenseApi.getExpenseSummary({
        start_date: formattedStartDate,
        end_date: formattedEndDate
      });
      
      setReportData(data);
      setIsLoading(false);
    } catch (err) {
      console.error('Error fetching report data:', err);
      setError('获取报表数据失败');
      setIsLoading(false);
    }
  };
  
  // Prepare data for charts
  const prepareCategoryData = () => {
    if (!reportData || !reportData.by_category) return [];
    
    return reportData.by_category.map((item, index) => ({
      name: item.category,
      value: item.total_amount,
      count: item.count,
      fill: COLORS[index % COLORS.length]
    }));
  };
  
  const prepareMerchantData = () => {
    if (!reportData || !reportData.by_merchant) return [];
    
    // Sort by amount and take top 5
    return [...reportData.by_merchant]
      .sort((a, b) => b.total_amount - a.total_amount)
      .slice(0, 5)
      .map((item, index) => ({
        name: item.merchant,
        value: item.total_amount,
        count: item.count,
        fill: COLORS[index % COLORS.length]
      }));
  };
  
  const prepareDateData = () => {
    if (!reportData || !reportData.by_date) return [];
    
    return Object.entries(reportData.by_date)
      .map(([date, amount]) => ({
        date: format(new Date(date), 'MM/dd'),
        amount
      }))
      .sort((a, b) => {
        const dateA = new Date(a.date);
        const dateB = new Date(b.date);
        return dateA.getTime() - dateB.getTime();
      });
  };
  
  const categoryData = prepareCategoryData();
  const merchantData = prepareMerchantData();
  const dateData = prepareDateData();
  
  return (
    <div className="flex flex-col items-center p-4 max-w-md mx-auto">
      <div className="flex items-center w-full mb-6">
        <Button variant="ghost" size="icon" onClick={onBack} className="mr-2">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <h1 className="text-2xl font-bold">消费报表</h1>
      </div>
      
      <Tabs value={timeRange} onValueChange={(value) => setTimeRange(value as 'week' | 'month' | 'year')} className="w-full mb-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="week">本周</TabsTrigger>
          <TabsTrigger value="month">本月</TabsTrigger>
          <TabsTrigger value="year">本年</TabsTrigger>
        </TabsList>
      </Tabs>
      
      {isLoading ? (
        <div className="flex justify-center py-8 w-full">
          <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
        </div>
      ) : error ? (
        <div className="w-full mb-4 p-3 bg-red-50 text-red-600 rounded-md">
          <p>{error}</p>
        </div>
      ) : reportData ? (
        <div className="w-full space-y-6">
          {/* 总览 */}
          <Card className="w-full">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">总览</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <p className="text-sm text-gray-500">总支出</p>
                  <p className="text-xl font-bold">¥{reportData.total_expenses.toFixed(2)}</p>
                </div>
                <div className="bg-gray-50 p-3 rounded-md text-center">
                  <p className="text-sm text-gray-500">消费次数</p>
                  <p className="text-xl font-bold">{reportData.total_count}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* 分类支出 */}
          <Card className="w-full">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">分类支出</h2>
              {categoryData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => `¥${Number(value).toFixed(2)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">暂无分类数据</p>
              )}
            </CardContent>
          </Card>
          
          {/* 商家支出 */}
          <Card className="w-full">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">商家支出 (Top 5)</h2>
              {merchantData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={merchantData}
                      layout="vertical"
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={100} />
                      <Tooltip formatter={(value) => `¥${Number(value).toFixed(2)}`} />
                      <Bar dataKey="value" fill="#8884d8">
                        {merchantData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">暂无商家数据</p>
              )}
            </CardContent>
          </Card>
          
          {/* 日期支出趋势 */}
          <Card className="w-full">
            <CardContent className="p-4">
              <h2 className="text-lg font-medium mb-4">支出趋势</h2>
              {dateData.length > 0 ? (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={dateData}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => `¥${Number(value).toFixed(2)}`} />
                      <Bar dataKey="amount" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="text-center text-gray-500 py-4">暂无趋势数据</p>
              )}
            </CardContent>
          </Card>
        </div>
      ) : (
        <p className="text-center text-gray-500 py-8">暂无报表数据</p>
      )}
    </div>
  );
};

export default ReportView;
