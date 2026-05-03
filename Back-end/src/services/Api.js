const Api_Base_URL = "http://localhost:8081";

export const getHistorialPorEquipos = async (numeroSerie) => {
    try {
        const response = await fetch(`${Api_Base_URL}/diagnosticos/${numeroSerie}`);
        if (!response.ok) {
            throw new Error(`Error al obtener historial: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};