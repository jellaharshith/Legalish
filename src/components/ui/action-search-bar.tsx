"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { motion, AnimatePresence } from "framer-motion";
import {
    Search,
    Send,
    FileText,
    Link as LinkIcon,
    Upload,
    Loader2,
    Wand2,
} from "lucide-react";

function useDebounce<T>(value: T, delay: number = 500): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);

    useEffect(() => {
        const timer = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timer);
        };
    }, [value, delay]);

    return debouncedValue;
}

export interface Action {
    id: string;
    label: string;
    icon: React.ReactNode;
    description?: string;
    short?: string;
    end?: string;
    onClick?: () => void;
}

interface SearchResult {
    actions: Action[];
}

interface ActionSearchBarProps {
    actions?: Action[];
    onActionSelect?: (action: Action) => void;
    placeholder?: string;
    label?: string;
    className?: string;
}

function ActionSearchBar({ 
    actions = [], 
    onActionSelect,
    placeholder = "What would you like to do?",
    label = "Choose Input Method",
    className = ""
}: ActionSearchBarProps) {
    const [query, setQuery] = useState("");
    const [result, setResult] = useState<SearchResult | null>(null);
    const [isFocused, setIsFocused] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [selectedAction, setSelectedAction] = useState<Action | null>(null);
    const debouncedQuery = useDebounce(query, 200);

    useEffect(() => {
        if (!isFocused) {
            setResult(null);
            return;
        }

        if (!debouncedQuery) {
            setResult({ actions: actions });
            return;
        }

        const normalizedQuery = debouncedQuery.toLowerCase().trim();
        const filteredActions = actions.filter((action) => {
            const searchableText = action.label.toLowerCase();
            return searchableText.includes(normalizedQuery);
        });

        setResult({ actions: filteredActions });
    }, [debouncedQuery, isFocused, actions]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setQuery(e.target.value);
        setIsTyping(true);
    };

    const container = {
        hidden: { opacity: 0, height: 0 },
        show: {
            opacity: 1,
            height: "auto",
            transition: {
                height: {
                    duration: 0.4,
                },
                staggerChildren: 0.1,
            },
        },
        exit: {
            opacity: 0,
            height: 0,
            transition: {
                height: {
                    duration: 0.3,
                },
                opacity: {
                    duration: 0.2,
                },
            },
        },
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.3,
            },
        },
        exit: {
            opacity: 0,
            y: -10,
            transition: {
                duration: 0.2,
            },
        },
    };

    // Reset selectedAction when focusing the input
    const handleFocus = () => {
        setSelectedAction(null);
        setIsFocused(true);
    };

    const handleActionClick = (action: Action) => {
        setSelectedAction(action);
        setIsFocused(false);
        if (action.onClick) {
            action.onClick();
        }
        if (onActionSelect) {
            onActionSelect(action);
        }
    };

    return (
        <div className={`w-full max-w-xl mx-auto ${className}`}>
            <div className="relative flex flex-col justify-start items-center min-h-[200px]">
                <div className="w-full sticky top-0 bg-background z-10 pt-4 pb-1">
                    <label
                        className="text-sm font-medium text-muted-foreground mb-2 block"
                        htmlFor="search"
                    >
                        {label}
                    </label>
                    <div className="relative">
                        <Input
                            type="text"
                            placeholder={placeholder}
                            value={query}
                            onChange={handleInputChange}
                            onFocus={handleFocus}
                            onBlur={() =>
                                setTimeout(() => setIsFocused(false), 200)
                            }
                            className="pl-3 pr-9 py-3 h-12 text-base rounded-xl focus-visible:ring-offset-0 border-2 border-muted hover:border-primary/50 focus:border-primary transition-colors"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5">
                            <AnimatePresence mode="popLayout">
                                {query.length > 0 ? (
                                    <motion.div
                                        key="send"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Send className="w-5 h-5 text-muted-foreground" />
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="search"
                                        initial={{ y: -20, opacity: 0 }}
                                        animate={{ y: 0, opacity: 1 }}
                                        exit={{ y: 20, opacity: 0 }}
                                        transition={{ duration: 0.2 }}
                                    >
                                        <Search className="w-5 h-5 text-muted-foreground" />
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>
                </div>

                <div className="w-full">
                    <AnimatePresence>
                        {isFocused && result && !selectedAction && (
                            <motion.div
                                className="w-full border-2 border-primary/20 rounded-xl shadow-lg overflow-hidden bg-background mt-2"
                                variants={container}
                                initial="hidden"
                                animate="show"
                                exit="exit"
                            >
                                <motion.ul className="p-2">
                                    {result.actions.map((action) => (
                                        <motion.li
                                            key={action.id}
                                            className="px-4 py-3 flex items-center justify-between hover:bg-primary/5 cursor-pointer rounded-lg transition-colors border border-transparent hover:border-primary/20"
                                            variants={item}
                                            layout
                                            onClick={() => handleActionClick(action)}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                                                    {action.icon}
                                                </div>
                                                <div>
                                                    <span className="text-base font-medium text-foreground block">
                                                        {action.label}
                                                    </span>
                                                    {action.description && (
                                                        <span className="text-sm text-muted-foreground">
                                                            {action.description}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {action.short && (
                                                    <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                                                        {action.short}
                                                    </span>
                                                )}
                                                {action.end && (
                                                    <span className="text-xs text-primary font-medium">
                                                        {action.end}
                                                    </span>
                                                )}
                                            </div>
                                        </motion.li>
                                    ))}
                                </motion.ul>
                                
                                {result.actions.length === 0 && (
                                    <div className="p-6 text-center text-muted-foreground">
                                        <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                        <p>No matching options found</p>
                                    </div>
                                )}
                                
                                <div className="px-4 py-3 border-t border-border bg-muted/30">
                                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                                        <span>Choose your preferred input method</span>
                                        <span>ESC to cancel</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

export { ActionSearchBar };