import React from "react";
import CabeceraTabla from "./CabeceraTabla";
import Table from "react-bootstrap/Table"
import "./Tabla.css"

function Tabla({columnas, filas}) {
    return (
        <Table responsive striped className="tabla">
            <CabeceraTabla arrayCampos={columnas}></CabeceraTabla>
            <tbody>
                {filas.map((fila, index) => (
                    <tr key={index}>
                        {fila.map((celda, celdaIndex) => (
                            <td key={celdaIndex} data-label={columnas[celdaIndex]}>
                                {celda}
                            </td>
                        ))}
                    </tr>
                ))}
            </tbody>
        </Table>
    )
}

export default Tabla