import { Phone, MapPin, Calendar, Globe } from "lucide-react";
import { ProfileCustomSelect }    from "./ProfileCustomSelect";
import { ProfilePhoneCodeSelect } from "./ProfilePhoneCodeSelect";
import { COUNTRIES } from "./profileConstants";

export function ProfileFieldsGrid({ form, setForm }) {
  const setInput = (key) => (e) =>
    setForm((f) => ({ ...f, [key]: e.target.value }));

  const set = (key) => (val) =>
    setForm((f) => ({ ...f, [key]: val }));

  return (
    <div className="ep-grid">
      {/* Name */}
      <div className="ep-field">
        <label className="ep-label" htmlFor="ep-name">Name</label>
        <input
          id="ep-name"
          className="ep-input"
          type="text"
          value={form.name}
          onChange={setInput("name")}
          placeholder="Your full name"
        />
      </div>

      {/* Gender */}
      <div className="ep-field">
        <label className="ep-label">Gender</label>
        <ProfileCustomSelect
          id="ep-gender"
          value={form.gender}
          onChange={set("gender")}
          options={["Male", "Female"]}
          placeholder="Select gender"
        />
      </div>

      {/* Birth Date */}
      <div className="ep-field">
        <label className="ep-label" htmlFor="ep-dob">
          <Calendar size={12} /> Birth Date
        </label>
        <div className="ep-date-wrap">
          <Calendar size={14} className="ep-icon" />
          <input
            id="ep-dob"
            type="date"
            className="ep-date-input"
            value={form.birthDate}
            onChange={setInput("birthDate")}
          />
        </div>
      </div>

      {/* Country */}
      <div className="ep-field">
        <label className="ep-label">
          <Globe size={12} /> Country (Optional)
        </label>
        <ProfileCustomSelect
          id="ep-country"
          value={form.country}
          onChange={set("country")}
          options={COUNTRIES}
          placeholder="Select country"
        />
      </div>

      {/* State */}
      <div className="ep-field">
        <label className="ep-label">
          <MapPin size={12} /> State (Optional)
        </label>
        <input
          id="ep-state"
          className="ep-input"
          type="text"
          value={form.state}
          onChange={setInput("state")}
          placeholder="State / Province"
        />
      </div>

      {/* City */}
      <div className="ep-field">
        <label className="ep-label">
          <MapPin size={12} /> City (Optional)
        </label>
        <input
          id="ep-city"
          className="ep-input"
          type="text"
          value={form.city}
          onChange={setInput("city")}
          placeholder="City"
        />
      </div>

      {/* Mobile */}
      <div className="ep-field ep-grid-full">
        <label className="ep-label">
          <Phone size={12} /> Mobile Number
        </label>
        <div className="ep-phone-row">
          <ProfilePhoneCodeSelect
            value={form.phoneCode}
            onChange={set("phoneCode")}
          />
          <input
            id="ep-phone"
            className="ep-input ep-phone-num"
            type="tel"
            value={form.phoneNum}
            onChange={setInput("phoneNum")}
            placeholder="Phone number"
          />
        </div>
      </div>

      {/* Preferred Language removed as requested */}
    </div>
  );
}
