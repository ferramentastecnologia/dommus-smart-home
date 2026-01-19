import { Box } from '@mui/material';
import { LeadStatus } from '@/types/Lead';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import { Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface LeadStatusChartProps {
  data: Record<LeadStatus, number>;
}

export const LeadStatusChart = ({ data }: LeadStatusChartProps) => {
  const chartData = {
    labels: Object.keys(data).map(status => status.replace('_', ' ').toUpperCase()),
    datasets: [
      {
        label: 'Number of Leads',
        data: Object.values(data),
        backgroundColor: [
          'rgba(75, 192, 192, 0.6)', // new
          'rgba(54, 162, 235, 0.6)', // in progress
          'rgba(255, 206, 86, 0.6)', // qualified
          'rgba(75, 192, 192, 0.6)', // closed won
          'rgba(255, 99, 132, 0.6)', // closed lost
        ],
        borderColor: [
          'rgba(75, 192, 192, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 99, 132, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: false,
      },
    },
  };

  return (
    <Box height={300}>
      <Bar data={chartData} options={options} />
    </Box>
  );
}; 