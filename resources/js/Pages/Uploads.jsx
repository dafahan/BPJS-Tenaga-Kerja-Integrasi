import React, { useState, useEffect } from 'react';
import { Link, Head, usePage, router } from '@inertiajs/react'; // Import router here
import Layout from '../Layouts/Layout';
import { FaTrash } from "react-icons/fa";

function Uploads() {
  const [activeTab, setActiveTab] = useState('member'); // default tab is member
  const [memberFile, setMemberFile] = useState(null);
  const [transaksiFile, setTransaksiFile] = useState(null);
  const [transaksiDate, setTransaksiDate] = useState('');

  // File upload handlers
  const handleMemberFileChange = (e) => {
    setMemberFile(e.target.files[0]);
  };

  const handleTransaksiFileChange = (e) => {
    setTransaksiFile(e.target.files[0]);
  };

  const handleTransaksiDateChange = (e) => {
    setTransaksiDate(e.target.value);
  };

  const handleUpload = (type) => {
    if (type === 'member') {
      // Handle member file upload logic here
      console.log("Uploading member file:", memberFile);
    } else if (type === 'transaksi') {
      // Handle transaksi file upload logic here
      console.log("Uploading transaksi file:", transaksiFile);
      console.log("Transaksi date:", transaksiDate);
    }
  };

  return (
    <div className="flex flex-col h-full w-full border-secondary border-2 bg-primary p-4 justify-start sm:gap-2 pt-8 relative text-xs sm:text-lg">
         <Head title="Uploads" />
      {/* Tab Navigation */}
      <div className="flex justify-start mb-2">
        <button
          className={`px-4 py-2 border-secondary border-2 text-white ${activeTab === 'member' ? 'bg-secondary' : 'bg-primary'}`}
          onClick={() => setActiveTab('member')}
        >
          Member
        </button>
        <button
          className={`px-4 py-2 border-secondary border-2 text-white  ${activeTab === 'transaksi' ? 'bg-secondary' : 'bg-primary'}`}
          onClick={() => setActiveTab('transaksi')}
        >
          Transaksi
        </button>
      </div>

      {/* Member Tab */}
      {activeTab === 'member' && (
        <div>
          <div className="flex h-12 mb-4 border-2 border-secondary w-fit h-fit">
              <input
                type="file"
                accept=".xlsx, .csv"
                onChange={handleMemberFileChange}
                className="mb-4 h-full text-white"
              />
              <button
                onClick={() => handleUpload('member')}
                className="bg-info text-white px-4 py-2 rounded h-full"
              >
                Upload
              </button>
          </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">Log Upload</h1>


          {/* Example Table for Members */}
          <div className="overflow-x-auto">
                <table className="table-auto w-full bg-primary text-white mt-4 border-separate border-spacing-y-2">
                    <thead className="bg-secondary text-white">
                        <tr>
                            <th className="p-2">Date</th>
                            <th className="p-2">Data</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                      
                            <tr  className="hover:bg-secondary text-white text-center">
                                <td className="border-b border-gray-700 p-2"></td>
                                <td className="border-b border-gray-700 p-2"></td>
                                <td className="border-b border-gray-700 p-2 flex justify-center items-center">
                                    
                                    <button 
                                       
                                        className="bg-danger hover:opacity-50 text-white p-3 rounded"
                                    >
                                        <FaTrash color="white"  />
                                    </button>
                                    
                                    
                                </td>
                            </tr>
                   
                    </tbody>
                </table>
            </div>
        </div>
      )}

      {/* Transaksi Tab */}
      {activeTab === 'transaksi' && (
        <div>
           <div className="flex h-12 mb-4 border-2 border-secondary w-fit h-fit">
          <input
            type="file"
            accept=".xlsx, .csv"
            onChange={handleTransaksiFileChange}
            className="mb-4 h-full text-white"
          />
          <input
            type="date"
            value={transaksiDate}
            onChange={handleTransaksiDateChange}
            className="mb-4 h-full text-white bg-secondary"
            placeholder="Optional date"
          />
          <button
            onClick={() => handleUpload('transaksi')}
            className="bg-info text-white px-4 py-2 rounded"
          >
            Upload
          </button>
          </div>
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">Log Upload</h1>


          {/* Example Table for Transaksi */}
          <div className="overflow-x-auto">
                <table className="table-auto w-full bg-primary text-white mt-4 border-separate border-spacing-y-2">
                    <thead className="bg-secondary text-white">
                        <tr>
                            <th className="p-2">Date</th>
                            <th className="p-2">Data</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                      
                            <tr  className="hover:bg-secondary text-white text-center">
                                <td className="border-b border-gray-700 p-2"></td>
                                <td className="border-b border-gray-700 p-2"></td>
                                <td className="border-b border-gray-700 p-2 flex justify-center items-center">
                                    
                                    <button 
                                       
                                        className="bg-danger hover:opacity-50 text-white p-3 rounded"
                                    >
                                        <FaTrash color="white"  />
                                    </button>
                                    
                                    
                                </td>
                            </tr>
                   
                    </tbody>
                </table>
            </div>
        </div>
      )}
    </div>
  );
}

Uploads.layout = page => <Layout children={page} />;
export default Uploads;
