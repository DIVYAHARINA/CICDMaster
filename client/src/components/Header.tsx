import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Link } from "wouter";
import { ModeToggle } from "./mode-toggle";

export default function Header() {
  return (
    <header className="bg-white dark:bg-neutral-800 border-b border-neutral-200 dark:border-neutral-700 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center">
              <FontAwesomeIcon icon="random" className="text-primary text-2xl mr-2" />
              <Link href="/">
                <span className="font-bold text-xl cursor-pointer">CI/CD Dashboard</span>
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <button className="p-1 text-neutral-500 hover:text-primary focus:outline-none">
                <FontAwesomeIcon icon="bell" className="text-xl" />
                <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-error"></span>
              </button>
            </div>
            <ModeToggle />
            <div className="flex items-center">
              <button className="flex items-center space-x-2 hover:bg-neutral-100 dark:hover:bg-neutral-700 p-2 rounded-md">
                <div className="h-8 w-8 rounded-full bg-neutral-300 dark:bg-neutral-600 flex items-center justify-center">
                  <FontAwesomeIcon icon="user" className="text-neutral-500 dark:text-neutral-400" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
