import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { format } from 'date-fns';
import './GenerateReport.css';

interface GenerateReportProps {
  onClose: () => void; // Function to close the popup
}

const GenerateReport: React.FC<GenerateReportProps> = ({ onClose }) => {
  const [reportType, setReportType] = useState('participation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Function to convert UTC date to IST
  const convertToIST = (utcDateString: string): string => {
    const utcDate = new Date(utcDateString);
    const istOffset = 5.5 * 60 * 60 * 1000; // IST offset in milliseconds (UTC + 5:30)
    const istDate = new Date(utcDate.getTime() + istOffset);
    return format(istDate, 'yyyy-MM-dd'); // Format to only date without timestamp
  };
// Helper function to convert milliseconds to MM:SS format
const formatTime = (milliseconds: number) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; // Format as MM:SS
  };
  
  // Function to fetch user data for the Users sheet
  const fetchUsersData = async () => {
    try {
      const response = await fetch('http://20.197.37.219:3000/v1/admin/analytics/get-users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ startDate, endDate }),
      });
      const data = await response.json();
      return data?.data?.users || [];
    } catch (error) {
      console.error('Error fetching users data:', error);
      return [];
    }
  };

  // Function to fetch participation data for the User Count sheets
  const fetchParticipationData = async () => {
    try {
      const response = await fetch('http://20.197.37.219:3000/v1/admin/analytics/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entities: [
            {
              value: 'participation',
              filters: {
                timePeriod: { startDate, endDate },
                aggregation: 'week',
              },
            },
          ],
        }),
      });
      const data = await response.json();
      return data?.data?.participationReport || {};
    } catch (error) {
      console.error('Error fetching participation data:', error);
      return {};
    }
  };

  // Function to fetch question analytics data for the Performance report
  const fetchQuestionAnalyticsData = async () => {
    try {
      const response = await fetch('http://20.197.37.219:3000/v1/admin/analytics/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entities: [{ value: 'question', filters: { timePeriod: { startDate, endDate } } }],
        }),
      });
      const data = await response.json();
      return data?.data?.questionAnalytics?.questionAnswered || [];
    } catch (error) {
      console.error('Error fetching question analytics data:', error);
      return [];
    }
  };

  // Function to fetch mission completion time data for the Performance report
  const fetchMissionCompletionTimeData = async () => {
    try {
      const response = await fetch('http://20.197.37.219:3000/v1/admin/analytics/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entities: [{ value: 'performance', filters: { timePeriod: { startDate, endDate } } }],
        }),
      });
      const data = await response.json();
      return data?.data?.performanceReport?.averageTimePerMission || [];
    } catch (error) {
      console.error('Error fetching mission completion time data:', error);
      return [];
    }
  };

  // Function to fetch mission completion percentage data for the Performance report
  const fetchMissionCompletionPercentageData = async () => {
    try {
      const response = await fetch('http://20.197.37.219:3000/v1/admin/analytics/get', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entities: [{ value: 'engagement', filters: { timePeriod: { startDate, endDate } } }],
        }),
      });
      const data = await response.json();
      return data?.data?.engagementReport?.teamsPerMissionPercentage || [];
    } catch (error) {
      console.error('Error fetching mission completion percentage data:', error);
      return [];
    }
  };

  // Function to set column headers to bold and adjust column width
  const setSheetStyles = (worksheet: XLSX.WorkSheet) => {
    const range = XLSX.utils.decode_range(worksheet['!ref'] || '');
    const columnWidths = Array(range.e.c + 1).fill({ wpx: 150 }); // Adjust the width as needed
    worksheet['!cols'] = columnWidths;
  };

  const handleGenerate = async () => {
    if (!startDate || !endDate) {
        setError('Please enter both start date and end date.'); // Set error message if dates are missing
        return;
      }
  
      setLoading(true);
      setError(null); // Clear any existing error message
  
      try {
      if (reportType === 'participation') {
        const usersData = await fetchUsersData();
        const participationData = await fetchParticipationData();

        const usersSheetData = usersData.map((user: any) => ({
          'First Name': user.firstName || 'N/A',
          'Last Name': user.lastName || 'N/A',
          'School Name': user.schoolName || 'N/A',
          'Birthdate': user.birthdate ? convertToIST(user.birthdate) : 'N/A',
          'Email': user.email || 'N/A',
          'Mobile No': user.mobileNo || 'N/A',
          'Age': user.age || 'N/A',
          'Team Name': user.teams?.[0]?.name || 'N/A',
          'Mission Name': user.teams?.[0]?.mission?.name || 'N/A',
          'Created At': convertToIST(user.createdAt),
        }));

        const userCountByMissionData = (participationData.userCountByMission || []).filter(
          (item: any) => item.userCount > 0
        ).map((item: any) => ({
          'Mission Name': item.name || 'N/A',
          'Week': convertToIST(item.week),
          'User Count': item.userCount,
        }));

        const userCountByAgeGroupData = (participationData.userCountByAgeGroup || []).filter(
          (item: any) => item.userCount > 0
        ).map((item: any) => ({
          'Age Group': item.ageGroup || 'N/A',
          'Week': convertToIST(item.week),
          'User Count': item.userCount,
        }));

        const workbook = XLSX.utils.book_new();
        const usersSheet = XLSX.utils.json_to_sheet(usersSheetData);
        const missionSheet = XLSX.utils.json_to_sheet(userCountByMissionData);
        const ageGroupSheet = XLSX.utils.json_to_sheet(userCountByAgeGroupData);

        setSheetStyles(usersSheet);
        setSheetStyles(missionSheet);
        setSheetStyles(ageGroupSheet);

        XLSX.utils.book_append_sheet(workbook, usersSheet, 'Users');
        XLSX.utils.book_append_sheet(workbook, missionSheet, 'User Count by Mission');
        XLSX.utils.book_append_sheet(workbook, ageGroupSheet, 'User Count by Age Group');

        XLSX.writeFile(workbook, 'Participation_Report.xlsx');
      } else if (reportType === 'performance') {
        const questionAnalyticsData = await fetchQuestionAnalyticsData();
        const missionCompletionTimeData = await fetchMissionCompletionTimeData();
        const missionCompletionPercentageData = await fetchMissionCompletionPercentageData();

        const questionAnalyticsSheetData = questionAnalyticsData.map((item: any) => ({
          'Question Name': item.question?.text || 'N/A',
          'Mission Name': item.question?.mission?.name || 'N/A',
          'Total Answers': item.totalAnswers,
          'Correct Answers': item.correctAnswers,
          'Correct Percentage': item.correctPercentage + '%',
        }));

        const missionCompletionTimeSheetData = missionCompletionTimeData.map((item: any) => ({
          'Mission Name': item.missionName || 'N/A',
          'Average Completion Time': formatTime(parseFloat(item.averageTimeSpent)),
        }));

        const missionCompletionPercentageSheetData = missionCompletionPercentageData.map((item: any) => ({
          'Mission Name': item.name || 'N/A',
          'Total Teams': item.totalTeams,
          'Completed Teams': item.completedTeams,
          'Completion Percentage': item.completionPercentage + '%',
        }));

        const workbook = XLSX.utils.book_new();
        const questionAnalyticsSheet = XLSX.utils.json_to_sheet(questionAnalyticsSheetData);
        const missionCompletionTimeSheet = XLSX.utils.json_to_sheet(missionCompletionTimeSheetData);
        const missionCompletionPercentageSheet = XLSX.utils.json_to_sheet(missionCompletionPercentageSheetData);

        setSheetStyles(questionAnalyticsSheet);
        setSheetStyles(missionCompletionTimeSheet);
        setSheetStyles(missionCompletionPercentageSheet);

        XLSX.utils.book_append_sheet(workbook, questionAnalyticsSheet, 'Question Analytics');
        XLSX.utils.book_append_sheet(workbook, missionCompletionTimeSheet, 'Mission Completion Time');
        XLSX.utils.book_append_sheet(workbook, missionCompletionPercentageSheet, 'Mission Completion Percentage');

        XLSX.writeFile(workbook, 'Performance_Report.xlsx');
    }
} catch (error) {
  console.error('Error generating the report:', error);
} finally {
  setLoading(false);
  onClose();
}
};

  return (
    <div className="generate-report-popup">
      <div className="generate-report-content">
      <h3>Generate Report</h3>
        <div className="form-group">
          <label>Report Type</label>
          <select value={reportType} onChange={(e) => setReportType(e.target.value)}>
            <option value="participation">Participation Report</option>
            <option value="performance">Performance Report</option>
          </select>
        </div>
        <div className="form-group">
          <label>Start Date</label>
          <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <div className="form-actions">
          <button className="generate-button" onClick={handleGenerate} disabled={loading}>
            {loading ? 'Generating...' : 'Generate'}
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        
        </div>
        {error && <p className="error-message">{error}</p>} {/* Display error message if any */}
      </div>
    </div>
  );
};

export default GenerateReport;
