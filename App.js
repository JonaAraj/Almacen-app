import React, { useState } from "react";
import { View, StyleSheet } from "react-native";

import Menu from "./mi-app/menu";
import Inventario from "./mi-app/inventario";
import RevisionInicial from "./mi-app/revisionInicial";
import Registro from "./mi-app/registro";
import Historial from "./mi-app/HistorialScreen"; 
import Consulta from "./mi-app/Consulta";

export default function App() {
  const [pantalla, setPantalla] = useState("menu");
  const [equipoSeleccionado, setEquipoSeleccionado] = useState(null);

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
          verHistorial={(sn) => {
            setEquipoSeleccionado(sn);
            setPantalla("historial");
          }}
        />
      )}

      {pantalla === "inventario_registro" && (
        <Registro regresar={() => setPantalla("inventario")} />
      )}

      {pantalla === "historial" && (
        <Historial 
          numeroSerie={equipoSeleccionado || "GENERAL"} 
          regresar={() => setPantalla("menu")} 
        />
      )}

      {pantalla === "inventario_consulta" && (
        <Consulta regresar={() => setPantalla("inventario")} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
});