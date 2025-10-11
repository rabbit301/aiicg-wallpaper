'use client';

import { ReactNode } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    borderColor?: string | string[];
    backgroundColor?: string | string[];
    fill?: boolean;
  }[];
}

interface ChartCardProps {
  title: string;
  subtitle?: string;
  data: ChartData;
  type: 'line' | 'bar' | 'doughnut';
  height?: number;
  loading?: boolean;
  actions?: ReactNode;
}

// 简化的图表组件（不依赖外部库）
function SimpleLineChart({ data, height = 200 }: { data: ChartData; height?: number }) {
  const dataset = data.datasets[0];
  if (!dataset || !dataset.data.length) return null;

  const maxValue = Math.max(...dataset.data);
  const minValue = Math.min(...dataset.data);
  const range = maxValue - minValue || 1;

  const points = dataset.data.map((value, index) => {
    const x = (index / (dataset.data.length - 1)) * 100;
    const y = 100 - ((value - minValue) / range) * 80; // 留20%边距
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="relative" style={{ height }}>
      <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
        {/* 网格线 */}
        <defs>
          <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
            <path d="M 20 0 L 0 0 0 20" fill="none" stroke="currentColor" strokeWidth="0.1" opacity="0.1"/>
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        
        {/* 面积填充 */}
        <path
          d={`M 0,100 L ${points} L 100,100 Z`}
          fill="currentColor"
          fillOpacity="0.1"
          className="text-primary-500"
        />
        
        {/* 线条 */}
        <polyline
          points={points}
          fill="none"
          stroke="currentColor"
          strokeWidth="0.5"
          className="text-primary-500"
        />
        
        {/* 数据点 */}
        {dataset.data.map((value, index) => {
          const x = (index / (dataset.data.length - 1)) * 100;
          const y = 100 - ((value - minValue) / range) * 80;
          return (
            <circle
              key={index}
              cx={x}
              cy={y}
              r="0.8"
              fill="currentColor"
              className="text-primary-500"
            />
          );
        })}
      </svg>
      
      {/* X轴标签 */}
      <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-500 mt-2">
        {data.labels.map((label, index) => (
          <span key={index} className="text-center">
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

function SimpleBarChart({ data, height = 200 }: { data: ChartData; height?: number }) {
  const dataset = data.datasets[0];
  if (!dataset || !dataset.data.length) return null;

  const maxValue = Math.max(...dataset.data);

  return (
    <div className="relative" style={{ height }}>
      <div className="flex items-end justify-between h-full gap-1 pb-6">
        {dataset.data.map((value, index) => {
          const heightPercent = (value / maxValue) * 100;
          return (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div
                className="w-full bg-gradient-to-t from-primary-500 to-primary-400 rounded-t transition-all duration-300 hover:from-primary-600 hover:to-primary-500"
                style={{ height: `${heightPercent}%` }}
              />
              <span className="text-xs text-gray-500 mt-1 text-center">
                {data.labels[index]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SimpleDoughnutChart({ data, height = 200 }: { data: ChartData; height?: number }) {
  const dataset = data.datasets[0];
  if (!dataset || !dataset.data.length) return null;

  const total = dataset.data.reduce((sum, value) => sum + value, 0);
  let currentAngle = 0;

  const colors = [
    'text-blue-500',
    'text-green-500', 
    'text-purple-500',
    'text-orange-500',
    'text-red-500'
  ];

  return (
    <div className="relative flex items-center justify-center" style={{ height }}>
      <svg className="w-32 h-32" viewBox="0 0 100 100">
        {dataset.data.map((value, index) => {
          const percentage = value / total;
          const angle = percentage * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + angle;
          
          currentAngle += angle;

          const startAngleRad = (startAngle * Math.PI) / 180;
          const endAngleRad = (endAngle * Math.PI) / 180;
          
          const x1 = 50 + 35 * Math.cos(startAngleRad);
          const y1 = 50 + 35 * Math.sin(startAngleRad);
          const x2 = 50 + 35 * Math.cos(endAngleRad);
          const y2 = 50 + 35 * Math.sin(endAngleRad);
          
          const largeArcFlag = angle > 180 ? 1 : 0;
          
          return (
            <path
              key={index}
              d={`M 50 50 L ${x1} ${y1} A 35 35 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
              fill="currentColor"
              className={colors[index % colors.length]}
              opacity="0.8"
            />
          );
        })}
        <circle cx="50" cy="50" r="20" fill="white" className="dark:fill-gray-900" />
      </svg>
      
      {/* 图例 */}
      <div className="absolute right-0 space-y-1">
        {data.labels.map((label, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className={`w-3 h-3 rounded ${colors[index % colors.length]} bg-current`} />
            <span className="text-gray-600 dark:text-gray-400">{label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function ChartCard({
  title,
  subtitle,
  data,
  type,
  height = 200,
  loading = false,
  actions
}: ChartCardProps) {
  const { t } = useLanguage();

  const renderChart = () => {
    if (loading) {
      return (
        <div className="flex items-center justify-center" style={{ height }}>
          <div className="w-8 h-8 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
        </div>
      );
    }

    switch (type) {
      case 'line':
        return <SimpleLineChart data={data} height={height} />;
      case 'bar':
        return <SimpleBarChart data={data} height={height} />;
      case 'doughnut':
        return <SimpleDoughnutChart data={data} height={height} />;
      default:
        return <SimpleLineChart data={data} height={height} />;
    }
  };

  return (
    <div className="rounded-xl border border-neutral-200 dark:border-neutral-800 bg-white/70 dark:bg-neutral-900/60 backdrop-blur-md p-6 transition-all duration-200 hover:shadow-lg">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>

      {/* 图表内容 */}
      <div className="relative">
        {renderChart()}
      </div>
    </div>
  );
}
