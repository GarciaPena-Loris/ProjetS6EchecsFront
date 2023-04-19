import { React, useState, useEffect, useContext } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import { decodeToken } from "react-jwt";
import { GlobalContext } from '../GlobalContext/GlobalContext';
import axios from "axios";
import { Howl, Howler } from 'howler';


import "./NiveauxPage.css"

// imporation des composants de chaque niveau
// Notation
import Notation1 from '../Exercices/Notation/Notation1';
import Notation2 from '../Exercices/Notation/Notation2';
import Notation3 from '../Exercices/Notation/Notation3';
import Notation4 from '../Exercices/Notation/Notation4';
import Notation5 from '../Exercices/Notation/Notation5';
import Notation6 from '../Exercices/Notation/Notation6';
import Notation7 from '../Exercices/Notation/Notation7';
import Notation8 from '../Exercices/Notation/Notation8';
import Notation9 from '../Exercices/Notation/Notation9';

// Bombes
import Bombe1 from '../Exercices/Bombe/Bombe1';
import Bombe2 from '../Exercices/Bombe/Bombe2';
import Bombe3 from '../Exercices/Bombe/Bombe3';
import Bombe4 from '../Exercices/Bombe/Bombe4';
import Bombe5 from '../Exercices/Bombe/Bombe5';

// Puzzle Cache
import PuzzleCache1 from '../Exercices/PuzzleCache/PuzzleCache1';
import PuzzleCache2 from '../Exercices/PuzzleCache/PuzzleCache2';
import PuzzleCache3 from '../Exercices/PuzzleCache/PuzzleCache3';
import PuzzleCache4 from '../Exercices/PuzzleCache/PuzzleCache4';

export default function NiveauxPage() {
    const [dataUnlock, setDataUnlock] = useState([]);
    const location = useLocation();
    const navigate = useNavigate();

    const exercice = location.state.exercice;
    const exerciceIndex = location.state.exerciceIndex;
    //const niveau = location.state.niveau;
    const index = location.state.index;
    const nxtLevel = location.state.nxtLevel;
    const dataLevels = location.state.dataLevels;
    const decoded = decodeToken(sessionStorage.token);
    const name = decoded.name;
    const [exerciceElo, setExerciceElo] = useState(null);
    const { updateGlobalElo } = useContext(GlobalContext); // Récupération de globalElo et setGlobalElo avec useContext
    const soundHover = new Howl({
        src: ['/sons/hover.mp3']
    });
    const soundDown = new Howl({
        src: ['/sons/clicdown.wav']
    });
    const soundUp = new Howl({
        src: ['/sons/clicup.wav']
    });

    useEffect(() => {
        async function setActualExerciceElo() {
            try {
                const decoded = decodeToken(sessionStorage.token);
                const name = decoded.name;
                // get elo
                var config = {
                    method: 'get',
                    maxBodyLength: Infinity,
                    url: `http://localhost:3001/eloExercise/elo/${name}/${exercice.id}`,
                    headers: {
                        'Authorization': `Bearer ${sessionStorage.token}`,
                        'Content-Type': 'application/x-www-form-urlencoded'
                    },
                };
                axios(config)
                    .then(function (response) {
                        setExerciceElo(response.data.exerciceElo);
                    })
                    .catch(function (error) {
                        console.log(error);
                    });
            }
            catch (error) {
                console.log(error);
            }
        }
        setActualExerciceElo();
    }, [exercice.id]);

    const getUnlockLevel = () => {
        let config = {
            method: 'get',
            maxBodyLength: Infinity,
            url: 'http://localhost:3001/unlockLevel/' + name,
            headers: {
                'Authorization': `Bearer ${sessionStorage.token}`
            }
        };

        axios.request(config)
            .then((response) => {
                setDataUnlock(response.data.map(obj => obj.id_level));
            })
            .catch((error) => {
                console.log(error);
            });
    }

    // recupere la list des niveaux debloquées
    useEffect(() => {
        getUnlockLevel();
    }, [])

    const sharedProps = {
        idExercice: exercice.id,
        exerciceElo,
        setExerciceElo,
        updateGlobalElo,
        getUnlockLevel,
        pointsGagnes: dataLevels[index - 1].won_points,
        pointsPerdus: dataLevels[index - 1].lost_points
    };

    // Créez une structure de données pour stocker les composants de chaque niveau
    const niveaux = {
        1: { // Notation
            1: <Notation1
                {...sharedProps}
            />,
            2: <Notation2
                {...sharedProps}
            />,
            3: <Notation3
                {...sharedProps}
            />,
            4: <Notation4
                {...sharedProps}
            />,
            5: <Notation5
                {...sharedProps}
            />,
            6: <Notation6
                {...sharedProps}
            />,
            7: <Notation7
                {...sharedProps}
            />,
            8: <Notation8
                {...sharedProps}
            />,
            9: <Notation9
                {...sharedProps}
            />,
            // etc...
        },
        2: { // Bombes
            1: <Bombe1
                {...sharedProps}
            />,
            2: <Bombe2
                {...sharedProps}
            />,
            3: <Bombe3
                {...sharedProps}
            />,
            4: <Bombe4
                {...sharedProps}
            />,
            5: <Bombe5
                {...sharedProps}
            />,
        },
        3: { // Puzzle Cache
            1: <PuzzleCache1
                {...sharedProps}
            />,
            2: <PuzzleCache2
                {...sharedProps}
            />,
            3: <PuzzleCache3
                {...sharedProps}
            />,
            4: <PuzzleCache4
                {...sharedProps}
            />,
        }  // etc...
    };

    const handlePieceHover = () => {
        Howler.volume(0.1);
        soundHover.play();
    };

    const handlePieceDown = () => {
        Howler.volume(0.3);
        soundDown.play();
    };

    const handleLevelClickSuivant = (index) => {
        Howler.volume(0.3);
        soundUp.play();
        navigate('/niveaux', { state: { exercice: exercice, exerciceIndex: exerciceIndex, index: index, nxtLevel: dataLevels[index], dataLevels: dataLevels } });
    };

    // Récupérez le composant à afficher en fonction des id
    let NiveauComponent = niveaux[exerciceIndex][index];

    return (
        <div className="level-container">
            <div className="level-header">
                <button className="bouton-3D-red"
                    onClick={() => {
                        Howler.volume(0.3);
                        soundUp.play();
                        navigate('/exercices', { state: { exercice: exercice, index: exerciceIndex } });
                    }}
                    title={"Choix des niveaux de " + exercice.name}
                    onMouseEnter={() => handlePieceHover()}
                    onMouseDown={() => handlePieceDown()}>
                    <span className="texte-3D-red"> {/* Retourne à la page précédente */}
                        ← Retour
                    </span>
                </button>
                <div className="level-label">{exercice.name} · <i>niveau {index}</i></div>
                <span className="level-elo"><b>{exerciceElo} points</b> pour cet exercice</span>
                {(index !== Object.keys(niveaux[exercice.id]).length) &&
                    <button className="bouton-3D"
                        onClick={() => handleLevelClickSuivant((index + 1))}
                        onMouseEnter={() => handlePieceHover()}
                        onMouseDown={() => handlePieceDown()}
                        title={"Niveau " + (index + 1) + " : " + nxtLevel.rules}
                        disabled={!dataUnlock.includes(nxtLevel.id)}>
                        <span className="texte-3D"> {/* Retourne à la page précédente */}
                            Suivant →
                        </span>
                    </button>}
            </div>
            {/* Affichez le composant récupéré */}
            <div className="level-jeux">
                {NiveauComponent}
            </div>
        </div>
    );
}