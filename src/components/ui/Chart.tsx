"use client";

import { useState, useEffect } from "react";

interface ChartData {
  name?: string;
  label?: string;
  value: number;
  color?: string;
  count?: number;
  date?: string;
  month?: string;
}

interface ChartJSData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string;
    backgroundColor?: string;
    tension?: number;
    fill?: boolean;
  }[];
}

interface ChartProps {
  data: ChartData[] | ChartJSData;
  type: "bar" | "line" | "pie" | "donut";
  title: string;
  height?: number;
}

const Chart = ({ data, type, title, height = 300 }: ChartProps) => {
  const [animatedData, setAnimatedData] = useState<ChartData[]>([]);
  const [chartJSData, setChartJSData] = useState<ChartJSData | null>(null);

  useEffect(() => {
    // Check if data is Chart.js format (has labels and datasets)
    if (data && typeof data === 'object' && 'labels' in data && 'datasets' in data) {
      setChartJSData(data as ChartJSData);
      setAnimatedData([]);
    } else {
      const arrayData = Array.isArray(data) ? data : [];
      setAnimatedData(arrayData);
      setChartJSData(null);
    }
  }, [data]);

  const values = Array.isArray(data) 
    ? data.map(d => d.value || d.count || 0).filter(v => !isNaN(v) && isFinite(v))
    : chartJSData?.datasets.flatMap(d => d.data).filter(v => !isNaN(v) && isFinite(v)) || [];
  const maxValue = values.length > 0 ? Math.max(...values, 1) : 1;

  const BarChart = () => (
    <div className="flex items-end justify-between h-full space-x-1 px-4">
      {animatedData.map((item, index) => {
        const value = item.value || item.count || 0;
        const label = item.label || item.month || item.name || '';
        return (
          <div key={index} className="flex flex-col items-center flex-1">
            <div className="w-full flex justify-center mb-2">
              <div
                className="w-6 md:w-8 rounded-t transition-all duration-1000 ease-out"
                style={{
                  height: `${Math.max((value / maxValue) * (height - 80), 2)}px`,
                  backgroundColor: item.color || '#8B5CF6'
                }}
              />
            </div>
            <div className="text-xs text-center text-gray-600 font-medium truncate w-full">
              {label}
            </div>
            <div className="text-xs text-gray-500">{value}</div>
          </div>
        );
      })}
    </div>
  );

  const LineChart = () => {
    // Handle Chart.js format data
    if (chartJSData) {
      const datasets = chartJSData.datasets;
      const labels = chartJSData.labels;
      
      if (!datasets.length || !labels.length) {
        return (
          <div className="flex items-center justify-center h-full text-gray-500">
            Tidak ada data
          </div>
        );
      }
      
      return (
        <div className="relative h-full p-4">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
            <defs>
              {datasets.map((dataset, idx) => (
                <linearGradient key={idx} id={`gradient-${idx}`} x1="0%" y1="0%" x2="0%" y2="100%">
                  <stop offset="0%" stopColor={dataset.borderColor || '#3B82F6'} stopOpacity="0.3" />
                  <stop offset="100%" stopColor={dataset.borderColor || '#3B82F6'} stopOpacity="0.05" />
                </linearGradient>
              ))}
            </defs>
            
            {/* Grid lines */}
            {[0, 25, 50, 75].map(y => (
              <line key={y} x1="15" y1={15 + y * 0.6} x2="85" y2={15 + y * 0.6} 
                    stroke="#e5e7eb" strokeWidth="0.2" opacity="0.5" />
            ))}
            
            {datasets.map((dataset, datasetIdx) => {
              const points = dataset.data.map((value, index) => {
                const x = 15 + (labels.length > 1 ? (index / (labels.length - 1)) * 70 : 35);
                const y = 15 + (1 - (value / Math.max(maxValue, 1))) * 60;
                return { x: isFinite(x) ? x : 15, y: isFinite(y) ? y : 75 };
              });
              
              const pathData = points.length > 0 ? points.reduce((path, point, index) => {
                return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
              }, "") : "M 15 75";
              
              return (
                <g key={datasetIdx}>
                  <path
                    d={pathData}
                    fill="none"
                    stroke={dataset.borderColor || '#3B82F6'}
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="transition-all duration-1000"
                  />
                  {points.map((point, index) => (
                    <circle
                      key={index}
                      cx={point.x}
                      cy={point.y}
                      r="2"
                      fill={dataset.borderColor || '#3B82F6'}
                      className="transition-all duration-1000"
                    />
                  ))}
                </g>
              );
            })}
          </svg>
          
          {/* Labels */}
          <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-gray-600 px-6">
            {labels.map((label, index) => (
              <div key={index} className="text-center">
                <div className="font-medium">{label}</div>
              </div>
            ))}
          </div>
          
          {/* Legend */}
          <div className="absolute top-2 right-2 space-y-1">
            {datasets.map((dataset, idx) => (
              <div key={idx} className="flex items-center space-x-2 text-xs">
                <div 
                  className="w-3 h-0.5" 
                  style={{ backgroundColor: dataset.borderColor || '#3B82F6' }}
                />
                <span>{dataset.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    
    // Handle legacy format
    const chartData = animatedData.map(item => ({
      ...item,
      value: Number(item.value || item.count || 0) || 0,
      label: item.date || item.label || item.name || ''
    }));
    
    if (chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
          Tidak ada data
        </div>
      );
    }
    
    const points = chartData.map((item, index) => {
      const x = 15 + (chartData.length > 1 ? (index / (chartData.length - 1)) * 70 : 35);
      const y = 15 + (1 - (item.value / Math.max(maxValue, 1))) * 60;
      return { x: isFinite(x) ? x : 15, y: isFinite(y) ? y : 75 };
    });

    const pathData = points.length > 0 ? points.reduce((path, point, index) => {
      return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, "") : "M 15 75";

    const lastPoint = points[points.length - 1] || { x: 15, y: 75 };
    const firstPoint = points[0] || { x: 15, y: 75 };
    const gradientPathData = pathData + ` L ${lastPoint.x} 85 L ${firstPoint.x} 85 Z`;

    return (
      <div className="relative h-full p-4">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.05" />
            </linearGradient>
            <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#3B82F6" floodOpacity="0.2"/>
            </filter>
          </defs>
          
          {/* Grid lines */}
          {[0, 25, 50, 75].map(y => (
            <line key={y} x1="15" y1={15 + y * 0.6} x2="85" y2={15 + y * 0.6} 
                  stroke="#e5e7eb" strokeWidth="0.2" opacity="0.5" />
          ))}
          
          {/* Area fill */}
          <path
            d={gradientPathData}
            fill="url(#lineGradient)"
            className="transition-all duration-1000"
          />
          
          {/* Main line */}
          <path
            d={pathData}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-all duration-1000"
            filter="url(#shadow)"
          />
          
          {/* Data points */}
          {points.map((point, index) => (
            <g key={index}>
              <circle
                cx={point.x}
                cy={point.y}
                r="3"
                fill="white"
                stroke="#3B82F6"
                strokeWidth="2"
                className="transition-all duration-1000 hover:r-4"
              />
              <circle
                cx={point.x}
                cy={point.y}
                r="1.5"
                fill="#3B82F6"
                className="transition-all duration-1000"
              />
            </g>
          ))}
        </svg>
        
        {/* Labels */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-between text-xs text-gray-600 px-6">
          {chartData.map((item, index) => (
            <div key={index} className="text-center">
              <div className="font-medium">{item.label}</div>
              <div className="text-gray-400">{item.value}</div>
            </div>
          ))}
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 bottom-8 flex flex-col justify-between text-xs text-gray-500 py-4">
          {[maxValue, Math.round(maxValue * 0.75), Math.round(maxValue * 0.5), Math.round(maxValue * 0.25), 0].map((val, i) => (
            <span key={i}>{val}</span>
          ))}
        </div>
      </div>
    );
  };

  const PieChart = () => {
    const total = Math.max(animatedData.reduce((sum, item) => sum + item.value, 0), 1);
    let currentAngle = -90; // Start from top

    if (total === 1 && animatedData.length === 0) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center text-gray-500">
            <div className="text-lg">Tidak ada data</div>
          </div>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <svg width="240" height="240" viewBox="0 0 240 240" className="drop-shadow-lg">
            {/* Background circle */}
            <circle cx="120" cy="120" r="90" fill="#f3f4f6" className="opacity-20" />
            
            {animatedData.map((item, index) => {
              if (item.value === 0) return null;
              
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = 120 + 90 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 120 + 90 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 120 + 90 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 120 + 90 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 120 120`,
                `L ${x1} ${y1}`,
                `A 90 90 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <g key={index}>
                  <path
                    d={pathData}
                    fill={item.color || '#3B82F6'}
                    className="transition-all duration-1000 hover:opacity-80 cursor-pointer"
                    style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))' }}
                  />
                  {/* Percentage label */}
                  {percentage > 5 && (
                    <text
                      x={120 + 60 * Math.cos(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                      y={120 + 60 * Math.sin(((startAngle + endAngle) / 2 * Math.PI) / 180)}
                      textAnchor="middle"
                      dominantBaseline="middle"
                      className="text-xs font-semibold fill-white"
                    >
                      {Math.round(percentage)}%
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center bg-white rounded-full w-20 h-20 flex items-center justify-center shadow-lg">
              <div>
                <div className="text-2xl font-bold text-gray-800">{total}</div>
                <div className="text-xs text-gray-600">Total</div>
              </div>
            </div>
          </div>
        </div>
        <div className="ml-8 space-y-3">
          {animatedData.map((item, index) => {
            const percentage = total > 0 ? Math.round((item.value / total) * 100) : 0;
            return (
              <div key={index} className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 transition-colors">
                <div
                  className="w-4 h-4 rounded-full shadow-sm"
                  style={{ backgroundColor: item.color || '#3B82F6' }}
                />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700">
                    {item.name || item.label}: {item.value}
                  </div>
                  <div className="text-xs text-gray-500">{percentage}% dari total</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const DonutChart = () => {
    const total = Math.max(animatedData.reduce((sum, item) => sum + item.value, 0), 1);
    let currentAngle = -90;

    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {animatedData.map((item, index) => {
              if (item.value === 0) return null;
              
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const outerRadius = 80;
              const innerRadius = 50;
              
              const x1 = 100 + outerRadius * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 100 + outerRadius * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 100 + outerRadius * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 100 + outerRadius * Math.sin((endAngle * Math.PI) / 180);
              
              const x3 = 100 + innerRadius * Math.cos((endAngle * Math.PI) / 180);
              const y3 = 100 + innerRadius * Math.sin((endAngle * Math.PI) / 180);
              const x4 = 100 + innerRadius * Math.cos((startAngle * Math.PI) / 180);
              const y4 = 100 + innerRadius * Math.sin((startAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M ${x1} ${y1}`,
                `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `L ${x3} ${y3}`,
                `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${x4} ${y4}`,
                `Z`
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color || '#3B82F6'}
                  className="transition-all duration-1000 hover:opacity-80"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-xl font-bold text-gray-800">{total}</div>
              <div className="text-xs text-gray-600">Permohonan</div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">{title}</h3>
      <div style={{ height: `${height}px` }}>
        {type === "bar" && <BarChart />}
        {type === "line" && <LineChart />}
        {type === "pie" && <PieChart />}
        {type === "donut" && <DonutChart />}
      </div>
    </div>
  );
};

export default Chart;