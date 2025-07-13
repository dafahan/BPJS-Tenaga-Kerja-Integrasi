import { Head, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { User, Lock, Save, Eye, EyeOff, Shield, Cog, Mail, ExternalLink, MessageCircle } from 'lucide-react';
import Layout from '@/js/Layouts/Layout';
import axios from 'axios';
import Swal from 'sweetalert2';

export default function Settings({ user }) {
    const [activeTab, setActiveTab] = useState('profile');
    const [loading, setLoading] = useState(false);
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Profile form data
    const [profileData, setProfileData] = useState({
        name: user.name || '',
        username: user.username || ''
    });

    // Password form data
    const [passwordData, setPasswordData] = useState({
        current_password: '',
        password: '',
        password_confirmation: ''
    });

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const response = await axios.put('/settings/profile', profileData);
            
            if (response.data.success) {
                Swal.fire('Success!', response.data.message, 'success');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Something went wrong';
            Swal.fire('Error!', message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handlePasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (passwordData.password !== passwordData.password_confirmation) {
            Swal.fire('Error!', 'Password confirmation does not match', 'error');
            return;
        }

        setLoading(true);

        try {
            const response = await axios.put('/settings/password', passwordData);
            
            if (response.data.success) {
                Swal.fire('Success!', response.data.message, 'success');
                setPasswordData({
                    current_password: '',
                    password: '',
                    password_confirmation: ''
                });
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Something went wrong';
            Swal.fire('Error!', message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const getRoleColor = () => {
        return user.role === 'admin_bpjs' ? 'bg-green-500' : 'bg-blue-500';
    };

    const getRoleDisplayName = () => {
        const roleNames = {
            'admin_rs': 'Admin Rumah Sakit',
            'admin_bpjs': 'Admin BPJS'
        };
        return roleNames[user.role] || user.role;
    };

    const tabs = [
        { id: 'profile', name: 'Profile Settings', icon: <User size={16} /> },
        { id: 'password', name: 'Change Password', icon: <Lock size={16} /> },
        { id: 'support', name: 'Contact Support', icon: <MessageCircle size={16} /> },
    ];

    return (
        <>
            <Head title="Settings" />
            
            <div className="p-6">
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-2">
                        <Cog className="w-8 h-8 text-gray-600" />
                        <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                    </div>
                    <p className="text-gray-600">Manage your account settings and preferences</p>
                </div>

                <div className="max-w-4xl mx-auto">
                    {/* User Info Card */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold ${getRoleColor()}`}>
                                {user.name?.charAt(0)?.toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-900">{user.name}</h2>
                                <p className="text-gray-600">@{user.username}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <Shield className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-500">{getRoleDisplayName()}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                        {/* Tabs */}
                        <div className="border-b border-gray-200">
                            <nav className="flex space-x-8 px-6">
                                {tabs.map((tab) => (
                                    <button
                                        key={tab.id}
                                        onClick={() => setActiveTab(tab.id)}
                                        className={`py-4 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${
                                            activeTab === tab.id
                                                ? 'border-blue-500 text-blue-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                    >
                                        {tab.icon}
                                        {tab.name}
                                    </button>
                                ))}
                            </nav>
                        </div>

                        {/* Tab Content */}
                        <div className="p-6">
                            {activeTab === 'profile' && (
                                <div>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Profile Information</h3>
                                        <p className="text-gray-600">Update your account's profile information.</p>
                                    </div>

                                    <div onSubmit={handleProfileSubmit} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Full Name *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileData.name}
                                                    onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter your full name"
                                                    required
                                                />
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Username *
                                                </label>
                                                <input
                                                    type="text"
                                                    value={profileData.username}
                                                    onChange={(e) => setProfileData({...profileData, username: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter your username"
                                                    required
                                                />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Role
                                            </label>
                                            <input
                                                type="text"
                                                value={getRoleDisplayName()}
                                                className="w-full border border-gray-300 rounded-lg px-4 py-3 bg-gray-50 text-gray-500"
                                                readOnly
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Your role cannot be changed</p>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={handleProfileSubmit}
                                                disabled={loading}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                                            >
                                                <Save size={16} />
                                                {loading ? 'Saving...' : 'Save Changes'}
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'password' && (
                                <div>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Change Password</h3>
                                        <p className="text-gray-600">Ensure your account is using a long, random password to stay secure.</p>
                                    </div>

                                    <form onSubmit={handlePasswordSubmit} className="space-y-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Current Password *
                                            </label>
                                            <div className="relative">
                                                <input
                                                    autoComplete="current-password"
                                                    type={showCurrentPassword ? 'text' : 'password'}
                                                    value={passwordData.current_password}
                                                    onChange={(e) => setPasswordData({...passwordData, current_password: e.target.value})}
                                                    className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                    placeholder="Enter your current password"
                                                    required
                                                />
                                                <button
                                                    type="button"
                                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                >
                                                    {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                </button>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    New Password *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        autoComplete="new-password"
                                                        type={showNewPassword ? 'text' : 'password'}
                                                        value={passwordData.password}
                                                        onChange={(e) => setPasswordData({...passwordData, password: e.target.value})}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Enter new password"
                                                        minLength="6"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">Minimum 6 characters</p>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                                    Confirm New Password *
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        autoComplete="new-password"
                                                        type={showConfirmPassword ? 'text' : 'password'}
                                                        value={passwordData.password_confirmation}
                                                        onChange={(e) => setPasswordData({...passwordData, password_confirmation: e.target.value})}
                                                        className="w-full border border-gray-300 rounded-lg px-4 py-3 pr-12 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                        placeholder="Confirm new password"
                                                        minLength="6"
                                                        required
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <div className="flex">
                                                <div className="flex-shrink-0">
                                                    <Shield className="h-5 w-5 text-yellow-400" />
                                                </div>
                                                <div className="ml-3">
                                                    <h3 className="text-sm font-medium text-yellow-800">Password Security Tips</h3>
                                                    <div className="mt-2 text-sm text-yellow-700">
                                                        <ul className="list-disc pl-5 space-y-1">
                                                            <li>Use at least 8 characters</li>
                                                            <li>Include uppercase and lowercase letters</li>
                                                            <li>Add numbers and special characters</li>
                                                            <li>Avoid using personal information</li>
                                                        </ul>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex justify-end">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 disabled:opacity-50 transition-colors"
                                            >
                                                <Lock size={16} />
                                                {loading ? 'Updating...' : 'Update Password'}
                                            </button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            {activeTab === 'support' && (
                                <div>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">Contact Support</h3>
                                        <p className="text-gray-600">Need help? Get in touch with our support team.</p>
                                    </div>

                                    <div className="space-y-6">
                                        {/* Contact Cards */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Email Support */}
                                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                        <Mail className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-medium text-gray-900">Email Support</h4>
                                                        <p className="text-sm text-gray-600">Send us an email</p>
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-gray-700 mb-2">
                                                        Have a question or need assistance? Contact our support team directly via email.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-blue-600">
                                                        <Mail size={16} />
                                                        <span className="font-medium">hello@dafahan.dev</span>
                                                    </div>
                                                </div>
                                                <a
                                                    href="mailto:hello@dafahan.dev"
                                                    className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    <Mail size={16} />
                                                    Send Email
                                                </a>
                                            </div>

                                            {/* Website Support */}
                                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                                <div className="flex items-center gap-3 mb-4">
                                                    <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                                                        <ExternalLink className="w-5 h-5 text-white" />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-lg font-medium text-gray-900">Visit Our Website</h4>
                                                        <p className="text-sm text-gray-600">Browse our resources</p>
                                                    </div>
                                                </div>
                                                <div className="mb-4">
                                                    <p className="text-gray-700 mb-2">
                                                        Visit our website for more information, documentation, and additional resources.
                                                    </p>
                                                    <div className="flex items-center gap-2 text-green-600">
                                                        <ExternalLink size={16} />
                                                        <span className="font-medium">dafahan.dev</span>
                                                    </div>
                                                </div>
                                                <a
                                                    href="https://dafahan.dev"
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                                                >
                                                    <ExternalLink size={16} />
                                                    Visit Website
                                                </a>
                                            </div>
                                        </div>

                                        {/* Support Guidelines */}
                                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">Support Guidelines</h4>
                                            <div className="space-y-3">
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-blue-600 text-sm font-medium">1</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-700">
                                                            <strong>Be Specific:</strong> Include detailed information about your issue, including error messages and steps to reproduce the problem.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-blue-600 text-sm font-medium">2</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-700">
                                                            <strong>Include Context:</strong> Provide information about your role, the feature you're using, and what you were trying to accomplish.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start gap-3">
                                                    <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                                                        <span className="text-blue-600 text-sm font-medium">3</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-700">
                                                            <strong>Response Time:</strong> We typically respond within 24-48 hours during business days.
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Quick Actions */}
                                        {/* <div className="bg-white border border-gray-200 rounded-lg p-6">
                                            <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h4>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <a
                                                    href="mailto:hello@dafahan.dev?subject=Technical Support Request"
                                                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <Shield className="w-5 h-5 text-blue-500" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Technical Support</div>
                                                        <div className="text-sm text-gray-600">Report bugs or technical issues</div>
                                                        </div>
                                                </a>
                                                <a
                                                    href="mailto:hello@dafahan.dev?subject=Feature Request"
                                                    className="flex items-center gap-3 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                                                >
                                                    <MessageCircle className="w-5 h-5 text-green-500" />
                                                    <div>
                                                        <div className="font-medium text-gray-900">Feature Request</div>
                                                        <div className="text-sm text-gray-600">Suggest new features or improvements</div>
                                                    </div>
                                                </a>
                                            </div>
                                        </div> */}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

Settings.layout = (page) => <Layout children={page} />;