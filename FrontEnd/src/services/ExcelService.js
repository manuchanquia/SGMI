const apiUrl = "http://localhost:5000"
const excelUrl = `${apiUrl}/api/excel`;

export const excelService = {
    /**
        * @param {number} planificacionId 
        * @param {number} anio 
    */

    descargarMemoria: async (planificacionId, anio) => {
        try {
            const response = await fetch(`${excelUrl}/${planificacionId}/${anio}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            });

            if (!response.ok) {
                throw new Error('No se pudo generar el archivo Excel en el servidor.');
            }

            const blob = await response.blob();

            const url = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `Memoria_Grupo${planificacionId}_${anio}.xlsx`);

            document.body.appendChild(link);
            link.click();

            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(url);

            return { success: true };
        } catch (error) {
            console.error("Error en excelService:", error);
            throw error; 
        }
    }
};