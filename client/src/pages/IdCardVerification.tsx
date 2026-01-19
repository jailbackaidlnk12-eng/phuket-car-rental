import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLanguage } from "@/contexts/LanguageContext";
import { getTranslation } from "@/lib/i18n";
import { trpc } from "@/lib/trpc";
import { AlertCircle, CheckCircle, Clock, Upload, ArrowLeft } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Link } from "wouter";


export default function IdCardVerification() {
  const { user, isAuthenticated } = useAuth();
  const { language } = useLanguage();
  const t = (key: string) => getTranslation(key, language);

  const [idNumber, setIdNumber] = useState("");
  const [fullName, setFullName] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch existing ID card verification status
  const { data: idCardData, isLoading, refetch } = trpc.idCard.getStatus.useQuery(
    { userId: user?.id || 0 },
    { enabled: !!user?.id && isAuthenticated }
  );

  // Mutation for uploading ID card
  const uploadIdCardMutation = trpc.idCard.upload.useMutation({
    onSuccess: () => {
      toast.success(t("common.success"));
      setIdNumber("");
      setFullName("");
      setDateOfBirth("");
      setImageFile(null);
      setImagePreview("");
      refetch();
    },
    onError: (error) => {
      toast.error(error.message || t("common.error"));
    },
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error("File size must be less than 5MB");
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!idNumber || !fullName || !dateOfBirth || !imageFile) {
      toast.error(t("common.required"));
      return;
    }

    setIsUploading(true);

    try {
      // Convert file to base64 and upload
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // For now, we'll use the base64 as the image URL
        // In production, this would upload to S3
        const imageUrl = base64;
        
        uploadIdCardMutation.mutate({
          idNumber,
          fullName,
          dateOfBirth,
          imageUrl,
        });
        setIsUploading(false);
      };
      reader.readAsDataURL(imageFile);
    } catch (error) {
      toast.error("Failed to upload ID card");
      setIsUploading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-gray-600 mb-4">{t("nav.login")} required to verify ID card</p>
            <Link href="/">
              <Button>{t("common.back")}</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-orange-50 to-red-100">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "verified":
        return "text-green-600";
      case "rejected":
        return "text-red-600";
      default:
        return "text-yellow-600";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="w-5 h-5" />;
      case "rejected":
        return <AlertCircle className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <Link href="/dashboard">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
        </Link>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-6 h-6" />
              {language === "th" ? "ยืนยันบัตรประชาชน" : "ID Card Verification"}
            </CardTitle>
            <CardDescription className="text-orange-100">
              {language === "th" 
                ? "อัพโหลดบัตรประชาชนเพื่อเช่ามอเตอร์ไซต์" 
                : "Upload your ID card for verification to rent motorcycles"}
            </CardDescription>
          </CardHeader>

          <CardContent className="pt-6">
            {idCardData && (
              <div
                className={`mb-6 p-4 rounded-lg border-2 flex items-center gap-3 ${
                  idCardData.status === "verified"
                    ? "bg-green-50 border-green-200"
                    : idCardData.status === "rejected"
                      ? "bg-red-50 border-red-200"
                      : "bg-yellow-50 border-yellow-200"
                }`}
              >
                <div className={getStatusColor(idCardData.status)}>
                  {getStatusIcon(idCardData.status)}
                </div>
                <div>
                  <p className="font-semibold capitalize">
                    {language === "th" 
                      ? (idCardData.status === "verified" ? "ยืนยันแล้ว" : idCardData.status === "rejected" ? "ถูกปฏิเสธ" : "รอการตรวจสอบ")
                      : idCardData.status}
                  </p>
                  {idCardData.verificationNotes && (
                    <p className="text-sm text-gray-600">{idCardData.verificationNotes}</p>
                  )}
                </div>
              </div>
            )}

            {!idCardData || idCardData.status === "rejected" ? (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="idNumber">
                      {language === "th" ? "เลขบัตรประชาชน" : "ID Number"}
                    </Label>
                    <Input
                      id="idNumber"
                      type="text"
                      placeholder={language === "th" ? "กรอกเลขบัตรประชาชน" : "Enter your ID number"}
                      value={idNumber}
                      onChange={(e) => setIdNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="fullName">
                      {language === "th" ? "ชื่อ-นามสกุล" : "Full Name"}
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder={language === "th" ? "กรอกชื่อ-นามสกุล" : "Enter your full name"}
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="dateOfBirth">
                    {language === "th" ? "วันเกิด" : "Date of Birth"}
                  </Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <Label>{language === "th" ? "อัพโหลดรูปบัตรประชาชน" : "Upload ID Card Image"}</Label>
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {imagePreview ? (
                      <div className="space-y-2">
                        <img
                          src={imagePreview}
                          alt="ID Card Preview"
                          className="max-h-64 mx-auto rounded-lg"
                        />
                        <p className="text-sm text-gray-600">
                          {language === "th" ? "คลิกเพื่อเปลี่ยนรูป" : "Click to change image"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <Upload className="w-8 h-8 mx-auto text-gray-400" />
                        <p className="text-gray-600">
                          {language === "th" 
                            ? "คลิกเพื่ออัพโหลดรูปบัตรประชาชน" 
                            : "Click to upload your ID card image"}
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </div>

                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <p className="text-sm text-gray-700">
                    <strong>{language === "th" ? "หมายเหตุ:" : "Note:"}</strong>{" "}
                    {language === "th" 
                      ? "รูปบัตรประชาชนของคุณจะถูกใส่ลายน้ำ \"Mirin Motorcycle Rental\" เพื่อความปลอดภัย"
                      : "Your ID card image will be watermarked with \"Mirin Motorcycle Rental\" for security purposes."}
                  </p>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-500 hover:bg-orange-600"
                  disabled={isUploading || uploadIdCardMutation.isPending}
                >
                  {isUploading || uploadIdCardMutation.isPending 
                    ? t("common.loading") 
                    : (language === "th" ? "ส่งข้อมูล" : "Submit")}
                </Button>
              </form>
            ) : idCardData.status === "verified" ? (
              <div className="text-center py-8">
                <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === "th" ? "ยืนยันบัตรประชาชนแล้ว" : "ID Card Verified"}
                </h3>
                <p className="text-gray-600 mb-4">
                  {language === "th" 
                    ? "บัตรประชาชนของคุณได้รับการยืนยันแล้ว คุณสามารถเช่ามอเตอร์ไซต์ได้"
                    : "Your ID card has been verified. You can now rent motorcycles."}
                </p>
                <div className="bg-gray-50 rounded-lg p-4 text-left space-y-2">
                  <p className="text-sm">
                    <span className="font-semibold">
                      {language === "th" ? "เลขบัตร:" : "ID Number:"}
                    </span>{" "}
                    {idCardData.idNumber}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">
                      {language === "th" ? "ชื่อ:" : "Full Name:"}
                    </span>{" "}
                    {idCardData.fullName}
                  </p>
                  <p className="text-sm">
                    <span className="font-semibold">
                      {language === "th" ? "วันเกิด:" : "Date of Birth:"}
                    </span>{" "}
                    {idCardData.dateOfBirth}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Clock className="w-16 h-16 text-yellow-600 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {language === "th" ? "รอการตรวจสอบ" : "Pending Verification"}
                </h3>
                <p className="text-gray-600">
                  {language === "th" 
                    ? "บัตรประชาชนของคุณกำลังรอการตรวจสอบ กรุณารอสักครู่"
                    : "Your ID card is being reviewed. Please wait for verification."}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
