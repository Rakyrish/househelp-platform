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
      </Routes>
      <Footer />
    </BrowserRouter>  
  );
}
export default App;