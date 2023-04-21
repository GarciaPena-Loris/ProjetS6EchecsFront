import React, { useState } from "react";
import "./Inscription.css"
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { Howl, Howler } from 'howler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faEye as OpenedEye,
    faEyeSlash as ClosedEye,
} from '@fortawesome/free-regular-svg-icons'

export default function Inscription() {
    const navigate = useNavigate();
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [reponseServeur, setReponseServeur] = useState("");
    const passwordIsValid = /^(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$/.test(password);

    // son boutons
    const soundDown = new Howl({
        src: ['/sons/clicdown.wav']
    });
    const soundUp = new Howl({
        src: ['/sons/clicup.wav']
    });
    const soundHover = new Howl({
        src: ['/sons/hover.mp3']
    });
    const handlePieceHover = () => {
        Howler.volume(0.1);
        soundHover.play();
    };
    const handlePieceDown = () => {
        Howler.volume(0.3);
        soundDown.play();
    };

    function toggleShowPassword() {
        setShowPassword(!showPassword);
    }

    function toggleShowConfirmPassword() {
        setShowConfirmPassword(!showConfirmPassword);
    }

    const handleUsernameChange = (event) => {
        setUsername(event.target.value);
    };

    const handlePasswordChange = (event) => {
        setPassword(event.target.value);
    };

    const handleConfirmPasswordChange = (event) => {
        setConfirmPassword(event.target.value);
    };

    const handleSubmit = async (event) => {
        Howler.volume(0.3);
        soundUp.play();
        event.preventDefault();
        const formData = {
            'name': username,
            'password': password
        };
        var config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://echec.herokuapp.com/users/signup',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            data: formData
        };
        axios(config)
            .then(function (response) {
                navigate("/connexion")
            })
            .catch(function (error) {
                if (error.response) {
                    setReponseServeur(error.response.data.error);
                }
                else {
                    setReponseServeur(error.message);
                }
            });
    };

    return (
        <div className="container-inscription">
            <form className="form-inscription" onSubmit={handleSubmit}>
                <h1>Inscription</h1>
                <input
                    className="input-inscription"
                    placeholder="Nom de compte"
                    value={username}
                    onChange={handleUsernameChange}
                    required
                />
                <i className="info">
                    (3 caractères minimum)
                </i>
                <div className="password-container">
                    <input
                        className="input-inscription"
                        type={showPassword ? 'text' : 'password'}
                        placeholder="Mot de passe"
                        value={password}
                        onChange={handlePasswordChange}
                        required
                    />
                    <button
                        className="show-password-connexion"
                        type="button"
                        onMouseDown={toggleShowPassword}
                        onMouseUp={toggleShowPassword}>
                        {showPassword ? <FontAwesomeIcon icon={OpenedEye} size="sm" /> : <FontAwesomeIcon icon={ClosedEye} size="sm" />}
                    </button>
                </div>
                <i className="info">
                    (8 caractères minimum, 1 chiffre et 1 caractère spécial)
                </i>
                <div className="password-container">
                    <input
                        className="input-inscription"
                        type={showConfirmPassword ? 'text' : 'password'}
                        placeholder="Confirmation du mot de passe"
                        value={confirmPassword}
                        onChange={handleConfirmPasswordChange}
                        required
                    />
                    <button
                        className="show-password-connexion"
                        type="button"
                        onMouseDown={toggleShowConfirmPassword}
                        onMouseUp={toggleShowConfirmPassword}>
                        {showConfirmPassword ? <FontAwesomeIcon icon={OpenedEye} size="sm" /> : <FontAwesomeIcon icon={ClosedEye} size="sm" />}
                    </button>
                </div>
                <button
                    className="bouton-3D val-bouton"
                    {...((username.length < 3 ||
                        !passwordIsValid ||
                        password !== confirmPassword) && { disabled: true })}
                    onMouseEnter={handlePieceHover}
                    onMouseDown={handlePieceDown}
                    type="submit">
                    <span className="texte-3D">
                        S'inscrire
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
