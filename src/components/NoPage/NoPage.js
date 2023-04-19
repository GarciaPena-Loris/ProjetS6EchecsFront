import imageError from "../../files/404page.png"
import React from "react";
import "./NoPage.css";


export default function NoPage() {

    return (
        <div className="no-page">
            <h2>Page non trouvée</h2>
            <img className="no-page-img" src={imageError} alt="imgErreur"></img>
        </div>
    );
}