import { configureStore } from '@reduxjs/toolkit';
import { composeWithDevTools } from '@redux-devtools/extension';
import counterReducer from './slices/counter';
import authReducer from './slices/auth'; // Importer le réducteur d'authentification

export const store = configureStore(
  {
    reducer: {
      counter: counterReducer,
      auth: authReducer, // Ajouter le réducteur d'authentification
    },
  },
  composeWithDevTools()
);
