import { Link } from "wouter";
import { Bike, Bell } from "lucide-react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLanguage } from "@/contexts/LanguageContext";
import { usePushNotification } from "@/hooks/usePushNotification";
import { Button } from "@/components/ui/button";
import { LanguageToggle } from "@/components/LanguageToggle";
import { toast } from "sonner";

export default function Header() {
    const { user, isAuthenticated } = useAuth();
    const { language } = useLanguage();
    const { isSupported, permission, requestPermission } = usePushNotification();

    const handleEnableNotifications = async () => {
        const granted = await requestPermission();
        if (granted) {
            toast.success(language === "th" ? "เปิดการแจ้งเตือนแล้ว" : "Notifications enabled");
        } else {
            toast.error(language === "th" ? "ไม่สามารถเปิดการแจ้งเตือนได้" : "Could not enable notifications");
        }
    };

    return (
        <header className="border-b border-[#D4AF37]/20 glass-luxury shadow-luxury sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                <Link href="/">
                    <div className="flex items-center gap-3 cursor-pointer group">
                        <img
                            src="/logo.png"
                            alt="Mirin Logo"
                            className="h-14 w-auto object-contain logo-luxury"
                        />
                        <div>
                            <h1 className="text-2xl font-bold gradient-text-gold font-['Playfair_Display']">
                                Mirin
                            </h1>
                            <p className="text-xs text-[#8B7355] dark:text-[#C5A572]">Motorcycle Rental</p>
                        </div>
                    </div>
                </Link>
                <nav className="hidden md:flex items-center gap-6">
                    <Link href="/cars" className="text-gray-600 dark:text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 font-medium">
                        {language === "th" ? "ดูมอเตอร์ไซต์" : "Browse Bikes"}
                    </Link>
                    <Link href="/dashboard" className="text-gray-600 dark:text-gray-300 hover:text-[#D4AF37] transition-colors duration-200 font-medium">
                        {language === "th" ? "การเช่าของฉัน" : "My Rentals"}
                    </Link>
                </nav>
                <div className="flex items-center gap-4">
                    <LanguageToggle />
                    {isSupported && permission !== "granted" && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleEnableNotifications}
                            className="hidden sm:flex items-center gap-2 border-[#D4AF37]/30 hover:bg-[#D4AF37]/10 hover:border-[#D4AF37] transition-all duration-200"
                        >
                            <Bell className="w-4 h-4" />
                            {language === "th" ? "เปิดแจ้งเตือน" : "Enable Alerts"}
                        </Button>
                    )}
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600 dark:text-gray-300 hidden sm:block font-medium">{user?.name}</span>
                            <Link href="/dashboard">
                                <Button size="sm" className="luxury-gradient hover:shadow-luxury transition-all duration-300 text-white font-semibold">
                                    {language === "th" ? "แดชบอร์ด" : "Dashboard"}
                                </Button>
                            </Link>
                        </div>
                    ) : (
                        <Link href="/login">
                            <Button size="sm" className="luxury-gradient hover:shadow-luxury transition-all duration-300 text-white font-semibold">
                                {language === "th" ? "เข้าสู่ระบบ" : "Login"}
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
