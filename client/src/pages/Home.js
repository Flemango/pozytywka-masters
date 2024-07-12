
// export default function Home() {
//     return (
//         <>
//             <h2>Home Page</h2>
//         </>
//     )
// }

import Navbar from '../components/Navbar.js';
import Footer from '../components/Footer.js';

function Home() {
  return (
    <div className="home" id="home">
      <div className="home-content">
        <Navbar />
        <h1>Welcome to Our Psychology Practice</h1>
        <p>Your mental well-being is our priority. We offer personalized therapy to help you navigate life's challenges.</p>
        <button className="home-button">Learn More</button>
        <Footer />
      </div>
    </div>
  );
}

export default Home;