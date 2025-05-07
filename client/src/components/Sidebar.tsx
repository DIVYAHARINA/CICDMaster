import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link, useLocation } from "wouter";

export default function Sidebar() {
  const [location] = useLocation();
  
  return (
    <aside className="w-64 bg-white dark:bg-neutral-800 border-r border-neutral-200 dark:border-neutral-700 flex-shrink-0 hidden md:block">
      <div className="h-full flex flex-col">
        <nav className="flex-1 px-2 py-4 space-y-1">
          <Link href="/">
            <div className={`${location === "/" ? "bg-neutral-100 dark:bg-neutral-700 text-primary" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-primary"} group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer`}>
              <FontAwesomeIcon icon="tachometer-alt" className={`w-6 h-6 mr-3 ${location === "/" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`} />
              Dashboard
            </div>
          </Link>
          
          <Link href="/pipelines">
            <div className={`${location === "/pipelines" ? "bg-neutral-100 dark:bg-neutral-700 text-primary" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-primary"} group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer`}>
              <FontAwesomeIcon icon="code-branch" className={`w-6 h-6 mr-3 ${location === "/pipelines" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`} />
              Pipelines
            </div>
          </Link>
          
          <Link href="/build-history">
            <div className={`${location === "/build-history" ? "bg-neutral-100 dark:bg-neutral-700 text-primary" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-primary"} group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer`}>
              <FontAwesomeIcon icon="history" className={`w-6 h-6 mr-3 ${location === "/build-history" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`} />
              Build History
            </div>
          </Link>
          
          <div className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-primary group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer">
            <FontAwesomeIcon icon="server" className="w-6 h-6 mr-3 text-neutral-500 dark:text-neutral-400" />
            Containers
          </div>
          
          <Link href="/configuration">
            <div className={`${location === "/configuration" ? "bg-neutral-100 dark:bg-neutral-700 text-primary" : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-primary"} group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer`}>
              <FontAwesomeIcon icon="cog" className={`w-6 h-6 mr-3 ${location === "/configuration" ? "text-primary" : "text-neutral-500 dark:text-neutral-400"}`} />
              Configuration
            </div>
          </Link>
          
          <div className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-primary group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer">
            <FontAwesomeIcon icon="wrench" className="w-6 h-6 mr-3 text-neutral-500 dark:text-neutral-400" />
            Tools
          </div>
          
          <div className="pt-4">
            <div className="px-3 text-xs font-semibold text-neutral-500 dark:text-neutral-400 uppercase tracking-wider">
              Settings
            </div>
            <div className="mt-2 space-y-1">
              <div className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-primary group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer">
                <FontAwesomeIcon icon="key" className="w-6 h-6 mr-3 text-neutral-500 dark:text-neutral-400" />
                Credentials
              </div>
              <div className="text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 hover:text-primary group flex items-center px-3 py-2 text-sm font-medium rounded-md cursor-pointer">
                <FontAwesomeIcon icon="user-shield" className="w-6 h-6 mr-3 text-neutral-500 dark:text-neutral-400" />
                Security
              </div>
            </div>
          </div>
        </nav>
      </div>
    </aside>
  );
}
