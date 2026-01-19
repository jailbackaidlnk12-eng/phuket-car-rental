import generatePayload from "promptpay-qr";
import QRCode from "qrcode";
import { nanoid } from "nanoid";
import { ENV } from "../_core/env";

export interface PromptPayResult {
    qrCodeDataUrl: string;
    amount: number;
    promptPayId: string;
    referenceId: string;
}

/**
 * Generate a PromptPay QR code for payment
 * @param amount - Amount in THB
 * @returns QR code as data URL and reference info
 */
export async function generatePromptPayQR(amount: number): Promise<PromptPayResult> {
    const promptPayId = ENV.promptPayId;
    const referenceId = `PP${nanoid(10).toUpperCase()}`;

    // Generate PromptPay payload
    // The promptpay-qr library generates EMVCo QR code payload
    const payload = generatePayload(promptPayId, { amount });

    // Convert payload to QR code data URL
    const qrCodeDataUrl = await QRCode.toDataURL(payload, {
        errorCorrectionLevel: "M",
        margin: 2,
        width: 300,
        color: {
            dark: "#000000",
            light: "#ffffff",
        },
    });

    return {
        qrCodeDataUrl,
        amount,
        promptPayId,
        referenceId,
    };
}

/**
 * Format Thai Baht amount
 */
export function formatThbAmount(amount: number): string {
    return new Intl.NumberFormat("th-TH", {
        style: "currency",
        currency: "THB",
    }).format(amount);
}

/**
 * Add a random satang (0.01-0.99) to an integer amount for unique matching
 * @param amount - Base integer amount
 * @returns Amount with random decimal
 */
export function addRandomSatang(amount: number): number {
    // If amount already has decimals, return as is
    if (amount % 1 !== 0) return amount;

    // Generate random satang between 0.01 and 0.99
    const satang = Math.floor(Math.random() * 99) + 1;
    return amount + (satang / 100);
}
