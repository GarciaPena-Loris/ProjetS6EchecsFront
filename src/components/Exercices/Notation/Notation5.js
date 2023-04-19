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


class Notation5 extends React.Component {
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
            chess: new Chess()
        };
        // validation réponse
        this.pointsGagnes = props.pointsGagnes;
        this.pointsPerdus = props.pointsPerdus;
        this.idExercice = props.idExercice;
        this.points = 0;

        // decode token
        const decoded = decodeToken(sessionStorage.token);
        this.name = decoded.name;

        this.couleurP = '#ff555f';
        this.couleurM = '#af80dc';
        this.coupChoisis = '';
        this.indexCoup = 0;
        this.nombreCoupsPossible = 0;
        this.couleur = '';
        this.pieceConcernee = '';
        this.realCoup = '';
        this.languageCoup = '';

        this.listePiecesLangue = {
            en: ['P', 'R', 'B', 'N', 'Q', 'K'],
            fr: ['P', 'T', 'F', 'C', 'D', 'R'],
            es: ['P', 'T', 'A', 'C', 'D', 'R'],
            de: ['B', 'S', 'L', 'T', 'D', 'K'],
            it: ['P', 'T', 'A', 'C', 'D', 'R'],
            ru: ['П', 'К', 'С', 'Л', 'Ф', 'Кр'],
            cn: ['卒', '马', '象', '车', '后', '帅'],
        }

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

    }

    componentDidMount() {
        this.genererPieceAleatoire();

        this.monInputRef.current.focus();
    }

    genererRoque = (chess) => {
        let coloredSquares = {};
        this.realCoup = 'O-O';
        this.languageCoup = 'O-O';
        if (this.orientation === 'black') {
            coloredSquares = {
                'h8': { backgroundColor: this.couleurM },
                'e8': { backgroundColor: this.couleurP },
            };
            chess.load('rnbqk2r/pppp1ppp/5n2/4p3/1bP1P3/5NP1/PP1P1P1P/RNBQKB1R b KQkq - 0 4');
        }
        else {
            coloredSquares = {
                'e1': { backgroundColor: this.couleurM },
                'h1': { backgroundColor: this.couleurP },
            };
            chess.load('r1bqk1nr/pppp2pp/2n2p2/1B2p3/1b2P3/5N2/PPPP1PPP/RNBQK2R w KQkq - 0 7');
        }
        return [chess, coloredSquares];
    }

    genererGrandRoque = (chess) => {
        let coloredSquares = {};
        this.realCoup = 'O-O-O';
        this.languageCoup = 'O-O-O';
        if (this.orientation === 'black') {
            coloredSquares = {
                'e8': { backgroundColor: this.couleurM },
                'a8': { backgroundColor: this.couleurP },
            };
            chess.load('r3kbnr/ppp1pppp/2n5/3q4/3P2b1/2P2N2/PP2PPPP/R1BQKB1R b KQkq - 0 7');
        }
        else {
            coloredSquares = {
                'a1': { backgroundColor: this.couleurM },
                'e1': { backgroundColor: this.couleurP },
            };
            chess.load('r1q1kbnr/ppp2ppp/2npb3/4p1BQ/4P3/2NP4/PPP2PPP/R3KBNR w KQkq - 3 6');
        }
        return [chess, coloredSquares];
    }

    genererPriseEnPassant = (chess) => {
        let coloredSquares = {};
        if (this.orientation === 'black') {
            chess.load('rnbqkbnr/pp1ppppp/8/8/2p1P3/2P5/PP1P1PPP/RNBQKBNR w KQkq - 0 3');
            this.realCoup = "cxd3";
            this.languageCoup = "cxd3";

            setTimeout(() => {
                chess.move("d4");
                coloredSquares = {
                    'c4': { backgroundColor: this.couleurM },
                    'd3': { backgroundColor: this.couleurP },
                };
                this.setState({ chess: chess, coloredSquares: coloredSquares });
            }, 1000); // Effectue le coup d4 apres apres 1 sec.
        }
        else {
            chess.load('rnbqkbnr/pp1ppppp/8/2p1P3/8/8/PPPP1PPP/RNBQKBNR b KQkq - 0 2');
            this.realCoup = "exd6";
            this.languageCoup = "exd6";

            setTimeout(() => {
                chess.move("d5");
                coloredSquares = {
                    'e5': { backgroundColor: this.couleurM },
                    'd6': { backgroundColor: this.couleurP },
                };
                this.setState({ chess: chess, coloredSquares: coloredSquares });
            }, 2000); // Effectue le coup d5 apres apres 1 sec.
        }
        return [chess, coloredSquares];
    }

    genererEchec = (chess) => {
        let coloredSquares = {};
        if (this.orientation === 'black') {
            this.realCoup = 'Qh4+';
            this.languageCoup = this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue['en'].indexOf('Q')] + this.realCoup.slice(1);
            coloredSquares = {
                'd8': { backgroundColor: this.couleurM },
                'e1': { backgroundColor: this.couleurP },
            };
            chess.load('rnbqkbnr/pppp1ppp/8/4P3/8/8/PPPPP1PP/RNBQKBNR b KQkq - 0 2');
        }
        else {
            this.realCoup = 'Qh5+';
            this.languageCoup = this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue['en'].indexOf('Q')] + this.realCoup.slice(1);
            coloredSquares = {
                'd1': { backgroundColor: this.couleurM },
                'e8': { backgroundColor: this.couleurP },
            };
            chess.load('rnbqkbnr/ppppp1pp/8/5p2/4P3/8/PPPP1PPP/RNBQKBNR w KQkq - 0 2');

        }
        return [chess, coloredSquares];
    }

    genererEchecMat = (chess) => {
        let coloredSquares = {};
        if (this.orientation === 'black') {
            this.realCoup = 'Qxf2#';
            this.languageCoup = this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue['en'].indexOf('Q')] + this.realCoup.slice(1);
            coloredSquares = {
                'h4': { backgroundColor: this.couleurM },
                'e1': { backgroundColor: this.couleurP },
            };
            chess.load('rnb1k1nr/pppp1ppp/8/2b1B3/7q/1P3N2/P1PPPPPP/RN1QKB1R b KQkq - 2 4');
        }
        else {
            this.realCoup = 'Qxf7#';
            this.languageCoup = this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue['en'].indexOf('Q')] + this.realCoup.slice(1);
            coloredSquares = {
                'h5': { backgroundColor: this.couleurM },
                'e8': { backgroundColor: this.couleurP },
            };
            chess.load('r1bqkb1r/pppp1ppp/2n2n2/4p2Q/2B1P3/8/PPPP1PPP/RNB1K1NR w KQkq - 4 4');

        }
        return [chess, coloredSquares];
    }

    genererPromotionDame = (chess) => {
        let coloredSquares = {};
        if (this.orientation === 'black') {
            this.realCoup = 'a1=Q+';

            this.languageCoup = this.realCoup.replace('Q', this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue['en'].indexOf('Q')]);
            coloredSquares = {
                'a2': { backgroundColor: this.couleurM },
                'g1': { backgroundColor: this.couleurP },
            };
            chess.load('b4rk1/3n4/1Q1p3p/7B/2P5/3P4/p6P/6K1 b KQkq - 0 1');
        }
        else {
            this.realCoup = 'c8=Q+';

            this.languageCoup = this.realCoup.replace('Q', this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue['en'].indexOf('Q')]);
            coloredSquares = {
                'c7': { backgroundColor: this.couleurM },
                'e8': { backgroundColor: this.couleurP },
            };
            chess.load('4k1r1/2P5/8/1n5R/3n1p2/P2B4/8/5K2 w KQkq - 0 1');
        }
        return [chess, coloredSquares];
    }

    genererPromotionCheval = (chess) => {
        let coloredSquares = {};
        if (this.orientation === 'black') {
            this.realCoup = 'f1=N#';

            this.languageCoup = this.realCoup.replace('N', this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue['en'].indexOf('N')]);
            coloredSquares = {
                'f2': { backgroundColor: this.couleurM },
                'h2': { backgroundColor: this.couleurP },
            };

            chess.load('8/8/2q4k/2b5/5p2/r7/1P3p1K/8 b KQkq - 0 1');
        }
        else {
            this.realCoup = 'c8=N#';

            this.languageCoup = this.realCoup.replace('N', this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue['en'].indexOf('N')]);
            coloredSquares = {
                'c7': { backgroundColor: this.couleurM },
                'a7': { backgroundColor: this.couleurP },
            };
            chess.load('8/k1P5/7R/2P2p2/5B2/P4Q2/3K4/8 w KQkq - 0 1');
        }
        return [chess, coloredSquares];
    }


    genererPieceAleatoire = () => {
        let { chess } = this.state;
        chess.clear();

        //choix couleur
        if (Math.random() < 0.5) {
            this.orientation = 'black';
            this.couleur = "noir";
        }
        else {
            this.orientation = 'white';
            this.couleur = "blanc";
        }

        // choix piece
        const coupsPossible = ['Roque', 'Grand-Roque', 'Prise-en-passant', 'Echec', 'Echec-et-Mat', 'Promotion-dame', 'Promotion-cavalier'];
        this.nombreCoupsPossible = coupsPossible.length;
        this.coupChoisis = coupsPossible[this.indexCoup];


        let coloredSquares = {};
        // pour chaque piece
        if (this.coupChoisis === 'Roque') {
            this.consigne = 'le petit roque';
            this.pieceConcernee = 'coté ' + this.couleur;
            [chess, coloredSquares] = this.genererRoque(chess);
        }
        else if (this.coupChoisis === 'Grand-Roque') {
            this.consigne = 'le grand roque';
            this.pieceConcernee = 'coté ' + this.couleur;
            [chess, coloredSquares] = this.genererGrandRoque(chess);
        }
        else if (this.coupChoisis === 'Prise-en-passant') {
            this.consigne = 'la prise en passant';
            this.pieceConcernee = 'du pion blanc';
            [chess, coloredSquares] = this.genererPriseEnPassant(chess);
        }
        else if (this.coupChoisis === 'Echec') {
            this.consigne = 'un échec';
            this.pieceConcernee = 'avec la dame';
            [chess, coloredSquares] = this.genererEchec(chess);
        }
        else if (this.coupChoisis === 'Echec-et-Mat') {
            this.consigne = 'un échec et mat';
            this.pieceConcernee = 'avec la dame';
            [chess, coloredSquares] = this.genererEchecMat(chess);
        }
        else if (this.coupChoisis === 'Promotion-dame') {
            this.consigne = "une promotion en dame";
            this.pieceConcernee = 'faisant un echec';
            [chess, coloredSquares] = this.genererPromotionDame(chess);
        }
        else if (this.coupChoisis === 'Promotion-cavalier') {
            this.consigne = "une promotion en cavalier";
            this.pieceConcernee = 'faisant un echec et mat';
            [chess, coloredSquares] = this.genererPromotionCheval(chess);
        }

        this.setState({ chess: chess, coloredSquares: coloredSquares, orientation: this.orientation === 'white' ? 'white' : 'black' });
    };

    // handles

    handleInputChange = (event) => {
        this.setState({ inputValue: event.target.value });
    };

    handleKeyPress = (event) => {
        if (this.state.inputValue.length >= 3) {
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

    handleClickReplay = () => {
        Howler.volume(0.3);
        this.soundUp.play();

        const { chess } = this.state;
        const oldMove = chess.undo().to;
        this.setState({ chess: chess, });

        setTimeout(() => {
            const { chess } = this.state;
            this.setState({ chess: chess, });
            chess.move(oldMove);
        }, 1000);
    }

    handleClickNouveau = () => {
        Howler.volume(0.3);
        this.soundUp.play();
        this.setState({ showCorrect: false, showIncorrect: false, message: '', coloredSquares: {} });

        this.genererPieceAleatoire();
    };


    handleLanguageChange = (event) => {
        Howler.volume(0.3);
        this.soundUp.play();

        if (this.coupChoisis === 'Echec' || this.coupChoisis === 'Echec-et-Mat') {
            // Recupere la traduction de la piece a partir de la notation de la piece actuelle
            this.languageCoup = this.listePiecesLangue[event.target.value][this.listePiecesLangue[this.state.selectedLanguage].indexOf(this.languageCoup.charAt(0))] + this.realCoup.slice(1);
        }
        else if (this.coupChoisis === 'Promotion-cavalier' || this.coupChoisis === 'Promotion-dame') {
            // Recupere la traduction de la piece a partir de la notation de la piece actuelle
            const actualPiece = this.listePiecesLangue[this.state.selectedLanguage][this.listePiecesLangue[this.state.selectedLanguage].indexOf(this.languageCoup.charAt(3))];
            const futurePiece = this.listePiecesLangue[event.target.value][this.listePiecesLangue[this.state.selectedLanguage].indexOf(actualPiece)];
            this.languageCoup = this.languageCoup.replace(actualPiece, futurePiece);
        }
        this.setState({ selectedLanguage: event.target.value, piecesLanguage: this.listePiecesLangue[event.target.value] });
    }


    handleClick = () => {
        Howler.volume(0.5);
        this.soundUp.play();
        const { inputValue, chess } = this.state;
        const PlanguageCoup = this.listePiecesLangue[this.state.selectedLanguage][0] + this.languageCoup;
        if ((inputValue === this.languageCoup) ||
            (this.indexCoup === 2 && inputValue === PlanguageCoup) ||
            (this.indexCoup === 5 && inputValue === PlanguageCoup) ||
            (this.indexCoup === 6 && inputValue === PlanguageCoup)) {
            Howler.volume(0.3);
            this.soundWin.play();
            if (this.state.showIncorrect)
                this.points = 0;
            else
                this.points = this.pointsGagnes;
            const text = `Bonne réponse ! Le coup est bien ${inputValue}, vous gagné ${this.points} points.`;
            this.points = this.pointsGagnes;
            chess.move(this.realCoup);
            this.setState({
                message: text,
                chess: chess,
                inputValue: '',
                showCorrect: true,
                showIncorrect: false,
            });

            setTimeout(() => {
                // si this.index est inferieur ou égale a la taille de coupsPossible alors index augmente de un sinon un revient a 0
                this.indexCoup >= this.nombreCoupsPossible - 1 ? this.indexCoup = 0 : this.indexCoup++;
                this.setState({ showCorrect: false, showIncorrect: false, message: '', coloredSquares: {} });

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
                url: `http://localhost:3001/unlockLevel/save/${this.name}/${this.idExercice}`,
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
                        boardOrientation={this.state.orientation}
                        showBoardNotation={this.state.coordonnees}
                        customSquareStyles={this.state.coloredSquares}

                        animationDuration={800}
                    />
                </div>
                <div className="elements-droite">
                    <i className="consigne">
                        Ecrivez le coup pour faire <span style={{ color: `${this.couleurP}` }}> {this.consigne}
                        </span> <span style={{ color: `${this.couleurM}` }}> {this.pieceConcernee}
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
                        <Stack key="stack" spacing={2} direction="row" alignItems="center">
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
                            <button className="bouton-3D-red"
                                key="clean"
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
                                {...(this.state.inputValue.length < 3 && { disabled: true })}
                                onMouseEnter={() => this.handlePieceHover()}
                                onMouseUp={this.handleClick}
                                onMouseDown={() => this.handlePieceDown()}>
                                <span className="texte-3D">
                                    Valider
                                </span>
                            </button>
                            {this.coupChoisis === 'Prise-en-passant' && <button className="bouton-3D button-replay"
                                title="Refaire"
                                onMouseEnter={() => this.handlePieceHover()}
                                onMouseUp={this.handleClickReplay}
                                onMouseDown={() => this.handlePieceDown()}>
                                <span className="texte-3D texte-replay">
                                    Rejouer
                                </span>
                            </button>}
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

export default Notation5;