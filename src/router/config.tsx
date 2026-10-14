import type { RouteObject } from "react-router-dom";
import NotFound from "../pages/NotFound";
import Home from "../pages/home/page";
import Dashboard from "../pages/dashboard/page";
import Products from "../pages/shop/page";
import ProductDetail from "../pages/shop/detail/page";
import FactoriesDirectory from "../pages/factories/page";
import FactoryProfile from "../pages/factories/detail/page";
import CompareProducts from "../pages/shop/compare/page";
import CartPage from "../pages/shop/cart/page";
import CheckoutPage from "../pages/shop/checkout/page";
import OrdersPage from "../pages/shop/orders/page";
import OrderDetailPage from "../pages/shop/orders/detail/page";
import SearchPage from "../pages/search/page";
import FavoritesPage from "../pages/favorites/page";
import AmbassadorFactoryPage from "../pages/ambassador-factory/page";

const routes: RouteObject[] = [
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/search",
    element: <SearchPage />,
  },
  {
    path: "/products",
    element: <Products />,
  },
  {
    path: "/products/:id",
    element: <ProductDetail />,
  },
  {
    path: "/favorites",
    element: <FavoritesPage />,
  },
  {
    path: "/compare",
    element: <CompareProducts />,
  },
  {
    path: "/cart",
    element: <CartPage />,
  },
  {
    path: "/checkout",
    element: <CheckoutPage />,
  },
  {
    path: "/orders",
    element: <OrdersPage />,
  },
  {
    path: "/orders/:id",
    element: <OrderDetailPage />,
  },
  {
    path: "/factories",
    element: <FactoriesDirectory />,
  },
  {
    path: "/factories/:id",
    element: <FactoryProfile />,
  },
  {
    path: "/f/:amb/:factory",
    element: <AmbassadorFactoryPage />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "*",
    element: <NotFound />,
  },
];

export default routes;