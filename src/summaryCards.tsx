import React, { useEffect, useState } from 'react';
import './summaryCards.css';

interface SummaryCardsProps {
  fetchTotalUsersUrl: string;
  fetchTotalMissionsUrl: string;
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ fetchTotalUsersUrl, fetchTotalMissionsUrl }) => {
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalMissions, setTotalMissions] = useState<number>(0);

  // Fetch total users count from the API
  const fetchTotalUsers = async () => {
    try {
      const response = await fetch(fetchTotalUsersUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          startDate: '1975-01-01',
          endDate: '1975-01-02',
        }),
      });
      const data = await response.json();
      setTotalUsers(data?.data?.usersCount || 0);
    } catch (error) {
      console.error('Error fetching total users:', error);
    }
  };

  // Fetch total missions count using the existing participation API
  const fetchTotalMissions = async () => {
    try {
      const response = await fetch(fetchTotalMissionsUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          entities: [
            {
              value: 'participation',
              filters: {
                timePeriod: { startDate: '1975-01-01', endDate: '1975-01-02' },
                aggregation: "day"
              },
            },
          ],
        }),
      });
      const data = await response.json();
      const missionsData = data?.data?.participationReport?.userCountByMission || [];
      const uniqueMissions = new Set(missionsData.map((item: any) => item.name));
      setTotalMissions(uniqueMissions.size);
    } catch (error) {
      console.error('Error fetching total missions:', error);
    }
  };

  useEffect(() => {
    fetchTotalUsers();
    fetchTotalMissions();
  }, []);

  return (
    <div className="summary-cards-container">
      <div className="summary-card">
        <h4>Total Players</h4>
        <p>{totalUsers}</p>
      </div>
      <div className="summary-card">
        <h4>Total Missions</h4>
        <p>{totalMissions}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
