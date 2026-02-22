"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, MessageSquare, Send, CheckCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import {
    collection,
    query,
    orderBy,
    onSnapshot,
    updateDoc,
    doc,
    writeBatch,
    limit
} from "firebase/firestore";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NotificationsModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
    role?: "client" | "homeowner"; // for routing
}

export const NotificationsModal = ({ isOpen, onCloseAction, role = "client" }: NotificationsModalProps) => {
    const router = useRouter();
    const [notifications, setNotifications] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isOpen || !auth.currentUser) return;

        const uid = auth.currentUser.uid;
        const q = query(
            collection(db, "users", uid, "notifications"),
            orderBy("createdAt", "desc"),
            limit(30)
        );

        const unsub = onSnapshot(q, (snap) => {
            setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })));
            setLoading(false);
        });

        return () => unsub();
    }, [isOpen]);

    const markAsRead = async (notifId: string) => {
        if (!auth.currentUser) return;
        const uid = auth.currentUser.uid;
        await updateDoc(doc(db, "users", uid, "notifications", notifId), { read: true });
    };

    const markAllRead = async () => {
        if (!auth.currentUser) return;
        const uid = auth.currentUser.uid;
        const batch = writeBatch(db);
        notifications.filter(n => !n.read).forEach(n => {
            batch.update(doc(db, "users", uid, "notifications", n.id), { read: true });
        });
        await batch.commit();
    };

    const handleClick = async (notif: any) => {
        await markAsRead(notif.id);
        onCloseAction();

        if (notif.type === "new_message") {
            const base = role === "homeowner" ? "/dashboard/homeowner/messages" : "/dashboard/client/messages";
            router.push(notif.chatId ? `${base}?chat=${notif.chatId}` : base);
        } else if (notif.type === "new_interest") {
            router.push("/dashboard/homeowner/interests");
        }
    };

    const unreadCount = notifications.filter(n => !n.read).length;

    const timeAgo = (ts: any): string => {
        if (!ts?.toDate) return "Just now";
        const diff = Date.now() - ts.toDate().getTime();
        const mins = Math.floor(diff / 60000);
        if (mins < 1) return "Just now";
        if (mins < 60) return `${mins}m ago`;
        const hrs = Math.floor(mins / 60);
        if (hrs < 24) return `${hrs}h ago`;
        return `${Math.floor(hrs / 24)}d ago`;
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex justify-end">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onCloseAction}
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    />
                    <motion.div
                        initial={{ x: "100%" }}
                        animate={{ x: 0 }}
                        exit={{ x: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 200 }}
                        className="relative w-full max-w-sm bg-white h-full shadow-2xl flex flex-col"
                    >
                        {/* Header */}
                        <div className="p-6 border-b border-border flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-primary/10 text-primary rounded-lg">
                                    <Bell size={20} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black">Notifications</h2>
                                    {unreadCount > 0 && (
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">
                                            {unreadCount} unread
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {unreadCount > 0 && (
                                    <button
                                        onClick={markAllRead}
                                        className="text-[10px] font-black uppercase tracking-widest text-primary hover:text-primary/80 transition-colors flex items-center gap-1"
                                    >
                                        <CheckCheck size={12} />
                                        All read
                                    </button>
                                )}
                                <button
                                    onClick={onCloseAction}
                                    className="p-2 hover:bg-accent rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto no-scrollbar">
                            {loading ? (
                                <div className="p-6 space-y-4">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="h-20 bg-accent/30 rounded-lg animate-pulse" />
                                    ))}
                                </div>
                            ) : notifications.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center">
                                    <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mb-4 text-primary/30">
                                        <Bell size={32} />
                                    </div>
                                    <h3 className="font-black text-lg mb-2">All caught up!</h3>
                                    <p className="text-sm text-muted-foreground font-medium">
                                        New messages and interest alerts will appear here.
                                    </p>
                                </div>
                            ) : (
                                <div className="divide-y divide-border/50">
                                    {notifications.map((notif) => (
                                        <button
                                            key={notif.id}
                                            onClick={() => handleClick(notif)}
                                            className={cn(
                                                "w-full text-left p-4 hover:bg-accent/40 transition-all flex gap-3 items-start",
                                                !notif.read && "bg-primary/5"
                                            )}
                                        >
                                            {/* Avatar or type icon */}
                                            <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border border-border">
                                                {notif.senderPhoto ? (
                                                    <img src={notif.senderPhoto} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className={cn(
                                                        "w-full h-full flex items-center justify-center",
                                                        notif.type === "new_message" ? "bg-primary/10 text-primary" : "bg-green-50 text-green-600"
                                                    )}>
                                                        {notif.type === "new_message" ? <MessageSquare size={18} /> : <Send size={18} />}
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2">
                                                    <h4 className={cn("text-sm font-black truncate", !notif.read && "text-foreground")}>{notif.title}</h4>
                                                    {!notif.read && (
                                                        <span className="w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-1" />
                                                    )}
                                                </div>
                                                <p className="text-xs text-muted-foreground font-medium leading-relaxed mt-0.5 line-clamp-2">
                                                    {notif.body}
                                                </p>
                                                <span className="text-[10px] uppercase tracking-widest font-black text-primary/50 mt-1 block">
                                                    {timeAgo(notif.createdAt)}
                                                </span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
