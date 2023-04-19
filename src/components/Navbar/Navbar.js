import { React, useContext } from 'react';
import "./Navbar.css"
import Avatar from 'react-avatar';
import { Link, useNavigate } from 'react-router-dom';
import { GlobalContext } from '../GlobalContext/GlobalContext';
import { Howl, Howler } from 'howler';

function Navbar() {
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();
    const { globalElo, globalAvatar } = useContext(GlobalContext);

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
        Howler.volume(0.3);
        soundUp.play();
    };

    const handleLogout = () => {
        Howler.volume(0.3);
        soundUp.play();
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('globalElo');
        navigate('/');
    };

    return (
        <nav className='nav-bar'>
            <ul className="nav-menu">
                <li><Link to="/" onMouseEnter={handlePieceHover} onClick={handleClickCound}>Accueil</Link></li>
                <li>|</li>
                {token ? (
                    <>
                        <li><Link to="/selectionExercices" onMouseEnter={handlePieceHover} onClick={handleClickCound}>Exercices</Link></li>
                    </>
                ) : (
                    <>
                        <li><Link to="/connexion" replace onMouseEnter={handlePieceHover} onClick={handleClickCound}>Connexion</Link></li>
                        <li>|</li>
                        <li><Link to="/inscription" onMouseEnter={handlePieceHover} onClick={handleClickCound}>Inscription</Link></li>
                    </>
                )}
                {token && (
                    <>
                        <li>|</li>
                        <li>
                            <button className="bouton-3D bouton-deconnexion"
                                title="Deconnexion"
                                onMouseEnter={handlePieceHover}
                                onMouseUp={handleLogout}
                                onMouseDown={handlePieceDown}>
                                <span className="texte-3D span-deconnexion">
                                    Déconnexion
                                </span>
                            </button>
                        </li>
                    </>
                )}
            </ul>
            <div className='element-droite'>
                {globalElo && token ? (
                    <span className='elo'>{globalElo} points d'élo </span>
                ) :
                    (null)}
                {token && (
                    <>
                        <Link to="/compte" onMouseEnter={handlePieceHover} onClick={handleClickCound}><Avatar className='avatar-navbar' size='40' round={true} src={globalAvatar} /></Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar