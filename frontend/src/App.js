import React, { useState, useEffect } from 'react';
import { Upload, Trash2, Plus, X, Loader2 } from 'lucide-react';
import {Country, State, City} from 'country-state-city';

const API_URL = 'http://localhost:5000/api';

export default function TimesheetApp({ setUser}){
  const [auth, setAuth] = useState(() => {
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('id');
    return role && id ? { role, id } : null;
  });

  // IMPORTANT: Update role after login or refresh
  useEffect(() => {
    const role = localStorage.getItem('role');
    const id = localStorage.getItem('id');

    if (role && id) {
      setAuth({ role, id });
    }
  }, []);
  const [activeTab, setActiveTab] = useState('onboard');
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [companyQuery, setCompanyQuery] = useState('');
  const [companiesView, setCompaniesView] = useState('table');

  const [companyFilters, setCompanyFilters] = useState({
    name: [],
    email: [],
    contact_number: [],
    client_type: [],
    entity_type: [],
    status: [],
    po_count: []
  });

  //----admin data----
 

  // =====================================
  // SEND VERIFICATION CODE
  // =====================================
  
  // -----------------------------
  // LOGOUT FIXED
  // -----------------------------
  function handleLogout() {
    localStorage.removeItem('loggedInUser');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    localStorage.removeItem('email');
    localStorage.removeItem('name');

    setUser(null); // go back to login page
  }

  // role tabs
  const roleTabs = {
  Admin: ['onboard', 'invoice', 'history', 'companies', 'createUser'],
  'Acount Executive': ['onboard', 'invoice'],
  'Acount Manager': ['onboard', 'invoice', 'history', 'companies']
};
  const tabs = roleTabs[auth?.role] || [];

  // -----------------------------
  // FETCH COMPANIES
  // -----------------------------
  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_URL}/companies`);

      if (!response.ok) {
        throw new Error(`Failed to fetch companies: ${response.statusText}`);
      }

      const data = await response.json();
      setCompanies(Array.isArray(data) ? data : []);

    } catch (err) {
      console.error('Error fetching companies:', err);
      setError(err.message);
      setCompanies([]);
    }
  };

  const handleDeleteCompany = async (companyId, companyName) => {
    if (!window.confirm(`Are you sure you want to delete ${companyName}?`)) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/companies/${companyId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete company: ${response.statusText}`);
      }

      fetchCompanies();
      alert(`Company ${companyName} deleted successfully`);

    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Failed to delete company.');

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab !== 'onboard') {
      fetchCompanies();
    }
  }, [activeTab]);

  

  
  return (
    <div>
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 p-5 pl-20 bg-gradient-to-r from-[#2d73b9] via-[#5f6edc] to-[#9b6cf3]">
        <img
          src="https://media.licdn.com/dms/image/v2/C510BAQGfT3LTL31mMg/company-logo_200_200/company-logo_200_200/0/1631372092417?e=2147483647&v=beta&t=3m8Def2_mkhEUXHKP7CgWJrEgRRrRpslkLBFCVxzCNg"
          alt="Tech Tammina"
          className="shadow-xl w-24 h-24 rounded-full relative top-16"
        />
        <h1 className="text-3xl font-bold text-white mr-20">
          Invoice Management System
        </h1>
      </div>

      {/* SIDEBAR TABS */}
      <div className="p-8 mt-10 gap-3 flex items-baseline justify-start">
        <div className="flex flex-col gap-4 mb-6 border-b border-blue-200 pb-2">

          {/* ROLE-BASED TABS FIXED */}
          {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 px-4 py-2 rounded ${activeTab === tab
                  ? 'bg-blue-500 text-white'
                  : 'bg-blue-100'
                  }`}
              >
                {tab === 'onboard' && 'Client Onboarding'}
                {tab === 'invoice' && 'Generate Invoice'}
                {tab === 'history' && 'Invoice History'}
                {tab === 'companies' && 'Companies List'}
                {tab === 'createUser' && 'Create User'}
              </button>
            ))}

          {/* LOGOUT */}
          <div className="flex gap-4 mb-4 pl-5 text-[#E80909]">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src="/logout.jpeg"
              alt="Logout icon"
            />
            <button onClick={handleLogout}>Logout</button>
          </div>
        </div>
        

        {activeTab === 'onboard' && <CompanyOnboarding />}
        {activeTab === 'invoice'  && <InvoiceGeneration companies={companies} />}
        {activeTab === 'history' && <InvoiceHistory />}
        {activeTab === 'companies' && (
          <div className="bg-white p-4 rounded border w-5/6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-[#9b6cf3]">Clients List</h2>
              <div className="flex items-center gap-2">
                <div className="relative">
                </div>
                <input
                  value={companyQuery}
                  onChange={e => setCompanyQuery(e.target.value)}
                  className="border border-blue-300 rounded px-3 py-1.5 text-sm w-64"
                  placeholder="Search companies by name or email"
                />
              </div>
            </div>
            {loading && (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="animate-spin text-blue-600" />
                <span className="ml-2 text-blue-700">Processing...</span>
              </div>
            )}
            {error && (
              <div className="bg-blue-50 text-blue-700 p-4 rounded mb-4">
                Error: {error}
              </div>
            )}
            {!loading && (companies && companies.length > 0 ? (
              companiesView === 'cards' ? (
                <CompaniesCards
                  companies={companies}
                  setCompanies={setCompanies}
                  companyQuery={companyQuery}
                  companyFilters={companyFilters}
                  handleDeleteCompany={handleDeleteCompany}
                />
              ) : (
                <div className="overflow-x-auto rounded-lg border border-blue-200">
                  <table className="min-w-full text-sm">
                    <thead className="bg-blue-100 sticky top-0 z-10">
                      <tr>
                        {/* Client Name */}
                        <th className="px-4 py-2 text-left w-56">
                          <div className="flex flex-col gap-1">
                            <span>Client Name</span>
                            <select
                              value={companyFilters.name}
                              onChange={e =>
                                setCompanyFilters(prev => ({ ...prev, name: e.target.value ? [e.target.value] : [] }))
                              }
                              className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                            >
                              <option value="">All</option>
                              {Array.from(new Set(companies.map(c => c.name))).map(name => (
                                <option key={name} value={name}>{name}</option>
                              ))}
                            </select>
                          </div>
                        </th>

                        {/* Email */}
                        <th className="px-4 py-2 text-left">
                          <div className="flex flex-col gap-1">
                            <span>Email</span>
                            <select
                              value={companyFilters.email}
                              onChange={e =>
                                setCompanyFilters(prev => ({ ...prev, email: e.target.value ? [e.target.value] : [] }))
                              }
                              className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                            >
                              <option value="">All</option>
                              {Array.from(new Set(companies.map(c => c.email))).map(email => (
                                <option key={email} value={email}>{email}</option>
                              ))}
                            </select>
                          </div>
                        </th>

                        {/* Contact */}
                        <th className="px-4 py-2 text-left">
                          <div className="flex flex-col gap-1">
                            <span>Contact</span>
                            <select
                              value={companyFilters.contact_number}
                              onChange={e =>
                                setCompanyFilters(prev => ({ ...prev, contact_number: e.target.value ? [e.target.value] : [] }))
                              }
                              className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                            >
                              <option value="">All</option>
                              {Array.from(new Set(companies.map(c => c.contact_number))).map(contact => (
                                <option key={contact} value={contact}>{contact}</option>
                              ))}
                            </select>
                          </div>
                        </th>

                        {/* Type */}
                        <th className="px-4 py-2 text-left w-32">
                          <div className="flex flex-col gap-1">
                            <span>Type</span>
                            <select
                              value={companyFilters.entity_type}
                              onChange={e =>
                                setCompanyFilters(prev => ({ ...prev, entity_type: e.target.value ? [e.target.value] : [] }))
                              }
                              className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                            >
                              <option value="">All</option>
                              {Array.from(new Set(companies.map(c => (c.entity_type || '').replace('_', ' ')))).map(type => (
                                <option key={type} value={type}>{type}</option>
                              ))}
                            </select>
                          </div>
                        </th>

                        {/* Status */}
                        <th className="px-4 py-2 text-left">
                          <div className="flex flex-col gap-1">
                            <span>Status</span>
                            <select
                              value={companyFilters.status}
                              onChange={e =>
                                setCompanyFilters(prev => ({ ...prev, status: e.target.value ? [e.target.value] : [] }))
                              }
                              className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                            >
                              <option value="">All</option>
                              <option value="Active">Active</option>
                              <option value="Not Active">Not Active</option>
                            </select>
                          </div>
                        </th>

                        {/* PO Count */}
                        <th className="px-4 py-2 text-left">
                          <div className="flex flex-col gap-1">
                            <span>PO Count</span>
                            <select
                              value={companyFilters.po_count}
                              onChange={e =>
                                setCompanyFilters(prev => ({ ...prev, po_count: e.target.value ? [e.target.value] : [] }))
                              }
                              className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                            >
                              <option value="">All</option>
                              {Array.from(new Set(companies.map(c => String(c.po_count ?? (c.po_numbers?.length || 0))))).map(count => (
                                <option key={count} value={count}>{count}</option>
                              ))}
                            </select>
                          </div>
                        </th>

                        {/* Actions */}
                        <th className="px-4 py-2 text-left w-28">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="[&>tr:nth-child(even)]:bg-blue-50/40">
                      {companies
                        .filter(c => {
                          if (!companyQuery) return true;
                          const q = companyQuery.toLowerCase();
                          return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
                        })
                        .filter(c => {
                          // Multi-select filters
                          const f = companyFilters;
                          const asLabel = (c.is_active ? 'Active' : 'Not Active');
                          const matchesName = !f.name.length || f.name.includes(c.name || '');
                          const matchesEmail = !f.email.length || f.email.includes(c.email || '');
                          const matchesContact = !f.contact_number.length || f.contact_number.includes(c.contact_number || '');
                          const matchesType = !f.entity_type.length || f.entity_type.includes((c.entity_type || '').replace('_', ' '));
                          const matchesStatus = !f.status.length || f.status.includes(asLabel);
                          const poCountLabel = String(c.po_count ?? (c.po_numbers?.length || 0));
                          const matchesPOCount = !f.po_count.length || f.po_count.includes(poCountLabel);
                          return matchesName && matchesEmail && matchesContact && matchesType && matchesStatus && matchesPOCount;
                        })
                        .map(company => (
                          <tr key={company.id} className="border-b hover:bg-blue-50">
                            <td className="px-4 py-2 font-medium text-blue-700">{company.name}</td>
                            <td className="px-4 py-2">{company.email}</td>
                            <td className="px-4 py-2">{company.contact_number}</td>
                            <td className="px-4 py-2">
                              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                                {company.entity_type?.replace('_', ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-2">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${company.is_active ? 'bg-green-200 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                                {company.is_active ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="px-4 py-2">{company.po_count ?? (company.po_numbers?.length || 0)}</td>
                            <td className="px-4 py-2">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={async () => {
                                    try {
                                      const res = await fetch(`${API_URL}/companies/${company.id}/status`, {
                                        method: 'PUT',
                                        headers: { 'Content-Type': 'application/json' },
                                        body: JSON.stringify({ is_active: !company.is_active })
                                      });
                                      if (!res.ok) {
                                        const e = await res.json().catch(() => ({}));
                                        throw new Error(e.error || 'Failed to update status');
                                      }
                                      const updated = await res.json();
                                      setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: updated.is_active } : c));
                                    } catch (e) {
                                      alert(e.message);
                                    }
                                  }}
                                  className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors ${company.is_active ? 'bg-green-500' : 'bg-gray-400'}`}
                                  disabled={loading}
                                  title={company.is_active ? 'Click to turn OFF' : 'Click to turn ON'}
                                >
                                  <span className={`absolute text-[9px] text-white ${company.is_active ? 'left-1.5' : 'right-1.5'}`}>
                                    {company.is_active ? 'Active' : 'Inactive'}
                                  </span>
                                  <span className={`inline-block pl-2 h-2 w-2 transform rounded-full bg-white shadow-md transition-transform ${company.is_active ? 'translate-x-8' : 'translate-x-1'}`} />
                                </button>
                                <button
                                  onClick={() => handleDeleteCompany(company.id, company.name)}
                                  className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors"
                                  disabled={loading}
                                  title="Delete company"
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              )
            ) : (
              <div className="text-center p-8 bg-blue-50 rounded">
                <p className="text-blue-700">No clients found. Add a client using the Client Onboarding tab.</p>
              </div>
            ))}
          </div>
          
        )}
        {activeTab === 'createUser' && <CreateUser />}
      </div>
    </div>
  );
}

function CompanyOnboarding() {
  const [countries, setCountries] = useState(Country.getAllCountries());
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);

  const [selectedCountry, setSelectedCountry] = useState('');
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');


  const handleCountryChange = (country) => {
  setSelectedCountry(country.name); // store ISO code in state
  setFormData({ ...formData, country: country.isoCode });
  setStates(State.getStatesOfCountry(country.isoCode));
};

  const handleStateChange = (state) => {
  setSelectedState(state.name);
  setFormData({ ...formData, state: state.isoCode}); // reset city
  const citiesList = City.getCitiesOfState(formData.country, state.isoCode);
  setCities(citiesList);
};

  

  const [formData, setFormData] = useState({
    entity_type:'', name: '', contact_number: '', email: '', building_no: '', city: '', state: '', country: '', pin_code: '', GST: '', SAC: '', client_type: '', document: null
  });
  const [poNumbers, setPoNumbers] = useState([
    { po_number: '', po_value:'', monthly_budget: '', hourly_rate: '', from_date: '', to_date: '', igst: 18, cgst: 9, sgst: 9, employees: [{ name: '', email: ''}] }
  ]);

  
  const getMonthsDifference = (from, to) => {
    const start = new Date(from);
    const end = new Date(to);

    const months =
      (end.getFullYear() - start.getFullYear()) * 12 +
      (end.getMonth() - start.getMonth()) +
      1; // +1 so Jan-Jan counts as 1 month

    return months > 0 ? months : 0;
  };

  // Update budget or dates and recalculate monthly_budget
  const handleBudgetOrDateChange = (poIndex, field, value) => {
    const updated = [...poNumbers];

    // Update the field
    updated[poIndex][field] = value;

    // Calculate monthly budget if budget and both dates are present
    const { po_value, from_date, to_date } = updated[poIndex];
    const totalBudget = field === "po_value" ? parseFloat(value) || 0 : parseFloat(po_value) || 0;
    const startDate = field === "from_date" ? value : from_date;
    const endDate = field === "to_date" ? value : to_date;

    if (totalBudget && startDate && endDate) {
      const months = getMonthsDifference(startDate, endDate);
      updated[poIndex].monthly_budget = months ? (totalBudget / months).toFixed(2) : 0;
    } else {
      updated[poIndex].monthly_budget = "";
    }

    setPoNumbers(updated);
  };

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
  if (formData.entity_type === "Tech Tammina LLC (India)" || formData.entity_type === "Tech Tammina LLC (USA)") {
    setFormData(prev => ({ ...prev, client_type: "foreign" }));
  }
}, [formData.entity_type]);

  const resetForm = () => {
    setFormData({entity_type:'', name: '', contact_number: '', building_no: '', city: '', state: '', country: '', pin_code: '', GST: '', SAC: '', email: '', client_type: '', document: null });
    setPoNumbers([{ po_number: '', po_value:'', monthly_budget: '', hourly_rate: '', igst: 18, cgst: 9, sgst: 9, employees: [{ name: '', email: '', doj: '', location: '' }] }]);
    setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const formDataToSend = new FormData();
    Object.keys(formData).forEach(key => {
      if (key !== 'document') formDataToSend.append(key, formData[key]);
    });
    if (formData.document) formDataToSend.append('document', formData.document);
    formDataToSend.append('po_numbers', JSON.stringify(poNumbers));

    try {
      const response = await fetch(`${API_URL}/companies`, { method: 'POST', body: formDataToSend });
      if (response.ok) {
        setSuccess(true);
        setFormData({entity_type:'', name: '', contact_number: '', building_no: '', city: '', state: '', country: '', pin_code: '', GST: '', SAC: '', email: '', client_type: '', document: null });
        setPoNumbers([{ po_number: '', po_value:'', monthly_budget: '', hourly_rate: '', igst: 18, cgst: 9, sgst: 9, employees: [{ name: '', email: '', doj: '', location: '' }] }]);
        setTimeout(() => setSuccess(false), 3000);
      } else alert('Error creating company');
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-5/6">
      {success && <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded">Company onboarded successfully!</div>}

      <div className="bg-white rounded-t-md  border mb-5">
        <div className="rounded-t-md border border-purple-500">
          <h3 className="text-l text-left mb-0 font-semibold p-2 pl-3 text-[#9b6cf3]">Client Information</h3>
        </div>
        <div className="grid grid-cols-3 gap-5 p-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Entity Name <span className='text-red-600'>*</span></label>
            <select value={formData.entity_type} onChange={e => setFormData({ ...formData, entity_type: e.target.value })} className="border p-2 rounded w-full">
              <option value="">Select Entity</option>
              <option value="Sree Tammina Software Solutions pvt.Ltd">Sree Tammina Software Solutions pvt.Ltd</option>
              <option value="Tech Tammina LLC (India)">Tech Tammina LLC (India)</option>
              <option value="Tech Tammina LLC (USA)">Tech Tammina LLC (USA)</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client Name <span className='text-red-600'>*</span></label>
            <input type="text" placeholder="Client Name" required value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })} className="border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline" />
          </div>  
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Contact Number</label>
            <input type="tel" placeholder="Contact Number" value={formData.contact_number}
              onChange={e => setFormData({ ...formData, contact_number: e.target.value })} className="border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Country <span className='text-red-600'>*</span></label>
            <select
              className="border p-2 rounded w-full"
              value={formData.country}
              required // store ISO code
              onChange={(e) => {
                const selectedCountry = countries.find(c => c.isoCode === e.target.value);
                if (selectedCountry) {
                  handleCountryChange(selectedCountry);
                }
              }}
            >
              <option value="">Select Country</option>
              {countries.map(c => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">State <span className='text-red-600'>*</span></label>
            <select className="border p-2 rounded w-full" value={formData.state}
              required
              onChange={(e) => {
                const selectedState = states.find(s => s.isoCode === e.target.value);
                if (selectedState) {
                  handleStateChange(selectedState);
              }
              }}>
                <option value="">Select State</option>
                {states.map(state => (
                  <option key={state.isoCode} value={state.isoCode}>
                    {state.name}
                  </option>
                ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">City <span className='text-red-600'>*</span></label>
            <select className="border p-2 rounded w-full" value={formData.city} // must match ISO code
              required
              onChange={e => setFormData({ ...formData, city: e.target.value })}
            >
              <option value="">Select City</option>
              {cities.map(city => (
                <option key={city.isoCode} value={city.isoCode}>{city.name}</option>
              ))}
            </select>

          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Building No/ Flat No </label>
            <input type="text" placeholder="Building No/ Flat No" value={formData.building_no}
              onChange={e => setFormData({ ...formData, building_no: e.target.value })} className="border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Pin Code <span className='text-red-600'>*</span></label>
            <input type="text" placeholder="Pin code" required value={formData.pin_code}
              onChange={e => setFormData({ ...formData, pin_code: e.target.value })} className="border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline" />
          </div>
          {formData.entity_type === 'Sree Tammina Software Solutions pvt.Ltd' ? (
              <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">GST Number <span className='text-red-600'>*</span></label>
                <input type="text" placeholder="GST Number" required value={formData.GST}
                  onChange={e => setFormData({ ...formData, GST: e.target.value })} className="border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SAC Number <span className='text-red-600'>*</span></label>
                <input type="text" placeholder="SAC Number" required value={formData.SAC}
                  onChange={e => setFormData({ ...formData, SAC: e.target.value })} className="border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline" />
              </div>
              </>
          ) : (
            null
          )}
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email <span className='text-red-600'>*</span></label>
            <input type="email" placeholder="Email" required value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })} className="border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline" />
          </div>
          {formData.entity_type === 'Sree Tammina Software Solutions pvt.Ltd' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client Type <span className='text-red-600'>*</span></label>
              <select value={formData.client_type} 
                onChange={e => setFormData({ ...formData, client_type: e.target.value })} 
                className="border p-2 rounded w-full">
                <option value="">Select Client Type</option>
                <option value="same_state">Same State (CGST+SGST)</option>
                <option value="other_state">Other State (IGST)</option>
              </select>
            </div>
          )}

          {(formData.entity_type === "Tech Tammina LLC (USA)" || formData.entity_type === "Tech Tammina LLC (India)") && (
            <input type="hidden" value="foreign" />
          )}
          <div className="col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">MSA (document)</label>
            <input type="file" onChange={e => setFormData({ ...formData, document: e.target.files[0] })} className="border p-2 rounded w-full" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded border">
        <div className="flex justify-between mb-3 rounded-t-md border border-purple-500">
          <div>
            <h3 className="text-l font-semibold mb-0 p-2 pl-3 text-[#9b6cf3]">PO Numbers</h3>
          </div>
          <button type="button" onClick={() => setPoNumbers([...poNumbers, { po_number: '', po_value:'', monthly_budget: '', hourly_rate: '', igst: 18, cgst: 9, sgst: 9, employees: [{ name: '', email: '', doj: '', location: '' }] }])}
            className="text-[#9b6cf3] border px-3 m-2 rounded text-sm flex items-center gap-1">
            <Plus className="h-4 w-4 text-[#9b6cf3]" />Add PO
          </button>
        </div>

        {poNumbers.map((po, poIndex) => (
          <div key={poIndex} className="border m-3 p-3 mb-3 rounded bg-white">
            <div className="flex justify-between mb-2">
              <span className="font-semibold text-[#2d73b9]">PO #{poIndex + 1}</span>
              {poNumbers.length > 1 && (
                <button type="button" onClick={() => setPoNumbers(poNumbers.filter((_, i) => i !== poIndex))} className="text-red-500">
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-5 gap-2 mb-2">
              <div className='flex flex-col'>
                <label className="block text-sm font-medium text-gray-700 mb-1">PO Number <span className='text-red-600'>*</span></label>
                <input type="text" placeholder="PO Number *" required value={po.po_number}
                  onChange={e => { const updated = [...poNumbers]; updated[poIndex].po_number = e.target.value; setPoNumbers(updated); }}
                  className="border p-2 rounded focus:outline-[#2d73b9] focus:outline" />
              </div>
              {formData.entity_type === 'Tech Tammina LLC (India)' || formData.entity_type === 'Tech Tammina LLC (USA)'? (
                <div className='flex flex-col'>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Hour Rate <span className='text-red-600'>*</span></label>
                    <input type="number" placeholder="Hour Rate $" required value={po.hourly_rate} step="0.01"
                      onChange={e => { const updated = [...poNumbers]; updated[poIndex].hourly_rate = e.target.value; setPoNumbers(updated); }}
                      className="border p-2 rounded focus:outline-[#2d73b9] focus:outline" />
                </div>
              ) : (
                <>
                  <div className='flex flex-col'>
                      <label className="block text-sm font-medium text-gray-700 mb-1">From <span className='text-red-600'>*</span></label>
                      <input type="date" placeholder='From' 
                      className="border p-2 rounded focus:outline-[#2d73b9] focus:outline"
                      required value={po.from_date}
                      onChange={e => handleBudgetOrDateChange(poIndex, 'from_date', e.target.value)}
                      ></input>
                  </div>
                  <div className='flex flex-col'>
                      <label className="block text-sm font-medium text-gray-700 mb-1">To <span className='text-red-600'>*</span></label>
                      <input type="date" placeholder='To' 
                      className="border p-2 rounded focus:outline-[#2d73b9] focus:outline"
                      required value={po.to_date}
                      onChange={e => handleBudgetOrDateChange(poIndex, 'to_date', e.target.value)}
                      ></input>
                  </div>
                  <div className='flex flex-col'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Po Value <span className='text-red-600'>*</span></label>
                    <input
                      type="text"
                      placeholder="Enter PO Value"
                      required
                      value={poNumbers[poIndex].po_value}
                      onChange={e => handleBudgetOrDateChange(poIndex, 'po_value', e.target.value)}
                      className="border p-2 rounded focus:outline-[#2d73b9] focus:outline"
                    />
                  </div>
                  <div className='flex flex-col'>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Budget<span className='text-red-600'>*</span></label>
                      <input type="number" placeholder="Monthly Budget ₹" required value={po.monthly_budget}
                        onChange={e => { const updated = [...poNumbers]; updated[poIndex].monthly_budget = e.target.value; setPoNumbers(updated); }}
                        className="border p-2 rounded focus:outline-[#2d73b9] focus:outline" />
                  </div>
                  {formData.client_type === 'other_state' ? (
                    <input type="number" placeholder="IGST %" value={po.igst} step="0.01"
                      onChange={e => { const updated = [...poNumbers]; updated[poIndex].igst = e.target.value; setPoNumbers(updated); }}
                      className="border p-2 rounded focus:outline-[#2d73b9] focus:outline" />
                  ) : null}
                </>
              )}
            </div>

            <div className="bg-white rounded space-y-3">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium text-[#9b6cf3]">Employees</span>
                <button type="button" onClick={() => {
                  const updated = [...poNumbers];
                  updated[poIndex].employees.push({ name: '', email: '', poc_name_tammina: '', poc_email_tammina: '', poc_name_client: '', poc_email_client: '' });
                  setPoNumbers(updated);
                }} className="text-blue-500 text-sm">+ Add Employee</button>
              </div>

              {po.employees.map((emp, empIndex) => (
                <div key={empIndex} className="mb-2 rounded-md border bg-white p-3">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-[#2d73b9]">Employee #{empIndex + 1}</span>
                    {po.employees.length > 1 && (
                      <button type="button" onClick={() => {
                        const updated = [...poNumbers];
                        updated[poIndex].employees = updated[poIndex].employees.filter((_, i) => i !== empIndex);
                        setPoNumbers(updated);
                      }} className="text-blue-600 px-2 py-1 rounded hover:bg-blue-50">
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    <div className='flex flex-col'>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee Name</label>
                    <input type="text" placeholder="Name *" required value={emp.name}
                      onChange={e => { const updated = [...poNumbers]; updated[poIndex].employees[empIndex].name = e.target.value; setPoNumbers(updated); }}
                      className="border p-2 rounded text-sm focus:outline-[#2d73b9] focus:outline" />
                    </div>
                    <div className='flex flex-col'>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Employee Email</label>
                        <input type="email" placeholder="Email" value={emp.email}
                          onChange={e => { const updated = [...poNumbers]; updated[poIndex].employees[empIndex].email = e.target.value; setPoNumbers(updated); }}
                          className="border p-2 rounded text-sm flex-1 focus:outline-[#2d73b9] focus:outline" />
                    </div>
                    <div className='flex flex-col'>
                      <label className="block text-sm font-medium text-gray-700 mb-1">POC Name (Tammina)</label>
                        <input type="text" placeholder="poc_name_tammina" value={emp.poc_name_tammina}
                          onChange={e => { const updated = [...poNumbers]; updated[poIndex].employees[empIndex].poc_name_tammina = e.target.value; setPoNumbers(updated); }}
                          className="border p-2 rounded text-sm flex-1 focus:outline-[#2d73b9] focus:outline" />
                    </div>
                    <div className='flex flex-col'>
                      <label className="block text-sm font-medium text-gray-700 mb-1">POC Email (Tammina)</label>
                        <input type="email" placeholder="poc_email_tammina" value={emp.poc_email_tammina}
                          onChange={e => { const updated = [...poNumbers]; updated[poIndex].employees[empIndex].poc_email_tammina = e.target.value; setPoNumbers(updated); }}
                          className="border p-2 rounded text-sm flex-1 focus:outline-[#2d73b9] focus:outline" />
                    </div>
                    <div className='flex flex-col'>
                      <label className="block text-sm font-medium text-gray-700 mb-1">POC Name (Client)</label>
                        <input type="text" placeholder="poc_name_client" value={emp.poc_name_client}
                          onChange={e => { const updated = [...poNumbers]; updated[poIndex].employees[empIndex].poc_name_client = e.target.value; setPoNumbers(updated); }}
                          className="border p-2 rounded text-sm flex-1 focus:outline-[#2d73b9] focus:outline" />
                    </div>
                    <div className='flex flex-col'>
                      <label className="block text-sm font-medium text-gray-700 mb-1">POC Email (Client)</label>
                        <input type="email" placeholder="poc_email_tammina" value={emp.poc_email_client}
                          onChange={e => { const updated = [...poNumbers]; updated[poIndex].employees[empIndex].poc_email_client = e.target.value; setPoNumbers(updated); }}
                          className="border p-2 rounded text-sm flex-1 focus:outline-[#2d73b9] focus:outline" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={resetForm}
          disabled={loading}
          className="px-4 py-2 mt-5 rounded font-semibold bg-red-500 text-white disabled:bg-gray-400"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 mt-5 rounded font-semibold bg-green-500 text-white disabled:bg-gray-400"
        >
          {loading ? 'Saving...' : 'Save'}
        </button>
      </div>
      {success && (
        <div className="mt-3 bg-green-50 border border-green-200 text-green-700 px-4 py-2 rounded">
          Client onboarded successfully!
        </div>
      )}
    </form>
  );
}

function InvoiceGeneration({ companies }) {
  const [selectedEntity, setSelectedEntity] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [selectedPO, setSelectedPO] = useState('');
  const [clients, setClients] = useState([]);       
  const [poNumbers, setPoNumbers] = useState([]);
  const [month, setMonth] = useState('');
  const [year, setYear] = useState(new Date().getFullYear());
  const [timesheets, setTimesheets] = useState([]);
  const [invoiceResult, setInvoiceResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState([]);

  // ---------------------------
  // SELECT ENTITY
  // ---------------------------
  const handleEntityChange = (e) => {
    const entityType = e.target.value;
    setSelectedEntity(entityType);
    setSelectedCompany('');
    setSelectedPO('');
    setEmployees([]);
    setPoNumbers([]);
    setClients([]);

    if (entityType) {
      const filtered = companies.filter(c => c.entity_type === entityType);
      setClients(filtered);
    }
  };

  // ---------------------------
  // SELECT CLIENT
  // ---------------------------
  const handleClientChange = (e) => {
    const companyId = e.target.value;
    setSelectedCompany(companyId);
    setSelectedPO('');
    setEmployees([]);
    setTimesheets([]);

    if (companyId) {
      fetch(`${API_URL}/companies/${companyId}/po-numbers`)
        .then(r => r.json())
        .then(setPoNumbers);
    }
  };

  
  // ---------------------------
  // LOAD EMPLOYEES AFTER SELECTING PO
  // ---------------------------
  useEffect(() => {
    if (!selectedPO) {
      setEmployees([]);
      return;
    }

    fetch(`${API_URL}/po-numbers/${selectedPO}/employees`)
      .then(r => r.json())
      .then(list => setEmployees(Array.isArray(list) ? list : []))
      .catch(() => setEmployees([]));
  }, [selectedPO]);

  // ---------------------------
  // GENERATE INVOICE
  // ---------------------------
  const generateInvoice = async () => {
    if (!selectedEntity || !selectedCompany || !selectedPO || !month || timesheets.length === 0) {
      alert('Please fill all fields and upload timesheets');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('entity_type', selectedEntity);
    formData.append('company_id', selectedCompany);
    formData.append('po_id', selectedPO);
    formData.append('month', month);
    formData.append('year', year);
    timesheets.forEach(ts => formData.append('files', ts.file));

    try {
      const response = await fetch(`${API_URL}/invoices/generate`, { method: 'POST', body: formData });
      if (response.ok) {
        const data = await response.json();
        setInvoiceResult(data);
        setTimesheets([]);
      } else {
        alert('Error generating invoice');
      }
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-5/6">
      <div className="bg-white rounded-t-md border mb-5">
        <div className="rounded-t-md border border-purple-500">
          <h3 className="text-l font-semibold mb-0 p-2 pl-3 text-[#9b6cf3]">Invoice Details</h3>
        </div>

        <div className="grid grid-cols-2 gap-3 p-4">

          {/* Select Entity */}
          <select value={selectedEntity} onChange={handleEntityChange} className="border p-2 rounded">
            <option value="">Select Entity *</option>
            {[...new Set(companies.map(c => c.entity_type))].map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>

          {/* Select Client Based On Entity */}
          <select value={selectedCompany} onChange={handleClientChange} className="border p-2 rounded" disabled={!selectedEntity}>
            <option value="">Select Client *</option>
            {clients.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <select value={selectedPO} onChange={e => setSelectedPO(e.target.value)} className="border p-2 rounded" disabled={!selectedCompany}>
            <option value="">Select PO Number *</option>
            {poNumbers.map(po => (
              <option key={po.id} value={po.id}>{po.po_number}</option>
            ))}
          </select>
          <select value={month} onChange={e => setMonth(e.target.value)} className="border p-2 rounded">
            <option value="">Select Month *</option>
            {['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].map(m => (
              <option key={m} value={m}>{new Date(2024, parseInt(m) - 1).toLocaleString('default', { month: 'long' })}</option>
            ))}
          </select>
          <input type="number" value={year} onChange={e => setYear(e.target.value)} className="border p-2 rounded" placeholder="Year" />
        </div>
      </div>

      <div className="bg-white p-4 rounded border">
        <h2 className="text-xl font-semibold mb-3">Upload Timesheets</h2>
        {selectedPO && employees.length > 0 ? (
          <div className="space-y-3">
            {employees.map(emp => {
              const uploaded = timesheets.find(t => t.employeeId === emp.id);
              return (
                <div key={emp.id} className="flex items-center justify-between rounded border-2 border-blue-300 p-3">
                  <div className="text-sm">
                    <div className="font-medium text-blue-700">{emp.name}</div>
                    {emp.email && <div className="text-blue-600">{emp.email}</div>}
                    {uploaded && (
                      <div className="mt-1 inline-flex items-center gap-2">
                        <span className="text-xs bg-blue-50 text-blue-700 border border-blue-300 rounded-full px-2 py-0.5">Uploaded</span>
                        <span className="text-xs text-blue-700">{uploaded.name}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="cursor-pointer">
                      <span className="bg-blue-500 text-white px-3 py-1 rounded inline-block">{uploaded ? 'Replace File' : 'Choose File'}</span>
                      <input type="file" accept=".xlsx,.xls" onChange={e => {
                        const file = e.target.files && e.target.files[0];
                        if (!file) return;
                        setTimesheets(prev => {
                          const others = prev.filter(p => p.employeeId !== emp.id);
                          return [...others, { employeeId: emp.id, name: file.name, file }];
                        });
                        e.target.value = '';
                      }} className="hidden" />
                    </label>
                    {uploaded && (
                      <button type="button" onClick={() => setTimesheets(prev => prev.filter(p => p.employeeId !== emp.id))} className="text-blue-600 hover:bg-blue-50 rounded px-2 py-1">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-blue-700 bg-blue-50 rounded p-4 text-sm">Select a client and PO to load onboarded employees.</div>
        )}

        <button onClick={generateInvoice} disabled={loading} className="w-full mt-3 bg-blue-500 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-400">
          {loading ? <><Loader2 className="h-4 w-4 animate-spin inline mr-2" />Generating...</> : 'Generate Invoice'}
        </button>
      </div>

      {invoiceResult && (
        <div className="bg-white p-4 rounded border">
          <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-2 rounded mb-3">
            Invoice Generated! #{invoiceResult.invoice_number}
          </div>
          <div className="mb-3">
            <a href={`${API_URL}/invoices/${invoiceResult.invoice_id}/download-docx`} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 text-white px-3 py-2 rounded">
              Download DOCX
            </a>
          </div>
        </div>
      )}
    </div>
  );
}

function InvoiceHistory() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState({}); // { [id]: paid_amount }
  const [query, setQuery] = useState('');
  const [filters, setFilters] = useState({
    company_name: '',
    po_number: '',
    month: '',
    year: '',
    entity_type: ''
  });

  useEffect(() => {
    fetch(`${API_URL}/invoices`).then(r => r.json()).then(setInvoices).catch(console.error).finally(() => setLoading(false));
  }, []);

  const startEdit = (inv) => {
    setEditing(prev => ({ ...prev, [inv.id]: inv.paid_amount ?? 0 }));
  };

  const cancelEdit = (id) => {
    setEditing(prev => {
      const copy = { ...prev };
      delete copy[id];
      return copy;
    });
  };

  const savePaid = async (id) => {
    const value = editing[id];
    try {
      const res = await fetch(`${API_URL}/invoices/${id}/payment`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paid_amount: value })
      });
      if (!res.ok) {
        const e = await res.json().catch(() => ({}));
        throw new Error(e.error || 'Failed to update payment');
      }
      const updated = await res.json();
      setInvoices(prev => prev.map(inv => inv.id === id ? {
        ...inv,
        paid_amount: updated.paid_amount,
        due_amount: updated.due_amount
      } : inv));
      cancelEdit(id);
    } catch (e) {
      alert(e.message);
    }
  };

  if (loading) return <div className="text-center p-8"><Loader2 className="h-8 w-8 animate-spin mx-auto" /></div>;

  // Get unique values for dropdowns
  const unique = (arr) => Array.from(new Set(arr.filter(Boolean))).sort();
  const companyNames = unique(invoices.filter(i => !filters.entity_type || i.entity_type === filters.entity_type).map(i => i.company_name));
  const poNumbers = unique(invoices.map(i => i.po_number));
  const months = unique(invoices.map(i => new Date(2024, parseInt(i.month) - 1).toLocaleString('default', { month: 'short' })));
  const years = unique(invoices.map(i => String(i.year)));
  const EntityTypes = unique(invoices.map(i => i.entity_type));


  // Build filtered list once for totals and table rendering
  const filteredInvoices = invoices
    .filter(inv => {
      if (!query) return true;
      const q = query.toLowerCase();
      return inv.invoice_number?.toLowerCase().includes(q) || inv.company_name?.toLowerCase().includes(q);
    })
    .filter(inv => {
      const mLabel = new Date(2024, parseInt(inv.month) - 1).toLocaleString('default', { month: 'short' });
      const f = filters;
      const matchesCompany = !f.company_name || f.company_name === inv.company_name;
      const matchesPO = !f.po_number || f.po_number === inv.po_number;
      const matchesMonth = !f.month || f.month === mLabel;
      const matchesYear = !f.year || f.year === String(inv.year || '');
      const matchesEntityType =
    !f.entity_type || f.entity_type === inv.entity_type;   // ✅ FIXED

  return (
    matchesCompany && matchesPO && matchesMonth && matchesYear && matchesEntityType);
    });

  const grandTotal = filteredInvoices.reduce((sum, inv) => {
    const due = inv.due_amount != null
      ? Number(inv.due_amount)
      : Math.max(Number(inv.total_amount_in_inr ?? 0) - Number(inv.paid_amount ?? 0), 0);
    return sum + due;
  }, 0);

  return (
    <div className="bg-white p-4 rounded border w-5/6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-[#9b6cf3]">Invoice History</h2>
        <input
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="border border-blue-300 rounded px-3 py-1.5 text-sm w-64"
          placeholder="Search by invoice # or client name"
        />
      </div>
      <div className="flex items-center justify-end mb-3">
        <div className="px-3 py-1.5 rounded bg-blue-50 border border-blue-200 text-blue-700 text-sm">
          Grand Total Due (filtered): <span className="font-semibold">₹{grandTotal.toFixed(2)}</span>
        </div>
      </div>
      {invoices.length === 0 ? (
        <p className="text-blue-600 text-center py-8">No invoices yet</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border border-blue-200">
          <table className="min-w-full text-sm">
            <thead className="bg-blue-100 sticky top-0 z-10">
              <tr>
                <th className="px-4 py-2 text-left">Invoice #</th>
                <th className="px-4 py-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span>Client name</span>
                    <select
                      value={filters.company_name}
                      onChange={e => setFilters(prev => ({ ...prev, company_name: e.target.value }))}
                      className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">All</option>
                      {companyNames.map(name => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span>Entity type</span>
                    <select
                        value={filters.entity_type}
                        onChange={e => setFilters(prev => ({ ...prev, entity_type: e.target.value }))}
                        className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                      >
                        <option value="">All</option>
                        {EntityTypes.map(type => (
                          <option key={type} value={type}>
                            {type.replace('_', ' ')}
                          </option>
                        ))}
                  </select>

                  </div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span>PO Number</span>
                    <select
                      value={filters.po_number}
                      onChange={e => setFilters(prev => ({ ...prev, po_number: e.target.value }))}
                      className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">All</option>
                      {poNumbers.map(po => (
                        <option key={po} value={po}>{po}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span>Month</span>
                    <select
                      value={filters.month}
                      onChange={e => setFilters(prev => ({ ...prev, month: e.target.value }))}
                      className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">All</option>
                      {months.map(month => (
                        <option key={month} value={month}>{month}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 text-left">
                  <div className="flex flex-col gap-1">
                    <span>Year</span>
                    <select
                      value={filters.year}
                      onChange={e => setFilters(prev => ({ ...prev, year: e.target.value }))}
                      className="text-xs border border-blue-300 rounded px-2 py-1 bg-white"
                    >
                      <option value="">All</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                  </div>
                </th>
                <th className="px-4 py-2 text-left">Invoice total (₹)</th>
                <th className="px-4 py-2 text-left">Invoice date</th>
                <th className="px-4 py-2 text-left">Paid amount</th>
                <th className="px-4 py-2 text-left">Due amount</th>
              </tr>
            </thead>
            <tbody className="[&>tr:nth-child(even)]:bg-blue-50/40">
              {filteredInvoices
                .map(inv => (
                  <tr key={inv.id} className="border-b hover:bg-blue-50">
                    <td className="px-4 py-2 font-medium text-blue-600">{inv.invoice_number}</td>
                    <td className="px-4 py-2">{inv.company_name}</td>
                    <td className="px-4 py-2">{inv.entity_type?.replace('_', ' ')}</td>
                    <td className="px-4 py-2">{inv.po_number}</td>
                    <td className="px-4 py-2">{new Date(2024, parseInt(inv.month) - 1).toLocaleString('default', { month: 'short' })}</td>
                    <td className="px-4 py-2">{inv.year}</td>
                    <td className="px-4 py-2 font-semibold text-blue-700">₹{Number(inv.total_amount_in_inr).toFixed(2)}</td>
                    <td className="px-4 py-2 text-blue-600">{new Date(inv.created_at).toLocaleDateString()}</td>
                    <td className="px-4 py-2">
                      {editing[inv.id] !== undefined ? (
                        <div className="flex items-center gap-2">
                          <input
                            type="number"
                            step="0.01"
                            className="border border-blue-300 p-1 rounded w-28"
                            value={editing[inv.id]}
                            onChange={e => setEditing(prev => ({ ...prev, [inv.id]: e.target.value }))}
                          />
                          <button onClick={() => savePaid(inv.id)} className="text-green-700 px-2 py-1 rounded bg-green-100 border border-red-200">Save</button>
                          <button onClick={() => cancelEdit(inv.id)} className="text-blue-700 px-2 py-1 rounded bg-blue-100 border border-blue-200">Cancel</button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <span className="inline-block min-w-[90px] text-right">
                            ₹{Number(inv.paid_amount ?? 0).toFixed(2)}
                          </span>
                          <button
                            onClick={() => startEdit(inv)}
                            className="text-blue-700 px-2 py-1 rounded bg-blue-100 border border-blue-200"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 font-semibold">₹{Number(inv.due_amount ?? Math.max((inv.total_amount_in_inr ?? 0) - (inv.paid_amount ?? 0), 0)).toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CompaniesCards({ companies, setCompanies, companyQuery, companyFilters, handleDeleteCompany }) {
  const filtered = companies
    .filter(c => {
      if (!companyQuery) return true;
      const q = companyQuery.toLowerCase();
      return c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q);
    })
    .filter(c => {
      const f = companyFilters;
      const asLabel = (c.is_active ? 'Active' : 'Not Active');
      const matchesName = !f.name.length || f.name.includes(c.name || '');
      const matchesEmail = !f.email.length || f.email.includes(c.email || '');
      const matchesContact = !f.contact_number.length || f.contact_number.includes(c.contact_number || '');
      const matchesType = !f.client_type.length || f.client_type.includes((c.client_type || '').replace('_', ' '));
      const matchesStatus = !f.status.length || f.status.includes(asLabel);
      const poCountLabel = String(c.po_count ?? (c.po_numbers?.length || 0));
      const matchesPOCount = !f.po_count.length || f.po_count.includes(poCountLabel);
      return matchesName && matchesEmail && matchesContact && matchesType && matchesStatus && matchesPOCount;
    });

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {filtered.map(company => (
        <div key={company.id} className="rounded-lg border border-blue-200 bg-white p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-lg font-semibold text-blue-700">{company.name}</div>
              <div className="mt-1 inline-flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  {(company.client_type || '').replace('_', ' ')}
                </span>
                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                  {company.is_active ? 'Active' : 'Not Active'}
                </span>
              </div>
            </div>
            <button
              onClick={() => handleDeleteCompany(company.id, company.name)}
              className="text-blue-600 hover:text-blue-700 p-2 rounded hover:bg-blue-50 transition-colors"
              title="Delete company"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
          <div className="mt-3 text-sm text-blue-700">
            <div className="truncate">{company.email}</div>
            <div className="truncate">{company.contact_number}</div>
          </div>
          <div className="mt-3 flex items-center justify-between text-sm">
            <div className="text-blue-700">POs: <span className="font-semibold">{company.po_count ?? (company.po_numbers?.length || 0)}</span></div>
            <button
              onClick={async () => {
                try {
                  const res = await fetch(`${API_URL}/companies/${company.id}/status`, {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ is_active: !company.is_active })
                  });
                  if (!res.ok) {
                    const e = await res.json().catch(() => ({}));
                    throw new Error(e.error || 'Failed to update status');
                  }
                  const updated = await res.json();
                  setCompanies(prev => prev.map(c => c.id === company.id ? { ...c, is_active: updated.is_active } : c));
                } catch (e) {
                  alert(e.message);
                }
              }}
              className={`${company.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'} px-3 py-1 rounded text-xs font-semibold`}
            >
              {company.is_active ? 'Active' : 'Not Active'}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function CompanyFiltersPanel({ companies, filters, setFilters, onClose }) {
  const unique = (arr) => Array.from(new Set(arr.filter(Boolean)));
  const names = unique(companies.map(c => c.name));
  const emails = unique(companies.map(c => c.email));
  const contacts = unique(companies.map(c => c.contact_number));
  const types = unique(companies.map(c => (c.client_type || '').replace('_', ' ')));
  const statuses = ['Active', 'Not Active'];
  const poCounts = unique(companies.map(c => String(c.po_count ?? (c.po_numbers?.length || 0))));

  const toggle = (key, val) => {
    setFilters(prev => {
      const cur = new Set(prev[key] || []);
      if (cur.has(val)) cur.delete(val); else cur.add(val);
      return { ...prev, [key]: Array.from(cur) };
    });
  };

  const reset = () => setFilters({ name: [], email: [], contact_number: [], client_type: [], status: [], po_count: [] });

  return (
    <div className="absolute right-0 mt-2 w-[680px] max-w-[90vw] rounded-lg border border-blue-200 bg-white shadow-lg z-20">
      <div className="flex items-center justify-between p-3 border-b border-blue-100">
        <div className="font-semibold text-blue-700">Filters</div>
        <div className="flex items-center gap-2">
          <button onClick={reset} className="text-blue-700 text-sm px-2 py-1 rounded bg-blue-50 border border-blue-200">Reset</button>
          <button onClick={onClose} className="text-blue-700 text-sm px-2 py-1 rounded bg-blue-50 border border-blue-200">Close</button>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-4 p-3 max-h-80 overflow-auto">
        <FilterGroup title="Name" values={names} selected={filters.name} onToggle={v => toggle('name', v)} />
        <FilterGroup title="Email" values={emails} selected={filters.email} onToggle={v => toggle('email', v)} />
        <FilterGroup title="Contact" values={contacts} selected={filters.contact_number} onToggle={v => toggle('contact_number', v)} />
        <FilterGroup title="Type" values={types} selected={filters.client_type} onToggle={v => toggle('client_type', v)} />
        <FilterGroup title="Status" values={statuses} selected={filters.status} onToggle={v => toggle('status', v)} />
        <FilterGroup title="PO Count" values={poCounts} selected={filters.po_count} onToggle={v => toggle('po_count', v)} />
      </div>
    </div>
  );
}

function FilterGroup({ title, values, selected, onToggle }) {
  return (
    <div>
      <div className="text-sm font-semibold text-blue-700 mb-2">{title}</div>
      <div className="flex flex-col gap-1 max-h-40 overflow-auto pr-1">
        {values.length === 0 ? (
          <div className="text-xs text-blue-600">No options</div>
        ) : values.map(v => (
          <label key={v} className="inline-flex items-center gap-2 text-sm text-blue-700">
            <input type="checkbox" checked={selected?.includes(v)} onChange={() => onToggle(v)} />
            <span className="truncate max-w-[260px]" title={v}>{v}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

function CreateUser(){
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    employee_id: '',
    designation: '',
    role: '',
  });

  const [errors, setErrors] = useState({});
  const [isCodeSent, setIsCodeSent] = useState(false);
  const handleCreateUser = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      const response = await fetch(`${API_URL}/admin/create-user`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to create user");
      }

      alert("✅ Employee created successfully!");

      // reset form
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
        employee_id: "",
        designation: "",
        role: "Admin",
      });

      setErrors({});
      setIsCodeSent(false);

    } catch (error) {
      alert(`❌ ${error.message}`);
      console.error("Error:", error);
    }
  };
  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim())
      newErrors.first_name = "First name is required";

    if (!formData.last_name.trim())
      newErrors.last_name = "Last name is required";

    if (!formData.employee_id.trim())
      newErrors.employee_id = "Employee ID is required";

    if (!formData.designation.trim())
      newErrors.designation = "Designation is required";

    if (!formData.email.trim())
      newErrors.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Enter valid email";

    setErrors(newErrors);

    // return true if no errors
    return Object.keys(newErrors).length === 0;
  };
  const resetForm = () => {
    setFormData({first_name: '',
    last_name: '',
    email: '',
    employee_id: '',
    designation: '',
    role: '',});
  };
    return (
    <>
          <div className='bg-white rounded-t-md  border mb-5 w-5/6'>
            <div className='rounded-t-md border border-purple-500'>
              <h2 className="text-l text-left mb-0 font-semibold p-2 pl-3 text-[#9b6cf3]">Create Employee User</h2>
            </div>
            <div className='p-3 '>
               <form noValidate className='grid grid-cols-2 gap-5'>
                <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>First Name</label>
                <input
                  type="text"
                  className='border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline"'
                  placeholder="Enter First name"
                  value={formData.first_name}
                  onChange={(e) =>
                    setFormData({ ...formData, first_name: e.target.value })
                  }
                />
                {errors.first_name && <p className="error-text">{errors.first_name}</p>}
                </div>
                
                  <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Last Name</label>
                <input
                  type="text"
                  className='border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline'
                  placeholder="Enter Last name"
                  value={formData.last_name}
                  onChange={(e) =>
                    setFormData({ ...formData, last_name: e.target.value })
                  }
                />
                {errors.last_name && <p className="error-text">{errors.last_name}</p>}
                  </div>
                
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Email</label>
                <input
                  type="email"
                  className='border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline'
                  placeholder="Enter email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  disabled={isCodeSent}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}
                  </div>
                
                  <div>
                    <label className='block text-sm font-medium text-gray-700 mb-1'>Employee ID</label>
                <input
                  type="text"
                  className='border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline'
                  placeholder="Enter Employee ID"
                  value={formData.employee_id}
                  onChange={(e) =>
                    setFormData({ ...formData, employee_id: e.target.value })
                  }
                />
                {errors.employee_id && <p className="error-text">{errors.employee_id}</p>}
                  </div>
           
                  <div>
                  <label className='block text-sm font-medium text-gray-700 mb-1'>Designation</label>
                <input
                  type="text"
                  className='border p-2 rounded w-full focus:outline-[#2d73b9] focus:outline'
                  placeholder="Enter Designation"
                  value={formData.designation}
                  onChange={(e) =>
                    setFormData({ ...formData, designation: e.target.value })
                  }
                />
                {errors.designation && <p className="error-text">{errors.designation}</p>}
                  </div>
                  
                <div className='bg-white-600 border-solid mb-4'>
                  <label>Select Role</label>
                    <select className="block w-full p-2.5 bg-neutral-secondary-medium border border-default-medium text-heading text-sm rounded-base focus:ring-brand focus:border-brand px-3 py-2.5 shadow-xs text-fg-disabled" id="role"
                      value={formData.role}
                      onChange={(e) =>
                        setFormData({ ...formData, role: e.target.value })
                      }>
                      <option value="">-- Select Role -- </option>
                      <option value="Admin">Admin</option>
                      <option value="Acount Executive">Acount Executive</option>
                      <option value="Acount Manager">Acount Manager</option>
                    </select>
                </div>
              </form>
              <div class="flex justify-center">
                <button
                  className="w-half mt-3 bg-red-500 text-white mr-5 px-4 py-2 rounded font-semibold disabled:bg-gray-400"
                  onClick={resetForm}
                >
                    Cancel
                </button>
                <button
                  className="w-half mt-3 bg-blue-500 text-white px-4 py-2 rounded font-semibold disabled:bg-gray-400"
                  onClick={handleCreateUser}
                >
                  Create User
                </button>
                  
                </div>
            </div>
          </div>
          </>
  )
}