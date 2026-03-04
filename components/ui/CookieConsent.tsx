"use client";

import CookieConsent from "react-cookie-consent";
import { Cookie } from "lucide-react";
import { Reveal } from "./Reveal";

export const CookieConsentBanner = () => {
    return (
        <CookieConsent
            location="bottom"
            buttonText="Accept All"
            declineButtonText="Reject"
            enableDeclineButton
            cookieName="lodgeme-cookie-consent"
            style={{
                background: "rgba(255, 255, 255, 0.9)",
                backdropFilter: "blur(16px)",
                color: "#1A1A1A",
                borderTop: "1px solid rgba(0,0,0,0.05)",
                padding: "20px 40px",
                display: "flex",
                alignItems: "center",
                zIndex: 9999
            }}
            buttonStyle={{
                background: "#BB7655",
                color: "#fff",
                fontSize: "14px",
                fontWeight: "bold",
                borderRadius: "12px",
                padding: "12px 32px",
                margin: "10px",
                transition: "all 0.3s ease",
                border: "none",
                cursor: "pointer",
                boxShadow: "0 10px 20px -5px rgba(187,118,85,0.3)"
            }}
            declineButtonStyle={{
                background: "transparent",
                color: "#666",
                fontSize: "14px",
                fontWeight: "bold",
                margin: "10px",
                cursor: "pointer",
                border: "none"
            }}
            expires={150}
        >
            <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#BB7655]/10 rounded-xl flex items-center justify-center shrink-0 hidden md:flex">
                    <Cookie className="text-[#BB7655]" size={24} />
                </div>
                <div>
                    <span className="font-bold text-lg block mb-0.5">Cookie Settings</span>
                    <span className="text-sm text-balance leading-relaxed opacity-80">
                        We use cookies to enhance your browsing experience, serve personalized ads, and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
                    </span>
                </div>
            </div>
        </CookieConsent>
    );
};
