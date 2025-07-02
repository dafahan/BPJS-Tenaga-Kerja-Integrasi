import React, { useState, useEffect } from 'react';
import { Link, Head, usePage, router } from '@inertiajs/react';
import Layout from '../Layouts/Layout';
import Swal from 'sweetalert2'; // Import SweetAlert

function Users() {
    const { users } = usePage().props;
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const usersPerPage = 6;
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        role: 'marketing',
        name: '',
    });
    const [editUserId, setEditUserId] = useState(null);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    const filteredUsers = users.filter(user =>
        user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.role.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const indexOfLastUser = currentPage * usersPerPage;
    const indexOfFirstUser = indexOfLastUser - usersPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);

    const totalUsers = filteredUsers.length;
    const totalPages = Math.ceil(totalUsers / usersPerPage);

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleAddSubmit = (e) => {
        e.preventDefault();
        router.post('/users', formData, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success',
                    text: 'User added successfully!',
                    icon: 'success',
                    confirmButtonColor: '#17153B',
                    customClass: {
                        popup: 'bg-primary',
                        title: 'text-white',
                        content: 'text-white'
                    }
                });
                setFormData({ username: '', password: '', role: 'admin', name: '' });
                setShowAddModal(false);
            },
            onError: (error) => {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to add user!',
                    icon: 'error',
                    customClass: {
                        popup: 'bg-primary',
                        title: 'text-white',
                        content: 'text-white'
                    }
                });
            },
        });
    };

    const handleEditSubmit = (e) => {
        e.preventDefault();
        router.put(`/users/${editUserId}`, formData, {
            onSuccess: () => {
                Swal.fire({
                    title: 'Success',
                    text: 'User updated successfully!',
                    icon: 'success',
                    confirmButtonColor: '#17153B',
                    customClass: {
                        popup: 'bg-primary',
                        title: 'text-white',
                        content: 'text-white'
                    }
                });
                setFormData({ username: '', password: '', role: 'admin', name: '' });
                setShowEditModal(false);
                setEditUserId(null);
            },
            onError: (error) => {
                Swal.fire({
                    title: 'Error',
                    text: 'Failed to update user!',
                    icon: 'error',
                    customClass: {
                        popup: 'bg-primary',
                        title: 'text-white',
                        content: 'text-white'
                    }
                });
            },
        });
    };

    const openEditModal = (user) => {
        setFormData({
            username: user.username,
            password: '', // Optional: do not pre-fill password for security
            role: user.role,
            name: user.name,
        });
        setEditUserId(user.id);
        setShowEditModal(true);
    };

    const renderPagination = () => {
        const paginationItems = [];
        const maxVisiblePages = 3;

        if (currentPage > 1) {
            paginationItems.push(
                <button key={1} onClick={() => handlePageChange(1)} className="px-1 sm:py-2 sm:px-4 rounded bg-secondary hover:bg-secondary-dark text-white text-xs sm:text-md">
                    1
                </button>
            );
        }

        if (currentPage > maxVisiblePages + 1) {
            paginationItems.push(<span key="ellipsis1" className="text-white">...</span>);
        }

        for (let i = Math.max(2, currentPage - maxVisiblePages); i <= Math.min(totalPages - 1, currentPage + maxVisiblePages); i++) {
            paginationItems.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-1 sm:py-2 sm:px-4 rounded ${currentPage === i ? 'bg-secondary-dark' : 'bg-secondary hover:bg-secondary-dark'} text-white text-xs sm:text-md`}
                >
                    {i}
                </button>
            );
        }

        if (currentPage < totalPages - maxVisiblePages) {
            paginationItems.push(<span key="ellipsis2" className="text-white">...</span>);
        }

        if (currentPage < totalPages) {
            paginationItems.push(
                <button key={totalPages} onClick={() => handlePageChange(totalPages)} className="px-1 sm:py-2 sm:px-4 rounded bg-secondary hover:bg-secondary-dark text-white text-xs sm:text-md">
                    {totalPages}
                </button>
            );
        }

        return paginationItems;
    };

    return (
        <div className="flex flex-col h-full w-full border-secondary border-2 bg-primary p-4 justify-start sm:gap-2 pt-8 relative text-xs sm:text-lg">
            <Head title="Users" />
            <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 sm:mb-4">Users</h1>
            <div className="flex flex-col sm:flex-row w-full sm:gap-2">
                <input 
                    type="text" 
                    placeholder="Search users..." 
                    className="flex-grow p-2 mb-4 sm:mb-0 bg-secondary text-white rounded text-xs sm:text-lg" 
                    value={searchQuery} 
                    onChange={(e) => setSearchQuery(e.target.value)} 
                />
                
                <button onClick={() => setShowAddModal(true)} className="bg-secondary hover:bg-secondary-dark text-white py-2 px-4 rounded text-xs sm:text-lg w-full sm:w-auto">
                    Add User
                </button>
            </div>

            <div className="overflow-x-auto">
                <table className="table-auto w-full bg-primary text-white mt-4 border-separate border-spacing-y-2">
                    <thead className="bg-secondary text-white">
                        <tr>
                            <th className="p-2">Username</th>
                            <th className="p-2">Name</th>
                            <th className="p-2">Role</th>
                            <th className="p-2">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {currentUsers.map(user => (
                            <tr key={user.id} className="hover:bg-secondary text-white text-center">
                                <td className="border-b border-gray-700 p-2">{user.username}</td>
                                <td className="border-b border-gray-700 p-2">{user.name}</td>
                                <td className="border-b border-gray-700 p-2">{user.role}</td>
                                <td className="border-b border-gray-700 p-2 flex justify-center items-center">
                                    <button 
                                        onClick={() => openEditModal(user)} 
                                        className="text-white bg-info py-1 px-3 rounded hover:opacity-50 mr-2"
                                    >
                                        Edit
                                    </button>
                                    {(user.role !== "superadmin") && (
                                        <button 
                                            onClick={() => {
                                                Swal.fire({
                                                    title: 'Are you sure?',
                                                    text: "You won't be able to revert this!",
                                                    icon: 'warning',
                                                    showCancelButton: true,
                                                    confirmButtonColor: '#17153B',
                                                    cancelButtonColor: '#3b1518',
                                                    confirmButtonText: 'Yes, delete it!',
                                                    customClass: {
                                                        popup: 'bg-primary',
                                                        title: 'text-white',
                                                        content: 'text-white'
                                                    }
                                                }).then((result) => {
                                                    if (result.isConfirmed) {
                                                        router.delete(`/users/${user.id}`, {
                                                            onSuccess: () => Swal.fire({
                                                                title: 'Deleted!',
                                                                text: 'User has been deleted.',
                                                                icon: 'success',
                                                                confirmButtonColor: '#17153B',
                                                                customClass: {
                                                                    popup: 'bg-primary',
                                                                    title: 'text-white',
                                                                    content: 'text-white'
                                                                }
                                                            }),
                                                            onError: (error) => Swal.fire({
                                                                title: 'Error',
                                                                text: 'Failed to delete user!',
                                                                icon: 'error',
                                                                customClass: {
                                                                    popup: 'bg-primary',
                                                                    title: 'text-white',
                                                                    content: 'text-white'
                                                                }
                                                            }),
                                                        });
                                                    }
                                                });
                                            }} 
                                            className="text-white bg-danger py-1 px-3 rounded hover:opacity-50"
                                        >
                                            Delete
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="flex justify-center mt-4">
                <div className="flex space-x-2">
                    {renderPagination()}
                </div>
            </div>

            {/* Add User Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-primary p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Add User</h2>
                        <form onSubmit={handleAddSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 rounded bg-secondary text-white"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 rounded bg-secondary text-white"
                            />
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 rounded bg-secondary text-white"
                            />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded bg-secondary text-white"
                            >
                                <option value="marketing">marketing</option>
                                <option value="admin">Admin</option>
                            </select>
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="bg-danger text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-info text-white px-4 py-2 rounded">
                                    Add
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Edit User Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-primary p-6 rounded-lg w-full max-w-md">
                        <h2 className="text-xl font-bold text-white mb-4">Edit User</h2>
                        <form onSubmit={handleEditSubmit} className="space-y-4">
                            <input
                                type="text"
                                name="username"
                                placeholder="Username"
                                value={formData.username}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 rounded bg-secondary text-white"
                            />
                            <input
                                type="password"
                                name="password"
                                placeholder="Password"
                                value={formData.password}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded bg-secondary text-white"
                            />
                            <input
                                type="text"
                                name="name"
                                placeholder="Full Name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                className="w-full p-2 rounded bg-secondary text-white"
                            />
                            <select
                                name="role"
                                value={formData.role}
                                onChange={handleInputChange}
                                className="w-full p-2 rounded bg-secondary text-white"
                            >
                                <option value="marketing">marketing</option>
                                <option value="admin">admin</option>
                            </select>
                            <div className="flex justify-between">
                                <button
                                    type="button"
                                    onClick={() => setShowEditModal(false)}
                                    className="bg-danger text-white px-4 py-2 rounded"
                                >
                                    Cancel
                                </button>
                                <button type="submit" className="bg-info text-white px-4 py-2 rounded">
                                    Update
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}        </div>
    );
}

Users.layout = page => <Layout children={page} />;

export default Users;
