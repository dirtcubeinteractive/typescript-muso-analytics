// import React, { useState, useEffect } from 'react';
// import {
//   Chart as ChartJS,
//   CategoryScale,
//   LinearScale,
//   BarElement,
//   Title,
//   Tooltip,
//   Legend,
// } from 'chart.js';
// import { Bar } from 'react-chartjs-2';
// import './App.css';
// import { addDays, addMonths, addYears, format, startOfWeek } from 'date-fns';

// ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// interface ParticipationData {
//   name?: string;
//   ageGroup?: string;
//   schoolName?: string;
//   userCount: string;
//   day?: string;
//   week?: string;
//   month?: string;
//   year?: string;
// }

// interface ParticipationReport {
//   userCountByMission?: ParticipationData[];
//   userCountByAgeGroup?: ParticipationData[];
//   userCountBySchool?: ParticipationData[];
// }


// const generateDateLabels = (startDate: string, endDate: string, aggregation: string): string[] => {
//   let dateArray: string[] = [];
//   let currentDate = new Date(startDate);

//   while (currentDate <= new Date(endDate)) {
//     if (aggregation === 'day') {
//       dateArray.push(format(currentDate, 'yyyy-MM-dd'));
//       currentDate = addDays(currentDate, 1);
//     } else if (aggregation === 'week') {
//       dateArray.push(format(startOfWeek(currentDate, { weekStartsOn: 1 }), 'yyyy-MM-dd'));
//       currentDate = addDays(currentDate, 7);
//     } else if (aggregation === 'month') {
//       dateArray.push(format(currentDate, 'yyyy-MM'));
//       currentDate = addMonths(currentDate, 1);
//     } else if (aggregation === 'year') {
//       dateArray.push(format(currentDate, 'yyyy'));
//       currentDate = addYears(currentDate, 1);
//     }
//   }

//   return dateArray;
// };

// const colorPalette = [
//   'rgba(52, 152, 219, 0.8)',
//   'rgba(46, 204, 113, 0.8)',
//   'rgba(231, 76, 60, 0.8)',
//   'rgba(155, 89, 182, 0.8)',
//   'rgba(241, 196, 15, 0.8)',
//   'rgba(230, 126, 34, 0.8)',
//   'rgba(26, 188, 156, 0.8)',
//   'rgba(127, 140, 141, 0.8)',
// ];

// const fetchDataFromApi = async (aggregation: string, startDate: string, endDate: string): Promise<ParticipationReport> => {
//   const response = await fetch('http://20.197.37.219:3000/v1/admin/analytics/get', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/json',
//     },
//     body: JSON.stringify({
//       entities: [
//         {
//           value: 'participation',
//           filters: {
//             timePeriod: { startDate, endDate },
//             aggregation,
//           },
//         },
//       ],
//     }),
//   });

//   const data = await response.json();
//   return data?.data?.participationReport || {};
// };

// const App: React.FC = () => {
//   const [chartType, setChartType] = useState<'mission' | 'ageGroup' | 'school'>('mission');
//   const [aggregation, setAggregation] = useState<'day' | 'week' | 'month' | 'year'>('day');
//   const [data, setData] = useState<ParticipationReport>({});
//   const [startDate, setStartDate] = useState('2024-10-01');
//   const [endDate, setEndDate] = useState('2025-10-01');

//   useEffect(() => {
//     const loadData = async () => {
//       const apiData = await fetchDataFromApi(aggregation, startDate, endDate);
//       setData(apiData);
//     };
//     loadData();
//   }, [aggregation, startDate, endDate]);

//   const dateLabels = generateDateLabels(startDate, endDate, aggregation);

//   const mapDataToLabels = (labelArray: string[], dataList: ParticipationData[], aggregationKey: string): number[] => {
//     return labelArray.map((label) => {
//       const dataPoint = dataList.find((item) => {
//         if (aggregationKey === 'day' && item.day) {
//           return format(new Date(item.day), 'yyyy-MM-dd') === label;
//         }
//         if (aggregationKey === 'week' && item.week) {
//           return format(new Date(item.week), 'yyyy-MM-dd') === label;
//         }
//         if (aggregationKey === 'month' && item.month) {
//           return format(new Date(item.month), 'yyyy-MM') === label;
//         }
//         if (aggregationKey === 'year' && item.year) {
//           return format(new Date(item.year), 'yyyy') === label;
//         }
//         return false;
//       });
//       return dataPoint ? parseInt(dataPoint.userCount, 10) : 0;
//     });
//   };

//   const selectedData = 
//     chartType === 'mission'
//       ? data?.userCountByMission || []
//       : chartType === 'ageGroup'
//       ? data?.userCountByAgeGroup || []
//       : data?.userCountBySchool || [];

//   const uniqueCategories = Array.from(
//     new Set(
//       selectedData.map(
//         (item) => item.name || item.ageGroup || item.schoolName
//       )
//     )
//   );

//   const chartData = {
//     labels: dateLabels,
//     datasets: uniqueCategories.map((category, index) => {
//       return {
//         label: category,
//         data: mapDataToLabels(
//           dateLabels,
//           selectedData.filter(
//             (item) => (item.name || item.ageGroup || item.schoolName) === category
//           ),
//           aggregation
//         ),
//         backgroundColor: colorPalette[index % colorPalette.length],
//       };
//     }),
//   };

//   const options = {
//     responsive: true,
//     scales: {
//       x: {
//         stacked: true,
//         grid: {
//           display: false, // This will remove the gridlines on the x-axis
//         },
//       },
//       y: {
//         stacked: true,
//         grid: {
//           display: false, // This will remove the gridlines on the y-axis
//         },
//         ticks: {
//           beginAtZero: true,
//           stepSize: 1, // Ensure the y-axis only shows integers
//           callback: function (tickValue: string | number) {
//             const value = typeof tickValue === 'string' ? parseFloat(tickValue) : tickValue;
//             if (Number.isInteger(value)) {  // Only display integer values
//               return value;
//             }
//             return null;
//           },
//         },
//       },
//     },
//   };
  
//   return (
//     <div className="container">
//       <div className="sidebar">
//         <h2>Chart Options</h2>
//         <label>Chart Type:</label>
//         <select value={chartType} onChange={(e) => setChartType(e.target.value as 'mission' | 'ageGroup' | 'school')}>
//           <option value="mission">User Count per Mission</option>
//           <option value="ageGroup">User Count by Age Group</option>
//           <option value="school">User Count by School</option>
//         </select>

//         <label>Aggregation:</label>
//         <select value={aggregation} onChange={(e) => setAggregation(e.target.value as 'day' | 'week' | 'month' | 'year')}>
//           <option value="day">Daily</option>
//           <option value="week">Weekly</option>
//           <option value="month">Monthly</option>
//           <option value="year">Yearly</option>
//         </select>

//         <label>Start Date:</label>
//         <input
//           type="date"
//           value={startDate}
//           onChange={(e) => setStartDate(e.target.value)}
//         />

//         <label>End Date:</label>
//         <input
//           type="date"
//           value={endDate}
//           onChange={(e) => setEndDate(e.target.value)}
//         />
//       </div>

//       <div className="chart-card">
//         <h3>
//           {chartType === 'mission'
//             ? 'User Count by Mission'
//             : chartType === 'ageGroup'
//             ? 'User Count by Age Group'
//             : 'User Count by School'}
//         </h3>
//         <Bar data={chartData} options={options} />
//       </div>
//     </div>
//   );
// }

// export default App;



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
      console.log('Fetched Engagement Data:', result?.data?.engagementReport?.teamsPerMissionPercentage);
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
              backgroundColor: ['rgba(46, 204, 113, 0.8)', 'rgba(231, 76, 60, 0.8)'],
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
      console.log('Fetched Average Completion Data:', result?.data?.performanceReport?.averageTimePerMission);
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

  console.log('Mission Labels:', missionLabels);
  console.log('Average Times (in minutes):', averageTimesInMinutes);

  const chartData = {
    labels: missionLabels,
    datasets: [
      {
        label: 'Average Completion Time (MM:SS)',
        data: averageTimesInMinutes, // Using minutes for chart data to align with ticks
        backgroundColor: 'rgba(46, 204, 113, 0.8)',
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
          console.log(`Comparing key: ${key} with label: ${label} for category: ${category}`);
  
          // Compare the key with the label and ensure it matches the intended category
          return (
            key &&
            key === label && // Match the generated key with the current label in dateLabels
            (item.name === category || item.ageGroup === category || item.schoolName === category)
          );
        });
  
        // Debugging: log if a matching dataPoint is found or not
        console.log(`Data point for label ${label}, category ${category}:`, dataPoint);
  
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
          ? 'User Count by Mission'
          : chartType === 'ageGroup'
          ? 'User Count by Age Group'
          : 'User Count by School'}
      </h3>
  
  </div>
      <div className="config">
        <div>
          <label className="date-label">Aggregation:</label>
          <select value={aggregation} onChange={(e) => setAggregation(e.target.value as 'day' | 'week' | 'month' | 'year')}>
            <option value="day">Daily</option>
            <option value="week">Weekly</option>
            <option value="month">Monthly</option>
            <option value="year">Yearly</option>
          </select>
        </div>

        <div className="date-input-group">
          <div>
            <label className="date-label">Start Date:</label>
            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>

          <div>
            <label className="date-label">End Date:</label>
            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>
      </div>

      <Bar data={chartData} options={options} />

  
    </div>
  );
};


const App: React.FC = () => {
  return (
    <div className="container">
      <ChartCard title="User Count by Mission" chartType="mission" />
      <ChartCard title="User Count by Age Group" chartType="ageGroup" />
      {/* <ChartCard title="User Count by School" chartType="school" /> */}
      <AverageCompletionChartCard /> {/* New Average Completion Time Chart */}
     
      <CompletionPercentagePieChart /> {/* New Completion Percentage Pie Chart */}
    </div>

  );
};

export default App;
