import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  // Styles existants
  page: {
    padding: 40,
    fontSize: 10,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
    borderBottomWidth: 2,
    borderBottomColor: "#3b82f6",
    paddingBottom: 10,
  },
  title: { fontSize: 24, fontWeight: "bold", color: "#1e3a8a" },
  clientBox: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
  },

  // Page de garde
  summaryPage: {
    padding: 60,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
  },
  summaryTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 20,
  },
  summaryBox: {
    width: "100%",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e2e8f0",
    marginTop: 20,
  },
  summaryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    fontSize: 12,
  },

  // Filigrane "PAYÉ"
  watermarkContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: -1,
  },
  watermarkText: {
    fontSize: 120,
    color: "#fee2e2",
    fontWeight: "bold",
    transform: "rotate(-45deg)",
    opacity: 0.5,
    letterSpacing: 10,
  },

  // Table & Totaux
  table: {
    marginTop: 30,
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  tableRow: { flexDirection: "row" },
  tableHeader: { backgroundColor: "#3b82f6", color: "#ffffff" },
  tableCol: {
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#e2e8f0",
    padding: 8,
  },
  totalSection: { marginTop: 20, alignItems: "flex-end" },
  totalBox: {
    padding: 10,
    backgroundColor: "#1e3a8a",
    color: "#ffffff",
    borderRadius: 4,
    width: 160,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 8,
  },
});

interface BulkInvoicePDFProps {
  invoices: any[];
  title?: string;
}

export const BulkInvoicePDF = ({ invoices, title }: BulkInvoicePDFProps) => {
  const totalAmount = invoices.reduce(
    (acc, inv) => acc + Number(inv.amount),
    0,
  );
  const dateStr = new Date().toLocaleDateString("fr-FR");

  return (
    <Document>
      {/* PAGE DE GARDE : Récapitulatif Comptable */}
      <Page size="A4" style={styles.summaryPage}>
        <Text style={styles.summaryTitle}>RAPPORT DE FACTURATION</Text>
        <Text style={{ fontSize: 14, color: "#64748b" }}>
          {title || "Export Mensuel"}
        </Text>

        <View style={styles.summaryBox}>
          <View style={styles.summaryItem}>
            <Text>Date de génération :</Text>
            <Text style={{ fontWeight: "bold" }}>{dateStr}</Text>
          </View>
          <View style={styles.summaryItem}>
            <Text>Nombre total de factures :</Text>
            <Text style={{ fontWeight: "bold" }}>{invoices.length}</Text>
          </View>
          <View
            style={[
              styles.summaryItem,
              {
                marginTop: 10,
                paddingTop: 10,
                borderTopWidth: 1,
                borderTopColor: "#f1f5f9",
              },
            ]}
          >
            <Text style={{ fontSize: 16 }}>MONTANT TOTAL CUMULÉ :</Text>
            <Text
              style={{ fontSize: 16, fontWeight: "bold", color: "#1e3a8a" }}
            >
              {totalAmount.toLocaleString()} €
            </Text>
          </View>
        </View>

        <Text
          style={{
            position: "absolute",
            bottom: 40,
            color: "#cbd5e1",
            fontSize: 10,
          }}
        >
          Document généré par votre Dashboard Compta AI
        </Text>
      </Page>

      {/* GÉNÉRATION DES PAGES DE FACTURES */}
      {invoices.map((inv) => (
        <Page key={inv.id} size="A4" style={styles.page}>
          {/* FILIGRANE SI PAYÉE */}
          {inv.status === "Payée" && (
            <View style={styles.watermarkContainer} fixed>
              <Text style={styles.watermarkText}>PAYÉ</Text>
            </View>
          )}

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>FACTURE</Text>
              <Text>Réf : {inv.id.substring(0, 8).toUpperCase()}</Text>
              <Text
                style={{
                  color: inv.status === "Payée" ? "#16a34a" : "#d97706",
                  fontWeight: "bold",
                  marginTop: 4,
                }}
              >
                Statut : {inv.status.toUpperCase()}
              </Text>
            </View>
            <View style={{ textAlign: "right" }}>
              <Text style={{ fontWeight: "bold", fontSize: 12 }}>
                VOTRE ENTREPRISE
              </Text>
              <Text>
                Date d'émission :{" "}
                {new Date(inv.created_at).toLocaleDateString("fr-FR")}
              </Text>
            </View>
          </View>

          {/* Infos Client */}
          <View style={styles.clientBox}>
            <Text style={{ color: "#64748b", marginBottom: 5 }}>
              DESTINATAIRE :
            </Text>
            <Text style={{ fontSize: 14, fontWeight: "bold" }}>
              {inv.clients?.name}
            </Text>
            <Text>{inv.clients?.email || "Pas d'email renseigné"}</Text>
          </View>

          {/* Tableau des services */}
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <View style={[styles.tableCol, { width: "70%" }]}>
                <Text>Description</Text>
              </View>
              <View style={[styles.tableCol, { width: "30%" }]}>
                <Text>Montant HT</Text>
              </View>
            </View>
            <View style={styles.tableRow}>
              <View style={[styles.tableCol, { width: "70%" }]}>
                <Text>
                  Prestation de services (Réf: {inv.id.substring(0, 5)})
                </Text>
              </View>
              <View style={[styles.tableCol, { width: "30%" }]}>
                <Text>{Number(inv.amount).toLocaleString()} €</Text>
              </View>
            </View>
          </View>

          {/* Bloc Total */}
          <View style={styles.totalSection}>
            <View style={styles.totalBox}>
              <Text style={{ fontSize: 8, marginBottom: 2 }}>
                TOTAL NET À PAYER (TTC)
              </Text>
              <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                {Number(inv.amount).toLocaleString()} €
              </Text>
            </View>
          </View>

          {/* Pied de page légal */}
          <View style={styles.footer}>
            <Text>
              Auto-entrepreneur - TVA non applicable, art. 293 B du CGI
            </Text>
            <Text style={{ marginTop: 2 }}>Page générée le {dateStr}</Text>
          </View>
        </Page>
      ))}
    </Document>
  );
};
