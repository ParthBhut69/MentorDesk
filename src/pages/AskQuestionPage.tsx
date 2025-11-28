import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { X, Image as ImageIcon } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { API_URL } from '../config/api';

export function AskQuestionPage() {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [currentTag, setCurrentTag] = useState('');
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const navigate = useNavigate();

    const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault();
            if (!tags.includes(currentTag.trim()) && tags.length < 5) {
                setTags([...tags, currentTag.trim()]);
            }
            setCurrentTag('');
        }
    };

    const removeTag = (tagToRemove: string) => {
        setTags(tags.filter(tag => tag !== tagToRemove));
    };

    const [image, setImage] = useState<string | null>(null);

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (!file.type.startsWith('image/')) {
                setError('Please select an image file');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setImage(reader.result as string);
                setError('');
            };
            reader.readAsDataURL(file);
        }
    };

    const removeImage = () => {
        setImage(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!title.trim() || !description.trim()) {
            setError('Please fill in both title and description');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            setError('You must be logged in to post a question');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch(`${API_URL}/api/questions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    title: title.trim(),
                    description: description.trim(),
                    tags,
                    image_url: image
                })
            });

            const data = await response.json();

            if (response.ok) {
                navigate('/');
            } else {
                setError(data.message || 'Failed to post question');
            }
        } catch (err) {
            setError('Something went wrong. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDiscard = () => {
        setTitle('');
        setDescription('');
        setTags([]);
        setImage(null);
        navigate('/');
    };

    return (
        <MainLayout>
            <div className="max-w-3xl mx-auto py-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-2xl">Ask a Public Question</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {error && <div className="text-red-500 text-sm text-center bg-red-50 p-3 rounded">{error}</div>}

                            {/* Title */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">
                                    Title
                                    <span className="text-slate-500 ml-1 font-normal">
                                        (Be specific and imagine you're asking a question to another person)
                                    </span>
                                </label>
                                <Input
                                    placeholder="e.g. How do I handle VAT for digital services in the EU?"
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Description */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">
                                    Description
                                    <span className="text-slate-500 ml-1 font-normal">
                                        (Include all the information someone would need to answer your question)
                                    </span>
                                </label>
                                <textarea
                                    className="flex min-h-[200px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    placeholder="Describe your business problem in detail..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    required
                                />
                            </div>

                            {/* Attachments */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">Attachments</label>
                                <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => document.getElementById('question-image')?.click()}>
                                    <input
                                        type="file"
                                        id="question-image"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                    />
                                    <div className="flex gap-4 mb-2">
                                        <div className="p-2 bg-blue-50 rounded-full text-blue-600"><ImageIcon className="h-5 w-5" /></div>
                                    </div>
                                    <p className="text-sm text-slate-600 font-medium">Click to upload an image</p>
                                    <p className="text-xs text-slate-400 mt-1">Supports JPG, PNG (Max 5MB)</p>
                                </div>

                                {/* Image Preview */}
                                {image && (
                                    <div className="relative mt-4 inline-block">
                                        <img src={image} alt="Preview" className="max-h-48 rounded-lg border border-slate-200" />
                                        <button
                                            type="button"
                                            onClick={removeImage}
                                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Tags */}
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-900">
                                    Tags
                                    <span className="text-slate-500 ml-1 font-normal">
                                        (Add up to 5 tags to describe what your question is about)
                                    </span>
                                </label>
                                <Input
                                    placeholder="e.g. Finance, HR, Marketing (Press Enter to add)"
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={handleAddTag}
                                />

                                {/* Suggested Tags */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs text-slate-500 mr-2">Suggested:</span>
                                    {['Business', 'Finance', 'HR', 'Startups', 'Legal', 'Tech'].map((suggestedTag) => (
                                        <button
                                            key={suggestedTag}
                                            type="button"
                                            onClick={() => {
                                                if (!tags.includes(suggestedTag) && tags.length < 5) {
                                                    setTags([...tags, suggestedTag]);
                                                }
                                            }}
                                            className="px-2 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            disabled={tags.includes(suggestedTag) || tags.length >= 5}
                                        >
                                            {suggestedTag}
                                        </button>
                                    ))}
                                </div>

                                {/* Selected Tags */}
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {tags.map(tag => (
                                        <Badge key={tag} variant="secondary" className="px-2 py-1 gap-1">
                                            {tag}
                                            <X
                                                className="h-3 w-3 cursor-pointer hover:text-red-500"
                                                onClick={() => removeTag(tag)}
                                            />
                                        </Badge>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-4 flex justify-end gap-4">
                                <Button type="button" variant="ghost" onClick={handleDiscard}>Discard</Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? 'Posting...' : 'Post Question'}
                                </Button>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </MainLayout>
    );
}
