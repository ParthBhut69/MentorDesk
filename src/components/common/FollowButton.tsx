import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/lib/auth';
import { api } from '@/lib/api';
import { toast } from 'react-hot-toast';

interface FollowButtonProps {
    entityId: number | string;
    entityType: 'user' | 'category' | 'tag';
    className?: string;
    onFollowChange?: (isFollowing: boolean) => void;
}

export const FollowButton: React.FC<FollowButtonProps> = ({
    entityId,
    entityType,
    className = '',
    onFollowChange
}) => {
    const { user } = useAuth();
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (user) {
            checkFollowStatus();
        } else {
            setChecking(false);
        }
    }, [user, entityId, entityType]);

    const checkFollowStatus = async () => {
        try {
            const response = await api.get(`/followers/check/${entityId}?type=${entityType}`);
            setIsFollowing(response.data.following);
        } catch (error) {
            console.error('Error checking follow status:', error);
        } finally {
            setChecking(false);
        }
    };

    const handleFollowToggle = async () => {
        if (!user) {
            toast.error('Please login to follow');
            return;
        }

        if (entityType === 'user' && user.id === Number(entityId)) {
            toast.error("You can't follow yourself");
            return;
        }

        setLoading(true);
        try {
            if (isFollowing) {
                await api.delete(`/followers/unfollow/${entityId}?type=${entityType}`);
                setIsFollowing(false);
                toast.success(`Unfollowed ${entityType}`);
            } else {
                await api.post('/followers/follow', { user_id: entityId, type: entityType });
                setIsFollowing(true);
                toast.success(`Followed ${entityType}`);
            }

            if (onFollowChange) {
                onFollowChange(!isFollowing);
            }
        } catch (error: any) {
            console.error('Error toggling follow:', error);
            toast.error(error.response?.data?.message || 'Something went wrong');
        } finally {
            setLoading(false);
        }
    };

    if (checking) return null;

    return (
        <Button
            variant={isFollowing ? "outline" : "default"}
            size="sm"
            className={className}
            onClick={handleFollowToggle}
            disabled={loading}
        >
            {loading ? 'Processing...' : isFollowing ? 'Following' : 'Follow'}
        </Button>
    );
};
