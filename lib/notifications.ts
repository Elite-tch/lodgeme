import { db } from "@/lib/firebase";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";

export type NotificationType = "new_message" | "new_interest";

export interface NotificationPayload {
    type: NotificationType;
    title: string;
    body: string;
    senderName: string;
    senderPhoto?: string;
    chatId?: string;       // for new_message — navigate to /messages?chat=chatId
    interestId?: string;   // for new_interest — navigate to /homeowner/interests
}

/**
 * Write a notification document to users/{recipientId}/notifications
 */
export async function createNotification(
    recipientId: string,
    payload: NotificationPayload
): Promise<void> {
    try {
        await addDoc(collection(db, "users", recipientId, "notifications"), {
            ...payload,
            read: false,
            createdAt: serverTimestamp(),
        });
    } catch (e) {
        console.error("Failed to create notification:", e);
    }
}
