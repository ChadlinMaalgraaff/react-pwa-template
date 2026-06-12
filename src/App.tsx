import { Routes, Route } from 'react-router-dom'
import Layout from '@components/layout/Layout/Layout'
import Dashboard from '@components/pages/Dashboard/Dashboard'
import NotFound from '@components/pages/NotFound/NotFound'

function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App
