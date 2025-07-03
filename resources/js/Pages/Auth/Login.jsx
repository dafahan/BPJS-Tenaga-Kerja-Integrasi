import React, { useState } from 'react';
import { usePage,router } from '@inertiajs/react';

export default function Login() {
  const { csrf_token } = usePage().props;
    const [form, setForm] = useState({
        username: '',
        password: '',
    });    
    const [errors, setErrors] = useState(null); // State for errors

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
      
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrf_token, // Assuming you have a CSRF token in meta tags
                },
                body: JSON.stringify({ ...form }),
            });

            if (response.redirected) {
                // If the response is a redirect, navigate to the new URL
                router.visit(response.url, { method: 'get' })
            } else {
                const data = await response.json();
                if (response.status === 422) {
                    // Handle validation errors
                    setErrors(data.errors);
                    setForm({ // Reset form fields on success
                      username: '',
                      password: '',
                  });
                }
            }
        } catch (error) {
            console.error("Login failed:", error);
            // Handle general errors here if needed
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
            <img src="/logo.png" alt="" className="self-center object-contain h-40 justify-self-center" />

                <h2 className="text-2xl font-bold text-center text-accent">Login</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                            Username
                        </label>
                        <input
                            type="text"
                            name="username"
                            id="username"
                            value={form.username}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 mt-1 border bg-gray-200 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                            Password
                        </label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            value={form.password}
                            onChange={handleChange}
                            required
                            className="w-full px-3 py-2 mt-1 border bg-gray-200 text-gray-500 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                        />

                    </div>
                    {errors && (
                            <div className="mt-1 text-sm text-error font-semibold">{errors.password || errors.username}</div>
                        )}
                    <button
                        type="submit"
                        className="w-full px-4 py-2 text-white bg-primary rounded-md hover:bg-secondary"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>
    );
}
