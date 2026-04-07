import { usoDePermisos } from '../../hooks/usoDePermisos';

export const PermisoAccion = ({ children, permisoRequerido }) => {
    const { esSuperAdmin, puedeEditar, puedeEliminar } = usoDePermisos();

    if (permisoRequerido === 'editar' && !puedeEditar) return null;
    if (permisoRequerido === 'eliminar' && !puedeEliminar) return null;
    if (permisoRequerido === 'superadmin' && !esSuperAdmin) return null;

    return <>{children}</>;
};