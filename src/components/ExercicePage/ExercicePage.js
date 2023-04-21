import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, useLocation } from 'react-router-dom';
import "../Components.css"
import "./ExercicePage.css"
import { Howl, Howler } from 'howler';
import { decodeToken } from "react-jwt";
import ProgressBar from "@ramonak/react-progress-bar";

export default function ExercicePage() {
    const [dataLevels, setDataLevels] = useState([]);
    const [dataEloJoueur, setDataEloJoueur] = useState();
    const [dataUnlock, setDataUnlock] = useState([]);
    const [maxElo, setMaxElo] = useState();
    let listLevels;
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();
    const location = useLocation();
    const exercice = location.state.exercice;
    const exerciceId = exercice.id;
    const exerciceIndex = location.state.index;
    const decoded = decodeToken(sessionStorage.token);
    const name = decoded.name;
    const soundHover = new Howl({
        src: ['/sons/hover.mp3']
    });
    const soundDown = new Howl({
        src: ['/sons/clicdown.wav']
    });
    const soundUp = new Howl({
        src: ['/sons/clicup.wav']
    });

    //fonction pour les boutons 
    const handleLevelClick = (index) => {
        Howler.volume(0.3);
        soundUp.play();
        listLevels = dataLevels
        navigate('/niveaux', { state: { exercice: exercice, exerciceIndex: exerciceIndex, index: index, nxtLevel: dataLevels[index], dataLevels: listLevels } });
    };

    const handlePieceHover = () => {
        Howler.volume(0.1);
        soundHover.play();
    };

    const handlePieceDown = () => {
        Howler.volume(0.3);
        soundDown.play();
    };


    //useEffect recupere les info de chaques levels au chargement de la page
    useEffect(() => {
        var config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://echec.herokuapp.com/levels/allLevels/' + exerciceId,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        axios(config)
            .then(function (response) {
                setDataLevels(response.data.sort((a, b) => a.id - b.id));
                setMaxElo(response.data[(response.data.length) - 1].required_elo);
            })
            .catch(function (error) {
                console.log(error);
            });
    }, []);


    //recupere le elo du joueur dans cet exercie 
    useEffect(() => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://echec.herokuapp.com/eloExercise/elo/' + name + "/" + exerciceId,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        axios.request(config)
            .then((response) => {
                setDataEloJoueur(response.data.exerciceElo);
            })
            .catch((error) => {
                console.log(error);
            });
    }, [])

    //recupere la list des niveaux debloquées
    useEffect(() => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'https://echec.herokuapp.com/unlockLevel/' + name,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        axios.request(config)
            .then((response) => {
                setDataUnlock(response.data.map(obj => obj.id_level));
            })
            .catch((error) => {
                console.log(error);
            });
    }, [])


    //fonction qui vérifie si tu as l'élo requis pour acceder aux niveaux
    function eloRequired(id) {
        return dataUnlock.includes(id);
    }

    /*fonction qui gere si l'elo dans une exercice n'est pas renseigné:
        (retourne 0 si oui sinon la valeur)*/
    function eloUndefined(elo) {
        if (elo === undefined) {
            return 0;
        } else { return elo }
    };

    return (
        <div className="exercice-page">
            <h1 className="exercice-title">
                {exercice.name}
            </h1>
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
            <p className="exercice-description" dangerouslySetInnerHTML={{__html: exercice.description}}></p>
            <div className="barxp-div-exo">
                <p className="progression-xp">Progression:</p>
                <ProgressBar
                    className="barxp"
                    completed={eloUndefined(dataEloJoueur)}
                    customLabel={eloUndefined(dataEloJoueur) + ""}
                    maxCompleted={maxElo}
                    bgColor='#7e9d4e'
                />
            </div>
            <div className="levels-container">
                <div className="level-title-header">
                    <div className="level-title container1">Niveaux </div>
                    <div className="level-title container2">Description </div>
                    <div className="level-title container3">Élo requis</div>
                </div>
                {dataLevels.map((level, index) => (
                    <React.Fragment key={level.id}>
                        <div className="level-row">
                            <div className="level-name-container container1">
                                <button className="bouton-3D"
                                    onClick={() => handleLevelClick((index + 1))}
                                    onMouseEnter={() => handlePieceHover()}
                                    onMouseDown={() => handlePieceDown()}
                                    disabled={!eloRequired(level.id)}>
                                    <span className="texte-3D"> {/* Retourne à la page précédente */}
                                        Niveau {index + 1}
                                    </span>
                                </button>
                                <div className="level-name"><strong> {level.name}</strong></div>
                            </div>
                            <div className="level-name-container container2">
                                <div className="level-description" dangerouslySetInnerHTML={{__html: level.rules}}></div>
                            </div>
                            <hr className="points_phone" />
                            <div className="level-name-container container3">
                                <div className="level-description"><i><b>{level.required_elo}</b> points requis</i></div>
                            </div>
                        </div>
                        {index !== dataLevels.length - 1 && (
                            <hr className="solid" />
                        )}
                    </React.Fragment>
                ))}
            </div>

        </div>
    );
};
