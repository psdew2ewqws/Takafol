import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { renderToBuffer } from "@react-pdf/renderer";
import { CertificatePDF } from "@/lib/certificate-pdf";
import React from "react";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;

    const certificate = await prisma.certificate.findUnique({
      where: { id },
    });

    if (!certificate) {
      return NextResponse.json({ error: "Certificate not found" }, { status: 404 });
    }

    // Fetch connection blockchain TXs if this cert is from a connection
    let postTx: string | null = null;
    let connectionTx: string | null = null;
    let completionTx: string | null = null;
    let ratingTx: string | null = null;

    if (certificate.connectionId) {
      const connection = await prisma.connection.findUnique({
        where: { id: certificate.connectionId },
        select: {
          blockchainTx: true,
          completionTx: true,
          ratingTx: true,
          post: { select: { blockchainTx: true } },
        },
      });
      if (connection) {
        postTx = connection.post.blockchainTx;
        connectionTx = connection.blockchainTx;
        completionTx = connection.completionTx;
        ratingTx = connection.ratingTx;
      }
    }

    const baseUrl = process.env.NEXTAUTH_URL || "https://takafol.jo";
    const verifyUrl = `${baseUrl}/certificates/verify?id=${certificate.id}`;

    const pdfBuffer = await renderToBuffer(
      <CertificatePDF
        data={{
          certificateId: certificate.id,
          recipientName: certificate.recipientName,
          title: certificate.title,
          description: certificate.description,
          category: certificate.category,
          issuedAt: new Date(certificate.issuedAt).toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          }),
          certHash: certificate.certHash,
          blockchainTx: certificate.blockchainTx,
          postTx,
          connectionTx,
          completionTx,
          ratingTx,
          verifyUrl,
        }}
      />,
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `inline; filename="takafol-certificate-${certificate.id}.pdf"`,
      },
    });
  } catch (error) {
    console.error("PDF generation failed:", error);
    return NextResponse.json(
      { error: "Failed to generate certificate PDF" },
      { status: 500 },
    );
  }
}
