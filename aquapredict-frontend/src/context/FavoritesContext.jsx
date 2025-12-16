// src/context/FavoritesContext.jsx
import React, { createContext, useContext, useEffect, useState } from "react";

const KEY = "aq_favorites_v1";

const FavoritesContext = createContext();

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(KEY) || "[]");
    } catch { return []; }
  });

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (species) => {
    setFavorites((prev) => {
      if (prev.includes(species)) return prev.filter((s) => s !== species);
      return [species, ...prev];
    });
  };

  const isFavorite = (species) => favorites.includes(species);

  return (
    <FavoritesContext.Provider value={{ favorites, toggleFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export const useFavorites = () => useContext(FavoritesContext);
