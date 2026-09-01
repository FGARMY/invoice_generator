'use client';

import { useState, useEffect } from 'react';
import { useInvoiceStore } from '@/store/invoiceStore';
import { getClients, saveClient, deleteClient } from '@/lib/storage';
import { generateId } from '@/lib/defaults';
import { Client } from '@/types/invoice';

export default function ClientDetails() {
  const { client, updateClient } = useInvoiceStore();
  const [savedClients, setSavedClients] = useState<Client[]>([]);
  const [showSaved, setShowSaved] = useState(false);

  useEffect(() => {
    setSavedClients(getClients());
  }, []);

  const handleSaveClient = () => {
    if (!client.name.trim()) return;
    const clientToSave = {
      ...client,
      id: client.id || generateId(),
    };
    saveClient(clientToSave);
    setSavedClients(getClients());
  };

  const handleSelectClient = (saved: Client) => {
    updateClient(saved);
    setShowSaved(false);
  };

  const handleDeleteClient = (id: string) => {
    deleteClient(id);
    setSavedClients(getClients());
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
          Bill To
        </h3>
        <div className="flex gap-2">
          {savedClients.length > 0 && (
            <button
              onClick={() => setShowSaved(!showSaved)}
              className="px-2.5 py-1 text-xs font-medium bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
            >
              {showSaved ? 'Close' : 'Saved Clients'}
            </button>
          )}
          <button
            onClick={handleSaveClient}
            disabled={!client.name.trim()}
            className="px-2.5 py-1 text-xs font-medium bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Save Client
          </button>
        </div>
      </div>

      {/* Saved clients dropdown */}
      {showSaved && savedClients.length > 0 && (
        <div className="bg-slate-800/80 border border-slate-700 rounded-lg overflow-hidden max-h-40 overflow-y-auto">
          {savedClients.map((saved) => (
            <div
              key={saved.id}
              className="flex items-center justify-between px-3 py-2 hover:bg-slate-700/50 cursor-pointer transition-colors"
            >
              <div
                onClick={() => handleSelectClient(saved)}
                className="flex-1 min-w-0"
              >
                <div className="text-sm text-white truncate">{saved.name}</div>
                <div className="text-xs text-slate-400 truncate">
                  {saved.company || saved.email}
                </div>
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteClient(saved.id);
                }}
                className="ml-2 p-1 text-red-400/60 hover:text-red-400 transition-colors"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Client Name *
          </label>
          <input
            type="text"
            value={client.name}
            onChange={(e) => updateClient({ name: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="John Doe"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Company
          </label>
          <input
            type="text"
            value={client.company}
            onChange={(e) => updateClient({ company: e.target.value })}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
            placeholder="Company Inc."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1">
            Address
          </label>
          <textarea
            value={client.address}
            onChange={(e) => updateClient({ address: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
            placeholder="456 Client Ave, City, State - ZIP"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Email
            </label>
            <input
              type="email"
              value={client.email}
              onChange={(e) => updateClient({ email: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="client@email.com"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1">
              Phone
            </label>
            <input
              type="tel"
              value={client.phone}
              onChange={(e) => updateClient({ phone: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
              placeholder="+91 98765 43210"
            />
          </div>
        </div>
        <div className="pt-4 mt-4 border-t border-slate-700/50">
          <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Shipping Details (Optional)
          </h4>
          
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Shipping Address
              </label>
              <textarea
                value={client.shippingAddress || ''}
                onChange={(e) => updateClient({ shippingAddress: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                placeholder="Leave blank to use billing address"
              />
            </div>
            
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Shipping Email
              </label>
              <input
                type="email"
                value={client.shippingEmail || ''}
                onChange={(e) => updateClient({ shippingEmail: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800/50 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                placeholder="shipping@email.com"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
