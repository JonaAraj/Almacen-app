const Api_Base_URL = "http://localhost:3000";

export const getEquipoConDiagnostico = async (numeroSerie) => {
    try {
        const response = await fetch(`${Api_Base_URL}/equipos/${numeroSerie}`);
        if (!response.ok) {
            throw new Error(`Error al obtener equipo: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};

export const getHistorialPorEquipos = async (numeroSerie) => {
    try {
        const response = await fetch(`${Api_Base_URL}/revisiones/historial/feed/${numeroSerie}`);
        if (!response.ok) {
            throw new Error(`Error al obtener historial: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error(error);
        throw error;
    }
};