import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
//import "../Components.css"
import "./Compte.css"
import { decodeToken } from "react-jwt";
import Avatar from 'react-avatar';
import AvatarCompte from "./AvatarCompte";
import { GlobalContext } from '../GlobalContext/GlobalContext';
import ProgressBar from "@ramonak/react-progress-bar";
import { Howl, Howler } from 'howler';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faChessPawn as whitePawn
} from '@fortawesome/free-regular-svg-icons'

export default function Compte() {
    const { updateGlobalAvatar } = useContext(GlobalContext);
    const [dataCompte, setDataCompte] = useState([]);
    const [dataExos, setDataExos] = useState([]);
    const [dataElo, setDataElo] = useState([]);
    const [dataEloJoueur, setDataEloJoueur] = useState([]);
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();
    const decoded = decodeToken(sessionStorage.token);
    const name = decoded.name;
    const [nbExo, setNbExo] = useState();

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

    const handleLogout = () => {
        Howler.volume(0.3);
        soundUp.play();
        sessionStorage.removeItem('token');
        sessionStorage.removeItem('globalElo');
        navigate('/');
    };

    const handleExerciceClick = (exercice) => {
        Howler.volume(0.3);
        soundUp.play();
        navigate('/exercices', { state: { exercice: exercice } });
    };

    const imageList = [
        "https://i.imgur.com/JII9pSp.jpg",
        "https://i.imgur.com/3sWnXjG.jpg",
        "https://i.imgur.com/1XZQpMs.jpg",
        "https://i.imgur.com/1TTeAKo.jpg",
        "https://i.imgur.com/GKIQYGN.jpg",
        "https://i.imgur.com/PGf9Olk.jpg"
    ];

    const [showPopup, setShowPopup] = useState(false);
    const [selectedImageUrl, setSelectedImageUrl] = useState(dataCompte.imageProfil);

    const handleImageChange = (newImageUrl) => {
        Howler.volume(0.3);
        soundUp.play();
        // Mettre à jour l'URL de l'image dans le state local
        var data = JSON.stringify({
            "imageProfil": newImageUrl
        });
        // Envoyer une requête PUT à l'API pour mettre à jour l'URL de l'image dans la base de données
        const config = {
            method: "put",
            url: `https://echec.herokuapp.com/users/updateAvatar/` + name,
            headers: {
                "Authorization": `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            data: data
        };

        axios(config)
            .then(function (response) {
                setSelectedImageUrl(newImageUrl);
                updateGlobalAvatar(newImageUrl);
            })
            .catch(function (error) {
                console.log(error);
            });
        //location.reload(); refresh la page mais c'est pas le mieux je pense
    };


    const handleAfficherAvatar = (newImageUrl) => {
        Howler.volume(0.1);
        soundHover.play();
        setShowPopup(true);
    };
    const handleClosePopup = () => {
        setShowPopup(false);
    };

    //useEffect recupere les info du compte au chargement de la page
    useEffect(() => {
        var config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://echec.herokuapp.com/users/' + name,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        axios(config)
            .then(function (response) {
                setDataCompte(response.data);
                setSelectedImageUrl(response.data.imageProfil);
            })
            .catch(function (error) {
                console.log(error);
            });
    }, []);

    //recupere le elo dans chaque exo du joueur

    //recupere les info des exercices au chargement de la page
    useEffect(() => {
        var config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://echec.herokuapp.com/exercises',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        axios(config)
            .then(response => {
                setDataExos(response.data);
                setNbExo(response.data.length);
            })
            .catch(error => {
                console.log(error);
            });
    }, []);

    //recupere le elo max de chaque exercices
    useEffect(() => {
        const fetchElo = async () => {
            const EloPromises = [];
            const EloJoueur = [];

            for (let i = 1; i <= nbExo; i++) {
                var config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: 'https://echec.herokuapp.com/levels/maxElo/' + i,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                EloPromises.push(axios(config));
            }
            const EloResponses = await Promise.all(EloPromises);

            const EloProvisoire = EloResponses.map(response => response.data.eloMax);
            setDataElo(EloProvisoire);

            for (let i = 1; i <= nbExo; i++) {
                var config2 = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: 'https://echec.herokuapp.com/eloExercise/elo/' + name + '/' + i,
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                };
                EloJoueur.push(axios(config2));
            }
            const EloJoueurRep = await Promise.all(EloJoueur);

            const EloJoueurProvisoire = EloJoueurRep.map(response => response.data.exerciceElo);
            setDataEloJoueur(EloJoueurProvisoire);
        };

        fetchElo();
    }, [nbExo]);

    /*fonction qui gere si l'elo dans une exercice n'est pas renseigné:
        (retourne 0 si oui sinon la valeur)*/
    function eloUndefined(elo) {
        if (elo === undefined) {
            return 0;
        } else { return elo }
    };


    return (
        <div className="comptePage">
            <h1 className="name_display">{name}</h1>
            <AvatarCompte
                imageProfil={selectedImageUrl}
                handleAfficherAvatar={handleAfficherAvatar}
                setShowPopup={setShowPopup}
            />
            <h1>
                <FontAwesomeIcon icon={whitePawn} size="lg" />
                {" " + eloUndefined(dataCompte.global_elo) + " "}
                points <FontAwesomeIcon icon={whitePawn} size="lg" />
            </h1>
            {showPopup && (
                <div className="avatar-popup" onClick={handleClosePopup}>
                    {imageList.map((url) => (
                        <Avatar
                            key={url}
                            className="avatar-thumbnail"
                            src={url}
                            alt="Avatar"
                            size="100"
                            round={true}
                            onClick={() => handleImageChange(url)}
                            onMouseEnter={handlePieceHover}
                        />
                    ))}
                </div>)}
            <button className="bouton-3D-red"
                onClick={() => {
                    Howler.volume(0.3);
                    soundUp.play();
                    navigate('/selectionExercices');
                }}
                onMouseEnter={() => handlePieceHover()}
                onMouseDown={() => handlePieceDown()}>
                <span className="texte-3D-red"> {/* Retourne à la page précédente */}
                    ← Retour
                </span>
            </button>
            <div className="image-container-compte">
                <h1 className="titre">Progression :</h1>
                {dataExos.map((exercice) => (
                    <div className="img-wrapper-compte" key={exercice.id}>
                        <img
                            className="imgExo-compte"
                            src={`${exercice.image}`}
                            alt={`Exercice ${exercice.id}`}
                            onClick={() => handleExerciceClick(exercice)}
                            onMouseEnter={() => handlePieceHover()}
                        />
                        <div className="nomxp-div">
                            <div className="barxp-div">
                                <ProgressBar
                                    key={exercice.id}
                                    className="barxp"
                                    completed={eloUndefined(dataEloJoueur[exercice.id - 1])}
                                    customLabel={eloUndefined(dataEloJoueur[exercice.id - 1]) + ""}
                                    maxCompleted={dataElo[exercice.id - 1]}
                                    bgColor='#7e9d4e'
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <button className="bouton-3D-red deconnexion"
                title="Deconnexion"
                onMouseEnter={handlePieceHover}
                onMouseUp={handleLogout}
                onMouseDown={handlePieceDown}>
                <span className="texte-3D-red deconnexion">
                    Déconnexion
                </span>
            </button>
        </div>
    );
}
