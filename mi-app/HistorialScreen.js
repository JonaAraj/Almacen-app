import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, StatusBar } from 'react-native';
import { config } from "./config";

const API_BASE_URL = config.API_BASE_URL;


export default function Historial({ numeroSerie, regresar, irAConsulta }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarDatos = async () => {
      try {
        setLoading(true);

        const urlPath = numeroSerie && numeroSerie !== "GENERAL" ? numeroSerie : "GENERAL";
        const response = await fetch(`${API_BASE_URL}/api/revisiones/historial/feed/${urlPath}`, {
          method: 'GET',
          headers: {
            "Content-Type": "application/json",
          }
        });

        if (!response.ok) {
          const errText = await response.text();
          console.error("Respuesta fallida del backend:", errText);
          throw new Error("Error en la respuesta del servidor");
        }

        const dataResponse = await response.json();
        
        if (dataResponse.ok && Array.isArray(dataResponse.data)) {
          const feed = dataResponse.data;
          setHistorial(feed);
        } else {
          throw new Error("Respuesta inválida del servidor");
        }
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