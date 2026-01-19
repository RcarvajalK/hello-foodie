import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import Clubs from './pages/Clubs';
import Stats from './pages/Stats';
import AddRestaurant from './pages/AddRestaurant';
import RestaurantDetails from './pages/RestaurantDetails';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="map" element={<MapPage />} />
          <Route path="add" element={<AddRestaurant />} />
          <Route path="clubs" element={<Clubs />} />
          <Route path="stats" element={<Stats />} />
          <Route path="restaurant/:id" element={<RestaurantDetails />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
