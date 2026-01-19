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

export default function Register() {
    const [, setLocation] = useLocation();
    const { t } = useLanguage();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const utils = trpc.useUtils();
    const registerMutation = trpc.auth.register.useMutation({
        onSuccess: () => {
            toast.success(t("registerSuccess") || "Registration successful!");
            utils.auth.me.invalidate();
            setLocation("/dashboard");
        },
        onError: (error) => {
            toast.error(error.message || t("registerFailed") || "Registration failed");
        },
        onSettled: () => {
            setIsLoading(false);
        },
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!username || !password) {
            toast.error(t("fillRequiredFields") || "Please fill required fields");
            return;
        }

        if (username.length < 3) {
            toast.error(t("usernameMinLength") || "Username must be at least 3 characters");
            return;
        }

        if (password.length < 6) {
            toast.error(t("passwordMinLength") || "Password must be at least 6 characters");
            return;
        }

        if (password !== confirmPassword) {
            toast.error(t("passwordMismatch") || "Passwords do not match");
            return;
        }

        setIsLoading(true);
        registerMutation.mutate({
            username,
            password,
            name: name || undefined,
            email: email || undefined,
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800">
            <Header />

            <main className="flex-1 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl font-bold text-orange-600">
                            {t("register") || "Register"}
                        </CardTitle>
                        <CardDescription>
                            {t("registerDescription") || "Create a new account to start renting"}
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="username">
                                    {t("username") || "Username"} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="username"
                                    type="text"
                                    placeholder={t("enterUsername") || "Enter username"}
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="username"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="name">{t("name") || "Full Name"}</Label>
                                <Input
                                    id="name"
                                    type="text"
                                    placeholder={t("enterName") || "Enter your name"}
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="name"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email">{t("email") || "Email"}</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder={t("enterEmail") || "Enter your email"}
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="email"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password">
                                    {t("password") || "Password"} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder={t("enterPassword") || "Enter password (min 6 characters)"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">
                                    {t("confirmPassword") || "Confirm Password"} <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    placeholder={t("confirmPasswordPlaceholder") || "Confirm your password"}
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    disabled={isLoading}
                                    autoComplete="new-password"
                                />
                            </div>
                        </CardContent>

                        <CardFooter className="flex flex-col gap-4">
                            <Button
                                type="submit"
                                className="w-full bg-orange-600 hover:bg-orange-700"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        {t("registering") || "Creating account..."}
                                    </>
                                ) : (
                                    t("register") || "Register"
                                )}
                            </Button>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                {t("hasAccount") || "Already have an account?"}{" "}
                                <a
                                    href="/login"
                                    className="text-orange-600 hover:underline font-medium"
                                >
                                    {t("login") || "Login"}
                                </a>
                            </p>
                        </CardFooter>
                    </form>
                </Card>
            </main>

            <Footer />
        </div>
    );
}
