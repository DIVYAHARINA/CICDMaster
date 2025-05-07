import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Initialize FontAwesome (replacing the external CDN from the design reference)
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faRandom, faBell, faUser, faTachometerAlt, faCodeBranch, 
  faHistory, faServer, faCog, faWrench, faKey, faUserShield,
  faPlus, faCheck, faTimes, faRocket, faClock, faSyncAlt,
  faCodeCommit, faCircle, faSpinner, faUserCircle, faExternalLinkAlt,
  faInfoCircle, faCloud
} from '@fortawesome/free-solid-svg-icons';

// Add all icons to the library
library.add(
  faRandom, faBell, faUser, faTachometerAlt, faCodeBranch, 
  faHistory, faServer, faCog, faWrench, faKey, faUserShield,
  faPlus, faCheck, faTimes, faRocket, faClock, faSyncAlt,
  faCodeCommit, faCircle, faSpinner, faUserCircle, faExternalLinkAlt,
  faInfoCircle, faCloud
);

createRoot(document.getElementById("root")!).render(<App />);
