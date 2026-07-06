import { useState, useEffect } from 'react';
import { doc, getDoc, getDocFromServer } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './lib/firebase';
import { LandingPageData } from './types';
import { defaultLandingPageData } from './defaultData';
import LandingPage from './components/LandingPage';
import AdminPanel from './components/AdminPanel';
import { Sparkles, Loader2 } from 'lucide-react';

export default function App() {
  const [data, setData] = useState<LandingPageData>(defaultLandingPageData);
  const [adminOpen, setAdminOpen] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Mandatory: Validate connection to Firestore on boot
  useEffect(() => {
    async function testConnection() {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        console.log('Firebase Firestore connection tested successfully.');
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. Client is offline.");
        }
      }
    }
    testConnection();
  }, []);

  // Fetch landing page config on load
  useEffect(() => {
    async function fetchLandingPageConfig() {
      // Check localStorage first as a fallback/cache for sandbox mode
      let initialData = defaultLandingPageData;
      try {
        const localData = localStorage.getItem('lean90_sandbox_landing_page');
        if (localData) {
          initialData = { ...defaultLandingPageData, ...JSON.parse(localData) };
        }
      } catch (e) {
        console.warn('Error loading sandbox data from localStorage:', e);
      }

      const docPath = 'configs/landing_page';
      try {
        const docSnap = await getDoc(doc(db, 'configs', 'landing_page'));
        if (docSnap.exists()) {
          const fetched = docSnap.data() as LandingPageData;
          // Merge in case schema evolved, prioritizing fetched Firestore data
          setData({
            ...initialData,
            ...fetched,
            header: { ...initialData.header, ...fetched.header },
            hero: { ...initialData.hero, ...fetched.hero },
            problem: { ...initialData.problem, ...fetched.problem },
            bento: { ...initialData.bento, ...fetched.bento },
            included: { ...initialData.included, ...fetched.included },
            bonuses: { ...initialData.bonuses, ...fetched.bonuses },
            results: { ...initialData.results, ...fetched.results },
            pricing: { ...initialData.pricing, ...fetched.pricing },
            faq: { ...initialData.faq, ...fetched.faq },
            footer: { ...initialData.footer, ...fetched.footer }
          });
        } else {
          // If document doesn't exist, use initialData (which contains localStorage edits if present)
          setData(initialData);
        }
      } catch (err: any) {
        console.warn('Could not load landing page config from Firestore. Falling back to defaults.', err);
        // Fallback silently to initialData
        setData(initialData);
      } finally {
        setIsLoading(false);
      }
    }

    fetchLandingPageConfig();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white space-y-4">
        <div className="relative">
          <Loader2 className="w-12 h-12 text-emerald-500 animate-spin" />
          <Sparkles className="w-6 h-6 text-emerald-400 absolute -top-1.5 -right-1.5 animate-pulse" />
        </div>
        <div className="text-center">
          <h3 className="font-bold text-lg text-emerald-400">Loading Lean90 Engine</h3>
          <p className="text-xs text-slate-400 mt-1">Connecting to live cloud database...</p>
        </div>
      </div>
    );
  }

  return (
    <div id="app-root" className="relative min-h-screen">
      <LandingPage 
        data={data} 
        onOpenAdmin={() => setAdminOpen(true)} 
        isAdminLoggedIn={isAdminLoggedIn} 
      />

      {adminOpen && (
        <AdminPanel
          data={data}
          onUpdateData={(newData) => setData(newData)}
          onClose={() => setAdminOpen(false)}
          onAdminLoginStateChange={(isLoggedIn) => setIsAdminLoggedIn(isLoggedIn)}
        />
      )}
    </div>
  );
}
