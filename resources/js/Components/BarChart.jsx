// BarChart.jsx
import React from 'react';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const BarChart = ({ data }) => {
  const chartData = {
    labels: data.map(item => item.label), // Month and Year labels
    datasets: [
      {
        label: 'Income',
        data: data.map(item => item.value), // Income values
        backgroundColor: 'rgba(75, 192, 192, 0.6)', // Color of the bars
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Disable aspect ratio to make it fill the container
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Income',
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart;
