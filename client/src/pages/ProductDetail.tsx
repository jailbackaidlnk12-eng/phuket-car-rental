import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useParams, useLocation } from "wouter";
import { Gem, Loader2, ArrowLeft, Shield, AlertCircle, CheckCircle, Calendar, Star, Info, MapPin } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";


export default function ProductDetail() {
  const { language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [location, setLocation] = useState("");

  const { data: product, isLoading } = trpc.products.detail.useQuery({ id: parseInt(id || "0") });
  const { data: idCardStatus } = trpc.idCard.getStatus.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );
  const createRental = trpc.rentals.create.useMutation();

  const calculateCost = () => {
    if (!startDate || !endDate || !product) return 0;
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    // Calculate cost: daily rate for full days + hourly rate for remaining hours (if available)
    const dailyCost = days * product.dailyRate;
    const hourlyCost = product.hourlyRate ? remainingHours * product.hourlyRate : 0;

    // If no hourly rate, charge full day for remaining hours if > 0
    if (!product.hourlyRate && remainingHours > 0) {
      return dailyCost + product.dailyRate;
    }

    return dailyCost + hourlyCost;
  };

  const calculateDuration = () => {
    if (!startDate || !endDate) return "";
    const start = new Date(startDate).getTime();
    const end = new Date(endDate).getTime();
    const hours = Math.ceil((end - start) / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    const remainingHours = hours % 24;

    if (days > 0 && remainingHours > 0) {
      return language === "th"
        ? `${days} วัน ${remainingHours} ชั่วโมง`
        : `${days} days ${remainingHours} hours`;
    } else if (days > 0) {
      return language === "th" ? `${days} วัน` : `${days} days`;
    } else {
      return language === "th" ? `${hours} ชั่วโมง` : `${hours} hours`;
    }
  };

  const handleBooking = async () => {
    if (!isAuthenticated) {
      toast.error(language === "th" ? "กรุณาเข้าสู่ระบบก่อน" : "Please login first");
      return;
    }

    if (!idCardStatus || idCardStatus.status !== "verified") {
      toast.error(language === "th" ? "กรุณายืนยันบัตรประชาชนก่อน" : "Please verify your ID card first");
      navigate("/id-verification");
      return;
    }

    if (!startDate || !endDate) {
      toast.error(language === "th" ? "กรุณาเลือกวันที่" : "Please select dates");
      return;
    }

    try {
      await createRental.mutateAsync({
        productId: parseInt(id || "0"),
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        location: location,
      });
      toast.success(language === "th" ? "จองสำเร็จ!" : "Booking confirmed!");
      navigate("/dashboard");
    } catch (error) {
      toast.error(language === "th" ? "เกิดข้อผิดพลาด" : "Error occurred");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-background">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <Gem className="w-20 h-20 text-muted mx-auto mb-4" />
          <p className="text-muted-foreground text-lg mb-4">
            {language === "th" ? "ไม่พบรายการ" : "Product not found"}
          </p>
          <Link href="/products">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              {language === "th" ? "กลับไปดูทั้งหมด" : "Back to collection"}
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const isIdVerified = idCardStatus?.status === "verified";

  return (
    <div className="min-h-screen bg-background text-foreground animate-in fade-in duration-500">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/products">
            <div className="flex items-center gap-2 cursor-pointer text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium tracking-wide">{language === "th" ? "กลับ" : "Back"}</span>
            </div>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/">
              <div className="flex items-center gap-2">
                <div className="bg-primary p-1.5 rounded-lg">
                  <Gem className="w-4 h-4 text-primary-foreground" />
                </div>
                <span className="font-serif font-bold text-lg gradient-text-gold">
                  Luxcenry
                </span>
              </div>
            </Link>
          </div>
          <LanguageToggle />
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Product Image and Info */}
          <div className="space-y-8">
            {/* Image */}
            <div className="relative w-full h-96 rounded-3xl overflow-hidden shadow-luxury-xl ring-1 ring-black/5 dark:ring-white/10 group">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <Gem className="w-32 h-32 text-muted-foreground/30" />
                </div>
              )}
              {/* Status Badge */}
              <div className={`absolute top-6 right-6 px-4 py-1.5 rounded-full text-sm font-semibold backdrop-blur-md shadow-sm border ${product.status === 'available'
                ? 'bg-green-500/90 text-white border-green-400'
                : product.status === 'rented'
                  ? 'bg-amber-500/90 text-white border-amber-400'
                  : 'bg-red-500/90 text-white border-red-400'
                }`}>
                {product.status === 'available'
                  ? (language === "th" ? "ว่าง" : "Available")
                  : product.status === 'rented'
                    ? (language === "th" ? "ถูกเช่า" : "Rented")
                    : (language === "th" ? "ไม่พร้อมใช้งาน" : "Unavailable")
                }
              </div>
            </div>

            {/* Product Info */}
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <span className="text-primary text-sm font-bold tracking-widest uppercase mb-1 block">{product.category}</span>
                  <h1 className="text-4xl font-serif font-bold text-foreground mb-2">{product.name}</h1>
                  <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <Star className="w-4 h-4 text-primary fill-primary" />
                    <span className="text-sm text-muted-foreground ml-2">(Premium Collection)</span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-gradient-to-r from-border to-transparent my-6" />

              <div className="grid grid-cols-2 gap-8 mb-8">
                <div>
                  <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">{language === "th" ? "เกี่ยวกับ" : "About"}</p>
                  <p className="text-foreground leading-relaxed font-light">
                    {product.description || (language === "th" ? "ไม่มีรายละเอียด" : "No description available.")}
                  </p>
                </div>
                {product.metadata && (
                  <div>
                    <p className="text-sm text-muted-foreground uppercase tracking-widest mb-1">{language === "th" ? "ข้อมูลจำเพาะ" : "Specifications"}</p>
                    <ul className="text-sm space-y-1">
                      {/* Render simplified metadata if possible */}
                      <li className="flex items-center gap-2">
                        <Info className="w-4 h-4 text-primary" />
                        <span>{JSON.stringify(product.metadata).slice(0, 50)}...</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* License Plate (if exists) */}
              {product.licensePlate && (
                <div className="inline-flex items-center gap-2 bg-secondary/50 px-3 py-1.5 rounded-lg border border-border/50">
                  <span className="text-xs text-muted-foreground uppercase">{language === "th" ? "ทะเบียน" : "License"}:</span>
                  <span className="font-mono font-medium text-foreground">{product.licensePlate}</span>
                </div>
              )}
            </div>
          </div>

          {/* Booking Column */}
          <div className="lg:pl-8">
            <Card className="bg-card shadow-luxury-lg border-primary/10 sticky top-24">
              <CardHeader className="bg-secondary/30 border-b border-border/50 pb-6">
                <CardTitle className="flex items-center justify-between">
                  <span className="font-serif text-2xl">{language === "th" ? "การจอง" : "Reservation"}</span>
                  <div className="text-right">
                    <span className="block text-2xl font-bold text-primary">฿{product.dailyRate.toLocaleString()}</span>
                    <span className="text-xs text-muted-foreground font-normal">/ {language === "th" ? "วัน" : "day"}</span>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 pt-6">
                {/* ID Verification Status */}
                {isAuthenticated && (
                  <div className={`p-4 rounded-xl border ${isIdVerified ? 'bg-green-500/10 border-green-500/20' : 'bg-amber-500/10 border-amber-500/20'}`}>
                    <div className="flex items-start gap-3">
                      {isIdVerified ? <CheckCircle className="w-5 h-5 text-green-600" /> : <Shield className="w-5 h-5 text-amber-600" />}
                      <div>
                        <h4 className={`font-semibold text-sm ${isIdVerified ? 'text-green-800' : 'text-amber-800'}`}>
                          {isIdVerified ? (language === "th" ? "ยืนยันตัวตนแล้ว" : "Identity Verified") : (language === "th" ? "ต้องยืนยันตัวตน" : "Verification Required")}
                        </h4>
                        {!isIdVerified && (
                          <Link href="/id-verification">
                            <Button variant="link" className="h-auto p-0 text-amber-700 font-semibold text-xs mt-1">
                              {language === "th" ? "ยืนยันตอนนี้ →" : "Verify Now →"}
                            </Button>
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="location" className="text-sm font-medium text-muted-foreground">
                      {language === "th" ? "สถานที่รับรถ" : "Delivery Location"}
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="location"
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder={language === "th" ? "เช่น สนามบิน, โรงแรม..." : "e.g. Airport, Hotel Name..."}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="startDate" className="text-sm font-medium text-muted-foreground">
                      {language === "th" ? "เช็คอิน" : "Start Date"}
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="startDate"
                        type="datetime-local"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={product.status !== 'available'}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="endDate" className="text-sm font-medium text-muted-foreground">
                      {language === "th" ? "เช็คเอาท์" : "End Date"}
                    </Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <Input
                        id="endDate"
                        type="datetime-local"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={product.status !== 'available'}
                        className="pl-10 bg-background"
                      />
                    </div>
                  </div>
                </div>

                {/* Cost Summary */}
                {startDate && endDate && (
                  <div className="bg-secondary/50 rounded-xl p-4 border border-border/50 animate-in zoom-in-95 duration-300">
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>{language === "th" ? "ระยะเวลา" : "Duration"}</span>
                        <span className="font-medium text-foreground">{calculateDuration()}</span>
                      </div>
                      <div className="h-px bg-border/50" />
                      <div className="flex justify-between items-baseline">
                        <span className="font-semibold">{language === "th" ? "ราคารวมสุทธิ" : "Total Amount"}</span>
                        <span className="font-bold text-2xl text-primary">
                          ฿{calculateCost().toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button
                    onClick={handleBooking}
                    disabled={!isAuthenticated || !isIdVerified || product.status !== 'available' || !startDate || !endDate || createRental.isPending}
                    className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg py-6 text-lg"
                  >
                    {createRental.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        {language === "th" ? "กำลังประมวลผล..." : "Processing..."}
                      </>
                    ) : (
                      language === "th" ? "ยืนยันการจอง" : "Confirm Reservation"
                    )}
                  </Button>
                </div>

                {/* Login Prompt */}
                {!isAuthenticated && (
                  <p className="text-center text-xs text-muted-foreground mt-4">
                    {language === "th" ? "โปรดเข้าสู่ระบบเพื่อดำเนินการต่อ" : "Please login to continue with reservation"}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Policies */}
            <div className="mt-8 space-y-4">
              <div className="flex items-start gap-3">
                <Shield className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-semibold text-sm mb-1">{language === "th" ? "การรับประกันความพึงพอใจ" : "Premium Guarantee"}</h4>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {language === "th"
                      ? "เราตรวจสอบสินทรัพย์ทุกรายการอย่างละเอียดเพื่อความสะอาดและความปลอดภัยสูงสุดของคุณ"
                      : "Every asset is thoroughly inspected and sanitized before every booking to ensure your safety and comfort."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
