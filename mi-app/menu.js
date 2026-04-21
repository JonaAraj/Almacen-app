import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  StatusBar,
} from "react-native";

export default function Menu({ cambiarPantalla }) {
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const slideBtn1 = useRef(new Animated.Value(60)).current;
  const slideBtn2 = useRef(new Animated.Value(60)).current;
  const slideBtn3 = useRef(new Animated.Value(60)).current;
  const opacityBtn1 = useRef(new Animated.Value(0)).current;
  const opacityBtn2 = useRef(new Animated.Value(0)).current;
  const opacityBtn3 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeTitle, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.stagger(120, [
        Animated.parallel([
          Animated.timing(slideBtn1, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(opacityBtn1, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(slideBtn2, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(opacityBtn2, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(slideBtn3, { toValue: 0, duration: 400, useNativeDriver: true }),
          Animated.timing(opacityBtn3, { toValue: 1, duration: 400, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const buttons = [
    {
      label: "Revisión Inicial",
      pantalla: "registro",
      icon: "🔍",
      slide: slideBtn1,
      opacity: opacityBtn1,
    },
    {
      label: "Historial",
      pantalla: "historial",
      icon: "📋",
      slide: slideBtn2,
      opacity: opacityBtn2,
    },
    {
      label: "Inventario",
      pantalla: "inventario",
      icon: "📦",
      slide: slideBtn3,
      opacity: opacityBtn3,
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />

      <Animated.View style={[styles.header, { opacity: fadeTitle }]}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>Sistema de Gestión</Text>
        </View>
        <Text style={styles.title}>SOPORTE</Text>
        <Text style={styles.titleAccent}>TÉCNICO</Text>
        <View style={styles.divider} />
      </Animated.View>

      <View style={styles.buttonContainer}>
        {buttons.map((btn, index) => (
          <Animated.View
            key={index}
            style={{
              transform: [{ translateY: btn.slide }],
              opacity: btn.opacity,
              width: "100%",
              alignItems: "center",
            }}
          >
            <TouchableOpacity
              style={styles.button}
              onPress={() => cambiarPantalla(btn.pantalla)}
              activeOpacity={0.75}
            >
              <View style={styles.buttonInner}>
                <Text style={styles.buttonIcon}>{btn.icon}</Text>
                <Text style={styles.buttonText}>{btn.label}</Text>
              </View>
              <Text style={styles.buttonArrow}>›</Text>
            </TouchableOpacity>
          </Animated.View>
        ))}
      </View>

      <Text style={styles.footer}>v1.0 · Soporte Técnico</Text>
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
    justifyContent: "space-between",
  },
  header: {
    alignItems: "center",
    marginBottom: 20,
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
  buttonContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 16,
  },
  button: {
    width: "100%",
    backgroundColor: "#1E293B",
    borderRadius: 16,
    paddingVertical: 20,
    paddingHorizontal: 22,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    borderWidth: 1,
    borderColor: "#334155",
  },
  buttonInner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  buttonIcon: {
    fontSize: 22,
  },
  buttonText: {
    color: "#F1F5F9",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: 0.3,
  },
  buttonArrow: {
    color: "#2563EB",
    fontSize: 26,
    fontWeight: "300",
    lineHeight: 28,
  },
  footer: {
    textAlign: "center",
    color: "#475569",
    fontSize: 12,
    letterSpacing: 1,
  },
});