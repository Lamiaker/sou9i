"use client";

import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { Search, Send, MoreVertical, ArrowLeft, Image as ImageIcon, Paperclip, MessageCircle, Loader2, RefreshCw, Phone, Video } from "lucide-react";
import Image from "next/image";
import { useMessages, Conversation, ConversationMessage } from "@/hooks/useMessages";
import { formatDistanceToNow } from "date-fns";
import { fr } from "date-fns/locale";

// Composant pour l'avatar avec placeholder
const Avatar = ({ src, alt, size = 48, online, showStatus = true }: { src?: string | null; alt: string; size?: number; online?: boolean; showStatus?: boolean }) => {
    const initials = alt?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || '?';

    return (
        <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
            {src ? (
                <Image
                    src={src}
                    alt={alt}
                    fill
                    className="rounded-full object-cover ring-2 ring-white shadow-sm"
                />
            ) : (
                <div
                    className="rounded-full bg-gradient-to-br from-primary via-primary to-secondary flex items-center justify-center text-white font-semibold ring-2 ring-white shadow-sm"
                    style={{ width: size, height: size, fontSize: size * 0.35 }}
                >
                    {initials}
                </div>
            )}
            {showStatus && online && (
                <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm"></div>
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
        <div className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} animate-fade-in`}>
            <div
                className={`max-w-[80%] sm:max-w-[70%] rounded-2xl px-4 py-3 ${isOwnMessage
                    ? 'bg-gradient-to-br from-primary to-secondary text-white rounded-br-sm shadow-lg shadow-primary/20'
                    : 'bg-white text-gray-900 rounded-bl-sm shadow-md border border-gray-100'
                    }`}
            >
                <p className="text-[15px] leading-relaxed whitespace-pre-wrap break-words">{message.content}</p>
                <div className={`flex items-center gap-1.5 mt-2 ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                    <p className={`text-[11px] ${isOwnMessage ? 'text-white/70' : 'text-gray-400'}`}>
                        {formattedTime}
                    </p>
                    {isOwnMessage && message.read && (
                        <span className="text-[11px] text-white/70">✓✓</span>
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
            className={`group p-4 flex gap-3 cursor-pointer transition-all duration-200 border-b border-gray-100/80
                ${isSelected
                    ? 'bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border-l-4 border-l-primary'
                    : 'hover:bg-gray-50/80 border-l-4 border-l-transparent'
                }`}
        >
            <Avatar
                src={otherParticipant?.avatar}
                alt={otherParticipant?.name || 'Utilisateur'}
                size={52}
                online={true}
            />
            <div className="flex-1 min-w-0">
                <div className="flex justify-between items-center mb-1">
                    <h3 className={`font-semibold truncate ${isSelected ? 'text-primary' : 'text-gray-900'}`}>
                        {otherParticipant?.name || 'Utilisateur'}
                    </h3>
                    <span className="text-[11px] text-gray-400 whitespace-nowrap ml-2 font-medium">
                        {formattedTime}
                    </span>
                </div>
                <p className={`text-sm truncate leading-relaxed ${conversation.unreadCount > 0 ? 'font-semibold text-gray-800' : 'text-gray-500'
                    }`}>
                    {lastMessage?.content || 'Aucun message'}
                </p>
                {conversation.adTitle && (
                    <div className="flex items-center gap-1.5 mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                            <span>📦</span>
                            <span className="truncate max-w-[150px]">{conversation.adTitle}</span>
                        </span>
                    </div>
                )}
            </div>
            {conversation.unreadCount > 0 && (
                <div className="flex flex-col justify-center">
                    <span className="w-6 h-6 bg-gradient-to-br from-primary to-secondary text-white text-xs font-bold rounded-full flex items-center justify-center shadow-md shadow-primary/30">
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
        <div className="w-[52px] h-[52px] rounded-full bg-gradient-to-br from-gray-200 to-gray-100"></div>
        <div className="flex-1">
            <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-32 mb-2.5"></div>
            <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-100 rounded-full w-48 mb-2"></div>
            <div className="h-5 bg-gradient-to-r from-gray-100 to-gray-50 rounded-full w-24"></div>
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
                // Auto-selection state - intentional setState
                // eslint-disable-next-line react-hooks/set-state-in-effect
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
        <div className="h-full bg-white lg:rounded-2xl lg:shadow-xl lg:border border-gray-200/50 overflow-hidden flex relative">

            {/* Liste des conversations (Sidebar gauche) */}
            <div className={`w-full lg:w-96 lg:border-r border-gray-200/80 flex flex-col bg-white ${selectedConversation !== null ? 'hidden lg:flex' : 'flex'}`}>

                {/* Header Liste - Design amélioré */}
                <div className="bg-gradient-to-r from-gray-50 to-white border-b border-gray-200/80 sticky top-0 z-10">
                    <div className="p-4 pb-3">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg shadow-primary/30">
                                    <MessageCircle size={20} className="text-white" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-gray-900">
                                        Messages
                                    </h2>
                                    <p className="text-xs text-gray-500">{conversations.length} conversation{conversations.length > 1 ? 's' : ''}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadTotal > 0 && (
                                    <span className="px-2.5 py-1 text-xs font-bold bg-gradient-to-r from-primary to-secondary text-white rounded-full shadow-md shadow-primary/30">
                                        {unreadTotal} nouveau{unreadTotal > 1 ? 'x' : ''}
                                    </span>
                                )}
                                <span className="flex items-center gap-1.5 text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full">
                                    <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                    Sync
                                </span>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Rechercher une conversation..."
                                className="w-full pl-11 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all shadow-sm"
                            />
                        </div>
                    </div>
                </div>

                {/* Liste Scrollable */}
                <div className="flex-1 overflow-y-auto overscroll-contain">
                    {isLoading ? (
                        <>
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                            <ConversationSkeleton />
                        </>
                    ) : error ? (
                        <div className="p-6 text-center">
                            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                                <MessageCircle size={32} className="text-red-400" />
                            </div>
                            <p className="text-red-500 font-medium">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="mt-3 text-sm text-primary hover:underline font-medium"
                            >
                                Réessayer
                            </button>
                        </div>
                    ) : filteredConversations.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center">
                                <MessageCircle size={40} className="text-gray-300" />
                            </div>
                            <p className="font-semibold text-gray-700">Aucune conversation</p>
                            <p className="text-sm mt-2 text-gray-500 max-w-[200px] mx-auto">
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
            <div className={`flex-1 flex flex-col bg-gradient-to-b from-gray-50 to-gray-100/50 overflow-hidden ${selectedConversation === null ? 'hidden lg:flex' : 'flex absolute inset-0 lg:static'}`}>
                {selectedConversation ? (
                    <>
                        {/* Chat Header - Design premium */}
                        <div className="px-4 pt-4 pb-3 bg-white/95 backdrop-blur-sm border-b border-gray-200/80 flex items-center justify-between shadow-sm flex-shrink-0 z-20">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => selectConversation(null)}
                                    className="lg:hidden p-2 -ml-2 mr-1 hover:bg-gray-100 rounded-xl text-gray-600 transition-colors"
                                >
                                    <ArrowLeft size={22} />
                                </button>
                                <Avatar
                                    src={otherParticipant?.avatar}
                                    alt={otherParticipant?.name || 'Utilisateur'}
                                    size={44}
                                    online={true}
                                />
                                <div>
                                    <h3 className="font-bold text-gray-900 text-[15px]">
                                        {otherParticipant?.name || 'Utilisateur'}
                                    </h3>
                                    <div className="flex items-center gap-1.5 text-xs text-emerald-600">
                                        <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                                        En ligne
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <button className="p-2.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                                    <Phone size={18} />
                                </button>
                                <button className="p-2.5 text-gray-500 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                                    <Video size={18} />
                                </button>
                                <button className="p-2.5 text-gray-500 hover:bg-gray-100 rounded-xl transition-all">
                                    <MoreVertical size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Context Annonce - Design amélioré */}
                        {selectedConversation.adTitle && (
                            <div className="bg-gradient-to-r from-orange-50 to-amber-50/50 px-4 py-2.5 flex items-center justify-between border-b border-orange-100/80">
                                <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                                        📦
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500">Concernant l'annonce</p>
                                        <p className="text-sm font-semibold text-gray-900 truncate">
                                            {selectedConversation.adTitle}
                                        </p>
                                    </div>
                                </div>
                                {selectedConversation.adId && (
                                    <a
                                        href={`/annonces/${selectedConversation.adId}`}
                                        className="text-xs font-bold text-primary hover:text-secondary transition-colors whitespace-nowrap bg-white px-3 py-1.5 rounded-lg shadow-sm border border-orange-100"
                                    >
                                        Voir →
                                    </a>
                                )}
                            </div>
                        )}

                        {/* Messages Area */}
                        <div ref={messagesContainerRef} className="flex-1 min-h-0 overflow-y-auto overscroll-contain p-4 space-y-3">
                            {messages.length === 0 ? (
                                <div className="flex-1 flex flex-col items-center justify-center text-gray-500 py-16">
                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/10 to-secondary/10 flex items-center justify-center mb-4">
                                        <MessageCircle size={36} className="text-primary" />
                                    </div>
                                    <p className="text-center font-medium text-gray-700">
                                        Commencez la conversation !
                                    </p>
                                    <p className="text-sm text-gray-500 mt-1">Envoyez votre premier message</p>
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

                        {/* Input Area - Design premium */}
                        <div className="p-3 md:p-4 bg-white border-t border-gray-200/80 flex-shrink-0">
                            <div className="flex items-center gap-2">
                                <div className="hidden sm:flex items-center gap-1">
                                    <button type="button" className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                                        <Paperclip size={20} />
                                    </button>
                                    <button type="button" className="p-2.5 text-gray-400 hover:text-primary hover:bg-primary/10 rounded-xl transition-all">
                                        <ImageIcon size={20} />
                                    </button>
                                </div>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        onKeyDown={handleKeyPress}
                                        placeholder="Écrivez votre message..."
                                        className="w-full pl-4 pr-14 py-3.5 bg-gray-50 border border-gray-200 rounded-2xl text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary focus:bg-white transition-all"
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
                                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 bg-gradient-to-br from-primary to-secondary text-white rounded-xl hover:shadow-lg hover:shadow-primary/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                    >
                                        {isSending ? (
                                            <Loader2 size={18} className="animate-spin" />
                                        ) : (
                                            <Send size={18} />
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State (Desktop only) */
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                        <div className="w-28 h-28 bg-gradient-to-br from-primary/15 to-secondary/15 rounded-3xl flex items-center justify-center mb-6 shadow-lg shadow-primary/10">
                            <MessageCircle size={52} className="text-primary" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900">Vos messages</h3>
                        <p className="max-w-sm mt-3 text-gray-500 leading-relaxed">
                            Sélectionnez une conversation pour commencer à discuter avec vos acheteurs ou vendeurs.
                        </p>
                        <div className="mt-6 flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 px-5 py-2.5 rounded-full font-medium">
                            <RefreshCw size={16} className="animate-spin" />
                            Synchronisation automatique activée
                        </div>
                    </div>
                )}
            </div>

            {/* Styles pour les animations */}
            <style jsx global>{`
                @keyframes fade-in {
                    from { opacity: 0; transform: translateY(8px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fade-in {
                    animation: fade-in 0.2s ease-out;
                }
            `}</style>
        </div>
    );
}
