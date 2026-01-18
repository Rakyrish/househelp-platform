import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
// import {BrowserRouter as Router, Route, BrowserRouter} from 'react-router-dom';
import Header from './layout/header';
import Footer from './layout/footer';

import Home from './pages/Home/Home';
import About from './pages/Home/about';
import Services from './pages/Home/services';
import Why from './pages/Home/why';
import RegisterWorker from "./auth/register/Worker";
import RegisterEmployer from "./auth/register/Employer";
import Worker from './components/worker';
import Employer from './components/employer';
import WorkerDirectory from "./pages/Dashboard/WorkerDirectory";


function App() {
  return (
    <BrowserRouter>
       <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/services" element={<Services />} />
        <Route path="/why" element={<Why />} />
        <Route path="/register/worker" element={<RegisterWorker />} />
        <Route path="/register/employer" element={<RegisterEmployer />} />
        <Route path="/dashboard/worker" element={<Worker />} />
        <Route path="/dashboard/employer" element={<Employer />} />
        <Route path="/dashboard/workerDir" element={<WorkerDirectory />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Footer />
    </BrowserRouter>  
  );
}
export default App;