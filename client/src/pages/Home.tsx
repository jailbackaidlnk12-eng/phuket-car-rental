import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";
import Header from "@/components/Header";

import { Link } from "wouter";
import { Gem, Shield, Clock, MapPin, Sparkles, Star, ChevronRight, Play, Leaf, ShoppingCart } from "lucide-react";
import { usePushNotification } from "@/hooks/usePushNotification";
import { useCart } from "@/contexts/CartContext";
import { toast } from "sonner";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const { isSupported, permission, requestPermission } = usePushNotification();
  const { totalItems } = useCart();

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success(language === "th" ? "เปิดการแจ้งเตือนแล้ว" : "Notifications enabled");
    } else {
      toast.error(language === "th" ? "ไม่สามารถเปิดการแจ้งเตือนได้" : "Could not enable notifications");
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Header */}
      <header className="fixed w-full z-50 transition-all duration-300 bg-background/80 backdrop-blur-md border-b border-white/10">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-3 group cursor-pointer">
              <div className="bg-primary/10 p-2 rounded-lg shadow-lg group-hover:scale-105 transition-transform duration-300 backdrop-blur-md">
                <img src="/logo.png" alt="Mirin Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold gradient-text-gold tracking-wide">
                  Mirin
                </h1>
              </div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-8 font-medium">
            <Link href="/cars" className="text-foreground/80 hover:text-primary transition-colors uppercase tracking-widest text-xs">
              {language === "th" ? "ดูมอเตอร์ไซค์" : "Browse Bikes"}
            </Link>
            <Link href="/cannabis" className="flex items-center gap-1.5 text-green-500 hover:text-green-400 transition-colors uppercase tracking-widest text-xs">
              <Leaf className="w-3 h-3" />
              Cannabis
            </Link>
            <Link href="/dashboard" className="text-foreground/80 hover:text-primary transition-colors uppercase tracking-widest text-xs">
              {language === "th" ? "การเช่าของฉัน" : "My Rentals"}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            {/* Cart Button */}
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative text-green-500 hover:text-green-400 hover:bg-green-500/10">
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {totalItems}
                  </span>
                )}
              </Button>
            </Link>
            <LanguageToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" className="bg-primary/90 hover:bg-primary text-primary-foreground border-none shadow-md">
                  {language === "th" ? "บัญชีของฉัน" : "My Account"}
                </Button>
              </Link>
            ) : (
              <Link href="/login">
                <Button size="sm" variant="outline" className="border-primary/50 text-primary hover:bg-primary hover:text-primary-foreground">
                  {language === "th" ? "เข้าสู่ระบบ" : "Sign In"}
                </Button>
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          {/* Placeholder for video/high-res image - simplified with CSS pattern/gradient for now */}
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center" />
          <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 bg-black/40" />
        </div>

        <div className="container mx-auto px-4 z-10 text-center relative pt-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Star className="w-3 h-3 text-primary fill-primary" />
            <span className="text-xs tracking-[0.2em] uppercase font-medium"> The Premium Experience </span>
            <Star className="w-3 h-3 text-primary fill-primary" />
          </div>

          <h1 className="text-5xl md:text-7xl lg:text-8xl font-serif font-bold text-white mb-6 drop-shadow-lg leading-tight animate-in fade-in zoom-in duration-1000 delay-100">
            {language === "th" ? (
              <>
                เหนือระดับ<br />
                <span className="gradient-text-gold">ทุกการเดินทาง</span>
              </>
            ) : (
              <>
                Elevate Your<br />
                <span className="gradient-text-gold">Lifestyle</span>
              </>
            )}
          </h1>

          <p className="text-lg md:text-xl text-white/80 mb-10 max-w-2xl mx-auto font-light leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
            {language === "th"
              ? "สัมผัสประสบการณ์ความหรูหราที่แท้จริง กับบริการเช่าสินทรัพย์ระดับพรีเมียม รถหรู วิลล่า และเรือยอร์ช"
              : "Discover the epitome of luxury with our curated collection of premium vehicles, villas, and charter services in Phuket."}
          </p>

          <div className="flex flex-col sm:flex-row gap-6 justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-500">
            <Link href="/products">
              <Button size="lg" className="h-14 px-10 text-lg bg-primary text-primary-foreground hover:bg-primary/90 shadow-luxury-lg rounded-full">
                {language === "th" ? "สำรวจคอลเลกชัน" : "Explore Collection"}
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            {!isAuthenticated && (
              <div className="flex items-center gap-4 text-white/90 cursor-pointer hover:text-primary transition-colors group">
                <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 group-hover:scale-110 transition-transform">
                  <Play className="w-5 h-5 text-white ml-1 fill-white" />
                </div>
                <span className="text-sm font-medium tracking-widest uppercase">Watch Film</span>
              </div>
            )}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce opacity-50">
          <div className="w-[1px] h-16 bg-gradient-to-b from-transparent via-white to-transparent" />
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-32 bg-background relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-secondary/20 blur-3xl rounded-full translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-1/3 h-full bg-primary/5 blur-3xl rounded-full -translate-x-1/2" />

        <div className="container mx-auto px-4 relative">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">

            <div className="group p-8 rounded-3xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/10">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-transparent rounded-2xl flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4 text-foreground">{language === "th" ? "คัดสรรพิเศษ" : "Curated Selection"}</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                {language === "th"
                  ? "สินทรัพย์ทุกชิ้นผ่านการคัดเลือกอย่างพิถีพิถัน เพื่อความสมบูรณ์แบบ"
                  : "Every asset in our collection is handpicked to ensure the highest standards of luxury and performance."}
              </p>
            </div>

            <div className="group p-8 rounded-3xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/10">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-transparent rounded-2xl flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                <Shield className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4 text-foreground">{language === "th" ? "ความปลอดภัยสูงสุด" : "Premium Security"}</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                {language === "th"
                  ? "ระบบยืนยันตัวตนระดับสูงและการดูแลตลอด 24 ชั่วโมง"
                  : "Advanced verification systems and 24/7 concierge support for your peace of mind."}
              </p>
            </div>

            <div className="group p-8 rounded-3xl hover:bg-white/5 transition-all duration-500 border border-transparent hover:border-white/10">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-primary/20 to-transparent rounded-2xl flex items-center justify-center mb-6 border border-primary/20 group-hover:scale-110 transition-transform duration-500">
                <Clock className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-serif font-semibold mb-4 text-foreground">{language === "th" ? "บริการไร้รอยต่อ" : "Seamless Experience"}</h3>
              <p className="text-muted-foreground leading-relaxed font-light">
                {language === "th"
                  ? "จอง จ่าย และขยายเวลาได้ทันทีผ่านระบบดิจิทัล"
                  : "Book, pay, and extend your experience instantly through our tailored digital platform."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collection Preview (Mini) */}
      <section className="py-20 bg-secondary/30">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-primary text-xs font-bold tracking-widest uppercase mb-2 block">The Collection</span>
              <h2 className="text-4xl font-serif font-bold text-foreground">{language === "th" ? "ไฮไลท์ประจำฤดูกาล" : "Season Highlights"}</h2>
            </div>
            <Link href="/products">
              <Button variant="link" className="text-primary text-lg hover:text-primary/80 p-0 h-auto">
                {language === "th" ? "ดูทั้งหมด" : "View All"} <ChevronRight className="w-5 h-5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Placeholder Cards for aesthetic purpose, dynamic data is on /products */}
            {[1, 2, 3].map((i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl aspect-[4/5] cursor-pointer">
                <div className={`absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110`} style={{ backgroundImage: `url('https://images.unsplash.com/photo-15${i === 1 ? '58981403-c5f9899a28bc' : i === 2 ? '640107297591-332353915840' : '636009454028-111f3239e947'}?w=800&q=80')` }}></div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-90 transition-opacity duration-300"></div>

                <div className="absolute bottom-0 left-0 w-full p-8">
                  <div className="translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                    <p className="text-primary text-xs font-bold tracking-widest uppercase mb-2">Category</p>
                    <h3 className="text-2xl font-serif font-bold text-white mb-2">Luxury Asset {i}</h3>
                    <div className="h-0 group-hover:h-auto overflow-hidden transition-all duration-300 opacity-0 group-hover:opacity-100">
                      <p className="text-white/70 text-sm mb-4">Experience the ultimate freedom with our premium selection.</p>
                      <span className="text-white border-b border-primary pb-1 text-sm uppercase tracking-wider">Discover</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-background border-t border-border pt-20 pb-10">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-primary/20 p-2 rounded-lg">
                  <img src="/logo.png" alt="Mirin Logo" className="w-6 h-6 object-contain" />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold gradient-text-gold">Mirin Luxury</h2>
                </div>
              </div>
              <p className="text-muted-foreground max-w-md font-light">
                {language === "th"
                  ? "ยกระดับไลฟ์สไตล์ของคุณด้วยบริการเช่าสินทรัพย์หรูครบวงจรในภูเก็ต"
                  : "Elevating lifestyles through curated luxury asset rentals in Phuket. Experience the extraordinary."}
              </p>
            </div>

            <div>
              <h5 className="font-serif font-bold mb-6 text-foreground">
                {language === "th" ? "ติดต่อเรา" : "Contact"}
              </h5>
              <div className="space-y-4 text-muted-foreground font-light">
                <p className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5" />
                  <span>123 luxury Lane,<br />Phuket, Thailand 83000</span>
                </p>
                <p className="flex items-center gap-3">
                  <span className="w-5 h-5 flex items-center justify-center text-primary font-serif italic">T</span>
                  +66 8X XXX XXXX
                </p>
              </div>
            </div>

            <div>
              <h5 className="font-serif font-bold mb-6 text-foreground">
                {language === "th" ? "ลิงก์" : "Links"}
              </h5>
              <div className="flex flex-col gap-3 text-muted-foreground font-light">
                <Link href="/products" className="hover:text-primary transition-colors">Collection</Link>
                <Link href="/dashboard" className="hover:text-primary transition-colors">Concierge</Link>
                <Link href="/login" className="hover:text-primary transition-colors">Member Access</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-border/50 pt-8 flex flex-col md:flex-row justify-between items-center text-muted-foreground text-sm font-light">
            <p>&copy; 2025 Mirin Luxcenry. All rights reserved.</p>
            <div className="flex gap-6 mt-4 md:mt-0">
              <span className="hover:text-primary cursor-pointer">Privacy</span>
              <span className="hover:text-primary cursor-pointer">Terms</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
