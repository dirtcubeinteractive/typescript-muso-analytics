import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import './App.css';
import { addDays, addMonths, addYears, format, startOfWeek } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

interface ParticipationData {
  name?: string;
  ageGroup?: string;
  schoolName?: string;
  userCount: string;
  day?: string;
  week?: string;
  month?: string;
  year?: string;
}

interface ParticipationReport {
  userCountByMission?: ParticipationData[];
  userCountByAgeGroup?: ParticipationData[];
  userCountBySchool?: ParticipationData[];
}

const generateDateLabels = (startDate: string, endDate: string, aggregation: string): string[] => {
  let dateArray: string[] = [];
  let currentDate = new Date(startDate);

  while (currentDate <= new Date(endDate)) {
    if (aggregation === 'day') {
      dateArray.push(format(currentDate, 'yyyy-MM-dd'));
      currentDate = addDays(currentDate, 1);
    } else if (aggregation === 'week') {
      dateArray.push(format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
      currentDate = addDays(currentDate, 7);
    } else if (aggregation === 'month') {
      dateArray.push(format(currentDate, 'yyyy-MM'));
      currentDate = addMonths(currentDate, 1);
    } else if (aggregation === 'year') {
      dateArray.push(format(currentDate, 'yyyy'));
      currentDate = addYears(currentDate, 1);
    }
  }

  return dateArray;
};

const colorPalette = [
  'rgba(52, 152, 219, 0.8)',
  'rgba(46, 204, 113, 0.8)',
  'rgba(231, 76, 60, 0.8)',
  'rgba(155, 89, 182, 0.8)',
  'rgba(241, 196, 15, 0.8)',
  'rgba(230, 126, 34, 0.8)',
  'rgba(26, 188, 156, 0.8)',
  'rgba(127, 140, 141, 0.8)',
];

const fetchDataFromApi = async (aggregation: string, startDate: string, endDate: string): Promise<ParticipationReport> => {
  const response = await fetch('http://20.197.37.219:3000/v1/admin/analytics/get', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      entities: [
        {
          value: 'participation',
          filters: {
            timePeriod: { startDate, endDate },
            aggregation,
          },
        },
      ],
    }),
  });

  const data = await response.json();
  return data?.data?.participationReport || {};
};

const App: React.FC = () => {
  const [chartType, setChartType] = useState<'mission' | 'ageGroup' | 'school'>('mission');
  const [aggregation, setAggregation] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [data, setData] = useState<ParticipationReport>({});
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2025-10-01');

  useEffect(() => {
    const loadData = async () => {
      const apiData = await fetchDataFromApi(aggregation, startDate, endDate);
      setData(apiData);
    };
    loadData();
  }, [aggregation, startDate, endDate]);

  const dateLabels = generateDateLabels(startDate, endDate, aggregation);

  const mapDataToLabels = (labelArray: string[], dataList: ParticipationData[], aggregationKey: string): number[] => {
    return labelArray.map((label) => {
      const dataPoint = dataList.find((item) => {
        if (aggregationKey === 'day' && item.day) {
          return format(new Date(item.day), 'yyyy-MM-dd') === label;
        }
        if (aggregationKey === 'week' && item.week) {
          return format(new Date(item.week), 'yyyy-MM-dd') === label;
        }
        if (aggregationKey === 'month' && item.month) {
          return format(new Date(item.month), 'yyyy-MM') === label;
        }
        if (aggregationKey === 'year' && item.year) {
          return format(new Date(item.year), 'yyyy') === label;
        }
        return false;
      });
      return dataPoint ? parseInt(dataPoint.userCount, 10) : 0;
    });
  };

  const selectedData = 
    chartType === 'mission'
      ? data?.userCountByMission || []
      : chartType === 'ageGroup'
      ? data?.userCountByAgeGroup || []
      : data?.userCountBySchool || [];

  const uniqueCategories = Array.from(
    new Set(
      selectedData.map(
        (item) => item.name || item.ageGroup || item.schoolName
      )
    )
  );

  const chartData = {
    labels: dateLabels,
    datasets: uniqueCategories.map((category, index) => {
      return {
        label: category,
        data: mapDataToLabels(
          dateLabels,
          selectedData.filter(
            (item) => (item.name || item.ageGroup || item.schoolName) === category
          ),
          aggregation
        ),
        backgroundColor: colorPalette[index % colorPalette.length],
      };
    }),
  };

  const options = {
    responsive: true,
    scales: {
      x: {
        stacked: true,
        grid: {
          display: false, // This will remove the gridlines on the x-axis
        },
      },
      y: {
        stacked: true,
        grid: {
          display: false, // This will remove the gridlines on the y-axis
        },
        ticks: {
          beginAtZero: true,
          stepSize: 1, // Ensure the y-axis only shows integers
          callback: function (tickValue: string | number) {
            const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
            if (Number.isInteger(value)) {  // Only display integer values
              return value;
            }
            return null;
          },
        },
      },
    },
  };
  
  return (
    <div className="container">
      <div className="sidebar">
        <h2>Chart Options</h2>
        <label>Chart Type:</label>
        <select value={chartType} onChange={(e) => setChartType(e.target.value as 'mission' | 'ageGroup' | 'school')}>
          <option value="mission">User Count per Mission</option>
          <option value="ageGroup">User Count by Age Group</option>
          <option value="school">User Count by School</option>
        </select>

        <label>Aggregation:</label>
        <select value={aggregation} onChange={(e) => setAggregation(e.target.value as 'day' | 'week' | 'month' | 'year')}>
          <option value="day">Daily</option>
          <option value="week">Weekly</option>
          <option value="month">Monthly</option>
          <option value="year">Yearly</option>
        </select>

        <label>Start Date:</label>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />

        <label>End Date:</label>
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      <div className="chart-card">
        <h3>
          {chartType === 'mission'
            ? 'User Count by Mission'
            : chartType === 'ageGroup'
            ? 'User Count by Age Group'
            : 'User Count by School'}
        </h3>
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
}

export default App;
