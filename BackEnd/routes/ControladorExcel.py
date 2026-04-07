from flask import Blueprint, send_file
from services.AdminExcel import AdminExcel
from database import db
from reports.ExportacionExcel import ExportarExcel
excel_bp = Blueprint("excel", __name__)

@excel_bp.route("/<int:planificacionId>/<int:anio>", methods=["GET"])

def exportar_memoria(planificacionId, anio):
    try:
        administrador_excel = AdminExcel()
        datos = administrador_excel.generarMemoria(planificacionId, anio)
        
        exportador = ExportarExcel(datos)
        archivo_excel = exportador.generar_archivo()

        return send_file(
            archivo_excel,
            as_attachment=True,
            download_name=f"Memoria_{anio}.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )
    except Exception as e:
        print(f"Error: {e}")
        return {"error": str(e)}, 500
