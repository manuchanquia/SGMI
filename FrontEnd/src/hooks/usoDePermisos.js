import { datosUsuario } from '../utils/auth';

export const usoDePermisos = () => {
    const infoUsuario = datosUsuario(); 
    const rol = infoUsuario?.rol || 'consulta';

    return {
        rol,
        idPersona: infoUsuario?.id_persona,
        esSuperAdmin: rol === 'superadmin',
        esAdmin: rol === 'admin',
        esConsulta: rol === 'consulta',
        
        puedeEditar: rol === 'admin' || rol === 'superadmin',
        puedeEliminar: rol === 'superadmin',
        puedeDarDeBaja: rol === 'admin' || rol === 'superadmin',
        
        perteneceAGrupo: (idGrupoObjeto, idsGrupos) => {
            if (rol === 'superadmin') return true;
            return idsGrupos.includes(idGrupoObjeto);
        }
    };
};