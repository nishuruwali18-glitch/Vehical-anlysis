import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Heart, Bike, Car, Truck, Zap, Flame, Sparkles, AlertCircle, Info, Star } from 'lucide-react';
import { Vehicle, VehicleType, FuelType } from '../types';
import { INDIAN_VEHICLES } from '../data/vehicles';

interface VehicleSelectorProps {
  currentScreen: number;
  selectedType: VehicleType | null;
  selectedFuel: FuelType | null;
  selectedNewVehicle: Vehicle | null;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  onSelectType: (type: VehicleType) => void;
  onSelectFuel: (fuel: FuelType) => void;
  onSelectVehicle: (vehicle: Vehicle) => void;
  onBack: () => void;
}

export default function VehicleSelector({
  currentScreen,
  selectedType,
  selectedFuel,
  selectedNewVehicle,
  favorites,
  toggleFavorite,
  onSelectType,
  onSelectFuel,
  onSelectVehicle,
  onBack,
}: VehicleSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

  // Filter lists of vehicles
  const filteredVehicles = INDIAN_VEHICLES.filter((v) => {
    // Match type
    if (selectedType && v.type !== selectedType) return false;
    
    // Match fuel (only if on Screen 3. For EV vs ICE calculations, we let user pre-select on Screen 2 but also change)
    if (selectedFuel && v.fuelType !== selectedFuel) return false;

    // Search query
    const modelMatch = v.model.toLowerCase().includes(searchQuery.toLowerCase());
    const brandMatch = v.brand.toLowerCase().includes(searchQuery.toLowerCase());
    const variantMatch = v.variant.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = modelMatch || brandMatch || variantMatch;
    if (!matchesSearch) return false;

    // Category filter
    if (selectedCategory !== 'All' && v.category !== selectedCategory) return false;

    // Favorites only filter
    if (showOnlyFavorites && !favorites.includes(v.id)) return false;

    return true;
  });

  // Group vehicles by Brand
  const brands = Array.from(new Set(filteredVehicles.map((v) => v.brand))).sort();

  // Screen 1: Choose Vehicle Type
  if (currentScreen === 1) {
    const types: { id: VehicleType; label: string; icon: any; desc: string }[] = [
      { id: '2 Wheeler', label: '2 Wheeler', icon: Bike, desc: 'Scooters, Commuters & Premium Motorcycles' },
      { id: '4 Wheeler', label: '4 Wheeler', icon: Car, desc: 'Hatchbacks, Sedans, SUVs & Luxury Cruisers' },
      { id: '3 Wheeler', label: '3 Wheeler', icon: Car, desc: 'Passenger Autos & Cargo Delivery Rickshaws' },
      { id: 'Commercial Vehicle', label: 'Commercial Cargo', icon: Truck, desc: 'Mini-Trucks, Pickups & Transport Vans' },
    ];

    return (
      <div className="flex flex-col gap-5">
        <div className="text-center mb-2">
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">Choose Vehicle Category</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">Select the class of automobile you wish to evaluate true ownership for.</p>
        </div>

        <div className="grid grid-cols-1 gap-3.5">
          {types.map((type, idx) => {
            const Icon = type.icon;
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => onSelectType(type.id)}
                className="flex items-center gap-4 p-4 rounded-2xl border text-left transition-all bg-white/40 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-white/5 hover:border-emerald-500/50 dark:hover:border-emerald-500/50 hover:bg-emerald-500/5 dark:hover:bg-emerald-500/10 group shadow-sm"
              >
                <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-zinc-805 text-slate-700 dark:text-zinc-300 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 transition-colors">
                  <Icon size={24} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-slate-800 dark:text-white group-hover:text-emerald-500 transition-colors">
                    {type.label}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-zinc-400 mt-0.5 line-clamp-1">{type.desc}</p>
                </div>
                <div className="text-zinc-400 group-hover:text-emerald-500 translate-x-0 group-hover:translate-x-1 transition-all">
                  <svg size={20} className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>
    );
  }

  // Screen 2: Choose Fuel Type
  if (currentScreen === 2) {
    const fuels: { id: FuelType; label: string; icon: any; colorText: string; colorBg: string; desc: string }[] = [
      { id: 'Petrol', label: 'Petrol', icon: Flame, colorText: 'text-amber-500', colorBg: 'bg-amber-500/10', desc: 'Standard internal combustion engines' },
      { id: 'Diesel', label: 'Diesel', icon: Flame, colorText: 'text-orange-600', colorBg: 'bg-orange-600/10', desc: 'Torquey, highly durable for high highway KMs' },
      { id: 'CNG', label: 'CNG', icon: Flame, colorText: 'text-teal-500', colorBg: 'bg-teal-500/10', desc: 'Extremely budget-friendly running costs' },
      { id: 'EV', label: 'Electric (EV)', icon: Zap, colorText: 'text-cyan-500', colorBg: 'bg-cyan-500/10', desc: 'Zero emissions, near-silent high-efficiency tech' },
      { id: 'Hybrid', label: 'Strong Hybrid', icon: Sparkles, colorText: 'text-emerald-500', colorBg: 'bg-emerald-500/10', desc: 'Self-charging gas + battery dual efficiency' },
      { id: 'Flex Fuel', label: 'Flex Fuel', icon: Sparkles, colorText: 'text-purple-500', colorBg: 'bg-purple-500/10', desc: 'Ethanol blend friendly configuration' },
    ];

    // Filter fuels relevant to selected type
    const availableFuelsForType = Array.from(new Set(INDIAN_VEHICLES.filter(v => v.type === selectedType).map(v => v.fuelType)));

    return (
      <div className="flex flex-col gap-4">
        <div className="text-center mb-1">
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500">{selectedType}</span>
          <h2 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white mt-1">Select Fuel Drive System</h2>
          <p className="text-xs text-slate-600 dark:text-zinc-400 mt-1">This configures energy rate benchmarks and battery longevity rules.</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {fuels.map((fuel) => {
            const Icon = fuel.icon;
            const isAvailable = availableFuelsForType.includes(fuel.id);
            
            return (
              <motion.button
                key={fuel.id}
                disabled={!isAvailable}
                whileHover={isAvailable ? { scale: 1.02 } : {}}
                whileTap={isAvailable ? { scale: 0.98 } : {}}
                onClick={() => onSelectFuel(fuel.id)}
                className={`p-4 rounded-2xl border text-left flex flex-col justify-between h-28 relative overflow-hidden transition-all ${
                  isAvailable 
                    ? 'bg-white/40 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-white/5 hover:border-emerald-500/40 dark:hover:border-emerald-500/40 hover:bg-emerald-500/5' 
                    : 'opacity-40 cursor-not-allowed bg-slate-100/50 dark:bg-zinc-900/10 border-slate-200 dark:border-zinc-800'
                }`}
              >
                <div className="flex items-center justify-between w-full">
                  <div className={`p-2 rounded-lg ${fuel.colorBg} ${fuel.colorText}`}>
                    <Icon size={16} />
                  </div>
                  {!isAvailable && (
                    <span className="text-[9px] font-bold bg-slate-200 dark:bg-zinc-800 text-slate-500 px-1.5 py-0.5 rounded">
                      N/A
                    </span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-xs text-slate-800 dark:text-white leading-none">
                    {fuel.label}
                  </h3>
                  <span className="text-[9px] text-zinc-500 dark:text-zinc-400 font-medium leading-none block mt-1">
                    {fuel.desc}
                  </span>
                </div>
              </motion.button>
            );
          })}
        </div>

        <button 
          onClick={onBack}
          className="mt-2 text-center text-xs font-semibold text-slate-600 dark:text-zinc-400 hover:text-emerald-500 transition-colors py-2"
        >
          ← Change Vehicle Type
        </button>
      </div>
    );
  }

  // Screen 3: List & Filter Matching Indian Vehicles
  // Group categories
  const categories = ['All', 'Budget', 'Executive', 'Premium', 'Luxury', 'Utility'];

  const formatPrice = (price: number) => {
    if (price >= 10000000) return `₹${(price / 10000000).toFixed(2)} Cr`;
    if (price >= 100000) return `₹${(price / 100000).toFixed(1)} Lakh`;
    return `₹${price.toLocaleString('en-IN')}`;
  };

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Header Info */}
      <div className="flex items-center justify-between border-b border-zinc-200/30 dark:border-white/5 pb-3">
        <div>
          <span className="text-[9px] font-bold bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-500 px-2 py-0.5 rounded-md">
            {selectedType} • {selectedFuel}
          </span>
          <h2 className="text-base font-bold text-slate-800 dark:text-white mt-1">Select Comparative Vehicle</h2>
        </div>
        <button
          onClick={onBack}
          className="text-xs font-medium text-emerald-500 hover:underline"
        >
          Back
        </button>
      </div>

      {/* Real-time Search and Filter Panel */}
      <div className="space-y-2">
        <div className="relative">
          <Search size={14} className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-slate-500 dark:text-zinc-400" />
          <input
            type="text"
            placeholder="Search make or model (e.g. Maruti, Nexon)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-xl text-xs bg-white/40 dark:bg-zinc-950/20 border-zinc-200/50 dark:border-white/5 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-emerald-500/40"
          />
        </div>

        {/* Filter Badges Row */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1.5 scrollbar-none no-scrollbar">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-[10px] px-2.5 py-1 rounded-full font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-emerald-500 text-white'
                  : 'bg-slate-200/50 dark:bg-zinc-900/40 text-slate-600 dark:text-zinc-400 border border-zinc-200/30 dark:border-white/5'
              }`}
            >
              {cat}
            </button>
          ))}
          
          <button
            onClick={() => setShowOnlyFavorites(!showOnlyFavorites)}
            className={`text-[10px] px-2.5 py-1 rounded-full font-bold flex items-center gap-1 transition-all whitespace-nowrap border ${
              showOnlyFavorites
                ? 'bg-rose-500 text-white border-rose-600/30'
                : 'bg-slate-200/50 dark:bg-zinc-900/40 text-rose-500 dark:text-rose-400 border-zinc-200/30 dark:border-white/5'
            }`}
          >
            <Heart size={10} fill={showOnlyFavorites ? 'currentColor' : 'none'} />
            Favs ({favorites.filter(fid => INDIAN_VEHICLES.some(v => v.id === fid && v.type === selectedType && v.fuelType === selectedFuel)).length})
          </button>
        </div>
      </div>

      {/* Scrollable Vehicle Grid Grouped by Brand */}
      <div className="flex-1 overflow-y-auto pr-0.5 space-y-4 max-h-[460px]">
        {filteredVehicles.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-slate-100/50 dark:bg-zinc-900/20 border border-dashed border-zinc-200/50 dark:border-white/5">
            <AlertCircle size={32} className="mx-auto text-slate-500 dark:text-zinc-500" />
            <p className="text-xs font-semibold text-slate-800 dark:text-zinc-300 mt-2">No Indian vehicles match search rules</p>
            <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-1">Try resetting category tags or typing alternative letters.</p>
          </div>
        ) : (
          brands.map((brandName) => {
            const brandVehicles = filteredVehicles.filter((v) => v.brand === brandName);
            if (brandVehicles.length === 0) return null;

            return (
              <div key={brandName} className="space-y-2">
                <span className="text-[10px] font-extrabold text-slate-500 dark:text-zinc-400 uppercase tracking-widest pl-1">
                  {brandName}
                </span>
                
                <div className="grid grid-cols-1 gap-2.5">
                  {brandVehicles.map((vehicle) => {
                    const isFav = favorites.includes(vehicle.id);
                    const isDiscontinued = !!vehicle.discontinuedYear;

                    return (
                      <motion.div
                        key={vehicle.id}
                        whileHover={{ scale: 1.01 }}
                        className="p-3 rounded-2xl border flex items-center justify-between gap-3 relative transition-all bg-white/50 border-zinc-200/50 dark:bg-zinc-950/25 dark:border-white/5 hover:border-emerald-500/20 dark:hover:border-emerald-500/20 shadow-sm"
                      >
                        {/* Selector Info area */}
                        <div 
                          className="flex-1 min-w-0 cursor-pointer"
                          onClick={() => onSelectVehicle(vehicle)}
                        >
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h4 className="font-bold text-xs text-slate-800 dark:text-white leading-tight">
                              {vehicle.model}
                            </h4>
                            <span className="text-[8px] bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 px-1.5 py-0.5 rounded font-bold">
                              {vehicle.variant}
                            </span>
                            {isDiscontinued && (
                              <span className="text-[8px] bg-amber-500/10 text-amber-500 px-1.5 py-0.5 rounded font-bold">
                                Post-2010 Discontinued
                              </span>
                            )}
                          </div>
                          
                          {/* Specs label */}
                          <div className="flex items-center gap-3 mt-1 text-[10px] text-zinc-500 dark:text-zinc-400">
                            <span>Mileage: <strong>{vehicle.mileage} {vehicle.fuelType === 'EV' ? 'km/kWh' : vehicle.fuelType === 'CNG' ? 'km/kg' : 'km/L'}</strong></span>
                            <span>Scale: <strong className="text-amber-500">★ {vehicle.reliabilityScore}/10</strong></span>
                          </div>

                          {/* Pricing metrics */}
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[11px] font-extrabold text-slate-800 dark:text-white">
                              On-road: {formatPrice(vehicle.onRoadPrice)}
                            </span>
                            <span className="text-[9px] text-zinc-500 dark:text-zinc-400">
                              (Ex-showroom: {formatPrice(vehicle.exShowroomPrice)})
                            </span>
                          </div>
                        </div>

                        {/* Favorite Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(vehicle.id);
                          }}
                          className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-400 dark:text-zinc-500 hover:text-rose-500 transition-colors"
                        >
                          <Heart size={14} className={isFav ? 'text-rose-500 fill-rose-500' : ''} />
                        </button>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
