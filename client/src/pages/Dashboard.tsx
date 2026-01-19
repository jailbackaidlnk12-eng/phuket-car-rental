import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Gem, Loader2, Clock, CreditCard, LogOut, Shield, CheckCircle, AlertCircle, Bell, Box, Calendar, MapPin } from "lucide-react";
import { toast } from "sonner";
import { usePushNotification } from "@/hooks/usePushNotification";

export default function Dashboard() {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const { isSupported, permission, requestPermission } = usePushNotification();

  const { data: rentals, isLoading: rentalsLoading } = trpc.rentals.myRentals.useQuery();
  const { data: payments, isLoading: paymentsLoading } = trpc.payments.myPayments.useQuery();
  const { data: activeRental } = trpc.rentals.activeRental.useQuery();
  const { data: idCardStatus } = trpc.idCard.getStatus.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id }
  );
  const completeRental = trpc.rentals.complete.useMutation();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleCompleteRental = async (rentalId: number) => {
    try {
      await completeRental.mutateAsync({ id: rentalId });
      toast.success(language === "th" ? "คืนสินค้าสำเร็จ" : "Rental completed");
    } catch (error) {
      toast.error(language === "th" ? "เกิดข้อผิดพลาด" : "Error occurred");
    }
  };

  const handleEnableNotifications = async () => {
    const granted = await requestPermission();
    if (granted) {
      toast.success(language === "th" ? "เปิดการแจ้งเตือนแล้ว" : "Notifications enabled");
    }
  };

  const updateLocation = trpc.auth.updateLocation.useMutation();

  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error(language === "th" ? "เบราว์เซอร์ไม่รองรับ" : "Geolocation not supported");
      return;
    }

    toast.loading(language === "th" ? "กำลังดึงตําแหน่ง..." : "Getting location...");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await updateLocation.mutateAsync({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          toast.dismiss();
          toast.success(language === "th" ? "ส่งตําแหน่งเรียบร้อย" : "Location shared successfully");
        } catch (error) {
          toast.dismiss();
          toast.error(language === "th" ? "ส่งตําแหน่งล้มเหลว" : "Failed to share location");
        }
      },
      (error) => {
        toast.dismiss();
        toast.error(language === "th" ? "ไม่สามารถดึงตําแหน่งได้" : "Could not get location");
      }
    );
  };

  const calculateTimeRemaining = (endDate: Date) => {
    const now = new Date().getTime();
    const end = new Date(endDate).getTime();
    const diff = end - now;

    if (diff <= 0) return language === "th" ? "หมดเวลาแล้ว" : "Expired";

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer group">
              <div className="bg-primary p-1.5 rounded text-primary-foreground group-hover:scale-110 transition-transform">
                <Gem className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-xl font-bold font-serif">Mirin</h1>
                <p className="text-xs text-muted-foreground">Concierge</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            {isSupported && permission !== "granted" && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEnableNotifications}
                className="hidden sm:flex items-center gap-2"
              >
                <Bell className="w-4 h-4" />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {language === "th" ? "ออกจากระบบ" : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold font-serif mb-2">
            {language === "th" ? "แดชบอร์ด" : "Dashboard"}
          </h2>
          <p className="text-muted-foreground">
            {language === "th" ? `ยินดีต้อนรับ, ${user?.name}!` : `Welcome back, ${user?.name}.`}
          </p>
        </div>

        {/* ID Card Verification Alert */}
        {!idCardStatus || idCardStatus.status !== "verified" ? (
          <Card className="mb-6 border-primary/20 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Shield className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-primary">
                      {language === "th" ? "ยืนยันตัวตน" : "Verification Required"}
                    </h3>
                    <p className="text-sm text-foreground/70">
                      {!idCardStatus
                        ? (language === "th" ? "กรุณาอัพโหลดเอกสารเพื่อใช้บริการ" : "Please submit ID verification to access rentals")
                        : idCardStatus.status === "pending"
                          ? (language === "th" ? "กำลังตรวจสอบข้อมูล" : "Verification in progress")
                          : (language === "th" ? "ถูกปฏิเสธ กรุณาลองใหม่" : "Verification rejected, please retry")
                      }
                    </p>
                  </div>
                </div>
                <Link href="/id-verification">
                  <Button className="bg-primary hover:bg-primary/90 text-primary-foreground">
                    {!idCardStatus
                      ? (language === "th" ? "อัพโหลด" : "Verify Now")
                      : idCardStatus.status === "pending"
                        ? (language === "th" ? "ดูสถานะ" : "Check Status")
                        : (language === "th" ? "อัพโหลดใหม่" : "Retry")
                    }
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ) : null}

        {/* Active Rental Alert */}
        {activeRental && (
          <Card className="mb-6 border-blue-500/20 bg-blue-500/5">
            <CardHeader>
              <CardTitle className=" text-blue-600 flex items-center gap-2">
                <Clock className="w-5 h-5" />
                {language === "th" ? "กำลังใช้งาน" : "Active Session"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "th" ? "สินค้า" : "Product"}
                  </p>
                  <p className="font-semibold">ID: {activeRental.productId}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">
                    {language === "th" ? "เวลาที่เหลือ" : "Time Remaining"}
                  </p>
                  <p className="font-semibold text-lg text-primary">
                    {calculateTimeRemaining(activeRental.endDate)}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleCompleteRental(activeRental.id)}
                    disabled={completeRental.isPending}
                    className="bg-primary hover:bg-primary/90"
                  >
                    {language === "th" ? "คืนสินค้า" : "Complete"}
                  </Button>
                  <Link href="/payments">
                    <Button size="sm" variant="outline" className="border-primary/50 text-primary">
                      {language === "th" ? "ขยายเวลา" : "Extend"}
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Link href="/products">
            <Card className="cursor-pointer hover:bg-muted/50 transition group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Box className="w-6 h-6" />
                </div>
                <p className="font-semibold text-sm">
                  {language === "th" ? "เช่าสินค้า" : "Browse Collection"}
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/payments">
            <Card className="cursor-pointer hover:bg-muted/50 transition group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <CreditCard className="w-6 h-6" />
                </div>
                <p className="font-semibold text-sm">
                  {language === "th" ? "เติมเงิน" : "Top Up"}
                </p>
              </CardContent>
            </Card>
          </Link>
          <Link href="/id-verification">
            <Card className="cursor-pointer hover:bg-muted/50 transition group">
              <CardContent className="pt-6 text-center">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Shield className="w-6 h-6" />
                </div>
                <p className="font-semibold text-sm">
                  {language === "th" ? "ยืนยันตัวตน" : "Verification"}
                </p>
              </CardContent>
            </Card>
          </Link>
          <Card
            className="cursor-pointer hover:bg-muted/50 transition group"
            onClick={handleShareLocation}
          >
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <MapPin className="w-6 h-6 text-green-600 group-hover:text-white" />
              </div>
              <p className="font-semibold text-sm">
                {language === "th" ? "แชร์พิกัด" : "Share Location"}
              </p>
            </CardContent>
          </Card>
          {user?.role === "admin" && (
            <Link href="/admin">
              <Card className="cursor-pointer hover:bg-muted/50 transition group">
                <CardContent className="pt-6 text-center">
                  <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:bg-destructive group-hover:text-destructive-foreground transition-colors">
                    <AlertCircle className="w-6 h-6 text-destructive" />
                  </div>
                  <p className="font-semibold text-sm">
                    {language === "th" ? "แอดมิน" : "Admin Zone"}
                  </p>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        {/* Tabs */}
        <Tabs defaultValue="rentals" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="rentals">
              {language === "th" ? "ประวัติการเช่า" : "History"}
            </TabsTrigger>
            <TabsTrigger value="payments">
              {language === "th" ? "การชำระเงิน" : "Payments"}
            </TabsTrigger>
            <TabsTrigger value="profile">
              {language === "th" ? "โปรไฟล์" : "Profile"}
            </TabsTrigger>
          </TabsList>

          {/* Rentals Tab */}
          <TabsContent value="rentals">
            {rentalsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : rentals && rentals.length > 0 ? (
              <div className="space-y-4">
                {rentals.map((rental) => (
                  <Card key={rental.id}>
                    <CardContent className="pt-6">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {language === "th" ? "สถานะ" : "Status"}
                          </p>
                          <p className={`font-semibold capitalize ${rental.status === 'active' ? 'text-primary' :
                            rental.status === 'pending' ? 'text-yellow-600' :
                              'text-muted-foreground'
                            }`}>
                            {rental.status}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {language === "th" ? "วันที่เริ่ม" : "Start"}
                          </p>
                          <p className="font-semibold">
                            {new Date(rental.startDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {language === "th" ? "วันที่สิ้นสุด" : "End"}
                          </p>
                          <p className="font-semibold">
                            {new Date(rental.endDate).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground">
                            {language === "th" ? "ราคารวม" : "Total"}
                          </p>
                          <p className="font-semibold text-lg text-primary">
                            ฿{rental.totalCost}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                <Box className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  {language === "th" ? "ยังไม่มีประวัติ" : "No history found"}
                </p>
                <Link href="/products">
                  <Button variant="outline">
                    {language === "th" ? "เริ่มเช่าสินค้า" : "Start Renting"}
                  </Button>
                </Link>
              </div>
            )}
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            {/* Payments content logic is good, just visual tweak needed? */}
            {/* Reused existing logic but with new styling */}
            {paymentsLoading ? (
              <div className="flex justify-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : payments && payments.length > 0 ? (
              <div className="space-y-4">
                {payments.map(payment => (
                  <Card key={payment.id}>
                    <CardContent className="pt-6 flex justify-between items-center">
                      <div>
                        <p className="font-semibold">{payment.type.replace('_', ' ').toUpperCase()}</p>
                        <p className="text-sm text-muted-foreground">{new Date(payment.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold">฿{payment.amount}</p>
                        <span className={`text-xs ${payment.status === 'completed' ? 'text-green-600' : 'text-yellow-600'}`}>{payment.status}</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-muted/20 rounded-lg border-2 border-dashed">
                <CreditCard className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No payments yet</p>
              </div>
            )}
          </TabsContent>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>
                  {language === "th" ? "ข้อมูลส่วนตัว" : "Profile Details"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "th" ? "ชื่อ" : "Name"}
                    </p>
                    <p className="font-semibold">{user?.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p className="font-semibold">{user?.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "th" ? "ชื่อผู้ใช้" : "Username"}
                    </p>
                    <p className="font-semibold">{user?.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">
                      {language === "th" ? "บทบาท" : "Member Tier"}
                    </p>
                    <p className="font-semibold capitalize">{user?.role === 'admin' ? 'Administrator' : 'Standard Member'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
