/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
  Navigate,
} from "react-router-dom";
import 'react-toastify/dist/ReactToastify.css';
import NotFound from "./pages/notfound/404";
import { ToastContainer } from "react-toastify";
import WordGameApp from "./pages/gameArea/game_area";
import WordStakeLanding from "./pages/home/page";
import WordStakeDashboard from "./pages/dashboard/page";

const App = () => {
  const token = localStorage.getItem('ws_refresh_token');

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route path="/" >
           <Route path="/wordstake" element={ token ? <WordStakeDashboard/> : <Navigate to="/" />} />
           <Route path="/wordstake/play" element={ token ? <WordGameApp/> : <Navigate to="/" /> } />
           <Route path="/" element={!token ? <WordStakeLanding/>:<Navigate to="/wordstake" /> } />
           <Route path="*" element={<NotFound/>} />
        </Route>
      </>
    )
  );

  return (
    <>
         <div className="pop-modal hidden fixed z-1900 w-full h-full bg-black/90 bg-opacity-100 flex items-center justify-center" id="isSending">
        <div className="modal-content bg-gray-900 rounded-xl p-8 shadow-2xl max-w-md mx-auto">
          <div className="flex flex-col items-center">
            {/* Logo with pulse animation */}
            <div className="relative mb-6">
              {/* <div className="absolute inset-0 bg-blue-500 rounded-full opacity-30 animate-ping"></div> */}
              <div className="relative z-10 p-2">
              <span className="text-xl font-bold bg-gradient-to-r from-purple-400 to-blue-500 bg-clip-text text-transparent">WordStake</span>
              </div>
            </div>
            
            {/* Loading spinner */}
            <div className="loader mb-4">
              <svg className="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
            
            {/* Loading text */}
            <div className="text-center">
              <p className="text-blue-400 font-medium text-lg mb-1" id="sending-msg"></p>
              <p className="text-gray-400 text-sm">Please wait a moment</p>
            </div>
            
            {/* Progress bar */}
            {/* <div className="w-full bg-gray-700 rounded-full h-1.5 mt-6 overflow-hidden">
              <div className="bg-blue-500 h-1.5 rounded-full animate-pulse" style={{width: '70%'}}></div>
            </div> */}
          </div>
        </div>
      </div>
      <div className="font-quiche">
        <RouterProvider router={router} />
      </div>
        <div className="flex fixed z-487834762736723"><ToastContainer /></div>
    </>
  );
};

export default App;
