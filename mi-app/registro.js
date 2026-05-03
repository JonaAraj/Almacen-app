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

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

// Campos alineados con la tabla 'equipos' de squema.sql
const CAMPOS = [
  { key: "numeroSerie", label: "Número de Serie", placeholder: "Ej. SN-2024-00123" },
  { key: "tipoEquipo", label: "Tipo de Equipo", placeholder: "Laptop o Escritorio" },
  { key: "marca", label: "Marca", placeholder: "Ej. Dell" },
  { key: "modelo", label: "Modelo", placeholder: "Ej. Latitude 5420" },
];

export default function Registro({ regresar }) {
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeForm = useRef(new Animated.Value(0)).current;

  const [guardando, setGuardando] = useState(false);
  const [form, setForm] = useState(
    Object.fromEntries(CAMPOS.map((c) => [c.key, ""]))
  );

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeTitle, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeForm, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleGuardar = async () => {
    const vacios = CAMPOS.filter((c) => !form[c.key].trim());
    if (vacios.length > 0) {
      Alert.alert(
        "Campos incompletos",
        `Por favor completa: ${vacios.map((c) => c.label).join(", ")}.`
      );
      return;
    }

      setGuardando(true);
  try {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/equipos`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=representation", // para recibir el registro creado
      },
      body: JSON.stringify({
        // Cuerpo de la petición alineado con squema.sql
        numero_serie: form.numeroSerie,
        tipo_equipo: form.tipoEquipo,
        modelo: form.modelo,
        marca: form.marca,
      }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Error al guardar");

    Alert.alert("✅ Equipo Registrado", `N/S: ${form.numeroSerie}`);
    setForm(Object.fromEntries(CAMPOS.map((c) => [c.key, ""])));
  } catch (error) {
    Alert.alert("❌ Error", error.message);
  } finally {
    setGuardando(false);
  }
};

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      {/* Header */}
      <Animated.View style={[styles.header, { opacity: fadeTitle }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Alta de Equipo</Text>
        </View>
        <Text style={styles.title}>REGISTRO</Text>
        <View style={styles.divider} />
      </Animated.View>

      {/* Formulario */}
      <Animated.View style={{ opacity: fadeForm, flex: 1 }}>
        <ScrollView showsVerticalScrollIndicator={false}>
          {CAMPOS.map((campo, index) => (
            <View key={index} style={styles.inputContainer}>
              <Text style={styles.inputLabel}>{campo.label.toUpperCase()}</Text>
              <TextInput
                style={styles.input}
                placeholder={campo.placeholder}
                placeholderTextColor="#475569"
                value={form[campo.key]}
                onChangeText={(val) => handleChange(campo.key, val)}
                autoCapitalize="words"
              />
            </View>
          ))}

          {/* Botón Guardar */}
          <TouchableOpacity
            style={[styles.saveButton, guardando && { opacity: 0.6 }]}
            onPress={handleGuardar}
            activeOpacity={0.75}
            disabled={guardando}
          >
            <Text style={styles.saveButtonText}>{guardando ? "GUARDANDO..." : "GUARDAR"}</Text>
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
    marginBottom: 16,
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
  saveButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 18,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "700",
    letterSpacing: 2,
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