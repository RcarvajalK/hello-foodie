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
import SplashScreen from './components/SplashScreen';
import { LoadScriptNext } from '@react-google-maps/api';

const libraries = ['places'];

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Splash screen timer
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    // Check active session
    try {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoading(false);
      }).catch(err => {
        console.error("Supabase Session Error:", err);
        setLoading(false);
      });
    } catch (e) {
      console.error("Supabase Init Error:", e);
      setLoading(false);
    }

    // Listen for changes on auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => {
      clearTimeout(timer);
      subscription.unsubscribe();
    };
  }, []);

  if (loading && showSplash) return <SplashScreen isVisible={true} />;

  return (
    <>
      <SplashScreen isVisible={showSplash} />
      <BrowserRouter>
        <LoadScriptNext
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={libraries}
        >
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
        </LoadScriptNext>
      </BrowserRouter>
    </>
  );
}
