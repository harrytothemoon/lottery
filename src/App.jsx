import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import Lawin from './projects/Lawin';
import Lodibet from './projects/Lodibet';
import Integrate from './projects/Integrate';
import Naseebet from './projects/Naseebet';
import ProgressDraw from './projects/ProgressDraw';

const App = () => {
  return (
    <Router basename="/lottery">
      <Routes>
        <Route path="/lawin" element={<Lawin />} />
        <Route path="/lodibet" element={<Lodibet />} />
        <Route path="/integrate" element={<Integrate />} />
        <Route path="/naseebet" element={<Naseebet />} />
        <Route path="/progress" element={<ProgressDraw />} />
        <Route path="*" element={<Navigate to="/lawin" replace />} />
      </Routes>
    </Router>
  );
};

export default App;
