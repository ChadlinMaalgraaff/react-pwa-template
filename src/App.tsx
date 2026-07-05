import { Routes, Route, Navigate } from 'react-router-dom'
import { Layout, CustomerShell } from '@components/layout'
import { ProtectedRoute, AdminRoute, Toast } from '@components/shared'
import NotFound from '@components/pages/NotFound/NotFound'
import Login from '@components/pages/Login/Login'
import Register from '@components/pages/Register/Register'
import AuthCallback from '@components/pages/AuthCallback/AuthCallback'
import Onboarding from '@components/pages/Onboarding/Onboarding'
import Pantry from '@components/pages/Pantry/Pantry'
import StaplesCheckIn from '@components/pages/StaplesCheckIn/StaplesCheckIn'
import PhotoCapture from '@components/pages/PhotoCapture/PhotoCapture'
import PhotoReview from '@components/pages/PhotoReview/PhotoReview'
import RecipeMatch from '@components/pages/RecipeMatch/RecipeMatch'
import RecipeBrowse from '@components/pages/RecipeBrowse/RecipeBrowse'
import RecipeDetail from '@components/pages/RecipeDetail/RecipeDetail'
import Specials from '@components/pages/Specials/Specials'
import ShoppingLists from '@components/pages/ShoppingLists/ShoppingLists'
import ShoppingListDetail from '@components/pages/ShoppingListDetail/ShoppingListDetail'
import Profile from '@components/pages/Profile/Profile'
import AdminDashboard from '@components/pages/AdminDashboard/AdminDashboard'
import IngredientCatalog from '@components/pages/IngredientCatalog/IngredientCatalog'
import RecipeManagement from '@components/pages/RecipeManagement/RecipeManagement'
import RecipeEditor from '@components/pages/RecipeEditor/RecipeEditor'
import RecipeImport from '@components/pages/RecipeImport/RecipeImport'
import RetailerStoreManagement from '@components/pages/RetailerStoreManagement/RetailerStoreManagement'
import SpecialsManagement from '@components/pages/SpecialsManagement/SpecialsManagement'
import SpecialsUpload from '@components/pages/SpecialsUpload/SpecialsUpload'
import UserManagement from '@components/pages/UserManagement/UserManagement'
import HowItWorksCarousel from '@components/pages/HowItWorksCarousel/HowItWorksCarousel'

function App() {
  return (
    <>
      <Routes>
        {/* Public routes - no shell, no auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="/onboarding" element={<Onboarding />} />

        <Route element={<ProtectedRoute />}>
          {/* Full-screen customer flows - no shell */}
          <Route path="/how-it-works" element={<HowItWorksCarousel />} />
          <Route path="/staples" element={<StaplesCheckIn />} />
          <Route path="/pantry/capture" element={<PhotoCapture />} />
          <Route path="/pantry/capture/review" element={<PhotoReview />} />
          <Route path="/recipes/:id" element={<RecipeDetail />} />

          {/* Customer shell routes */}
          <Route element={<CustomerShell />}>
            <Route path="/pantry" element={<Pantry />} />
            <Route path="/recipes" element={<RecipeMatch />} />
            <Route path="/recipes/browse" element={<RecipeBrowse />} />
            <Route path="/specials" element={<Specials />} />
            <Route path="/shopping-lists" element={<ShoppingLists />} />
            <Route path="/shopping-lists/:id" element={<ShoppingListDetail />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Admin shell routes */}
          <Route element={<AdminRoute />}>
            <Route element={<Layout />}>
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/ingredients" element={<IngredientCatalog />} />
              <Route path="/admin/recipes" element={<RecipeManagement />} />
              <Route path="/admin/recipes/new" element={<RecipeEditor />} />
              <Route path="/admin/recipes/import" element={<RecipeImport />} />
              <Route path="/admin/recipes/:id/edit" element={<RecipeEditor />} />
              <Route path="/admin/retailers" element={<RetailerStoreManagement />} />
              <Route path="/admin/specials" element={<SpecialsManagement />} />
              <Route path="/admin/specials/upload" element={<SpecialsUpload />} />
              <Route path="/admin/users" element={<UserManagement />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/pantry" replace />} />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toast />
    </>
  )
}

export default App
