import React, { useState, useRef } from 'react';
import { ContactInfo } from '../types';
import { Mail, Phone, Building, Globe, MapPin, ChevronDown, ChevronUp, User } from 'lucide-react';
import { scrollToAdminSection } from '../lib/scrollUtils';

interface AdminContactProps {
  contact: ContactInfo;
  setContact: React.Dispatch<React.SetStateAction<ContactInfo>>;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AdminContact({
  contact,
  setContact,
  isOpen,
  onToggle
}: AdminContactProps) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  const isCollapsed = isOpen !== undefined ? !isOpen : localCollapsed;
  const sectionRef = useRef<HTMLDivElement>(null);

  const handleHeaderToggle = () => {
    const willOpen = isCollapsed;
    if (onToggle) {
      onToggle();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
    if (willOpen) {
      scrollToAdminSection(sectionRef.current);
    }
  };

  const updateField = (field: keyof ContactInfo, value: string) => {
    setContact((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div
      ref={sectionRef}
      className="bg-white rounded-2xl p-4 sm:p-5 border border-stone-200/70 shadow-sm transition-all overflow-hidden"
    >
      <button
        type="button"
        onClick={handleHeaderToggle}
        className="w-full flex items-center justify-between text-left group cursor-pointer gap-3"
      >
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <div className="p-2.5 bg-blue-50 border border-blue-100 rounded-xl text-blue-600 group-hover:bg-blue-100 transition-colors shrink-0">
            <Building className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-stone-900 text-base">Empresa y Contacto</h3>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Datos para pedidos, WhatsApp, consultas y enlaces
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-4 animate-fadeIn">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Nombre del Contacto
              </label>
              <input
                type="text"
                value={contact.name}
                onChange={(e) => updateField('name', e.target.value)}
                className="w-full min-w-0 text-sm px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400"
                placeholder="Ej. Juan Pérez"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Empresa o Marca
              </label>
              <input
                type="text"
                value={contact.company}
                onChange={(e) => updateField('company', e.target.value)}
                className="w-full min-w-0 text-sm px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400"
                placeholder="Ej. Artesanías México"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Teléfono / WhatsApp
              </label>
              <input
                type="text"
                value={contact.phone}
                onChange={(e) => updateField('phone', e.target.value)}
                className="w-full min-w-0 text-sm px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400"
                placeholder="Ej. +52 55 1234 5678"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Correo Electrónico
              </label>
              <input
                type="email"
                value={contact.email}
                onChange={(e) => updateField('email', e.target.value)}
                className="w-full min-w-0 text-sm px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400"
                placeholder="contacto@miempresa.com"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Dirección
              </label>
              <input
                type="text"
                value={contact.address || ''}
                onChange={(e) => updateField('address', e.target.value)}
                className="w-full min-w-0 text-sm px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400"
                placeholder="Ciudad, País"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-stone-400 shrink-0" /> Sitio Web
              </label>
              <input
                type="text"
                value={contact.website || ''}
                onChange={(e) => updateField('website', e.target.value)}
                className="w-full min-w-0 text-sm px-3 py-2 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-stone-400/20 focus:border-stone-400"
                placeholder="www.miempresa.com"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
