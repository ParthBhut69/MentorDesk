import { useState, useEffect } from 'react';
import { X, Image as ImageIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface EditQuestionModalProps {
    isOpen: boolean;
    onClose: () => void;
    question: {
        id: number;
        title: string;
        description: string;
        image_url?: string | null;
    };
    onSave: (id: number, data: { title: string; description: string; image: string | null }) => Promise<void>;
}

export function EditQuestionModal({ isOpen, onClose, question, onSave }: EditQuestionModalProps) {
    const [title, setTitle] = useState(question.title);
    const [description, setDescription] = useState(question.description);
    const [image, setImage] = useState<string | null>(question.image_url || null);
    const [error, setError] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setTitle(question.title);
        setDescription(question.description);
        setImage(question.image_url || null);
    }, [question]);

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

        setIsSaving(true);
        try {
            await onSave(question.id, {
                title: title.trim(),
                description: description.trim(),
                image
            });
            onClose();
        } catch (err) {
            setError('Failed to update question');
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-slate-900">Edit Question</h2>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                        <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 flex flex-col items-center justify-center hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => document.getElementById('edit-question-image')?.click()}>
                            <input
                                type="file"
                                id="edit-question-image"
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

                    <div className="pt-4 flex justify-end gap-4">
                        <Button type="button" variant="ghost" onClick={onClose}>Cancel</Button>
                        <Button type="submit" disabled={isSaving}>
                            {isSaving ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
