import { useState, useEffect } from 'react';
import { 
  X, 
  Save, 
  RotateCcw, 
  LogIn, 
  LogOut, 
  ShieldCheck, 
  Plus, 
  Trash2, 
  Sparkles, 
  AlertCircle,
  FolderSync,
  HelpCircle,
  Check
} from 'lucide-react';
import { LandingPageData } from '../types';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { db, auth, handleFirestoreError, OperationType } from '../lib/firebase';
import { defaultLandingPageData } from '../defaultData';
import ImageUploader from './ImageUploader';

interface AdminPanelProps {
  data: LandingPageData;
  onUpdateData: (newData: LandingPageData) => void;
  onClose: () => void;
  onAdminLoginStateChange: (isLoggedIn: boolean) => void;
}

export default function AdminPanel({ data, onUpdateData, onClose, onAdminLoginStateChange }: AdminPanelProps) {
  const [user, setUser] = useState<User | null>(null);
  const [sandboxMode, setSandboxMode] = useState(false);
  const [editableData, setEditableData] = useState<LandingPageData>(JSON.parse(JSON.stringify(data)));
  const [activeTab, setActiveTab] = useState<'brand' | 'hero' | 'problem' | 'bento' | 'included' | 'bonuses' | 'results_pricing' | 'faq'>('brand');
  
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    // Keep track of auth state
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      onAdminLoginStateChange(!!firebaseUser || sandboxMode);
    });
    return () => unsubscribe();
  }, [sandboxMode]);

  const handleGoogleLogin = async () => {
    try {
      setErrorMessage(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
    } catch (err: any) {
      console.error('Google Sign-In failed: ', err);
      setErrorMessage('Sign-In via Google failed. You might be viewing this in a sandboxed iframe with blocked 3rd-party cookies. Try using sandbox/bypass login instead!');
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    setSandboxMode(false);
    onAdminLoginStateChange(false);
  };

  const enableSandbox = async () => {
    try {
      setErrorMessage(null);
      await signInAnonymously(auth);
      setSandboxMode(true);
      onAdminLoginStateChange(true);
    } catch (err: any) {
      console.warn('Anonymous Sign-In fallback active (Anonymous Auth is disabled in Firebase Console):', err);
      // Fallback gracefully so they can still edit locally
      setSandboxMode(true);
      onAdminLoginStateChange(true);
    }
  };

  const handleSaveToFirebase = async () => {
    setIsSaving(true);
    setSaveStatus('idle');
    setErrorMessage(null);

    const docPath = 'configs/landing_page';
    try {
      // If not authenticated and in sandbox mode, go straight to local save
      if (sandboxMode && !auth.currentUser) {
        throw new Error('Sandbox offline fallback');
      }

      // Save directly to Firebase
      await setDoc(doc(db, 'configs', 'landing_page'), {
        ...editableData,
        updatedAt: new Date().toISOString()
      });
      onUpdateData(editableData);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (err: any) {
      // If in sandbox mode, fallback gracefully to saving locally
      if (sandboxMode) {
        console.warn('Firebase save bypassed or failed in Sandbox mode. Saving to browser local storage:', err);
        try {
          localStorage.setItem('lean90_sandbox_landing_page', JSON.stringify(editableData));
          onUpdateData(editableData);
          setSaveStatus('success');
          setTimeout(() => setSaveStatus('idle'), 3000);
          return;
        } catch (localErr: any) {
          console.error('Failed to save to local storage:', localErr);
          setErrorMessage('Local storage save failed: ' + localErr.message);
        }
      }

      console.error('Failed to save to Firestore:', err);
      setSaveStatus('error');
      // Use handleFirestoreError to log proper format as per rules
      try {
        handleFirestoreError(err, OperationType.WRITE, docPath);
      } catch (formattedError: any) {
        setErrorMessage(formattedError.message);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetToDefaults = () => {
    if (confirm('Are you sure you want to reset all configurations to Lean90 defaults? Your current modifications will be lost.')) {
      setEditableData(JSON.parse(JSON.stringify(defaultLandingPageData)));
    }
  };

  const isLoggedIn = !!user || sandboxMode;

  // Render a nice form header
  const renderSectionHeader = (title: string, desc: string) => (
    <div className="border-b border-slate-200 pb-4 mb-6">
      <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
        <Sparkles className="w-5 h-5 text-emerald-600" />
        {title}
      </h3>
      <p className="text-xs text-slate-500 mt-1">{desc}</p>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex bg-slate-900/40 backdrop-blur-sm">
      <div className="ml-auto w-full max-w-4xl bg-white shadow-2xl h-full flex flex-col animate-slide-in-right">
        
        {/* Admin Header */}
        <div className="bg-slate-950 text-white p-5 flex justify-between items-center border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center text-white font-black">L</div>
            <div>
              <h2 className="font-bold text-md flex items-center gap-1.5">
                Lean90 CMS Backend
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full">Firebase Connected</span>
              </h2>
              <p className="text-[10px] text-slate-400">Modify photos, text, and pricing in real-time</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={onClose}
              className="text-slate-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Authentication Wall */}
        {!isLoggedIn ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 bg-slate-50">
            <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 text-center shadow-xl space-y-6">
              <div className="w-16 h-16 bg-emerald-50 rounded-2xl flex items-center justify-center mx-auto text-emerald-700 shadow-inner">
                <ShieldCheck className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">Administrator Access</h3>
                <p className="text-sm text-slate-500 mt-2">
                  Please log in to make live changes to the landing page and add/modify photos.
                </p>
              </div>

              {errorMessage && (
                <div className="p-4 bg-amber-50 text-amber-900 text-xs rounded-2xl border border-amber-200 flex gap-2.5 text-left">
                  <AlertCircle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <div className="space-y-3 pt-2">
                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm py-4.5 rounded-2xl transition-all shadow-lg shadow-slate-900/10 cursor-pointer"
                >
                  <LogIn className="w-5 h-5" />
                  Sign In with Google
                </button>
                
                <div className="relative flex py-2 items-center">
                  <div className="flex-grow border-t border-slate-200"></div>
                  <span className="flex-shrink mx-4 text-xs text-slate-400 font-medium">Or for testing</span>
                  <div className="flex-grow border-t border-slate-200"></div>
                </div>

                <button
                  type="button"
                  onClick={enableSandbox}
                  className="w-full flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold text-xs py-3.5 rounded-2xl border border-emerald-200 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Sandbox Bypass Mode (No Google Account Required)
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex overflow-hidden">
            
            {/* Sidebar Tabs */}
            <div className="w-48 bg-slate-50 border-r border-slate-200 flex flex-col justify-between overflow-y-auto">
              <div className="p-3 space-y-1">
                <div className="text-[10px] text-slate-400 font-bold uppercase px-3 py-2 tracking-wider">Sections</div>
                
                {[
                  { id: 'brand', label: 'Header & Footer' },
                  { id: 'hero', label: 'Hero Section' },
                  { id: 'problem', label: 'Problem Cards' },
                  { id: 'bento', label: 'Bento Grid' },
                  { id: 'included', label: 'Program Cards' },
                  { id: 'bonuses', label: 'Bonuses list' },
                  { id: 'results_pricing', label: 'Testimonials / Price' },
                  { id: 'faq', label: 'FAQ Items' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full text-left text-xs font-semibold px-3 py-2.5 rounded-xl transition-all ${
                      activeTab === tab.id
                        ? 'bg-emerald-600 text-white'
                        : 'text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Connected User / Admin Details */}
              <div className="p-4 border-t border-slate-200 bg-slate-100/50 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-emerald-700 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {sandboxMode ? 'S' : user?.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-[10px] text-slate-400 font-bold leading-none">Logged In As</p>
                    <p className="text-xs font-bold text-slate-700 truncate mt-0.5">
                      {sandboxMode ? 'Sandbox User' : user?.email}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-1 bg-white hover:bg-red-50 text-red-600 border border-slate-200 rounded-lg py-1.5 text-[10px] font-bold transition-all cursor-pointer"
                >
                  <LogOut className="w-3 h-3" />
                  Logout
                </button>
              </div>
            </div>

            {/* Form Content Panel */}
            <div className="flex-1 p-6 overflow-y-auto bg-white space-y-6">
              
              {errorMessage && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {sandboxMode && (
                <div className="p-4 bg-amber-50/70 border border-amber-200/60 rounded-xl text-amber-900 text-xs flex gap-3 shadow-sm animate-fade-in">
                  <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div className="space-y-1">
                    <p className="font-bold text-amber-950 flex items-center gap-1.5">
                      Sandbox Bypass Mode Active
                    </p>
                    <p className="text-slate-600 leading-relaxed">
                      Due to third-party cookie restrictions inside the preview iframe, you are signed in as a local Sandbox User. 
                      Saving changes will securely update your **local browser cache** and instantly apply to the landing page. 
                      To save changes directly to your live **Firebase Cloud Database**, click **"Open in a new tab"** at the top right of your screen and sign in with Google!
                    </p>
                  </div>
                </div>
              )}

              {/* Brand Tab */}
              {activeTab === 'brand' && (
                <div className="space-y-6 animate-fade-in">
                  {renderSectionHeader('Branding Settings', 'Edit Header and Footer branding details')}
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Company / App Name</label>
                      <input
                        type="text"
                        value={editableData.header.name}
                        onChange={(e) => setEditableData({
                          ...editableData,
                          header: { ...editableData.header, name: e.target.value }
                        })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>

                    <ImageUploader
                      title="Header Logo Image"
                      currentUrl={editableData.header.logoUrl}
                      onSelect={(url) => setEditableData({
                        ...editableData,
                        header: { ...editableData.header, logoUrl: url }
                      })}
                    />

                    <div className="pt-4 border-t border-slate-100">
                      <label className="block text-xs font-bold text-slate-700 mb-1">Footer Copyright Text</label>
                      <input
                        type="text"
                        value={editableData.footer.copyright}
                        onChange={(e) => setEditableData({
                          ...editableData,
                          footer: { ...editableData.footer, copyright: e.target.value }
                        })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Hero Tab */}
              {activeTab === 'hero' && (
                <div className="space-y-6 animate-fade-in">
                  {renderSectionHeader('Hero Area', 'Configure the initial eye-catching section of the page')}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Promo Badge</label>
                        <input
                          type="text"
                          value={editableData.hero.badge}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            hero: { ...editableData.hero, badge: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">CTA Button Text</label>
                        <input
                          type="text"
                          value={editableData.hero.ctaText}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            hero: { ...editableData.hero, ctaText: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Main Headline</label>
                      <textarea
                        rows={2}
                        value={editableData.hero.title}
                        onChange={(e) => setEditableData({
                          ...editableData,
                          hero: { ...editableData.hero, title: e.target.value }
                        })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Description / Sub-headline</label>
                      <textarea
                        rows={2}
                        value={editableData.hero.description}
                        onChange={(e) => setEditableData({
                          ...editableData,
                          hero: { ...editableData.hero, description: e.target.value }
                        })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <ImageUploader
                      title="Hero Image"
                      currentUrl={editableData.hero.imageUrl}
                      onSelect={(url) => setEditableData({
                        ...editableData,
                        hero: { ...editableData.hero, imageUrl: url }
                      })}
                    />

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Result Card Title</label>
                        <input
                          type="text"
                          value={editableData.hero.highlightTitle}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            hero: { ...editableData.hero, highlightTitle: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Result Card Subtitle</label>
                        <input
                          type="text"
                          value={editableData.hero.highlightSubtitle}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            hero: { ...editableData.hero, highlightSubtitle: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">Bullets List</label>
                      <div className="space-y-2">
                        {editableData.hero.bullets.map((b, i) => (
                          <div key={i} className="flex gap-2">
                            <input
                              type="text"
                              value={b}
                              onChange={(e) => {
                                const newBullets = [...editableData.hero.bullets];
                                newBullets[i] = e.target.value;
                                setEditableData({
                                  ...editableData,
                                  hero: { ...editableData.hero, bullets: newBullets }
                                });
                              }}
                              className="flex-1 text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setEditableData({
                                  ...editableData,
                                  hero: {
                                    ...editableData.hero,
                                    bullets: editableData.hero.bullets.filter((_, idx) => idx !== i)
                                  }
                                });
                              }}
                              className="bg-red-50 border border-red-200 text-red-600 rounded-lg px-2"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setEditableData({
                              ...editableData,
                              hero: {
                                ...editableData.hero,
                                bullets: [...editableData.hero.bullets, 'New Bullet Feature']
                              }
                            });
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700 hover:text-emerald-800"
                        >
                          <Plus className="w-3 h-3" /> Add Feature Bullet
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Problem Section Tab */}
              {activeTab === 'problem' && (
                <div className="space-y-6 animate-fade-in">
                  {renderSectionHeader('Problem Identification', 'Customize the section explaining the pain points Lean90 solves')}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                      <input
                        type="text"
                        value={editableData.problem.title}
                        onChange={(e) => setEditableData({
                          ...editableData,
                          problem: { ...editableData.problem, title: e.target.value }
                        })}
                        className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-2">Pain Point Cards</label>
                      <div className="space-y-4">
                        {editableData.problem.painPoints.map((point, idx) => (
                          <div key={idx} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400">Card #{idx + 1}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditableData({
                                    ...editableData,
                                    problem: {
                                      ...editableData.problem,
                                      painPoints: editableData.problem.painPoints.filter((_, i) => i !== idx)
                                    }
                                  });
                                }}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <div className="flex gap-3">
                              <div className="w-24 flex-shrink-0">
                                <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Icon ID</label>
                                <select
                                  value={point.icon}
                                  onChange={(e) => {
                                    const newPoints = [...editableData.problem.painPoints];
                                    newPoints[idx].icon = e.target.value;
                                    setEditableData({
                                      ...editableData,
                                      problem: { ...editableData.problem, painPoints: newPoints }
                                    });
                                  }}
                                  className="w-full text-[10px] p-1.5 bg-white border border-slate-300 rounded"
                                >
                                  <option value="psychology">Psychology</option>
                                  <option value="restaurant_menu">Menu</option>
                                  <option value="nutrition">Nutrition</option>
                                  <option value="cycle">Cycle</option>
                                  <option value="schedule">Schedule</option>
                                </select>
                              </div>
                              <div className="flex-1">
                                <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Text Description</label>
                                <input
                                  type="text"
                                  value={point.text}
                                  onChange={(e) => {
                                    const newPoints = [...editableData.problem.painPoints];
                                    newPoints[idx].text = e.target.value;
                                    setEditableData({
                                      ...editableData,
                                      problem: { ...editableData.problem, painPoints: newPoints }
                                    });
                                  }}
                                  className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                        <button
                          type="button"
                          onClick={() => {
                            setEditableData({
                              ...editableData,
                              problem: {
                                ...editableData.problem,
                                painPoints: [
                                  ...editableData.problem.painPoints,
                                  { icon: 'psychology', text: 'New custom pain point description...' }
                                ]
                              }
                            });
                          }}
                          className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700"
                        >
                          <Plus className="w-3 h-3" /> Add Pain Point Card
                        </button>
                      </div>
                    </div>

                    <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-100/50 space-y-3 pt-4">
                      <h4 className="text-xs font-bold text-slate-800">Problem Solution Callout</h4>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Headline</label>
                        <input
                          type="text"
                          value={editableData.problem.highlightTitle}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            problem: { ...editableData.problem, highlightTitle: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Text Line 1</label>
                        <input
                          type="text"
                          value={editableData.problem.highlightText1}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            problem: { ...editableData.problem, highlightText1: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Text Line 2 (Highlighted)</label>
                        <input
                          type="text"
                          value={editableData.problem.highlightText2}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            problem: { ...editableData.problem, highlightText2: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Bento Grid Tab */}
              {activeTab === 'bento' && (
                <div className="space-y-6 animate-fade-in">
                  {renderSectionHeader('Bento Grid Content', 'Configure the 5 bento cards with dynamic image upload capabilities')}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                        <input
                          type="text"
                          value={editableData.bento.title}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            bento: { ...editableData.bento, title: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Section Subtitle</label>
                        <input
                          type="text"
                          value={editableData.bento.description}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            bento: { ...editableData.bento, description: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-6 pt-4 border-t border-slate-200">
                      <label className="block text-xs font-bold text-slate-800">Customize the 5 Bento Items</label>
                      {editableData.bento.items.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-4">
                          <div className="flex justify-between items-center border-b border-slate-200 pb-2 mb-2">
                            <span className="text-xs font-bold text-slate-800">Bento Card #{idx + 1}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Card Badge</label>
                              <input
                                type="text"
                                value={item.badge}
                                onChange={(e) => {
                                  const newItems = [...editableData.bento.items];
                                  newItems[idx].badge = e.target.value;
                                  setEditableData({
                                    ...editableData,
                                    bento: { ...editableData.bento, items: newItems }
                                  });
                                }}
                                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-0.5">Card Description</label>
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => {
                                  const newItems = [...editableData.bento.items];
                                  newItems[idx].description = e.target.value;
                                  setEditableData({
                                    ...editableData,
                                    bento: { ...editableData.bento, items: newItems }
                                  });
                                }}
                                className="w-full text-xs px-3 py-1.5 bg-white border border-slate-300 rounded-lg"
                              />
                            </div>
                          </div>

                          <ImageUploader
                            title={`Card #${idx + 1} Photo`}
                            currentUrl={item.imageUrl}
                            onSelect={(url) => {
                              const newItems = [...editableData.bento.items];
                              newItems[idx].imageUrl = url;
                              setEditableData({
                                ...editableData,
                                bento: { ...editableData.bento, items: newItems }
                              });
                            }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Program Cards (Included) Tab */}
              {activeTab === 'included' && (
                <div className="space-y-6 animate-fade-in">
                  {renderSectionHeader("What's Included", 'Configure the core features / program cards list')}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                        <input
                          type="text"
                          value={editableData.included.title}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            included: { ...editableData.included, title: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Section Subtitle</label>
                        <input
                          type="text"
                          value={editableData.included.description}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            included: { ...editableData.included, description: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <label className="block text-xs font-bold text-slate-800">Program Feature Cards</label>
                      {editableData.included.cards.map((card, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Card #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditableData({
                                  ...editableData,
                                  included: {
                                    ...editableData.included,
                                    cards: editableData.included.cards.filter((_, i) => i !== idx)
                                  }
                                });
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Icon ID</label>
                              <select
                                value={card.icon}
                                onChange={(e) => {
                                  const newCards = [...editableData.included.cards];
                                  newCards[idx].icon = e.target.value;
                                  setEditableData({
                                    ...editableData,
                                    included: { ...editableData.included, cards: newCards }
                                  });
                                }}
                                className="w-full text-[10px] p-1.5 bg-white border border-slate-300 rounded"
                              >
                                <option value="monitor_heart">Heart Monitor</option>
                                <option value="restaurant_menu">Nutrition Menu</option>
                                <option value="fitness_center">Fitness Center</option>
                                <option value="sports_gymnastics">Gymnastics</option>
                                <option value="timeline">Timeline/Roadmap</option>
                                <option value="verified">Verified Badge</option>
                              </select>
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Card Title</label>
                              <input
                                type="text"
                                value={card.title}
                                onChange={(e) => {
                                  const newCards = [...editableData.included.cards];
                                  newCards[idx].title = e.target.value;
                                  setEditableData({
                                    ...editableData,
                                    included: { ...editableData.included, cards: newCards }
                                  });
                                }}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Description text</label>
                            <input
                              type="text"
                              value={card.description}
                              onChange={(e) => {
                                const newCards = [...editableData.included.cards];
                                newCards[idx].description = e.target.value;
                                setEditableData({
                                  ...editableData,
                                  included: { ...editableData.included, cards: newCards }
                                });
                              }}
                              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEditableData({
                            ...editableData,
                            included: {
                              ...editableData.included,
                              cards: [
                                ...editableData.included.cards,
                                { icon: 'monitor_heart', title: 'New Included Feature', description: 'Enter description text here...' }
                              ]
                            }
                          });
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700"
                      >
                        <Plus className="w-3 h-3" /> Add Program Card
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Bonuses list */}
              {activeTab === 'bonuses' && (
                <div className="space-y-6 animate-fade-in">
                  {renderSectionHeader('Bonus Value Packs', 'Modify the premium bonuses offered for conversions')}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                        <input
                          type="text"
                          value={editableData.bonuses.title}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            bonuses: { ...editableData.bonuses, title: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Section Description</label>
                        <input
                          type="text"
                          value={editableData.bonuses.description}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            bonuses: { ...editableData.bonuses, description: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-3 pt-4 border-t border-slate-200">
                      <label className="block text-xs font-bold text-slate-800">Bonus Materials List</label>
                      {editableData.bonuses.items.map((bonus, idx) => (
                        <div key={idx} className="flex gap-2 items-center bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                          <input
                            type="text"
                            placeholder="Label (e.g. Bonus #1)"
                            value={bonus.label}
                            onChange={(e) => {
                              const newBonuses = [...editableData.bonuses.items];
                              newBonuses[idx].label = e.target.value;
                              setEditableData({
                                ...editableData,
                                bonuses: { ...editableData.bonuses, items: newBonuses }
                              });
                            }}
                            className="w-24 text-xs p-1.5 bg-white border border-slate-300 rounded"
                          />
                          <input
                            type="text"
                            placeholder="Title of Bonus Material"
                            value={bonus.title}
                            onChange={(e) => {
                              const newBonuses = [...editableData.bonuses.items];
                              newBonuses[idx].title = e.target.value;
                              setEditableData({
                                ...editableData,
                                bonuses: { ...editableData.bonuses, items: newBonuses }
                              });
                            }}
                            className="flex-1 text-xs p-1.5 bg-white border border-slate-300 rounded"
                          />
                          <input
                            type="text"
                            placeholder="Value"
                            value={bonus.value}
                            onChange={(e) => {
                              const newBonuses = [...editableData.bonuses.items];
                              newBonuses[idx].value = e.target.value;
                              setEditableData({
                                ...editableData,
                                bonuses: { ...editableData.bonuses, items: newBonuses }
                              });
                            }}
                            className="w-16 text-xs p-1.5 bg-white border border-slate-300 rounded text-center"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              setEditableData({
                                ...editableData,
                                bonuses: {
                                  ...editableData.bonuses,
                                  items: editableData.bonuses.items.filter((_, i) => i !== idx)
                                }
                              });
                            }}
                            className="bg-red-50 text-red-600 p-1.5 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEditableData({
                            ...editableData,
                            bonuses: {
                              ...editableData.bonuses,
                              items: [...editableData.bonuses.items, { label: `Bonus #${editableData.bonuses.items.length + 1}`, title: 'New Bonus Product', value: '$10' }]
                            }
                          });
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700"
                      >
                        <Plus className="w-3 h-3" /> Add Bonus Material
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Testimonials & Pricing */}
              {activeTab === 'results_pricing' && (
                <div className="space-y-6 animate-fade-in">
                  {renderSectionHeader('Pricing & Social Proof', 'Configure price points and user success testimonials')}

                  <div className="space-y-6">
                    {/* Pricing Config block */}
                    <div className="p-4 bg-slate-900 text-white rounded-2xl border border-slate-800 space-y-4">
                      <h4 className="text-xs font-bold text-emerald-400">Offer / Pricing details</h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Value Badge Text</label>
                          <input
                            type="text"
                            value={editableData.pricing.valueBadge}
                            onChange={(e) => setEditableData({
                              ...editableData,
                              pricing: { ...editableData.pricing, valueBadge: e.target.value }
                            })}
                            className="w-full text-xs p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Section Title</label>
                          <input
                            type="text"
                            value={editableData.pricing.header}
                            onChange={(e) => setEditableData({
                              ...editableData,
                              pricing: { ...editableData.pricing, header: e.target.value }
                            })}
                            className="w-full text-xs p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">Pricing text (Large)</label>
                          <input
                            type="text"
                            value={editableData.pricing.price}
                            onChange={(e) => setEditableData({
                              ...editableData,
                              pricing: { ...editableData.pricing, price: e.target.value }
                            })}
                            className="w-full text-xs p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-slate-400 mb-0.5">CTA Button text</label>
                          <input
                            type="text"
                            value={editableData.pricing.ctaText}
                            onChange={(e) => setEditableData({
                              ...editableData,
                              pricing: { ...editableData.pricing, ctaText: e.target.value }
                            })}
                            className="w-full text-xs p-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Testimonials block */}
                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <label className="block text-xs font-bold text-slate-800">User Testimonials</label>
                      {editableData.results.testimonials.map((test, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">Testimonial #{idx + 1}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Author Name</label>
                              <input
                                type="text"
                                value={test.name}
                                onChange={(e) => {
                                  const newTestimonials = [...editableData.results.testimonials];
                                  newTestimonials[idx].name = e.target.value;
                                  setEditableData({
                                    ...editableData,
                                    results: { ...editableData.results, testimonials: newTestimonials }
                                  });
                                }}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                              />
                            </div>
                            <div className="col-span-2">
                              <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Result Detail text</label>
                              <input
                                type="text"
                                value={test.details}
                                onChange={(e) => {
                                  const newTestimonials = [...editableData.results.testimonials];
                                  newTestimonials[idx].details = e.target.value;
                                  setEditableData({
                                    ...editableData,
                                    results: { ...editableData.results, testimonials: newTestimonials }
                                  });
                                }}
                                className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Comment Quotes</label>
                            <textarea
                              rows={2}
                              value={test.comment}
                              onChange={(e) => {
                                const newTestimonials = [...editableData.results.testimonials];
                                newTestimonials[idx].comment = e.target.value;
                                setEditableData({
                                  ...editableData,
                                  results: { ...editableData.results, testimonials: newTestimonials }
                                });
                              }}
                              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* FAQ Section */}
              {activeTab === 'faq' && (
                <div className="space-y-6 animate-fade-in">
                  {renderSectionHeader('FAQ Items', 'Configure frequently asked questions Accordions')}

                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Section Title</label>
                        <input
                          type="text"
                          value={editableData.faq.title}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            faq: { ...editableData.faq, title: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">Section Subtitle</label>
                        <input
                          type="text"
                          value={editableData.faq.description}
                          onChange={(e) => setEditableData({
                            ...editableData,
                            faq: { ...editableData.faq, description: e.target.value }
                          })}
                          className="w-full text-xs px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg"
                        />
                      </div>
                    </div>

                    <div className="space-y-4 pt-4 border-t border-slate-200">
                      <label className="block text-xs font-bold text-slate-800">Interactive FAQ List</label>
                      {editableData.faq.items.map((item, idx) => (
                        <div key={idx} className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-slate-700">FAQ Item #{idx + 1}</span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditableData({
                                  ...editableData,
                                  faq: {
                                    ...editableData.faq,
                                    items: editableData.faq.items.filter((_, i) => i !== idx)
                                  }
                                });
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Question Text</label>
                            <input
                              type="text"
                              value={item.question}
                              onChange={(e) => {
                                const newItems = [...editableData.faq.items];
                                newItems[idx].question = e.target.value;
                                setEditableData({
                                  ...editableData,
                                  faq: { ...editableData.faq, items: newItems }
                                });
                              }}
                              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded font-semibold"
                            />
                          </div>
                          <div>
                            <label className="block text-[9px] font-bold text-slate-500 mb-0.5">Answer Text</label>
                            <textarea
                              rows={2}
                              value={item.answer}
                              onChange={(e) => {
                                const newItems = [...editableData.faq.items];
                                newItems[idx].answer = e.target.value;
                                setEditableData({
                                  ...editableData,
                                  faq: { ...editableData.faq, items: newItems }
                                });
                              }}
                              className="w-full text-xs p-1.5 bg-white border border-slate-300 rounded"
                            />
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setEditableData({
                            ...editableData,
                            faq: {
                              ...editableData.faq,
                              items: [
                                ...editableData.faq.items,
                                { question: 'New Question Text?', answer: 'Answer content goes here...' }
                              ]
                            }
                          });
                        }}
                        className="flex items-center gap-1.5 text-[10px] font-bold text-emerald-700"
                      >
                        <Plus className="w-3 h-3" /> Add FAQ Item
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Footer actions */}
        {isLoggedIn && (
          <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-between items-center">
            <button
              onClick={handleResetToDefaults}
              className="flex items-center gap-1 px-4 py-2 border border-slate-300 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 transition-all cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Defaults
            </button>

            <div className="flex items-center gap-3">
              {saveStatus === 'success' && (
                <span className="text-xs text-emerald-600 font-bold flex items-center gap-1">
                  <Check className="w-4 h-4 bg-emerald-100 text-emerald-700 rounded-full p-0.5" /> 
                  {sandboxMode ? 'Sandbox Updated Locally!' : 'Live Page Updated!'}
                </span>
              )}
              {saveStatus === 'error' && (
                <span className="text-xs text-red-600 font-bold flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" /> Save Failed.
                </span>
              )}
              
              <button
                disabled={isSaving}
                onClick={handleSaveToFirebase}
                className="bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-bold text-xs px-6 py-3 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                {isSaving 
                  ? (sandboxMode ? 'Saving locally...' : 'Updating Firebase...') 
                  : (sandboxMode ? 'Save Locally (Sandbox)' : 'Save Live (Firebase)')}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
