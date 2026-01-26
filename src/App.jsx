import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Layout from './components/Layout';
import ScrollToTop from './components/ScrollToTop';
import Home from './pages/Home';
import MapPage from './pages/MapPage';
import Clubs from './pages/Clubs';
import ClubDetails from './pages/ClubDetails';
import Stats from './pages/Stats';
import AddRestaurant from './pages/AddRestaurant';
import RestaurantDetails from './pages/RestaurantDetails';
import Auth from './pages/Auth';
import SplashScreen from './components/SplashScreen';
import { LoadScriptNext } from '@react-google-maps/api';
import { useStore } from './lib/store';
import { checkProximity, sendNotification, checkMealTime, requestNotificationPermission } from './lib/notifications';

import Visited from './pages/Visited';
import Badges from './pages/Badges';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Trash from './pages/Trash';
import Rankings from './pages/Rankings';
import LevelUpModal from './components/LevelUpModal';

const libraries = ['places'];

function OnboardingGuard({ children }) {
  const profile = useStore(state => state.profile);
  const loading = useStore(state => state.loading);

  if (loading || !profile) return children;

  const needsOnboarding = !profile.has_onboarded && (!profile.favorite_cuisines || profile.favorite_cuisines.length === 0);

  if (needsOnboarding) {
    return <Navigate to="/onboarding" replace />;
  }

  return children;
}

export default function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const restaurants = useStore(state => state.restaurants);
  const prefs = useStore(state => state.notificationPreferences);

  useEffect(() => {
    // Register Service Worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(reg => console.log('SW Registered', reg))
        .catch(err => console.error('SW Error', err));
    }

    // Splash screen timer
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    // Check active session
    supabase.auth.getSession().then(({ data: { session: currentSession } }) => {
      setSession(currentSession);
      setLoading(false);
    }).catch(err => {
      console.error("Supabase Session Error:", err);
      setLoading(false);
    });

    // Listen for changes on auth state
    const { data: authListener } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => {
      clearTimeout(timer);
      if (authListener?.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, []); // Only run on mount

  // Notification Loop Effect
  useEffect(() => {
    if (!session || !prefs) return;

    const notificationInterval = setInterval(() => {
      // 1. Check Meal Times
      const meal = checkMealTime();
      if (meal && prefs[meal]) {
        sendNotification(
          meal === 'lunch' ? 'Time for Lunch!' : 'Time for Dinner!',
          `Hungry? Check out your culinary list for inspiration.`
        );
      }

      // 2. Check Proximity
      if (prefs.nearby) {
        navigator.geolocation.getCurrentPosition((pos) => {
          const userCoords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const nearbyPlace = checkProximity(userCoords, restaurants);
          if (nearbyPlace) {
            sendNotification(
              "You're nearby!",
              `${nearbyPlace.name} is just around the corner. Want to stop by?`
            );
          }
        });
      }
    }, 60000); // Check every minute

    return () => clearInterval(notificationInterval);
  }, [session, restaurants, prefs]);

  if (loading && showSplash) return <SplashScreen isVisible={true} />;

  return (
    <>
      <SplashScreen isVisible={showSplash} />
      <BrowserRouter>
        <LevelUpModal />
        <ScrollToTop />
        <LoadScriptNext
          googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
          libraries={libraries}
        >
          <Routes>
            <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />

            {/* Onboarding is outside the main Layout for fullscreen experience */}
            <Route
              path="/onboarding"
              element={session ? <Onboarding /> : <Navigate to="/auth" />}
            />

            <Route path="/" element={session ? <Layout /> : <Navigate to="/auth" />}>
              <Route index element={
                <OnboardingGuard>
                  <Home />
                </OnboardingGuard>
              } />
              <Route path="map" element={<MapPage />} />
              <Route path="add" element={<AddRestaurant />} />
              <Route path="clubs" element={<Clubs />} />
              <Route path="clubs/:id" element={<ClubDetails />} />
              <Route path="join/:token" element={<Clubs />} />
              <Route path="stats" element={<Stats />} />
              <Route path="visited" element={<Visited />} />
              <Route path="badges" element={<Badges />} />
              <Route path="rankings" element={<Rankings />} />
              <Route path="restaurant/:id" element={<RestaurantDetails />} />
              <Route path="profile" element={<Profile />} />
              <Route path="trash" element={<Trash />} />
            </Route>
          </Routes>
        </LoadScriptNext>
      </BrowserRouter>
    </>
  );
}
