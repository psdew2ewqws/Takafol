import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

// Register Arabic-compatible font
Font.register({
  family: "Amiri",
  fonts: [
    { src: "https://fonts.gstatic.com/s/amiri/v27/J7aRnpd8CGxBHpUrtLMA7w.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/amiri/v27/J7acnpd8CGxBHp2VkZY4xJ9CGyAa.ttf", fontWeight: 700 },
  ],
});

Font.register({
  family: "NotoSans",
  fonts: [
    { src: "https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyD9A-9a6Vc.ttf", fontWeight: 400 },
    { src: "https://fonts.gstatic.com/s/notosans/v36/o-0mIpQlx3QUlC5A4PNB6Ryti20_6n1iPHjcz6L1SoM-jCpoiyAjBe9a6Vc.ttf", fontWeight: 700 },
  ],
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#fefdf8",
    padding: 0,
    fontFamily: "NotoSans",
  },
  // Outer border
  borderOuter: {
    margin: 20,
    border: "3pt solid #065f46",
    padding: 8,
    flex: 1,
  },
  // Inner border
  borderInner: {
    border: "1pt solid #d4a853",
    padding: 30,
    flex: 1,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
  // Header ornament
  ornamentLine: {
    width: 120,
    height: 2,
    backgroundColor: "#d4a853",
    marginBottom: 8,
  },
  // Platform name
  platformName: {
    fontSize: 14,
    color: "#065f46",
    letterSpacing: 4,
    textTransform: "uppercase",
    marginBottom: 4,
    fontWeight: 700,
  },
  platformNameAr: {
    fontSize: 18,
    color: "#065f46",
    fontFamily: "Amiri",
    fontWeight: 700,
    marginBottom: 16,
  },
  // Title
  title: {
    fontSize: 28,
    color: "#065f46",
    fontWeight: 700,
    marginBottom: 4,
    textAlign: "center",
  },
  titleAr: {
    fontSize: 32,
    color: "#065f46",
    fontFamily: "Amiri",
    fontWeight: 700,
    marginBottom: 20,
    textAlign: "center",
  },
  // Subtitle
  subtitle: {
    fontSize: 11,
    color: "#6b7280",
    marginBottom: 24,
    textAlign: "center",
  },
  // "Presented to"
  presentedTo: {
    fontSize: 11,
    color: "#9ca3af",
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  // Recipient name
  recipientName: {
    fontSize: 26,
    color: "#1f2937",
    fontWeight: 700,
    marginBottom: 6,
    textAlign: "center",
  },
  // Underline
  nameUnderline: {
    width: 250,
    height: 1,
    backgroundColor: "#d4a853",
    marginBottom: 24,
  },
  // Description
  description: {
    fontSize: 11,
    color: "#4b5563",
    textAlign: "center",
    lineHeight: 1.6,
    maxWidth: 400,
    marginBottom: 24,
  },
  // Category badge
  categoryBadge: {
    backgroundColor: "#ecfdf5",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 6,
    marginBottom: 24,
  },
  categoryText: {
    fontSize: 10,
    color: "#065f46",
    fontWeight: 700,
  },
  // Info row
  infoRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 40,
    marginBottom: 20,
  },
  infoBlock: {
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 8,
    color: "#9ca3af",
    letterSpacing: 1.5,
    textTransform: "uppercase",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 11,
    color: "#1f2937",
    fontWeight: 700,
  },
  // Blockchain proof section
  blockchainSection: {
    backgroundColor: "#f0fdf4",
    borderRadius: 8,
    padding: 12,
    marginTop: 8,
    width: "100%",
    maxWidth: 440,
  },
  blockchainTitle: {
    fontSize: 8,
    color: "#065f46",
    fontWeight: 700,
    letterSpacing: 2,
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "center",
  },
  txRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  txLabel: {
    fontSize: 7,
    color: "#6b7280",
  },
  txHash: {
    fontSize: 7,
    color: "#065f46",
    fontWeight: 700,
  },
  // Footer
  footer: {
    marginTop: 16,
    alignItems: "center",
  },
  certId: {
    fontSize: 8,
    color: "#9ca3af",
    letterSpacing: 1,
  },
  verifyUrl: {
    fontSize: 7,
    color: "#065f46",
    marginTop: 4,
  },
});

export interface CertificateData {
  certificateId: string;
  recipientName: string;
  title: string;
  description: string;
  category: string;
  issuedAt: string;
  certHash: string;
  blockchainTx?: string | null;
  postTx?: string | null;
  connectionTx?: string | null;
  completionTx?: string | null;
  ratingTx?: string | null;
  verifyUrl: string;
}

function truncateHash(hash: string, chars = 8): string {
  if (hash.length <= chars * 2 + 2) return hash;
  return `${hash.slice(0, chars + 2)}...${hash.slice(-chars)}`;
}

export function CertificatePDF({ data }: { data: CertificateData }) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={styles.page}>
        <View style={styles.borderOuter}>
          <View style={styles.borderInner}>
            {/* Header ornament */}
            <View style={styles.ornamentLine} />
            <Text style={styles.platformName}>TAKAFOL</Text>
            <Text style={styles.platformNameAr}>تكافل</Text>

            {/* Title */}
            <Text style={styles.titleAr}>شهادة تطوع</Text>
            <Text style={styles.title}>Volunteer Certificate</Text>
            <Text style={styles.subtitle}>
              Verified Completion Certificate
            </Text>

            {/* Presented to */}
            <Text style={styles.presentedTo}>Presented To</Text>
            <Text style={styles.recipientName}>{data.recipientName}</Text>
            <View style={styles.nameUnderline} />

            {/* Description */}
            <Text style={styles.description}>{data.description}</Text>

            {/* Category */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{data.category}</Text>
            </View>

            {/* Info row */}
            <View style={styles.infoRow}>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Date Issued</Text>
                <Text style={styles.infoValue}>{data.issuedAt}</Text>
              </View>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>Certificate ID</Text>
                <Text style={styles.infoValue}>{data.certificateId}</Text>
              </View>
              <View style={styles.infoBlock}>
                <Text style={styles.infoLabel}>SHA-256 Hash</Text>
                <Text style={styles.infoValue}>
                  {truncateHash(data.certHash, 6)}
                </Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.certId}>
                CERT-{data.certificateId}
              </Text>
              <Text style={styles.verifyUrl}>
                Verify at: {data.verifyUrl}
              </Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
}
