'use client';

import React, { useState, useEffect } from 'react';

export interface ShippingFormData {
  fullName: string;
  email: string;
  phone: string;
  streetAddress: string;
  division: string;
  district: string;
  postalCode: string;
  orderNotes?: string;
}

export interface AddressFormProps {
  initialValues?: Partial<ShippingFormData>;
  onSubmit: (data: ShippingFormData) => void;
  isLoading?: boolean;
}

const DIVISIONS = [
  'Dhaka Division',
  'Chittagong Division',
  'Sylhet Division',
  'Rajshahi Division',
  'Khulna Division',
  'Barisal Division',
  'Rangpur Division',
  'Mymensingh Division',
];

export function AddressForm({
  initialValues,
  onSubmit,
  isLoading = false,
}: AddressFormProps) {
  const [formData, setFormData] = useState<ShippingFormData>({
    fullName: initialValues?.fullName || '',
    email: initialValues?.email || '',
    phone: initialValues?.phone || '',
    streetAddress: initialValues?.streetAddress || '',
    division: initialValues?.division || 'Dhaka Division',
    district: initialValues?.district || 'Dhaka Metro',
    postalCode: initialValues?.postalCode || '',
    orderNotes: initialValues?.orderNotes || '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ShippingFormData, string>>>({});

  // Synchronize form state whenever initialValues is updated or reset
  useEffect(() => {
    setFormData({
      fullName: initialValues?.fullName || '',
      email: initialValues?.email || '',
      phone: initialValues?.phone || '',
      streetAddress: initialValues?.streetAddress || '',
      division: initialValues?.division || 'Dhaka Division',
      district: initialValues?.district || 'Dhaka Metro',
      postalCode: initialValues?.postalCode || '',
      orderNotes: initialValues?.orderNotes || '',
    });
    setErrors({});
  }, [initialValues]);

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ShippingFormData, string>> = {};

    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim() || !formData.email.includes('@')) {
      newErrors.email = 'Valid email is required';
    }
    if (!formData.phone.trim() || formData.phone.length < 10) {
      newErrors.phone = 'Valid phone number is required (min 10 digits)';
    }
    if (!formData.streetAddress.trim()) {
      newErrors.streetAddress = 'Street address is required';
    }
    if (!formData.postalCode.trim() || formData.postalCode.length < 4) {
      newErrors.postalCode = '4-digit postal code is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      onSubmit(formData);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof ShippingFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name and Phone */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
            Recipient Full Name *
          </label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="e.g. Samira Rahman"
            className={`w-full px-3 py-2.5 text-xs bg-white border ${
              errors.fullName ? 'border-[#C53030]' : 'border-neutral-300'
            } rounded-[2px] outline-hidden focus:border-black`}
          />
          {errors.fullName && (
            <p className="text-[10px] text-[#C53030] mt-1 font-medium">{errors.fullName}</p>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
            Mobile Number *
          </label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+880 1712-345678"
            className={`w-full px-3 py-2.5 text-xs bg-white border ${
              errors.phone ? 'border-[#C53030]' : 'border-neutral-300'
            } rounded-[2px] outline-hidden focus:border-black`}
          />
          {errors.phone && (
            <p className="text-[10px] text-[#C53030] mt-1 font-medium">{errors.phone}</p>
          )}
        </div>
      </div>

      {/* Email */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
          Email Address (for order receipts &amp; dispatch alerts) *
        </label>
        <input
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="samira.rahman@example.com"
          className={`w-full px-3 py-2.5 text-xs bg-white border ${
            errors.email ? 'border-[#C53030]' : 'border-neutral-300'
          } rounded-[2px] outline-hidden focus:border-black`}
        />
        {errors.email && (
          <p className="text-[10px] text-[#C53030] mt-1 font-medium">{errors.email}</p>
        )}
      </div>

      {/* Street Address */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
          Complete Delivery Address (House/Road/Area) *
        </label>
        <textarea
          rows={2}
          name="streetAddress"
          value={formData.streetAddress}
          onChange={handleChange}
          placeholder="House 14, Road 7, Block D, Banani"
          className={`w-full px-3 py-2 text-xs bg-white border ${
            errors.streetAddress ? 'border-[#C53030]' : 'border-neutral-300'
          } rounded-[2px] outline-hidden focus:border-black`}
        />
        {errors.streetAddress && (
          <p className="text-[10px] text-[#C53030] mt-1 font-medium">{errors.streetAddress}</p>
        )}
      </div>

      {/* Region details */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
            Division
          </label>
          <select
            name="division"
            value={formData.division}
            onChange={handleChange}
            className="w-full px-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-[2px] outline-hidden focus:border-black"
          >
            {DIVISIONS.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
            City / District
          </label>
          <input
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="Dhaka Metro"
            className="w-full px-3 py-2.5 text-xs bg-white border border-neutral-300 rounded-[2px] outline-hidden focus:border-black"
          />
        </div>

        <div>
          <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
            Postal Code *
          </label>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="1213"
            className={`w-full px-3 py-2.5 text-xs bg-white border ${
              errors.postalCode ? 'border-[#C53030]' : 'border-neutral-300'
            } rounded-[2px] outline-hidden focus:border-black`}
          />
          {errors.postalCode && (
            <p className="text-[10px] text-[#C53030] mt-1 font-medium">{errors.postalCode}</p>
          )}
        </div>
      </div>

      {/* Delivery Notes */}
      <div>
        <label className="block text-[11px] font-bold uppercase tracking-wider text-neutral-800 mb-1">
          Special Delivery Instructions (Optional)
        </label>
        <input
          type="text"
          name="orderNotes"
          value={formData.orderNotes}
          onChange={handleChange}
          placeholder="e.g. Leave with security guard or call upon arrival"
          className="w-full px-3 py-2 text-xs bg-white border border-neutral-300 rounded-[2px] outline-hidden focus:border-black"
        />
      </div>

      <div className="pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-[#6A1B6D] hover:bg-[#521354] text-white text-xs font-bold uppercase tracking-[0.14em] py-3.5 px-6 rounded-[2px] transition-colors cursor-pointer shadow-xs"
        >
          {isLoading ? 'Saving Address...' : 'Continue to Delivery Zone'}
        </button>
      </div>
    </form>
  );
}
