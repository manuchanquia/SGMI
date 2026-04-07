import xlsxwriter
from io import BytesIO
from datetime import datetime

class ExportarExcel:
    def __init__(self, datos):
        self.datos = datos
        
        def asegurar_objeto(objeto):
            if hasattr(objeto, 'first'): return objeto.first()
            return objeto

        def asegurar_lista(objeto):
            if hasattr(objeto, 'all'): return objeto.all()
            return objeto or []

        self.grupo = asegurar_objeto(datos.get("grupo"))
        self.planificacion = asegurar_objeto(datos.get("planificacion"))
        self.institucion = asegurar_objeto(datos.get("institucion"))
        self.personal = asegurar_lista(datos.get("personal"))
        self.proyectos = asegurar_lista(datos.get("proyectos"))
        self.bibliografia = asegurar_lista(datos.get("bibliografia"))
        self.equipamiento = asegurar_lista(datos.get("equipamiento"))

    def generar_archivo(self):
        salida = BytesIO()
        libro = xlsxwriter.Workbook(salida, {'in_memory': True})
        hoja = libro.add_worksheet("Memoria")

        #el excel se rompe con las enumerativas, asi que hay que convertirlas a string para que las guarde en la celda
        def convertirEnumerativa(valor):
            if hasattr(valor, 'value'): return valor.value
            if hasattr(valor, 'name'): return valor.name
            return str(valor) if valor else ""

        #Formatos
        formatoTitulo = libro.add_format({'bold': True, 'bg_color': "#E4BDBD", 'border': 1, 'align': 'center', 'valign': 'vcenter', 'font_size': 14})
        formatoSubtitulo = libro.add_format({'bold': True, 'bg_color': '#EAEAEA', 'border': 1, 'valign': 'vcenter', 'font_size': 12})
        formatoAmarillo = libro.add_format({'bold': True, 'bg_color': '#FFFF00', 'border': 1, 'valign': 'vcenter'})
        formatoCampo = libro.add_format({'border': 1, 'valign': 'vcenter', 'text_wrap': True})
        formatoHeader = libro.add_format({'bold': True, 'bg_color': '#D9D9D9', 'border': 1, 'align': 'center'})
        formatoFecha = libro.add_format({'border': 1, 'num_format': 'dd/mm/yyyy', 'align': 'center'})

        fila = 0 

        #1. Título
        anio = getattr(self.planificacion, 'anio', 'S/D')
        nombreGrupo = getattr(self.grupo, 'nombre', 'S/D')
        hoja.merge_range(fila, 0, fila, 7, f"MEMORIAS {anio} DEL GRUPO {nombreGrupo}", formatoTitulo)
        fila += 2

        #2. Administracion de grupo
        hoja.merge_range(fila, 0, fila, 7, "I.- ADMINISTRACIÓN", formatoSubtitulo)
        fila += 1
        
        infoGrupo = [
            f"1.1.- Facultad Regional: {getattr(self.institucion, 'nombre', '')}",
            f"1.2.- Nombre y Sigla: {nombreGrupo} y {getattr(self.grupo, 'sigla', '')}",
            f"1.3.- Director/a: {getattr(self.grupo, 'director', '')}",
            f"1.4.- Vicedirector/a: {getattr(self.grupo, 'vicedirector', '')}",
            f"1.5.- Dirección de Email: {getattr(self.grupo, 'correo_electronico', '')}"
        ]
        
        for texto in infoGrupo:
            hoja.merge_range(fila, 0, fila, 7, texto, formatoCampo)
            fila += 1
        
        consejo = self.datos.get("consejo_ejecutivo", [])

        tituloConsejo = "1.6.- Integrantes del Consejo Ejecutivo"

        if not consejo:
            tituloConsejo += " (No aplica)"

        hoja.merge_range(fila, 0, fila, 7, tituloConsejo)
        fila += 1

        hoja.write(fila, 0, "Nº", formatoCampo)
        hoja.merge_range(fila, 1, fila, 4, "Nombre y Apellido", formatoCampo)
        fila += 1

        for i, miembro in enumerate(consejo, 1):
            hoja.write(fila, 0, i, formatoCampo)
            hoja.merge_range(fila, 1, fila, 4, getattr(miembro, 'nombre', ''), formatoCampo)
            fila += 1

        fila += 1
        fila += 2
        
        hoja.merge_range(fila, 0, fila, 7, "1.7.- Organigrama Científico, Tecnológico y Administrativo", formatoCampo)
        fila += 1

        organigrama = getattr(self.grupo, 'organigrama')
        hoja.merge_range(fila, 0, fila + 3, 7, organigrama, formatoCampo)
        fila += 4

        hoja.merge_range(fila, 0, fila, 7, "1.8.- Objetivos y Desarrollo:", formatoAmarillo)
        fila += 1
        objetivos = getattr(self.grupo, 'objetivos', 'Sin objetivos definidos.')
        hoja.merge_range(fila, 0, fila + 3, 7, objetivos, formatoCampo)
        
        fila += 4
        fila += 2

        # 3. Personal
        fila += 1
        hoja.merge_range(fila, 0, fila, 7, "2.- PERSONAL", formatoAmarillo)
        fila += 1

        tiposPersonal = [
            {"tipo": "INVESTIGADOR", "titulo": "2.1.- Investigadores", "headers": ["Nº", "Nombre y Apellido", "Categoría UTN", "Prog. de Incentivos", "Dedicación", "Horas semanales"]},
            {"tipo": "PROFESIONAL", "titulo": "2.2.- Personal Profesional", "headers": ["Nº", "Nombre y Apellido", "Horas semanales"]},
            {"tipo": "SOPORTE", "titulo": "2.3.- Personal técnico, administrativo y de apoyo", "headers": ["Nº", "Nombre y Apellido", "Horas semanales"]},
            {"tipo": "BECARIO", "titulo": "2.4.- Becarios y/o personal en formación", "headers": ["Nº", "Nombre y Apellido", "Fuente Financiamiento", "Formación", "Horas semanales"]}
        ]

        for categoria in tiposPersonal:
            categoriaPersonal = [persona for persona in self.personal if getattr(persona, 'objectType', '') == categoria["tipo"]]
            
            hoja.merge_range(fila, 0, fila, 7, categoria["titulo"], formatoAmarillo)
            fila += 1

            for col, h in enumerate(categoria["headers"]):
                hoja.write(fila, col, h, formatoHeader)
            fila += 1

            if not categoriaPersonal:
                hoja.merge_range(fila, 0, fila, 7, "No se registran integrantes en esta categoría", formatoCampo)
                fila += 1
            else:
                for i, m in enumerate(categoriaPersonal, 1):
                    persona = getattr(m, 'persona', None)
                    nombreYApellido = f"{getattr(persona, 'nombre', '')} {getattr(persona, 'apellido', '')}"
                    
                    hoja.write(fila, 0, i, formatoCampo)
                    hoja.write(fila, 1, nombreYApellido, formatoCampo)

                    if categoria["tipo"] == "INVESTIGADOR":
                        hoja.write(fila, 2, getattr(m, 'categoria', '-'), formatoCampo)
                        hoja.write(fila, 3, getattr(m, 'incentivo', '-'), formatoCampo)
                        hoja.write(fila, 4, convertirEnumerativa(getattr(m, 'dedicacion', '')), formatoCampo)
                        hoja.write(fila, 5, getattr(m, 'horas', 0), formatoCampo)
                    
                    elif categoria["tipo"] == "BECARIO":
                        hoja.write(fila, 2, getattr(m, 'financiamiento', '-'), formatoCampo)
                        hoja.write(fila, 3, convertirEnumerativa(getattr(m, 'formacionBecario', '')), formatoCampo)
                        hoja.write(fila, 4, getattr(m, 'horas', 0), formatoCampo)
                    
                    else: 
                        hoja.write(fila, 2, getattr(m, 'horas', 0), formatoCampo)
                    
                    fila += 1
            
            fila += 1 
            
        #4. Equipamiento
        
        fila += 1
        hoja.merge_range(fila, 0, fila, 7, "3.- EQUIPAMIENTO E INFRAESTRUCTURA", formatoAmarillo)
        fila += 1
        
        headersEquipo = ["Nº", "Denominación", "Fecha de incorporación", "Monto invertido", "Descripción breve"]
        
        for col, h in enumerate(headersEquipo):
            hoja.write(fila, col, h, formatoHeader)
        fila += 1

        if not self.equipamiento:
            hoja.merge_range(fila, 0, fila, 7, "No se registra equipamiento", formatoCampo)
            fila += 1
        else:
            for i, equipo in enumerate(self.equipamiento, 1):
                hoja.write(fila, 0, i, formatoCampo)
                hoja.write(fila, 1, getattr(equipo, 'denominacion', ''), formatoCampo)
                
                fechaIngreso = getattr(equipo, 'fechaIngreso', None)
                if isinstance(fechaIngreso, datetime):
                    hoja.write_datetime(fila, 2, fechaIngreso, formatoFecha)
                else:
                    hoja.write(fila, 2, str(fechaIngreso or ''), formatoCampo)
                    
                hoja.write(fila, 3, getattr(equipo, 'monto', 0), formatoCampo)
                hoja.write(fila, 4, getattr(equipo, 'descripcion', ''), formatoCampo)
                fila += 1

        #5. Bibliografia
        fila += 2
        hoja.merge_range(fila, 0, fila, 7, "4.- DOCUMENTACIÓN Y BIBLIOTECA", formatoAmarillo)
        fila += 1
        
        headersBibliografia = ["Nº", "Título", "Autores", "Editorial", "Año"]
        for col, h in enumerate(headersBibliografia):
            hoja.write(fila, col, h, formatoHeader)
        fila += 1

        for i, item in enumerate(self.bibliografia, 1):
            hoja.write(fila, 0, i, formatoCampo)
            hoja.write(fila, 1, getattr(item, 'titulo', ''), formatoCampo)
            hoja.write(fila, 2, getattr(item, 'autores', ''), formatoCampo)
            hoja.write(fila, 3, getattr(item, 'editorial', ''), formatoCampo)
            fechaBibliografia = getattr(item, 'fecha', None)
            anioBibliografia = fechaBibliografia.year if hasattr(fechaBibliografia, 'year') else str(fechaBibliografia or '')
            hoja.write(fila, 4, anioBibliografia, formatoCampo)
            fila += 1

        #6. Actividades I+D+i
        fila += 2
        hoja.merge_range(fila, 0, fila, 7, "II.- ACTIVIDADES DE I+D+i", formatoAmarillo)
        fila += 1
        hoja.merge_range(fila, 0, fila, 7, "5.- INVESTIGACIONES", formatoAmarillo)
        fila += 1
        hoja.write(fila, 0, "Proyectos en curso", libro.add_format({'bold': True}))
        fila += 1

        headersProyecto = [
            "Tipo", "Código", "Inicio/Fin", 
            "Nombre", "Descripción", "Financiamiento"
        ]
        for col, h in enumerate(headersProyecto):
            hoja.write(fila, col, h, formatoHeader)
        fila += 1

        for proy in self.proyectos:
            tipoProyecto = getattr(proy, 'tipo', '')
            hoja.write(fila, 0, convertirEnumerativa(tipoProyecto), formatoCampo)
            
            hoja.write(fila, 1, getattr(proy, 'codigo', ''), formatoCampo)
            
            fechaInicioProyecto = getattr(proy, 'fechaInicio', '')
            fechaFinProyecto = getattr(proy, 'fechaFin', '')
            rango = f"{fechaInicioProyecto.strftime('%d/%m/%Y') if hasattr(fechaInicioProyecto, 'strftime') else fechaInicioProyecto} al {fechaFinProyecto.strftime('%d/%m/%Y') if hasattr(fechaFinProyecto, 'strftime') else fechaFinProyecto}"
            hoja.write(fila, 2, rango, formatoCampo)
            
            hoja.write(fila, 3, getattr(proy, 'nombre', ''), formatoCampo)
            hoja.write(fila, 4, getattr(proy, 'descripcion', ''), formatoCampo)
            hoja.write(fila, 5, getattr(proy, 'financiamiento', 'S/F'), formatoCampo)
            fila += 1

        #ajuste de columnas
        hoja.set_column('A:A', 15)
        hoja.set_column('B:B', 35)
        hoja.set_column('C:G', 20)

        libro.close()
        salida.seek(0)
        return salida