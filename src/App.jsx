import React, { useState, useEffect } from "react";
import { useRoutes } from "react-router-dom";
import { Provider } from "react-redux";
import { HelmetProvider, Helmet } from "react-helmet-async";
import { CacheProvider } from "@emotion/react";

import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";

import "./i18n";
import createTheme from "./theme";
import routes from "./routes";

import useTheme from "./hooks/useTheme";
import { store } from "./redux/store";
import createEmotionCache from "./utils/createEmotionCache";

import { AuthProvider } from "./contexts/FirebaseAuthContext"; // Utilisation de FirebaseAuthContext
import { StockAlertProvider } from "./contexts/StockAlertContext";
import { InvoiceNotifsProvider } from "./contexts/InvoiceNotifsContext";

import SplashScreen from "./components/SplashScreen"; // Ajout du splash screen

const clientSideEmotionCache = createEmotionCache();

function App({ emotionCache = clientSideEmotionCache }) {
  const content = useRoutes(routes);
  const { theme } = useTheme();

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000); // 2 secondes
    return () => clearTimeout(timer);
  }, []);

  if (loading) return <SplashScreen />;

  return (
    <CacheProvider value={emotionCache}>
      <HelmetProvider>
        <Helmet
          titleTemplate="%s | Rayon vert"
          defaultTitle="rayonvert online"
        />
        <Provider store={store}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <MuiThemeProvider theme={createTheme(theme)}>
              <AuthProvider>
                <StockAlertProvider>
                  <InvoiceNotifsProvider>
                    {content}
                  </InvoiceNotifsProvider>
                </StockAlertProvider>
              </AuthProvider>
            </MuiThemeProvider>
          </LocalizationProvider>
        </Provider>
      </HelmetProvider>
    </CacheProvider>
  );
}

export default App;
