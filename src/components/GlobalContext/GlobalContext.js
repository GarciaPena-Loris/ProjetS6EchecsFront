import React, { createContext, useState } from 'react';

export const GlobalContext = createContext();

export const GlobalProvider = ({ children }) => {
    const [globalElo, setGlobalElo] = useState(sessionStorage.getItem('globalElo') || null);
    const [globalAvatar, setGlobalAvatar] = useState(sessionStorage.getItem('globalAvatar') || null);

    const updateGlobalElo = (elo) => {
        sessionStorage.setItem('globalElo', elo);
        setGlobalElo(elo);
    };
    const updateGlobalAvatar = (avatar) => {
        sessionStorage.setItem('globalAvatar', avatar);
        setGlobalAvatar(avatar);
    };

    return (
        <GlobalContext.Provider value={{ globalElo, updateGlobalElo, globalAvatar, updateGlobalAvatar }}>
            {children}
        </GlobalContext.Provider>
    );

};
