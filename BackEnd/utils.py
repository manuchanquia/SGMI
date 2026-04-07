from flask import jsonify, request
from sqlalchemy import or_, inspect, String, Text, Date, DateTime
from datetime import datetime

def paginar(consulta, modelo, modelos_relacionados=None):
    # busqueda global
    try:
        busqueda = request.args.get('busqueda_global')
        
        if busqueda:
            filtros = []
            entidades_a_buscar = [modelo]
            if modelos_relacionados:
                entidades_a_buscar.extend(modelos_relacionados)

            for entidad in entidades_a_buscar:
                mapper = inspect(entidad)
                for attr_name, attr in mapper.all_orm_descriptors.items():
                    if hasattr(attr, 'property') and hasattr(attr.property, 'columns'):
                        tipo_columna = attr.property.columns[0].type
                        col_attr = getattr(entidad, attr_name)

                        if isinstance(tipo_columna, (String, Text)):
                            filtros.append(col_attr.ilike(f"%{busqueda}%"))
                        
                        elif isinstance(tipo_columna, (Date, DateTime)):
                            try:
                                fecha_bus = datetime.strptime(busqueda, '%Y-%m-%d').date()
                                filtros.append(col_attr == fecha_bus)
                            except ValueError:
                                continue
                
            if filtros:
                consulta = consulta.filter(or_(*filtros)).distinct()

        # filtro dinamico
        for argumento in request.args:
            if argumento.startswith('filtro_'):
                clave = argumento[len('filtro_'):]
                valor = request.args[argumento]
                if valor.lower() == 'todos' or not valor:
                    continue
                
                col_encontrada = False
                if hasattr(modelo, clave):
                    col_attr = getattr(modelo, clave)
                    col_encontrada = True

                elif modelos_relacionados:
                    for rel_mod in modelos_relacionados:
                        if hasattr(rel_mod, clave):
                            col_attr = getattr(rel_mod, clave)
                            col_encontrada = True
                            break
                
                if col_encontrada:
                    if valor.lower() in ['true', 'false']:
                        consulta = consulta.filter(col_attr == (valor.lower() == 'true'))
                    else: 
                        consulta = consulta.filter(col_attr.ilike(f"%{valor}%"))

        # orden
        columna_orden = request.args.get('ordenar_por', default='id')
        direccion_orden = request.args.get('direccion', default='desc')
        
        col_orden_attr = None
        if hasattr(modelo, columna_orden):
            col_orden_attr = getattr(modelo, columna_orden)
        elif modelos_relacionados:
            for rel_mod in modelos_relacionados:
                if hasattr(rel_mod, columna_orden):
                    col_orden_attr = getattr(rel_mod, columna_orden)
                    break
        
        if col_orden_attr:
            consulta = consulta.order_by(col_orden_attr.desc() if direccion_orden == 'desc' else col_orden_attr.asc())
        else:
            consulta = consulta.order_by(modelo.id.desc())
        
        # paginacion
        pagina_arg = request.args.get('pagina', type=int)
        por_pagina_arg = request.args.get('por_pagina', type=int)

        if pagina_arg is None and por_pagina_arg is None:
            resultados = consulta.all()
            return jsonify({
                "datos": [item.to_dict() for item in resultados],
                "metadatos": {
                    "total_registros": len(resultados),
                    "paginado": False
                }
            })

        pagina = pagina_arg or 1
        por_pagina = por_pagina_arg or 5
        
        paginacion = consulta.paginate(page=pagina, per_page=por_pagina, error_out=False)

        return jsonify({
            "datos": [item.to_dict() for item in paginacion.items],
            "metadatos": {
                "total_registros": paginacion.total,
                "total_paginas": paginacion.pages,
                "pagina_actual": paginacion.page,
                "registros_por_pagina": paginacion.per_page,
                "tiene_siguiente": paginacion.has_next,
                "tiene_anterior": paginacion.has_prev,
                "paginado": True
            }
        })
    except Exception as e:
        print(f"Error en paginar: {str(e)}")
        return jsonify({"error": "Error interno al procesar la consulta", "detalle": str(e)}), 500
