"use client";

import { useEffect, useState } from "react";
import { useLanguage } from "@/context/LanguageContext";
import { X } from "lucide-react";

export default function LanguageModal() {
    const { setLanguage, t } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        // Check if language is already stored
        const storedLang = localStorage.getItem("app-language");
        if (!storedLang) {
            setIsOpen(true);
        }
    }, []);

    const handleSelect = (lang: 'en' | 'te') => {
        setLanguage(lang);
        setIsOpen(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden scale-100 animate-scale-in">

                {/* Header */}
                <div className="bg-[#800000] p-6 text-center text-white relative">
                    <h2 className="text-2xl font-bold font-heading mb-1">{t.modal.title}</h2>
                    <p className="text-white/80 font-light">{t.modal.subtitle}</p>
                </div>

                {/* Content */}
                <div className="p-8 space-y-4">
                    <button
                        onClick={() => handleSelect('en')}
                        className="w-full group relative flex items-center justify-center p-4 border-2 border-[#E5E0D8] rounded-lg hover:border-[#800000] hover:bg-[#FFF9F9] transition-all duration-300"
                    >
                        <span className="text-xl font-bold text-[#333333] group-hover:text-[#800000]">English</span>
                        <span className="absolute right-4 text-sm text-gray-400 group-hover:text-[#800000]">Select →</span>
                    </button>

                    <button
                        onClick={() => handleSelect('te')}
                        className="w-full group relative flex items-center justify-center p-4 border-2 border-[#E5E0D8] rounded-lg hover:border-[#800000] hover:bg-[#FFF9F9] transition-all duration-300"
                    >
                        <span className="text-xl font-bold text-[#333333] group-hover:text-[#800000] font-heading">తెలుగు</span>
                        <span className="absolute right-4 text-sm text-gray-400 group-hover:text-[#800000]">ఎంచుకోండి →</span>
                    </button>
                </div>

                <div className="bg-gray-50 p-4 text-center text-xs text-gray-400">
                    You can change this later in settings
                </div>
            </div>
        </div>
    );
}
