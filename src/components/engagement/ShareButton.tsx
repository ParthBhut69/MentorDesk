import { Share2, Twitter, Linkedin, Facebook, Link as LinkIcon } from 'lucide-react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface ShareButtonProps {
    questionId: number;
    questionTitle: string;
}

export function ShareButton({ questionId, questionTitle }: ShareButtonProps) {
    const url = `${window.location.origin}/question/${questionId}`;
    const text = `Check out this question: ${questionTitle}`;

    const shareToTwitter = () => {
        window.open(
            `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`,
            '_blank'
        );
    };

    const shareToLinkedIn = () => {
        window.open(
            `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
            '_blank'
        );
    };

    const shareToFacebook = () => {
        window.open(
            `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
            '_blank'
        );
    };

    const copyLink = () => {
        navigator.clipboard.writeText(url);
        alert('Link copied to clipboard!');
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm">
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={shareToTwitter}>
                    <Twitter className="h-4 w-4 mr-2" />
                    Share on Twitter
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToLinkedIn}>
                    <Linkedin className="h-4 w-4 mr-2" />
                    Share on LinkedIn
                </DropdownMenuItem>
                <DropdownMenuItem onClick={shareToFacebook}>
                    <Facebook className="h-4 w-4 mr-2" />
                    Share on Facebook
                </DropdownMenuItem>
                <DropdownMenuItem onClick={copyLink}>
                    <LinkIcon className="h-4 w-4 mr-2" />
                    Copy Link
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
