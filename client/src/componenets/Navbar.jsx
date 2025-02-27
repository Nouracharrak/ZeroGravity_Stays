import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { IconButton } from '@mui/material';
import { Search, Person, Menu } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { setLogout } from '../redux/state';
import variables from '../styles/variables.scss';
import '../styles/navBar.scss';

const Navbar = () => {
  const [dropDownMenu, setDropDownMenu] = useState(false);
  const [search, setSearch] = useState('');
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState("");

  const profileImage =
  user && user.profileImagePath
    ? user.profileImagePath // Utilisation directe de l'URL Cloudinary
    : "/assets/default-profile.png"; // Image par défaut si aucune photo


  // Fonction pour lancer la recherche
  const handleSearch = () => {
    if (search.trim()) {
      setError(""); // Réinitialise l'erreur si la recherche est valide
      navigate(`/properties/search/${search.trim()}`)
        .then(() => {
          console.log("Recherche réussie");
        })
        .catch((err) => {
          console.error("Erreur de recherche :", err);
          setError("Erreur de recherche");
        });
    } else {
      setError("Please enter a valid search term");
    }
  };
  

  return (
    <div className="navbar">
      <a href="/">
        <img src="/assets/logo.jpg" alt="logo" />
      </a>
      <div className="navbar_search">
        <input
          type="text"
          placeholder="Search ..."
          value={search}
          onChange={(e) => setSearch(e.target.value)} // Mise à jour de l'état à chaque changement dans l'input
        />
        <IconButton onClick={handleSearch}>
          <Search sx={{ color: variables.pinkred }} />
        </IconButton>
        {/* Affichage de l'erreur si elle existe  */}
        {error && <p className="error-message">{error}</p>}
      </div>

      <div className="navbar_right">
        {user ? (
          <a href="/create-listing" className="host">
            Become A Host
          </a>
        ) : (
          <a href="/login" className="host">
            Become A Host
          </a>
        )}
        <button
          className="navbar_right_account"
          onClick={() => setDropDownMenu(!dropDownMenu)} // Ouverture du menu déroulant
        >
          <Menu sx={{ color: variables.darkgrey }} />
          {!user ? (
            <Person sx={{ color: variables.darkgrey }} />
          ) : (
            <img
              src={profileImage}
              alt="profilePhoto"
              style={{ objectFit: 'cover', borderRadius: '50%' }}
            />
          )}
        </button>

        {/* Menu déroulant */}
        {dropDownMenu && user && (
          <div className="navbar_right_accountmenu">
            <Link to={`/${user._id}/trips`}>Trip List</Link>
            <Link to={`/${user._id}/wishList`}>Wish List</Link>
            <Link to={`/${user._id}/properties`}>Property List</Link>
            <Link to={`/${user._id}/reservations`}>Reservation List</Link>
            <Link to="/create-listing">Become A Host</Link>
            <Link to="/login" onClick={() => { dispatch(setLogout()) }}>Log Out</Link>
          </div>
        )}

        {/* Menu si l'utilisateur n'est pas connecté */}
        {dropDownMenu && !user && (
          <div className="navbar_right_accountmenu">
            <Link to="/login">Log In</Link>
            <Link to="/register">Sign Up</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
