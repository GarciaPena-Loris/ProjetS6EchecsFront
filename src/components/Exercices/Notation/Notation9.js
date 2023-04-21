import React from "react";
import './Notation.css';
import '../../Components.css';
import '../Exercices.css';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import axios from "axios";
import { decodeToken } from "react-jwt";
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Howl, Howler } from 'howler';

class Notation9 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            message: '',
            showCorrect: false,
            showIncorrect: false,
            coordonnees: false,
            orientation: "white",
            selectedLanguage: 'fr',
            piecesLanguage: ['P', 'T', 'F', 'C', 'D', 'R'],
            rightClickedSquares: {},
            chess: new Chess()
        };
        this.couleurO = '#af80dc';
        this.couleurD = '#ff555f';

        // validation réponse
        this.pointsGagnes = props.pointsGagnes;
        this.pointsPerdus = props.pointsPerdus;
        this.points = 0;
        this.showedCoordonnes = false;

        // decode token
        const decoded = decodeToken(sessionStorage.token);
        this.name = decoded.name;

        this.realCoup = '';
        this.languageCoup = '';
        this.couleur = '';
        this.caseOrigine = '';
        this.caseDestination = '';
        this.idExercice = props.idExercice;

        this.soundHover = new Howl({
            src: ['/sons/hover.mp3']
        });
        this.soundDown = new Howl({
            src: ['/sons/clicdown.wav']
        });
        this.soundUp = new Howl({
            src: ['/sons/clicup.wav']
        });
        this.soundWin = new Howl({
            src: ['/sons/win.wav']
        });
        this.soundWrong = new Howl({
            src: ['/sons/wrong.wav']
        });
        this.switchOn = new Howl({
            src: ['/sons/switchOn.mp3']
        });
        this.switchOff = new Howl({
            src: ['/sons/switchOff.mp3']
        });
        this.pieceDrop = new Howl({
            src: ['/sons/wood.wav']
        });
    }

    componentDidMount() {
        this.genererPieceAleatoire();
    }

    genererPieceAleatoire() {
        const newChess = new Chess();

        // reset les variables
        this.languageCoup = '';
        this.couleur = '';
        this.realCoup = '';
        this.showHelp = false;
        this.caseOrigine = '';
        this.caseDestination = '';

        // effectuer un nombre aléatoire de coups aléatoires

        // recuperer un coup aléatoire
        const listePiecesLangue = {
            en: ['P', 'R', 'B', 'N', 'Q', 'K'],
            fr: ['P', 'T', 'F', 'C', 'D', 'R'],
            es: ['P', 'T', 'A', 'C', 'D', 'R'],
            de: ['B', 'S', 'L', 'T', 'D', 'K'],
            it: ['P', 'T', 'A', 'C', 'D', 'R'],
            ru: ['П', 'К', 'С', 'Л', 'Ф', 'Кр'],
            cn: ['卒', '马', '象', '车', '后', '帅'],
        }

        // Choisi entre coup avec x et coup sans x
        let nbCoups = 0;
        let x = Math.floor(Math.random() * 2);
        let coups = '';
        let verboseCoups = '';
        let index = 0;
        if (x === 0) { // coup avec sans x
            nbCoups = Math.floor(Math.random() * 15) + 6;
            for (let i = 0; i < nbCoups; i++) {
                const coups = newChess.moves();
                let coup = '';
                do {
                    coup = coups[Math.floor(Math.random() * coups.length)];
                }
                while (coup.includes('x'));
                newChess.move(coup);
            }

            coups = newChess.moves();
            verboseCoups = newChess.moves({ verbose: true });
            index = Math.floor(Math.random() * coups.length);
        }
        else { // coup avec x
            nbCoups = Math.floor(Math.random() * 10) + 5;
            for (let i = 0; i < nbCoups; i++) {
                const coups = newChess.moves();
                newChess.move(coups[Math.floor(Math.random() * coups.length)]);
            }
            let listeCoups = newChess.moves();

            while (!listeCoups.some(coup => coup.includes("x"))) {
                newChess.move(listeCoups[Math.floor(Math.random() * listeCoups.length)]);
                nbCoups++;
                listeCoups = newChess.moves();
            }

            coups = newChess.moves();
            verboseCoups = newChess.moves({ verbose: true });
            const coupAvecX = coups.find(coup => coup.includes('x'));
            index = coups.indexOf(coupAvecX);
        }

        if (nbCoups % 2 === 0) {
            this.couleur = 'w';

            this.setState({ orientation: "white" });
        }
        else {
            this.couleur = 'b';

            this.setState({ orientation: "black" });
        }

        // Recupere un coup avev prise
        let coup = coups[index];
        let verboseCoup = verboseCoups[index];

        this.caseOrigine = verboseCoup.from;
        this.caseDestination = verboseCoup.to;
        this.realCoup = coup;

        if (coup.charAt(0) === coup.charAt(0).toUpperCase()) {
            const index = listePiecesLangue['en'].indexOf(coup.charAt(0));
            const piece = listePiecesLangue[this.state.selectedLanguage][index];

            this.languageCoup = piece + coup.slice(1);
        }
        else {
            this.languageCoup = coup;
        }

        this.setState({ chess: newChess });
    }

    // handles

    // sons
    handlePieceHover = () => {
        Howler.volume(0.1);
        this.soundHover.play();
    };

    handlePieceDown = () => {
        Howler.volume(0.3);
        this.soundDown.play();
    };

    handleCoordonnees = (event) => {
        Howler.volume(0.3);
        if (event.target.checked) {
            this.switchOff.play();
            this.showedCoordonnes = true;
            this.setState({ coordonnees: true });
        }
        else {
            this.switchOn.play();
            this.setState({ coordonnees: false });
        }
    }

    handleLanguageChange = (event) => {
        Howler.volume(0.3);
        this.soundUp.play();

        const listePiecesLangue = {
            en: ['P', 'R', 'B', 'N', 'Q', 'K'],
            fr: ['P', 'T', 'F', 'C', 'D', 'R'],
            es: ['P', 'T', 'A', 'C', 'D', 'R'],
            de: ['B', 'S', 'L', 'T', 'D', 'K'],
            it: ['P', 'T', 'A', 'C', 'D', 'R'],
            ru: ['П', 'К', 'С', 'Л', 'Ф', 'Кр'],
            cn: ['卒', '马', '象', '车', '后', '帅'],
        }
        if (this.realCoup.charAt(0) === this.realCoup.charAt(0).toUpperCase()) {
            const index = listePiecesLangue[this.state.selectedLanguage].indexOf(this.languageCoup.charAt(0));
            const piece = listePiecesLangue[event.target.value][index];

            this.languageCoup = piece + this.languageCoup.slice(1);
        }
        this.setState({ selectedLanguage: event.target.value, piecesLanguage: listePiecesLangue[event.target.value] });
    }


    handleUpdate = () => {
        try {
            // chiffre un code crypte du type id_level/name/eloExerciceActuel/newelo(- or +)
            const CryptoJS = require("crypto-js");
            const message = this.idExercice + "/" + this.name + "/" + this.props.exerciceElo + "/" + this.points;
            const encrypted = CryptoJS.AES.encrypt(message, process.env.REACT_APP_CRYPTO_SECRET).toString();

            const formData = {
                'points': this.points,
                'encrypted': encrypted
            };
            var config = {
                method: 'put',
                maxBodyLength: Infinity,
                url: `https://echec.herokuapp.com/unlockLevel/save/${this.name}/${this.idExercice}`,
                headers: {
                    'Authorization': `Bearer ${sessionStorage.token}`,
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                data: formData
            };
            axios(config)
                .then((response) => {
                    // maj de l'elo
                    this.props.setExerciceElo(response.data.newEloExercise);
                    this.props.updateGlobalElo(response.data.newEloUser);
                    this.props.getUnlockLevel();
                })
                .catch((error) => {
                    console.log(error);
                });
        } catch (error) {
            console.error(error);
        }
    }

    // verifier mouvements
    onDrop = (sourceSquare, targetSquare, piece) => {
        const { chess } = this.state;
        let coupJoue = '';
        let coupAEffectue = '';
        // si pas pion
        if (this.realCoup.charAt(0) === this.realCoup.charAt(0).toUpperCase()) {
            coupJoue = piece;
        }
        else if (this.realCoup.length > 2) { // si pion
            coupJoue = sourceSquare.charAt(0);
        }
        if (chess.get(targetSquare)) {
            coupJoue = coupJoue + 'x';
        }
        coupJoue = coupJoue + targetSquare
        if (this.realCoup.charAt(0) === this.realCoup.charAt(0).toUpperCase()) {
            coupAEffectue = this.couleur + this.realCoup.replace(/[+#]/g, "");
        }
        else {
            coupAEffectue = this.realCoup.replace(/[+#]/g, "");

        }

        // verif coup
        if (coupJoue === coupAEffectue) {
            Howler.volume(1);
            chess.move(this.realCoup);
            this.setState({ chess: chess });
            this.pieceDrop.play();

            setTimeout(() => {
                Howler.volume(0.2);
                this.soundWin.play();

                this.points = this.pointsGagnes;
                if (this.showedCoordonnes) {
                    this.points = this.points /2;
                }
                const text = `Bonne réponse ! Vous avez effecuté le bon mouvement, vous gagné ${this.points} points.`;
                this.setState({
                    message: text,
                    chess: chess,
                    showCorrect: true,
                    showIncorrect: false
                });

                setTimeout(() => {
                    this.showedCoordonnes = false;
                    this.setState({ showCorrect: false, showIncorrect: false, message: '', coordonnees: false, rightClickedSquares: {} });
                    this.handleUpdate();
                    this.genererPieceAleatoire();
                }, 2000); // Efface le message après 3 secondes
            }, 300); // Efface le message après 3 secondes
        }
        else {
            Howler.volume(0.2);
            this.soundWrong.play();
            let text = `Mauvaise réponse ! Vous perdez ${Math.min(this.props.exerciceElo, this.pointsPerdus)} points. 
            Une aide s'affichent sur le plateau.`;
            this.points = -(Math.min(this.props.exerciceElo, this.pointsPerdus));
            this.setState({
                message: text,
                showCorrect: false,
                showIncorrect: true
            });

            setTimeout(() => {
                this.handleUpdate();
                this.setState({
                    coordonnees: true,
                    rightClickedSquares: {
                        [this.caseOrigine]: { backgroundColor: this.couleurO },
                        [this.caseDestination]: { backgroundColor: this.couleurD },
                    },
                });


                this.setState({ showCorrect: false, showIncorrect: false, message: '' });
            }, 2500); // Supprime le message après 3 secondes
        }

    }

    onSquareRightClick = (square) => {
        const colour = "rgba(0, 0, 255, 0.4)";
        this.setState(prevState => {
            const newRightClickedSquares = {
                ...prevState.rightClickedSquares,
                [square]:
                    prevState.rightClickedSquares[square] &&
                        prevState.rightClickedSquares[square].backgroundColor === colour
                        ? undefined
                        : { backgroundColor: colour }
            };

            return { rightClickedSquares: newRightClickedSquares };
        });
    }

    Android12Switch = styled(Switch)(({ theme, disabled }) => ({
        padding: 8,
        cursor: disabled ? 'not-allowed' : 'pointer', // ajout de la propriété cursor
        '& .MuiSwitch-track': {
            borderRadius: 22 / 2,
            '&:before, &:after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                transform: 'translateY(-50%)',
                width: 16,
                height: 16,
            },
            '&:before': {
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
                    theme.palette.getContrastText(theme.palette.primary.main),
                )}" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"/></svg>')`,
                left: 12,
            },
            '&:after': {
                backgroundImage: `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" height="16" width="16" viewBox="0 0 24 24"><path fill="${encodeURIComponent(
                    theme.palette.getContrastText(theme.palette.primary.main),
                )}" d="M19,13H5V11H19V13Z" /></svg>')`,
                right: 12,
            },
        },
        '& .MuiSwitch-thumb': {
            boxShadow: 'none',
            width: 16,
            height: 16,
            margin: 2,
        },
    }));
    theme = createTheme({
        palette: {
            secondary: {
                main: '#af80dc',
            },
        },
    });

    render() {
        return (
            <div className="container-general">
                <div className="plateau-gauche">
                    <div className="option">
                        {this.state.orientation === 'white' ?
                            <h3><i>Trait aux <b>Blancs</b> </i></h3> :
                            <h3><i>Trait aux <b>Noirs</b> </i></h3>
                        }
                        <ThemeProvider theme={this.theme}>
                            <FormControlLabel
                                control={<this.Android12Switch
                                    checked={this.state.coordonnees === true}
                                    color="secondary"
                                />}
                                label={'Coordonnées'}
                                onChange={this.handleCoordonnees}
                                style={{
                                    textDecoration: this.state.coordonnees === false && 'line-through'
                                }}
                            />
                        </ThemeProvider>
                    </div>
                    <Chessboard
                        key="board"
                        position={this.state.chess.fen()}
                        boardOrientation={this.state.orientation}
                        showBoardNotation={this.state.coordonnees}
                        animationDuration={800}
                        onSquareRightClick={this.onSquareRightClick}
                        customSquareStyles={this.state.rightClickedSquares}
                        onPieceDrop={this.onDrop}
                    />
                </div>
                <div className="elements-droite">
                    <i className="consigne">
                        Faites le coup <span style={{ color: `${this.couleurO}` }}> {this.languageCoup} </span>
                        <select className="language-selector" value={this.state.selectedLanguage} onMouseDown={() => this.handlePieceDown()} onChange={this.handleLanguageChange}>
                            <option value="fr">🇫🇷</option>
                            <option value="en">🇬🇧</option>
                            <option value="es">🇪🇸</option>
                            <option value="de">🇩🇪</option>
                            <option value="it">🇮🇹</option>
                            <option value="ru">🇷🇺</option>
                            <option value="cn">🇨🇳</option>
                        </select>
                    </i>
                    <div className={`response ${this.state.showCorrect ? 'show' : this.state.showIncorrect ? 'show incorrect' : ''}`}>
                        {this.state.message}
                    </div>
                </div>
            </div>
        );
    }
}

export default Notation9;