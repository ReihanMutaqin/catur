import { Routes, Route } from 'react-router'
import { Toaster } from "@/components/ui/sonner"
import Protected from "@/components/Protected"
import Home from './pages/Home'
import Game from "./pages/Game"
import Leaderboard from "./pages/Leaderboard"
import Profile from "./pages/Profile"
import Login from "./pages/Login"
import NotFound from "./pages/NotFound"

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Protected><Home /></Protected>} />
        <Route path="/game/:id" element={<Protected><Game /></Protected>} />
        <Route path="/leaderboard" element={<Protected><Leaderboard /></Protected>} />
        <Route path="/profile" element={<Protected><Profile /></Protected>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      <Toaster position="top-center" richColors />
    </>
  )
}
