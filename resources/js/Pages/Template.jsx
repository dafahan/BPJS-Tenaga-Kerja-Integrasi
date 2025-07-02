// Template.jsx
import Layout from "@/js/Layouts/Layout.jsx";
import BarChart from "@/js/Components/BarChart"; 

function Template() {

  return (
    <div className="flex flex-col h-full w-[calc(100%-0.1rem)] border-secondary border-2 bg-primary p-4 justify-center gap-4 pt-8 relative">

    </div>
  );
}

Template.layout = (page) => <Layout children={page} />;
export default Template;
