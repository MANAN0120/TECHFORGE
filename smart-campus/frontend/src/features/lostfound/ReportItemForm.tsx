import React, { useState, useEffect } from 'react';
import { X, Camera, MapPin, Loader2, CheckCircle } from 'lucide-react';
import { ItemType, ItemCategory } from './types';
import { CATEGORIES } from './categories';
import { api } from '../../services/api';

interface ReportItemFormProps {
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const ReportItemForm: React.FC<ReportItemFormProps> = ({ onClose, onSubmitSuccess }) => {
  const [type, setType] = useState<ItemType>('lost');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<ItemCategory>('phone');
  const [lastSeenLabel, setLastSeenLabel] = useState('');
  const [buildingId, setBuildingId] = useState('');
  const [lastSeenLat, setLastSeenLat] = useState<number | null>(null);
  const [lastSeenLng, setLastSeenLng] = useState<number | null>(null);
  const [contactInfo, setContactInfo] = useState('');
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  const [loadingGps, setLoadingGps] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [buildings, setBuildings] = useState<any[]>([]);

  useEffect(() => {
    api.getBuildings('cu-gharaun').then((res) => {
      if (res && res.buildings) setBuildings(res.buildings);
    }).catch(() => {});
  }, []);

  const handleGPSLocation = () => {
    if ('geolocation' in navigator) {
      setLoadingGps(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLastSeenLat(pos.coords.latitude);
          setLastSeenLng(pos.coords.longitude);
          if (!lastSeenLabel) setLastSeenLabel('Current GPS Location');
          setLoadingGps(false);
        },
        () => {
          setLoadingGps(false);
          setErrorMsg('GPS location access denied or unavailable.');
        }
      );
    }
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPhotoFile(file);
      setPhotoPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim() || !contactInfo.trim()) {
      setErrorMsg('Please fill in all required fields (title, description, contact info).');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    try {
      const formData = new FormData();
      formData.append('campus_id', 'cu-gharaun');
      formData.append('type', type);
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category);
      formData.append('contact_info', contactInfo.trim());

      if (lastSeenLabel.trim()) formData.append('last_seen_label', lastSeenLabel.trim());
      if (buildingId) formData.append('building_id', buildingId);
      if (lastSeenLat !== null) formData.append('last_seen_lat', lastSeenLat.toString());
      if (lastSeenLng !== null) formData.append('last_seen_lng', lastSeenLng.toString());
      if (photoFile) formData.append('photo', photoFile);

      await api.createLostItem(formData);
      setSubmitting(false);
      onSubmitSuccess();
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit item report.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-md bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border flex items-center justify-between bg-surface2">
          <h3 className="text-base font-bold text-foreground">Report Lost or Found Item</h3>
          <button onClick={onClose} className="p-1 text-secondary hover:text-foreground rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1">
          {errorMsg && (
            <div className="p-3 bg-error/15 border border-error/30 text-error text-xs rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Type Segmented Control */}
          <div className="flex p-1 bg-surface2 rounded-xl border border-border">
            <button
              type="button"
              onClick={() => setType('lost')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
                type === 'lost' ? 'bg-warning text-black shadow-md' : 'text-secondary hover:text-foreground'
              }`}
            >
              LOST ITEM
            </button>
            <button
              type="button"
              onClick={() => setType('found')}
              className={`flex-1 py-2 text-xs font-extrabold rounded-lg transition-all ${
                type === 'found' ? 'bg-primary text-black shadow-md' : 'text-secondary hover:text-foreground'
              }`}
            >
              FOUND ITEM
            </button>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Title <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g., iPhone 13 Pro in Black Case"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface2 border border-border rounded-xl text-sm text-foreground placeholder-secondary/60 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Category Chips */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1.5">
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map((cat) => {
                const Icon = cat.icon;
                const isSelected = category === cat.value;
                return (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className={`flex items-center space-x-1.5 p-2 rounded-xl border text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-primary/20 border-primary text-primary font-bold'
                        : 'bg-surface2 border-border text-secondary hover:text-foreground'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Description <span className="text-error">*</span>
            </label>
            <textarea
              required
              rows={3}
              placeholder="Details about where it was lost/found, distinctive features..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface2 border border-border rounded-xl text-sm text-foreground placeholder-secondary/60 focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Last Seen Location */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider">
              Last Seen Location
            </label>

            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="e.g., Near Central Cafe / Block A2 Ground Floor"
                value={lastSeenLabel}
                onChange={(e) => setLastSeenLabel(e.target.value)}
                className="flex-1 px-3.5 py-2 bg-surface2 border border-border rounded-xl text-xs text-foreground placeholder-secondary/60 focus:outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={handleGPSLocation}
                disabled={loadingGps}
                className="px-3 py-2 bg-surface2 hover:bg-surface2/80 text-primary border border-border rounded-xl text-xs font-medium flex items-center space-x-1 shrink-0"
              >
                {loadingGps ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
                <span>GPS</span>
              </button>
            </div>

            {/* Optional Building Link */}
            {buildings.length > 0 && (
              <select
                value={buildingId}
                onChange={(e) => setBuildingId(e.target.value)}
                className="w-full px-3.5 py-2 bg-surface2 border border-border rounded-xl text-xs text-foreground focus:outline-none focus:border-primary"
              >
                <option value="">Select Building (Optional)</option>
                {buildings.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Photo (Optional)
            </label>
            <div className="flex items-center space-x-3">
              <label className="flex-1 flex items-center justify-center space-x-2 p-3 bg-surface2 hover:bg-surface2/80 border border-dashed border-border rounded-xl cursor-pointer transition-colors text-xs text-secondary">
                <Camera className="w-4 h-4 text-primary" />
                <span>{photoFile ? photoFile.name : 'Take or upload photo'}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="hidden"
                />
              </label>

              {photoPreview && (
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-border shrink-0">
                  <img src={photoPreview} alt="Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div>
            <label className="block text-xs font-semibold text-secondary uppercase tracking-wider mb-1">
              Contact Info <span className="text-error">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="Phone number, email, or Roll No / Telegram handle"
              value={contactInfo}
              onChange={(e) => setContactInfo(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-surface2 border border-border rounded-xl text-sm text-foreground placeholder-secondary/60 focus:outline-none focus:border-primary"
            />
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-black font-bold rounded-xl shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting...</span>
                </>
              ) : (
                <>
                  <CheckCircle className="w-4 h-4" />
                  <span>Submit {type === 'lost' ? 'Lost' : 'Found'} Item Report</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
