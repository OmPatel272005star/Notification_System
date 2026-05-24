import { useRef } from "react";
import { Camera } from "lucide-react";

/**
 * Compresses an image file using a canvas element.
 * Resizes to maxPx × maxPx (keeping aspect ratio) and encodes as JPEG.
 * Result is ~20-50 KB as a base64 string — safe to store in MongoDB.
 */
const compressImage = (file, maxPx = 300, quality = 0.75) =>
  new Promise((resolve, reject) => {
    if (file.size > 5 * 1024 * 1024) {
      reject(new Error("Image must be under 5 MB. Please pick a smaller photo."));
      return;
    }
    const img  = new Image();
    const url  = URL.createObjectURL(file);
    img.onload = () => {
      const scale  = Math.min(1, maxPx / Math.max(img.width, img.height));
      const w      = Math.round(img.width  * scale);
      const h      = Math.round(img.height * scale);
      const canvas = document.createElement("canvas");
      canvas.width  = w;
      canvas.height = h;
      canvas.getContext("2d").drawImage(img, 0, 0, w, h);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL("image/jpeg", quality)); // ~20-50 KB
    };
    img.onerror = () => reject(new Error("Could not load the selected image."));
    img.src = url;
  });

export function ProfileAvatarSection({ form, setForm, userEmail, onError }) {
  const fileRef = useRef();

  const initials = form.name
    ? form.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()
    : "U";

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const compressed = await compressImage(file);
      setForm((f) => ({ ...f, avatarUrl: compressed }));
    } catch (err) {
      if (onError) onError(err.message);
    }
    // Reset so the same file can be re-selected if needed
    e.target.value = "";
  };

  return (
    <div className="ep-avatar-row">
      <div className="ep-avatar-wrap">
        <div className="ep-avatar">
          {form.avatarUrl ? (
            <img src={form.avatarUrl} alt="Profile" />
          ) : (
            initials
          )}
        </div>
        <div
          className="ep-cam-btn"
          onClick={() => fileRef.current?.click()}
          title="Change profile picture"
        >
          <Camera size={12} />
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={handleAvatarChange}
        />
      </div>

      <div className="ep-avatar-info">
        <p className="ep-user-name">{form.name || "Your Name"}</p>
        <p className="ep-user-sub">{userEmail}</p>
        <button
          className="ep-change-pic-btn"
          onClick={() => fileRef.current?.click()}
        >
          Change Picture
        </button>
      </div>
    </div>
  );
}
