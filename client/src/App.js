import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css';
import HomePage from "./pages/HomePage";
import RegisterPage from "./pages/RegisterPage";
import LoginPage from "./pages/LoginPage";
import AdminApp from '../admin/AdminApp';
import CreateListing from "./pages/CreateListing";
import ListingDetails from "./pages/ListingDetails";
import TripList from "./pages/TripList";
import WishList from "./pages/WishList";
import PropertyList from "./pages/PropertyList";
import ReservationList from "./pages/ReservationList";
import CategoryPage from './pages/CategoryPage';
import SearchPage from './pages/SearchPage';
import ProfileSettings from './pages/ProfileSettings';
import Contact from "./pages/ContactUs";
import CheckoutForm from './componenets/ChekoutForm';
import { Elements } from '@stripe/react-stripe-js'; // Ajouter cette ligne
import { loadStripe } from '@stripe/stripe-js'; // Ajouter cette ligne

// Créez une instance de Stripe avec votre clé publique
const stripePromise = loadStripe("pk_test_51Qz1XhH4A3C3bxRrvtv45UUq516BqFFipdtQqZ6m7c0VQlg6Fuu0vOkOXsi5ZYduSvRSBMBAqBJjGEJO6ByuiNce00mNKMKuKp");

function App() {
  return (
    <div>
      <BrowserRouter>
        {/* Enveloppez votre Routes avec Elements */}
        <Elements stripe={stripePromise}>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/admin/*" element={<AdminApp />} />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/properties/:listingId" element={<ListingDetails />} />
            <Route path="/properties/category/:category" element={<CategoryPage />} />
            <Route path="/properties/search/:search" element={<SearchPage />} />
            <Route path="/:userId/trips" element={<TripList />} />
            <Route path="/:userId/wishList" element={<WishList />} />
            <Route path="/:userId/properties" element={<PropertyList />} />
            <Route path="/:userId/reservations" element={<ReservationList />} />
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/checkout" element={<CheckoutForm />} />
          </Routes>
        </Elements>
      </BrowserRouter>
    </div>
  );
}

export default App;

