import { React } from "react";
import "./App.css";
import { Routes, Route } from 'react-router-dom';
import { GlobalProvider } from './components/GlobalContext/GlobalContext';
import RequireAuth from "./components/RequireAuth/RequireAuth";
import UnRequireAuth from "./components/RequireAuth/UnRequireAuth";
import ErrorBoundary from "./components/RequireAuth/ErrorBoundary";
import Navbar from "./components/Navbar/Navbar";
import Sidebar from './components/Sidebar/Sidebar';
import Accueil from "./components/Accueil/Accueil";
import NoPage from "./components/NoPage/NoPage";
import Connexion from "./components/Connexion/Connexion";
import Inscription from "./components/Inscription/Inscription";
import SelectionExercices from "./components/SelectionExercices/SelectionExercices.js";
import Exercices from "./components/ExercicePage/ExercicePage";
import Niveaux from "./components/NiveauxPage/NiveauxPage";
import Compte from "./components/Compte/Compte.js";
import useMediaQuery from '@mui/material/useMediaQuery';


function App() {
  const isDesktop = useMediaQuery('(min-width:768px)');

  return (
    <div className="App" id="outer-container">
      <ErrorBoundary>
        <GlobalProvider>
          <Navbar />
          {!isDesktop && <Sidebar pageWrapId={'page-wrap'} outerContainerId={'outer-container'}/>}
          <div className="main" id="page-wrap">
            <Routes>
              <Route path="/" element={<Accueil />} />
              <Route path="/connexion" element={<UnRequireAuth component={Connexion} />} />
              <Route path="/inscription" element={<UnRequireAuth component={Inscription} />} />
              <Route path="/selectionExercices" element={<RequireAuth component={SelectionExercices} />} />
              <Route path="/exercices" element={<RequireAuth component={Exercices} />} />
              <Route path="/niveaux" element={<RequireAuth component={Niveaux} />} />
              <Route path="/compte" element={<RequireAuth component={Compte} />} />
              <Route path="*" element={<NoPage />} />
            </Routes>
          </div>
        </GlobalProvider>
      </ErrorBoundary>
    </div>
  );
}

export default App;