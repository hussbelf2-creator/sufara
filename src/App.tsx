import { BrowserRouter, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import { useDirection } from "./hooks/useDirection";
import { ShopModalsProvider } from "./pages/shop/components/ShopModals";
import { CompareProvider } from "./pages/shop/components/CompareProvider";
import { CartProvider } from "./pages/shop/components/CartProvider";
import { FavoritesProvider } from "./pages/shop/components/FavoritesProvider";

/* Keeps the document direction (rtl/ltr) aligned with the active language. */
function DirectionSync() {
  useDirection();
  return null;
}

/* Softens every route change with a short lift so pages arrive, not cut. */
function RouteFade({ children }: { children: ReactNode }) {
  const location = useLocation();
  return (
    <div className="route-fade" key={location.pathname}>
      {children}
    </div>
  );
}


function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <DirectionSync />
      <BrowserRouter basename={__BASE_PATH__}>
        <ShopModalsProvider>
          <FavoritesProvider>
            <CompareProvider>
              <CartProvider>
                <RouteFade>
                  <AppRoutes />
                </RouteFade>
              </CartProvider>
            </CompareProvider>
          </FavoritesProvider>
        </ShopModalsProvider>
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
