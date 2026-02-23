"use client";

import { motion, useInView } from "framer-motion";
import { useRef, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface RevealProps {
    children: ReactNode;
    width?: "fit-content" | "100%";
    delay?: number;
    direction?: "up" | "down" | "left" | "right";
    className?: string;
}

export const Reveal = ({
    children,
    width,
    delay = 0.2,
    direction = "up",
    className
}: RevealProps) => {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: "-100px" });

    const directions = {
        up: { y: 40, x: 0 },
        down: { y: -40, x: 0 },
        left: { y: 0, x: 40 },
        right: { y: 0, x: -40 },
    };

    return (
        <div
            ref={ref}
            className={cn("relative transition-all duration-300", className)}
            style={{ width: width }}
        >
            <motion.div
                variants={{
                    hidden: { opacity: 0, ...directions[direction] },
                    visible: { opacity: 1, y: 0, x: 0 },
                }}
                initial="hidden"
                animate={isInView ? "visible" : "hidden"}
                transition={{ duration: 0.6, delay, ease: "easeOut" }}
                className="w-full h-full"
            >
                {children}
            </motion.div>
        </div>
    );
};
