import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;


export default function Historial({ numeroSerie, regresar, irAConsulta }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        if (!SUPABASE_URL) {
          throw new Error("SUPABASE_URL es undefined. Revisa que tu archivo .env use el prefijo EXPO_PUBLIC_");
        }
        
        let urlEquipos = `${SUPABASE_URL}/rest/v1/equipos?select=*`;
        let urlDiagnosticos = `${SUPABASE_URL}/rest/v1/diagnosticos?select=*`;

        if (numeroSerie && numeroSerie !== "GENERAL") {
          const encodedSerie = encodeURIComponent(numeroSerie);
          urlEquipos += `&numero_serie=eq.${encodedSerie}`;
          urlDiagnosticos += `&numero_serie=eq.${encodedSerie}`;
        }

        urlEquipos += `&order=fecha_registro.desc&limit=50`;
        urlDiagnosticos += `&order=created_at.desc&limit=50`;

        const headers = {
          "apikey": SUPABASE_KEY,
          "Authorization": `Bearer ${SUPABASE_KEY}`,
          "Content-Type": "application/json",
        };

        const [resEquipos, resDiagnosticos] = await Promise.all([
          fetch(urlEquipos, { headers }),
          fetch(urlDiagnosticos, { headers })
        ]);

        if (!resEquipos.ok || !resDiagnosticos.ok) {
          const errText = !resEquipos.ok ? await resEquipos.text() : await resDiagnosticos.text();
          console.error("Respuesta fallida de Supabase:", errText);
          throw new Error("Error en la respuesta de Supabase");
        }

        const dataEquipos = await resEquipos.json();
        const dataDiagnosticos = await resDiagnosticos.json();

        const feed = [
          ...(Array.isArray(dataEquipos) ? dataEquipos.map(e => ({ ...e, type: 'equipo', date: e.fecha_registro || e.created_at || new Date().toISOString() })) : []),
          ...(Array.isArray(dataDiagnosticos) ? dataDiagnosticos.map(d => ({ ...d, type: 'diagnostico', date: d.created_at || new Date().toISOString() })) : [])
        ];

        feed.sort((a, b) => new Date(b.date) - new Date(a.date));
        setHistorial(feed);
      } catch (err) {
        console.error("Error al cargar historial:", err);
      } finally {
        setLoading(false);
      }
    };
    cargarDatos();
  }, [numeroSerie]);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Registro de Revisiones</Text>
        </View>
        <Text style={styles.title}>HISTORIAL</Text>
        <View style={styles.divider} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" style={styles.center} />
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
          <Text style={styles.subtitle}>N/S: {numeroSerie}</Text>

          {historial.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No hay registros de diagnósticos para este equipo.</Text>
            </View>
          ) : (
            historial.map((item, index) => (
            <TouchableOpacity 
              key={`${item.type}-${item.id_diagnostico || item.numero_serie}-${index}`} 
              style={styles.card}
              activeOpacity={0.7}
              onPress={() => irAConsulta && irAConsulta(item.numero_serie)}
            >
                
                {/* Fecha en la parte superior de la tarjeta */}
                <View style={styles.cardHeader}>
                  <Text style={styles.badgeTypeText}>
                  {item.type === 'equipo' ? "🆕 Equipo Agregado" : "🛠 Diagnóstico Realizado"}
                </Text>
                  <Text style={styles.fechaText}>
                    📅 {new Date(item.date).toLocaleDateString()} - {new Date(item.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </Text>
                </View>

                <View style={styles.resultRow}>
                  <Text style={styles.resultLabel}>N/S</Text>
                <Text style={styles.resultValue}>{item.numero_serie}</Text>
                    </View>
                
                {item.type === 'equipo' ? (
                <View style={[styles.resultRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <Text style={styles.resultLabel}>Modelo</Text>
                  <Text style={styles.resultValue}>{item.marca} {item.modelo}</Text>
                </View>
              ) : (
                <View style={[styles.resultRow, { borderBottomWidth: 0, paddingBottom: 0 }]}>
                  <Text style={styles.resultLabel}>Estatus Final</Text>
                  <Text style={styles.resultValue}>{item.estatus_final || "Sin estatus"}</Text>
                </View>
              )}
            </TouchableOpacity>
          ))
            )
          }
        </ScrollView>
      )}

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
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
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
  divider: {
    width: 48,
    height: 3,
    backgroundColor: "#2563EB",
    borderRadius: 2,
    marginTop: 18,
  },
  subtitle: {
    color: "#F1F5F9",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  emptyState: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#334155",
  },
  emptyText: {
    color: "#94A3B8",
    fontSize: 15,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 16,
  },
  cardHeader: {
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  badgeTypeText: {
    color: "#F1F5F9",
    fontSize: 13,
    fontWeight: "600",
  },
  fechaText: {
    color: "#60A5FA",
    fontSize: 13,
    fontWeight: "700",
  },
  resultRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#334155",
  },
  resultLabel: {
    color: "#94A3B8",
    fontSize: 14,
    fontWeight: "600",
  },
  resultValue: {
    color: "#F1F5F9",
    fontSize: 14,
    fontWeight: "500",
    flex: 1,
    textAlign: "right",
    marginLeft: 10,
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