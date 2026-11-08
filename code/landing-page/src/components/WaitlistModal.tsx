"use client";

import React, { useState, useEffect } from "react";
import confetti from "canvas-confetti";

interface WaitlistModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SRI_LANKA_DISTRICTS = [
  "Colombo",
  "Gampaha",
  "Kalutara",
  "Kandy",
  "Galle",
  "Matara",
  "Kurunegala",
  "Anuradhapura",
  "Jaffna",
  "Ratnapura",
  "Badulla",
  "Batticaloa",
  "Other / Overseas",
];

export function WaitlistModal({ isOpen, onClose }: WaitlistModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [district, setDistrict] = useState("Colombo");
  const [careRole, setCareRole] = useState("Primary Family Caregiver");
  const [consent, setConsent] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [reservationCount, setReservationCount] = useState(184);
  const [reservationId, setReservationId] = useState("");

  useEffect(() => {
    // Load local storage count if exists
    try {
      const stored = localStorage.getItem("alvi_waitlist_reservations");
      if (stored) {
        const parsed = JSON.parse(stored);
        setReservationCount(184 + parsed.length);
      }
    } catch {
      // fallback
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) return;

    const newReservation = {
      id: `ALVI-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      name,
      email,
      phone: `+94 ${phone}`,
      district,
      careRole,
      timestamp: new Date().toISOString(),
    };

    try {
      const stored = localStorage.getItem("alvi_waitlist_reservations");
      const list = stored ? JSON.parse(stored) : [];
      list.push(newReservation);
      localStorage.setItem("alvi_waitlist_reservations", JSON.stringify(list));
      setReservationCount((prev) => prev + 1);
    } catch {
      // ignore
    }

    setReservationId(newReservation.id);
    setSubmitted(true);

    // Subtle Apple-style confetti
    confetti({
      particleCount: 40,
      spread: 60,
      origin: { y: 0.6 },
      colors: ["#5B6B7E", "#BEBEBE", "#454545"],
    });
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/40 backdrop-blur-md transition-all duration-300"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-[540px] max-h-[90vh] overflow-y-auto rounded-[22px] bg-white/95 backdrop-blur-2xl border border-[#DEDEDE] shadow-[0_24px_64px_rgba(0,0,0,0.12)] p-6 sm:p-8 transition-all"
        style={{
          boxShadow: "0 24px 64px -12px rgba(69, 69, 69, 0.18)",
        }}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#F3F3F6] hover:bg-[#E8E8ED] text-[#6E6E73] hover:text-[#454545] flex items-center justify-center transition-colors focus:outline-none focus:ring-1 focus:ring-[#BEBEBE]"
          aria-label="Close Modal"
        >
          ✕
        </button>

        {!submitted ? (
          <div>
            {/* Header Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-[100px] bg-[#F3F3F6] border border-[#DEDEDE] mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5B6B7E] animate-pulse" />
              <span className="text-[11px] font-medium tracking-wide text-[#6E6E73] uppercase">
                Priority Batch 01 Allocation
              </span>
            </div>

            <h3
              id="modal-title"
              className="text-[26px] font-medium text-[#454545] tracking-tight leading-tight mb-2"
            >
              Reserve Early Access
            </h3>

            <p className="text-[14px] text-[#6E6E73] leading-relaxed mb-6">
              Claim an initial deployment slot for the{" "}
              <strong className="text-[#454545] font-medium">ALVI One</strong>{" "}
              autonomous indoor unit &amp; companion caregiver link.
            </p>

            {/* Live Reservation Counter */}
            <div className="p-3 rounded-xl bg-[#F8F9FA] border border-[#E8E8ED] flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono text-[#BEBEBE] uppercase">
                  Batch Status
                </span>
                <span className="text-[12px] font-medium text-[#454545]">
                  {reservationCount} of 250 claimed
                </span>
              </div>
              <div className="w-24 h-1.5 bg-[#E8E8ED] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#5B6B7E] rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (reservationCount / 250) * 100)}%`,
                  }}
                />
              </div>
            </div>

            {/* Form with Visible Labels */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="caregiverName"
                  className="block text-[12px] font-medium text-[#454545] uppercase tracking-wider mb-1"
                >
                  Caregiver Name
                </label>
                <input
                  id="caregiverName"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Dr. Amodh Gunawardana"
                  className="w-full h-11 px-3.5 rounded-xl border border-[#DEDEDE] bg-white text-[14px] text-[#454545] placeholder-[#BEBEBE] focus:outline-none focus:border-[#5B6B7E] focus:ring-1 focus:ring-[#5B6B7E] transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="caregiverEmail"
                    className="block text-[12px] font-medium text-[#454545] uppercase tracking-wider mb-1"
                  >
                    Email Address
                  </label>
                  <input
                    id="caregiverEmail"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="amodh@example.com"
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DEDEDE] bg-white text-[14px] text-[#454545] placeholder-[#BEBEBE] focus:outline-none focus:border-[#5B6B7E] focus:ring-1 focus:ring-[#5B6B7E] transition-all"
                  />
                </div>

                <div>
                  <label
                    htmlFor="caregiverPhone"
                    className="block text-[12px] font-medium text-[#454545] uppercase tracking-wider mb-1"
                  >
                    +94 Mobile Number
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[13px] text-[#6E6E73] font-mono">
                      +94
                    </span>
                    <input
                      id="caregiverPhone"
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="77 123 4567"
                      className="w-full h-11 pl-12 pr-3.5 rounded-xl border border-[#DEDEDE] bg-white text-[14px] text-[#454545] placeholder-[#BEBEBE] focus:outline-none focus:border-[#5B6B7E] focus:ring-1 focus:ring-[#5B6B7E] transition-all font-mono"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="caregiverDistrict"
                    className="block text-[12px] font-medium text-[#454545] uppercase tracking-wider mb-1"
                  >
                    Deployment District
                  </label>
                  <select
                    id="caregiverDistrict"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DEDEDE] bg-white text-[14px] text-[#454545] focus:outline-none focus:border-[#5B6B7E] focus:ring-1 focus:ring-[#5B6B7E] transition-all"
                  >
                    {SRI_LANKA_DISTRICTS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="caregiverRole"
                    className="block text-[12px] font-medium text-[#454545] uppercase tracking-wider mb-1"
                  >
                    Care Role
                  </label>
                  <select
                    id="caregiverRole"
                    value={careRole}
                    onChange={(e) => setCareRole(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-xl border border-[#DEDEDE] bg-white text-[14px] text-[#454545] focus:outline-none focus:border-[#5B6B7E] focus:ring-1 focus:ring-[#5B6B7E] transition-all"
                  >
                    <option value="Primary Family Caregiver">Primary Family Caregiver</option>
                    <option value="Clinical Physician / Nurse">Clinical Physician / Nurse</option>
                    <option value="Assisted Living Operator">Assisted Living Operator</option>
                    <option value="Independent Senior">Independent Resident</option>
                  </select>
                </div>
              </div>

              {/* Strict Privacy Notice Consent Checkbox */}
              <div className="pt-2">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    required
                    checked={consent}
                    onChange={(e) => setConsent(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded border-[#DEDEDE] text-[#5B6B7E] focus:ring-[#5B6B7E]"
                  />
                  <span className="text-[11px] text-[#6E6E73] leading-relaxed">
                    I acknowledge and consent to the edge-encrypted processing of
                    telemetry &amp; medication schedules under the{" "}
                    <strong className="text-[#454545]">
                      Sri Lanka Personal Data Protection Act No. 9 of 2022
                    </strong>{" "}
                    and <strong className="text-[#454545]">UK GDPR</strong>.
                  </span>
                </label>
              </div>

              {/* Submit CTA */}
              <button
                type="submit"
                disabled={!consent}
                className="w-full h-[46px] rounded-[100px] bg-[#454545] hover:bg-[#1D1D1F] disabled:opacity-50 text-white text-[14px] font-medium tracking-tight transition-all duration-300 transform active:scale-98 shadow-[0_4px_16px_rgba(69,69,69,0.2)] mt-3"
              >
                Confirm Priority Reservation
              </button>
            </form>
          </div>
        ) : (
          /* Confirmation Success State */
          <div className="text-center py-6">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto mb-4 text-[24px]">
              ✓
            </div>

            <h3 className="text-[22px] font-medium text-[#454545] tracking-tight mb-2">
              Allocation Reserved
            </h3>

            <p className="text-[14px] text-[#6E6E73] leading-relaxed max-w-[380px] mx-auto mb-6">
              Thank you, <strong className="text-[#454545]">{name}</strong>. Your priority
              reservation pass has been generated and logged locally.
            </p>

            {/* Pass Card */}
            <div className="bg-[#F8F9FA] border border-[#E8E8ED] rounded-2xl p-4 text-left max-w-[380px] mx-auto mb-6">
              <div className="flex justify-between items-center pb-2 border-b border-[#DEDEDE] mb-2">
                <span className="text-[10px] font-mono text-[#6E6E73] uppercase">
                  Reservation Pass
                </span>
                <span className="text-[12px] font-mono font-semibold text-[#5B6B7E]">
                  {reservationId}
                </span>
              </div>
              <div className="space-y-1 text-[11px] text-[#6E6E73]">
                <div className="flex justify-between">
                  <span>Region:</span>
                  <span className="font-medium text-[#454545]">{district}, Sri Lanka</span>
                </div>
                <div className="flex justify-between">
                  <span>Contact:</span>
                  <span className="font-medium text-[#454545]">+94 {phone}</span>
                </div>
                <div className="flex justify-between">
                  <span>System:</span>
                  <span className="font-medium text-[#454545]">ALVI One (Dual Unit)</span>
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="h-[40px] px-8 rounded-[100px] bg-[#454545] hover:bg-[#1D1D1F] text-white text-[13px] font-normal transition-colors"
            >
              Done
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
