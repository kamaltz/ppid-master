"use client";

import { useState, useEffect } from "react";

interface ChartData {
  label: string;
  value: number;
  color: string;
}

interface ChartProps {
  data: ChartData[];
  type: "bar" | "line" | "pie";
  title: string;
  height?: number;
}

const Chart = ({ data, type, title, height = 300 }: ChartProps) => {
  const [animatedData, setAnimatedData] = useState<ChartData[]>([]);

  useEffect(() => {
    const dataString = JSON.stringify(data);
    const currentDataString = JSON.stringify(animatedData);
    
    if (dataString !== currentDataString) {
      setTimeout(() => setAnimatedData(data), 100);
    }
  }, [data, animatedData]);

  const maxValue = Math.max(...data.map(d => d.value));

  const BarChart = () => (
    <div className="flex items-end justify-between h-full space-x-2">
      {animatedData.map((item, index) => (
        <div key={index} className="flex flex-col items-center flex-1">
          <div className="w-full flex justify-center mb-2">
            <div
              className="w-8 rounded-t transition-all duration-1000 ease-out"
              style={{
                height: `${(item.value / maxValue) * (height - 60)}px`,
                backgroundColor: item.color
              }}
            />
          </div>
          <div className="text-xs text-center text-gray-600 font-medium">
            {item.label}
          </div>
          <div className="text-xs text-gray-500">{item.value}</div>
        </div>
      ))}
    </div>
  );

  const LineChart = () => {
    const points = animatedData.map((item, index) => ({
      x: 10 + (index / (animatedData.length - 1)) * 80,
      y: 20 + (1 - (item.value / (maxValue || 1))) * 60
    }));

    const pathData = points.reduce((path, point, index) => {
      return path + (index === 0 ? `M ${point.x} ${point.y}` : ` L ${point.x} ${point.y}`);
    }, "");

    return (
      <div className="relative h-full">
        <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid meet">
          <path
            d={pathData}
            fill="none"
            stroke="#3B82F6"
            strokeWidth="1"
            className="transition-all duration-1000"
          />
          {points.map((point, index) => (
            <circle
              key={index}
              cx={point.x}
              cy={point.y}
              r="1.5"
              fill="#3B82F6"
              className="transition-all duration-1000"
            />
          ))}
        </svg>
        <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-600 px-2">
          {animatedData.map((item, index) => (
            <span key={index} className="text-center">{item.label}</span>
          ))}
        </div>
      </div>
    );
  };

  const PieChart = () => {
    const total = animatedData.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = 0;

    return (
      <div className="flex items-center justify-center h-full">
        <div className="relative">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {animatedData.map((item, index) => {
              const percentage = (item.value / total) * 100;
              const angle = (percentage / 100) * 360;
              const startAngle = currentAngle;
              const endAngle = currentAngle + angle;
              
              const x1 = 100 + 80 * Math.cos((startAngle * Math.PI) / 180);
              const y1 = 100 + 80 * Math.sin((startAngle * Math.PI) / 180);
              const x2 = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
              const y2 = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
              
              const largeArcFlag = angle > 180 ? 1 : 0;
              
              const pathData = [
                `M 100 100`,
                `L ${x1} ${y1}`,
                `A 80 80 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                `Z`
              ].join(' ');
              
              currentAngle += angle;
              
              return (
                <path
                  key={index}
                  d={pathData}
                  fill={item.color}
                  className="transition-all duration-1000"
                />
              );
            })}
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-800">{total}</div>
              <div className="text-xs text-gray-600">Total</div>
            </div>
          </div>
        </div>
        <div className="ml-6 space-y-2">
          {animatedData.map((item, index) => (
            <div key={index} className="flex items-center space-x-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="text-sm text-gray-700">{item.label}: {item.value}</span>
            </div>
          ))}
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
      </div>
    </div>
  );
};

export default Chart;