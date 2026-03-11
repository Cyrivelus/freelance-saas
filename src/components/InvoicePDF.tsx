import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

// ─────────────────────────────────────────────────────────────
// RÈGLE @react-pdf/renderer :
//   ❌  border: 1          → propriété CSS web, non supportée
//   ✅  borderWidth: 1     → syntaxe correcte react-pdf
// ─────────────────────────────────────────────────────────────
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 30,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2563eb",
    marginBottom: 5,
  },
  label: {
    fontSize: 9,
    color: "#6b7280",
    marginBottom: 4,
    textTransform: "uppercase",
    fontWeight: "bold",
  },
  value: { fontSize: 11, fontWeight: "bold" },

  // Table
  table: {
    width: "auto",
    marginTop: 20,
    borderStyle: "solid", // ✅ valide avec borderWidth
    borderWidth: 1, // ✅ remplace "border: 1"
    borderColor: "#e5e7eb",
  },
  tableRow: {
    flexDirection: "row",
    backgroundColor: "#f9fafb",
    padding: 8,
  },
  tableHeader: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#374151",
  },

  // IBAN
  ibanBox: {
    marginTop: 20,
    padding: 12,
    borderWidth: 1, // ✅ remplace "border: 1"
    borderStyle: "solid",
    borderColor: "#e5e7eb",
    borderRadius: 6,
    backgroundColor: "#f8fafc",
  },

  // Legal
  legalText: {
    fontSize: 8,
    color: "#9ca3af",
    marginTop: 4,
    lineHeight: 1.4,
  },

  // Footer
  footer: {
    position: "absolute",
    bottom: 40,
    left: 40,
    right: 40,
    borderTopWidth: 1, // ✅ déjà correct
    borderTopColor: "#e5e7eb",
    paddingTop: 15,
  },
});

export const InvoicePDF = ({ invoice }: { invoice: any }) => {
  const dateEmission = new Date();
  const dateEcheance = new Date();
  dateEcheance.setDate(dateEmission.getDate() + 30);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* En-tête */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>FACTURE</Text>
            <Text style={{ fontSize: 10, color: "#374151" }}>
              Réf: #INV-{invoice.id.substring(0, 8).toUpperCase()}
            </Text>
          </View>
          <View style={{ textAlign: "right" }}>
            <Text style={{ fontWeight: "bold", fontSize: 13 }}>
              Jean Dupont
            </Text>
            <Text style={{ fontSize: 10 }}>SIRET : 123 456 789 00012</Text>
            <Text style={{ fontSize: 10 }}>
              123 Avenue du Freelance, 75000 Paris
            </Text>
            <Text style={{ fontSize: 10 }}>contact@jeandupont.fr</Text>
          </View>
        </View>

        {/* Client + Dates */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            marginBottom: 40,
          }}
        >
          <View style={{ width: "45%" }}>
            <Text style={styles.label}>Facturé à :</Text>
            <Text style={styles.value}>
              {invoice.clients?.name || "Client non renseigné"}
            </Text>
            <Text style={{ fontSize: 10, marginTop: 2 }}>
              {invoice.clients?.email || ""}
            </Text>
          </View>
          <View style={{ width: "45%", textAlign: "right" }}>
            <View style={{ marginBottom: 10 }}>
              <Text style={styles.label}>Date d'émission :</Text>
              <Text style={styles.value}>
                {dateEmission.toLocaleDateString("fr-FR")}
              </Text>
            </View>
            <View>
              <Text style={styles.label}>Date d'échéance :</Text>
              <Text style={[styles.value, { color: "#dc2626" }]}>
                {dateEcheance.toLocaleDateString("fr-FR")}
              </Text>
            </View>
          </View>
        </View>

        {/* Tableau prestations */}
        <View style={styles.table}>
          <View style={styles.tableRow}>
            <Text style={[styles.tableHeader, { width: "70%" }]}>
              Désignation
            </Text>
            <Text
              style={[styles.tableHeader, { width: "30%", textAlign: "right" }]}
            >
              Total HT
            </Text>
          </View>
          <View
            style={{
              flexDirection: "row",
              padding: 12,
              borderTopWidth: 1,
              borderTopColor: "#e5e7eb", // ✅ séparé de borderColor global
            }}
          >
            <Text style={{ width: "70%", fontSize: 11 }}>
              Prestation de services (Forfait)
            </Text>
            <Text
              style={{ width: "30%", textAlign: "right", fontWeight: "bold" }}
            >
              {Number(invoice.amount).toLocaleString()} €
            </Text>
          </View>
        </View>

        {/* Total + IBAN */}
        <View
          style={{
            flexDirection: "row",
            marginTop: 30,
            justifyContent: "space-between",
          }}
        >
          <View style={{ width: "55%" }}>
            <View style={styles.ibanBox}>
              <Text style={[styles.label, { marginBottom: 5 }]}>
                Informations de paiement (IBAN)
              </Text>
              <Text style={{ fontSize: 9 }}>Titulaire : JEAN DUPONT</Text>
              <Text style={{ fontSize: 9, marginTop: 2 }}>
                IBAN : FR76 3000 6000 0001 2345 6789 012
              </Text>
              <Text style={{ fontSize: 9 }}>BIC : ABCDEF123</Text>
            </View>
          </View>

          <View
            style={{
              width: "35%",
              backgroundColor: "#2563eb",
              padding: 15,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 9,
                marginBottom: 5,
                fontWeight: "bold",
              }}
            >
              TOTAL À PAYER
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 18,
                fontWeight: "bold",
                textAlign: "right",
              }}
            >
              {Number(invoice.amount).toLocaleString()} €
            </Text>
          </View>
        </View>

        {/* Footer légal */}
        <View style={styles.footer}>
          <Text
            style={{
              textAlign: "center",
              fontWeight: "bold",
              marginBottom: 5,
              fontSize: 10,
            }}
          >
            Merci de votre confiance !
          </Text>
          <Text style={styles.legalText}>
            Auto-entrepreneur : TVA non applicable, art. 293 B du CGI. En cas de
            retard de paiement, une indemnité forfaitaire de 40€ pour frais de
            recouvrement sera appliquée. Pénalités de retard : 10% annuel.
          </Text>
        </View>
      </Page>
    </Document>
  );
};
