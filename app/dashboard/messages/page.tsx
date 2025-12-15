"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Send, MoreVertical, ArrowLeft, Image as ImageIcon, Paperclip, MessageCircle, Loader2, RefreshCw } from "lucide-react";
import Image from "next/image";
import { useMessages, Conversation, ConversationMessage } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Composant pour l'avatar avec placeholder
const Avatar = ({ src, alt, size = 48, online }: { src?: string | null; alt: string; size?: number; online?: boolean }) => {
    const initials = alt?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
        <div className="relative" style={{ width: size, height: size }}>
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="rounded-full object-cover"
                />
            ) : (
                <div
                    className="rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-semibold"
                    style={{ width: size, height: size, fontSize: size * 0.35 }}
                >
                    {initials}
                </div>
            )}
            {online && (
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
            )}
        </div>
    );
};

// Composant pour un message dans le chat
const MessageBubble = ({ message, isOwnMessage }: { message: ConversationMessage; isOwnMessage: boolean }) => {
    const formattedTime = formatDistanceToNow(new Date(message.createdAt), {
        addSuffix: false,
        locale: fr
    });

    return (
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
            <div
                className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm ${isOwnMessage
                    ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-none'
                    : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'
                    }`}
            >
                <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                <div className={`flex items-center gap-1 mt-1 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <p className={`text-[10px] ${isOwnMessage ? 'text-orange-100' : 'text-gray-400'}`}>
                        {formattedTime}
                    </p>
                    {isOwnMessage && message.read && (
                        <span className="text-[10px] text-orange-100">✓✓</span>
                    )}
                </div>
            </div>
        </div>
    );
};

// Composant pour une conversation dans la liste
const ConversationItem = ({
    conversation,
    isSelected,
    onClick,
    currentUserId
}: {
    conversation: Conversation;
    isSelected: boolean;
    onClick: () => void;
    currentUserId?: string;
}) => {
    const otherParticipant = conversation.participants.find(p => p.id !== currentUserId);
    const lastMessage = conversation.lastMessage || conversation.messages?.[0];

    const formattedTime = lastMessage
        ? formatDistanceToNow(new Date(lastMessage.createdAt), { addSuffix: false, locale: fr })
        : '';

    return (
        <div
            onClick={onClick}
            className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${isSelected ? 'bg-orange-50 hover:bg-orange-50' : ''
                }`}
        >
            <Avatar
                src={otherParticipant?.avatar}
                alt={otherParticipant?.name || 'Utilisateur'}
                size={48}
            />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="font-semibold text-gray-900 truncate">
                        {otherParticipant?.name || 'Utilisateur'}
                    </h3>
                    <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                        {formattedTime}
                    </span>
                </div>
                <p className={`text-sm truncate ${conversation.unreadCount > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'
                    }`}>
                    {lastMessage?.content || 'Aucun message'}
                </p>
                {conversation.adTitle && (
                    <div className="flex items-center gap-1 mt-1.5">
                        <span className="text-xs text-gray-400 truncate">
                            📦 {conversation.adTitle}
                        </span>
                    </div>
                )}
            </div>
            {conversation.unreadCount > 0 && (
                <div className="flex flex-col justify-center">
                    <span className="w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                        {conversation.unreadCount}
                    </span>
                </div>
            )}
        </div>
    );
};

// Skeleton loader pour la liste des conversations
const ConversationSkeleton = () => (
    <div className="p-4 flex gap-3 animate-pulse">
        <div className="w-12 h-12 rounded-full bg-gray-200"></div>
        <div className="flex-1">
            <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-48"></div>
        </div>
    </div>
);


export default function MessagesPage() {
    const searchParams = useSearchParams();
    const conversationIdFromUrl = searchParams?.get('conversation') || null;

    const {
        conversations,
        selectedConversation,
        messages,
        isLoading,
        error,
        selectConversation,
        sendMessage,
        getOtherParticipant,
        currentUserId,
        unreadTotal,
    } = useMessages();

    const [messageInput, setMessageInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");
    const [isSending, setIsSending] = useState(false);
    const [hasAutoSelected, setHasAutoSelected] = useState(false);
    const messagesContainerRef = useRef<HTMLDivElement>(null);
    const lastMessageCountRef = useRef<number>(0);
    const isInitialLoadRef = useRef<boolean>(true);

    // Ouvrir automatiquement la conversation depuis l'URL
    useEffect(() => {
        if (conversationIdFromUrl && !isLoading && conversations.length > 0 && !hasAutoSelected) {
            const exists = conversations.find(c => c.id === conversationIdFromUrl);
            if (exists) {
                selectConversation(conversationIdFromUrl);
                setHasAutoSelected(true);
            }
        }
    }, [conversationIdFromUrl, isLoading, conversations, hasAutoSelected, selectConversation]);

    // Scroll automatique vers le bas seulement quand il y a de nouveaux messages
    const scrollToBottom = (smooth = true) => {
        const container = messagesContainerRef.current;
        if (container) {
            if (smooth) {
                container.scrollTo({
                    top: container.scrollHeight,
                    behavior: 'smooth'
                });
            } else {
                container.scrollTop = container.scrollHeight;
            }
        }
    };

    useEffect(() => {
        if (messages.length > 0) {
            if (isInitialLoadRef.current) {
                // Premier chargement : scroller immédiatement sans animation
                scrollToBottom(false);
                isInitialLoadRef.current = false;
                lastMessageCountRef.current = messages.length;
            } else if (messages.length > lastMessageCountRef.current) {
                // Nouveau message : scroller avec animation
                scrollToBottom(true);
                lastMessageCountRef.current = messages.length;
            }
        }
    }, [messages.length]);

    // Reset les refs quand on change de conversation
    useEffect(() => {
        isInitialLoadRef.current = true;
        lastMessageCountRef.current = 0;
    }, [selectedConversation?.id]);

    // Filtrer les conversations par recherche
    const filteredConversations = conversations.filter((conv) => {
        const other = getOtherParticipant(conv);
        const searchLower = searchQuery.toLowerCase();
        return (
            other?.name?.toLowerCase().includes(searchLower) ||
            conv.adTitle?.toLowerCase().includes(searchLower) ||
            conv.lastMessage?.content.toLowerCase().includes(searchLower)
        );
    });

    // Envoyer un message
    const handleSendMessage = async () => {
        if (!messageInput.trim() || isSending) return;

        setIsSending(true);
        const success = await sendMessage(messageInput);

        if (success) {
            setMessageInput("");
        }

        setIsSending(false);
    };

    // Envoyer avec Entrée
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;

    return (
        <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-9rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">

            {/* Liste des conversations (Sidebar gauche) */}
            <div className={`w-full lg:w-80 border-r border-gray-200 flex flex-col ${selectedConversation !== null ? 'hidden lg:flex' : 'flex'}`}>

                {/* Header Liste */}
                <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-xl font-bold text-gray-900">
                            Messages
                            {unreadTotal > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs bg-primary text-white rounded-full">
                                    {unreadTotal}
                                </span>
                            )}
                        </h2>
                        <div className="flex items-center gap-2">
                            <span className="flex items-center gap-1 text-xs text-green-600">
                                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                                Sync auto
                            </span>
                        </div>
                    </div>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Rechercher..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        />
                    </div>
                </div>

                {/* Liste Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {isLoading ? (
                        <>
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                        </>
                    ) : error ? (
                        <div className="p-4 text-center text-red-500">
                            <p>{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-2 text-sm text-primary hover:underline"
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center text-gray-500">
                            <MessageCircle size={48} className="mx-auto mb-4 text-gray-300" />
                            <p className="font-medium">Aucune conversation</p>
                            <p className="text-sm mt-1">
                                {searchQuery
                                    ? 'Aucun résultat pour cette recherche'
                                    : 'Commencez une conversation depuis une annonce'
                                }
                            </p>
                        </div>
                    ) : (
                        filteredConversations.map((conv) => (
                            <ConversationItem
                                key={conv.id}
                                conversation={conv}
                                isSelected={selectedConversation?.id === conv.id}
                                onClick={() => selectConversation(conv.id)}
                                currentUserId={currentUserId}
                            />
                        ))
                    )}
                </div>
            </div>

            {/* Zone de Chat (Droite) */}
            <div className={`flex-1 flex flex-col bg-gray-50 ${selectedConversation === null ? 'hidden lg:flex' : 'flex'}`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => selectConversation(null)}
                                    className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <Avatar
                                    src={otherParticipant?.avatar}
                                    alt={otherParticipant?.name || 'Utilisateur'}
                                    size={40}
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900">
                                        {otherParticipant?.name || 'Utilisateur'}
                                    </h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        En ligne
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">

                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Context Annonce */}
                        {selectedConversation.adTitle && (
                            <div className="bg-orange-50 px-4 py-2 flex items-center justify-between border-b border-orange-100">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-8 h-8 rounded bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                        📦
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {selectedConversation.adTitle}
                                        </p>
                                    </div>
                                </div>
                                {selectedConversation.adId && (
                                    <a
                                        href={`/annonces/${selectedConversation.adId}`}
                                        className="text-xs font-semibold text-primary hover:underline whitespace-nowrap"
                                    >
                                        Voir l'annonce
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Messages Area */}
                        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-12">
                                    <MessageCircle size={48} className="text-gray-300 mb-4" />
                                    <p className="text-center">
                                        Commencez la conversation !<br />
                                        <span className="text-sm">Envoyez votre premier message</span>
                                    </p>
                                </div>
                            ) : (
                                messages.map((msg) => (
                                    <MessageBubble
                                        key={msg.id}
                                        message={msg}
                                        isOwnMessage={msg.senderId === currentUserId}
                                    />
                                ))
                            )}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                                    <Paperclip size={20} />
                                </button>
                                <button type="button" className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                                    <ImageIcon size={20} />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Écrivez votre message..."
                                        className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                        disabled={isSending}
                                    />
                                    <button
                                        type="button"
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            handleSendMessage();
                                        }}
                                        disabled={!messageInput.trim() || isSending}
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-gradient-to-br from-primary to-secondary text-white rounded-full hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isSending ? (
                                            <Loader2 size={16} className="animate-spin" />
                                        ) : (
                                            <Send size={16} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State (Desktop only) */
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                        <div className="w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full flex items-center justify-center mb-6">
                            <MessageCircle size={48} className="text-primary" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900">Vos messages</h3>
                        <p className="max-w-xs mt-2 text-gray-500">
                            Sélectionnez une conversation pour commencer à discuter avec vos acheteurs ou vendeurs.
                        </p>
                        <div className="mt-4 flex items-center gap-2 text-sm text-green-600 bg-green-50 px-4 py-2 rounded-lg">
                            <RefreshCw size={16} className="animate-spin" />
                            Synchronisation automatique activée
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
