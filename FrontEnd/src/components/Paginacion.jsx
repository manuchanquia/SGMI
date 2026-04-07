import React from "react";
import ReactPaginate from "react-paginate";

function Paginacion({ pageCount, onPageChange }) {
    return (
        <ReactPaginate
            
            pageCount={pageCount}
            onPageChange={onPageChange}
            pageRangeDisplayed={3} 
            marginPagesDisplayed={2}

            containerClassName={"pagination justify-content-center mt-4"} 

            pageClassName={"page-item"}
            previousClassName={"page-item"}
            nextClassName={"page-item"}
            breakClassName={"page-item"} 

            pageLinkClassName={"page-link"}
            previousLinkClassName={"page-link"}
            nextLinkClassName={"page-link"}
            breakLinkClassName={"page-link"}

            activeClassName={"active"} 

            previousLabel={"« Anterior"}
            nextLabel={"Siguiente »"}
            breakLabel={"..."}
        />
    );
}

export default Paginacion;