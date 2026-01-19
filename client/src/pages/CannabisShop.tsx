import { useLanguage } from "@/contexts/LanguageContext";
import { useCart } from "@/contexts/CartContext";
import { trpc } from "@/lib/trpc";
import { Loader2, ShoppingBag, Leaf, Droplets, Wind, Brain, Activity, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/Header";
import { toast } from "sonner";
import { Link } from "wouter";

interface CannabisMetadata {
    type: "cannabis";
    strain: string;
    species: "Sativa" | "Indica" | "Hybrid";
    ratio?: string; // e.g., "50% / 50%"
    flavor: string;
    effects: {
        initial: string;
        late: string;
    };
}

export default function CannabisShop() {
    const { language } = useLanguage();
    const { addItem, totalItems } = useCart();

    // Fetch products with category 'other' (we will filter for cannabis metadata on frontend or backend)
    // Ideally, backend should support filtering, but for now we fetch all 'other' or all products
    const { data: products, isLoading } = trpc.products.list.useQuery();

    const cannabisProducts = products?.filter((p: any) =>
        p.category === 'other' &&
        (p.metadata as any)?.type === 'cannabis'
    ) || [];

    // Temporary fallbacks if DB is empty, to show the UI design immediately
    const demoProducts = [
        {
            id: 991,
            name: "Pink Oreoz",
            category: "other",
            imageUrl: "/pink_oreoz.png",
            dailyRate: 650, // Price example
            metadata: {
                type: "cannabis",
                strain: "Pink Oreoz",
                species: "Hybrid",
                ratio: "50% Sativa / 50% Indica",
                flavor: "Sweet milk, cookies, creamy sweetness with earth and chocolate notes.",
                effects: {
                    initial: "Euphoria, brain relaxation, creative.",
                    late: "Body relaxation, reduces stress/anxiety, not causing couch-lock."
                }
            }
        },
        {
            id: 992,
            name: "Super Boof",
            category: "other",
            imageUrl: "/super_boof.png",
            dailyRate: 700,
            metadata: {
                type: "cannabis",
                strain: "Super Boof",
                species: "Hybrid",
                ratio: "30% Sativa / 70% Indica",
                flavor: "Citrus, cherry, earthy.",
                effects: {
                    initial: "Clear-headed happiness, instant mood lift.",
                    late: "Deep body high, muscle relaxation, sleep aid."
                }
            }
        }
    ];

    const displayProducts = cannabisProducts.length > 0 ? cannabisProducts : demoProducts;

    const handleAddToCart = (product: any) => {
        addItem({
            productId: product.id,
            name: product.name,
            price: product.dailyRate,
            imageUrl: product.imageUrl,
        });
        toast.success(language === "th" ? `เพิ่ม ${product.name} ลงตะกร้าแล้ว` : `Added ${product.name} to cart`);
    };

    return (
        <div className="min-h-screen bg-[#0F0F0F] text-[#E0E0E0] font-sans selection:bg-green-500/30">
            <Header />

            {/* Hero Section */}
            <div className="relative h-[40vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-b from-green-900/20 to-[#0F0F0F] z-0" />
                <div className="text-center z-10 space-y-4 px-4">
                    <Badge className="bg-green-600/20 text-green-400 hover:bg-green-600/30 border-green-500/50 mb-2">
                        <Leaf className="w-3 h-3 mr-1" /> Premium Selection
                    </Badge>
                    <h1 className="text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-green-400 via-emerald-300 to-teal-400 font-['Playfair_Display']">
                        Cannabis Collection
                    </h1>
                    <p className="text-gray-400 max-w-2xl mx-auto text-lg">
                        {language === "th"
                            ? "คัดสรรสายพันธุ์คุณภาพสูง เพื่อประสบการณ์การพักผ่อนที่เหนือระดับ"
                            : "Curated high-quality strains for a superior relaxation experience."}
                    </p>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8 pb-20">
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <Loader2 className="w-10 h-10 animate-spin text-green-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                        {displayProducts.map((product) => {
                            const meta = product.metadata as unknown as CannabisMetadata;

                            return (
                                <Card key={product.id} className="bg-[#1A1A1A] border-green-900/30 overflow-hidden hover:border-green-500/50 transition-all duration-300 shadow-xl group">
                                    <div className="grid md:grid-cols-2 h-full">
                                        {/* Image Section */}
                                        <div className="relative h-64 md:h-auto overflow-hidden bg-black/50">
                                            <img
                                                src={product.imageUrl || "/logo.png"}
                                                alt={product.name}
                                                className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                                            />
                                            <div className="absolute top-4 left-4">
                                                <Badge variant="secondary" className="bg-black/70 text-green-400 backdrop-blur-sm border-none">
                                                    {meta.species || "Hybrid"} {meta.ratio && `• ${meta.ratio}`}
                                                </Badge>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="p-6 flex flex-col h-full relative">
                                            {/* Artistic Background Element */}
                                            <Leaf className="absolute -right-10 -bottom-10 w-48 h-48 text-green-900/10 rotate-45 pointer-events-none" />

                                            <div className="mb-auto space-y-4">
                                                <div>
                                                    <h2 className="text-2xl font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
                                                        {product.name}
                                                    </h2>
                                                    <div className="h-1 w-12 bg-green-500 rounded-full" />
                                                </div>

                                                {/* Flavor Profile */}
                                                <div className="space-y-2">
                                                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold uppercase tracking-wider">
                                                        <Droplets className="w-4 h-4" /> Flavor & Aroma
                                                    </div>
                                                    <p className="text-sm text-gray-400 leading-relaxed">
                                                        {meta.flavor}
                                                    </p>
                                                </div>

                                                {/* Effects */}
                                                <div className="space-y-3 pt-2">
                                                    <div className="flex items-center gap-2 text-purple-400 text-sm font-semibold uppercase tracking-wider">
                                                        <Activity className="w-4 h-4" /> Effects
                                                    </div>

                                                    <div className="bg-[#252525] p-3 rounded-lg border-l-2 border-yellow-500">
                                                        <span className="text-xs text-yellow-500 font-bold uppercase block mb-1">
                                                            <Brain className="w-3 h-3 inline mr-1" /> Initial
                                                        </span>
                                                        <p className="text-xs text-gray-300">{meta.effects?.initial}</p>
                                                    </div>

                                                    <div className="bg-[#252525] p-3 rounded-lg border-l-2 border-blue-500">
                                                        <span className="text-xs text-blue-500 font-bold uppercase block mb-1">
                                                            <Wind className="w-3 h-3 inline mr-1" /> Later
                                                        </span>
                                                        <p className="text-xs text-gray-300">{meta.effects?.late}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between z-10">
                                                <div>
                                                    <p className="text-xs text-gray-500 uppercase">Price per gram</p>
                                                    <p className="text-2xl font-bold text-green-400">฿{product.dailyRate}</p>
                                                </div>
                                                <Button
                                                    onClick={() => handleAddToCart(product)}
                                                    className="bg-green-600 hover:bg-green-700 text-white shadow-lg shadow-green-900/20"
                                                >
                                                    <ShoppingBag className="w-4 h-4 mr-2" />
                                                    {language === "th" ? "เพิ่มลงตะกร้า" : "Add to Cart"}
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

// Floating Cart Button at the bottom of the page is handled via Header
