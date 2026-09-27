import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AppDataProvider } from '@/context/AppDataContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginScreen } from '@/screens/LoginScreen';
import { HomeScreen } from '@/screens/HomeScreen';
import { ActiveOrdersScreen } from '@/screens/ActiveOrdersScreen';
import { OrdersScreen } from '@/screens/OrdersScreen';
import { OrderDetailsScreen } from '@/screens/OrderDetailsScreen';
import { RestaurantsScreen } from '@/screens/RestaurantsScreen';
import { AddRestaurantScreen } from '@/screens/AddRestaurantScreen';
import { EditRestaurantScreen } from '@/screens/EditRestaurantScreen';
import { AddOrderScreen } from '@/screens/AddOrderScreen';
import { CompleteDeliveryScreen } from '@/screens/CompleteDeliveryScreen';
import { DailySummaryScreen } from '@/screens/DailySummaryScreen';
import { MoreScreen } from '@/screens/MoreScreen';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginScreen />} />
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <AppDataProvider>
                  <Routes>
                    <Route path="/home" element={<HomeScreen />} />
                    <Route path="/active" element={<ActiveOrdersScreen />} />
                    <Route path="/orders" element={<OrdersScreen />} />
                    <Route path="/orders/:id" element={<OrderDetailsScreen />} />
                    <Route path="/orders/new" element={<AddOrderScreen />} />
                    <Route path="/orders/:id/complete" element={<CompleteDeliveryScreen />} />
                    <Route path="/restaurants" element={<RestaurantsScreen />} />
                    <Route path="/restaurants/new" element={<AddRestaurantScreen />} />
                    <Route path="/restaurants/:id/edit" element={<EditRestaurantScreen />} />
                    <Route path="/summary" element={<DailySummaryScreen />} />
                    <Route path="/more" element={<MoreScreen />} />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                </AppDataProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
