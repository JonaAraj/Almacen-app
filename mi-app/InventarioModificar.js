import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  StyleSheet,
  StatusBar,
  Alert,
} from "react-native";
import { config } from "./config";

const API_URL = `${config.API_BASE_URL}/api/equipos`;

const defaultForm = {
  numeroSerie: "",
  tipoEquipo: "",
  marca: "",
  modelo: "",
  procesador: "",
  almacenamiento: "",
  dueno: "",
  fechaIngreso: "",
  fechaRegistro: "",
};

const apiHeaders = {
  "Content-Type": "application/json",
};

export default function InventarioModificar({ regresar, serieInicial }) {
  const [searchSerie, setSearchSerie] = useState(serieInicial || "");
  const [form, setForm] = useState(defaultForm);
  const [equipoExiste, setEquipoExiste] = useState(false);
  const [originalSerie, setOriginalSerie] = useState(serieInicial || "");
  const [loading, setLoading] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (serieInicial) {
      buscarEquipo(serieInicial);
    }
  }, [serieInicial]);

  const buildPayload = () => {
    return {
      numero_serie: form.numeroSerie.trim() || null,
      tipo_equipo: form.tipoEquipo.trim() || null,
      marca: form.marca.trim() || null,
      modelo: form.modelo.trim() || null,
      procesador: form.procesador.trim() || null,
      almacenamiento: form.almacenamiento.trim() || null,
      dueno: form.dueno.trim() || null,
      fecha_ingreso: form.fechaIngreso.trim() || null,
    };
  };

  const normalizeEquipo = (equipo) => ({
    numeroSerie: equipo.numero_serie || "",
    tipoEquipo: equipo.tipo_equipo || "",
    marca: equipo.marca || "",
    modelo: equipo.modelo || "",
    procesador: equipo.procesador || "",
    almacenamiento: equipo.almacenamiento || "",
    dueno: equipo.dueno || "",
    fechaIngreso: equipo.fecha_ingreso ? equipo.fecha_ingreso.split("T")[0] : "",
    fechaRegistro: equipo.fecha_registro ? new Date(equipo.fecha_registro).toLocaleDateString() : "",
  });

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buscarEquipo = async (serie) => {
    const valor = typeof serie === "string" ? serie.trim() : searchSerie.trim();
    if (!valor) {
      Alert.alert("Atención", "Ingresa un número de serie para buscar.");
      return;
    }

    if (!SUPABASE_URL) {
      Alert.alert("Error", "SUPABASE_URL no está configurada.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const encodedSerie = encodeURIComponent(valor);
      const url = `${API_URL}/${encodedSerie}`;
      const response = await fetch(url, { method: "GET", headers: apiHeaders });
      const body = await response.json();

      if (!response.ok) {
        throw new Error(body.error || "Error al consultar equipo.");
      }

      const equipoResult = body?.data?.equipo || null;
      if (equipoResult) {
        setEquipoExiste(true);
        setOriginalSerie(equipoResult.numero_serie);
        setForm(normalizeEquipo(equipoResult));
        setMessage("Equipo encontrado. Puedes actualizar o eliminar los datos.");
      } else {
        setEquipoExiste(false);
        setOriginalSerie(valor);
        setForm({ ...defaultForm, numeroSerie: valor });
        setMessage("No existe un equipo para ese número de serie. Completa el formulario para crear uno.");
      }
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "Error al buscar el equipo.");
    } finally {
      setLoading(false);
    }
  };

  const handleFinalizar = async () => {
    const payload = buildPayload();
    if (!payload.numero_serie) {
      Alert.alert("Atención", "El número de serie es obligatorio.");
      return;
    }

    setGuardando(true);

    try {
      if (!SUPABASE_URL) {
        throw new Error("SUPABASE_URL no está configurada.");
      }

      const body = JSON.stringify(payload);
      let url = API_URL;
      let method = "POST";

      if (equipoExiste) {
        url = `${API_URL}/${encodeURIComponent(originalSerie)}`;
        method = "PATCH";
      }

      const response = await fetch(url, {
        method,
        headers: apiHeaders,
        body,
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || data.message || "Error al guardar equipo.");
      }

      const saved = Array.isArray(data) ? data[0] : data;
      setEquipoExiste(true);
      setOriginalSerie(saved.numero_serie || payload.numero_serie);
      setForm(normalizeEquipo(saved));
      setMessage(equipoExiste ? "Equipo actualizado exitosamente." : "Equipo creado exitosamente.");
      Alert.alert("Éxito", equipoExiste ? "El equipo se actualizó correctamente." : "El equipo se creó correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", error.message || "No se pudo guardar el equipo.");
    } finally {
      setGuardando(false);
    }
  };

  const handleEliminar = () => {
    if (!equipoExiste) {
      Alert.alert("Atención", "No hay un equipo cargado para eliminar.");
      return;
    }

    Alert.alert(
      "Eliminar equipo",
      "¿Estás seguro de que deseas eliminar este equipo? Esta acción no se puede deshacer.",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            setLoading(true);
            try {
              const url = `${API_URL}/${encodeURIComponent(originalSerie)}`;
              const response = await fetch(url, { method: "DELETE", headers: apiHeaders });
              const data = await response.json();
              if (!response.ok) {
                throw new Error(data.error || data.message || "Error al eliminar equipo.");
              }
              setEquipoExiste(false);
              setForm(defaultForm);
              setSearchSerie("");
              setOriginalSerie("");
              setMessage("Equipo eliminado. Puedes buscar otro número de serie.");
              Alert.alert("Eliminado", "El equipo fue eliminado correctamente.");
            } catch (error) {
              console.error(error);
              Alert.alert("Error", error.message || "No se pudo eliminar el equipo.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <View style={styles.header}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Modificar Inventario</Text>
        </View>
        <Text style={styles.title}>EQUIPO</Text>
        <View style={styles.divider} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <View style={styles.searchSection}>
          <View style={styles.inputContainer}> 
            <Text style={styles.inputLabel}>NÚMERO DE SERIE</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. SN-2024-00123"
              placeholderTextColor="#475569"
              value={searchSerie}
              onChangeText={setSearchSerie}
              autoCapitalize="characters"
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => buscarEquipo(searchSerie)} disabled={loading}>
            <Text style={styles.searchBtnText}>Buscar</Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 20 }} />
        ) : (
          <View style={styles.messageBox}>
            <Text style={styles.messageText}>{message || "Busca un número de serie para editar o crear equipo."}</Text>
          </View>
        )}

        <View style={styles.formCard}>
          <Text style={styles.sectionTitle}>DETALLES DEL EQUIPO</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Tipo de equipo</Text>
            <TextInput
              style={styles.input}
              value={form.tipoEquipo}
              onChangeText={(value) => handleChange("tipoEquipo", value)}
              placeholder="Laptop, Desktop, etc."
              placeholderTextColor="#475569"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Marca</Text>
            <TextInput
              style={styles.input}
              value={form.marca}
              onChangeText={(value) => handleChange("marca", value)}
              placeholder="Ej. Dell"
              placeholderTextColor="#475569"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Modelo</Text>
            <TextInput
              style={styles.input}
              value={form.modelo}
              onChangeText={(value) => handleChange("modelo", value)}
              placeholder="Ej. Latitude 5420"
              placeholderTextColor="#475569"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Procesador</Text>
            <TextInput
              style={styles.input}
              value={form.procesador}
              onChangeText={(value) => handleChange("procesador", value)}
              placeholder="Ej. Intel i7"
              placeholderTextColor="#475569"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Almacenamiento</Text>
            <TextInput
              style={styles.input}
              value={form.almacenamiento}
              onChangeText={(value) => handleChange("almacenamiento", value)}
              placeholder="Ej. 512 GB SSD"
              placeholderTextColor="#475569"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Dueño / Asignado a</Text>
            <TextInput
              style={styles.input}
              value={form.dueno}
              onChangeText={(value) => handleChange("dueno", value)}
              placeholder="Ej. Juan Pérez"
              placeholderTextColor="#475569"
              autoCapitalize="words"
            />
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Fecha de ingreso</Text>
            <TextInput
              style={styles.input}
              value={form.fechaIngreso}
              onChangeText={(value) => handleChange("fechaIngreso", value)}
              placeholder="YYYY-MM-DD"
              placeholderTextColor="#475569"
            />
          </View>

          {form.fechaRegistro ? (
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Fecha de registro</Text>
              <View style={[styles.input, styles.readOnly]}>
                <Text style={styles.readOnlyText}>{form.fechaRegistro}</Text>
              </View>
            </View>
          ) : null}

          <TouchableOpacity
            style={[styles.finalBtn, guardando && { opacity: 0.7 }]}
            onPress={handleFinalizar}
            disabled={guardando}
          >
            <Text style={styles.finalBtnText}>{guardando ? "Guardando..." : "Finalizar"}</Text>
          </TouchableOpacity>

          {equipoExiste ? (
            <TouchableOpacity style={styles.deleteBtn} onPress={handleEliminar} activeOpacity={0.8}>
              <Text style={styles.deleteBtnText}>Eliminar equipo</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.backButton} onPress={regresar} activeOpacity={0.7}>
        <Text style={styles.backText}>‹ Volver al inventario</Text>
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
  divider: {
    width: 48,
    height: 3,
    backgroundColor: "#2563EB",
    borderRadius: 2,
    marginTop: 18,
  },
  searchSection: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 10,
    marginBottom: 20,
  },
  inputContainer: {
    flex: 1,
    marginBottom: 14,
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
  readOnly: {
    backgroundColor: "#111827",
    borderColor: "#1E293B",
  },
  readOnlyText: {
    color: "#CBD5E1",
    fontSize: 15,
    fontWeight: "500",
  },
  searchBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 18,
    justifyContent: "center",
    alignItems: "center",
    height: 52,
  },
  searchBtnText: {
    color: "#FFF",
    fontWeight: "700",
    fontSize: 15,
  },
  messageBox: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#334155",
    marginBottom: 20,
  },
  messageText: {
    color: "#94A3B8",
    fontSize: 13,
    lineHeight: 20,
  },
  formCard: {
    backgroundColor: "#1E293B",
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: "#334155",
  },
  sectionTitle: {
    color: "#60A5FA",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1.5,
    marginBottom: 18,
  },
  finalBtn: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 10,
  },
  finalBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
  },
  deleteBtn: {
    backgroundColor: "#991B1B",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 12,
  },
  deleteBtnText: {
    color: "#FEE2E2",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 1.2,
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
