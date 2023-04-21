import React from "react";
import './Bombe.css';
import '../../Components.css';
import axios from "axios";
import { decodeToken } from "react-jwt";
import { Chessboard } from 'react-chessboard'
import { Chess } from 'chess.js'
import { Stack } from '@mui/material';
import { styled, ThemeProvider, createTheme } from '@mui/material/styles';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import { Howl, Howler } from 'howler';

class Bombe4 extends React.Component {
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
            piecesLanguage: ['T', 'F', 'C', 'D'],
            coloredSquares: {},
            imageCase: 'https://i.gifer.com/YQDj.gif',
            chess: new Chess(),
            chessBis: new Chess()
        };
        this.pointsGagnes = props.pointsGagnes;
        this.pointsPerdus = props.pointsPerdus;
        this.points = 0;
        this.idExercice = props.idExercice;
        // decode token
        const decoded = decodeToken(sessionStorage.token);
        this.name = decoded.name;

        this.couleurP = '#af80dc';
        this.couleurM = '#ff555f';
        this.nomPiece = '';
        this.alpha = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'];
        this.listePiecesLangue = {
            en: ['R', 'B', 'N', 'Q'],
            fr: ['T', 'F', 'C', 'D'],
            es: ['T', 'A', 'C', 'D'],
            de: ['S', 'L', 'T', 'D'],
            it: ['T', 'A', 'C', 'D'],
            ru: ['К', 'С', 'Л', 'Ф'],
            cn: ['马', '象', '车', '后'],
        }
        this.nombreBombes = 20;
        this.pieceJoue = 'n';
        this.startPosition = '';
        this.endPosition = '';
        this.positionActuelle = '';
        this.positionActuelleBis = '';
        this.historiqueMoves = [];
        this.showedPosition = false;

        this.isBlowed = false;
        this.gifExplosion = "https://i.gifer.com/YQDj.gif";
        this.gifFeu = "https://i.imgur.com/83wrGOi.gif";
        this.isFiring = 0;
        this.monInputRef = React.createRef();

        this.soundExplosion = new Howl({
            src: ['/sons/explosion.wav']
        });
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
        this.feu = new Howl({
            src: ['/sons/feu.flac']
        });

    }

    generateRandomStartPosition = (chess, piece, color, position) => {
        let ligne, colonne;
        if (Math.random() > 0.5) { // positionne-la sur la première ou la deuxième ligne
            ligne = Math.floor(Math.random() * 2) + 1; // génère un nombre aléatoire entre 1 et 2
            colonne = Math.floor(Math.random() * 8) + 1; // génère un nombre aléatoire entre 1 et 8
            position = 'bas';
        }
        else { // positionne-la sur la première ou la deuxième colonne
            ligne = Math.floor(Math.random() * 8) + 1; // génère un nombre aléatoire entre 1 et 8
            colonne = Math.floor(Math.random() * 2) + 1; // génère un nombre aléatoire entre 1 et 2
            position = 'gauche';
        }
        chess.put({ type: piece, color: color }, `${this.alpha[colonne - 1]}${ligne}`);
        return [ligne, colonne, position];
    }

    generateRandomEndPosition = (chess, piece, color, position) => {
        let ligne, colonne;
        if (position === 'bas') { // positionne-la sur la septième ou la dernière ligne
            ligne = Math.floor(Math.random() * 2) + 7; // génère un nombre aléatoire entre 7 et 8
            colonne = Math.floor(Math.random() * 8) + 1; // génère un nombre aléatoire entre 1 et 8
        }
        else { // positionne-la sur la septième ou la dernière colonne
            ligne = Math.floor(Math.random() * 8) + 1; // génère un nombre aléatoire entre 1 et 8
            colonne = Math.floor(Math.random() * 2) + 7; // génère un nombre aléatoire entre 1 et 2
        }
        chess.put({ type: piece, color: color }, `${this.alpha[colonne - 1]}${ligne}`);
        return [ligne, colonne];
    }

    generateRandomBombPositions = (chess, numBombs, startPosition, endPosition) => {
        const bombPositions = [];
        let bombPosition;
        let ligneBombe, colonneBombe;
        while (bombPositions.length < numBombs) {
            ligneBombe = Math.floor(Math.random() * 8) + 1;
            colonneBombe = Math.floor(Math.random() * 8) + 1;
            bombPosition = `${this.alpha[colonneBombe - 1]}${ligneBombe}`;
            if (bombPosition !== startPosition && bombPosition !== endPosition && !bombPositions.includes(bombPosition)) {
                chess.put({ type: 'p', color: 'b' }, bombPosition);
                bombPositions.push(bombPosition);

            }
        }
        return bombPositions;
    }

    placeBombe = (chess, bombPosition) => {
        bombPosition.forEach((bomb) => {
            chess.put({ type: 'p', color: 'b' }, bomb);
        });
    }

    removeBombe = (chess, bombPositions) => {
        for (let i = 0; i < bombPositions.length; i++) {
            chess.remove(bombPositions[i]);
        }
    }

    verifCheminPossibleEtPasDirect = (chess, startPosition, endPosition, bombPositions) => {
        // Vérifier si pas de chemin direct
        const possibleMoves = chess.moves();
        if (possibleMoves.length === 0) {
            return false;
        }
        else if (possibleMoves.includes(this.pieceJoue.toUpperCase() + 'x' + endPosition)) {
            return false;
        }

        // Graphe représentant l'échiquier
        const graph = {};
        // Tableau des positions des voisins possibles pour chaque case de l'échiquier
        const directions = [
            [-2, -1], [-2, 1], [-1, -2], [-1, 2], [1, -2], [1, 2], [2, -1], [2, 1]
        ];


        // Création du graphe
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                // Calcule la position de la case en fonction de ses coordonnées
                const position = `${this.alpha[col - 1]}${row}`;
                // Initialise la liste des voisins de la case à un tableau vide
                graph[position] = [];

                // Vérifie si la case contient une bombe
                if (!bombPositions.includes(position)) {
                    // Parcourt les voisins de la case
                    for (const [deltaRow, deltaCol] of directions) {
                        const newRow = row + deltaRow;
                        const newCol = col + deltaCol;

                        // Vérifie si le voisin est sur l'échiquier
                        if (newRow >= 1 && newRow <= 8 && newCol >= 1 && newCol <= 8) {
                            const neighbor = `${this.alpha[newCol - 1]}${newRow}`;

                            // Vérifie si le voisin ne contient pas une bombe
                            if (!bombPositions.includes(neighbor)) {
                                // Ajoute le voisin à la liste des voisins de la case
                                graph[position].push(neighbor);
                            }
                        }
                    }
                }
            }
        }

        // Vérification de la connectivité
        const visited = new Set();
        // Initialisation d'un ensemble visited qui contiendra les positions visitées lors de la recherche de chemin. 
        // Un ensemble est utilisé plutôt qu'un tableau pour une recherche plus rapide.
        const queue = [startPosition];

        while (queue.length > 0) { // Début de la boucle qui va parcourir les positions dans la file.
            // Récupération et suppression de la première position dans la file. Cette position est considérée comme la position courante.
            const current = queue.shift();
            // Ajout de la position courante à l'ensemble des positions visitées.
            visited.add(current);

            // Si la position courante est la position d'arrivée, la fonction renvoie true pour indiquer qu'un chemin a été trouvé.
            if (current === endPosition) return true;

            // Parcours des voisins de la position courante dans le graphe graph.
            for (const neighbor of graph[current]) {
                // Si le voisin n'a pas été visité précédemment, il est ajouté à la file pour être exploré plus tard.
                if (!visited.has(neighbor)) {
                    queue.push(neighbor);
                }
            }
        }

        // Si la boucle se termine sans avoir trouvé de chemin, la fonction renvoie false pour indiquer qu'aucun chemin n'a été trouvé.
        return false;
    }

    copyChess = (chess, newChess) => {
        newChess.clear();
        for (let row = 1; row <= 8; row++) {
            for (let col = 1; col <= 8; col++) {
                const piece = chess.get(this.alpha[col - 1] + row);
                if (piece) {
                    newChess.put({ type: piece.type, color: piece.color }, this.alpha[col - 1] + row)
                }
            }
        }
    }

    genererPlateau = () => {
        let newChess = new Chess();
        newChess.clear();
        this.isBlowed = false;
        this.showedPosition = false;
        this.historiqueMoves = [];
        let ligneP, colonneP, position, ligneA, colonneA;
        [ligneP, colonneP, position] = this.generateRandomStartPosition(newChess, this.pieceJoue, 'w', position);
        [ligneA, colonneA] = this.generateRandomEndPosition(newChess, 'n', 'b', position);
        const startPosition = `${this.alpha[colonneP - 1]}${ligneP}`;
        const endPosition = `${this.alpha[colonneA - 1]}${ligneA}`;
        const nombreBombes = this.nombreBombes + Math.floor(Math.random() * 5) + 1;
        const bombPositions = this.generateRandomBombPositions(newChess, nombreBombes, startPosition, endPosition);

        const isValid = this.verifCheminPossibleEtPasDirect(newChess, startPosition, endPosition, bombPositions);
        if (!isValid) {
            this.genererPlateau();
        }
        else {
            this.tabBomb = bombPositions;
            this.endPosition = endPosition;
            this.positionActuelle = startPosition;
            this.positionActuelleBis = startPosition;
            this.nomPiece = 'le cavalier en ' + startPosition;
            const chessCopy = new Chess();
            this.copyChess(newChess, chessCopy);
            this.setState({
                chess: newChess,
                chessBis: chessCopy,
                coloredSquares: {
                    [startPosition]: { backgroundColor: this.couleurP },
                },
            });
        }
    }

    componentDidMount() {
        this.genererPlateau();
    }

    componentWillUnmount() {
        this.feu.stop(this.isFiring); // Arrêter le son en utilisant l'ID enregistré
    }

    faireMouvementChess = (newPosition) => {
        const { chess } = this.state;

        // Si le mouvement est valide
        if (chess.moves().some(item => item.replace(/[#+]$/, '') === newPosition ||
            chess.moves().some(item => item.replace(/[#+]$/, '') === (newPosition[0] + 'x' + newPosition.slice(1))))) {
            // Effectue le mouvemenet
            chess.remove(this.positionActuelle);
            chess.put({ type: `${this.pieceJoue}`, color: 'w' }, newPosition.slice(-2));
            // Affecter la nouvelle position
            this.positionActuelle = newPosition.slice(-2);
            // Jouer le son
            Howler.volume(1);
            this.pieceDrop.play();
            this.setState({ chess: chess });

            return true;
        }
        else { // Si le mouvement est invalide
            return false;
        }
    }

    faireMouvementChessBis = (newPosition) => {
        const { chessBis } = this.state;

        // Si le mouvement est valide
        if (chessBis.moves().some(item => item.replace(/[#+]$/, '') === newPosition ||
            chessBis.moves().some(item => item.replace(/[#+]$/, '') === (newPosition[0] + 'x' + newPosition.slice(1))))) {
            // Effectue le mouvemenet
            chessBis.remove(this.positionActuelleBis);
            chessBis.put({ type: `${this.pieceJoue}`, color: 'w' }, newPosition.slice(-2));
            // Affecter la nouvelle position
            this.positionActuelleBis = newPosition.slice(-2);
            // Jouer le son
            Howler.volume(1);
            this.pieceDrop.play();
            this.setState({ chessBis: chessBis });

            return true;
        }
        else { // Si le mouvement est invalide
            return false;
        }
    }

    refaireAllMouvements = () => {
        return new Promise((resolve) => {
            this.faireMouvementChess(this.historiqueMoves[0])
            let currentIndex = 1;
            if (currentIndex < this.historiqueMoves.length) {
                let intervalId = setInterval(() => { //faire deplacement
                    this.faireMouvementChess(this.historiqueMoves[currentIndex]);
                    currentIndex++;
                    if (currentIndex >= this.historiqueMoves.length) { // Refaire tous les mouvements
                        clearInterval(intervalId);
                        resolve();
                    }
                }, 800);
            }
            else {
                resolve();
            }
        });
    }


    verifPasTraverserBombe = (position, realCoup) => {
        const ligneFuture = realCoup.slice(-1);
        const colonneFuture = realCoup.slice(-2, -1);
        if (this.tabBomb.includes(colonneFuture + ligneFuture)) {
            const moves = this.state.chessBis.moves();
            if (moves.some(m => m.replace(/[#+]$/, '') === (this.pieceJoue.toUpperCase() + 'x' + colonneFuture + ligneFuture))) {
                return colonneFuture + ligneFuture;
            }
            return false;
        }
    };


    handleClick = async () => {
        const { inputValue, chess } = this.state;

        // Traduire coup
        const realCoup = this.listePiecesLangue['en'][this.listePiecesLangue[this.state.selectedLanguage].indexOf(inputValue.charAt(0))] + inputValue.slice(1);
        // Vérif pas de bombe
        let bombeEntre = this.verifPasTraverserBombe(this.positionActuelleBis, realCoup);

        if (bombeEntre) { // Si bombe
            this.historiqueMoves.push(this.pieceJoue.toUpperCase() + 'x' + bombeEntre);
            await this.refaireAllMouvements();
            this.historiqueMoves = [];

            setTimeout(() => {
                // transforme en Q et affiche le message
                chess.remove(bombeEntre);
                chess.put({ type: 'q', color: 'b' }, bombeEntre);
                let text = "EXPLOOSIIOOONN ! ";
                Howler.volume(0.2);
                this.soundExplosion.play();
                this.points = -(this.pointsPerdus * 2);
                this.setState({ chess: chess, showIncorrect: true, message: text, inputValue: '' });
                setTimeout(() => {
                    this.isBlowed = true;
                    this.handleUpdate();
                    this.setState({ imageCase: this.gifFeu });
                    Howler.volume(0.5); // Changer le volume
                    this.isFiring = this.feu.play(); // Jouer le son et enregistrer l'ID du son
                    let newText = "Vous avec marché sur une bombe. Vous perdez " + Math.min(this.props.exerciceElo, this.pointsPerdus * 2) + " points.";
                    this.setState({ showIncorrect: true, message: newText });
                }, 2000);
            }, 500);
        }
        else {
            if (realCoup === (this.pieceJoue.toUpperCase() + this.endPosition) || realCoup === (this.pieceJoue.toUpperCase() + 'x' + this.endPosition)) { // si case arrive
                if (!this.faireMouvementChessBis(this.pieceJoue.toUpperCase() + 'x' + this.endPosition)) { // Essaye d'aller sur la case d'arriver directement
                    Howler.volume(0.3);
                    this.soundWrong.play();
                    this.setState({ inputValue: '', showIncorrect: true, message: "Coup interdit ! Vous perdez " + Math.min(this.props.exerciceElo, this.pointsPerdus) + " points." });
                    // enlever des pionts
                    this.points = -Math.min(this.props.exerciceElo, this.pointsPerdus);
                    if (this.points < 0) {
                        this.handleUpdate();
                    }
                    setTimeout(() => { // regere plateau apres 3 sec
                        this.setState({ message: '', showCorrect: false, showIncorrect: false });
                    }, 3000);
                }
                else {
                    this.historiqueMoves.push(this.pieceJoue.toUpperCase() + 'x' + this.endPosition);
                    await this.refaireAllMouvements();
                    this.historiqueMoves = [];
                    this.points = this.pointsGagnes;
                    if (this.showedPosition) {
                        this.points = Math.floor(this.pointsGagnes / 2);
                    }
                    var text = "Bravo, vous êtes arrivé sans exploser ! Vous gagnez " + this.points + " points.";
                    Howler.volume(1);
                    this.soundWin.play();
                    this.setState({ message: text, showCorrect: true });
                    setTimeout(() => { // regere plateau apres 3 sec
                        this.handleUpdate();
                        this.setState({ message: '', showCorrect: false, showIncorrect: false, inputValue: '' });
                        this.genererPlateau();
                    }, 3000);
                }
            } // Si pas case arrivé.
            else {
                if (this.faireMouvementChessBis(realCoup)) { // Mouvement possible
                    this.historiqueMoves.push(realCoup);
                    this.setState({ inputValue: '' });
                }
                else { // Mouvement impossible
                    Howler.volume(0.3);
                    this.soundWrong.play();
                    this.setState({ inputValue: '', showIncorrect: true, message: "Mouvement impossible, vous perdez " + Math.min(this.props.exerciceElo, this.pointsPerdus) + " points." });
                    // enlever des points.
                    this.points = -Math.min(this.props.exerciceElo, this.pointsPerdus);
                    setTimeout(() => { // regere plateau apres 3 sec
                        if (this.points < 0) {
                            this.handleUpdate();
                        }
                        this.setState({ message: '', showCorrect: false, showIncorrect: false });
                    }, 3000);
                }
            }
        }
    };

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

    customPieces = () => {
        let customBomb = {
            bP: ({ squareWidth }) => (
                <img src="https://i.imgur.com/z82FgxP.png" alt="piont noir" style={{ width: squareWidth, height: squareWidth }}></img>
            ),
            bQ: ({ squareWidth }) => (
                <img src={this.state.imageCase} alt="" style={{ width: squareWidth, height: squareWidth }}></img>
            ),
            bN: ({ squareWidth }) => (
                <img src="https://i.imgur.com/2KLmBRX.png" alt="arrivé" style={{ width: squareWidth, height: squareWidth }}></img>
            )
        };
        return customBomb;
    };

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
        this.feu.stop(this.isFiring); // Arrêter le son en utilisant l'ID enregistré
        Howler.volume(0.3);
        this.soundUp.play();
        this.setState({ showCorrect: false, showIncorrect: false, imageCase: this.gifExplosion, message: '' });
        this.genererPlateau();
    };

    handleClickVoir = () => {
        let text;
        if (this.showedPosition) {
            text = "Actualisation en cours...";
        }
        else {
            text = "Actualisation en cours... Vous ne gagnerez que la moitié des points.";
        }
        this.showedPosition = true;
        this.removeBombe(this.state.chess, this.tabBomb);
        this.setState({ chess: this.state.chess, message: text, showCorrect: true });
        setTimeout(async () => { // regere plateau apres 3 sec
            await this.refaireAllMouvements();
            this.historiqueMoves = [];
            this.placeBombe(this.state.chess, this.tabBomb);
            setTimeout(async () => { // efface le message apres 3 sec
                this.setState({ showCorrect: false, message: '' });
            }, 3000);
        }, 800);
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

    handleLanguageChange = (event) => {
        Howler.volume(0.3);
        this.soundUp.play();
        this.setState({ selectedLanguage: event.target.value, piecesLanguage: this.listePiecesLangue[event.target.value] });
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
            "Tour", "Fou", "Cavalier", "Dame"
        ]
        let lignes = this.state.orientation === 'white'
            ? ["8", "7", "6", "5", "4", "3", "2", "1"]
            : ["1", "2", "3", "4", "5", "6", "7", "8"];
        let colonnes = this.state.orientation === 'white'
            ? ["a", "b", "c", "d", "e", "f", "g", "h"]
            : ["h", "g", "f", "e", "d", "c", "b", "a"];
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
                    </div>
                    <Chessboard
                        key="board"
                        position={this.state.chess.fen()}
                        arePiecesDraggable={false}
                        customPieces={this.customPieces()}
                        customSquareStyles={this.state.coloredSquares}
                        boardOrientation={this.state.orientation}
                        showBoardNotation={this.state.coordonnees}
                        areArrowsAllowed={false}
                    />
                </div>
                <div className="elements-droite">
                    <i className="consigne">
                        Ecrivez la suite de coup pour que
                        <span style={{ color: `${this.couleurP}` }}> {this.nomPiece}
                        </span> atteigne le <span style={{ color: `${this.couleurM}` }}> drapeau en {this.endPosition}
                        </span> sans toucher les bombes
                    </i>
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
                                )
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
                    </div>
                    <div className="input">
                        <Stack spacing={2} direction="row" alignItems="center">
                            <select className="language-selector" defaultValue={this.state.selectedLanguage} onChange={this.handleLanguageChange} onMouseDown={() => this.handlePieceDown()} >
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
                                {...(this.state.inputValue.length < 3 && { disabled: true })}
                                onMouseEnter={() => this.handlePieceHover()}
                                onMouseUp={this.handleClick}
                                onMouseDown={() => this.handlePieceDown()}>
                                <span className="texte-3D">
                                    Valider
                                </span>
                            </button>
                            {!this.isBlowed && <button className="bouton-3D button-replay"
                                title="Montrer"
                                {...(this.historiqueMoves.length < 1 && { disabled: true })}
                                onMouseEnter={() => this.handlePieceHover()}
                                onMouseUp={this.handleClickVoir}
                                onMouseDown={() => this.handlePieceDown()}>
                                <span className="texte-3D texte-replay">
                                    Actualiser
                                </span>
                            </button>}
                            {this.isBlowed && <button className="bouton-3D"
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


export default Bombe4;