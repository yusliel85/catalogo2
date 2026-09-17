import React, { useState } from 'react';
import { ContactInfo } from '../types';
import { Mail, Phone, Globe, MapPin, Building, User, Check, Info, ChevronDown, ChevronUp } from 'lucide-react';

interface AdminContactProps {
  contact: ContactInfo;
  setContact: React.Dispatch<React.SetStateAction<ContactInfo>>;
}

export function AdminContact({ contact, setContact }: AdminContactProps) {
  const [saved, setSaved] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(true);

  const updateField = (key: keyof ContactInfo, val: string) => {
    setContact(prev => ({
      ...prev,
      [key]: val
    }));
  };

  const handleSaveAndConfirm = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-stone-100 transition-all duration-200 hover:border-stone-200" id="admin-contact-view">
      {/* Header section as toggle trigger */}
      <div 
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="p-5 flex items-center justify-between cursor-pointer select-none hover:bg-stone-50/50 rounded-t-xl"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-teal-50 rounded-lg text-teal-700">
            <Building className="w-5 h-5 text-teal-700" />
          </div>
          <div>
            <h2 className="font-serif text-sm font-bold text-stone-800 flex items-center gap-1.5">
              Información Empresa
            </h2>
            {isCollapsed ? (
              <p className="text-[11px] text-stone-500 mt-0.5 max-w-xs md:max-w-md line-clamp-1 font-sans">
                <span className="font-semibold text-stone-700">{contact.company || 'Sin Compañía'}</span>
                {contact.name ? ` • Atiende: ${contact.name}` : ''}
                {contact.phone ? ` • WhatsApp: ${contact.phone}` : ''}
              </p>
            ) : (
              <p className="text-xs text-stone-500 mt-0.5">Los datos de contacto se adjuntarán automáticamente en el PDF y links de WhatsApp.</p>
            )}
          </div>
        </div>
        <div className="text-stone-400 hover:text-stone-600 transition-colors p-1">
          {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
        </div>
      </div>

      {!isCollapsed && (
        <div className="px-5 pb-5 border-t border-stone-100/60 pt-4 flex flex-col justify-between">
          <div className="space-y-3.5">
            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                <User className="w-3 h-3 text-stone-400" /> Atiende / Ejecutivo Responsable *
              </label>
              <input
                type="text"
                value={contact.name}
                onChange={e => updateField('name', e.target.value)}
                placeholder="Ej: Lic. Carlos Mendoza"
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <Building className="w-3 h-3 text-stone-400" /> Compañía / Razón Social *
                </label>
                <input
                  type="text"
                  value={contact.company}
                  onChange={e => updateField('company', e.target.value)}
                  placeholder="Ej: Tejidos de México"
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <Globe className="w-3 h-3 text-stone-400" /> Sitio Web (URL)
                </label>
                <input
                  type="text"
                  value={contact.website || ''}
                  onChange={e => updateField('website', e.target.value)}
                  placeholder="Ej: www.tejidos.mx"
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <Mail className="w-3 h-3 text-stone-400" /> Correo de Cotizaciones *
                </label>
                <input
                  type="email"
                  value={contact.email}
                  onChange={e => updateField('email', e.target.value)}
                  placeholder="Ej: ventas@empresa.com"
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                  <Phone className="w-3 h-3 text-stone-400" /> Celular de Ventas (WhatsApp) *
                </label>
                <input
                  type="text"
                  value={contact.phone}
                  onChange={e => updateField('phone', e.target.value)}
                  placeholder="Ej: +525512345678"
                  className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-stone-600 mb-1 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-stone-400" /> Dirección de Almacén / Oficina
              </label>
              <input
                type="text"
                value={contact.address || ''}
                onChange={e => updateField('address', e.target.value)}
                placeholder="Ej: Calle 5 de Mayo #12, Guadalajara, Jal."
                className="w-full text-xs p-2 bg-stone-50 border border-stone-300 rounded focus:border-stone-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-stone-100">
            <button
              onClick={handleSaveAndConfirm}
              className={`w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-sm ${
                saved 
                  ? 'bg-emerald-600 text-white hover:bg-emerald-700' 
                  : 'bg-stone-900 text-[#fafaf9] hover:bg-stone-850'
              }`}
            >
              {saved ? (
                <>
                  <Check className="w-4 h-4 text-white animate-bounce" />
                  ¡Ajustes Guardados con Éxito!
                </>
              ) : (
                'Guardar Ajustes de Contacto'
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
