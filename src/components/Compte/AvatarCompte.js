import React from "react";
import Avatar from "react-avatar";

const AvatarComponent = ({ imageProfil, handleAfficherAvatar, setShowPopup }) => {
    return (
        <Avatar
            key={imageProfil}
            className="avatar-image"
            size="180"
            round={true}
            src={imageProfil}
            onClick={handleAfficherAvatar}
            onMouseEnter={() => setShowPopup(true)}
            onMouseLeave={() => setShowPopup(false)}
        >
            <span className="avatar-text">Changer d'avatar</span>
        </Avatar>
    );
};

export default AvatarComponent;
