import React from "react";
import './Notation.css';
import '../Exercices.css';
import '../../Components.css';
import { Chessboard } from 'react-chessboard';
import { Chess } from 'chess.js';
import axios from "axios";
import { decodeToken } from "react-jwt";
import { Stack } from '@mui/material';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Howl, Howler } from 'howler';

class Notation6 extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            inputValue: '',
            message: '',
            showCorrect: false,
            showIncorrect: false,
            coordonnees: false,
            selectedLanguage: 'fr',
            piecesLanguage: ['P', 'T', 'F', 'C', 'D', 'R'],
            coloredSquares: {},
            chess: new Chess()
        };
        // validation réponse
        this.pointsGagnes = props.pointsGagnes;
        this.pointsPerdus = props.pointsPerdus;
        this.points = 0;
        this.showedCoordonnees = false;

        // decode token
        const decoded = decodeToken(sessionStorage.token);
        this.name = decoded.name;

        this.nomPiece = '';
        this.pos = '';
        this.coups = [];
        this.realCoup = '';
        this.indexPiece = 0;
        this.idExercice = props.idExercice;
        this.couleurP = '#af80dc';
        this.couleurM = '#ff555f';

        this.positionPieceP = ``;
        this.positionPieceM = ``;
        this.positionPieceA = ``;

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
        this.pieceDrop = new Howl({
            src: ['/sons/wood.wav']
        });
    }

    componentDidMount() {
        this.genererPieceAleatoire();
        if (Math.random() < 0.5) {
            this.setState({ orientation: "black" });
        }
        this.monInputRef.current.focus();
    }

    genererPieceAleatoire() {
        const newChess = new Chess();
        this.coups = [];

        // reset les variables
        this.languageCoup = '';
        this.realCoup = '';
        this.showedCoordonnees = false;
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
        const listePieceInitiale = {
            p: 'pion',
            b: 'fou',
            n: 'cavalier',
            r: 'tour',
            q: 'dame',
            k: 'roi',
        }

        // Choisi entre coup avec x et coup sans x
        let nbCoups = 0;
        let proba = Math.random();
        let coups = '';
        let verboseCoups = '';
        let index = 0;
        if (proba < 0.2) { // coup avec sans x
            nbCoups = Math.floor(Math.random() * 15) + 4;
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
        else if (proba >= 0.2 && proba < 0.6) { // coup avec x
            nbCoups = Math.floor(Math.random() * 10) + 4;
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
        else { // echec ou mat
            nbCoups = Math.floor(Math.random() * 10) + 4;
            for (let i = 0; i < nbCoups; i++) {
                const coups = newChess.moves();
                newChess.move(coups[Math.floor(Math.random() * coups.length)]);
            }
            let listeCoups = newChess.moves();

            while (!listeCoups.some(coup => coup.includes("+") || coup.includes("#"))) {
                newChess.move(listeCoups[Math.floor(Math.random() * listeCoups.length)]);
                nbCoups++;
                listeCoups = newChess.moves();
            }

            coups = newChess.moves();
            verboseCoups = newChess.moves({ verbose: true });
            const coupAvecPlusOuDiese = coups.find(coup => /[+#]/.test(coup));
            index = coups.indexOf(coupAvecPlusOuDiese);
        }

        if (nbCoups % 2 === 0) {
            this.setState({ orientation: "white" });
        }
        else {
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

        this.nomPiece = listePieceInitiale[verboseCoup.piece];

        this.setState({
            chess: newChess, coloredSquares: {
                [this.caseOrigine]: { backgroundColor: this.couleurP },
                [this.caseDestination]: { backgroundColor: this.couleurM },
            },
        });

        // deplacement
        setTimeout(() => {
            Howler.volume(1);
            const { chess } = this.state;
            chess.move(this.realCoup);

            this.setState({ chess: chess });
            this.pieceDrop.play();
        }, 1000);
    }

    // handles

    handleInputChange = (event) => {
        this.setState({ inputValue: event.target.value });
    };

    handleKeyPress = (event) => {
        if (this.state.inputValue.length >= 2) {
            if (event.key === "Enter") {
                // Appeler la fonction de vérification
                this.handleClick();
            }
        }
    }

    // sons
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
            this.showedCoordonnees = true;
            this.setState({ coordonnees: true });
        }
        else {
            this.switchOn.play();
            this.setState({ coordonnees: false });
        }
    }

    handleClickNouveau = () => {
        Howler.volume(0.3);
        this.soundUp.play();
        this.setState({ showCorrect: false, showIncorrect: false, message: '' });
        this.genererPieceAleatoire();
    };

    handleClick = () => {
        Howler.volume(0.3);
        this.soundUp.play();
        const { inputValue } = this.state;
        if (inputValue === this.languageCoup || (this.piece === 'P' && inputValue === 'P' + this.languageCoup)) {
            Howler.volume(0.2);
            this.soundWin.play();
            this.points = this.pointsGagnes;
            if (this.showedCoordonnees) {
                this.points = this.points / 2;
            }
            if (this.state.showIncorrect)
                this.points = 0;
            const text = `Bonne réponse ! Le coup est bien ${inputValue}, vous gagné ${this.points} points.`;
            this.setState({
                message: text,
                chess: this.state.chess,
                inputValue: '',
                showCorrect: true,
                showIncorrect: false
            });
            setTimeout(() => {
                this.setState({ showCorrect: false, showIncorrect: false, message: '' });

                if (this.points !== 0)
                    this.handleUpdate();

                this.genererPieceAleatoire();
            }, 3000); // Efface le message après 3 secondes
        }
        else {
            Howler.volume(0.3);
            this.soundWrong.play();
            let text = `Mauvaise réponse ! Le coup était ${this.languageCoup}, vous perdez ${Math.min(this.props.exerciceElo, this.pointsPerdus)} points.`;
            this.points = -(Math.min(this.props.exerciceElo, this.pointsPerdus));
            this.setState({
                message: text,
                inputValue: '',
                showCorrect: false,
                showIncorrect: true
            });
            setTimeout(() => {
                this.handleUpdate();
            }, 1000);
        }
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

    handleClickReplay = () => {
        Howler.volume(0.3);
        this.soundUp.play();

        const { chess } = this.state;
        chess.undo();
        this.setState({ chess: chess, });

        setTimeout((deplacement) => {
            const { chess } = this.state;
            this.setState({ chess: chess, });
            chess.move(this.realCoup);
        }, 1000);
    }


    MaterialUISwitch = styled(Switch)(({ disabled }) => ({
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
                            />}
                            label={
                                this.state.orientation === 'white' ? 'Coté Blancs' : 'Coté Noirs'
                            }
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
                    </div>
                    <Chessboard
                        key="board"
                        position={this.state.chess.fen()}
                        arePiecesDraggable={false}
                        customSquareStyles={this.state.coloredSquares}
                        boardOrientation={this.state.orientation}
                        showBoardNotation={this.state.coordonnees}
                        animationDuration={300}
                    />
                </div>
                <div className="elements-droite">
                    <i className="consigne">
                        Ecrivez le coup réalisé par <span style={{ color: `${this.couleurP}` }}> {this.nomPiece}
                        </span>
                    </i>
                    <div className="boutons">
                        <div className="groupe-butons" >
                            {this.state.piecesLanguage.map((line, index) => { // pion tour fou cavalier dame roi
                                if (index !== 0) {
                                    return (
                                        <button className={`pushable ${(index % 2) ? 'pushable-clair' : 'pushable-fonce'}`}
                                            key={line}
                                            title={piecesBlanchesNom[index]}
                                            onMouseEnter={() => this.handlePieceHover()}
                                            onMouseUp={() => this.handlePieceUp(this.state.piecesLanguage[index])}
                                            onMouseDown={() => this.handlePieceDown()}>
                                            <span className={`front ${(index % 2) ? 'fronts-clair' : 'fronts-fonce'}`}>
                                                {line}
                                            </span>
                                        </button>
                                    )
                                }
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
                    </div>
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
                                onClick={this.handleClearButtonClick}>
                                <span className="texte-3D-red">
                                    ✘
                                </span>
                            </button>
                        </Stack>

                        <Stack className="stack" spacing={2} direction="row" alignItems="center">
                            <button className="bouton-3D"
                                title="Valider"
                                {...(this.state.inputValue.length < 2 && { disabled: true })}
                                onMouseEnter={() => this.handlePieceHover()}
                                onMouseUp={this.handleClick}
                                onMouseDown={() => this.handlePieceDown()}>
                                <span className="texte-3D">
                                    Valider
                                </span>
                            </button>
                            <button className="bouton-3D button-replay"
                                title="Refaire"
                                onMouseEnter={() => this.handlePieceHover()}
                                onMouseUp={this.handleClickReplay}
                                onMouseDown={() => this.handlePieceDown()}>
                                <span className="texte-3D texte-replay">
                                    Rejouer
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

export default Notation6;