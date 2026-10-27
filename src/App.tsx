import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './auth/AuthProvider'
import { RequireAuth } from './auth/RequireAuth'
import { TripProvider } from './store/TripStore'
import { AppShell } from './components/layout/AppShell'
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
          <Route path="/login" element={<Login />} />
          <Route path="/cadastro" element={<Cadastro />} />

          <Route
            element={
              <RequireAuth>
                <TripProvider>
                  <AppShell />
                </TripProvider>
              </RequireAuth>
            }
          >
            <Route index element={<MinhasViagens />} />
            <Route path="planejamento" element={<Planejamento />} />
            <Route path="roteiro" element={<Roteiro />} />
            <Route path="mapa" element={<Mapa />} />
            <Route path="viagem" element={<ViagemDashboard />} />
            <Route path="nova-viagem" element={<CriarViagem />} />
            <Route path="cadastro/local" element={<CadastroLocal />} />
            <Route path="cadastro/passagem" element={<CadastroPassagem />} />
            <Route path="cadastro/hotel" element={<CadastroHotel />} />
            <Route path="listas" element={<Listas />} />
            <Route path="estados" element={<Estados />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
