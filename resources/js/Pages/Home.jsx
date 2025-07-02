// Home.jsx
import Layout from "../Layouts/Layout";
import BarChart from "@/js/Components/BarChart"; 

function Home() {
  // Sample data for the bar chart
  const incomeData = [
    { label: 'June 2024', value: 5000 },
    { label: 'July 2024', value: 7000 },
    { label: 'August 2024', value: 6500 },
    { label: 'September 2024', value: 8000 },
    { label: 'October 2024', value: 6000 },
    // Add more months as needed
  ];

  return (
    <div className="flex flex-col h-full w-[calc(100%-0.1rem)] border-secondary border-2 bg-primary p-4 justify-center gap-4 pt-8 relative">
      <h1 className="text-white text-2xl top-12 sm:top-24 left-8 absolute">Income Overview</h1>
      <div className="flex w-full h-2/3">
        <BarChart data={incomeData} /> {/* Include the BarChart here */}
      </div>
    </div>
  );
}

Home.layout = (page) => <Layout children={page} />;
export default Home;
