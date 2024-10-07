import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Pie } from 'react-chartjs-2';
import './App.css';
import { addDays, addMonths, addYears, format, startOfWeek } from 'date-fns';
import SummaryCards from './summaryCards';
import GenerateReport from './GenerateReport';



ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Title, Tooltip, Legend);

// Component for Completion Percentage Pie Chart
const CompletionPercentagePieChart: React.FC = () => {
  const [data, setData] = useState<{ id: string; name: string; totalTeams: number; completedTeams: number; completionPercentage: number }[]>([]);
  const [selectedMission, setSelectedMission] = useState<string>('');
  const [chartData, setChartData] = useState<any>(null);


  useEffect(() => {
    const fetchEngagementData = async () => {
      const response = await fetch('http://20.197.37.219:3000/v1/admin/analytics/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entities: [
            {
              value: 'engagement',
              filters: {},
            },
          ],
        }),
      });

      const result = await response.json();
   
      const fetchedData = result?.data?.engagementReport?.teamsPerMissionPercentage || [];
      setData(fetchedData);

      // Automatically set the first mission as the default selected mission
      if (fetchedData.length > 0) {
        setSelectedMission(fetchedData[0].name); // Set the first mission as the selected mission
      }
    };

    fetchEngagementData();
  }, []);

  useEffect(() => {
    if (selectedMission) {
      const selectedData = data.find((item) => item.name === selectedMission);

      if (selectedData && selectedData.totalTeams > 0) {
        setChartData({
          labels: ['Completed Teams', 'Incomplete Teams'],
          datasets: [
            {
              data: [selectedData.completedTeams, selectedData.totalTeams - selectedData.completedTeams],
              backgroundColor: ['rgba(94, 89, 255, 0.8)', 'rgba(255, 107, 107, 0.8)'],
              hoverOffset: 4,
            },
          ],
        });
      } else {
        setChartData(null); // No data to display for this mission
      }
    }
  }, [selectedMission, data]);

  return (
    <div className="chart-card">
    <h3 className="chart-title">Completion Percentage per Mission</h3>
    <div className="config">
      <div>
        
        <select value={selectedMission} onChange={(e) => setSelectedMission(e.target.value)}>
          <option value="">Select a Mission</option>
          {data.map((mission) => (
            <option key={mission.id} value={mission.name}>
              {mission.name}
            </option>
          ))}
        </select>
      </div>
    </div>
    <div className="chart-wrapper">
      {chartData ? (
        <div className="pie-chart-container">
          <Pie
            data={chartData}
            options={{
              responsive: true,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => `${context.label}: ${context.raw} teams`,
                  },
                },
              },
            }}
          />
        </div>
      ) : (
        <p style={{ textAlign: 'center', marginTop: '20px', color: '#6c757d' }}>No data to display</p>
      )}
    </div>
  </div>
  
  );
};




// Component for Average Completion Time
const AverageCompletionChartCard: React.FC = () => {
  const [data, setData] = useState<{ missionName: string; averageTimeSpent: string }[]>([]);

  useEffect(() => {
    const fetchAverageCompletionData = async () => {
      const response = await fetch('http://20.197.37.219:3000/v1/admin/analytics/get', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entities: [
            {
              value: 'performance',
              filters: {},
            },
          ],
        }),
      });

      const result = await response.json();
   
      setData(result?.data?.performanceReport?.averageTimePerMission || []);
    };

    fetchAverageCompletionData();
  }, []);

  // Helper function to convert milliseconds to MM:SS format
  const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Format as MM:SS
  };

  const missionLabels = data.map((item) => item.missionName);
  const averageTimesInMinutes = data.map((item) => parseFloat(item.averageTimeSpent) / 60000); // Convert milliseconds to minutes for data



  const chartData = {
    labels: missionLabels,
    datasets: [
      {
        label: 'Average Completion Time (MM:SS)',
        data: averageTimesInMinutes, // Using minutes for chart data to align with ticks
        backgroundColor: 'rgba(94, 89, 255, 0.8)',
      },
    ],
  };

  const options = {
    responsive: true,
    indexAxis: 'y' as const, // Horizontal bar chart
    scales: {
      x: {
        grid: {
          display: false, // Remove grid lines from the x-axis
        },
        title: {
          display: true,
          text: 'Completion Time (minutes)',
          font: {
            size: 14,
            weight: 'bold' as 'normal' | 'bold' | 'bolder' | 'lighter' | number,
          },
        },
        ticks: {
          callback: (tickValue: string | number) => {
            if (typeof tickValue === 'number') {
              const minutes = Math.floor(tickValue);
              const seconds = Math.round((tickValue - minutes) * 60);
              return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Display as MM:SS format on ticks
            }
            return tickValue;
          },
        },
      },
      y: {
        grid: {
          display: false, // Remove grid lines from the y-axis
        },
        title: {
          display: true,
          text: 'Missions',
          font: {
            size: 14,
            weight: 'bold' as 'normal' | 'bold' | 'bolder' | 'lighter' | number,
          },
        },
      },
    },
    plugins: {
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const valueInSeconds = context.raw * 60; // Convert minutes back to seconds for the tooltip
            return `Time: ${formatTime(valueInSeconds * 1000)}`; // Display MM:SS in the tooltip
          },
        },
      },
    },
  };

  return (
    <div className="chart-card">
      <h3 className="chart-title">Average Completion Time per Mission</h3>
      <Bar data={chartData} options={options} />
    </div>
  );
};



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
const convertToIST = (utcDateString: string): Date => {
  const utcDate = new Date(utcDateString);
  const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (UTC + 5:30)
  return new Date(utcDate.getTime() + istOffset);
};
// Simulate fetching total users from a temporary API
const fetchTotalUsers = async (): Promise<number> => {
  // Simulated value for total users
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(150); // Simulated total users value
    }, 500); // Simulate a slight delay
  });
};



const generateDateLabels = (startDate: string, endDate: string, aggregation: string): string[] => {
  let dateArray: string[] = [];
  let currentDate = convertToIST(startDate);

  while (currentDate < convertToIST(endDate)) {
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
  'rgba(94, 89, 255, 0.8)',   // Purple from the theme (primary main)
  'rgba(78, 205, 196, 0.8)',  // Teal (soft and muted for balance)
  'rgba(255, 107, 107, 0.8)', // Soft red (keeping it muted to match the style)
  'rgba(255, 206, 84, 0.8)',  // Yellow-orange (a flat tone to match the theme)
  'rgba(129, 236, 236, 0.8)', // Light cyan (keeping it in the pastel range)
  'rgba(162, 155, 254, 0.8)', // Lighter lavender (to blend with the theme)
  'rgba(85, 239, 196, 0.8)',  // Mint green (flat and complementary to purple)
  'rgba(223, 230, 233, 0.8)', // Light grey (neutral to balance the others)
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




// Reusable Chart Component
const ChartCard: React.FC<{
  title: string;
  chartType: 'mission' | 'ageGroup' | 'school';
}> = ({ title, chartType }) => {
  const [aggregation, setAggregation] = useState<'day' | 'week' | 'month' | 'year'>('day');
  const [startDate, setStartDate] = useState('2024-10-01');
  const [endDate, setEndDate] = useState('2025-10-01');
  const [data, setData] = useState<ParticipationData[]>([]);
 
 
  useEffect(() => {
    const loadData = async () => {
      const apiData = await fetchDataFromApi(aggregation, startDate, endDate);
      if (chartType === 'mission') {
        setData(apiData?.userCountByMission || []);
      } else if (chartType === 'ageGroup') {
        setData(apiData?.userCountByAgeGroup || []);
      } else {
        setData(apiData?.userCountBySchool || []);
      }
    };
    loadData();
  }, [aggregation, startDate, endDate, chartType]);

  const dateLabels = generateDateLabels(startDate, endDate, aggregation);

  const uniqueCategories = Array.from(new Set(data.map((item) => item.name || item.ageGroup || item.schoolName)));

  const chartData = {
    labels: dateLabels,
    datasets: uniqueCategories.map((category, index) => ({
      label: category,
      data: dateLabels.map((label) => {
        // Adjust key extraction based on the aggregation type
        const dataPoint = data.find((item) => {
          let key: string = ''; // Ensure key is always a string
  
          // Use the correct field for each aggregation type and convert to IST before formatting
          if (aggregation === 'day' && item.day) {
            key = format(convertToIST(item.day), 'yyyy-MM-dd'); // For daily data
          } else if (aggregation === 'week' && item.week) {
            key = format(convertToIST(item.week), 'yyyy-MM-dd'); // For weekly data
          } else if (aggregation === 'month' && item.month) {
            key = format(convertToIST(item.month), 'yyyy-MM'); // For monthly data
          } else if (aggregation === 'year' && item.year) {
            key = format(convertToIST(item.year), 'yyyy'); // For yearly data
          }
  
          // Debugging: log the key and label being compared to understand what's happening
        
  
          // Compare the key with the label and ensure it matches the intended category
          return (
            key &&
            key === label && // Match the generated key with the current label in dateLabels
            (item.name === category || item.ageGroup === category || item.schoolName === category)
          );
        });
  
        // Debugging: log if a matching dataPoint is found or not
    
  
        // Return the user count for the matched dataPoint, or 0 if no match is found
        return dataPoint ? parseInt(dataPoint.userCount, 10) : 0;
      }),
      backgroundColor: colorPalette[index % colorPalette.length],
    })),
  };
  


  const options = {
    responsive: true,
    scales: {
      x: { stacked: true, grid: { display: false } },
      y: { stacked: true, grid: { display: false }, ticks: { stepSize: 1, beginAtZero: true } },
    },
  };
  return (
    <div className="chart-card">
      <div className="chart-header">
      <h3 className="chart-title">
        {chartType === 'mission'
          ? 'Player Count by Mission'
          : chartType === 'ageGroup'
          ? 'Player Count by Age Group'
          : 'Player Count by School'}
      </h3>
  
  </div>
      <div className="config">
        <div>
         
          <select value={aggregation} onChange={(e) => setAggregation(e.target.value as 'day' | 'week' | 'month' | 'year')}>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        <div className="date-input-group">
          <div>
           
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
  {/* Separator between dates */}
  <span className="date-separator">to</span> 
          <div>
           
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      <Bar data={chartData} options={options} />

  
    </div>
  );
};


const App: React.FC = () => {
  const [isReportPopupVisible, setReportPopupVisible] = useState(false);

  const handleGenerateReportClick = () => {
    setReportPopupVisible(true); // Show the report popup when the button is clicked
  };
  return (
    <div className="app-container">
     {/* Report Generation Section */}
     <div className="report-generation-section">
        <button className="generate-report-button" onClick={handleGenerateReportClick}>
          Generate Report
        </button>
      </div>

      {/* Render the GenerateReport popup if visible */}
      {isReportPopupVisible && (
        <GenerateReport onClose={() => setReportPopupVisible(false)} />
      )}

      {/* Summary Section */}
      <div className="summary-section">
        <SummaryCards
          fetchTotalUsersUrl="http://20.197.37.219:3000/v1/admin/analytics/get-users"
          fetchTotalMissionsUrl="http://20.197.37.219:3000/v1/admin/analytics/get"
        />
      </div>

      {/* Charts Section */}
      <div className="charts-section">
        <ChartCard title="User Count by Mission" chartType="mission" />
        <ChartCard title="User Count by Age Group" chartType="ageGroup" />
        <AverageCompletionChartCard />
        <CompletionPercentagePieChart />
      </div>
    </div>
  );
};


export default App;
