import { useState } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, CardContent, CardHeader } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Lock, MapPin, Phone, Mail, Save, Eye, EyeOff } from 'lucide-react';
import { API_URL } from '../config/api';

export function PreferencesPage() {
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [savingPassword, setSavingPassword] = useState(false);

    const [contactDetails, setContactDetails] = useState({
        phone: '',
        address: '',
        city: '',
        country: '',
        postal_code: ''
    });
    const [contactError, setContactError] = useState('');
    const [contactSuccess, setContactSuccess] = useState('');
    const [savingContact, setSavingContact] = useState(false);

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (newPassword !== confirmPassword) {
            setPasswordError('New passwords do not match');
            return;
        }

        if (newPassword.length < 6) {
            setPasswordError('New password must be at least 6 characters long');
            return;
        }

        setSavingPassword(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/users/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword,
                    newPassword
                })
            });

            const data = await response.json();

            if (response.ok) {
                setPasswordSuccess('Password changed successfully');
                setCurrentPassword('');
                setNewPassword('');
                setConfirmPassword('');
            } else {
                setPasswordError(data.message || 'Failed to change password');
            }
        } catch (error) {
            console.error('Error changing password:', error);
            setPasswordError('Failed to change password');
        } finally {
            setSavingPassword(false);
        }
    };

    const handleContactUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setContactError('');
        setContactSuccess('');
        setSavingContact(true);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/api/users/contact-details`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(contactDetails)
            });

            const data = await response.json();

            if (response.ok) {
                setContactSuccess('Contact details updated successfully');
                setContactDetails(data);
            } else {
                setContactError(data.message || 'Failed to update contact details');
            }
        } catch (error) {
            console.error('Error updating contact details:', error);
            setContactError('Failed to update contact details');
        } finally {
            setSavingContact(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto py-8 space-y-6">
                <h1 className="text-3xl font-bold text-slate-900">Preferences</h1>

                {/* Change Password Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Lock className="h-5 w-5 text-primary-600" />
                            <h2 className="text-xl font-semibold">Change Password</h2>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            Update your password to keep your account secure
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handlePasswordChange} className="space-y-4">
                            {passwordError && (
                                <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
                                    {passwordError}
                                </div>
                            )}
                            {passwordSuccess && (
                                <div className="text-green-500 text-sm bg-green-50 p-3 rounded">
                                    {passwordSuccess}
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Current Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showCurrentPassword ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showCurrentPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    New Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showNewPassword ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showNewPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700">
                                    Confirm New Password
                                </label>
                                <div className="relative">
                                    <Input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="pr-10"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700"
                                    >
                                        {showConfirmPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </div>

                            <Button type="submit" disabled={savingPassword}>
                                <Save className="h-4 w-4 mr-2" />
                                {savingPassword ? 'Saving...' : 'Change Password'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {/* Contact Details Section */}
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <Phone className="h-5 w-5 text-primary-600" />
                            <h2 className="text-xl font-semibold">Contact Details</h2>
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                            Add or update your contact information
                        </p>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleContactUpdate} className="space-y-4">
                            {contactError && (
                                <div className="text-red-500 text-sm bg-red-50 p-3 rounded">
                                    {contactError}
                                </div>
                            )}
                            {contactSuccess && (
                                <div className="text-green-500 text-sm bg-green-50 p-3 rounded">
                                    {contactSuccess}
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                        <Phone className="h-4 w-4" />
                                        Phone Number
                                    </label>
                                    <Input
                                        type="tel"
                                        value={contactDetails.phone}
                                        onChange={(e) => setContactDetails({ ...contactDetails, phone: e.target.value })}
                                        placeholder="+1 234 567 8900"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                        <Mail className="h-4 w-4" />
                                        Postal Code
                                    </label>
                                    <Input
                                        type="text"
                                        value={contactDetails.postal_code}
                                        onChange={(e) => setContactDetails({ ...contactDetails, postal_code: e.target.value })}
                                        placeholder="12345"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                    <MapPin className="h-4 w-4" />
                                    Address
                                </label>
                                <Input
                                    type="text"
                                    value={contactDetails.address}
                                    onChange={(e) => setContactDetails({ ...contactDetails, address: e.target.value })}
                                    placeholder="123 Main Street, Apt 4B"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        City
                                    </label>
                                    <Input
                                        type="text"
                                        value={contactDetails.city}
                                        onChange={(e) => setContactDetails({ ...contactDetails, city: e.target.value })}
                                        placeholder="New York"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium text-slate-700">
                                        Country
                                    </label>
                                    <Input
                                        type="text"
                                        value={contactDetails.country}
                                        onChange={(e) => setContactDetails({ ...contactDetails, country: e.target.value })}
                                        placeholder="United States"
                                    />
                                </div>
                            </div>

                            <Button type="submit" disabled={savingContact}>
                                <Save className="h-4 w-4 mr-2" />
                                {savingContact ? 'Saving...' : 'Save Contact Details'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
