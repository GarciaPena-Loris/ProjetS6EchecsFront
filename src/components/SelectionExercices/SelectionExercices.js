import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from 'react-router-dom';
import "../Components.css"
import "./SelectionExercices.css"
import { Howl, Howler } from 'howler';

export default function SelectionExercices() {
    const [dataExo, setDataExo] = useState([]);
    const token = sessionStorage.getItem('token');
    const navigate = useNavigate();

    const handleExerciceClick = (exercice, index) => {
        Howler.volume(0.3);
        soundUp.play();
        navigate('/exercices', { state: { exercice: exercice, index: index } });
    };

    // son boutons
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

    //useEffect recupere les info de chaques exercices au chargement de la page
    useEffect(() => {
        var config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://localhost:3001/exercises',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };
        axios(config)
            .then(response => {
                setDataExo(response.data);
            })
            .catch(error => {
                console.log(error);
            });
    }, [token]);

    return (
        <div className="selection-exercice-container">
            <h1> Selectionnez un exercice :</h1>
            <div className="image-container">
                {dataExo.map((exercice, index) => (
                    <div className="img-wrapper" key={exercice.id}>
                        <img
                            className="imgExo"
                            src={`${exercice.image}`}
                            alt={`Exercice ${exercice.id}`}
                            onClick={() => handleExerciceClick(exercice, (index+1))}
                            onMouseEnter={() => handlePieceHover()}
                        />
                        <p className="exo-name">{exercice.name}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
