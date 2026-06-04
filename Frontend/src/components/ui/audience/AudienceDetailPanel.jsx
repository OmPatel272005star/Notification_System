       import { X } from "lucide-react";
import AudienceTimeline from "./AudienceTimeline";
import { useEffect, useState } from "react";
import { useAudience } from "../../../context/AudienceContext";

export default function AudienceDetailPanel({ open, onClose, audienceId }) {
  const { getAudience, getTimeline } = useAudience();
  const [timeline, setTimeline] = useState([]);
  const [loading, setLoading] = useState(false);

  const audience = getAudience(audienceId);

  useEffect(() => {
    if (open && audienceId) {
      setLoading(true);
      getTimeline(audienceId)
        .then(setTimeline)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [open, audienceId, getTimeline]);

  if (!open || !audience) return null;

  const fullName = `${audience.first_name} ${audience.last_name}`;
  const initials = `${audience.first_name?.[0] || ""}${audience.last_name?.[0] || ""}`.toUpperCase();

  const primaryEmail = audience.emails?.find(e => e.is_primary)?.email || audience.emails?.[0]?.email || "—";
  const primaryPhoneObj = audience.phone_numbers?.find(p => p.is_primary) || audience.phone_numbers?.[0];
  const primaryPhone = primaryPhoneObj ? `${primaryPhoneObj.phone_code}${primaryPhoneObj.number}` : "—";
  
  const addrParts = [audience.address?.city, audience.address?.state, audience.address?.country].filter(Boolean);
  const addressStr = addrParts.length ? addrParts.join(", ") : "—";

  return (
    <div className="fixed inset-0 z-50 flex justify-end" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity" />
      
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#161B22] h-full shadow-2xl flex flex-col transition-transform"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E4E7EC] dark:border-[#2A2F3A] flex items-center justify-between bg-gray-50 dark:bg-[#1A2030]">
          <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Audience Details</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto">
          {/* Profile Section */}
          <div className="px-6 py-8 border-b border-[#E4E7EC] dark:border-[#2A2F3A] flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#6D5EF5] to-[#8B7CFF] flex items-center justify-center text-white text-xl font-bold">
              {initials}
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100">{fullName}</h3>
              <div className="flex items-center gap-2 mt-1">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium capitalize ${
                  audience.status === 'active' ? 'bg-green-100 text-green-700' :
                  audience.status === 'unsubscribed' ? 'bg-red-100 text-red-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {audience.status || 'Active'}
                </span>
                <span className="text-sm text-gray-500">{primaryEmail}</span>
              </div>
            </div>
          </div>

          {/* Details Section */}
          <div className="px-6 py-6 space-y-6 border-b border-[#E4E7EC] dark:border-[#2A2F3A]">
            <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Contact Info</h4>
            
            <div className="space-y-4">
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Phone Number</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{primaryPhone}</span>
              </div>
              
              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Address</span>
                <span className="text-sm font-medium text-gray-900 dark:text-gray-100">{addressStr}</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Gender</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100 capitalize">{audience.gender || "—"}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500 dark:text-gray-400 block mb-1">Date of Birth</span>
                  <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {audience.dob ? new Date(audience.dob).toLocaleDateString() : "—"}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-sm text-gray-500 dark:text-gray-400 block mb-2">Social Platforms</span>
                <div className="flex flex-wrap gap-2">
                  {audience.social_media_handles && audience.social_media_handles.length > 0 ? (
                    audience.social_media_handles.map(h => (
                      <span key={h} className="px-2 py-1 rounded-md text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 capitalize border border-gray-200 dark:border-gray-700">
                        {h}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">—</span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Section */}
          <div className="px-6 py-6 bg-gray-50/50 dark:bg-[#161B22]">
            {loading ? (
              <div className="animate-pulse flex space-x-4">
                <div className="flex-1 space-y-4 py-1">
                  <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-3">
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                  </div>
                </div>
              </div>
            ) : (
              <AudienceTimeline entries={timeline} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
