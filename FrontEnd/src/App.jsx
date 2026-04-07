import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import 'bootstrap/dist/css/bootstrap.min.css';
import { 
    isRouteErrorResponse, 
    NavLink, 
    useParams, 
    BrowserRouter,
    Routes,
    Route,
	Navigate
} from "react-router-dom";
import { sileo, Toaster } from "sileo";

//imports de cada pagina
import Grupo from "./pages/grupo/Grupo.jsx";
import Inventario from "./pages/inventario/Inventario.jsx";
import Login from "./pages/login/Login.jsx";
import Planificacion from "./pages/planificacion/Planificacion.jsx";
import Proyecto from "./pages/proyectos/Proyecto.jsx";
import Personal from './pages/personal/Personal.jsx';
import Institucion from './pages/institucion/Institucion.jsx';

import RutaPrivada from "./components/RutaPrivada.jsx";
import AppNavbar from "./components/Navbar.jsx";
import RutaAdmin from "./components/RutaAdmin.jsx";
import GestionUsuarios from "./pages/usuarios/GestionUsuarios.jsx";

function App() {
	return (
		<BrowserRouter>
			<Toaster position='top-center' options={{fill: "dark"}}/>
			<AppNavbar />
			<Routes>
				{/*RUTAS PUBLICAS */}
				<Route path="/" element={<Navigate to="/login" replace />} />
				<Route path="/login" element={ <Login/> }></Route>

				{/*RUTAS PRIVADAS */}
				<Route element={<RutaPrivada />}>
					<Route path="/grupo" element={ <Grupo/> }></Route>
					<Route path='/institucion' element={ <Institucion/> }></Route>
					<Route path="/inventario/planificacion/:idPlanificacion" element={ <Inventario/> }></Route>
					<Route path="/grupo/planificacion/:idGrupo" element={ <Planificacion/> }></Route>
					<Route path="/proyectos/planificacion/:idPlanificacion" element={ <Proyecto/> }></Route>
					<Route path="/personal/planificacion/:idPlanificacion" element={<Personal/>}></Route>
				</Route>
				
				{/*RUTAS ADMIN */}
				<Route element={<RutaAdmin />}>
					<Route path="/admin/usuarios" element={<GestionUsuarios />} />
				</Route>

			</Routes>
		</BrowserRouter>
	)
}

export default App
