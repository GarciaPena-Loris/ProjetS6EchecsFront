import React from "react";
import "../Components.css"
import "./Accueil.css"
import { useNavigate } from "react-router-dom";
import { Howl, Howler } from 'howler';

export default function Accueil() {
  // son boutons
  const soundDown = new Howl({
    src: ['/sons/clicdown.wav']
  });
  const soundUp = new Howl({
    src: ['/sons/clicup.wav']
  });
  function handlePieceDown() {
    Howler.volume(0.3);
    soundDown.play();
  };


  //fonction utile pour le router (plus particulièrement les boutons)
  const navigate = useNavigate();
  //partie fonctionnel du bouton 'se connecter'
  function handleClickConnexion() {
    Howler.volume(0.3);
    soundUp.play();
    navigate("/connexion");
  }

  function handleClickInscription() {
    Howler.volume(0.3);
    soundUp.play();
    navigate("/inscription");
  }

  function handleClickEntrainement() {
    Howler.volume(0.3);
    soundUp.play();
    navigate("/selectionExercices");
  }

  return (
    <div className="accueil">
      <div>
        <h1 className="bienvenue">Bienvenue sur MentalChess</h1>
        <img className="img" src="https://i.imgur.com/0EKRDDl.png" alt="imgAcceuil"></img>
      </div>
      <div>
        {!sessionStorage.getItem('token') ? (
          <div className="boutons-connexion">
            <button onClick={handleClickConnexion} onMouseDown={handlePieceDown} className="bouton-3D">
              <span className="texte-3D">
                Se connecter
              </span>
            </button>
            <div className="space"></div>
            <button onClick={handleClickInscription} onMouseDown={handlePieceDown} className="bouton-3D">
              <span className="texte-3D">
                S'inscrire
              </span>
            </button>
          </div>
        ) : (
          <button onClick={handleClickEntrainement} onMouseDown={handlePieceDown} className="bouton-3D">
            <span className="texte-3D">
              S'entrainer
            </span>
          </button>
        )}
      </div>
    </div>
  );
}

