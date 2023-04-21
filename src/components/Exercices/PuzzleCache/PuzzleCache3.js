import React from "react";
import './PuzzleCache.css';
import '../Exercices.css';
import '../../Components.css';
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import FormControlLabel from '@mui/material/FormControlLabel';
import { decodeToken } from "react-jwt";
import { Stack } from '@mui/material';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { Howl, Howler } from 'howler';
import Slider from '@mui/material/Slider';
import Typography from '@mui/material/Typography';

// validation réponse
import axios from "axios";

class PuzzleCache3 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
            message: '',
            showCorrect: false,
            showIncorrect: false,
            orientation: "white",
            coordonnees: true,
            selectedLanguage: 'fr',
            piecesLanguage: ['P', 'T', 'F', 'C', 'D', 'R'],
            coloredSquares: {},
            chess: new Chess(),
            timerInterval: 1,
        };

        // validation réponse
        this.pointsGagne = props.pointsGagnes;
        this.pointsPerdu = props.pointsPerdus;
        this.points = 0;

        this.listePiecesLangue = {
            en: ['P', 'R', 'B', 'N', 'Q', 'K'],
            fr: ['P', 'T', 'F', 'C', 'D', 'R'],
            es: ['P', 'T', 'A', 'C', 'D', 'R'],
            de: ['B', 'S', 'L', 'T', 'D', 'K'],
            it: ['P', 'T', 'A', 'C', 'D', 'R'],
            ru: ['П', 'К', 'С', 'Л', 'Ф', 'Кр'],
            cn: ['卒', '马', '象', '车', '后', '帅'],
        }
        this.showPiece = false;

        this.coup = '';
        this.languageCoup = '';
        this.text = 'Deplacement en cours...';
        this.option = '';
        this.piece1 = '';
        this.piece2 = '';

        this.idExercice = props.idExercice;
        this.couleurP = '#af80dc';
        this.couleurM = '#ff555f';
        this.historicMove = [];
        this.pieceMangee = false;
        this.nbCoupAFaire = 16;
        if (Math.random() < 0.5) {
            this.nbCoupAFaire++;
        }
        this.nbCoupEffecutes = 0;
        this.interval = 0;
        this.intervalRefaire = 0;
        this.currentIndexRejouer = this.nbCoupAFaire;

        // decode token
        const decoded = decodeToken(sessionStorage.token);
        this.name = decoded.name;

        this.monInputRef = React.createRef();

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

        this.handleSliderChange = this.handleSliderChange.bind(this);
    }

    componentDidMount() {
        this.genererMouvement();
    }

    componentWillUnmount() {
        clearInterval(this.interval);
        clearInterval(this.intervalRefaire);
    }

    faireCoups = (newChess) => {
        this.interval = setInterval(() => {
            let possibleMoves = newChess.moves();
            let possibleXMoves = possibleMoves.filter(element => element.includes("x") && !element.includes("+") && !element.includes("#"));
            if (possibleXMoves.length >= 1) {
                possibleMoves = possibleXMoves;
            }
            const randomIndex = Math.floor(Math.random() * possibleMoves.length);

            newChess.move(possibleMoves[randomIndex]);
            this.historicMove.push(possibleMoves[randomIndex]);
            this.setState({ chess: newChess });
            this.nbCoupEffecutes++;
            if (this.nbCoupEffecutes >= this.nbCoupAFaire && (possibleMoves.some(coup => coup.includes("x")) && possibleMoves.filter(coup => coup.includes("x")).every(coup => !coup.includes("+") && !coup.includes("#")))) {
                clearInterval(this.interval);
                const coupUndo = newChess.undo();
                this.setState({ chess: newChess });
                this.definirCoup(coupUndo);
                return;
            }

        }, 1000 / this.state.timerInterval);
    }

    genererMouvement = async () => {
        const newChess = new Chess();
        this.setState({ chess: newChess });

        this.faireCoups(newChess);
    };

    definirCoup = (coupUndo) => {
        // Apres les coups
        if (coupUndo.color === "w") {
            this.text = 'Ecrivez la pièce  en ';
            this.option = " 'x' la pièce prise en ";
            this.coup = coupUndo.san;
            this.piece1 = coupUndo.from;
            this.piece2 = coupUndo.to;

            this.setState({
                coloredSquares: {
                    [this.piece1]: { backgroundColor: this.couleurP },
                    [this.piece2]: { backgroundColor: this.couleurM },
                },
            });

            this.languageCoup = this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue['en'].indexOf(coupUndo.piece.toUpperCase())]
                + "x" +
                this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue['en'].indexOf(coupUndo.captured.toUpperCase())];

        }
        else {
            this.text = 'Ecrivez la piece qui va être prise en  ';
            this.piece1 = coupUndo.to;
            const piece = coupUndo.captured;
            this.coup = coupUndo.san;

            const indexPiece = this.listePiecesLangue['en'].indexOf(piece.toUpperCase());
            this.languageCoup = this.listePiecesLangue[this.state.selectedLanguage][indexPiece];
            this.pieceMangee = true;

            this.setState({
                coloredSquares: {
                    [this.piece1]: { backgroundColor: this.couleurM },
                },
            });
        }
    }

    //#region Rejouer coup  
    rejouer = (event) => {
        this.setState({ chess: new Chess() });
        this.currentIndexRejouer = 0;
        clearInterval(this.intervalRefaire);
        this.refaireCoup();
    };

    refaireCoup = () => {
        this.intervalRefaire = setInterval(() => {
            if (this.currentIndexRejouer < this.historicMove.length - 1) {
                this.state.chess.move(this.historicMove[this.currentIndexRejouer]);
                this.setState({ chess: this.state.chess });
                this.currentIndexRejouer++;
            } else {
                clearInterval(this.intervalRefaire);
            }

        }, 1000 / this.state.timerInterval);
    }
    //#endregion

    // handles

    handleInputChange = (event) => {
        this.setState({ inputValue: event.target.value });
    };

    handleKeyPress = (event) => {
        if (this.state.inputValue.length >= 1) {
            if (event.key === "Enter") {
                // Appeler la fonction de vérification
                this.handleClick();
            }
        }
    }

    handleSliderChange = (event, newValue) => {
        this.setState({ timerInterval: newValue }, async () => {
            if (this.nbCoupEffecutes < this.nbCoupAFaire) {
                clearInterval(this.interval);
                this.faireCoups(this.state.chess);
            }
            else if (this.currentIndexRejouer < this.nbCoupAFaire) {
                clearInterval(this.intervalRefaire);
                this.refaireCoup();
            }
        });
    }

    handleClearButtonClick = () => {
        Howler.volume(0.3);
        this.soundUp.play();
        this.setState({ inputValue: '' });
    };

    handlePieceHover = () => {
        Howler.volume(0.1);
        this.soundHover.play();
    };

    handlePieceUp = (event) => {
        Howler.volume(0.3);
        this.soundUp.play();
        this.setState({ inputValue: this.state.inputValue + event });
        this.monInputRef.current.focus();
    };

    handlePieceDown = () => {
        Howler.volume(0.3);
        this.soundDown.play();
    };

    handleClickNouveau = () => {
        Howler.volume(0.3);
        this.soundUp.play();
        this.text = 'Deplacement en cours...';
        this.setState({ showCorrect: false, showIncorrect: false, message: '', coloredSquares: {} });
        this.genererMouvement();
    };


    handleOrientation = (event) => {
        Howler.volume(0.3);
        if (event.target.checked) {
            this.switchOff.play();
            this.setState({ orientation: 'white' });
        }
        else {
            this.switchOn.play();
            this.setState({ orientation: 'black' });
        }
    }

    handleCoordonnees = (event) => {
        Howler.volume(0.3);
        if (event.target.checked) {
            this.switchOff.play();
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

        if (this.pieceMangee) {
            this.languageCoup = this.listePiecesLangue[event.target.value][this.listePiecesLangue[this.state.selectedLanguage].indexOf(this.languageCoup.charAt(0))];
        }
        else {
            this.languageCoup = this.listePiecesLangue[event.target.value][this.listePiecesLangue[this.state.selectedLanguage].indexOf(this.languageCoup.charAt(0))]
                + "x" +
                this.listePiecesLangue[event.target.value][this.listePiecesLangue[this.state.selectedLanguage].indexOf(this.languageCoup.charAt(2))];
        }
        this.setState({ selectedLanguage: event.target.value, piecesLanguage: this.listePiecesLangue[event.target.value] });
    }

    resetVariable = () => {
        clearInterval(this.intervalRefaire);
        clearInterval(this.intervalRefaire);
        this.showPiece = false;
        this.text = 'Deplacement en cours...';
        this.option = '';
        this.piece1 = '';
        this.piece2 = '';
        this.historicMove = [];
        this.pieceMangee = false;
        this.nbCoupAFaire = 16;
        if (Math.random() < 0.5) {
            this.nbCoupAFaire++;
        }
        this.nbCoupEffecutes = 0;
        this.interval = 0;
        this.intervalRefaire = 0;
        this.currentIndexRejouer = this.nbCoupAFaire;

        this.setState({
            showCorrect: false,
            showIncorrect: false,
            message: '',
            coloredSquares: {},
        })
    }

    handleClick = () => {
        Howler.volume(0.3);
        this.soundUp.play();
        const { inputValue, chess } = this.state;

        if (inputValue === this.languageCoup) {
            Howler.volume(0.5);
            this.soundWin.play();
            const message = `Bonne réponse ! La réponse était bien ${inputValue}. Vous gagné ${this.pointsGagne} points.`;
            this.points = this.pointsGagne;
            this.setState({
                message: message,
                inputValue: '',
                chess: chess,
                showCorrect: true,
                showIncorrect: false
            });
            chess.move(this.coup);

            setTimeout(() => {
                this.resetVariable();

                this.handleUpdate();
                this.genererMouvement();
            }, 3000); // Génerer le plateau 3 secondes
        }
        else {
            Howler.volume(0.3);
            this.soundWrong.play();
            let message = '';
            if (this.props.exerciceElo <= 0) {
                message = `Mauvaise réponse ! Vous perdez 0 points. 
                Les pièce se dévoile. Tentez une autre réponse.`;
                this.points = 0;
            }
            else {
                message = `Mauvaise réponse ! Vous perdez ${this.pointsPerdu} points. 
                Les pièce se dévoile. Tentez une autre réponse.`;
                this.points = -(this.pointsPerdu);
            }
            this.setState({
                message: message,
                inputValue: '',
                chess: chess,
                showCorrect: false,
                showIncorrect: true
            });
            setTimeout(() => {
                this.showPiece = true;
                this.handleUpdate();
            }, 2000);
        }
    }

    handleUpdate = () => {
        try {
            // chiffre un code crypte du type idExercice/name/eloExerciceActuel/newelo(- or +)
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

    customPieces = () => {
        if (!this.showPiece) {
            const piecesBlanche = ["wN", "wB", "wR", "wQ", "wK", "wP"];
            const piecesNoire = ["bN", "bB", "bR", "bQ", "bK", "bP"];
            const returnPieces = {};
            piecesBlanche.map((p) => {
                returnPieces[p] = ({ squareWidth }) => (
                    <img src="https://i.imgur.com/Br9K7hP.png" alt="piece" style={{ width: squareWidth, height: squareWidth }}></img>
                );
                return null;
            });
            piecesNoire.map((p) => {
                returnPieces[p] = ({ squareWidth }) => (
                    <img src="https://i.imgur.com/DqZkC4h.png" alt="pions" style={{ width: squareWidth, height: squareWidth }}></img>
                );
                return null;
            });
            return returnPieces;
        }
    };

    MaterialUISwitch = styled(Switch)(({ theme, disabled }) => ({
        width: 62,
        height: 34,
        padding: 7,
        cursor: disabled ? 'not-allowed' : 'pointer', // ajout de la propriété cursor
        '& .MuiSwitch-switchBase': {
            margin: 1,
            padding: 0,
            transform: 'translateX(6px)',
            '&.Mui-checked': {
                color: '#fff',
                transform: 'translateX(22px)',
                '& .MuiSwitch-thumb:before': {
                    backgroundColor: "white",
                    borderRadius: '50%',
                },
                '& + .MuiSwitch-track': {
                    opacity: 1,
                    backgroundColor: disabled ? 'rgba(255, 255, 255, 0.5)' : '#cccccc',
                },
            },
        },
        '& .MuiSwitch-thumb': {
            backgroundColor: '#001e3c',
            width: 32,
            height: 32,
            '&:before': {
                content: "''",
                position: 'absolute',
                width: '100%',
                height: '100%',
                left: 0,
                top: 0,
                backgroundRepeat: 'no-repeat',
                backgroundPosition: 'center',
                backgroundColor: disabled ? '#c7c7c7' : 'black',
                borderRadius: '50%',
            },
        },
        '& .Mui-disabled': {
            opacity: 0.5,
        },
    }));

    Android12Switch = styled(Switch)(({ theme }) => ({
        padding: 8,
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
        const piecesBlanchesNom = [
            "Pion", "Tour", "Fou", "Cavalier", "Dame", "Roi"
        ]
        let lignes = this.state.orientation === 'white'
            ? ["8", "7", "6", "5", "4", "3", "2", "1"]
            : ["1", "2", "3", "4", "5", "6", "7", "8"];
        let colonnes = this.state.orientation === 'white'
            ? ["a", "b", "c", "d", "e", "f", "g", "h"]
            : ["h", "g", "f", "e", "d", "c", "b", "a"];
        const custom = [
            "x", "O-O", "O-O-O", "=", "+", "#"
            // "x" pour la prise, "O-O" pour le petit roque, "O-O-O" pour le grand roque, 
            //"=" pour la promotion, "+" pour echec, "#" pour le mat
        ]
        const customCoup = [
            "prise", "petit roque", "grand roque", "promotion", "echec", "mat"
        ]
        return (
            <div className="container-general">
                <div className="plateau-gauche">
                    <div className="option">
                        <FormControlLabel
                            control={<this.MaterialUISwitch
                                checked={this.state.orientation === 'white'}
                                color="secondary"
                            />}
                            label={this.state.orientation === 'white' ? 'Coté Blancs' : 'Coté Noirs'}
                            onChange={this.handleOrientation}
                        />
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
                        <div className="slider">
                            <Typography id="input-slider" color="white" align="left">
                                Vitesse des pièces :
                            </Typography>
                            <Slider
                                aria-label="Timer"
                                defaultValue={1}
                                label={'Temps'}
                                valueLabelDisplay="auto"
                                step={0.1}
                                marks
                                min={0.1}
                                max={2}
                                color="secondary"
                                onChange={this.handleSliderChange}
                            />
                        </div>
                    </div>
                    <Chessboard
                        key="board"
                        position={this.state.chess.fen()}
                        arePiecesDraggable={false}
                        customPieces={this.customPieces()}
                        customSquareStyles={this.state.coloredSquares}
                        boardOrientation={this.state.orientation}
                        showBoardNotation={this.state.coordonnees}
                    />
                </div>
                <div className="elements-droite">
                    {this.piece2 ? <i className="consigne">
                        {this.text} <span style={{ color: `${this.couleurP}` }}> {this.piece1} </span> {this.option} <span style={{ color: `${this.couleurM}` }}> {this.piece2} </span>
                    </i>
                        :
                        <i className="consigne">
                            {this.text} <span style={{ color: `${this.couleurM}` }}> {this.piece1} </span>
                        </i>}
                    {this.pieceMangee ?
                        <div className="boutons">
                            <div className="groupe-butons" >
                                {this.state.piecesLanguage.map((line, index) => { // pion tour fou cavalier reine roi
                                    return (
                                        <button className={`pushable ${(index % 2) ? 'pushable-clair' : 'pushable-fonce'}`}
                                            key={piecesBlanchesNom[index]}
                                            title={piecesBlanchesNom[index]}
                                            onMouseEnter={() => this.handlePieceHover()}
                                            onMouseUp={() => this.handlePieceUp(this.state.piecesLanguage[index])}
                                            onMouseDown={() => this.handlePieceDown()}>
                                            <span className={`front ${(index % 2) ? 'fronts-clair' : 'fronts-fonce'}`}>
                                                {line}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        :
                        <div className="boutons">
                            <div className="groupe-butons" >
                                {this.state.piecesLanguage.map((line, index) => { // pion tour fou cavalier reine roi
                                    return (
                                        <button className={`pushable ${(index % 2) ? 'pushable-clair' : 'pushable-fonce'}`}
                                            key={piecesBlanchesNom[index]}
                                            title={piecesBlanchesNom[index]}
                                            onMouseEnter={() => this.handlePieceHover()}
                                            onMouseUp={() => this.handlePieceUp(this.state.piecesLanguage[index])}
                                            onMouseDown={() => this.handlePieceDown()}>
                                            <span className={`front ${(index % 2) ? 'fronts-clair' : 'fronts-fonce'}`}>
                                                {line}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="groupe-butons">
                                {colonnes.map((line, index) => { // a b c d e f g h
                                    return (
                                        <button className={`pushable ${(index % 2) ? 'pushable-clair' : 'pushable-fonce'}`}
                                            key={line}
                                            title={line}
                                            onMouseEnter={() => this.handlePieceHover()}
                                            onMouseUp={() => this.handlePieceUp(line)}
                                            onMouseDown={() => this.handlePieceDown()}>
                                            <span className={`front ${(index % 2) ? 'fronts-clair' : 'fronts-fonce'}`}>
                                                {line}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="groupe-butons" >
                                {lignes.map((line, index) => { // 1 2 3 4 5 6 7 8
                                    return (
                                        <button className={`pushable ${(index % 2) ? 'pushable-fonce' : 'pushable-clair'}`}
                                            key={line}
                                            title={line}
                                            onMouseEnter={() => this.handlePieceHover()}
                                            onMouseUp={() => this.handlePieceUp(line)}
                                            onMouseDown={() => this.handlePieceDown()}>
                                            <span className={`front ${(index % 2) ? 'fronts-fonce' : 'fronts-clair'}`}>
                                                {line}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                            <div className="groupe-butons" >
                                {custom.map((line, index) => { // x O-O O-O-O = e.p. +
                                    return (
                                        <button className={`pushable ${(index % 2) ? 'pushable-clair' : 'pushable-fonce'}`}
                                            key={line}
                                            title={customCoup[index]}
                                            onMouseEnter={() => this.handlePieceHover()}
                                            onMouseUp={() => this.handlePieceUp(line)}
                                            onMouseDown={() => this.handlePieceDown()}>
                                            <span className={`front custom ${(index % 2) ? 'fronts-clair' : 'fronts-fonce'}`}>
                                                {line}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>}
                    <div className="input">

                        <Stack spacing={2} direction="row" alignItems="center">
                            <select className="language-selector" value={this.state.selectedLanguage} onMouseDown={() => this.handlePieceDown()} onChange={this.handleLanguageChange}>
                                <option value="fr">🇫🇷</option>
                                <option value="en">🇬🇧</option>
                                <option value="es">🇪🇸</option>
                                <option value="de">🇩🇪</option>
                                <option value="it">🇮🇹</option>
                                <option value="ru">🇷🇺</option>
                                <option value="cn">🇨🇳</option>
                            </select>
                            <input className="reponse-input"
                                type="text"
                                placeholder="Réponse..."
                                value={this.state.inputValue}
                                onChange={this.handleInputChange}
                                onKeyDown={this.handleKeyPress}
                                ref={this.monInputRef} />
                            <button className="bouton-3D button-clean"
                                title="supprimer"
                                onMouseDown={() => this.handlePieceDown()}
                                onMouseEnter={() => this.handlePieceHover()}
                                onClick={this.handleClearButtonClick} >
                                <span className="texte-3D-red">
                                    ✘
                                </span>
                            </button>
                        </Stack>

                        <Stack className="stack" spacing={2} direction="row" alignItems="center">
                            <button className="bouton-3D"
                                title="Valider"
                                {...((this.state.inputValue.length < 1 || !this.piece1) && { disabled: true })}
                                onMouseEnter={() => this.handlePieceHover()}
                                onMouseUp={this.handleClick}
                                onMouseDown={() => this.handlePieceDown()}>
                                <span className="texte-3D">
                                    Valider
                                </span>
                            </button>
                            <button className="bouton-3D button-replay"
                                title="Refaire"
                                {...(!this.piece1 && { disabled: true })}
                                onMouseEnter={() => this.handlePieceHover()}
                                onClick={this.rejouer}
                                onMouseDown={() => this.handlePieceDown()}>
                                <span className="texte-3D texte-replay">
                                    Refaire
                                </span>
                            </button>
                            {this.state.showIncorrect && <button className="bouton-3D"
                                title="Rejouer"
                                onMouseEnter={() => this.handlePieceHover()}
                                onMouseUp={this.handleClickNouveau}
                                onMouseDown={() => this.handlePieceDown()}>
                                <span className="texte-3D">
                                    Rejouer ↺
                                </span>
                            </button>}
                        </Stack>
                    </div>
                    <div className={`response ${this.state.showCorrect ? 'show' : this.state.showIncorrect ? 'show incorrect' : ''}`}>
                        {this.state.message}
                    </div>
                </div>
            </div>
        );
    }
}

export default PuzzleCache3;