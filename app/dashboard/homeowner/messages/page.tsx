"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Reveal } from "@/components/ui/Reveal";
import {
    MessageSquare,
    Send,
    Search,
    Plus,
    CheckCheck,
    ChevronLeft
} from "lucide-react";
import { auth, db } from "@/lib/firebase";

import {
    doc,
    getDoc,
    collection,
    addDoc,
    query,
    where,
    orderBy,
    onSnapshot,
    serverTimestamp,
    updateDoc,
    increment,
    Timestamp
} from "firebase/firestore";
import { cn } from "@/lib/utils";
import { createNotification } from "@/lib/notifications";

export default function HomeownerMessagesPage() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [activeChat, setActiveChat] = useState<any>(null);
    const [conversations, setConversations] = useState<any[]>([]);
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [showChatOnMobile, setShowChatOnMobile] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isUploading, setIsUploading] = useState(false);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // 1. Fetch all conversations for the current homeowner
    useEffect(() => {
        if (!auth.currentUser) return;

        const q = query(
            collection(db, "chats"),
            where("participants", "array-contains", auth.currentUser.uid)
        );

        const unsubscribe = onSnapshot(q, async (snapshot) => {
            const chats = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));

            // Force update names for BOTH participants if they are generic or missing
            const updatedChats = await Promise.all(chats.map(async (chat: any) => {
                const needsUpdate = chat.participants?.some((uid: string) => {
                    const name = chat.participantData?.[uid]?.name;
                    return !name || ["Homeowner", "Client User", "Tenant", "Anonymous Tenant", "TENANT", "ANONYMOUS TENANT"].includes(name);
                });

                if (needsUpdate) {
                    for (const uid of chat.participants || []) {
                        try {
                            const userDoc = await getDoc(doc(db, "users", uid));
                            if (userDoc.exists()) {
                                const realData = userDoc.data();
                                const realName = realData.fullName || realData.displayName || (chat.homeownerId === uid ? "Homeowner" : "Client User");

                                if (!chat.participantData) chat.participantData = {};
                                if (!chat.participantData[uid]) chat.participantData[uid] = {};
                                chat.participantData[uid].name = realName;
                            }
                        } catch (e) {
                            console.error("Error fetching user data:", e);
                        }
                    }
                }
                return chat;
            }));

            // Sort in-memory to avoid index requirement
            updatedChats.sort((a: any, b: any) => {
                const timeA = a.updatedAt?.seconds || 0;
                const timeB = b.updatedAt?.seconds || 0;
                return timeB - timeA;
            });

            setConversations(updatedChats);
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // 2. Sync Active Chat data when conversations update (for name refresh)
    useEffect(() => {
        if (activeChat && conversations.length > 0) {
            const updated = conversations.find(c => c.id === activeChat.id);
            if (updated && JSON.stringify(updated.participantData) !== JSON.stringify(activeChat.participantData)) {
                setActiveChat(updated);
            }
        }
    }, [conversations, activeChat?.id]);

    // 3. Listen for messages in active chat
    useEffect(() => {
        if (!activeChat?.id) {
            setMessages([]);
            return;
        }

        const q = query(
            collection(db, `chats/${activeChat.id}/messages`),
            orderBy("createdAt", "asc")
        );

        const unsubscribe = onSnapshot(q, (snapshot) => {
            setMessages(snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })));
        });

        return () => unsubscribe();
    }, [activeChat?.id]);

    // 4. Mark chat as read when selected
    useEffect(() => {
        const markAsRead = async () => {
            if (!auth.currentUser || !activeChat?.id) return;

            // If there's an unread count for the current user, reset it
            const myUnread = activeChat.unreadCount?.[auth.currentUser.uid] || 0;
            if (myUnread > 0) {
                try {
                    await updateDoc(doc(db, "chats", activeChat.id), {
                        [`unreadCount.${auth.currentUser.uid}`]: 0
                    });
                } catch (e) {
                    console.error("Error marking as read:", e);
                }
            }
        };

        markAsRead();
    }, [activeChat?.id, activeChat?.unreadCount, auth.currentUser?.uid]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !auth.currentUser || !activeChat) return;

        const messageText = newMessage.trim();
        setNewMessage("");

        try {
            const chatId = activeChat.id;

            const otherId = activeChat.participants?.find((p: string) => p !== auth.currentUser?.uid);

            await updateDoc(doc(db, "chats", chatId), {
                lastMessage: messageText,
                updatedAt: serverTimestamp(),
                [`unreadCount.${otherId}`]: increment(1),
                lastMessageSenderId: auth.currentUser?.uid
            });

            await addDoc(collection(db, `chats/${chatId}/messages`), {
                senderId: auth.currentUser.uid,
                text: messageText,
                createdAt: serverTimestamp()
            });

            // Notify the recipient
            if (otherId) {
                const senderName = activeChat.participantData?.[auth.currentUser.uid]?.name ||
                    auth.currentUser.displayName || "Someone";
                await createNotification(otherId, {
                    type: "new_message",
                    title: `New message from ${senderName}`,
                    body: messageText.length > 80 ? messageText.slice(0, 80) + "…" : messageText,
                    senderName,
                    senderPhoto: activeChat.participantData?.[auth.currentUser.uid]?.photo || auth.currentUser.photoURL || "",
                    chatId,
                });
            }

        } catch (error) {
            console.error("Error sending message:", error);
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file || !auth.currentUser || !activeChat) return;

        setIsUploading(true);

        try {
            const chatId = activeChat.id;
            const isImage = file.type.startsWith("image/");
            const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
            const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
            const endpoint = isImage
                ? `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`
                : `https://api.cloudinary.com/v1_1/${cloudName}/raw/upload`;

            const fd = new FormData();
            fd.append("file", file);
            fd.append("upload_preset", uploadPreset!);
            fd.append("folder", `chat_attachments/${chatId}`);

            const res = await fetch(endpoint, { method: "POST", body: fd });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error?.message || "Upload failed");

            const downloadURL = data.secure_url as string;
            const otherId = activeChat.participants?.find((p: string) => p !== auth.currentUser?.uid);

            await updateDoc(doc(db, "chats", chatId), {
                lastMessage: isImage ? "📷 Photo" : `📎 ${file.name}`,
                updatedAt: serverTimestamp(),
                [`unreadCount.${otherId}`]: increment(1),
                lastMessageSenderId: auth.currentUser?.uid
            });
            await addDoc(collection(db, `chats/${chatId}/messages`), {
                senderId: auth.currentUser?.uid,
                type: isImage ? "image" : "file",
                fileUrl: downloadURL,
                fileName: file.name,
                createdAt: serverTimestamp()
            });
        } catch (error) {
            console.error("Error uploading file:", error);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    const getOtherParticipant = (chat: any) => {
        if (!auth.currentUser) return null;
        const otherId = chat.participants.find((p: string) => p !== auth.currentUser?.uid);
        return {
            id: otherId,
            ...chat.participantData?.[otherId]
        };
    };

    if (loading) return (
        <div className="h-screen bg-white flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground">Synchronizing Inbox...</p>
            </div>
        </div>
    );

    return (
        <>
            <div className="flex-1 flex overflow-hidden h-[calc(100vh-64px)] pt-32 mt-[-64px]">
                {/* Conversations Sidebar */}
                <aside className={cn(
                    "w-full md:w-80 lg:w-96 border-r border-border flex flex-col bg-[#fcfcfc] transition-all duration-300",
                    showChatOnMobile ? "hidden md:flex" : "flex"
                )}>
                    <div className="p-8 space-y-4">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-black font-outfit uppercase tracking-tight">Inbox</h1>
                            <button className="p-2 hover:bg-accent rounded-full text-muted-foreground transition-colors">
                                <Plus size={20} />
                            </button>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" size={16} />
                            <input
                                type="text"
                                placeholder="Search messages..."
                                className="w-full h-12 pl-10 pr-4 bg-accent/30 border-transparent rounded-xl text-sm font-medium focus:bg-white focus:border-primary/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto no-scrollbar">
                        {conversations.length > 0 ? (
                            <div className="divide-y divide-border/30">
                                {conversations.map((chat) => {
                                    const other = getOtherParticipant(chat);
                                    const isActive = activeChat?.id === chat.id;
                                    const myUnread = chat.unreadCount?.[auth.currentUser?.uid || ""] || 0;
                                    return (
                                        <button
                                            key={chat.id}
                                            onClick={() => {
                                                setActiveChat(chat);
                                                setShowChatOnMobile(true);
                                            }}
                                            className={cn(
                                                "w-full p-5 flex items-center gap-4 hover:bg-accent/5 transition-all text-left group border-l-4 relative",
                                                isActive ? "bg-primary/5 border-primary" : "border-transparent",
                                                myUnread > 0 && !isActive && "bg-blue-50/30"
                                            )}
                                        >
                                            <div className="relative flex-shrink-0">
                                                <div className="w-14 h-14 rounded-full overflow-hidden border border-border shadow-sm group-hover:scale-105 transition-transform">
                                                    <img
                                                        src={other?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${other?.name}`}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1">
                                                    <h3 className={cn("text-sm truncate uppercase tracking-tight", (isActive || myUnread > 0) ? "font-black" : "font-bold")}>
                                                        {other?.name || "Client User"}
                                                    </h3>
                                                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-tighter shrink-0">
                                                        {chat.updatedAt?.toDate() ? new Date(chat.updatedAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                                    </span>
                                                </div>
                                                <div className="flex items-center justify-between gap-2">
                                                    <p className={cn(
                                                        "text-xs truncate font-medium line-clamp-1 flex-1",
                                                        myUnread > 0 ? "text-foreground font-bold" : "text-muted-foreground font-medium"
                                                    )}>
                                                        {chat.lastMessage || "Initial inquiry received"}
                                                    </p>
                                                    {myUnread > 0 && (
                                                        <div className="w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center shrink-0 shadow-sm shadow-blue-200">
                                                            <span className="text-[10px] font-black text-white">{myUnread}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="p-16 text-center space-y-4 opacity-40">
                                <div className="w-20 h-20 bg-accent/30 rounded-full flex items-center justify-center mx-auto mb-4 text-muted-foreground">
                                    <MessageSquare size={32} />
                                </div>
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">No active inquiries</p>
                                <p className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground max-w-[180px] mx-auto">
                                    When tenants message your listings, they will appear here.
                                </p>
                            </div>
                        )}
                    </div>
                </aside>

                {/* Main Chat Area */}
                <section className={cn(
                    "flex-1 flex flex-col bg-white transition-all duration-300 relative",
                    !showChatOnMobile ? "hidden md:flex" : "flex"
                )}>
                    {activeChat ? (
                        <>
                            {/* Chat Header */}
                            <header className="h-24 border-b border-border flex items-center justify-between px-8 bg-white/80 backdrop-blur-md sticky top-0 z-10">
                                <div className="flex items-center gap-5">
                                    <button
                                        onClick={() => setShowChatOnMobile(false)}
                                        className="md:hidden p-2 hover:bg-accent rounded-full -ml-2 text-muted-foreground"
                                    >
                                        <ChevronLeft size={24} />
                                    </button>

                                    <div className="relative">
                                        <div className="w-12 h-12 rounded-full overflow-hidden border border-border shadow-sm">
                                            <img
                                                src={getOtherParticipant(activeChat)?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${getOtherParticipant(activeChat)?.name}`}
                                                alt=""
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
                                    </div>

                                    <div>
                                        <h2 className="font-black text-sm uppercase tracking-tight">{getOtherParticipant(activeChat)?.name || "Client User"}</h2>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-green-600 flex items-center gap-1.5">
                                            <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                                            Active Client
                                        </p>
                                    </div>
                                </div>


                            </header>

                            {/* Messages Scroll Area */}
                            <div className="flex-1 overflow-y-auto p-8 space-y-6 no-scrollbar bg-[#fcfcfc] custom-scrollbar">
                                <div className="max-w-3xl mx-auto space-y-6">
                                    <div className="text-center py-10">
                                        <div className="inline-block px-5 py-2 bg-accent/50 rounded-full text-[9px] font-black uppercase tracking-widest text-muted-foreground">
                                            Private Property Inquiry Channel
                                        </div>
                                    </div>

                                    {messages.map((msg, i) => {
                                        const isMe = msg.senderId === auth.currentUser?.uid;
                                        // Tenant is Sender (Left), Homeowner is Response (Right)
                                        // On this page, "Me" is the homeowner
                                        const isHomeownerMessage = msg.senderId === activeChat.homeownerId;
                                        return (
                                            <div
                                                key={msg.id}
                                                className={cn("flex items-end gap-3.5", isHomeownerMessage ? "flex-row-reverse" : "flex-row")}
                                            >
                                                <div className="w-9 h-9 rounded-full overflow-hidden border border-border flex-shrink-0 animate-in fade-in zoom-in duration-300">
                                                    <img
                                                        src={activeChat.participantData[msg.senderId]?.photo || `https://api.dicebear.com/7.x/avataaars/svg?seed=${msg.senderId}`}
                                                        alt=""
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>

                                                {msg.type === "image" ? (
                                                    // Image — no bubble background
                                                    <div className="max-w-[75%] md:max-w-[60%] animate-in slide-in-from-bottom-2 duration-300">
                                                        <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer">
                                                            <img
                                                                src={msg.fileUrl}
                                                                alt="Shared image"
                                                                className="rounded w-full max-w-[260px] max-h-[240px] object-cover cursor-pointer hover:opacity-90 transition-opacity shadow-md"
                                                            />
                                                        </a>
                                                        <div className={cn(
                                                            "flex items-center gap-2 mt-1 text-[8px] font-black uppercase opacity-60",
                                                            isHomeownerMessage ? "justify-end text-foreground" : "justify-start text-muted-foreground"
                                                        )}>
                                                            {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."}
                                                            {isMe && <CheckCheck size={11} />}
                                                        </div>
                                                    </div>
                                                ) : (
                                                    // Text or File — standard bubble
                                                    <div className={cn(
                                                        "max-w-[75%] md:max-w-[60%] p-5 rounded-2xl text-sm font-medium shadow-sm transition-all duration-300 animate-in slide-in-from-bottom-2",
                                                        isHomeownerMessage
                                                            ? "bg-primary text-white rounded-br-none shadow-primary/10"
                                                            : "bg-white border border-border/60 text-foreground rounded-bl-none"
                                                    )}>
                                                        <div className="text-[9px] font-black uppercase tracking-widest mb-1 opacity-50">
                                                            {activeChat.participantData[msg.senderId]?.name || (isHomeownerMessage ? "Homeowner" : "Tenant")}
                                                        </div>
                                                        {msg.type === "file" ? (
                                                            <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" download={msg.fileName}
                                                                className={cn("flex items-center gap-2 mt-1 px-3 py-2 rounded-lg text-xs font-bold transition-all",
                                                                    isHomeownerMessage ? "bg-white/20 hover:bg-white/30" : "bg-primary/10 hover:bg-primary/20 text-primary"
                                                                )}>
                                                                <span className="text-base">📎</span>
                                                                <span className="truncate max-w-[160px]">{msg.fileName}</span>
                                                            </a>
                                                        ) : (
                                                            msg.text
                                                        )}
                                                        <div className={cn(
                                                            "flex items-center gap-2 justify-end mt-1.5 text-[8px] font-black uppercase opacity-60",
                                                            isMe ? "text-white" : "text-muted-foreground"
                                                        )}>
                                                            {msg.createdAt?.toDate ? new Date(msg.createdAt.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Sending..."}
                                                            {isMe && <CheckCheck size={11} />}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </div>
                            </div>

                            {/* Input Area */}
                            <footer className="p-8 bg-white border-t border-border">
                                <div className="max-w-3xl mx-auto">
                                    <form onSubmit={handleSend} className="relative flex items-end gap-4">
                                        {/* Hidden file input */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/*,.pdf,.doc,.docx,.txt,.xls,.xlsx,.csv"
                                            className="hidden"
                                            onChange={handleFileUpload}
                                        />
                                        <div className="flex items-center gap-1 mb-1.5">
                                            <button
                                                type="button"
                                                onClick={() => fileInputRef.current?.click()}
                                                disabled={isUploading}
                                                className="p-3 hover:bg-accent rounded-xl text-primary transition-all active:scale-90 disabled:opacity-40"
                                            >
                                                <Plus size={22} />
                                            </button>
                                        </div>

                                        <div className="flex w-full justify-center items-center relative group">
                                            <textarea
                                                value={newMessage}
                                                onChange={(e) => setNewMessage(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter' && !e.shiftKey) {
                                                        e.preventDefault();
                                                        handleSend(e as any);
                                                    }
                                                }}
                                                placeholder="Write a professional response..."
                                                className="w-full min-h-[56px] max-h-36 bg-accent/30 border border-transparent rounded py-4.5 pl-6 pr-14 text-sm font-medium transition-all duration-300 outline-none focus:bg-white focus:border-primary/20 resize-none no-scrollbar"
                                            />
                                            <button
                                                type="submit"
                                                disabled={!newMessage.trim()}
                                                className={cn(
                                                    "absolute right-2.5 w-8 h-8 rounded-xl flex items-center justify-center transition-all duration-300 shadow-xl active:scale-90",
                                                    newMessage.trim()
                                                        ? "bg-primary text-white shadow-primary/20"
                                                        : "bg-accent/50 text-muted-foreground"
                                                )}
                                            >
                                                <Send size={16} />
                                            </button>
                                        </div>
                                    </form>
                                    <p className="text-center text-[8px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 mt-5 italic">
                                        Secure end-to-end encrypted property channel
                                    </p>
                                </div>
                            </footer>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-16 bg-[#fcfcfc]">
                            <Reveal direction="up">
                                <div className="space-y-8">
                                    <div className="w-28 h-28 bg-primary/5 rounded-full flex items-center justify-center mx-auto text-primary/20 animate-pulse">
                                        <MessageSquare size={56} />
                                    </div>
                                    <div>
                                        <h3 className="text-3xl font-black italic font-outfit uppercase tracking-tighter">Your Message Center</h3>
                                        <p className="text-muted-foreground max-w-sm mx-auto text-sm font-medium mt-3 leading-relaxed">
                                            Select a tenant from the inbox to discuss property details, schedule tours, or finalize leasing agreements.
                                        </p>
                                    </div>
                                    <div className="flex items-center gap-4 justify-center pt-10 opacity-30">
                                        <div className="h-[1px] w-12 bg-muted-foreground" />
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em]">Business Continuity</span>
                                        <div className="h-[1px] w-12 bg-muted-foreground" />
                                    </div>
                                </div>
                            </Reveal>
                        </div>
                    )}
                </section>
            </div>
        </>
    );
}
