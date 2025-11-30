"use client";

import { useState } from "react";
import { Search, Send, MoreVertical, ArrowLeft, Phone, Image as ImageIcon, Paperclip } from "lucide-react";
import Image from "next/image";

// Mock Data
const conversationsData = [
    {
        id: 1,
        user: "Sarah Amrani",
        avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80",
        lastMessage: "Bonjour, est-ce que le prix est négociable ?",
        time: "10:30",
        unread: 2,
        adTitle: "iPhone 14 Pro Max",
        adImage: "https://images.unsplash.com/photo-1678685888221-cda773a3dcdb?auto=format&fit=crop&w=150&q=80",
        online: true,
    },
    {
        id: 2,
        user: "Karim Benali",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80",
        lastMessage: "D'accord, je vous appelle ce soir.",
        time: "Hier",
        unread: 0,
        adTitle: "Appartement F3 - Alger",
        adImage: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=150&q=80",
        online: false,
    },
    {
        id: 3,
        user: "Amina Khelil",
        avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=150&q=80",
        lastMessage: "Merci pour votre réponse rapide !",
        time: "Lun",
        unread: 0,
        adTitle: "Robe de soirée",
        adImage: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?auto=format&fit=crop&w=150&q=80",
        online: true,
    },
];

const messagesData = [
    { id: 1, text: "Bonjour, votre annonce m'intéresse.", sender: "other", time: "10:00" },
    { id: 2, text: "Bonjour ! N'hésitez pas si vous avez des questions.", sender: "me", time: "10:05" },
    { id: 3, text: "Est-ce que le téléphone est toujours disponible ?", sender: "other", time: "10:15" },
    { id: 4, text: "Oui, toujours disponible.", sender: "me", time: "10:20" },
    { id: 5, text: "Est-ce que le prix est négociable ?", sender: "other", time: "10:30" },
];

export default function MessagesPage() {
    const [selectedId, setSelectedId] = useState<number | null>(null);
    const [messageInput, setMessageInput] = useState("");

    // Sur mobile, si un ID est sélectionné, on affiche le chat en plein écran
    // Sur desktop, on affiche toujours la liste à gauche et le chat à droite

    const selectedConversation = conversationsData.find(c => c.id === selectedId);

    return (
        <div className="h-[calc(100vh-8rem)] lg:h-[calc(100vh-9rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex">

            {/* Liste des conversations (Sidebar gauche) */}
            <div className={`w-full lg:w-80 border-r border-gray-200 flex flex-col ${selectedId !== null ? 'hidden lg:flex' : 'flex'}`}>

                {/* Header Liste */}
                <div className="p-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Messages</h2>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                        />
                    </div>
                </div>

                {/* Liste Scrollable */}
                <div className="flex-1 overflow-y-auto">
                    {conversationsData.map((conv) => (
                        <div
                            key={conv.id}
                            onClick={() => setSelectedId(conv.id)}
                            className={`p-4 flex gap-3 cursor-pointer hover:bg-gray-50 transition border-b border-gray-50 ${selectedId === conv.id ? 'bg-orange-50 hover:bg-orange-50' : ''}`}
                        >
                            <div className="relative">
                                <div className="w-12 h-12 rounded-full overflow-hidden relative">
                                    <Image src={conv.avatar} alt={conv.user} fill className="object-cover" />
                                </div>
                                {conv.online && (
                                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <h3 className="font-semibold text-gray-900 truncate">{conv.user}</h3>
                                    <span className="text-xs text-gray-500 whitespace-nowrap">{conv.time}</span>
                                </div>
                                <p className={`text-sm truncate ${conv.unread > 0 ? 'font-semibold text-gray-900' : 'text-gray-500'}`}>
                                    {conv.lastMessage}
                                </p>
                                <div className="flex items-center gap-1 mt-1.5">
                                    <div className="w-4 h-4 rounded overflow-hidden relative flex-shrink-0">
                                        <Image src={conv.adImage} alt="ad" fill className="object-cover" />
                                    </div>
                                    <span className="text-xs text-gray-400 truncate">{conv.adTitle}</span>
                                </div>
                            </div>
                            {conv.unread > 0 && (
                                <div className="flex flex-col justify-center">
                                    <span className="w-5 h-5 bg-primary text-white text-xs font-bold rounded-full flex items-center justify-center">
                                        {conv.unread}
                                    </span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Zone de Chat (Droite) */}
            <div className={`flex-1 flex flex-col bg-gray-50 ${selectedId === null ? 'hidden lg:flex' : 'flex'}`}>
                {selectedId ? (
                    <>
                        {/* Chat Header */}
                        <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between shadow-sm z-10">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => setSelectedId(null)}
                                    className="lg:hidden p-2 -ml-2 hover:bg-gray-100 rounded-full text-gray-600"
                                >
                                    <ArrowLeft size={20} />
                                </button>
                                <div className="w-10 h-10 rounded-full overflow-hidden relative">
                                    <Image src={selectedConversation?.avatar || ""} alt="User" fill className="object-cover" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-900">{selectedConversation?.user}</h3>
                                    <div className="flex items-center gap-2 text-xs text-gray-500">
                                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                        En ligne
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                                    <Phone size={20} />
                                </button>
                                <button className="p-2 text-gray-500 hover:bg-gray-100 rounded-full transition">
                                    <MoreVertical size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Context Annonce (Sticky top under header) */}
                        <div className="bg-orange-50 px-4 py-2 flex items-center justify-between border-b border-orange-100">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-8 h-8 rounded bg-gray-200 relative flex-shrink-0">
                                    <Image src={selectedConversation?.adImage || ""} alt="Ad" fill className="object-cover" />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-900 truncate">{selectedConversation?.adTitle}</p>
                                    <p className="text-xs text-gray-500">180,000 DZD</p>
                                </div>
                            </div>
                            <button className="text-xs font-semibold text-primary hover:underline whitespace-nowrap">
                                Voir l'annonce
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4">
                            {messagesData.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[75%] sm:max-w-[60%] rounded-2xl px-4 py-3 shadow-sm ${msg.sender === 'me'
                                                ? 'bg-primary text-white rounded-br-none'
                                                : 'bg-white text-gray-900 rounded-bl-none border border-gray-100'
                                            }`}
                                    >
                                        <p className="text-sm">{msg.text}</p>
                                        <p className={`text-[10px] mt-1 text-right ${msg.sender === 'me' ? 'text-orange-100' : 'text-gray-400'}`}>
                                            {msg.time}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-200">
                            <div className="flex items-center gap-2">
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                                    <Paperclip size={20} />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition">
                                    <ImageIcon size={20} />
                                </button>
                                <div className="flex-1 relative">
                                    <input
                                        type="text"
                                        value={messageInput}
                                        onChange={(e) => setMessageInput(e.target.value)}
                                        placeholder="Écrivez votre message..."
                                        className="w-full pl-4 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition"
                                    />
                                    <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 bg-primary text-white rounded-full hover:bg-secondary transition shadow-sm">
                                        <Send size={16} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    /* Empty State (Desktop only) */
                    <div className="flex-1 flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                            <MessageCircle size={40} className="text-gray-400" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900">Vos messages</h3>
                        <p className="max-w-xs mt-2">Sélectionnez une conversation pour commencer à discuter avec vos acheteurs.</p>
                    </div>
                )}
            </div>
        </div>
    );
}

// Icon helper for empty state
import { MessageCircle } from "lucide-react";
