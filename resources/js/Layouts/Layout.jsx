import React, { useState } from 'react';
import { usePage, router, Link } from '@inertiajs/react';
import {
  FaHome, FaCog, FaSignOutAlt, FaTasks, FaBars, FaTimes,
  FaUsers, FaUserMd, FaClipboardList, FaUserTie, FaHistory,
  FaChevronDown, FaChevronRight, FaDatabase, FaFileInvoiceDollar, 
  FaCogs, FaPills, FaStethoscope, FaHospital, FaMoneyBillWave,
  FaFileAlt, FaPrint, FaCheckCircle, FaTimesCircle, FaEye, FaPlus,
  FaEdit, FaClock, FaChartLine
} from 'react-icons/fa';

const Layout = ({ children }) => {
  const { authenticatedUser } = usePage().props;
  const url = usePage().url;
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({}); 

  const userRole = authenticatedUser?.role || 'user';

const normalize = (s) => s.replace(/\/+$/, '');

const isActive = (path) => {
  // const hasQuery = path.includes('?');
  const current = normalize(url);
  const target = normalize(path);

  if (target === '/dashboard' || target === '/') {
    return current === '/dashboard' || current === '/' || current === '';
  }

  // if (hasQuery) {
  //   return current === target;
  // }

  return current === target || current.startsWith(`${target}/`);
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
    if (roles.includes('*')) return true;
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
      roles: ['*'],
      type: 'group',
      key: 'master_data',
      children: [
        { name: 'Categories', path: '/categories', icon: <FaHospital />, roles: ['*'] },
        { name: 'Services', path: '/services', icon: <FaStethoscope />, roles: ['*'] },
        { name: 'Medicines', path: '/medicines', icon: <FaPills />, roles: ['*'] },
      ]
    },
    {
      name: 'Patient Management',
      icon: <FaUserMd />,
      roles: ['admin_rs'],
      type: 'group',
      key: 'patient_management',
      children: [
        { name: 'All Patients', path: '/patients', icon: <FaUsers />, roles: ['admin_rs'] },
        { name: 'Medical Records', path: '/medical-records', icon: <FaClipboardList />, roles: ['admin_rs'] },
      ]
    },
    {
      name: 'Invoice Management',
      icon: <FaFileInvoiceDollar />,
      roles: ['*'],
      type: 'group',
      key: 'invoices',
      children: [
        // Admin RS specific
        // { name: 'Create Invoice', path: '/invoices/create', icon: <FaPlus />, roles: ['admin_rs'] },
        { name: 'Draft Invoices', path: '/invoices?status=draft', icon: <FaEdit />, roles: ['admin_rs'] },
        
        // Both roles
        { name: 'All Invoices', path: '/invoices', icon: <FaClipboardList />, roles: ['*'] },
        { name: 'Submitted', path: '/invoices?status=submitted', icon: <FaClock />, roles: ['*'] },
        { name: 'Approved', path: '/invoices?status=approved', icon: <FaCheckCircle />, roles: ['*'] },
        { name: 'Rejected', path: '/invoices?status=rejected', icon: <FaTimesCircle />, roles: ['*'] },
        
        // Admin BPJS specific
        { name: 'Pending Review', path: '/invoices?status=submitted', icon: <FaEye />, roles: ['admin_bpjs'] },
      ]
    },
    {
      name: 'Reports',
      icon: <FaChartLine />,
      roles: ['*'],
      type: 'group',
      key: 'reports',
      children: [
        { name: 'Invoice Reports', path: '/reports/invoices', icon: <FaFileInvoiceDollar />, roles: ['*'] },
        { name: 'Patient Reports', path: '/reports/patients', icon: <FaUserMd />, roles: ['admin_rs'] },
      ]
    },
    { 
      name: 'Settings', 
      path: '/settings', 
      icon: <FaCog />, 
      roles: ['*'], 
      type: 'single'
    },
  ];

  // Filter menus and their children by user roles
  const visibleMenus = sidebarMenus.filter(menu => {
    if (menu.type === 'single') {
      return hasAccess(menu.roles);
    } else if (menu.type === 'group') {
      const hasAccessToChildren = menu.children.some(child => hasAccess(child.roles));
      return hasAccessToChildren;
    }
    return false;
  }).map(menu => {
    if (menu.type === 'group') {
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

  const getAppName = () => {
    if (userRole === 'admin_bpjs') {
      return 'BPJS Admin Portal';
    }
    return 'Hospital Billing System';
  };

  const getRoleColor = () => {
    return userRole === 'admin_bpjs' ? 'bg-green-500' : 'bg-blue-500';
  };

  const getRoleDisplayName = () => {
    const roleNames = {
      'admin_rs': 'Admin Rumah Sakit',
      'admin_bpjs': 'Admin BPJS'
    };
    return roleNames[userRole] || userRole;
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50">
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
          w-64 bg-white shadow-lg flex flex-col border-r
          transform transition-transform duration-300 ease-in-out
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
          lg:translate-x-0
        `}>
          {/* Logo Section */}
          <div className="flex items-center justify-between h-24 lg:h-32 border-b px-4 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center gap-3">
              <div className="w-24 h-24 bg-white rounded-lg flex items-center justify-center">
                <img src="/logo.png" alt="" className="w-24 h-24 object-contain" />
              </div>
              <div className="hidden lg:block text-white">
                <div className="text-sm font-bold">BPJS Billing</div>
                <div className="text-xs opacity-90">Management System</div>
              </div>
            </div>
            <button
              onClick={closeSidebar}
              className="lg:hidden p-2 rounded-md hover:bg-blue-600 text-white"
            >
              <FaTimes className="w-5 h-5" />
            </button>
          </div>

          {/* User Info */}
          <div className="px-4 py-4 border-b bg-gray-50">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold ${getRoleColor()}`}>
                {authenticatedUser?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800 truncate">
                  {authenticatedUser?.name || 'User'}
                </div>
                <div className="text-xs text-gray-500 truncate">
                  {getRoleDisplayName()}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {visibleMenus.map(renderMenuItem)}
          </nav>
          
          {/* Logout Button */}
          <div className="p-4 border-t bg-gray-50">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 text-sm px-4 py-3 text-red-600 hover:bg-red-50 rounded-md transition-colors font-medium"
            >
              <FaSignOutAlt className="w-4 h-4" />
              Logout
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-md hover:bg-gray-100"
            >
              <FaBars className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <FaHospital className="w-6 h-6 text-blue-600" />
              <span className="text-sm font-semibold text-gray-800">BPJS Billing</span>
            </div>
            <div className="w-9" />
          </header>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto">
            {children}
          </main>

          {/* Footer */}
          <footer className="bg-white border-t px-6 py-3 text-sm text-gray-500 text-center">
            © {new Date().getFullYear()} Hospital-BPJS Billing System. All rights reserved.
          </footer>
        </div>
      </div>
    </div>
  );
};

export default Layout;