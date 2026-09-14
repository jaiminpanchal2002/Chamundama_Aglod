import "server-only";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import QRCode from "qrcode";
import { amountToWords, formatINR } from "@/lib/utils";
import type { EightyGSetting } from "@/lib/settings";

export interface ReceiptData {
  receiptNumber: string;
  donationDate: Date;
  approvalDate: Date;
  donorName: string;
  amount: number;
  purpose: string;
  paymentReference: string;
  paymentMode: string;
  trustLegalName: string;
  templeName: string;
  trustContact: string;
  verifyUrl: string;
  eightyG: EightyGSetting;
}

const MAROON = rgb(0.48, 0.08, 0.13);
const GOLD = rgb(0.79, 0.6, 0.23);
const DARK = rgb(0.15, 0.15, 0.18);
const GREY = rgb(0.4, 0.4, 0.44);

/**
 * Generate a professional PDF donation receipt (spec §18). IMPORTANT: no tax /
 * 80G wording is printed unless the Trust has explicitly enabled it with a
 * valid registration.
 */
export async function generateReceiptPdf(data: ReceiptData): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  const page = pdf.addPage([595.28, 841.89]); // A4
  const { width, height } = page.getSize();
  const font = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  let y = height - margin;

  const text = (
    s: string,
    x: number,
    yy: number,
    size = 11,
    f = font,
    color = DARK,
  ) => page.drawText(s, { x, y: yy, size, font: f, color });

  // Header band
  page.drawRectangle({
    x: 0,
    y: height - 96,
    width,
    height: 96,
    color: MAROON,
  });
  text(data.templeName, margin, height - 46, 20, bold, rgb(0.96, 0.92, 0.82));
  text(data.trustLegalName, margin, height - 68, 11, font, rgb(0.9, 0.82, 0.66));
  text("DONATION RECEIPT", width - margin - 150, height - 46, 13, bold, GOLD);

  y = height - 130;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 1.5,
    color: GOLD,
  });

  y -= 30;
  text("Receipt No.", margin, y, 10, bold, GREY);
  text(data.receiptNumber, margin + 90, y, 11, bold, MAROON);
  text(
    "Date: " + data.approvalDate.toLocaleDateString("en-IN"),
    width - margin - 160,
    y,
    10,
    font,
    GREY,
  );

  y -= 40;
  const row = (label: string, value: string) => {
    text(label, margin, y, 10, bold, GREY);
    text(value, margin + 150, y, 11, font, DARK);
    y -= 26;
  };

  row("Received from", data.donorName);
  row("Amount", formatINR(data.amount));
  row("Amount in words", amountToWords(data.amount));
  row("Purpose", data.purpose);
  row("Payment mode", data.paymentMode);
  row("Payment reference", data.paymentReference);
  row("Donation date", data.donationDate.toLocaleDateString("en-IN"));

  // 80G block (only when enabled)
  if (data.eightyG.enabled && data.eightyG.registrationNo) {
    y -= 8;
    page.drawRectangle({
      x: margin,
      y: y - 44,
      width: width - margin * 2,
      height: 54,
      color: rgb(0.97, 0.95, 0.88),
      borderColor: GOLD,
      borderWidth: 0.75,
    });
    text(
      `80G Reg. No: ${data.eightyG.registrationNo}`,
      margin + 10,
      y - 8,
      9,
      bold,
      DARK,
    );
    if (data.eightyG.legalWording)
      text(
        data.eightyG.legalWording.slice(0, 110),
        margin + 10,
        y - 24,
        8,
        font,
        GREY,
      );
    y -= 64;
  }

  // QR for public verification
  const qrDataUrl = await QRCode.toDataURL(data.verifyUrl, { margin: 0 });
  const qrImage = await pdf.embedPng(qrDataUrl);
  const qrSize = 96;
  page.drawImage(qrImage, {
    x: width - margin - qrSize,
    y: 120,
    width: qrSize,
    height: qrSize,
  });
  text("Scan to verify", width - margin - qrSize, 108, 8, font, GREY);

  // Signature / stamp
  text("Authorized Signatory", margin, 150, 10, font, GREY);
  page.drawLine({
    start: { x: margin, y: 168 },
    end: { x: margin + 150, y: 168 },
    thickness: 0.75,
    color: GREY,
  });

  // Footer
  page.drawLine({
    start: { x: margin, y: 92 },
    end: { x: width - margin, y: 92 },
    thickness: 0.75,
    color: GOLD,
  });
  text(data.trustContact, margin, 76, 8, font, GREY);
  text(
    "This is a computer-generated receipt issued after payment verification.",
    margin,
    62,
    8,
    font,
    GREY,
  );

  return pdf.save();
}
