/* eslint-disable react-refresh/only-export-components */
/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { createContext, type ReactNode, useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { setCurrentUser } from "../states/userSlice";
import { makeRequest } from "../hook/useApi";
import { isSending } from "../utils/useutils";
import { db } from "../dexieDB";
import { getGamerApi} from "../api";

export const UserContext = createContext<any>(undefined);

// Internal component that uses useLocation
const UserContextInner = ({ children }: { children: ReactNode }) => {
  const dispatch = useDispatch();
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const token = localStorage.getItem('ws_refresh_token');
  const pubkey = localStorage.getItem('pubkey');

  // Listen to route changes using native browser API
  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    // Listen to browser navigation
    window.addEventListener('popstate', handleLocationChange);
    
    // Listen to programmatic navigation (pushState/replaceState)
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;
    
    history.pushState = function(...args) {
      originalPushState.apply(history, args);
      handleLocationChange();
    };
    
    history.replaceState = function(...args) {
      originalReplaceState.apply(history, args);
      handleLocationChange();
    };

    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      history.pushState = originalPushState;
      history.replaceState = originalReplaceState;
    };
  }, []);

  // Check if user is on home page
  const isHomePage = currentPath === '/' || currentPath === '/home';

  const getGamer = async (pubkey: any) => {
    // isSending(true, "Initializing...");
    const Cached = await db.cached_data.get(`gamer_${pubkey}`);
    if(Cached) {dispatch(setCurrentUser(Cached))}
    const { res, error } = await makeRequest("POST", getGamerApi, {pubkey}, ()=>{isSending(false, "")}, token, null, "urlencoded");
    if (res) {
      await db.cached_data.put(res.data, `gamer_${pubkey}`);
      dispatch(setCurrentUser(res?.data));
      return true;
    }
    return false;
  }

  // Only depend on token and currentPath
  useEffect(() => {
    // Only call getGamer if user has token, pubkey, and is NOT on home page
    if(token && pubkey && !isHomePage) {
      Promise.all([
        getGamer(pubkey),
      ])
    }
  }, [token, currentPath])

  return (
    <UserContext.Provider
      value={{
        pubkey,
        getGamer,
        token,
        isHomePage,
        currentPath
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const UserContextProvider = ({ children }: { children: ReactNode }) => {
  return <UserContextInner>{children}</UserContextInner>;
};