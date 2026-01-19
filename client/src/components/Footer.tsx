import { Link } from "wouter";
import { Bike, MapPin, Phone, Mail } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Footer() {
    const { language } = useLanguage();

    return (
        <footer className="bg-gradient-to-b from-gray-900 to-black border-t border-[#D4AF37]/20 text-white py-12">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div>
                        <div className="flex items-center gap-3 mb-4">
                            <div className="luxury-gradient p-2 rounded-lg shadow-luxury">
                                <Bike className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h4 className="text-xl font-bold gradient-text-gold font-['Playfair_Display']">Mirin</h4>
                                <p className="text-xs text-[#C5A572]">Motorcycle Rental</p>
                            </div>
                        </div>
                        <p className="text-gray-400">
                            {language === "th"
                                ? "บริการเช่ามอเตอร์ไซต์คุณภาพในภูเก็ต"
                                : "Quality motorcycle rental service in Phuket"}
                        </p>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-4 text-[#D4AF37]">
                            {language === "th" ? "ติดต่อเรา" : "Contact Us"}
                        </h5>
                        <div className="space-y-2 text-gray-400">
                            <p className="flex items-center gap-2">
                                <MapPin className="w-4 h-4 text-[#D4AF37]" />
                                {language === "th" ? "ภูเก็ต, ประเทศไทย" : "Phuket, Thailand"}
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-[#D4AF37]" />
                                +66 XX XXX XXXX
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-[#D4AF37]" />
                                contact@mirin.rental
                            </p>
                        </div>
                    </div>
                    <div>
                        <h5 className="font-semibold mb-4 text-[#D4AF37]">
                            {language === "th" ? "ลิงก์ด่วน" : "Quick Links"}
                        </h5>
                        <div className="space-y-2">
                            <Link href="/cars" className="block text-gray-400 hover:text-[#D4AF37] transition-colors duration-200">
                                {language === "th" ? "ดูมอเตอร์ไซต์" : "Browse Bikes"}
                            </Link>
                            <Link href="/dashboard" className="block text-gray-400 hover:text-[#D4AF37] transition-colors duration-200">
                                {language === "th" ? "การเช่าของฉัน" : "My Rentals"}
                            </Link>
                            <Link href="/id-verification" className="block text-gray-400 hover:text-[#D4AF37] transition-colors duration-200">
                                {language === "th" ? "ยืนยันบัตรประชาชน" : "ID Verification"}
                            </Link>
                        </div>
                    </div>
                </div>
                <div className="border-t border-[#D4AF37]/20 mt-8 pt-8 text-center text-gray-400">
                    <p>&copy; 2025 Mirin Motorcycle Rental. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
}
