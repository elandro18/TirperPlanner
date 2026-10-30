import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { TripProvider } from './store/TripStore'
import { AppShell } from './components/layout/AppShell'
import { Landing } from './screens/Landing'
import { Login } from './screens/Login'
import { Cadastro } from './screens/Cadastro'
import { MinhasViagens } from './screens/MinhasViagens'
import { Planejamento } from './screens/Planejamento'
import { Roteiro } from './screens/Roteiro'
import { Mapa } from './screens/Mapa'
import { ViagemDashboard } from './screens/ViagemDashboard'
import { CriarViagem } from './screens/CriarViagem'
import { CadastroLocal } from './screens/CadastroLocal'
import { CadastroPassagem } from './screens/CadastroPassagem'
import { CadastroHotel } from './screens/CadastroHotel'
import { Listas } from './screens/Listas'
import { Estados } from './screens/Estados'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Públicas — a landing é exibida sem sessão e sem AppShell */}
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          {/* App autenticado — layout sem path, filhos com caminho absoluto */}
          <Route
            element={
              <RequireAuth>
                <TripProvider>
                  <AppShell />
                </TripProvider>
              </RequireAuth>
            }
          >
            <Route path="/inicio" element={<MinhasViagens />} />
            <Route path="/planejamento" element={<Planejamento />} />
            <Route path="/roteiro" element={<Roteiro />} />
            <Route path="/mapa" element={<Mapa />} />
            <Route path="/viagem" element={<ViagemDashboard />} />
            <Route path="/nova-viagem" element={<CriarViagem />} />
            <Route path="/cadastro/local" element={<CadastroLocal />} />
            <Route path="/cadastro/passagem" element={<CadastroPassagem />} />
            <Route path="/cadastro/hotel" element={<CadastroHotel />} />
            <Route path="/listas" element={<Listas />} />
            <Route path="/estados" element={<Estados />} />
          </Route>

          {/* Fallback público */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
