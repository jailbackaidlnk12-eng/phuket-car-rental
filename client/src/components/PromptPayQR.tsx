import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import { QrCode, Copy, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "sonner";

interface PromptPayQRProps {
    qrCodeDataUrl: string;
    amount: number;
    amountFormatted: string;
    referenceId: string;
    onClose?: () => void;
}

export default function PromptPayQR({
    qrCodeDataUrl,
    amount,
    amountFormatted,
    referenceId,
    onClose,
}: PromptPayQRProps) {
    const { t } = useLanguage();
    const [copied, setCopied] = useState(false);

    const copyReferenceId = () => {
        navigator.clipboard.writeText(referenceId);
        setCopied(true);
        toast.success(t("copiedToClipboard") || "Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader className="text-center">
                <div className="flex items-center justify-center gap-2 mb-2">
                    <QrCode className="h-6 w-6 text-blue-600" />
                    <CardTitle className="text-xl text-blue-600">PromptPay</CardTitle>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    {t("scanToPayDescription") || "Scan QR code to pay"}
                </p>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* QR Code */}
                <div className="flex justify-center">
                    <div className="p-4 bg-white rounded-lg shadow-md">
                        <img
                            src={qrCodeDataUrl}
                            alt="PromptPay QR Code"
                            className="w-64 h-64"
                        />
                    </div>
                </div>

                {/* Amount */}
                <div className="text-center">
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                        {t("amount") || "Amount"}
                    </p>
                    <p className="text-3xl font-bold text-orange-600">
                        {amountFormatted}
                    </p>
                </div>

                {/* Reference ID */}
                <div className="bg-gray-100 dark:bg-gray-800 rounded-lg p-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                        {t("referenceId") || "Reference ID"}
                    </p>
                    <div className="flex items-center justify-between">
                        <code className="text-sm font-mono">{referenceId}</code>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={copyReferenceId}
                            className="h-8 w-8 p-0"
                        >
                            {copied ? (
                                <Check className="h-4 w-4 text-green-600" />
                            ) : (
                                <Copy className="h-4 w-4" />
                            )}
                        </Button>
                    </div>
                </div>

                {/* Instructions */}
                <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                    <p>1. {t("openBankingApp") || "Open your banking app"}</p>
                    <p>2. {t("selectPromptPay") || "Select PromptPay / Scan QR"}</p>
                    <p>3. {t("scanQRCode") || "Scan this QR code"}</p>
                    <p>4. {t("confirmPayment") || "Confirm the payment"}</p>
                </div>

                {/* Status */}
                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-200 text-center">
                        ⏳ {t("waitingForConfirmation") || "Waiting for admin confirmation"}
                    </p>
                </div>

                {onClose && (
                    <Button
                        variant="outline"
                        className="w-full"
                        onClick={onClose}
                    >
                        {t("close") || "Close"}
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}
