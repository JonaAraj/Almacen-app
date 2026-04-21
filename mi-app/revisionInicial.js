import React, { useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
  ScrollView,
  TextInput,
  Alert,
} from "react-native";
import { jsPDF } from "jspdf";

const API_URL = "http://192.168.1.13:3000";

const ITEMS = [
  "Estado físico correcto",
  "Enciende",
  "Muestra imagen",
  "Arranca sistema operativo",
  "Carga batería",
  "Disco detectado",
  "RAM detectada",
  "Ventilador funciona",
  "WiFi funciona",
];

// ─── PDF GENERATOR ──────────────────────────────────────────────────────────
const generarPDF = ({ numeroSerie, checked, totalChecked }) => {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;

  // ── Background ──────────────────────────────────────────────────────────
  doc.setFillColor(15, 23, 42); // #0F172A
  doc.rect(0, 0, pageW, pageH, "F");

  // ── Header band ─────────────────────────────────────────────────────────
  doc.setFillColor(30, 58, 95); // #1E3A5F
  doc.roundedRect(margin, 14, contentW, 40, 4, 4, "F");

  // Badge pill
  doc.setFillColor(37, 99, 235); // #2563EB
  doc.roundedRect(margin + 6, 18, 58, 7, 3, 3, "F");
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text("DIAGNÓSTICO DE EQUIPO", margin + 35, 23, { align: "center" });

  // Title
  doc.setFontSize(26);
  doc.setTextColor(241, 245, 249); // #F1F5F9
  doc.setFont("helvetica", "bold");
  doc.text("REVISIÓN", margin + 10, 40);

  doc.setTextColor(37, 99, 235); // #2563EB
  doc.text("INICIAL", margin + 10 + doc.getTextWidth("REVISIÓN ") - 2, 40);

  // Divider line
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(1);
  doc.line(margin + 10, 43, margin + 10 + 20, 43);

  // Date stamp (top-right of header)
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(148, 163, 184); // #94A3B8
  doc.text(dateStr, pageW - margin - 6, 23, { align: "right" });
  doc.text(
    now.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" }),
    pageW - margin - 6,
    30,
    { align: "right" }
  );

  // ── Serial number block ──────────────────────────────────────────────────
  let y = 64;
  doc.setFillColor(30, 41, 59); // #1E293B
  doc.roundedRect(margin, y, contentW, 18, 3, 3, "F");
  doc.setDrawColor(51, 65, 85); // #334155
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, y, contentW, 18, 3, 3, "S");

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184);
  doc.text("NÚMERO DE SERIE", margin + 8, y + 6);

  doc.setFontSize(13);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(241, 245, 249);
  doc.text(numeroSerie || "—", margin + 8, y + 14);

  // ── Progress summary ────────────────────────────────────────────────────
  y += 26;

  const pct = Math.round((totalChecked / ITEMS.length) * 100);

  // Label
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(148, 163, 184);
  doc.text(`COMPLETADOS: ${totalChecked} / ${ITEMS.length}`, margin, y + 4);

  // Percentage badge
  const badgeColor =
    pct === 100 ? [22, 163, 74] : pct >= 50 ? [234, 179, 8] : [220, 38, 38];
  doc.setFillColor(...badgeColor);
  doc.roundedRect(pageW - margin - 22, y - 1, 22, 8, 2, 2, "F");
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(255, 255, 255);
  doc.text(`${pct}%`, pageW - margin - 11, y + 5, { align: "center" });

  // Bar background
  y += 10;
  doc.setFillColor(30, 41, 59);
  doc.roundedRect(margin, y, contentW, 4, 2, 2, "F");
  // Bar fill
  doc.setFillColor(37, 99, 235);
  if (pct > 0) {
    doc.roundedRect(margin, y, (contentW * pct) / 100, 4, 2, 2, "F");
  }

  // ── Checklist items ──────────────────────────────────────────────────────
  y += 12;

  ITEMS.forEach((item, i) => {
    const isDone = checked[item];

    // Row background
    doc.setFillColor(isDone ? 30 : 22, isDone ? 58 : 41, isDone ? 95 : 59);
    doc.roundedRect(margin, y, contentW, 13, 2.5, 2.5, "F");

    // Border
    doc.setDrawColor(isDone ? 37 : 51, isDone ? 99 : 65, isDone ? 235 : 85);
    doc.setLineWidth(0.3);
    doc.roundedRect(margin, y, contentW, 13, 2.5, 2.5, "S");

    // Checkbox
    const cbX = margin + 6;
    const cbY = y + 3;
    if (isDone) {
      doc.setFillColor(37, 99, 235);
      doc.roundedRect(cbX, cbY, 7, 7, 1.5, 1.5, "F");
      // Checkmark — drawn with lines
      doc.setDrawColor(255, 255, 255);
      doc.setLineWidth(0.9);
      doc.line(cbX + 1.5, cbY + 3.5, cbX + 3, cbY + 5.5);
      doc.line(cbX + 3, cbY + 5.5, cbX + 5.5, cbY + 1.5);
    } else {
      doc.setFillColor(30, 41, 59);
      doc.roundedRect(cbX, cbY, 7, 7, 1.5, 1.5, "F");
      doc.setDrawColor(71, 85, 105); // #475569
      doc.setLineWidth(0.4);
      doc.roundedRect(cbX, cbY, 7, 7, 1.5, 1.5, "S");
    }

    // Item label
    doc.setFontSize(10);
    doc.setFont("helvetica", isDone ? "bolditalic" : "normal");
    doc.setTextColor(isDone ? 96 : 203, isDone ? 165 : 213, isDone ? 250 : 225);
    doc.text(item, cbX + 11, y + 8.5);

    // Status tag
    const tagW = isDone ? 16 : 18;
    const tagColor = isDone ? [22, 163, 74] : [100, 116, 139];
    doc.setFillColor(...tagColor);
    doc.roundedRect(pageW - margin - tagW - 4, y + 3, tagW, 7, 1.5, 1.5, "F");
    doc.setFontSize(6.5);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text(
      isDone ? "OK" : "FALTA",
      pageW - margin - tagW / 2 - 4,
      y + 8,
      { align: "center" }
    );

    y += 16;

    // New page if needed (leave room for footer)
    if (y > pageH - 30 && i < ITEMS.length - 1) {
      doc.addPage();
      doc.setFillColor(15, 23, 42);
      doc.rect(0, 0, pageW, pageH, "F");
      y = 20;
    }
  });

  // ── Footer ───────────────────────────────────────────────────────────────
  const footerY = pageH - 14;
  doc.setDrawColor(37, 99, 235);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 4, pageW - margin, footerY - 4);

  doc.setFontSize(7.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("Reporte generado automáticamente · Sistema de Diagnóstico", margin, footerY);
  doc.text(
    `N/S: ${numeroSerie}`,
    pageW - margin,
    footerY,
    { align: "right" }
  );

  // ── Save ─────────────────────────────────────────────────────────────────
  const fileName = `revision_${numeroSerie || "sin-serie"}_${Date.now()}.pdf`;
  doc.save(fileName);
};
// ─────────────────────────────────────────────────────────────────────────────

export default function RevisionInicial({ regresar }) {
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeList = useRef(new Animated.Value(0)).current;

  const [numeroSerie, setNumeroSerie] = useState("");
  const [checked, setChecked] = useState(
    Object.fromEntries(ITEMS.map((item) => [item, false]))
  );
  const [savedId, setSavedId] = useState(null);
  const [guardando, setGuardando] = useState(false);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeTitle, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeList, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const toggle = (item) => {
    setChecked((prev) => ({ ...prev, [item]: !prev[item] }));
  };

  const totalChecked = Object.values(checked).filter(Boolean).length;

  // ── Guardar en servidor ──────────────────────────────────────────────────
  const handleGuardar = async () => {
    if (!numeroSerie.trim()) {
      Alert.alert(
        "Campo requerido",
        "Por favor ingresa el número de serie del equipo."
      );
      return;
    }

    const itemsPendientes = ITEMS.filter((item) => !checked[item]);

    const guardar = async () => {
  setGuardando(true);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/revisiones`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        numero_serie: numeroSerie,
        estado_fisico_correcto: checked["Estado físico correcto"],
        enciende: checked["Enciende"],
        muestra_imagen: checked["Muestra imagen"],
        arranca_sistema_operativo: checked["Arranca sistema operativo"],
        carga_bateria: checked["Carga batería"],
        disco_detectado: checked["Disco detectado"],
        ram_detectada: checked["RAM detectada"],
        ventilador_funciona: checked["Ventilador funciona"],
        wifi_funciona: checked["WiFi funciona"],
        total_completados: totalChecked,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al guardar");

    setSavedId(data[0].id);
    Alert.alert("✅ Guardado", `Revisión guardada.\nN/S: ${numeroSerie}`);
  } catch (err) {
    Alert.alert("❌ Error", err.message);
  } finally {
    setGuardando(false);
  }
};
    if (itemsPendientes.length > 0) {
      Alert.alert(
        "Revisión incompleta",
        `Aún tienes ${itemsPendientes.length} ítem(s) sin marcar. ¿Deseas guardar de todas formas?`,
        [
          { text: "Cancelar", style: "cancel" },
          { text: "Guardar", onPress: guardar },
        ]
      );
    } else {
      guardar();
    }
  };

  // ── Generar PDF local con jsPDF ──────────────────────────────────────────
  const handleDescargarPDF = () => {
    if (!numeroSerie.trim()) {
      Alert.alert(
        "Campo requerido",
        "Ingresa el número de serie antes de generar el PDF."
      );
      return;
    }

    try {
      generarPDF({ numeroSerie, checked, totalChecked });
    } catch (err) {
      Alert.alert("❌ Error al generar PDF", err.message);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeTitle }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Diagnóstico de Equipo</Text>
        </View>
        <Text style={styles.title}>REVISIÓN</Text>
        <Text style={styles.titleAccent}>INICIAL</Text>
        <View style={styles.divider} />
      </Animated.View>

      <Animated.View style={{ opacity: fadeList, flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>

          {/* Campo número de serie */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>NÚMERO DE SERIE</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. SN-2024-00123"
              placeholderTextColor="#475569"
              value={numeroSerie}
              onChangeText={setNumeroSerie}
              autoCapitalize="characters"
            />
          </View>

          {/* Progress */}
          <View style={styles.progressContainer}>
            <Text style={styles.progressText}>
              {totalChecked} / {ITEMS.length} completados
            </Text>
            <View style={styles.progressBar}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${(totalChecked / ITEMS.length) * 100}%` },
                ]}
              />
            </View>
          </View>

          {/* Checklist */}
          {ITEMS.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.checkItem, checked[item] && styles.checkItemDone]}
              onPress={() => toggle(item)}
              activeOpacity={0.7}
            >
              <View style={[styles.checkbox, checked[item] && styles.checkboxDone]}>
                {checked[item] && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={[styles.checkLabel, checked[item] && styles.checkLabelDone]}>
                {item}
              </Text>
            </TouchableOpacity>
          ))}

          {/* Botón Guardar en servidor */}
          <TouchableOpacity
            style={[styles.saveButton, guardando && { opacity: 0.6 }]}
            onPress={handleGuardar}
            activeOpacity={0.75}
            disabled={guardando}
          >
            <Text style={styles.saveButtonText}>
              {guardando ? "Guardando…" : "Guardar Revisión"}
            </Text>
          </TouchableOpacity>

          {/* Botón Descargar PDF (local, siempre disponible si hay N/S) */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              {
                backgroundColor: numeroSerie.trim() ? "#16A34A" : "#334155",
                marginTop: 10,
              },
            ]}
            onPress={handleDescargarPDF}
            activeOpacity={0.75}
          >
            <Text style={styles.saveButtonText}>⬇ Descargar PDF</Text>
          </TouchableOpacity>

          <View style={{ height: 10 }} />
        </ScrollView>
      </Animated.View>

      {/* Botón regresar */}
      <TouchableOpacity style={styles.backButton} onPress={regresar} activeOpacity={0.7}>
        <Text style={styles.backText}>‹ Volver al menú</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0F172A",
    paddingHorizontal: 24,
    paddingTop: 70,
    paddingBottom: 30,
  },
  header: {
    alignItems: "center",
    marginBottom: 24,
  },
  badge: {
    backgroundColor: "#1E3A5F",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 5,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#2563EB44",
  },
  badgeText: {
    color: "#60A5FA",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    textTransform: "uppercase",
  },
  title: {
    fontSize: 42,
    fontWeight: "900",
    color: "#F1F5F9",
    letterSpacing: 6,
    lineHeight: 46,
  },
  titleAccent: {
    fontSize: 42,
    fontWeight: "900",
    color: "#2563EB",
    letterSpacing: 6,
    lineHeight: 46,
  },
  divider: {
    width: 48,
    height: 3,
    backgroundColor: "#2563EB",
    borderRadius: 2,
    marginTop: 18,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#94A3B8",
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#1E293B",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#334155",
    paddingVertical: 14,
    paddingHorizontal: 18,
    color: "#F1F5F9",
    fontSize: 15,
    fontWeight: "500",
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressText: {
    color: "#94A3B8",
    fontSize: 12,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
    marginBottom: 8,
    textAlign: "right",
  },
  progressBar: {
    height: 4,
    backgroundColor: "#1E293B",
    borderRadius: 2,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#2563EB",
    borderRadius: 2,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1E293B",
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 18,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#334155",
  },
  checkItemDone: {
    borderColor: "#2563EB55",
    backgroundColor: "#1E3A5F",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#475569",
    marginRight: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxDone: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  checkmark: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  checkLabel: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "500",
  },
  checkLabelDone: {
    color: "#60A5FA",
    textDecorationLine: "line-through",
  },
  saveButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  backButton: {
    alignItems: "center",
    paddingTop: 16,
  },
  backText: {
    color: "#60A5FA",
    fontSize: 15,
    fontWeight: "500",
    letterSpacing: 0.5,
  },
});