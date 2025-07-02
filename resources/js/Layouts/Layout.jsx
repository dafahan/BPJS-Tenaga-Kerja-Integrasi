import React, { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import {
  FaHome, FaCog, FaSignOutAlt, FaTasks, FaBars, FaTimes,
  FaUsers, FaUserMd, FaClipboardList, FaUserTie, FaHistory,
  FaChevronDown, FaChevronRight, FaDatabase, FaFileInvoiceDollar, 
  FaCogs, FaPills, FaStethoscope, FaHospital, FaMoneyBillWave,
  FaFileAlt, FaPrint, FaCheckCircle, FaTimesCircle, FaEye
} from 'react-icons/fa';
import HospitalLogo from '@/assets/Logo_RSI.jpg'; 
import BPJSLogo from '@/assets/Logo_BPJS.svg'; 

const Layout = ({ children }) => {
  const { authenticatedUser } = usePage().props;
  const url = usePage().url;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({}); // Track which menus are expanded

  const userRole = authenticatedUser?.role || 'user';

  const isActive = (path) => {
    if (path === '/dashboard') return url === '/dashboard';
    return url === path || url.startsWith(`${path}/`) || url.startsWith(`${path}?`);
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);
  const handleLogout = () => router.get('/logout');

  const toggleMenu = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  // Helper function to check if user has access to a menu item
  const hasAccess = (roles) => {
    // If roles include '*', grant access to all users
    if (roles.includes('*')) return true;
    // Otherwise, check if user has any of the required roles
    return roles.includes(userRole);
  };

  const sidebarMenus = [
    { 
      name: 'Dashboard', 
      path: '/dashboard', 
      icon: <FaHome />, 
      roles: ['*'], 
      type: 'single'
    },
    {
      name: 'Master Data',
      icon: <FaDatabase />,
      roles: ['admin_rs'],
      type: 'group',
      key: 'master_data',
      children: [
        { name: 'Categories', path: '/categories', icon: <FaHospital />, roles: ['admin_rs'] },
        { name: 'Services', path: '/services', icon: <FaStethoscope />, roles: ['admin_rs'] },
        { name: 'Medicines', path: '/medicines', icon: <FaPills />, roles: ['admin_rs'] },
        { name: 'Actions/Procedures', path: '/actions', icon: <FaTasks />, roles: ['admin_rs'] },
      ]
    },
    {
      name: 'Patient Management',
      icon: <FaUserMd />,
      roles: ['admin_rs'],
      type: 'group',
      key: 'patient_management',
      children: [
        { name: 'Patients', path: '/patients', icon: <FaUsers />, roles: ['admin_rs'] },
        { name: 'Medical Records', path: '/medical-records', icon: <FaClipboardList />, roles: ['admin_rs'] },
        { name: 'New Medical Record', path: '/medical-records/create', icon: <FaFileAlt />, roles: ['admin_rs'] },
      ]
    },
    {
      name: 'Billing & Invoice',
      icon: <FaFileInvoiceDollar />,
      roles: ['*'],
      type: 'group',
      key: 'billing',
      children: [
        { name: 'Create Invoice', path: '/invoices/create', icon: <FaFileAlt />, roles: ['admin_rs'] },
        { name: 'Draft Invoices', path: '/invoices/draft', icon: <FaFileAlt />, roles: ['admin_rs'] },
        { name: 'Submitted Invoices', path: '/invoices/submitted', icon: <FaMoneyBillWave />, roles: ['*'] },
        { name: 'Pending Approval', path: '/invoices/pending', icon: <FaEye />, roles: ['admin_bpjs'] },
        { name: 'Approved Invoices', path: '/invoices/approved', icon: <FaCheckCircle />, roles: ['*'] },
        { name: 'Rejected Invoices', path: '/invoices/rejected', icon: <FaTimesCircle />, roles: ['*'] },
        { name: 'All Invoices', path: '/invoices', icon: <FaClipboardList />, roles: ['*'] },
      ]
    },
    {
      name: 'Reports & Print',
      icon: <FaPrint />,
      roles: ['*'],
      type: 'group',
      key: 'reports',
      children: [
        { name: 'Invoice Reports', path: '/reports/invoices', icon: <FaFileInvoiceDollar />, roles: ['*'] },
        { name: 'Patient Reports', path: '/reports/patients', icon: <FaUserMd />, roles: ['admin_rs'] },
        { name: 'Billing Summary', path: '/reports/billing-summary', icon: <FaMoneyBillWave />, roles: ['*'] },
        { name: 'Print Templates', path: '/reports/templates', icon: <FaPrint />, roles: ['admin_rs'] },
      ]
    },
    {
      name: 'BPJS Management',
      icon: <FaUserTie />,
      roles: ['admin_bpjs'],
      type: 'group',
      key: 'bpjs_management',
      children: [
        { name: 'Review Submissions', path: '/bpjs/submissions', icon: <FaEye />, roles: ['admin_bpjs'] },
        { name: 'Approval Queue', path: '/bpjs/approval-queue', icon: <FaTasks />, roles: ['admin_bpjs'] },
        { name: 'Payment Processing', path: '/bpjs/payments', icon: <FaMoneyBillWave />, roles: ['admin_bpjs'] },
        { name: 'BPJS Reports', path: '/bpjs/reports', icon: <FaFileAlt />, roles: ['admin_bpjs'] },
      ]
    },
    {
      name: 'System',
      icon: <FaCogs />,
      roles: ['*'],
      type: 'group',
      key: 'system',
      children: [
        { name: 'Activity Logs', path: '/logs', icon: <FaHistory />, roles: ['*'] },
        { name: 'Settings', path: '/settings', icon: <FaCog />, roles: ['*'] },
        { name: 'User Profile', path: '/profile', icon: <FaUsers />, roles: ['*'] },
      ]
    }
  ];

  // Filter menus and their children by user roles
  const visibleMenus = sidebarMenus.filter(menu => {
    if (menu.type === 'single') {
      return hasAccess(menu.roles);
    } else if (menu.type === 'group') {
      // Check if user has access to any child menu
      const hasAccessToChildren = menu.children.some(child => hasAccess(child.roles));
      return hasAccessToChildren;
    }
    return false;
  }).map(menu => {
    if (menu.type === 'group') {
      // Filter children by user roles
      return {
        ...menu,
        children: menu.children.filter(child => hasAccess(child.roles))
      };
    }
    return menu;
  });

  const renderMenuItem = (item) => {
    if (item.type === 'single') {
      return (
        <Link
          key={item.name}
          href={item.path}
          onClick={closeSidebar}
          className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all hover:bg-blue-100 ${
            isActive(item.path) ? 'bg-blue-200 text-blue-800' : 'text-gray-700'
          }`}
        >
          {item.icon} {item.name}
        </Link>
      );
    } else if (item.type === 'group') {
      const isExpanded = expandedMenus[item.key];
      const hasActiveChild = item.children.some(child => isActive(child.path));
      
      return (
        <div key={item.name} className="space-y-1">
          <button
            onClick={() => toggleMenu(item.key)}
            className={`w-full flex items-center justify-between gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all hover:bg-blue-100 ${
              hasActiveChild ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
            }`}
          >
            <div className="flex items-center gap-3">
              {item.icon} {item.name}
            </div>
            {isExpanded ? <FaChevronDown className="w-3 h-3" /> : <FaChevronRight className="w-3 h-3" />}
          </button>
          
          {isExpanded && (
            <div className="ml-4 space-y-1">
              {item.children.map(child => (
                <Link
                  key={child.name}
                  href={child.path}
                  onClick={closeSidebar}
                  className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm transition-all hover:bg-blue-100 ${
                    isActive(child.path) ? 'bg-blue-200 text-blue-800 font-medium' : 'text-gray-600'
                  }`}
                >
                  {child.icon} {child.name}
                </Link>
              ))}
            </div>
          )}
        </div>
      );
    }
  };

  // Determine which logo to show based on user role
  const getLogo = () => {
    if (userRole === 'admin_bpjs') {
      return BPJSLogo;
    }
    return HospitalLogo;
  };

  const getAppName = () => {
    if (userRole === 'admin_bpjs') {
      return 'BPJS Admin Portal';
    }
    return 'Hospital Billing System';
  };

  return (
    <div className="flex flex-col h-screen">
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={`
          fixed lg:static inset-y-0 left-0 z-30
          w-64 bg-white shadow-lg flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          <div className="flex items-center justify-between h-16 lg:h-20 border-b px-4">
            <div className="flex items-center gap-3">
              <img src={getLogo()} alt={getAppName()} className="h-8 lg:h-10" />
              <div className="hidden lg:block">
                <div className="text-sm font-semibold text-gray-800">{getAppName()}</div>
                <div className="text-xs text-gray-500 capitalize">{userRole?.replace('_', ' ')}</div>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 rounded-md hover:bg-gray-100"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium ${
                userRole === 'admin_bpjs' ? 'bg-green-500' : 'bg-blue-500'
              }`}>
                {authenticatedUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <div className="text-sm font-medium text-gray-800">{authenticatedUser?.name}</div>
                <div className="text-xs text-gray-500 capitalize">{userRole?.replace('_', ' ')}</div>
              </div>
            </div>
          </div>

          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {visibleMenus.map(renderMenuItem)}
          </nav>
          
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 text-sm px-4 py-2 text-red-600 hover:bg-red-100 rounded-md"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Mobile Navbar */}
          <header className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <FaBars className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src={getLogo()} alt={getAppName()} className="h-8" />
              <span className="text-sm font-medium">{getAppName()}</span>
            </div>
            <div className="w-9" />
          </header>

          <main className="flex-1 overflow-y-auto bg-gray-100">
            <div className="p-4 lg:p-6">
              {children}
            </div>
          </main>

          <footer className="bg-white border-t px-4 py-3 text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Hospital-BPJS Billing System. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;