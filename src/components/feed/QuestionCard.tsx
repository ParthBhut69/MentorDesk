import { MessageSquare, Share2, MoreHorizontal, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardFooter, CardHeader } from '../ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { BookmarkButton } from '../engagement/BookmarkButton';
import { VoteButton } from '../engagement/VoteButton';
import type { Question } from '../../types';

interface QuestionCardProps {
    question: Question & { image_url?: string };
}

export function QuestionCard({ question }: QuestionCardProps) {
    return (
        <Link to={`/question/${question.id}`}>
            <Card className="group hover:shadow-md transition-all duration-200 border-slate-200 hover:border-primary-200 cursor-pointer bg-white">
                <CardHeader className="flex flex-row items-start gap-4 space-y-0 p-5">
                    <Avatar className="h-11 w-11 border-2 border-white shadow-sm">
                        <AvatarImage src={question.author.avatarUrl} alt={question.author.name} />
                        <AvatarFallback className="bg-primary-50 text-primary-700 font-medium">
                            {question.author.name.charAt(0)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                            <span className="font-semibold text-sm text-slate-900 hover:text-primary-600 transition-colors">
                                {question.author.name}
                            </span>
                            {question.author.isVerified && (
                                <CheckCircle2 className="h-3.5 w-3.5 text-primary-500" />
                            )}
                            <span className="text-xs text-slate-400">•</span>
                            <span className="text-xs text-slate-500">
                                {new Date(question.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        </div>
                        <p className="text-xs text-slate-500 truncate">{question.author.bio}</p>
                    </div>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-slate-600 -mr-2">
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </CardHeader>

                <CardContent className="px-5 pb-4 pt-0">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 leading-snug group-hover:text-primary-600 transition-colors">
                        {question.title}
                    </h3>
                    <p className="text-slate-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {question.content}
                    </p>
                    {question.image_url && (
                        <div className="mb-4">
                            <img
                                src={question.image_url}
                                alt="Question attachment"
                                className="rounded-lg max-h-60 w-full object-cover border border-slate-100"
                            />
                        </div>
                    )}
                    <div className="flex flex-wrap gap-2">
                        {question.tags.map((tag) => (
                            <Badge
                                key={tag}
                                variant="secondary"
                                className="px-2.5 py-0.5 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 border-transparent transition-colors"
                            >
                                {tag}
                            </Badge>
                        ))}
                    </div>
                </CardContent>

                <CardFooter className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex flex-wrap items-center gap-4">
                    <div onClick={(e) => e.stopPropagation()}>
                        <VoteButton
                            votableType="question"
                            votableId={parseInt(question.id)}
                            initialUpvotes={question.upvotes}
                        />
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-primary-600 hover:bg-primary-50 gap-1.5 rounded-full transition-colors">
                        <MessageSquare className="h-4 w-4" />
                        <span className="text-xs font-medium">{question.answersCount}</span>
                    </Button>
                    <div onClick={(e) => e.stopPropagation()}>
                        <BookmarkButton questionId={parseInt(question.id)} />
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 px-2 text-slate-500 hover:text-slate-900 gap-1.5 rounded-full">
                        <Share2 className="h-4 w-4" />
                        <span className="text-xs font-medium hidden sm:inline">Share</span>
                    </Button>
                </CardFooter>
            </Card>
        </Link>
    );
}
