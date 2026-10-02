import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  QrCode, 
  Plus, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  MapPin, 
  Zap,
  Info,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Property, PropertyCondition, PropertyStatus } from '../../types';
import { BorrowRequestModal } from '../borrower/BorrowRequestModal';
import { WalkInBorrowingModal } from '../custodian/WalkInBorrowingModal';

export const PropertyCatalog: React.FC = () => {
  const { 
    properties, 
    categories, 
    locations, 
    currentUser, 
    openQrModal, 
    saveProperty 
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  
  // Modals
  const [requestProperty, setRequestProperty] = useState<Property | null>(null);
  const [walkInProgress, setWalkInProgress] = useState<Property | null>(null);
  const [viewDetailsProperty, setViewDetailsProperty] = useState<Property | null>(null);
  const [isEditingProperty, setIsEditingProperty] = useState<Property | null>(null);
  const [isAddingNew, setIsAddingNew] = useState(false);

  // New Property form state
  const [newPropId, setNewPropId] = useState('');
  const [newPropName, setNewPropName] = useState('');
  const [newPropCategory, setNewPropCategory] = useState(categories[0]?.id || 'cat_sound');
  const [newPropLocation, setNewPropLocation] = useState(locations[0]?.id || 'loc_office');
  const [newPropSerial, setNewPropSerial] = useState('');
  const [newPropCondition, setNewPropCondition] = useState<PropertyCondition>('GOOD');
  const [newPropNotes, setNewPropNotes] = useState('');

  const isCustodian = currentUser.role === 'CUSTODIAN' || currentUser.role === 'ORG_ADMIN' || currentUser.role === 'SYSTEM_ADMIN';

  // Filtering
  const filteredProperties = properties.filter(prop => {
    const matchesSearch = 
      prop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prop.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prop.serialNumber && prop.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || prop.categoryId === selectedCategory;
    const matchesStatus = selectedStatus === 'all' || prop.status === selectedStatus;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const getCategoryName = (id: string) => {
    return categories.find(c => c.id === id)?.name || 'General Equipment';
  };

  const getLocationName = (id: string) => {
    return locations.find(l => l.id === id)?.name || 'Department Custody';
  };

  const handleAddNewProperty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPropId.trim() || !newPropName.trim()) return;

    const prop: Property = {
      id: newPropId.trim().toUpperCase(),
      name: newPropName.trim(),
      categoryId: newPropCategory,
      locationId: newPropLocation,
      serialNumber: newPropSerial.trim() || undefined,
      condition: newPropCondition,
      status: 'AVAILABLE',
      qrIdentifier: newPropId.trim().toUpperCase(),
      notes: newPropNotes.trim() || undefined,
      totalBorrowCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    saveProperty(prop);
    setIsAddingNew(false);
    setNewPropId('');
    setNewPropName('');
    setNewPropSerial('');
    setNewPropNotes('');
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Equipment Inventory & Custody Catalog
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Browse departmental assets, check availability, request items, or scan QR identification.
          </p>
        </div>

        {isCustodian && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => setWalkInProgress({} as Property)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
            >
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              + Urgent Walk-In Borrowing
            </button>
            <button
              onClick={() => setIsAddingNew(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-lg transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Register Asset
            </button>
          </div>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 space-y-3">
        <div className="flex flex-col sm:flex-row gap-3">
          
          {/* Search Input */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search by equipment name, Asset ID (e.g. SB-0001), or serial number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Status Dropdown Filter */}
          <div className="flex items-center gap-2">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-slate-900 font-medium text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="AVAILABLE">Available for Loan</option>
              <option value="BORROWED">Currently Borrowed</option>
              <option value="RESERVED">Reserved</option>
              <option value="MAINTENANCE">In Maintenance</option>
            </select>
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 pb-0.5 no-scrollbar">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
            }`}
          >
            All Categories ({properties.length})
          </button>
          {categories.map(cat => {
            const count = properties.filter(p => p.categoryId === cat.id).length;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200'
                }`}
              >
                {cat.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Property Cards Grid */}
      {filteredProperties.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-xl border border-slate-200">
          <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
            <Search className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">No matching equipment found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Try adjusting your search criteria or resetting filters to browse all inventory.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map(property => {
            const isAvailable = property.status === 'AVAILABLE';
            const isBorrowed = property.status === 'BORROWED';
            const isMaintenance = property.status === 'MAINTENANCE';

            return (
              <div 
                key={property.id} 
                className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col justify-between hover:border-slate-300 hover:shadow-xs transition-all"
              >
                <div>
                  {/* Photo / Asset Header */}
                  <div className="relative aspect-16/9 bg-slate-100 overflow-hidden border-b border-slate-100">
                    {property.photoUrl ? (
                      <img 
                        src={property.photoUrl} 
                        alt={property.name} 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400">
                        <Layers className="w-8 h-8 opacity-40 mb-1" />
                        <span className="font-mono text-xs font-semibold">{property.id}</span>
                      </div>
                    )}

                    {/* Status badge strip */}
                    <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
                      <span className={`text-[11px] font-semibold px-2 py-0.5 rounded shadow-xs ${
                        isAvailable 
                          ? 'bg-emerald-600 text-white' 
                          : (isBorrowed ? 'bg-amber-600 text-white' : 'bg-slate-700 text-white')
                      }`}>
                        {property.status}
                      </span>
                    </div>

                    {/* Condition badge */}
                    <div className="absolute bottom-2.5 left-2.5">
                      <span className="text-[10px] font-mono font-bold bg-slate-900/80 backdrop-blur-xs text-white px-2 py-0.5 rounded">
                        Condition: {property.condition}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-2">
                    
                    {/* Unboxed clean metadata (zero-pill rule) */}
                    <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                      <span className="font-mono font-semibold text-slate-700">{property.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="truncate">{getCategoryName(property.categoryId)}</span>
                      <span aria-hidden="true">·</span>
                      <span>{property.totalBorrowCount} loans</span>
                    </div>

                    <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-1">
                      {property.name}
                    </h3>

                    <div className="flex items-center gap-1 text-xs text-slate-500">
                      <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                      <span className="truncate">{getLocationName(property.locationId)}</span>
                    </div>

                    {property.specs && (
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-2 gap-x-2 gap-y-1 text-[11px]">
                        {Object.entries(property.specs).slice(0, 2).map(([k, v]) => (
                          <div key={k} className="truncate">
                            <span className="text-slate-400">{k}: </span>
                            <span className="text-slate-700 font-medium">{v}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Card Action Footer */}
                <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => openQrModal(property.qrIdentifier, property.name, `Asset Code: ${property.id} · Department Custody`)}
                    className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200/70 transition-colors"
                    title="Generate / Print Official Asset QR Label"
                  >
                    <QrCode className="w-4 h-4" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => setViewDetailsProperty(property)}
                      className="px-2.5 py-1.5 text-xs text-slate-600 hover:text-slate-900 font-medium transition-colors"
                    >
                      Details
                    </button>

                    {isAvailable ? (
                      <button
                        onClick={() => setRequestProperty(property)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
                      >
                        Request Loan
                      </button>
                    ) : (
                      <span className="text-[11px] text-slate-400 italic px-2 py-1">
                        {isBorrowed ? 'Checked Out' : 'Unavailable'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Request Modal */}
      {requestProperty && (
        <BorrowRequestModal
          property={requestProperty}
          onClose={() => setRequestProperty(null)}
        />
      )}

      {/* Walk-in Modal */}
      {walkInProgress && (
        <WalkInBorrowingModal
          initialProperty={walkInProgress.id ? walkInProgress : undefined}
          onClose={() => setWalkInProgress(null)}
        />
      )}

      {/* Add New Property Modal */}
      {isAddingNew && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-sm">Register New Organization Property</h3>
              <button onClick={() => setIsAddingNew(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddNewProperty} className="space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Asset ID (e.g. SB-0003):</label>
                  <input
                    type="text"
                    required
                    value={newPropId}
                    onChange={e => setNewPropId(e.target.value)}
                    placeholder="SB-0003"
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Condition:</label>
                  <select
                    value={newPropCondition}
                    onChange={e => setNewPropCondition(e.target.value as PropertyCondition)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    <option value="GOOD">GOOD</option>
                    <option value="MINOR_DAMAGE">MINOR_DAMAGE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Equipment Name:</label>
                <input
                  type="text"
                  required
                  value={newPropName}
                  onChange={e => setNewPropName(e.target.value)}
                  placeholder="e.g. Yamaha StagePas 400BT Portable PA"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Category:</label>
                  <select
                    value={newPropCategory}
                    onChange={e => setNewPropCategory(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {categories.map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Storage Room:</label>
                  <select
                    value={newPropLocation}
                    onChange={e => setNewPropLocation(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                  >
                    {locations.map(l => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Serial Number (Optional):</label>
                <input
                  type="text"
                  value={newPropSerial}
                  onChange={e => setNewPropSerial(e.target.value)}
                  placeholder="e.g. SN-8839-4401"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Included Accessories:</label>
                <input
                  type="text"
                  value={newPropNotes}
                  onChange={e => setNewPropNotes(e.target.value)}
                  placeholder="Includes power supply, auxiliary cable, and protective cover"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingNew(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Save & Generate Tag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Property Details View Modal */}
      {viewDetailsProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full overflow-hidden border border-slate-200 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-slate-900 text-sm">{viewDetailsProperty.name}</h3>
                <div className="text-xs text-slate-500 font-mono">Asset ID: {viewDetailsProperty.id}</div>
              </div>
              <button onClick={() => setViewDetailsProperty(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-700">
              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200">
                <div>
                  <span className="text-slate-400 block text-[11px]">Current Status:</span>
                  <span className="font-bold">{viewDetailsProperty.status}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Condition:</span>
                  <span className="font-bold font-mono">{viewDetailsProperty.condition}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Storage Location:</span>
                  <span>{getLocationName(viewDetailsProperty.locationId)}</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Lifetime Loans:</span>
                  <span className="font-mono">{viewDetailsProperty.totalBorrowCount} times</span>
                </div>
              </div>

              {viewDetailsProperty.notes && (
                <div className="p-3 bg-white rounded-lg border border-slate-200">
                  <div className="font-semibold text-slate-900 mb-1">Custodian Notes:</div>
                  <p className="text-slate-600">{viewDetailsProperty.notes}</p>
                </div>
              )}

              {viewDetailsProperty.specs && (
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                  <div className="font-semibold text-slate-900 mb-1">Technical Specifications:</div>
                  {Object.entries(viewDetailsProperty.specs).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-[11px]">
                      <span className="text-slate-500">{k}:</span>
                      <span className="font-medium text-slate-800">{v}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-slate-100">
              <button
                onClick={() => {
                  const prop = viewDetailsProperty;
                  setViewDetailsProperty(null);
                  openQrModal(prop.qrIdentifier, prop.name, `Asset: ${prop.id}`);
                }}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                <QrCode className="w-3.5 h-3.5" />
                Print QR Tag
              </button>
              
              <button
                onClick={() => setViewDetailsProperty(null)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
