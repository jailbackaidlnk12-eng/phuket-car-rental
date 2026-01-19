import { useLanguage } from "@/contexts/LanguageContext";
import { LanguageToggle } from "@/components/LanguageToggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Link } from "wouter";
import { ArrowLeft, CreditCard, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import PromptPayQR from "@/components/PromptPayQR";

export default function Payments() {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const [amount, setAmount] = useState("");
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const { data: payments, isLoading, refetch } = trpc.payments.myPayments.useQuery();
  const topUpMutation = trpc.payments.topUp.useMutation();

  const handleTopUp = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      toast.error(language === "th" ? "กรุณาระบุจำนวนเงิน" : "Please enter amount");
      return;
    }

    try {
      const result = await topUpMutation.mutateAsync({ amount: parseFloat(amount) });
      setPaymentResult(result);
    } catch (error) {
      toast.error(language === "th" ? "เกิดข้อผิดพลาด" : "Error occurred");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard">
            <div className="flex items-center gap-2 cursor-pointer hover:text-primary transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span>{t('common.back') || (language === "th" ? "กลับ" : "Back")}</span>
            </div>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="w-5 h-5 text-primary" />
                  {t('payment.topUp') || (language === "th" ? "เติมเงิน" : "Top Up Balance")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="amount">{t('payment.amount') || (language === "th" ? "จำนวนเงิน (บาท)" : "Amount (THB)")}</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="100.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    min="1"
                    step="1"
                    className="mt-2"
                  />
                </div>

                <Button
                  onClick={handleTopUp}
                  disabled={!isAuthenticated || !amount || topUpMutation.isPending}
                  className="w-full"
                >
                  {topUpMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {language === "th" ? "กำลังดำเนินการ..." : "Processing..."}
                    </>
                  ) : (
                    language === "th" ? "สร้าง QR Code" : "Generate QR Code"
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>{t('payment.history') || (language === "th" ? "ประวัติการทำรายการ" : "Payment History")}</CardTitle>
                <Button variant="ghost" size="icon" onClick={() => refetch()} disabled={isLoading}>
                  <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
                </Button>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  </div>
                ) : payments && payments.length > 0 ? (
                  <div className="space-y-4">
                    {payments.map((payment) => (
                      <div key={payment.id} className="border rounded-lg p-4 hover:bg-muted/50 transition flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div className="flex-1">
                          <p className="font-semibold">
                            {payment.type === 'top_up' ? (language === "th" ? "เติมเงิน" : "Top Up") :
                              payment.type === 'rental_charge' ? (language === "th" ? "ค่าเช่า" : "Rental Charge") :
                                payment.type === 'extension' ? (language === "th" ? "ค่าต่อเวลา" : "Extension") : payment.type}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(payment.createdAt).toLocaleString(language === "th" ? "th-TH" : "en-US")}
                          </p>
                          {payment.promptPayRef && (
                            <p className="text-xs text-muted-foreground font-mono mt-1">Ref: {payment.promptPayRef}</p>
                          )}
                        </div>

                        <div className="text-right">
                          <p className="font-bold text-lg text-primary">฿{payment.amount.toLocaleString()}</p>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${payment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            payment.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                            {payment.status === 'completed' ? (language === "th" ? "สำเร็จ" : "Completed") :
                              payment.status === 'pending' ? (language === "th" ? "รอยืนยัน" : "Pending") :
                                (language === "th" ? "ล้มเหลว" : "Failed")}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    {language === "th" ? "ไม่มีประวัติการทำรายการ" : "No payment history"}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <Dialog open={!!paymentResult} onOpenChange={(open) => !open && setPaymentResult(null)}>
        <DialogContent className="sm:max-w-md">
          {paymentResult && (
            <PromptPayQR
              qrCodeDataUrl={paymentResult.qrCodeDataUrl}
              amount={paymentResult.amount}
              amountFormatted={paymentResult.amountFormatted}
              referenceId={paymentResult.referenceId}
              onClose={() => setPaymentResult(null)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
