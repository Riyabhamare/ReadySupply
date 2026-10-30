import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Building2,
  MapPin,
  Phone,
  Wrench,
  Cpu,
  Layers,
  Plus,
  Trash2,
  Save,
  CheckCircle2,
} from 'lucide-react';
import { api } from '../services/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../components/common/Toast.jsx';
import { Button } from '../components/common/Button.jsx';

export const ProfilePage = () => {
  const { t } = useTranslation();
  const { profile, updateProfileState } = useAuth();
  const { success, error: toastError } = useToast();

  const [activeTab, setActiveTab] = useState('basic'); // 'basic', 'location', 'capabilities', 'machinery'
  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    udyamNumber: '',
    gstNumber: '',
    industryCategory: 'Manufacturing',
    manufacturingSector: 'Automotive & Precision Machining',
    location: {
      state: 'Maharashtra',
      city: '',
      address: '',
      pincode: '',
    },
    contact: {
      personName: '',
      phone: '',
      email: '',
      designation: '',
    },
    productsManufactured: [],
    manufacturingCapabilities: [],
    machineryRoster: [],
    monthlyCapacity: '',
    qcEquipment: [],
    employeeCount: 0,
  });

  const [newProduct, setNewProduct] = useState('');
  const [newCapability, setNewCapability] = useState('');
  const [newQc, setNewQc] = useState('');
  const [newMachine, setNewMachine] = useState({ name: '', type: 'CNC turning', quantity: 1, keySpec: '' });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        companyName: profile.companyName || '',
        description: profile.description || '',
        udyamNumber: profile.udyamNumber || '',
        gstNumber: profile.gstNumber || '',
        industryCategory: profile.industryCategory || 'Manufacturing',
        manufacturingSector: profile.manufacturingSector || 'Automotive & Precision Machining',
        location: {
          state: profile.location?.state || 'Maharashtra',
          city: profile.location?.city || '',
          address: profile.location?.address || '',
          pincode: profile.location?.pincode || '',
        },
        contact: {
          personName: profile.contact?.personName || '',
          phone: profile.contact?.phone || '',
          email: profile.contact?.email || '',
          designation: profile.contact?.designation || '',
        },
        productsManufactured: profile.productsManufactured || [],
        manufacturingCapabilities: profile.manufacturingCapabilities || [],
        machineryRoster: profile.machineryRoster || [],
        monthlyCapacity: profile.monthlyCapacity || '',
        qcEquipment: profile.qcEquipment || [],
        employeeCount: profile.employeeCount || 0,
      });
    }
  }, [profile]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    try {
      setIsSaving(true);
      const res = await api.put('/profile', formData);
      updateProfileState(res.data.profile);
      success('Company profile updated successfully!');
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update profile';
      toastError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const addProduct = () => {
    if (newProduct.trim()) {
      setFormData((prev) => ({
        ...prev,
        productsManufactured: [...prev.productsManufactured, newProduct.trim()],
      }));
      setNewProduct('');
    }
  };

  const removeProduct = (idx) => {
    setFormData((prev) => ({
      ...prev,
      productsManufactured: prev.productsManufactured.filter((_, i) => i !== idx),
    }));
  };

  const addCapability = () => {
    if (newCapability.trim()) {
      setFormData((prev) => ({
        ...prev,
        manufacturingCapabilities: [...prev.manufacturingCapabilities, newCapability.trim()],
      }));
      setNewCapability('');
    }
  };

  const removeCapability = (idx) => {
    setFormData((prev) => ({
      ...prev,
      manufacturingCapabilities: prev.manufacturingCapabilities.filter((_, i) => i !== idx),
    }));
  };

  const addQc = () => {
    if (newQc.trim()) {
      setFormData((prev) => ({
        ...prev,
        qcEquipment: [...prev.qcEquipment, newQc.trim()],
      }));
      setNewQc('');
    }
  };

  const removeQc = (idx) => {
    setFormData((prev) => ({
      ...prev,
      qcEquipment: prev.qcEquipment.filter((_, i) => i !== idx),
    }));
  };

  const addMachine = () => {
    if (newMachine.name.trim()) {
      setFormData((prev) => ({
        ...prev,
        machineryRoster: [...prev.machineryRoster, { ...newMachine }],
      }));
      setNewMachine({ name: '', type: 'CNC turning', quantity: 1, keySpec: '' });
    }
  };

  const removeMachine = (idx) => {
    setFormData((prev) => ({
      ...prev,
      machineryRoster: prev.machineryRoster.filter((_, i) => i !== idx),
    }));
  };

  const completeness = profile?.profileCompleteness || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header with Completeness Ring */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark shadow-subtle">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-navy dark:text-white">
            {t('nav.profile', 'Company Profile & Capabilities')}
          </h1>
          <p className="text-xs sm:text-sm text-muted-light dark:text-muted-dark mt-1">
            Maintain your factory roster and statutory details for buyer checklist matching
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs font-semibold text-muted-light dark:text-muted-dark block">
              Completeness
            </span>
            <span className="text-2xl font-bold font-mono text-primary">
              {completeness}%
            </span>
          </div>
          <Button
            variant="primary"
            size="md"
            icon={Save}
            onClick={handleSave}
            isLoading={isSaving}
          >
            {t('common.save')}
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border-light dark:border-border-dark gap-2 overflow-x-auto select-none">
        {[
          { key: 'basic', label: '1. Basic & Legal', icon: Building2 },
          { key: 'location', label: '2. Location & Contact', icon: MapPin },
          { key: 'capabilities', label: '3. Scope & QC', icon: Layers },
          { key: 'machinery', label: '4. Machinery Roster', icon: Cpu },
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.key}
              type="button"
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-semibold transition-colors shrink-0 ${
                activeTab === tab.key
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-light dark:text-muted-dark hover:text-text-light'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Basic & Legal */}
      {activeTab === 'basic' && (
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-4">
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Company Legal Name *
            </label>
            <input
              type="text"
              required
              value={formData.companyName}
              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Manufacturing Sector *
            </label>
            <select
              value={formData.manufacturingSector}
              onChange={(e) => setFormData({ ...formData, manufacturingSector: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="Automotive & Precision Machining">Automotive & Precision Machining</option>
              <option value="Industrial Machinery">Industrial Machinery & Heavy Fabrication</option>
              <option value="Electrical Equipment">Electrical Equipment & Switchgear</option>
              <option value="Aerospace & Defense">Aerospace & Defense Job Shop</option>
              <option value="General Engineering">General Engineering & Jobbing</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                GSTIN Number (15 Characters)
              </label>
              <input
                type="text"
                placeholder="27AABCS1429B1Z8"
                value={formData.gstNumber}
                onChange={(e) => setFormData({ ...formData, gstNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm font-mono text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <span className="text-[10px] text-muted-light dark:text-muted-dark">
                Format: 2 digits state + 10 PAN + 1 entity + Z + 1 check
              </span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Udyam MSME Registration Number
              </label>
              <input
                type="text"
                placeholder="UDYAM-MH-26-0014829"
                value={formData.udyamNumber}
                onChange={(e) => setFormData({ ...formData, udyamNumber: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm font-mono text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <span className="text-[10px] text-muted-light dark:text-muted-dark">
                Format: UDYAM-XX-00-0000000
              </span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Company Description & Overview
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Brief description of parts manufactured, years in business, and typical customers..."
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Total Employee Count
              </label>
              <input
                type="number"
                min="0"
                value={formData.employeeCount}
                onChange={(e) => setFormData({ ...formData, employeeCount: parseInt(e.target.value, 10) || 0 })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Monthly Capacity Statement
              </label>
              <input
                type="text"
                placeholder="e.g. 50,000 turned pins / month"
                value={formData.monthlyCapacity}
                onChange={(e) => setFormData({ ...formData, monthlyCapacity: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Location & Contact */}
      {activeTab === 'location' && (
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-4">
          <h3 className="text-sm font-bold text-navy dark:text-white">Factory Unit Address</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                State
              </label>
              <input
                type="text"
                value={formData.location.state}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, state: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                City / Industrial Area
              </label>
              <input
                type="text"
                placeholder="e.g. Nashik (Ambad MIDC)"
                value={formData.location.city}
                onChange={(e) => setFormData({ ...formData, location: { ...formData.location, city: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Factory Plot & Street Address
            </label>
            <input
              type="text"
              placeholder="Plot W-42, Ambad Industrial Area, MIDC"
              value={formData.location.address}
              onChange={(e) => setFormData({ ...formData, location: { ...formData.location, address: e.target.value } })}
              className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <h3 className="text-sm font-bold text-navy dark:text-white pt-4 border-t border-border-light dark:border-border-dark">
            Authorized Contact Person
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Person Name
              </label>
              <input
                type="text"
                value={formData.contact.personName}
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, personName: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Designation
              </label>
              <input
                type="text"
                placeholder="Proprietor / Managing Partner"
                value={formData.contact.designation}
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, designation: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Direct Phone Number
              </label>
              <input
                type="text"
                value={formData.contact.phone}
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
                Official Email
              </label>
              <input
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
                className="w-full px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Scope & QC */}
      {activeTab === 'capabilities' && (
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-6">
          {/* Capabilities Tags */}
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Manufacturing Capabilities & Processes
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. CNC turning, VMC milling, TIG welding, Sheet metal"
                value={newCapability}
                onChange={(e) => setNewCapability(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCapability())}
                className="flex-1 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <Button size="sm" variant="secondary" onClick={addCapability}>
                Add Tag
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.manufacturingCapabilities.map((cap, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary-50 dark:bg-primary-950 text-primary text-xs font-semibold border border-primary-200 dark:border-primary-800"
                >
                  {cap}
                  <button
                    type="button"
                    onClick={() => removeCapability(i)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Products Manufactured */}
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Key Products Manufactured
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Steering knuckle pins, Fuel injector nozzles"
                value={newProduct}
                onChange={(e) => setNewProduct(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addProduct())}
                className="flex-1 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <Button size="sm" variant="secondary" onClick={addProduct}>
                Add Product
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.productsManufactured.map((prod, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-text-light dark:text-text-dark text-xs font-medium border border-border-light dark:border-border-dark"
                >
                  {prod}
                  <button
                    type="button"
                    onClick={() => removeProduct(i)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Quality Control Equipment */}
          <div>
            <label className="block text-xs font-semibold text-text-light dark:text-text-dark mb-1">
              Quality Control & Inspection Equipment
            </label>
            <div className="flex gap-2 mb-3">
              <input
                type="text"
                placeholder="e.g. Mitutoyo CMM, 600mm Height Gauge, Roughness Tester"
                value={newQc}
                onChange={(e) => setNewQc(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addQc())}
                className="flex-1 px-3 py-2 rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-sm text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
              <Button size="sm" variant="secondary" onClick={addQc}>
                Add QC Item
              </Button>
            </div>

            <div className="flex flex-wrap gap-2">
              {formData.qcEquipment.map((qc, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-xs font-medium border border-emerald-200 dark:border-emerald-800"
                >
                  {qc}
                  <button
                    type="button"
                    onClick={() => removeQc(i)}
                    className="hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Machinery Roster */}
      {activeTab === 'machinery' && (
        <div className="p-6 rounded-2xl border border-border-light dark:border-border-dark bg-surface-light dark:bg-surface-dark space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-navy dark:text-white">
              Machinery & Equipment Roster
            </h3>
            <span className="text-xs text-muted-light dark:text-muted-dark">
              {formData.machineryRoster.length} machines listed
            </span>
          </div>

          {/* Add Machine Form Box */}
          <div className="p-4 rounded-xl border border-dashed border-border-light dark:border-border-dark bg-slate-50/50 dark:bg-slate-800/30 grid grid-cols-1 sm:grid-cols-4 gap-3 items-end">
            <div className="sm:col-span-2">
              <label className="block text-[11px] font-semibold text-text-light dark:text-text-dark mb-1">
                Machine Make & Model *
              </label>
              <input
                type="text"
                placeholder="e.g. Ace Micromatic Super Jobber"
                value={newMachine.name}
                onChange={(e) => setNewMachine({ ...newMachine, name: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-light dark:text-text-dark mb-1">
                Type / Process
              </label>
              <input
                type="text"
                placeholder="CNC turning"
                value={newMachine.type}
                onChange={(e) => setNewMachine({ ...newMachine, type: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-text-light dark:text-text-dark mb-1">
                Quantity
              </label>
              <input
                type="number"
                min="1"
                value={newMachine.quantity}
                onChange={(e) => setNewMachine({ ...newMachine, quantity: parseInt(e.target.value, 10) || 1 })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-semibold text-text-light dark:text-text-dark mb-1">
                Key Technical Specification (e.g. 15-micron tolerance, 200mm chuck)
              </label>
              <input
                type="text"
                placeholder="Tolerance / Bed Size / RPM"
                value={newMachine.keySpec}
                onChange={(e) => setNewMachine({ ...newMachine, keySpec: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded-lg border border-border-light dark:border-border-dark bg-background-light dark:bg-background-dark text-text-light dark:text-text-dark focus:ring-2 focus:ring-primary focus:outline-none"
              />
            </div>

            <Button size="sm" variant="primary" onClick={addMachine} icon={Plus}>
              Add Machine
            </Button>
          </div>

          {/* Machine List Table */}
          <div className="divide-y divide-border-light dark:divide-border-dark mt-4">
            {formData.machineryRoster.map((m, idx) => (
              <div
                key={idx}
                className="py-3 flex items-center justify-between text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-text-light dark:text-text-dark">
                      {m.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-semibold text-slate-700 dark:text-slate-300">
                      {m.type}
                    </span>
                    <span className="font-semibold text-primary">Qty: {m.quantity}</span>
                  </div>
                  {m.keySpec && (
                    <p className="text-[11px] text-muted-light dark:text-muted-dark mt-0.5">
                      Spec: {m.keySpec}
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => removeMachine(idx)}
                  className="p-1.5 rounded-lg text-muted-light hover:text-red-600 transition-colors"
                  aria-label="Remove machine"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Save Button Bar */}
      <div className="flex justify-end pt-4">
        <Button
          variant="primary"
          size="lg"
          icon={Save}
          onClick={handleSave}
          isLoading={isSaving}
        >
          Save All Changes
        </Button>
      </div>
    </div>
  );
};

