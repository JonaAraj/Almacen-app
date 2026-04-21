import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import Menu from "./menu";
import Inventario from "./inventario";
import RevisionInicial from "./revisionInicial";
import Registro from "./registro";

export default function App() {
  const [pantalla, setPantalla] = useState("menu");

  return (
    <View style={styles.container}>
      {pantalla === "menu" && (
        <Menu cambiarPantalla={setPantalla} />
      )}
      {pantalla === "registro" && (
        <RevisionInicial regresar={() => setPantalla("menu")} />
      )}
      {pantalla === "inventario" && (
        <Inventario
          cambiarPantalla={setPantalla}
          regresar={() => setPantalla("menu")}
        />
      )}
      {pantalla === "inventario_registro" && (
        <Registro regresar={() => setPantalla("inventario")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});