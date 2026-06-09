import { HashRouter, Routes, Route, Navigate } from 'react-router-dom'
import { DataProvider } from './context/DataContext'
import AuthGuard from './components/AuthGuard'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ContractList from './pages/ContractList'
import ContractDetail from './pages/ContractDetail'
import NewContract from './pages/NewContract'
import Statement from './pages/Statement'
import ContactList from './pages/ContactList'
import ContactDetail from './pages/ContactDetail'
import SettingsLayout, { SettingsIndex } from './pages/settings/SettingsLayout'
import GeneralSettings from './pages/settings/GeneralSettings'
import UsersSettings from './pages/settings/UsersSettings'
import ProductsSettings from './pages/settings/ProductsSettings'
import NominalsSettings from './pages/settings/NominalsSettings'
import NotificationsSettings from './pages/settings/NotificationsSettings'
import IntegrationsSettings from './pages/settings/IntegrationsSettings'
import AuditSettings from './pages/settings/AuditSettings'

export default function App() {
  return (
    <DataProvider>
      <HashRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<AuthGuard />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard"            element={<Dashboard />} />
              <Route path="contracts"            element={<ContractList />} />
              <Route path="contracts/new"        element={<NewContract />} />
              <Route path="contracts/:id"        element={<ContractDetail />} />
              <Route path="contracts/:id/statement" element={<Statement />} />
              <Route path="contacts"             element={<ContactList />} />
              <Route path="contacts/:id"         element={<ContactDetail />} />
              <Route path="settings" element={<SettingsLayout />}>
                <Route index element={<SettingsIndex />} />
                <Route path="general"       element={<GeneralSettings />} />
                <Route path="users"         element={<UsersSettings />} />
                <Route path="products"      element={<ProductsSettings />} />
                <Route path="nominals"      element={<NominalsSettings />} />
                <Route path="notifications" element={<NotificationsSettings />} />
                <Route path="integrations"  element={<IntegrationsSettings />} />
                <Route path="audit"         element={<AuditSettings />} />
              </Route>
            </Route>
          </Route>
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </HashRouter>
    </DataProvider>
  )
}
