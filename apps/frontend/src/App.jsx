import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Production from "./pages/Production";
import Learning from "./pages/Learning";
import LiveStage from "./pages/LiveStage";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/production" element={<Production />} />
        <Route path="/learning" element={<Learning />} />
        <Route path="/live-stage" element={<LiveStage />} />
      </Route>
    </Routes>
  );
}
