import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import Clubs from './pages/Clubs';
import Stats from './pages/Stats';
import AddRestaurant from './pages/AddRestaurant';
import RestaurantDetails from './pages/RestaurantDetails';
import Auth from './pages/Auth';

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return null; // Or a loading spinner

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />

        <Route path="/" element={session ? <Layout /> : <Navigate to="/auth" />}>
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
