import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Link } from "wouter";
import { Search, Loader2, MapPin, Star, Sparkles, Gem } from "lucide-react";
import { useState } from "react";

export default function Products() {
  const { language } = useLanguage();
  const [searchTerm, setSearchTerm] = useState("");

  const { data: products, isLoading } = trpc.products.available.useQuery();

  const filteredProducts = products?.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Header */}
      <header className="border-b bg-background/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/">
            <div className="flex items-center gap-3 cursor-pointer logo-luxury">
              <div className="bg-primary p-2 rounded-lg">
                <Gem className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-serif font-bold gradient-text-gold">
                  Luxcenry
                </h1>
                <p className="text-xs text-muted-foreground uppercase tracking-widest">Premium Assets</p>
              </div>
            </div>
          </Link>
          <div className="flex items-center gap-4">
            <LanguageToggle />
            <Link href="/dashboard">
              <Button variant="outline" size="sm" className="border-primary/20 hover:border-primary/50 text-primary">
                {language === "th" ? "แดชบอร์ด" : "Dashboard"}
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero / Filter Section */}
      <div className="luxury-gradient-hero py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 text-primary mb-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <MapPin className="w-4 h-4" />
            <span className="text-sm font-medium tracking-wide border-b border-primary/20 pb-1">
              PHUKET, THAILAND
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-serif font-bold mb-6 text-foreground drop-shadow-sm animate-in fade-in zoom-in duration-700 delay-100">
            {language === "th" ? "คอลเลกชันของเรา" : "Our Collection"}
          </h2>
          <p className="max-w-xl mx-auto text-muted-foreground mb-8 text-lg font-light">
            {language === "th"
              ? "ค้นพบความหรูหราที่เหนือระดับ กับยานยนต์และที่พักที่เราคัดสรรมาเพื่อคุณ"
              : "Discover unparalleled luxury with our curated selection of vehicles and spaces."}
          </p>

          {/* Search Bar */}
          <div className="relative max-w-lg mx-auto shadow-luxury-lg rounded-full animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
            <Search className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder={language === "th" ? "ค้นหารถรุ่นที่ต้องการ..." : "Search for your dream machine..."}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 py-6 rounded-full border-secondary bg-white/90 backdrop-blur-sm focus:ring-primary/50 text-lg shadow-inner"
            />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
          </div>
        )}

        {/* Products Grid */}
        {!isLoading && filteredProducts.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredProducts.map((product, index) => (
              <Card key={product.id} className="overflow-hidden hover:shadow-luxury-xl transition-all duration-500 group bg-card border-none ring-1 ring-black/5 dark:ring-white/10">
                {/* Image */}
                <div className="relative w-full h-64 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent z-10 opacity-60 group-hover:opacity-40 transition-opacity" />
                  {product.imageUrl ? (
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-secondary">
                      <Gem className="w-16 h-16 text-muted-foreground/30" />
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-20">
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-white/90 text-primary backdrop-blur-md shadow-sm uppercase tracking-wider">
                      {product.category}
                    </span>
                  </div>

                  {/* Status Badge */}
                  <div className={`absolute top-4 right-4 z-20 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md shadow-sm border ${product.status === 'available'
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

                  {/* Title Overlay */}
                  <div className="absolute bottom-0 left-0 p-6 z-20 w-full transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-2xl font-serif font-bold text-white drop-shadow-md mb-1">{product.name}</h3>
                    <div className="flex items-center text-white/90 text-sm">
                      <Sparkles className="w-3 h-3 mr-1 text-primary-foreground" />
                      <span>Premium Selection</span>
                    </div>
                  </div>
                </div>

                <CardContent className="pt-6 pb-6 px-6">
                  {/* Features / Description */}
                  {product.description && (
                    <p className="text-muted-foreground mb-6 line-clamp-2 font-light text-sm h-10 leading-relaxed">
                      {product.description}
                    </p>
                  )}

                  {/* Pricing */}
                  <div className="flex items-end justify-between mb-6 pb-6 border-b border-border/50">
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                        {language === "th" ? "รายวัน" : "Daily Rate"}
                      </p>
                      <div className="flex items-baseline gap-1">
                        <span className="font-serif font-bold text-2xl text-primary">฿{product.dailyRate.toLocaleString()}</span>
                        <span className="text-xs text-muted-foreground">/ {language === "th" ? "วัน" : "day"}</span>
                      </div>
                    </div>
                    {product.hourlyRate && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">
                          {language === "th" ? "รายชั่วโมง" : "Hourly"}
                        </p>
                        <span className="font-semibold text-foreground/80">฿{product.hourlyRate.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3">
                    <Link href={`/products/${product.id}`} className="flex-1">
                      <Button variant="outline" className="w-full border-primary/30 text-foreground hover:bg-secondary hover:text-primary transition-colors">
                        {language === "th" ? "รายละเอียด" : "Details"}
                      </Button>
                    </Link>
                    {product.status === 'available' && (
                      <Link href={`/products/${product.id}`} className="flex-1">
                        <Button className="w-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20">
                          {language === "th" ? "จองเลย" : "Reserve"}
                        </Button>
                      </Link>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* No Results */}
        {!isLoading && filteredProducts.length === 0 && (
          <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border/50">
            <Gem className="w-16 h-16 text-muted mx-auto mb-6" />
            <h3 className="text-2xl font-serif font-semibold text-foreground mb-3">
              {language === "th" ? "ไม่พบรายการ" : "No items found"}
            </h3>
            <p className="text-muted-foreground max-w-md mx-auto">
              {language === "th"
                ? "ลองค้นหาด้วยคำค้นอื่น หรือตรวจสอบอีกครั้งในภายหลัง"
                : "We couldn't find any premium assets matching your search. Try adjusting your filters."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
