import React, { useState } from 'react';
import './GenerateReport.css';

interface GenerateReportProps {
  onClose: () => void; // Function to close the popup
}

const GenerateReport: React.FC<GenerateReportProps> = ({ onClose }) => {
  const [reportType, setReportType] = useState('participation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGenerate = () => {
    console.log(`Generating ${reportType} report from ${startDate} to ${endDate}`);
    onClose(); // Close the popup after generating the report
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
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>End Date</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <div className="form-actions">
          <button className="generate-button" onClick={handleGenerate}>
            Generate
          </button>
          <button className="cancel-button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateReport;
