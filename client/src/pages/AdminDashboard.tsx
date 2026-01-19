import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import {
  Gem, Loader2, LogOut, Plus, Trash2, Shield, CheckCircle, XCircle,
  Users, CreditCard, Clock, Box, LayoutGrid, FileText, AlertTriangle,
  ChevronDown, ChevronUp
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const { language } = useLanguage();
  const { user, logout } = useAuth();
  const [, navigate] = useLocation();
  const utils = trpc.useUtils();
  const [expandedLogId, setExpandedLogId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'motorcycle' as 'car' | 'motorcycle' | 'room' | 'yacht' | 'other',
    licensePlate: '',
    hourlyRate: '0',
    dailyRate: '0',
    description: '',
    imageUrl: '',
    metadata: '{}',
  });

  // ALL hooks must be called before any early returns
  const isAdmin = user?.role === 'admin';

  // API Queries (always called, regardless of admin status)
  const { data: adminStats, isLoading: statsLoading } = trpc.admin.stats.useQuery(undefined, { enabled: isAdmin });
  const { data: products, isLoading: productsLoading } = trpc.products.list.useQuery(undefined, { enabled: isAdmin });
  const { data: rentals, isLoading: rentalsLoading } = trpc.rentals.all.useQuery(undefined, { enabled: isAdmin });
  const { data: payments, isLoading: paymentsLoading } = trpc.payments.all.useQuery(undefined, { enabled: isAdmin });
  const { data: users, isLoading: usersLoading } = trpc.users.all.useQuery(undefined, { enabled: isAdmin });
  const { data: pendingIdCards, isLoading: idCardsLoading } = trpc.idCard.pending.useQuery(undefined, { enabled: isAdmin });
  const { data: allIdCards } = trpc.idCard.all.useQuery(undefined, { enabled: isAdmin });
  const { data: auditLogs, isLoading: auditLogsLoading } = trpc.admin.auditLogs.useQuery({ limit: 100 }, { enabled: isAdmin });

  // Mutations
  const createProduct = trpc.products.create.useMutation({
    onSuccess: () => { utils.products.invalidate(); utils.admin.invalidate(); },
  });
  const deleteProduct = trpc.products.delete.useMutation({
    onSuccess: () => { utils.products.invalidate(); utils.admin.invalidate(); },
  });
  const approveRental = trpc.rentals.approve.useMutation({
    onSuccess: () => { utils.rentals.invalidate(); utils.admin.invalidate(); },
  });
  const cancelRental = trpc.rentals.cancel.useMutation({
    onSuccess: () => { utils.rentals.invalidate(); utils.admin.invalidate(); },
  });
  const verifyIdCard = trpc.idCard.verify.useMutation({
    onSuccess: () => { utils.idCard.invalidate(); utils.admin.invalidate(); },
  });
  const confirmPayment = trpc.payments.confirm.useMutation({
    onSuccess: () => { utils.payments.invalidate(); utils.users.invalidate(); utils.admin.invalidate(); },
  });
  const rejectPayment = trpc.payments.reject.useMutation({
    onSuccess: () => { utils.payments.invalidate(); utils.admin.invalidate(); },
  });
  const makeAdmin = trpc.users.makeAdmin.useMutation({
    onSuccess: () => { utils.users.invalidate(); utils.admin.invalidate(); },
  });
  const removeAdmin = trpc.users.removeAdmin.useMutation({
    onSuccess: () => { utils.users.invalidate(); utils.admin.invalidate(); },
  });

  // Check if user is admin - AFTER all hooks
  if (!isAdmin) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen bg-background">
        <Shield className="w-16 h-16 text-destructive mb-4" />
        <p className="text-destructive text-lg font-semibold">
          {language === "th" ? "ต้องเป็นแอดมินเท่านั้น" : "Admin access required"}
        </p>
        <Link href="/">
          <Button className="mt-4 bg-primary hover:bg-primary/90">
            {language === "th" ? "กลับหน้าแรก" : "Back to Home"}
          </Button>
        </Link>
      </div>
    );
  }

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  const handleAddProduct = async () => {
    if (!formData.name || !formData.dailyRate) {
      toast.error(language === "th" ? "กรุณากรอกข้อมูลที่จำเป็น (ชื่อ, ราคา)" : "Please fill required fields (Name, Price)");
      return;
    }

    try {
      let parsedMetadata = {};
      try {
        parsedMetadata = JSON.parse(formData.metadata || '{}');
      } catch (e) {
        toast.error("Invalid JSON metadata");
        return;
      }

      await createProduct.mutateAsync({
        ...formData,
        hourlyRate: parseFloat(formData.hourlyRate) || 0,
        dailyRate: parseFloat(formData.dailyRate),
        metadata: parsedMetadata,
      });
      toast.success(language === "th" ? "เพิ่มสินค้าสำเร็จ" : "Product added successfully");
      setFormData({
        name: '',
        category: 'motorcycle',
        licensePlate: '',
        hourlyRate: '0',
        dailyRate: '0',
        description: '',
        imageUrl: '',
        metadata: '{}',
      });
    } catch (error) {
      toast.error(language === "th" ? "เกิดข้อผิดพลาด" : "Error occurred");
    }
  };

  const handleDeleteProduct = async (id: number) => {
    if (confirm(language === "th" ? "ยืนยันการลบ?" : "Are you sure?")) {
      try {
        await deleteProduct.mutateAsync({ id });
        toast.success(language === "th" ? "ลบสำเร็จ" : "Deleted successfully");
      } catch (error) {
        toast.error(language === "th" ? "เกิดข้อผิดพลาด" : "Error occurred");
      }
    }
  };

  const handleApproveRental = async (rentalId: number) => {
    try { await approveRental.mutateAsync({ id: rentalId }); toast.success("Approved!"); } catch { toast.error("Error"); }
  };
  const handleCancelRental = async (rentalId: number) => {
    if (confirm("Confirm?")) { try { await cancelRental.mutateAsync({ id: rentalId }); toast.success("Cancelled!"); } catch { toast.error("Error"); } }
  };
  const handleVerifyIdCard = async (idCardId: number) => {
    try { await verifyIdCard.mutateAsync({ id: idCardId, status: "verified" }); toast.success("Verified!"); } catch { toast.error("Error"); }
  };
  const handleRejectIdCard = async (idCardId: number) => {
    const reason = prompt("Reason:");
    if (reason) { try { await verifyIdCard.mutateAsync({ id: idCardId, status: "rejected", notes: reason }); toast.success("Rejected!"); } catch { toast.error("Error"); } }
  };
  const handleConfirmPayment = async (id: number) => {
    try { await confirmPayment.mutateAsync({ id }); toast.success("Confirmed!"); } catch { toast.error("Error"); }
  };
  const handleRejectPayment = async (id: number) => {
    if (confirm("Reject?")) { try { await rejectPayment.mutateAsync({ id }); toast.success("Rejected!"); } catch { toast.error("Error"); } }
  };
  const handleMakeAdmin = async (userId: number) => {
    if (confirm("Make this user an admin?")) {
      try { await makeAdmin.mutateAsync({ userId }); toast.success("User is now admin!"); } catch { toast.error("Error"); }
    }
  };
  const handleRemoveAdmin = async (userId: number) => {
    if (confirm("Remove admin privileges?")) {
      try { await removeAdmin.mutateAsync({ userId }); toast.success("Admin removed!"); } catch { toast.error("Error"); }
    }
  };

  // Stats from server
  const totalProducts = adminStats?.totalProducts || 0;
  const availableProducts = adminStats?.availableProducts || 0;
  const activeRentals = adminStats?.activeRentals || 0;
  const pendingPayments = adminStats?.pendingPayments || 0;
  const pendingIdCardsCount = adminStats?.pendingIdCards || 0;
  const totalUsers = adminStats?.totalUsers || 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-2 cursor-pointer">
              <div className="bg-primary/10 p-1.5 rounded text-primary-foreground">
                <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Admin</h1>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              {language === "th" ? "ออกจากระบบ" : "Logout"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                  <Box className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "..." : totalProducts}</p>
                  <p className="text-sm text-muted-foreground">{language === "th" ? "สินค้าทั้งหมด" : "Products"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "..." : availableProducts}</p>
                  <p className="text-sm text-muted-foreground">{language === "th" ? "ว่าง" : "Available"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "..." : activeRentals}</p>
                  <p className="text-sm text-muted-foreground">{language === "th" ? "กำลังเช่า" : "Active"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "..." : pendingPayments}</p>
                  <p className="text-sm text-muted-foreground">{language === "th" ? "รอชำระ" : "Pending $"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Shield className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "..." : pendingIdCardsCount}</p>
                  <p className="text-sm text-muted-foreground">{language === "th" ? "รอยืนยัน" : "Pending ID"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{statsLoading ? "..." : totalUsers}</p>
                  <p className="text-sm text-muted-foreground">{language === "th" ? "ผู้ใช้" : "Users"}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="products" className="w-full">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="products">
              <LayoutGrid className="w-4 h-4 mr-2" />
              {language === "th" ? "สินค้า" : "Products"}
            </TabsTrigger>
            <TabsTrigger value="rentals">
              <Clock className="w-4 h-4 mr-2" />
              {language === "th" ? "การเช่า" : "Rentals"}
            </TabsTrigger>
            <TabsTrigger value="idcards">
              <Shield className="w-4 h-4 mr-2" />
              {language === "th" ? "บัตรปชช." : "ID Cards"}
            </TabsTrigger>
            <TabsTrigger value="payments">
              <CreditCard className="w-4 h-4 mr-2" />
              {language === "th" ? "ชำระเงิน" : "Payments"}
            </TabsTrigger>
            <TabsTrigger value="users">
              <Users className="w-4 h-4 mr-2" />
              {language === "th" ? "ผู้ใช้" : "Users"}
            </TabsTrigger>
            <TabsTrigger value="auditlogs">
              <FileText className="w-4 h-4 mr-2" />
              {language === "th" ? "Logs" : "Audit"}
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Add Product Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Plus className="w-5 h-5 text-primary" />
                    {language === "th" ? "เพิ่มสินค้าใหม่" : "Add New Product"}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>{language === "th" ? "ชื่อสินค้า" : "Product Name"} *</Label>
                    <Input
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. Luxury Villa, Honda Click"
                    />
                  </div>
                  <div>
                    <Label>{language === "th" ? "หมวดหมู่" : "Category"} *</Label>
                    <Select value={formData.category} onValueChange={(val: any) => setFormData({ ...formData, category: val })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="car">Car</SelectItem>
                        <SelectItem value="motorcycle">Motorcycle</SelectItem>
                        <SelectItem value="room">Room</SelectItem>
                        <SelectItem value="yacht">Yacht</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>{language === "th" ? "ทะเบียน / รหัส" : "License Plate / ID"}</Label>
                    <Input
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                      placeholder="Optional"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label>{language === "th" ? "ราคา/ชม." : "Hourly Rate"}</Label>
                      <Input
                        type="number"
                        value={formData.hourlyRate}
                        onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label>{language === "th" ? "ราคา/วัน" : "Daily Rate"}</Label>
                      <Input
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) => setFormData({ ...formData, dailyRate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div>
                    <Label>{language === "th" ? "รายละเอียด" : "Description"}</Label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>{language === "th" ? "รูปภาพ URL" : "Image URL"}</Label>
                    <Input
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Metadata (JSON)</Label>
                    <Input
                      value={formData.metadata}
                      onChange={(e) => setFormData({ ...formData, metadata: e.target.value })}
                      placeholder='{"brand": "...", "model": "..."}'
                      className="font-mono text-xs"
                    />
                  </div>
                  <Button
                    onClick={handleAddProduct}
                    disabled={createProduct.isPending}
                    className="w-full"
                  >
                    {createProduct.isPending ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    {language === "th" ? "เพิ่มรายการ" : "Add Product"}
                  </Button>
                </CardContent>
              </Card>

              {/* Products List */}
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>
                      {language === "th" ? "รายการทั้งหมด" : "Inventory"}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {productsLoading ? (
                      <div className="flex justify-center py-8">
                        <Loader2 className="w-8 h-8 animate-spin text-primary" />
                      </div>
                    ) : products && products.length > 0 ? (
                      <div className="space-y-4">
                        {products.map((product) => (
                          <div key={product.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-muted/50 transition">
                            <div className="flex items-center gap-4">
                              {product.imageUrl ? (
                                <img src={product.imageUrl} alt={product.name} className="w-16 h-16 object-cover rounded-lg" />
                              ) : (
                                <div className="w-16 h-16 bg-secondary rounded-lg flex items-center justify-center">
                                  <Box className="w-8 h-8 text-muted-foreground" />
                                </div>
                              )}
                              <div>
                                <p className="font-semibold">{product.name}</p>
                                <div className="flex gap-2 text-xs text-muted-foreground">
                                  <span className="uppercase border px-1 rounded">{product.category}</span>
                                  <span>{product.licensePlate}</span>
                                </div>
                                <p className={`text-xs font-medium mt-1 ${product.status === 'available' ? 'text-green-600' : 'text-destructive'}`}>
                                  {product.status}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="text-right">
                                <p className="font-semibold text-primary">฿{product.dailyRate}</p>
                              </div>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteProduct(product.id)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        No products found.
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          {/* Rentals Tab */}
          <TabsContent value="rentals">
            <Card>
              <CardHeader>
                <CardTitle>{language === "th" ? "รายการเช่าทั้งหมด" : "All Rentals"}</CardTitle>
              </CardHeader>
              <CardContent>
                {rentalsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : rentals && rentals.length > 0 ? (
                  <div className="space-y-4">
                    {rentals.map((rental) => (
                      <div key={rental.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-muted/50 transition">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
                          <div>
                            <p className="text-xs text-muted-foreground">ID</p>
                            <p className="font-semibold">#{rental.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">User</p>
                            <p className="font-semibold">#{rental.userId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Product</p>
                            <p className="font-semibold">#{rental.productId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Dates</p>
                            <p className="text-sm">{new Date(rental.startDate).toLocaleDateString()} - {new Date(rental.endDate).toLocaleDateString()}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className={`font-semibold capitalize ${rental.status === 'active' ? 'text-green-600' :
                              rental.status === 'pending' ? 'text-yellow-600' :
                                rental.status === 'completed' ? 'text-blue-600' :
                                  'text-destructive'
                              }`}>{rental.status}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {rental.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleApproveRental(rental.id)}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleCancelRental(rental.id)}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No rentals found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ID Cards Tab */}
          <TabsContent value="idcards">
            <Card>
              <CardHeader>
                <CardTitle>{language === "th" ? "รอการยืนยันบัตรประชาชน" : "Pending ID Verifications"}</CardTitle>
              </CardHeader>
              <CardContent>
                {idCardsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : pendingIdCards && pendingIdCards.length > 0 ? (
                  <div className="space-y-4">
                    {pendingIdCards.map((idCard) => (
                      <div key={idCard.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-muted/50 transition">
                        <div className="flex items-center gap-4">
                          {idCard.imageUrl && (
                            <img src={idCard.imageUrl} alt="ID" className="w-24 h-16 object-cover rounded border" />
                          )}
                          <div>
                            <p className="font-semibold">{idCard.fullName}</p>
                            <p className="text-sm text-muted-foreground">ID: {idCard.idNumber}</p>
                            <p className="text-sm text-muted-foreground">DOB: {idCard.dateOfBirth}</p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => handleVerifyIdCard(idCard.id)}>
                            <CheckCircle className="w-4 h-4 mr-1" /> Verify
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => handleRejectIdCard(idCard.id)}>
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
                    No pending verifications!
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Payments Tab */}
          <TabsContent value="payments">
            <Card>
              <CardHeader>
                <CardTitle>{language === "th" ? "รายการชำระเงินทั้งหมด" : "All Payments"}</CardTitle>
              </CardHeader>
              <CardContent>
                {paymentsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-muted/50 transition">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 flex-1">
                          <div>
                            <p className="text-xs text-muted-foreground">ID</p>
                            <p className="font-semibold">#{payment.id}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">User</p>
                            <p className="font-semibold">#{payment.userId}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Type</p>
                            <p className="font-semibold uppercase text-xs">{payment.type.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Amount</p>
                            <p className="font-semibold text-primary">฿{payment.amount.toFixed(2)}</p>
                          </div>
                          <div>
                            <p className="text-xs text-muted-foreground">Status</p>
                            <p className={`font-semibold capitalize ${payment.status === 'completed' ? 'text-green-600' :
                              payment.status === 'pending' ? 'text-yellow-600' :
                                'text-destructive'
                              }`}>{payment.status}</p>
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          {payment.status === 'pending' && (
                            <>
                              <Button size="sm" onClick={() => handleConfirmPayment(payment.id)}>
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button size="sm" variant="destructive" onClick={() => handleRejectPayment(payment.id)}>
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No payments found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>{language === "th" ? "ผู้ใช้ทั้งหมด" : "All Users"}</CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : users && users.length > 0 ? (
                  <div className="space-y-4">
                    {users.map((u) => (
                      <div key={u.id} className="border rounded-lg p-4 flex justify-between items-center hover:bg-muted/50 transition">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                            <Users className="w-6 h-6 text-primary" />
                          </div>
                          <div>
                            <p className="font-semibold">{u.name || u.username}</p>
                            <p className="text-sm text-muted-foreground">@{u.username}</p>
                            <p className="text-xs text-muted-foreground">{u.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${u.role === 'admin' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'
                            }`}>
                            {u.role}
                          </span>
                          {u.role === 'admin' && u.id !== user?.id ? (
                            <Button size="sm" variant="outline" onClick={() => handleRemoveAdmin(u.id)}>
                              Remove Admin
                            </Button>
                          ) : u.role === 'user' ? (
                            <Button size="sm" variant="outline" onClick={() => handleMakeAdmin(u.id)}>
                              Make Admin
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">No users found.</div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Audit Logs Tab */}
          <TabsContent value="auditlogs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {language === "th" ? "บันทึกกิจกรรม" : "Audit Logs"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                {auditLogsLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : auditLogs && auditLogs.length > 0 ? (
                  <div className="space-y-2">
                    {auditLogs.map((log) => (
                      <div key={log.id} className="border rounded-lg p-3 hover:bg-muted/50 transition">
                        <div className="flex justify-between items-center cursor-pointer" onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}>
                          <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${log.action === 'create' ? 'bg-green-100 text-green-600' :
                              log.action === 'update' ? 'bg-blue-100 text-blue-600' :
                                log.action === 'delete' ? 'bg-red-100 text-red-600' :
                                  'bg-gray-100 text-gray-600'
                              }`}>
                              {log.action === 'create' ? <Plus className="w-4 h-4" /> :
                                log.action === 'update' ? <FileText className="w-4 h-4" /> :
                                  log.action === 'delete' ? <Trash2 className="w-4 h-4" /> :
                                    <AlertTriangle className="w-4 h-4" />}
                            </div>
                            <div>
                              <p className="font-medium text-sm">
                                <span className="uppercase text-xs bg-muted px-1 rounded mr-2">{log.action}</span>
                                {log.targetTable} #{log.targetId}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                User #{log.userId} • {new Date(log.createdAt).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          {expandedLogId === log.id ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                        {expandedLogId === log.id && (
                          <div className="mt-3 pt-3 border-t text-xs">
                            {log.oldValue && (
                              <div className="mb-2">
                                <p className="text-muted-foreground mb-1">Old Value:</p>
                                <pre className="bg-muted p-2 rounded overflow-x-auto">{log.oldValue}</pre>
                              </div>
                            )}
                            {log.newValue && (
                              <div>
                                <p className="text-muted-foreground mb-1">New Value:</p>
                                <pre className="bg-muted p-2 rounded overflow-x-auto">{log.newValue}</pre>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="w-12 h-12 mx-auto mb-2" />
                    No audit logs yet.
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
