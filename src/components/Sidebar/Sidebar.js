import React, { useState } from 'react';
import { slide as Menu } from 'react-burger-menu';
import './Sidebar.css';
import cross from "../../files/cross.png"
import { Link, useNavigate } from 'react-router-dom';
import { Howl, Howler } from 'howler';

function Slidebar() {
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();
    const [menuOpenState, setMenuOpenState] = useState(false);

    function handleStateChange(state) {
        Howler.volume(0.1);
        soundHover.play();
        setMenuOpenState(state.isOpen);
    }

    function closeMenu() {
        setMenuOpenState(false);
    }

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
    const handleClickCound = () => {
        closeMenu();
        Howler.volume(0.3);
        soundUp.play();
    };

    const handleLogout = () => {
        Howler.volume(0.3);
        soundUp.play();
        closeMenu();
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('globalElo');
        navigate('/');
    };

    return (
        <Menu
            isOpen={menuOpenState}
            onStateChange={(state) => handleStateChange(state)}
            customCrossIcon={<img alt="croix" src={cross} />}
        >
            <ul>
                <li><Link to="/" onMouseEnter={handlePieceHover} onClick={handleClickCound}>Accueil</Link></li>
                <hr className="hr-buger"></hr>
                {token ? (
                    <>
                        <li><Link to="/selectionExercices" onMouseEnter={handlePieceHover} onClick={handleClickCound}>Exercices</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/connexion" replace onMouseEnter={handlePieceHover} onClick={handleClickCound}>Connexion</Link></li>
                        <hr className="hr-buger"></hr>
                        <li><Link to="/inscription" onMouseEnter={handlePieceHover} onClick={handleClickCound}>Inscription</Link></li>
                    </>
                )}
                {token && (
                    <>
                        <hr className="hr-buger"></hr>
                        <li>
                            <button className="bouton-3D-red bouton-deconnexion"
                                title="Deconnexion"
                                onMouseEnter={handlePieceHover}
                                onMouseUp={handleLogout}
                                onMouseDown={handlePieceDown}>
                                <span className="texte-3D-red span-deconnexion">
                                    Déconnexion
                                </span>
                            </button>
                        </li>
                    </>
                )}
            </ul>
        </Menu>
    );
};
export default Slidebar;