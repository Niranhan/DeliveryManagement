import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';
import { AppDataProvider } from '@/context/AppDataContext';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { LoginScreen } from '@/screens/LoginScreen';
import { HomeScreen } from '@/screens/HomeScreen';

const ActiveOrdersScreen = lazy(() =>
  import('@/screens/ActiveOrdersScreen').then((m) => ({ default: m.ActiveOrdersScreen })),
);
const OrdersScreen = lazy(() =>
  import('@/screens/OrdersScreen').then((m) => ({ default: m.OrdersScreen })),
);
const OrderDetailsScreen = lazy(() =>
  import('@/screens/OrderDetailsScreen').then((m) => ({ default: m.OrderDetailsScreen })),
);
const RestaurantsScreen = lazy(() =>
  import('@/screens/RestaurantsScreen').then((m) => ({ default: m.RestaurantsScreen })),
);
const AddRestaurantScreen = lazy(() =>
  import('@/screens/AddRestaurantScreen').then((m) => ({ default: m.AddRestaurantScreen })),
);
const EditRestaurantScreen = lazy(() =>
  import('@/screens/EditRestaurantScreen').then((m) => ({ default: m.EditRestaurantScreen })),
);
const AddOrderScreen = lazy(() =>
  import('@/screens/AddOrderScreen').then((m) => ({ default: m.AddOrderScreen })),
);
const CompleteDeliveryScreen = lazy(() =>
  import('@/screens/CompleteDeliveryScreen').then((m) => ({ default: m.CompleteDeliveryScreen })),
);
const DailySummaryScreen = lazy(() =>
  import('@/screens/DailySummaryScreen').then((m) => ({ default: m.DailySummaryScreen })),
);
const MoreScreen = lazy(() =>
  import('@/screens/MoreScreen').then((m) => ({ default: m.MoreScreen })),
);
const HistoryScreen = lazy(() =>
  import('@/screens/HistoryScreen').then((m) => ({ default: m.HistoryScreen })),
);
const DutyHistoryScreen = lazy(() =>
  import('@/screens/DutyHistoryScreen').then((m) => ({ default: m.DutyHistoryScreen })),
);
const DutyDetailScreen = lazy(() =>
  import('@/screens/DutyDetailScreen').then((m) => ({ default: m.DutyDetailScreen })),
);
const MonthlyOverviewScreen = lazy(() =>
  import('@/screens/MonthlyOverviewScreen').then((m) => ({ default: m.MonthlyOverviewScreen })),
);
const SalaryScreen = lazy(() =>
  import('@/screens/SalaryScreen').then((m) => ({ default: m.SalaryScreen })),
);
const SalaryAdvancesScreen = lazy(() =>
  import('@/screens/SalaryAdvancesScreen').then((m) => ({ default: m.SalaryAdvancesScreen })),
);
const CompanyLiabilityScreen = lazy(() =>
  import('@/screens/CompanyLiabilityScreen').then((m) => ({ default: m.CompanyLiabilityScreen })),
);

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50">
      <div className="h-7 w-7 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  );
}

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
                  <Suspense fallback={<RouteFallback />}>
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
                      <Route path="/history" element={<HistoryScreen />} />
                      <Route path="/history/duty" element={<DutyHistoryScreen />} />
                      <Route path="/duty/:id" element={<DutyDetailScreen />} />
                      <Route path="/monthly" element={<MonthlyOverviewScreen />} />
                      <Route path="/salary" element={<SalaryScreen />} />
                      <Route path="/advances" element={<SalaryAdvancesScreen />} />
                      <Route path="/liabilities" element={<CompanyLiabilityScreen />} />
                      <Route path="*" element={<Navigate to="/home" replace />} />
                    </Routes>
                  </Suspense>
                </AppDataProvider>
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}