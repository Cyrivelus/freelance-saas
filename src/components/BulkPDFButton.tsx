"use client";

// src/components/BulkPDFButton.tsx
//
// Ce wrapper est la solution à l'erreur Turbopack :
// "su is not a function" sur PDFDownloadLink.
//
// La cause : next/dynamic() ne peut pas wrapper correctement
// les exports nommés de @react-pdf/renderer avec Turbopack.
// La solution : importer via useEffect + useState, purement côté client.

import { useEffect, useState } from "react";
import { Loader2, Printer } from "lucide-react";

interface BulkPDFButtonProps {
  invoices: any[];
  periodFilter: string;
}

export function BulkPDFButton({ invoices, periodFilter }: BulkPDFButtonProps) {
  const [PDFLink, setPDFLink] = useState<any>(null);
  const [BulkPDF, setBulkPDF] = useState<any>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    Promise.all([
      import("@react-pdf/renderer"),
      import("@/components/BulkInvoicePDF"),
    ])
      .then(([pdfMod, bulkMod]) => {
        setPDFLink(() => pdfMod.PDFDownloadLink);
        setBulkPDF(() => bulkMod.BulkInvoicePDF ?? (bulkMod as any).default);
        setReady(true);
      })
      .catch(console.error);
  }, []);

  if (!ready || !PDFLink || !BulkPDF) {
    return (
      <button
        disabled
        className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-gray-100 text-gray-400 rounded-xl font-black text-xs cursor-not-allowed"
      >
        <Loader2 size={16} className="animate-spin" />
        PDF...
      </button>
    );
  }

  return (
    <PDFLink
      document={
        <BulkPDF invoices={invoices} title={`Export - ${periodFilter}`} />
      }
      fileName={`export-factures-${Date.now()}.pdf`}
      className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-3 bg-blue-50 text-blue-700 rounded-xl font-black text-xs hover:bg-blue-100 transition-colors"
    >
      {({ loading: pdfLoading }: { loading: boolean }) => (
        <>
          {pdfLoading ? (
            <Loader2 size={16} className="animate-spin" />
          ) : (
            <Printer size={16} />
          )}
          <span>PDF GROUPÉ ({invoices.length})</span>
        </>
      )}
    </PDFLink>
  );
}
