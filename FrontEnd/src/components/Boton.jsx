import React, { Children } from "react";
import Button from "react-bootstrap/Button";
import "./Boton.css"


function Boton({texto, accion}){
    return (
        <Button className="boton"
            variant="primary"
            type="button"
            onClick={()=>accion()}
        >
            {texto}
        </Button>
    )
}

export default Boton;