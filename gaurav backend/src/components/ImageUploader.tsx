import React, { useState, useRef, DragEvent } from 'react';
import { Upload, Link, Check, Image as ImageIcon, Sparkles } from 'lucide-react';

interface ImageUploaderProps {
  currentUrl: string;
  onSelect: (url: string) => void;
  title?: string;
}

const STOCK_FITNESS_IMAGES = [
  {
    name: 'Fit Couple / Transformation',
    url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80',
    category: 'People'
  },
  {
    name: 'Workout Partners',
    url: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?auto=format&fit=crop&w=800&q=80',
    category: 'People'
  },
  {
    name: 'Healthy Meal Prep',
    url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80',
    category: 'Nutrition'
  },
  {
    name: 'Fresh Salad & Veggies',
    url: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=800&q=80',
    category: 'Nutrition'
  },
  {
    name: 'Gym Weightlifting',
    url: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=800&q=80',
    category: 'Workouts'
  },
  {
    name: 'Home Bodyweight Exercise',
    url: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?auto=format&fit=crop&w=800&q=80',
    category: 'Workouts'
  },
  {
    name: 'Running Track & Outdoor',
    url: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=800&q=80',
    category: 'Workouts'
  },
  {
    name: 'Ebook / Fitness Guide Cover',
    url: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=800&q=80',
    category: 'Guides'
  },
  {
    name: 'Weekly Grocery Shopping',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    category: 'Guides'
  }
];

export default function ImageUploader({ currentUrl, onSelect, title = 'Change Image' }: ImageUploaderProps) {
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'stock'>('upload');
  const [urlInput, setUrlInput] = useState('');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Helper to compress base64 images so they stay within Firestore limits (approx < 200KB)
  const compressImage = (base64Str: string, maxWidth = 800, maxHeight = 800): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.src = base64Str;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.7)); // compress to 70% quality JPEG
        } else {
          resolve(base64Str);
        }
      };
      img.onerror = () => {
        resolve(base64Str);
      };
    });
  };

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setError(null);
    setIsCompressing(true);
    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const base64 = e.target?.result as string;
        const compressed = await compressImage(base64);
        onSelect(compressed);
        setIsCompressing(false);
      } catch (err) {
        setError('Error compressing image.');
        setIsCompressing(false);
      }
    };
    reader.onerror = () => {
      setError('Error reading file.');
      setIsCompressing(false);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;
    if (!urlInput.startsWith('http://') && !urlInput.startsWith('https://') && !urlInput.startsWith('data:image')) {
      setError('Please provide a valid image URL (starting with http:// or https://)');
      return;
    }
    setError(null);
    onSelect(urlInput.trim());
    setUrlInput('');
  };

  return (
    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
      <div className="flex justify-between items-center mb-3">
        <label className="block text-sm font-semibold text-slate-800">{title}</label>
        <span className="text-xs text-slate-500 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-emerald-500" /> Professional Tools
        </span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 mb-4 gap-2">
        <button
          type="button"
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-all ${
            activeTab === 'upload'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Upload className="w-3.5 h-3.5" /> Upload File
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('url')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-all ${
            activeTab === 'url'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Link className="w-3.5 h-3.5" /> Image URL
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('stock')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium border-b-2 -mb-px transition-all ${
            activeTab === 'stock'
              ? 'border-emerald-600 text-emerald-700'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <ImageIcon className="w-3.5 h-3.5" /> Stock Library
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'upload' && (
        <div
          onDragEnter={handleDrag}
          onDragOver={handleDrag}
          onDragLeave={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all ${
            dragActive
              ? 'border-emerald-500 bg-emerald-50/50'
              : 'border-slate-300 hover:border-emerald-500 hover:bg-slate-100/50'
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileInputChange}
            accept="image/*"
            className="hidden"
          />
          {isCompressing ? (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mb-2"></div>
              <p className="text-xs text-slate-600">Compressing and uploading image...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center">
              <Upload className="w-8 h-8 text-slate-400 mb-2" />
              <p className="text-sm font-medium text-slate-700">Drag & drop your image here</p>
              <p className="text-xs text-slate-500 mt-1">or click to browse from device</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-3">
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Paste image link here (https://...)"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 text-xs px-3 py-2 bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-4 py-2 rounded-lg font-medium transition-colors"
            >
              Add URL
            </button>
          </div>
          <p className="text-[10px] text-slate-400">Supports direct URLs from Image hosting sites or raw base64 data.</p>
        </form>
      )}

      {activeTab === 'stock' && (
        <div>
          <p className="text-xs text-slate-500 mb-3">Click on any beautiful royalty-free fitness image to select it instantly:</p>
          <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto pr-1">
            {STOCK_FITNESS_IMAGES.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => onSelect(img.url)}
                className="group relative rounded-lg overflow-hidden aspect-video border border-slate-200 hover:border-emerald-500 transition-all text-left"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Check className="w-5 h-5 text-white" />
                </div>
                <div className="absolute bottom-0 inset-x-0 bg-black/60 p-1 text-[8px] text-white truncate">
                  {img.name}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {error && <p className="text-xs text-red-500 font-medium mt-2">{error}</p>}

      {/* Preview Section */}
      {currentUrl && (
        <div className="mt-4 flex items-center gap-3 bg-white p-2 rounded-lg border border-slate-200">
          <div className="w-12 h-12 rounded-md overflow-hidden border border-slate-200 flex-shrink-0 bg-slate-100">
            <img src={currentUrl} alt="Preview" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-slate-400 font-mono truncate">{currentUrl}</p>
            <p className="text-[11px] text-slate-600 font-medium">Active Selection Preview</p>
          </div>
          <div className="bg-emerald-100 text-emerald-800 rounded-full p-1 flex items-center justify-center">
            <Check className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
}
