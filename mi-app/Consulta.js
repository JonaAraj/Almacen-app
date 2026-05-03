import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import QrScanner from "./components/QrReaderConstruct";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

export default function Consulta({ regresar }) {
    const [searchSerie, setSearchSerie] = useState("");
    const [consulta, setConsulta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    const buscarEquipo = async (serieStr) => {
        const serie = serieStr || searchSerie;
        if (!serie.trim()) {
            Alert.alert("Atención", "Por favor ingresa un número de serie.");
            return;
        }

        setLoading(true);
        setConsulta(null);
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/equipos?numero_serie=eq.${serie}`, {
                method: 'GET',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json'
                }
            });
            const data = await response.json();
            if (data && data.length > 0) {
                setConsulta(data[0]);
            } else {
                Alert.alert("Sin resultados", "No se encontró ningún equipo con ese número de serie.");
            }
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Ocurrió un error de red al buscar el equipo.");
        } finally {
            setLoading(false);
        }
    };

    const handleQrScan = (data) => {
        setSearchSerie(data);
        setIsScanning(false);
        buscarEquipo(data); // Ejecutamos la búsqueda inmediatamente al escanear
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

            {/* Header */}
            <View style={styles.header}>
                <View style={styles.badge}>
                    <Text style={styles.badgeText}>Información de Equipo</Text>
                </View>
                <Text style={styles.title}>CONSULTA</Text>
                <View style={styles.divider} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                {/* Botón Escáner QR */}
                <TouchableOpacity style={{ marginBottom: 20 }} activeOpacity={0.7} onPress={() => setIsScanning(!isScanning)}>
                    <View style={styles.scannerButton}>
                        <Text style={styles.scannerButtonText}>{isScanning ? "Ocultar Cámara" : "📷 Escanear Código QR"}</Text>
                    </View>
                </TouchableOpacity>

                {isScanning && (
                    <View style={styles.scannerContainer}>
                        <QrScanner onScan={handleQrScan} />
                    </View>
                )}

                {/* Campo de búsqueda manual */}
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
                    <TouchableOpacity 
                        style={styles.searchBtn} 
                        onPress={() => buscarEquipo()}
                        disabled={loading}
                    >
                        <Text style={styles.searchBtnText}>Buscar</Text>
                    </TouchableOpacity>
                </View>

                {/* Resultados */}
                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
                ) : consulta ? (
                    <View style={styles.resultCard}>
                        <Text style={styles.resultTitle}>N/S: {consulta.numero_serie}</Text>
                        
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Marca</Text>
                            <Text style={styles.resultValue}>{consulta.marca || "N/A"}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Modelo</Text>
                            <Text style={styles.resultValue}>{consulta.modelo || "N/A"}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Procesador</Text>
                            <Text style={styles.resultValue}>{consulta.procesador || "N/A"}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Almacenamiento</Text>
                            <Text style={styles.resultValue}>{consulta.almacenamiento || "N/A"}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Fecha de Ingreso</Text>
                            <Text style={styles.resultValue}>
                                {consulta.fecha_ingreso ? new Date(consulta.fecha_ingreso).toLocaleDateString() : "N/A"}
                            </Text>
                        </View>
                    </View>
                ) : null}

            </ScrollView>

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
    divider: {
        width: 48,
        height: 3,
        backgroundColor: "#2563EB",
        borderRadius: 2,
        marginTop: 18,
    },
    scannerButton: {
        backgroundColor: "#1E293B",
        padding: 15,
        borderRadius: 12,
        alignItems: "center",
    },
    scannerButtonText: {
        color: "#F1F5F9",
        fontWeight: "600",
    },
    scannerContainer: {
        height: 300,
        marginBottom: 20,
        borderRadius: 12,
        overflow: "hidden",
    },
    searchSection: {
        flexDirection: "row",
        alignItems: "flex-end",
        marginBottom: 20,
        gap: 10,
    },
    inputContainer: {
        flex: 1,
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
    searchBtn: {
        backgroundColor: "#2563EB",
        borderRadius: 12,
        paddingVertical: 14,
        paddingHorizontal: 20,
        justifyContent: "center",
        alignItems: "center",
        height: 52,
    },
    searchBtnText: {
        color: "#FFF",
        fontWeight: "700",
        fontSize: 15,
    },
    resultCard: {
        backgroundColor: "#1E293B",
        borderRadius: 16,
        padding: 20,
        borderWidth: 1,
        borderColor: "#334155",
        marginTop: 10,
    },
    resultTitle: {
        color: "#F1F5F9",
        fontSize: 20,
        fontWeight: "bold",
        marginBottom: 16,
        textAlign: "center",
    },
    resultRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        paddingVertical: 10,
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
