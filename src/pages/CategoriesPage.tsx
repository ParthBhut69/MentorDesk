import { useState, useEffect } from 'react';
import { MainLayout } from '../layouts/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { FollowButton } from '../components/common/FollowButton';
import { api } from '@/lib/api';

interface Category {
    id: number;
    name: string;
    slug: string;
    description: string;
    image_url?: string;
    follower_count: number;
}

export function CategoriesPage() {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories');
            setCategories(response.data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <MainLayout>
            <div className="max-w-4xl mx-auto py-8 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-slate-900">Categories</h1>
                </div>

                {loading ? (
                    <div className="text-center py-10 text-slate-500">Loading categories...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {categories.map((category) => (
                            <Card key={category.id} className="hover:shadow-md transition-shadow">
                                <CardHeader className="pb-2">
                                    <CardTitle className="flex justify-between items-start">
                                        <span className="text-xl">{category.name}</span>
                                        <FollowButton entityId={category.id} entityType="category" />
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-slate-600 text-sm mb-4 min-h-[40px]">
                                        {category.description || 'No description available.'}
                                    </p>
                                    <div className="flex items-center text-xs text-slate-500">
                                        <span>{category.follower_count} followers</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </MainLayout>
    );
}
