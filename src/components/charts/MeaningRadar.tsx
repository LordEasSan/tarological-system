import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import type { MeaningWeights } from '../../types';

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

interface MeaningRadarProps {
  weights: MeaningWeights;
  className?: string;
}

export function MeaningRadar({ weights, className = '' }: MeaningRadarProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const labels = Object.keys(weights).map(
    (k) => k.charAt(0).toUpperCase() + k.slice(1)
  );
  const values = Object.values(weights);

  const data = {
    labels,
    datasets: [
      {
        label: 'Meaning Weights (θ)',
        data: values,
        backgroundColor: isDark ? 'rgba(108, 60, 181, 0.2)' : 'rgba(0, 102, 255, 0.12)',
        borderColor: isDark ? 'rgba(0, 255, 198, 0.8)' : 'rgba(0, 102, 255, 0.8)',
        borderWidth: 2,
        pointBackgroundColor: isDark ? 'rgba(0, 255, 198, 1)' : 'rgba(0, 102, 255, 1)',
        pointBorderColor: isDark ? '#1E2538' : '#fff',
        pointHoverBackgroundColor: isDark ? '#fff' : 'rgba(0, 102, 255, 1)',
        pointHoverBorderColor: isDark ? 'rgba(0, 255, 198, 1)' : 'rgba(0, 102, 255, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: true,
    scales: {
      r: {
        beginAtZero: true,
        max: 1,
        ticks: {
          stepSize: 0.2,
          color: isDark ? '#8a82a6' : '#475569',
          backdropColor: 'transparent',
          font: { size: 10 },
        },
        grid: {
          color: isDark ? 'rgba(108, 60, 181, 0.15)' : 'rgba(0, 102, 255, 0.08)',
        },
        angleLines: {
          color: isDark ? 'rgba(108, 60, 181, 0.15)' : 'rgba(0, 102, 255, 0.08)',
        },
        pointLabels: {
          color: isDark ? '#bdc3c7' : '#0F172A',
          font: { size: 11, family: 'Inter' },
        },
      },
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: isDark ? 'rgba(26, 16, 61, 0.9)' : 'rgba(255, 255, 255, 0.95)',
        titleColor: isDark ? '#00FFC6' : '#0066FF',
        bodyColor: isDark ? '#e8e4f0' : '#374151',
        borderColor: isDark ? 'rgba(108, 60, 181, 0.3)' : 'rgba(0, 102, 255, 0.15)',
        borderWidth: 1,
      },
    },
  };

  return (
    <div className={`max-w-xs mx-auto ${className}`}>
      <Radar data={data} options={options} />
    </div>
  );
}
