import React, { useState, useRef, useEffect } from 'react';
import { CustomMessages, ContactInfo } from '../types';
import { MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { scrollToAdminSection } from '../lib/scrollUtils';

interface AdminMessagesProps {
  messages: CustomMessages;
  setMessages: React.Dispatch<React.SetStateAction<CustomMessages>>;
  contact?: ContactInfo;
  setContact?: React.Dispatch<React.SetStateAction<ContactInfo>>;
  isOpen?: boolean;
  onToggle?: () => void;
}

export function AdminMessages({ messages, setMessages, isOpen, onToggle }: AdminMessagesProps) {
  const [localCollapsed, setLocalCollapsed] = useState(true);
  const isCollapsed = isOpen !== undefined ? !isOpen : localCollapsed;
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isCollapsed) {
      scrollToAdminSection(sectionRef.current, 30);
    }
  }, [isCollapsed]);

  const handleHeaderToggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setLocalCollapsed(!localCollapsed);
    }
  };

  const updateMessage = (field: keyof CustomMessages, value: string) => {
    setMessages((prev) => ({ ...prev, [field]: value }));
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
          <div className="p-2.5 bg-green-50 border border-green-100 rounded-xl text-green-600 group-hover:bg-green-100 transition-colors shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-bold text-stone-900 text-base">Mensajes de WhatsApp</h3>
            <p className="text-xs text-stone-500 truncate sm:whitespace-normal">
              Compartir producto y consultar producto por WhatsApp
            </p>
          </div>
        </div>
        <div className="p-1 text-stone-400 group-hover:text-stone-600 transition-colors shrink-0">
          {isCollapsed ? <ChevronDown className="w-5 h-5" /> : <ChevronUp className="w-5 h-5" />}
        </div>
      </button>

      {!isCollapsed && (
        <div className="mt-5 pt-4 border-t border-stone-100 space-y-4 animate-fadeIn">
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Compartir Producto (Mensaje al compartir un producto individual):
            </label>
            <textarea
              rows={4}
              value={messages.shareProduct}
              onChange={(e) => updateMessage('shareProduct', e.target.value)}
              className="w-full min-w-0 text-xs font-mono p-3 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Variables disponibles: {'{imagen}'} (foto), {'{nombre}'}, {'{categoria}'}, {'{url}'} (URL del catálogo), {'{precio}'}
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              Consultar Producto por WhatsApp (Mensaje de consulta al vendedor):
            </label>
            <textarea
              rows={3}
              value={messages.consultProduct}
              onChange={(e) => updateMessage('consultProduct', e.target.value)}
              className="w-full min-w-0 text-xs font-mono p-3 bg-stone-50 text-stone-900 border border-stone-200 rounded-xl focus:outline-none"
            />
            <p className="text-[11px] text-stone-400 mt-1">
              Variables disponibles: {'{nombre}'}, {'{categoria}'}, {'{precio}'}, {'{url}'}. Se envía automáticamente al número registrado en "Información de Empresa".
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
