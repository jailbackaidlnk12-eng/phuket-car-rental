import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Minus, Plus, Trash2, ShoppingBag, CreditCard, Loader2, Leaf, ArrowLeft } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";
import { useState } from "react";

export default function CartPage() {
    const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCart();
    const { language } = useLanguage();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    // tRPC mutation for creating order
    const createOrder = trpc.orders.create.useMutation({
        onSuccess: (data) => {
            toast.success(language === "th" ? "สร้างออเดอร์สำเร็จ!" : "Order created successfully!");
            clearCart();
        },
        onError: (error) => {
            toast.error(error.message || "Failed to create order");
        },
    });

    const handleCheckout = async () => {
        if (items.length === 0) {
            toast.error(language === "th" ? "ตะกร้าว่างเปล่า" : "Cart is empty");
            return;
        }
        setIsCheckingOut(true);
        try {
            await createOrder.mutateAsync({
                items: items.map((item) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price,
                })),
            });
        } finally {
            setIsCheckingOut(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0]">
            <Header />

            <div className="container mx-auto px-4 py-8">
                {/* Back Button */}
                <Link href="/cannabis">
                    <Button variant="ghost" className="mb-6 text-green-400 hover:text-green-300">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        {language === "th" ? "กลับไปหน้าร้าน" : "Back to Shop"}
                    </Button>
                </Link>

                <h1 className="text-3xl font-bold mb-8 flex items-center gap-3">
                    <ShoppingBag className="w-8 h-8 text-green-500" />
                    {language === "th" ? "ตะกร้าสินค้า" : "Shopping Cart"}
                    {totalItems > 0 && (
                        <Badge className="bg-green-600 text-white">{totalItems}</Badge>
                    )}
                </h1>

                {items.length === 0 ? (
                    <Card className="bg-[#1A1A1A] border-green-900/30 text-center py-16">
                        <CardContent>
                            <Leaf className="w-16 h-16 mx-auto text-green-500/30 mb-4" />
                            <p className="text-gray-400 text-lg">
                                {language === "th" ? "ตะกร้าว่างเปล่า" : "Your cart is empty"}
                            </p>
                            <Link href="/cannabis">
                                <Button className="mt-6 bg-green-600 hover:bg-green-700">
                                    {language === "th" ? "ไปช้อปปิ้ง" : "Go Shopping"}
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid lg:grid-cols-3 gap-8">
                        {/* Cart Items */}
                        <div className="lg:col-span-2 space-y-4">
                            {items.map((item) => (
                                <Card key={item.productId} className="bg-[#1A1A1A] border-green-900/30">
                                    <CardContent className="p-4 flex items-center gap-4">
                                        <img
                                            src={item.imageUrl || "/logo.png"}
                                            alt={item.name}
                                            className="w-20 h-20 object-contain rounded-lg bg-black/50"
                                        />
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-white">{item.name}</h3>
                                            <p className="text-green-400 font-bold">฿{item.price}/g</p>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 border-green-600"
                                                onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                                            >
                                                <Minus className="w-4 h-4" />
                                            </Button>
                                            <span className="w-8 text-center font-bold">{item.quantity}</span>
                                            <Button
                                                variant="outline"
                                                size="icon"
                                                className="h-8 w-8 border-green-600"
                                                onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                                            >
                                                <Plus className="w-4 h-4" />
                                            </Button>
                                        </div>
                                        <p className="font-bold text-white w-24 text-right">
                                            ฿{(item.price * item.quantity).toLocaleString()}
                                        </p>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                                            onClick={() => removeItem(item.productId)}
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Order Summary */}
                        <div>
                            <Card className="bg-[#1A1A1A] border-green-900/30 sticky top-24">
                                <CardHeader>
                                    <CardTitle className="text-white">
                                        {language === "th" ? "สรุปคำสั่งซื้อ" : "Order Summary"}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between text-gray-400">
                                        <span>{language === "th" ? "จำนวน" : "Items"}</span>
                                        <span>{totalItems}</span>
                                    </div>
                                    <div className="flex justify-between text-xl font-bold text-white border-t border-white/10 pt-4">
                                        <span>{language === "th" ? "รวมทั้งหมด" : "Total"}</span>
                                        <span className="text-green-400">฿{totalPrice.toLocaleString()}</span>
                                    </div>
                                    <Button
                                        className="w-full bg-green-600 hover:bg-green-700 text-white h-12 text-lg"
                                        onClick={handleCheckout}
                                        disabled={isCheckingOut}
                                    >
                                        {isCheckingOut ? (
                                            <>
                                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                                {language === "th" ? "กำลังดำเนินการ..." : "Processing..."}
                                            </>
                                        ) : (
                                            <>
                                                <CreditCard className="w-5 h-5 mr-2" />
                                                {language === "th" ? "ชำระเงิน" : "Checkout"}
                                            </>
                                        )}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        className="w-full border-red-500/50 text-red-400 hover:bg-red-500/10"
                                        onClick={clearCart}
                                    >
                                        <Trash2 className="w-4 h-4 mr-2" />
                                        {language === "th" ? "ล้างตะกร้า" : "Clear Cart"}
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
