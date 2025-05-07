import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation } from "wouter";

export default function MobileNavbar() {
  const [location] = useLocation();
  
  return (
    <div className="md:hidden fixed bottom-0 w-full border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <div className="flex">
        <Link href="/">
          <a className={`flex-1 flex flex-col items-center py-3 ${location === "/" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`}>
            <FontAwesomeIcon icon="tachometer-alt" className="text-lg" />
            <span className="text-xs mt-1">Dashboard</span>
          </a>
        </Link>
        
        <Link href="/pipelines">
          <a className={`flex-1 flex flex-col items-center py-3 ${location === "/pipelines" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`}>
            <FontAwesomeIcon icon="code-branch" className="text-lg" />
            <span className="text-xs mt-1">Pipelines</span>
          </a>
        </Link>
        
        <Link href="/build-history">
          <a className={`flex-1 flex flex-col items-center py-3 ${location === "/build-history" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`}>
            <FontAwesomeIcon icon="history" className="text-lg" />
            <span className="text-xs mt-1">History</span>
          </a>
        </Link>
        
        <Link href="/configuration">
          <a className={`flex-1 flex flex-col items-center py-3 ${location === "/configuration" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`}>
            <FontAwesomeIcon icon="cog" className="text-lg" />
            <span className="text-xs mt-1">Settings</span>
          </a>
        </Link>
      </div>
    </div>
  );
}
