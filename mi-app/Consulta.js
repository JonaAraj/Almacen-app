import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity, TextInput, StatusBar, Alert } from 'react-native';
import QrScanner from "./components/QrReaderConstruct";
import { config } from "./config";

const API_BASE_URL = config.API_BASE_URL;

export default function Consulta({ regresar, serieInicial }) {
    const [searchSerie, setSearchSerie] = useState("");
    const [consulta, setConsulta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [isScanning, setIsScanning] = useState(false);

    useEffect(() => {
        if (serieInicial) {
            setSearchSerie(serieInicial);
            buscarEquipo(serieInicial);
        }
    }, [serieInicial]);


    const buscarEquipo = async (serieStr) => {
        // Garantizamos que tome el parámetro estricto (QR) o en su defecto el estado,
        // evaluándolo en el instante exacto en que se ejecuta la función.
        const valorBusqueda = typeof serieStr === 'string' ? serieStr : searchSerie;
        const serieLimpiaLocal = valorBusqueda ? valorBusqueda.trim() : "";

        if (!serieLimpiaLocal) {
            Alert.alert("Atención", "Por favor ingresa un número de serie.");
            return;
        }

        setLoading(true);
        setConsulta(null);
        try {
            console.log(`🔍 Iniciando búsqueda para N/S: ${serieLimpiaLocal}`);

            console.log("📡 Realizando petición GET al backend: /api/equipos/:numero_serie...");
            const response = await fetch(`${API_BASE_URL}/api/equipos/${encodeURIComponent(serieLimpiaLocal)}`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                }
            });

            console.log("📥 Status:", response.status);

            if (!response.ok) {
                const text = await response.text();
                console.error("Error API:", text);
                throw new Error("Error en la respuesta del servidor.");
            }

            const dataEquipo = await response.json();

            console.log("📊 Resultados:", {
                ok: dataEquipo.ok,
                tieneEquipo: dataEquipo.data?.equipo ? true : false,
                tieneDiagnostico: dataEquipo.data?.diagnostico ? true : false,
            });

            if (!dataEquipo.ok || (!dataEquipo.data?.equipo && !dataEquipo.data?.diagnostico)) {
                Alert.alert("Sin resultados", "No se encontró ningún equipo o diagnóstico con ese número de serie.");
                return;
            }

            setConsulta({
                numero_serie: dataEquipo.data.numero_serie,
                ...dataEquipo.data.equipo,
                diagnostico: dataEquipo.data.diagnostico,
            });
        } catch (err) {
            console.error(err);
            Alert.alert("Error", "Ocurrió un error al buscar el equipo. Verifica que el servidor esté corriendo.");
        } finally {
            setLoading(false);
        }
    };

    // Handler robusto para asegurar la llamada correcta desde los botones
    const handleBuscar = () => {
        buscarEquipo(searchSerie);
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
                            onSubmitEditing={handleBuscar}
                            autoCapitalize="characters"
                        />
                    </View>
                    <TouchableOpacity 
                        style={styles.searchBtn} 
                        onPress={handleBuscar}
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
                        
                        <Text style={styles.sectionSubtitle}>DATOS DEL EQUIPO</Text>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Tipo</Text>
                            <Text style={styles.resultValue}>{consulta.tipo_equipo || "N/A"}</Text>
                        </View>
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
                            <Text style={styles.resultLabel}>Dueño / Asignado a</Text>
                            <Text style={styles.resultValue}>{consulta.dueno || "N/A"}</Text>
                        </View>
                        <View style={styles.resultRow}>
                            <Text style={styles.resultLabel}>Fecha de Ingreso</Text>
                            <Text style={styles.resultValue}>
                                {consulta.fecha_ingreso ? new Date(consulta.fecha_ingreso).toLocaleDateString() : "N/A"}
                            </Text>
                        </View>
                        <View style={[styles.resultRow, { borderBottomWidth: 0 }]}>
                            <Text style={styles.resultLabel}>Fecha de Registro</Text>
                            <Text style={styles.resultValue}>
                                {consulta.fecha_registro ? new Date(consulta.fecha_registro).toLocaleDateString() : "N/A"}
                            </Text>
                        </View>

                        {/* Sección de Diagnóstico */}
                        <View style={styles.innerDivider} />
                        <Text style={styles.sectionSubtitle}>ÚLTIMO DIAGNÓSTICO</Text>
                        
                        {consulta.diagnostico ? (
                            <>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Estatus Final</Text>
                                    <Text style={[styles.resultValue, { color: consulta.diagnostico.estatus_final === 'Completado' ? '#4ADE80' : '#FBBF24' }]}>
                                        {consulta.diagnostico.estatus_final || "N/A"}
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Checks Completados</Text>
                                    <Text style={styles.resultValue}>
                                        {consulta.diagnostico.detalles_revision?.total_completados ?? 0} / 9
                                    </Text>
                                </View>
                                <View style={styles.resultRow}>
                                    <Text style={styles.resultLabel}>Observaciones</Text>
                                    <Text style={styles.resultValue}>
                                        {consulta.diagnostico.observaciones_extra || "Ninguna"}
                                    </Text>
                                </View>
                                <View style={[styles.resultRow, { borderBottomWidth: 0 }]}>
                                    <Text style={styles.resultLabel}>Fecha de Revisión</Text>
                                    <Text style={styles.resultValue}>
                                        {new Date(consulta.diagnostico.created_at).toLocaleDateString()}
                                    </Text>
                                </View>
                            </>
                        ) : (
                            <Text style={styles.emptyText}>No hay diagnósticos registrados para este equipo.</Text>
                        )}
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
        flex: 1,
        textAlign: "right",
        marginLeft: 10,
    },
    sectionSubtitle: {
        color: "#60A5FA",
        fontSize: 12,
        fontWeight: "700",
        letterSpacing: 1.5,
        marginBottom: 6,
        marginTop: 10,
    },
    innerDivider: {
        height: 1,
        backgroundColor: "#334155",
        marginVertical: 14,
        width: "100%",
    },
    emptyText: {
        color: "#94A3B8",
        fontSize: 13,
        fontStyle: "italic",
        textAlign: "center",
        marginTop: 10,
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
