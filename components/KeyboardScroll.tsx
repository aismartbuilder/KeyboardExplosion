"use client";

import { useEffect, useRef, useState } from "react";
import { useScroll, useTransform, motion } from "framer-motion";

const TOTAL_FRAMES = 140;

export default function KeyboardScroll() {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [images, setImages] = useState<HTMLImageElement[]>([]);
    const [imagesLoaded, setImagesLoaded] = useState(false);
    const [loadProgress, setLoadProgress] = useState(0);

    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"],
    });

    const currentFrame = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1]);

    // Preload all images
    useEffect(() => {
        const loadedImages: HTMLImageElement[] = [];
        let loadedCount = 0;

        for (let i = 1; i <= TOTAL_FRAMES; i++) {
            const img = new Image();
            const frameNumber = i.toString().padStart(3, "0");
            img.src = `/frames/ezgif-frame-${frameNumber}.jpg`;

            img.onload = () => {
                loadedCount++;
                setLoadProgress(Math.round((loadedCount / TOTAL_FRAMES) * 100));

                if (loadedCount === TOTAL_FRAMES) {
                    setImagesLoaded(true);
                }
            };

            loadedImages[i - 1] = img;
        }

        setImages(loadedImages);
    }, []);

    // Manage body overflow during loading
    useEffect(() => {
        if (!imagesLoaded) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "auto";
        }

        return () => {
            document.body.style.overflow = "auto";
        };
    }, [imagesLoaded]);

    // Draw frame to canvas
    useEffect(() => {
        if (!imagesLoaded || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Set canvas dimensions once
        const dpr = window.devicePixelRatio || 1;
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);

        const renderFrame = (frameIndex: number) => {
            const img = images[frameIndex];

            if (img && img.complete) {
                // Clear canvas
                ctx.clearRect(0, 0, rect.width, rect.height);

                // Calculate "contain" fit
                const imgRatio = img.width / img.height;
                const canvasRatio = rect.width / rect.height;

                let drawWidth = rect.width;
                let drawHeight = rect.height;
                let offsetX = 0;
                let offsetY = 0;

                if (imgRatio > canvasRatio) {
                    // Image is wider
                    drawHeight = rect.width / imgRatio;
                    offsetY = (rect.height - drawHeight) / 2;
                } else {
                    // Image is taller
                    drawWidth = rect.height * imgRatio;
                    offsetX = (rect.width - drawWidth) / 2;
                }

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
        };

        // Initial render
        renderFrame(0);

        const unsubscribe = currentFrame.on("change", (latest) => {
            const frameIndex = Math.round(latest);
            renderFrame(frameIndex);
        });

        return () => unsubscribe();
    }, [imagesLoaded, images, currentFrame]);

    // Handle resize
    useEffect(() => {
        if (!imagesLoaded || !canvasRef.current) return;

        const handleResize = () => {
            const canvas = canvasRef.current;
            if (!canvas) return;

            const frameIndex = Math.round(currentFrame.get());
            const img = images[frameIndex];

            if (img && img.complete) {
                const ctx = canvas.getContext("2d");
                if (!ctx) return;

                const dpr = window.devicePixelRatio || 1;
                const rect = canvas.getBoundingClientRect();

                canvas.width = rect.width * dpr;
                canvas.height = rect.height * dpr;

                ctx.scale(dpr, dpr);
                ctx.clearRect(0, 0, rect.width, rect.height);

                const imgRatio = img.width / img.height;
                const canvasRatio = rect.width / rect.height;

                let drawWidth = rect.width;
                let drawHeight = rect.height;
                let offsetX = 0;
                let offsetY = 0;

                if (imgRatio > canvasRatio) {
                    drawHeight = rect.width / imgRatio;
                    offsetY = (rect.height - drawHeight) / 2;
                } else {
                    drawWidth = rect.height * imgRatio;
                    offsetX = (rect.width - drawWidth) / 2;
                }

                ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
            }
        };

        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, [imagesLoaded, images, currentFrame]);

    return (
        <div ref={containerRef} className="relative h-[400vh]">
            {/* Loading State */}
            {!imagesLoaded && (
                <div className="fixed inset-0 flex flex-col items-center justify-center z-50 bg-[#ECECEC]">
                    <div className="w-16 h-16 border-4 border-black/10 border-t-black/60 rounded-full animate-spin mb-4" />
                    <p className="text-black/60 text-sm tracking-tight">
                        Loading WpDev sequence... {loadProgress}%
                    </p>
                </div>
            )}

            {/* Sticky Canvas */}
            <div className="sticky top-0 left-0 h-screen w-full flex items-center justify-center">
                <canvas
                    ref={canvasRef}
                    className="w-full h-full"
                    style={{ maxWidth: "100%", maxHeight: "100%" }}
                />
            </div>

            {/* Text Overlays */}
            <motion.div
                className="fixed inset-0 flex items-center justify-center pointer-events-none"
                style={{
                    opacity: useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]),
                }}
            >
                <div className="text-center">
                    <h1 className="text-6xl md:text-8xl font-bold text-black/90 tracking-tighter mb-2">
                        WpDev Keyboard.
                    </h1>
                    <p className="text-lg md:text-xl text-black/60 tracking-tight">
                        Engineered clarity.
                    </p>
                </div>
            </motion.div>

            <motion.div
                className="fixed top-1/2 left-12 md:left-24 -translate-y-1/2 pointer-events-none max-w-md"
                style={{
                    opacity: useTransform(scrollYProgress, [0.2, 0.25, 0.35, 0.4], [0, 1, 1, 0]),
                    y: useTransform(scrollYProgress, [0.2, 0.25], [10, 0]),
                }}
            >
                <h2 className="text-4xl md:text-6xl font-bold text-black/90 tracking-tighter mb-2">
                    Built for Precision.
                </h2>
                <p className="text-base md:text-lg text-black/60 tracking-tight">
                    Every detail, measured.
                </p>
            </motion.div>

            <motion.div
                className="fixed top-1/2 right-12 md:right-24 -translate-y-1/2 pointer-events-none max-w-md text-right"
                style={{
                    opacity: useTransform(scrollYProgress, [0.55, 0.6, 0.7, 0.75], [0, 1, 1, 0]),
                    y: useTransform(scrollYProgress, [0.55, 0.6], [10, 0]),
                }}
            >
                <h2 className="text-4xl md:text-6xl font-bold text-black/90 tracking-tighter mb-2">
                    Layered Engineering.
                </h2>
                <p className="text-base md:text-lg text-black/60 tracking-tight">
                    See what&apos;s inside.
                </p>
            </motion.div>

            <motion.div
                className="fixed inset-0 flex items-center justify-center pointer-events-none"
                style={{
                    opacity: useTransform(scrollYProgress, [0.85, 0.9, 1], [0, 1, 1]),
                    y: useTransform(scrollYProgress, [0.85, 0.9], [10, 0]),
                }}
            >
                <div className="text-center">
                    <h2 className="text-5xl md:text-7xl font-bold text-black/90 tracking-tighter mb-2">
                        Assembled. Ready.
                    </h2>
                    <p className="text-base md:text-lg text-black/60 tracking-tight">
                        Scroll back to replay.
                    </p>
                </div>
            </motion.div>
        </div>
    );
}
