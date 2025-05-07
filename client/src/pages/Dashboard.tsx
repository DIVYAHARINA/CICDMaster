import { Button } from "@/components/ui/button";
import Header from "@/components/Header";
import Sidebar from "@/components/Sidebar";
import MobileNavbar from "@/components/MobileNavbar";
import StatusOverview from "@/components/dashboard/StatusOverview";
import ActivePipelines from "@/components/dashboard/ActivePipelines";
import DeploymentHistory from "@/components/dashboard/DeploymentHistory";
import BuildLogs from "@/components/dashboard/BuildLogs";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default function Dashboard() {
  return (
    <div className="bg-neutral-100 dark:bg-neutral-900 font-sans text-neutral-900 dark:text-neutral-100 min-h-screen flex flex-col">
      <Header />
      
      <div className="flex-grow flex overflow-hidden">
        <Sidebar />
        
        <main className="flex-1 overflow-y-auto bg-neutral-100 dark:bg-neutral-900 p-6">
          <div className="max-w-7xl mx-auto">
            <div className="md:flex md:items-center md:justify-between mb-6">
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl font-bold text-neutral-900 dark:text-neutral-100">CI/CD Pipeline Dashboard</h1>
                <p className="mt-1 text-sm text-neutral-500 dark:text-neutral-400">
                  Automated workflows for testing, building, and deploying your applications
                </p>
              </div>
              <div className="mt-4 flex md:mt-0 md:ml-4">
                <Button>
                  <FontAwesomeIcon icon="plus" className="-ml-1 mr-2 h-5 w-5" />
                  New Pipeline
                </Button>
              </div>
            </div>
            
            <StatusOverview />
            <ActivePipelines />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <DeploymentHistory />
              <BuildLogs />
            </div>
          </div>
        </main>
      </div>
      
      <MobileNavbar />
    </div>
  );
}
