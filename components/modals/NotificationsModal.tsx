"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Bell, MessageSquare, Info, ShieldCheck } from "lucide-react";

interface NotificationsModalProps {
    isOpen: boolean;
    onCloseAction: () => void;
}

export const NotificationsModal = ({ isOpen, onCloseAction }: NotificationsModalProps) => {
    const notifications = [
        {
            id: 1,
            title: "Welcome to LODGEME!",
            desc: "Start exploring verified properties in your area.",
            icon: ShieldCheck,
            color: "text-green-600",
            bg: "bg-green-50",
            time: "Just now"
        },
        {
            id: 2,
            title: "Setup your profile",
            desc: "Add a display photo to boost your trust score.",
            icon: Info,
            color: "text-primary",
            bg: "bg-primary/10",
            time: "2 hours ago"
        }
    ];

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
                        className="relative w-full max-w-sm bg-white h-full shadow-2xl overflow-y-auto no-scrollbar"
                    >
                        <div className="p-8">
                            <div className="flex justify-between items-center mb-10">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-primary/10 text-primary rounded">
                                        <Bell size={20} />
                                    </div>
                                    <h2 className="text-2xl font-black">Notifications</h2>
                                </div>
                                <button
                                    onClick={onCloseAction}
                                    className="p-2 hover:bg-accent rounded-full transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="space-y-4">
                                {notifications.map((notif) => (
                                    <div
                                        key={notif.id}
                                        className="p-4 rounded border border-border/50 hover:bg-accent/30 transition-all cursor-pointer group"
                                    >
                                        <div className="flex gap-4">
                                            <div className={`w-10 h-10 ${notif.bg} ${notif.color} rounded flex items-center justify-center flex-shrink-0`}>
                                                <notif.icon size={20} />
                                            </div>
                                            <div className="flex-1">
                                                <h4 className="font-black text-sm mb-1">{notif.title}</h4>
                                                <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                                    {notif.desc}
                                                </p>
                                                <span className="text-[10px] uppercase tracking-widest font-black text-primary/60 mt-2 block">
                                                    {notif.time}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="py-20 text-center">
                                    <p className="text-sm font-bold text-muted-foreground">That's all for now!</p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};
