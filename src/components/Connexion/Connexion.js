import React, { useState, useContext } from "react";
import "./Connexion.css"
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { GlobalContext } from '../GlobalContext/GlobalContext';
import { decodeToken } from "react-jwt";
import { Howl, Howler } from 'howler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye as OpenedEye,
    faEyeSlash as ClosedEye,
} from '@fortawesome/free-regular-svg-icons'

export default function Connexion() {
    const navigate = useNavigate();

    const [nomCompte, setNomCompte] = useState("");
    const [motDePasse, setMotDePasse] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [reponseServeur, setReponseServeur] = useState("");
    const { updateGlobalElo, updateGlobalAvatar } = useContext(GlobalContext); // Récupération de globalElo et setGlobalElo avec useContext

    // son boutons
    const soundDown = new Howl({
        src: ['/sons/clicdown.wav']
    });
    const soundUp = new Howl({
        src: ['/sons/clicup.wav']
    });
    const handlePieceDown = () => {
        Howler.volume(0.3);
        soundDown.play();
    };

    function toggleShowPassword() {
        setShowPassword(!showPassword);
    }

    const handleConnexion = async (event) => {
        Howler.volume(0.3);
        soundUp.play();
        event.preventDefault();
        const formData = {
            'name': nomCompte,
            'password': motDePasse
        };
        var config = {
            method: 'put',
            maxBodyLength: Infinity,
            url: 'http://localhost:3001/users/signin',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: formData
        };
        axios(config)
            .then(async function (response) {
                // Pour stocker le token dans la variable de session
                sessionStorage.setItem('token', response.data.token);
                const decoded = decodeToken(sessionStorage.token);
                const name = decoded.name;
                // get elo
                var config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `http://localhost:3001/users/globalElo/${name}`,
                    headers: {
                        'Authorization': `Bearer ${response.data.token}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                };
                axios(config)
                    .then(function (response) {
                        updateGlobalElo(response.data.global_elo);
                        updateGlobalAvatar(decoded.imageProfil);
                        navigate('/selectionExercices');
                    })
                    .catch(function (error) {
                        console.log(error);

                    });
            })
            .catch(function (error) {
                if (error.response) {
                    if (error.response.data.error) {
                        setReponseServeur(error.response.data.error);
                    }
                    else if (error.response.data.message) {
                        setReponseServeur(error.response.data.message);
                    }
                }
                else {
                    setReponseServeur(error.message);
                }
                setTimeout(() => {
                    setReponseServeur('');
                }, 4000);
            });
    };

    return (
        <div className="container-connexion">
            <form className="form-connexion" onSubmit={handleConnexion} >
                <h1>Connexion</h1>
                <input
                    className="input-connexion"
                    placeholder="Nom de compte"
                    value={nomCompte}
                    onChange={(event) => setNomCompte(event.target.value)} />
                <div className="password-container">
                    <input
                        className="input-connexion"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mot de passe"
                        value={motDePasse}
                        onChange={(event) => setMotDePasse(event.target.value)} />
                    <button
                        className="show-password-connexion"
                        type="button"
                        onClick={toggleShowPassword}>
                        {showPassword ? <FontAwesomeIcon icon={OpenedEye} size="sm" /> : <FontAwesomeIcon icon={ClosedEye} size="sm" />}
                    </button>
                </div>
                <button
                    className="bouton-3D"
                    {...((nomCompte === "" || motDePasse.length < 8) && { disabled: true })}
                    onMouseDown={handlePieceDown}>
                    <span className="texte-3D">
                        Se connecter
                    </span>
                </button>
            </form>
            <div>
                {reponseServeur && (
                    <div className="errors">
                        <b>{reponseServeur}</b>
                    </div>
                )}
            </div>
        </div>

    );
}