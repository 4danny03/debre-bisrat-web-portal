
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import { DataProvider } from "./contexts/DataContext";

function App() {
  return (
    <DataProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Index />} />
        </Routes>
      </Router>
    </DataProvider>
  );
}

export default App;
