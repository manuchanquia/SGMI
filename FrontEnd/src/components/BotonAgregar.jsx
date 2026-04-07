import React, { Children } from "react";
import Button from "react-bootstrap/Button";
import "./Boton.css"


function BotonAgregar({children, accion}){
    return (
        <Button className="boton"
            variant="primary"
            type="button"
            onClick={()=>accion()}
        >
            {children}
        </Button>
    )
}

export default BotonAgregar;