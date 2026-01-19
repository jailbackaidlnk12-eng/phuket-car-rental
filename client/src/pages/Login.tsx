import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLanguage } from "@/contexts/LanguageContext";
import { Loader2 } from "lucide-react";

export default function Login() {
    const [, setLocation] = useLocation();
    const { t } = useLanguage();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const utils = trpc.useUtils();
    const loginMutation = trpc.auth.login.useMutation({
        onSuccess: (data) => {
            toast.success(t("loginSuccess") || "Login successful!");
            utils.auth.me.invalidate();

            // Redirect based on user role
            if (data.user.role === 'admin') {
                setLocation("/admin");
            } else {
                setLocation("/dashboard");
            }
        },
        onError: (error) => {
            toast.error(error.message || t("loginFailed") || "Login failed");
        },
        onSettled: () => {
            setIsLoading(false);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!username || !password) {
            toast.error(t("fillAllFields") || "Please fill all fields");
            return;
        }

        setIsLoading(true);
        loginMutation.mutate({ username, password });
    };

    return (
        <div className="min-h-screen flex flex-col luxury-gradient-hero">
            <Header />

            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md glass-luxury shadow-luxury-lg border-2 border-[#D4AF37]/20">
                    <CardHeader className="text-center space-y-2">
                        <CardTitle className="text-3xl font-bold gradient-text-gold font-['Playfair_Display']">
                            {t("login") || "Login"}
                        </CardTitle>
                        <CardDescription className="text-base">
                            {t("loginDescription") || "Enter your credentials to access your account"}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-5">
                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium">
                                    {t("username") || "Username"}
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder={t("enterUsername") || "Enter username"}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="username"
                                    className="border-[#D4AF37]/30 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-sm font-medium">
                                    {t("password") || "Password"}
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t("enterPassword") || "Enter password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="current-password"
                                    className="border-[#D4AF37]/30 focus:ring-[#D4AF37] focus:border-[#D4AF37] transition-all duration-300"
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full luxury-gradient hover:shadow-luxury transition-all duration-300 transform hover:scale-[1.02] text-white font-semibold"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t("loggingIn") || "Logging in..."}
                                    </>
                                ) : (
                                    t("login") || "Login"
                                )}
                            </Button>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t("noAccount") || "Don't have an account?"}{" "}
                                <a
                                    href="/register"
                                    className="text-[#D4AF37] hover:text-[#C5A572] font-medium transition-colors duration-200"
                                >
                                    {t("register") || "Register"}
                                </a>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </main>

            <Footer />
        </div >
    );
}
