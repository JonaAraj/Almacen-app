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
import * as Print from "expo-print";
import QrScanner from "./components/QrReaderConstruct";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

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

// ─── PDF GENERATOR (usando expo-print) ──────────────────────────────────────
const generarPDF = async ({ numeroSerie, checked, totalChecked }) => {
  const now = new Date();
  const dateStr = now.toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("es-MX", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const pct = Math.round((totalChecked / ITEMS.length) * 100);
  const barColor =
    pct === 100 ? "#16a34a" : pct >= 50 ? "#eab308" : "#dc2626";

  const itemsHTML = ITEMS.map((item) => {
    const isDone = checked[item];
    const statusColor = isDone ? "#16a34a" : "#64748b";
    const statusText = isDone ? "OK" : "FALTA";
    return `
      <tr style="background-color: ${isDone ? "#1e3a5f" : "#1a1f2e"}; border-bottom: 1px solid #334155;">
        <td style="padding: 12px; border-radius: 4px; width: 8%;">
          <div style="width: 20px; height: 20px; border: 2px solid ${isDone ? "#2563eb" : "#475569"}; border-radius: 3px; background-color: ${isDone ? "#2563eb" : "transparent"}; display: flex; align-items: center; justify-content: center;">
            ${isDone ? '<span style="color: white; font-weight: bold;">✓</span>' : ""}
          </div>
        </td>
        <td style="padding: 12px; color: ${isDone ? "#60a5fa" : "#cbd5e1"}; font-weight: ${isDone ? "bold" : "normal"}; flex: 1;">
          ${item}
        </td>
        <td style="padding: 12px; text-align: center; width: 12%;">
          <span style="background-color: ${statusColor}; color: white; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: bold;">
            ${statusText}
          </span>
        </td>
      </tr>
    `;
  }).join("");

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background-color: #0f172a;
          color: #f1f5f9;
          padding: 20px;
        }
        .container {
          max-width: 800px;
          margin: 0 auto;
          background-color: #0f172a;
        }
        .header {
          background: linear-gradient(135deg, #1e3a5f 0%, #2d5a8c 100%);
          padding: 30px;
          border-radius: 8px;
          margin-bottom: 30px;
          border-left: 4px solid #2563eb;
        }
        .badge {
          background-color: #2563eb;
          color: white;
          padding: 6px 16px;
          border-radius: 20px;
          display: inline-block;
          font-size: 12px;
          font-weight: bold;
          margin-bottom: 12px;
        }
        .title {
          font-size: 32px;
          font-weight: bold;
          color: #f1f5f9;
          margin-bottom: 4px;
        }
        .title-accent {
          font-size: 32px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 12px;
        }
        .divider {
          width: 60px;
          height: 3px;
          background-color: #2563eb;
          border-radius: 2px;
        }
        .meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 16px;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 12px;
          color: #94a3b8;
        }
        .serial-block {
          background-color: #1e293b;
          padding: 20px;
          border-radius: 8px;
          margin-bottom: 20px;
          border: 1px solid #334155;
        }
        .serial-label {
          font-size: 12px;
          font-weight: bold;
          color: #94a3b8;
          margin-bottom: 8px;
          text-transform: uppercase;
        }
        .serial-value {
          font-size: 24px;
          font-weight: bold;
          color: #f1f5f9;
        }
        .progress-section {
          margin-bottom: 30px;
        }
        .progress-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 12px;
        }
        .progress-label {
          font-size: 12px;
          font-weight: bold;
          color: #94a3b8;
          text-transform: uppercase;
        }
        .progress-badge {
          background-color: ${barColor};
          color: white;
          padding: 6px 12px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: bold;
        }
        .progress-bar {
          background-color: #1e293b;
          height: 10px;
          border-radius: 5px;
          overflow: hidden;
          border: 1px solid #334155;
        }
        .progress-fill {
          background-color: #2563eb;
          height: 100%;
          width: ${pct}%;
          border-radius: 5px;
        }
        .checklist {
          margin-bottom: 30px;
        }
        .checklist-title {
          font-size: 14px;
          font-weight: bold;
          color: #f1f5f9;
          margin-bottom: 16px;
          text-transform: uppercase;
        }
        table {
          width: 100%;
          border-collapse: collapse;
        }
        tr {
          display: flex;
          align-items: center;
        }
        td {
          display: inline-flex;
          align-items: center;
        }
        .footer {
          padding: 16px;
          border-top: 1px solid #334155;
          font-size: 11px;
          color: #94a3b8;
          text-align: center;
          margin-top: 40px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="badge">DIAGNÓSTICO DE EQUIPO</div>
          <div style="display: flex; align-items: baseline;">
            <span class="title">REVISIÓN</span>
            <span class="title-accent" style="margin-left: 8px;">INICIAL</span>
          </div>
          <div class="divider"></div>
          <div class="meta">
            <div>
              <strong>${dateStr}</strong><br>${timeStr}
            </div>
            <div style="text-align: right;">
              N/S: <strong>${numeroSerie}</strong>
            </div>
          </div>
        </div>

        <div class="serial-block">
          <div class="serial-label">Número de Serie</div>
          <div class="serial-value">${numeroSerie}</div>
        </div>

        <div class="progress-section">
          <div class="progress-header">
            <span class="progress-label">Completados: ${totalChecked} / ${ITEMS.length}</span>
            <span class="progress-badge">${pct}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-fill"></div>
          </div>
        </div>

        <div class="checklist">
          <div class="checklist-title">Lista de Verificación</div>
          <table>
            ${itemsHTML}
          </table>
        </div>

        <div class="footer">
          <p>Reporte generado automáticamente · Sistema de Diagnóstico de Equipos</p>
          <p>${dateStr} a las ${timeStr}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  try {
    await Print.printAsync({
      html,
      fileName: `revision_${numeroSerie}_${Date.now()}`,
    });
  } catch (err) {
    throw new Error("Error al generar PDF: " + err.message);
  }
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
  const [isScanning, setIsScanning] = useState(false);

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
    if (!SUPABASE_URL) {
      throw new Error("La configuración de la base de datos (SUPABASE_URL) no está definida.");
    }

    // Apuntamos a la tabla 'diagnosticos' y estructuramos el body según squema.sql
    const response = await fetch(`${SUPABASE_URL}/rest/v1/diagnosticos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=representation",
      },
      body: JSON.stringify({
        // Asumimos que la tabla 'diagnosticos' también tiene 'numero_serie' para poder enlazar.
        numero_serie: numeroSerie,
        // El checklist se anida en el campo JSONB 'detalles_revision'
        detalles_revision: {
          ...checked,
          total_completados: totalChecked,
        },
        // Incluimos los otros campos del schema
        estatus_final: totalChecked === ITEMS.length ? "Completado" : "Incompleto",
        observaciones_extra: null,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al guardar");

    setSavedId(data[0].id_diagnostico); // El ID viene de la columna 'id_diagnostico'
    Alert.alert("✅ Guardado", `Diagnóstico guardado.\nN/S: ${numeroSerie}`);
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

  // ── Leer QR y buscar equipo ──────────────────────────────────────────────
  const handleQrScan = async (data) => {
    setNumeroSerie(data);
    setIsScanning(false); // Ocultamos la cámara después de leer
    Alert.alert("QR Escaneado", `Número de serie: ${data}`);

    // Buscar la información del producto en la base de datos
    try {
      if (!SUPABASE_URL) {
        Alert.alert("Error", "Variables de base de datos no definidas.");
        return;
      }

      const response = await fetch(`${SUPABASE_URL}/rest/v1/equipos?numero_serie=eq.${encodeURIComponent(data)}`, {
        method: "GET",
        headers: {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
        },
      });
      const equipo = await response.json();
      if (equipo && equipo.length > 0) {
        Alert.alert("Equipo encontrado", `Marca: ${equipo[0].marca}\nModelo: ${equipo[0].modelo}`);
      } else {
        Alert.alert("Atención", "Este equipo no se encuentra registrado.");
      }
    } catch (err) {
      console.error("Error al buscar el equipo:", err);
    }
  };

  // ── Generar PDF local con expo-print ────────────────────────────────────
  const handleDescargarPDF = async () => {
    if (!numeroSerie.trim()) {
      Alert.alert(
        "Campo requerido",
        "Ingresa el número de serie antes de generar el PDF."
      );
      return;
    }

    try {
      await generarPDF({ numeroSerie, checked, totalChecked });
      Alert.alert("✅ PDF Generado", "El PDF se ha generado correctamente.");
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

          <TouchableOpacity style={{ marginBottom: 20 }} activeOpacity={0.7} onPress={() => setIsScanning(!isScanning)}>
            <View style={{ backgroundColor: "#1E293B", padding: 15, borderRadius: 12, alignItems: "center" }}>
              <Text style={{ color: "#F1F5F9", fontWeight: "600" }}>{isScanning ? "Ocultar Cámara" : "📷 Escanear Código QR"}</Text>
            </View>
          </TouchableOpacity>

          {isScanning && (
            <View style={{ height: 300, marginBottom: 20, borderRadius: 12, overflow: "hidden" }}>
              <QrScanner onScan={handleQrScan} />
            </View>
          )}

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