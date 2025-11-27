import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Card, CardContent } from '../components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { RankBadge } from '../components/rewards/RankBadge';
import { MapPin, Calendar, CheckCircle2, MessageSquare, Edit2, Save, X, Camera, Linkedin, Twitter, Github, Globe, Award, Trash2, Edit } from 'lucide-react';
import { EditQuestionModal } from '../components/modals/EditQuestionModal';
import { FollowButton } from '../components/common/FollowButton';
import { ExpertBadge } from '../components/common/ExpertBadge';

interface ProfileData {
    name: string;
    email: string;
    bio: string;
    location: string;
    website: string;
    linkedin: string;
    twitter: string;
    github: string;
    avatarUrl: string;
    points?: number;
    rank?: string;
    stats?: {
        answers: number;
        questions: number;
        accepted_answers: number;
    };
    follower_count?: number;
    following_count?: number;
    is_verified_expert?: boolean;
    expert_role?: 'CA' | 'HR' | 'Marketing' | 'Lawyer' | null;
}

interface Activity {
    id: number;
    type: 'question' | 'answer';
    title?: string;
    content?: string;
    created_at: string;
    question_id?: number;
    question_title?: string;
    answer_count?: number;
    is_accepted?: boolean;
}

interface Question {
    id: number;
    title: string;
    description: string;
    image_url?: string | null;
    created_at: string;
    answers_count: number;
}

export function ProfilePage() {
    const [isEditing, setIsEditing] = useState(false);
    const [user, setUser] = useState<ProfileData | null>(null);
    const [editedUser, setEditedUser] = useState<ProfileData | null>(null);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [activities, setActivities] = useState<Activity[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [activeTab, setActiveTab] = useState<'all' | 'questions' | 'answers'>('all');
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const { id } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        // If no ID is provided, redirect to login or handle as current user
        // But since the route is /profile/:id, id should always be present
        if (id) {
            fetchProfileData(parseInt(id));
            fetchUserActivity(parseInt(id));
            fetchUserQuestions(parseInt(id));
        }
    }, [id]);

    const fetchUserActivity = async (userId: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/activity/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setActivities(data);
            }
        } catch (error) {
            console.error('Error fetching user activity:', error);
        }
    };

    const fetchUserQuestions = async (userId: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/questions/user/${userId}`);
            if (response.ok) {
                const data = await response.json();
                setQuestions(data);
            }
        } catch (error) {
            console.error('Error fetching user questions:', error);
        }
    };

    const handleEditQuestion = (question: Question) => {
        setEditingQuestion(question);
        setIsEditModalOpen(true);
    };

    const handleSaveQuestion = async (questionId: number, data: { title: string; description: string; image: string | null }) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/questions/${questionId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                // Refresh questions
                if (id) {
                    fetchUserQuestions(parseInt(id));
                }
                setIsEditModalOpen(false);
            } else {
                throw new Error('Failed to update question');
            }
        } catch (error) {
            console.error('Error updating question:', error);
            throw error;
        }
    };

    const handleDeleteQuestion = async (questionId: number) => {
        if (!confirm('Are you sure you want to delete this question? This action cannot be undone.')) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://localhost:3000/api/questions/${questionId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                // Refresh questions
                if (id) {
                    fetchUserQuestions(parseInt(id));
                    fetchUserActivity(parseInt(id));
                }
            } else {
                alert('Failed to delete question');
            }
        } catch (error) {
            console.error('Error deleting question:', error);
            alert('Failed to delete question');
        }
    };

    const fetchProfileData = async (userId: number) => {
        try {
            const response = await fetch(`http://localhost:3000/api/rewards/profile/${userId}`);
            if (response.ok) {
                const profileData = await response.json();

                const fullProfile: ProfileData = {
                    name: profileData.name || '',
                    email: profileData.email || '',
                    bio: profileData.bio || '',
                    location: profileData.location || '',
                    website: profileData.website || '',
                    linkedin: profileData.linkedin || '',
                    twitter: profileData.twitter || '',
                    github: profileData.github || '',
                    avatarUrl: profileData.avatarUrl || '',
                    points: profileData.points || 0,
                    rank: profileData.rank || 'Beginner',
                    stats: profileData.stats || { answers: 0, questions: 0, accepted_answers: 0 },
                    follower_count: profileData.follower_count || 0,
                    following_count: profileData.following_count || 0,
                    is_verified_expert: profileData.is_verified_expert || false,
                    expert_role: profileData.expert_role || null
                };

                setUser(fullProfile);
                setEditedUser(fullProfile);
            }
        } catch (error) {
            console.error('Error fetching profile:', error);
            // Fallback to localStorage data
            const parsedUser = JSON.parse(localStorage.getItem('user') || '{}');
            const fullProfile: ProfileData = {
                name: parsedUser.name || '',
                email: parsedUser.email || '',
                bio: parsedUser.bio || '',
                location: parsedUser.location || '',
                website: parsedUser.website || '',
                linkedin: parsedUser.linkedin || '',
                twitter: parsedUser.twitter || '',
                github: parsedUser.github || '',
                avatarUrl: parsedUser.avatarUrl || '',
                points: 0,
                rank: 'Beginner'
            };
            setUser(fullProfile);
            setEditedUser(fullProfile);
        }
    };

    const isCurrentUser = () => {
        const userData = localStorage.getItem('user');
        if (!userData) return false;
        const parsedUser = JSON.parse(userData);
        return parsedUser.id.toString() === id;
    };

    const handleEdit = () => {
        if (isCurrentUser()) {
            setIsEditing(true);
        }
    };

    const handleCancel = () => {
        setEditedUser(user);
        setIsEditing(false);
        setError('');
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && editedUser) {
            // Check file type
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }

            // Check file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            // Create a local URL for the image
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setEditedUser({
                    ...editedUser,
                    avatarUrl: base64String
                });
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async () => {
        if (!editedUser?.name?.trim()) {
            setError('Name is required');
            return;
        }

        setError('');
        setIsSaving(true);

        try {
            const token = localStorage.getItem('token');
            console.log('Saving profile...', editedUser);

            const response = await fetch('http://localhost:3000/api/users/profile', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(editedUser)
            });

            console.log('Response status:', response.status);

            if (response.ok) {
                const updatedUser = await response.json();
                console.log('Profile updated successfully:', updatedUser);

                // Update localStorage with new data
                const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
                const mergedUser = { ...currentUser, ...updatedUser };
                localStorage.setItem('user', JSON.stringify(mergedUser));

                setUser(editedUser);
                setIsEditing(false);
            } else {
                const errorData = await response.json();
                console.error('Failed to update profile:', errorData);
                setError(errorData.message || 'Failed to update profile');
            }
        } catch (err) {
            console.error('Error saving profile:', err);
            setError('Failed to update profile: ' + (err as Error).message);
        } finally {
            setIsSaving(false);
        }
    };

    if (!user) {
        return (
            <MainLayout>
                <div className="max-w-4xl mx-auto py-8 text-center">
                    <p className="text-slate-500">Loading profile...</p>
                </div>
            </MainLayout>
        );
    }

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto py-8 space-y-6">
                {/* Profile Header */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            {/* Avatar Section */}
                            <div className="relative">
                                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                                    <AvatarImage src={editedUser?.avatarUrl || user.avatarUrl} />
                                    <AvatarFallback className="text-4xl bg-primary-600 text-white">
                                        {user.name[0]?.toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>
                                {isEditing && (
                                    <>
                                        <input
                                            type="file"
                                            id="avatar-upload"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handlePhotoUpload}
                                        />
                                        <Button
                                            size="sm"
                                            type="button"
                                            className="absolute bottom-0 right-0 rounded-full h-10 w-10 p-0"
                                            onClick={() => document.getElementById('avatar-upload')?.click()}
                                        >
                                            <Camera className="h-4 w-4" />
                                        </Button>
                                    </>
                                )}
                            </div>

                            <div className="flex-1 space-y-4 w-full">
                                {/* Name, Rank, and Points */}
                                <div>
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        {isEditing ? (
                                            <Input
                                                value={editedUser?.name}
                                                onChange={(e) => editedUser && setEditedUser({ ...editedUser, name: e.target.value })}
                                                className="text-2xl font-bold max-w-md"
                                                placeholder="Your Name"
                                            />
                                        ) : (
                                            <>
                                                <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
                                                <CheckCircle2 className="h-5 w-5 text-blue-500" />
                                            </>
                                        )}
                                    </div>

                                    {/* Expert Badge */}
                                    {!isEditing && user.is_verified_expert && user.expert_role && (
                                        <div className="mb-2">
                                            <ExpertBadge
                                                expertRole={user.expert_role}
                                                isVerified={user.is_verified_expert}
                                                size="md"
                                            />
                                        </div>
                                    )}

                                    {/* Rank and Points Display */}
                                    {!isEditing && user.rank && (
                                        <div className="flex items-center gap-4 mb-3">
                                            <RankBadge rank={user.rank} size="md" />
                                            <div className="flex items-center gap-2 bg-primary-50 px-3 py-1.5 rounded-full">
                                                <Award className="h-4 w-4 text-primary-600" />
                                                <span className="font-semibold text-primary-700">{user.points || 0}</span>
                                                <span className="text-xs text-primary-600">points</span>
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-slate-600">{user.email}</p>
                                </div>

                                {/* About Me */}
                                <div>
                                    {isEditing ? (
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium text-slate-700">About Me</label>
                                            <textarea
                                                value={editedUser?.bio}
                                                onChange={(e) => editedUser && setEditedUser({ ...editedUser, bio: e.target.value })}
                                                className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2"
                                                placeholder="Tell us about yourself, your expertise, and what you're passionate about..."
                                            />
                                        </div>
                                    ) : (
                                        user.bio && (
                                            <p className="text-slate-600 text-sm">{user.bio}</p>
                                        )
                                    )}
                                </div>

                                {error && <div className="text-red-500 text-sm bg-red-50 p-2 rounded">{error}</div>}

                                {/* Location and Social Links */}
                                <div className="space-y-3">
                                    {isEditing ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    Location
                                                </label>
                                                <Input
                                                    value={editedUser?.location}
                                                    onChange={(e) => editedUser && setEditedUser({ ...editedUser, location: e.target.value })}
                                                    placeholder="New York, USA"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                    <Globe className="h-4 w-4" />
                                                    Website
                                                </label>
                                                <Input
                                                    value={editedUser?.website}
                                                    onChange={(e) => editedUser && setEditedUser({ ...editedUser, website: e.target.value })}
                                                    placeholder="https://yourwebsite.com"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                    <Linkedin className="h-4 w-4" />
                                                    LinkedIn
                                                </label>
                                                <Input
                                                    value={editedUser?.linkedin}
                                                    onChange={(e) => editedUser && setEditedUser({ ...editedUser, linkedin: e.target.value })}
                                                    placeholder="linkedin.com/in/username"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                    <Twitter className="h-4 w-4" />
                                                    Twitter
                                                </label>
                                                <Input
                                                    value={editedUser?.twitter}
                                                    onChange={(e) => editedUser && setEditedUser({ ...editedUser, twitter: e.target.value })}
                                                    placeholder="@username"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium text-slate-700 flex items-center gap-1">
                                                    <Github className="h-4 w-4" />
                                                    GitHub
                                                </label>
                                                <Input
                                                    value={editedUser?.github}
                                                    onChange={(e) => editedUser && setEditedUser({ ...editedUser, github: e.target.value })}
                                                    placeholder="github.com/username"
                                                />
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex flex-wrap gap-4 text-sm text-slate-500">
                                            {user.location && (
                                                <div className="flex items-center gap-1">
                                                    <MapPin className="h-4 w-4" />
                                                    {user.location}
                                                </div>
                                            )}
                                            {user.website && (
                                                <a href={user.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600">
                                                    <Globe className="h-4 w-4" />
                                                    Website
                                                </a>
                                            )}
                                            {user.linkedin && (
                                                <a href={`https://${user.linkedin}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600">
                                                    <Linkedin className="h-4 w-4" />
                                                    LinkedIn
                                                </a>
                                            )}
                                            {user.twitter && (
                                                <a href={`https://twitter.com/${user.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600">
                                                    <Twitter className="h-4 w-4" />
                                                    Twitter
                                                </a>
                                            )}
                                            {user.github && (
                                                <a href={`https://${user.github}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-600">
                                                    <Github className="h-4 w-4" />
                                                    GitHub
                                                </a>
                                            )}
                                            <div className="flex items-center gap-1">
                                                <Calendar className="h-4 w-4" />
                                                Joined {new Date().toLocaleDateString()}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex gap-6 pt-2 border-t border-slate-100">
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-slate-900">{user.follower_count || 0}</span>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Followers</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-slate-900">{user.following_count || 0}</span>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Following</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="font-bold text-slate-900">0</span>
                                        <span className="text-xs text-slate-500 uppercase tracking-wider">Answers</span>
                                    </div>
                                </div>
                            </div>

                            {/* Edit/Save Buttons */}
                            <div className="flex gap-2">
                                {isEditing ? (
                                    <>
                                        <Button onClick={handleSave} disabled={isSaving}>
                                            <Save className="h-4 w-4 mr-2" />
                                            {isSaving ? 'Saving...' : 'Save'}
                                        </Button>
                                        <Button variant="outline" onClick={handleCancel}>
                                            <X className="h-4 w-4 mr-2" />
                                            Cancel
                                        </Button>
                                    </>
                                ) : (
                                    isCurrentUser() ? (
                                        <Button onClick={handleEdit}>
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit Profile
                                        </Button>
                                    ) : (
                                        id && <FollowButton entityId={id} entityType="user" />
                                    )
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Content Tabs */}
                <div className="flex gap-4 border-b border-slate-200">
                    <Button
                        variant="ghost"
                        className={`rounded-none border-b-2 ${activeTab === 'all' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'} hover:bg-transparent`}
                        onClick={() => setActiveTab('all')}
                    >
                        All Activity
                    </Button>
                    <Button
                        variant="ghost"
                        className={`rounded-none border-b-2 ${activeTab === 'questions' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'} hover:bg-transparent`}
                        onClick={() => setActiveTab('questions')}
                    >
                        Questions ({activities.filter(a => a.type === 'question').length})
                    </Button>
                    <Button
                        variant="ghost"
                        className={`rounded-none border-b-2 ${activeTab === 'answers' ? 'border-primary-600 text-primary-600' : 'border-transparent text-slate-500'} hover:bg-transparent`}
                        onClick={() => setActiveTab('answers')}
                    >
                        Answers ({activities.filter(a => a.type === 'answer').length})
                    </Button>
                </div>

                {/* Activity Feed */}
                <div className="space-y-4">
                    {activeTab === 'questions' ? (
                        <>
                            <div className="text-sm text-slate-500 font-medium">Your Questions</div>
                            {questions.length === 0 ? (
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex gap-3">
                                            <MessageSquare className="h-5 w-5 text-slate-400 mt-1" />
                                            <div>
                                                <p className="text-slate-900 font-medium">No questions yet</p>
                                                <p className="text-slate-600 text-sm mt-1">Start by asking a question!</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {questions.map((question) => (
                                        <Card key={question.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex gap-3">
                                                    <MessageSquare className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-start justify-between gap-2">
                                                            <div className="flex-1 min-w-0 cursor-pointer" onClick={() => navigate(`/questions/${question.id}`)}>
                                                                <p className="text-slate-900 font-medium hover:text-primary-600">
                                                                    {question.title}
                                                                </p>
                                                                <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                                                                    {question.description.substring(0, 150)}...
                                                                </p>
                                                            </div>
                                                            <div className="flex items-center gap-2 flex-shrink-0">
                                                                <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full">
                                                                    {question.answers_count} {question.answers_count === 1 ? 'answer' : 'answers'}
                                                                </span>
                                                                {isCurrentUser() && (
                                                                    <>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleEditQuestion(question);
                                                                            }}
                                                                            className="h-8 w-8 p-0"
                                                                        >
                                                                            <Edit className="h-4 w-4" />
                                                                        </Button>
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            onClick={(e) => {
                                                                                e.stopPropagation();
                                                                                handleDeleteQuestion(question.id);
                                                                            }}
                                                                            className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                                                                        >
                                                                            <Trash2 className="h-4 w-4" />
                                                                        </Button>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <p className="text-xs text-slate-500 mt-2">
                                                            {new Date(question.created_at).toLocaleDateString('en-US', {
                                                                month: 'short',
                                                                day: 'numeric',
                                                                year: 'numeric',
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            <div className="text-sm text-slate-500 font-medium">Recent Activity</div>
                            {activities.length === 0 ? (
                                <Card>
                                    <CardContent className="p-4">
                                        <div className="flex gap-3">
                                            <MessageSquare className="h-5 w-5 text-slate-400 mt-1" />
                                            <div>
                                                <p className="text-slate-900 font-medium">No activity yet</p>
                                                <p className="text-slate-600 text-sm mt-1">Start by asking or answering questions!</p>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {activities
                                        .filter(activity => activeTab === 'all' || activity.type === activeTab.slice(0, -1))
                                        .map((activity) => (
                                            <Card key={`${activity.type}-${activity.id}`} className="hover:shadow-md transition-shadow cursor-pointer" onClick={() => navigate(`/questions/${activity.type === 'question' ? activity.id : activity.question_id}`)}>
                                                <CardContent className="p-4">
                                                    <div className="flex gap-3">
                                                        {activity.type === 'question' ? (
                                                            <MessageSquare className="h-5 w-5 text-primary-600 mt-1 flex-shrink-0" />
                                                        ) : (
                                                            <CheckCircle2 className={`h-5 w-5 mt-1 flex-shrink-0 ${activity.is_accepted ? 'text-green-600' : 'text-slate-400'}`} />
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between gap-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-slate-900 font-medium">
                                                                        {activity.type === 'question' ? 'Asked' : 'Answered'}:
                                                                        <span className="ml-1 text-primary-600">
                                                                            {activity.type === 'question' ? activity.title : activity.question_title}
                                                                        </span>
                                                                    </p>
                                                                    {activity.type === 'answer' && activity.content && (
                                                                        <p className="text-slate-600 text-sm mt-1 line-clamp-2">
                                                                            {activity.content.substring(0, 150)}...
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {activity.type === 'question' && activity.answer_count !== undefined && (
                                                                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full flex-shrink-0">
                                                                        {activity.answer_count} {activity.answer_count === 1 ? 'answer' : 'answers'}
                                                                    </span>
                                                                )}
                                                                {activity.type === 'answer' && activity.is_accepted && (
                                                                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full flex-shrink-0">
                                                                        Accepted
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <p className="text-xs text-slate-500 mt-2">
                                                                {new Date(activity.created_at).toLocaleDateString('en-US', {
                                                                    month: 'short',
                                                                    day: 'numeric',
                                                                    year: 'numeric',
                                                                    hour: '2-digit',
                                                                    minute: '2-digit'
                                                                })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Edit Question Modal */}
            {editingQuestion && (
                <EditQuestionModal
                    isOpen={isEditModalOpen}
                    onClose={() => setIsEditModalOpen(false)}
                    question={editingQuestion}
                    onSave={handleSaveQuestion}
                />
            )}
        </MainLayout>
    );
}
