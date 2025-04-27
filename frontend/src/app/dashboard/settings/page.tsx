/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { User, UserUpdate } from '@/types/user';
import { updateCurrentUser, updateUserSettings } from '@/services/users';

export default function SettingsPage() {
    const { user, token, logout } = useAuth();
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    
    // Form states
    const [formData, setFormData] = useState<{
        email: string;
        full_name: string;
        current_password: string;
        new_password: string;
        confirm_password: string;
    }>({
        email: '',
        full_name: '',
        current_password: '',
        new_password: '',
        confirm_password: '',
    });

    // Initialize form with user data
    useEffect(() => {
        if (user) {
            setFormData(prevState => ({
                ...prevState,
                email: user.email || '',
                full_name: user.full_name || '',
            }));
        }
    }, [user]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value,
        }));
        // Clear any previous error/success messages
        setError(null);
        setSuccess(null);
    };

    const validateForm = () => {
        // Check if passwords match when trying to change password
        if (formData.new_password && formData.new_password !== formData.confirm_password) {
            setError('New passwords do not match');
            return false;
        }
        
        // Check if current password is provided when changing password
        if (formData.new_password && !formData.current_password) {
            setError('Current password is required to set a new password');
            return false;
        }
        
        return true;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate form
        if (!validateForm()) {
            return;
        }
        
        setIsLoading(true);
        setError(null);
        setSuccess(null);
        
        try {
            // Prepare update data
            const updateData: UserUpdate = {};
            
            if (formData.email !== user?.email && formData.email) {
                updateData.email = formData.email;
            }
            
            if (formData.full_name !== user?.full_name) {
                updateData.full_name = formData.full_name;
            }
            
            if (formData.new_password) {
                updateData.password = formData.new_password;
                // Note: In a real app, we would need to verify the current password on the backend
            }
            
            // Only proceed if there are changes to make
            if (Object.keys(updateData).length > 0) {
                if (token) {
                    const updatedUser = await updateUserSettings(updateData, token);
                    setSuccess('Your profile has been updated successfully');
                    // Clear password fields
                    setFormData(prevState => ({
                        ...prevState,
                        current_password: '',
                        new_password: '',
                        confirm_password: '',
                    }));
                }
            } else {
                setSuccess('No changes were made');
            }
        } catch (err) {
            setError('Failed to update profile. Please try again.');
            console.error('Update profile error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
            setIsLoading(true);
            try {
                // Call delete account API (to be implemented)
                // await deleteCurrentUser(token);
                await logout();
                router.push('/');
            } catch (err) {
                setError('Failed to delete account. Please try again.');
                console.error('Delete account error:', err);
                setIsLoading(false);
            }
        }
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen cosmic-bg">
                <div className="text-cosmic-text">Loading...</div>
            </div>
        );
    }

    return (
        <div className="container mx-auto py-8 px-4 cosmic-bg text-cosmic-text">
            <h1 className="text-2xl font-bold mb-6 text-cosmic-accent">Account Settings</h1>
            
            {error && (
                <div className="bg-cosmic-error-bg border border-cosmic-error text-cosmic-error px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}
            
            {success && (
                <div className="bg-cosmic-success-bg border border-cosmic-success text-cosmic-success px-4 py-3 rounded mb-4">
                    {success}
                </div>
            )}
            
            <div className="bg-cosmic-card shadow-cosmic rounded p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 text-cosmic-accent">Profile Information</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="email" className="block text-cosmic-text mb-2">Email Address</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-cosmic-input border border-cosmic-border rounded focus:outline-none focus:border-cosmic-accent text-cosmic-text"
                            required
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="full_name" className="block text-cosmic-text mb-2">Full Name</label>
                        <input
                            type="text"
                            id="full_name"
                            name="full_name"
                            value={formData.full_name}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-cosmic-input border border-cosmic-border rounded focus:outline-none focus:border-cosmic-accent text-cosmic-text"
                        />
                    </div>
                    
                    <h2 className="text-xl font-semibold mb-4 mt-8 text-cosmic-accent">Change Password</h2>
                    
                    <div className="mb-4">
                        <label htmlFor="current_password" className="block text-cosmic-text mb-2">Current Password</label>
                        <input
                            type="password"
                            id="current_password"
                            name="current_password"
                            value={formData.current_password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-cosmic-input border border-cosmic-border rounded focus:outline-none focus:border-cosmic-accent text-cosmic-text"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="new_password" className="block text-cosmic-text mb-2">New Password</label>
                        <input
                            type="password"
                            id="new_password"
                            name="new_password"
                            value={formData.new_password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-cosmic-input border border-cosmic-border rounded focus:outline-none focus:border-cosmic-accent text-cosmic-text"
                        />
                    </div>
                    
                    <div className="mb-4">
                        <label htmlFor="confirm_password" className="block text-cosmic-text mb-2">Confirm New Password</label>
                        <input
                            type="password"
                            id="confirm_password"
                            name="confirm_password"
                            value={formData.confirm_password}
                            onChange={handleChange}
                            className="w-full px-3 py-2 bg-cosmic-input border border-cosmic-border rounded focus:outline-none focus:border-cosmic-accent text-cosmic-text"
                        />
                    </div>
                    
                    <div className="flex justify-end">
                        <button
                            type="submit"
                            className="px-4 py-2 bg-[var(--cosmic-highlight)] text-white rounded-md hover:bg-[var(--cosmic-highlight-dark)] focus:outline-none focus:ring-2 focus:ring-[var(--cosmic-accent)] transition-colors shadow-sm"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </div>
                </form>
            </div>
            
            <div className="bg-cosmic-card shadow-cosmic rounded p-6">
                <h2 className="text-xl font-semibold mb-4 text-cosmic-error">Danger Zone</h2>
                <p className="mb-4 text-cosmic-text-secondary">
                    Once you delete your account, there is no going back. Please be certain.
                </p>
                <button
                    onClick={handleDeleteAccount}
                    className="px-4 py-2 bg-[var(--danger)] text-white rounded-md hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors shadow-sm"
                    disabled={isLoading}
                >
                    Delete Account
                </button>
            </div>
        </div>
    );
}