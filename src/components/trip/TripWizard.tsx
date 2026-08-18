import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { TravelWiseLogo } from '../common/TravelWiseLogo';
import {
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Compass,
  Utensils,
  Hotel,
  ArrowRight,
  ArrowLeft,
  Check,
  Plus,
  Minus,
  Plane,
  Car,
  Train,
  CheckCircle2,
  AlertCircle,
  Map as MapIcon,
  Star,
  Layers,
  Image as ImageIcon,
  Tag,
} from 'lucide-react';
import { CreateTripInput, MarkedPlace, DestinationInfo, Place } from '../../types';
import { formatCurrency } from '../../lib/utils';
import { PlanningPlacesAndMap } from './PlanningPlacesAndMap';
import { apiPlaces } from '../../services/api';

interface TripWizardProps {
  initialData?: Partial<CreateTripInput>;
  onGenerate: (data: CreateTripInput) => Promise<void>;
  isLoading?: boolean;
}

const POPULAR_DESTINATIONS = [
  { name: 'Goa', country: 'India', img: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=400&q=80' },
  { name: 'Manali', country: 'India', img: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=400&q=80' },
  { name: 'Darjeeling', country: 'India', img: 'https://images.unsplash.com/photo-1544735716-392fe2489ffa?auto=format&fit=crop&w=400&q=80' },
  { name: 'Jaipur', country: 'India', img: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=400&q=80' },
  { name: 'Kerala', country: 'India', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=400&q=80' },
  { name: 'Agra', country: 'India', img: 'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=400&q=80' },
  { name: 'Gangtok', country: 'India', img: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=400&q=80' },
  { name: 'Varanasi', country: 'India', img: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=400&q=80' },
];

const TRAVEL_STYLES = [
  'Adventure',
  'Relaxation',
  'Cultural',
  'Historical',
  'Nature & Wildlife',
  'Food & Culinary',
  'Shopping',
  'Nightlife',
  'Photography',
  'Spiritual',
  'Family-friendly',
  'Luxury',
  'Backpacking',
];

const FOOD_PREFERENCES = [
  'Vegetarian',
  'Vegan',
  'Non-Vegetarian',
  'Halal',
  'Jain',
  'Local Regional Cuisine',
  'Street Food',
  'Fine Dining',
];

const ACCOMMODATIONS = [
  { id: 'Hotel', label: 'Comfort Hotel', desc: 'Standard 3-4 star amenities' },
  { id: 'Resort', label: 'Luxury Resort', desc: 'Pool, spa, beachfront or valley views' },
  { id: 'Homestay', label: 'Local Homestay / B&B', desc: 'Warm authentic host hospitality' },
  { id: 'Hostel', label: 'Boutique Hostel', desc: 'Budget-friendly, social backpacker vibe' },
  { id: 'Apartment', label: 'Private Villa / Apartment', desc: 'Spacious privacy for groups' },
];

const TRANSPORTATIONS = [
  { id: 'Mixed (Taxi / Auto / Walking)', label: 'Mixed (Taxi / Auto / Walking)', icon: Car },
  { id: 'Rental Car / Self-Drive', label: 'Rental Car / Self-Drive', icon: Car },
  { id: 'Public Transit (Metro & Bus)', label: 'Public Transit (Metro & Bus)', icon: Train },
  { id: 'Private Chauffeur', label: 'Private Chauffeur', icon: Plane },
];

const INTERESTS_LIST = [
  'Ancient Temples & Palaces',
  'Beach Sunsets & Watersports',
  'Art & Handloom Crafts',
  'Mountain Trekking & Viewpoints',
  'Local Food Trails',
  'Hidden Cafes & Bakeries',
  'Wildlife Safaris',
  'Night Markets & Live Music',
  'Museums & Galleries',
  'Boat Cruises & Lakes',
];

export const TripWizard: React.FC<TripWizardProps> = ({ initialData, onGenerate, isLoading }) => {
  const [step, setStep] = useState(1);
  const totalSteps = 9;

  // Form State
  const [destination, setDestination] = useState(initialData?.destination || 'Goa');
  const [destinationsCatalog, setDestinationsCatalog] = useState<DestinationInfo[]>([]);
  const [currentDestInfo, setCurrentDestInfo] = useState<DestinationInfo | null>(null);
  const [previewPlaces, setPreviewPlaces] = useState<Place[]>([]);
  const [markedPlaces, setMarkedPlaces] = useState<MarkedPlace[]>(initialData?.marked_places || []);

  const [startDate, setStartDate] = useState(
    initialData?.start_date ||
      new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [endDate, setEndDate] = useState(
    initialData?.end_date ||
      new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0]
  );
  const [travelerType, setTravelerType] = useState<
    'Solo' | 'Couple' | 'Family' | 'Friends' | 'Business'
  >((initialData?.traveler_type as any) || 'Couple');
  const [travelers, setTravelers] = useState(initialData?.travelers || 2);
  const [budget, setBudget] = useState<number>(initialData?.budget || 25000);
  const [currency, setCurrency] = useState<'INR' | 'USD' | 'EUR' | 'GBP'>(
    (initialData?.currency as any) || 'INR'
  );
  const [travelStyle, setTravelStyle] = useState<string[]>(
    initialData?.travel_style || ['Relaxation', 'Food & Culinary', 'Cultural']
  );
  const [foodPreferences, setFoodPreferences] = useState<string[]>(
    initialData?.food_preferences || ['Local Regional Cuisine', 'Street Food']
  );
  const [accommodation, setAccommodation] = useState(
    initialData?.accommodation || 'Hotel'
  );
  const [transportation, setTransportation] = useState(
    initialData?.transportation || 'Mixed (Taxi / Auto / Walking)'
  );
  const [interests, setInterests] = useState<string[]>(
    initialData?.interests || ['Beach Sunsets & Watersports', 'Local Food Trails']
  );
  const [specialNotes, setSpecialNotes] = useState(initialData?.special_notes || '');

  // Load destination catalog
  useEffect(() => {
    apiPlaces.getDestinations().then((dests) => {
      if (dests && dests.length > 0) {
        setDestinationsCatalog(dests);
      }
    }).catch(() => {});
  }, []);

  // Update current destination info and preview places when destination changes
  useEffect(() => {
    const rawName = destination.split(',')[0].trim().toLowerCase();
    const match = destinationsCatalog.find((d) => d.name.toLowerCase().includes(rawName));
    setCurrentDestInfo(match || null);

    // Fetch instant preview places for step 1
    apiPlaces.getPlaces({ destination: rawName }).then((res) => {
      if (res && res.length > 0) {
        setPreviewPlaces(res.slice(0, 4));
      } else {
        setPreviewPlaces([]);
      }
    }).catch(() => {
      setPreviewPlaces([]);
    });
  }, [destination, destinationsCatalog]);

  // Calculate duration
  const start = new Date(startDate);
  const end = new Date(endDate);
  const duration = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

  // Toggle multi-select items
  const toggleArrayItem = (
    list: string[],
    setList: React.Dispatch<React.SetStateAction<string[]>>,
    item: string
  ) => {
    if (list.includes(item)) {
      setList(list.filter((i) => i !== item));
    } else {
      setList([...list, item]);
    }
  };

  // Marked places management
  const handleToggleMarkPlace = (place: MarkedPlace) => {
    setMarkedPlaces((prev) => {
      const exists = prev.some((p) => p.id === place.id || p.name.toLowerCase() === place.name.toLowerCase());
      if (exists) {
        return prev.filter((p) => p.id !== place.id && p.name.toLowerCase() !== place.name.toLowerCase());
      }
      return [...prev, place];
    });
  };

  const handleAddCustomPlace = (place: MarkedPlace) => {
    setMarkedPlaces((prev) => [...prev, place]);
  };

  const handleRemoveMarkedPlace = (placeId: string) => {
    setMarkedPlaces((prev) => prev.filter((p) => p.id !== placeId));
  };

  const handleNext = () => {
    if (step === 1 && !destination.trim()) return;
    if (step === 3 && (!startDate || !endDate || end < start)) return;
    if (step === 5 && (!budget || budget <= 0)) return;
    setStep((prev) => Math.min(totalSteps, prev + 1));
  };

  const handleBack = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleFinalSubmit = async () => {
    const tripInput: CreateTripInput = {
      destination: destination.trim(),
      start_date: startDate,
      end_date: endDate,
      travelers,
      traveler_type: travelerType,
      budget,
      currency,
      travel_style: travelStyle as any,
      food_preferences: foodPreferences as any,
      accommodation: accommodation as any,
      transportation: transportation as any,
      interests: interests as any,
      special_notes: specialNotes,
      marked_places: markedPlaces,
    };
    await onGenerate(tripInput);
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
      {/* Progress Header */}
      <div className="bg-slate-900 text-white p-6 sm:p-8 relative overflow-hidden border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full bg-slate-800 text-[#E5C365] font-medium text-xs border border-[#C59B27]/30 tracking-wider uppercase">
              Step {step} of {totalSteps}
            </span>
            <span className="text-slate-400 text-xs hidden sm:inline">• Travel Wise Concierge</span>
          </div>
          <div className="flex items-center gap-3">
            {markedPlaces.length > 0 && (
              <span className="text-xs font-medium text-[#E5C365] bg-slate-800 px-2.5 py-1 rounded-full border border-[#C59B27]/30 flex items-center gap-1">
                📍 {markedPlaces.length} Curated Spots
              </span>
            )}
            <span className="text-xs font-light text-slate-300">
              {Math.round((step / totalSteps) * 100)}% Curated
            </span>
          </div>
        </div>

        {/* Step Progress bar */}
        <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
          <motion.div
            className="h-full bg-[#E5C365] rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${(step / totalSteps) * 100}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step Titles */}
        <h2 className="font-serif-title text-2xl sm:text-3xl text-white font-medium tracking-tight">
          {step === 1 && 'Where are you traveling?'}
          {step === 2 && 'Explore Places & Mark on Interactive Map'}
          {step === 3 && 'When will this journey take place?'}
          {step === 4 && 'Who will be joining you?'}
          {step === 5 && 'What is your expected investment level?'}
          {step === 6 && 'What pace and style do you prefer?'}
          {step === 7 && 'Any culinary tastes or dietary preferences?'}
          {step === 8 && 'Preferred stay style, transit & special highlights'}
          {step === 9 && 'Review & Generate Your Bespoke Itinerary ✨'}
        </h2>
        <p className="text-xs sm:text-sm text-slate-400 font-light mt-1.5">
          {step === 1 && 'Select a curated destination or enter any city/region worldwide to begin.'}
          {step === 2 && 'Browse photos of notable landmarks, mark pins on the map, and curate must-visit spots.'}
          {step === 3 && 'Pick your start and end dates to calculate your relaxed travel timeline.'}
          {step === 4 && 'Choose your party composition to calibrate suitable venues and rooms.'}
          {step === 5 && 'Define your budget parameters for balanced luxury and transparent planning.'}
          {step === 6 && 'Select one or more styles to guide the tone and rhythm of each day.'}
          {step === 7 && 'We’ll curate authentic regional dining and refined gastronomy matching your diet.'}
          {step === 8 && 'Customize accommodations, chauffeur or transit modes, and unique interests.'}
          {step === 9 && 'Verify all details before our intelligent concierge composes your complete travel journal.'}
        </p>
      </div>

      {/* Step Contents */}
      <div className="p-6 sm:p-8 min-h-[400px] bg-[#FAFAF8]">
        <AnimatePresence mode="wait">
          {/* STEP 1: DESTINATION & INSTANT PLACES IMAGES PREVIEW */}
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Destination Name or Region
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 text-slate-900 absolute left-4 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="e.g., Goa, Manali, Kerala, Gangtok, Jaipur, Darjeeling, Agra..."
                    className="w-full pl-12 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 text-slate-900 font-medium text-lg outline-none transition-all bg-white"
                    autoFocus
                  />
                </div>
              </div>

              {/* Popular Destinations Cards */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-slate-500 mb-3">
                  Or select a signature destination:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {POPULAR_DESTINATIONS.map((dest) => {
                    const isSelected = destination.toLowerCase().includes(dest.name.toLowerCase());
                    return (
                      <button
                        type="button"
                        key={dest.name}
                        onClick={() => setDestination(`${dest.name}, ${dest.country}`)}
                        className={`relative rounded-2xl overflow-hidden text-left p-3 border-2 transition-all group ${
                          isSelected
                            ? 'border-[#C59B27] ring-2 ring-[#C59B27]/30 scale-[1.02]'
                            : 'border-slate-200 hover:border-slate-900'
                        }`}
                      >
                        <img
                          src={dest.img}
                          alt={dest.name}
                          className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 -z-10"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent -z-10" />
                        <div className="pt-14">
                          <p className="text-sm font-medium text-white leading-tight flex items-center justify-between">
                            {dest.name}
                            {isSelected && <CheckCircle2 className="w-4 h-4 text-[#E5C365]" />}
                          </p>
                          <p className="text-xs text-[#E5C365] font-light">{dest.country}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Places Images Preview in this Section */}
              {destination.trim() && (
                <div className="pt-2 border-t border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImageIcon className="w-4 h-4 text-slate-900" />
                      <h4 className="text-sm font-serif-title font-medium text-slate-900">
                        Signature Sights in {destination.split(',')[0]}
                      </h4>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="text-xs font-medium text-slate-900 hover:text-slate-700 flex items-center gap-1"
                    >
                      Open Map & Curate Spots <ArrowRight className="w-3.5 h-3.5 text-[#C59B27]" />
                    </button>
                  </div>

                  {previewPlaces.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {previewPlaces.map((p) => {
                        const isMarked = markedPlaces.some(
                          (m) => m.id === p.id || m.name.toLowerCase() === p.name.toLowerCase()
                        );
                        return (
                          <div
                            key={p.id}
                            className="group relative rounded-xl overflow-hidden border border-slate-200 bg-white shadow-xs flex flex-col justify-between"
                          >
                            <div className="relative h-24 w-full overflow-hidden bg-slate-200">
                              <img
                                src={p.image}
                                alt={p.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-medium bg-slate-950/80 text-[#E5C365] backdrop-blur-md">
                                {p.category}
                              </span>
                              <div className="absolute bottom-1.5 left-1.5 right-1.5">
                                <p className="text-[11px] font-medium text-white truncate">{p.name}</p>
                              </div>
                            </div>
                            <div className="p-2 flex items-center justify-between bg-slate-50 border-t border-slate-200">
                              <span className="text-[10px] font-semibold text-slate-900">
                                {p.estimated_cost ? `₹${p.estimated_cost}` : 'Complimentary'}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  handleToggleMarkPlace({
                                    id: p.id,
                                    name: p.name,
                                    category: p.category,
                                    destination: p.destination,
                                    latitude: p.latitude,
                                    longitude: p.longitude,
                                    image: p.image,
                                    address: p.address,
                                    rating: p.rating,
                                    estimated_cost: p.estimated_cost,
                                  })
                                }
                                className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all ${
                                  isMarked
                                    ? 'bg-slate-900 text-[#E5C365]'
                                    : 'bg-slate-900 text-white hover:bg-slate-800'
                                }`}
                              >
                                {isMarked ? '✓ Curated' : '+ Curate'}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between text-xs text-slate-900">
                      <span>Proceed to explore the interactive destination map for {destination}!</span>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="px-3 py-1 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800"
                      >
                        Explore Map
                      </button>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          )}

          {/* STEP 2: DEDICATED INTERACTIVE MAP & MARK MAP SECTION */}
          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <PlanningPlacesAndMap
                destination={destination.split(',')[0].trim()}
                markedPlaces={markedPlaces}
                onToggleMarkPlace={handleToggleMarkPlace}
                onAddCustomPlace={handleAddCustomPlace}
                onRemoveMarkedPlace={handleRemoveMarkedPlace}
                onClearAllMarked={() => setMarkedPlaces([])}
                destinationInfo={currentDestInfo}
              />
            </motion.div>
          )}

          {/* STEP 3: DATES & DURATION */}
          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Start Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-slate-900 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 font-medium text-slate-900 outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    End Date
                  </label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 text-slate-900 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input
                      type="date"
                      value={endDate}
                      min={startDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full pl-12 pr-4 py-3 rounded-2xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 font-medium text-slate-900 outline-none bg-white"
                    />
                  </div>
                </div>
              </div>

              {/* Duration Display Card */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-900 text-white flex items-center justify-center font-serif-title font-medium text-lg shadow-xs border border-[#C59B27]/30">
                    {duration}
                  </div>
                  <div>
                    <h4 className="font-serif-title font-medium text-slate-900">Journey Timeline</h4>
                    <p className="text-xs text-slate-500 font-light">
                      Calculated from {startDate} to {endDate}
                    </p>
                  </div>
                </div>
                <span className="px-3 py-1 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-900">
                  {duration} Days & {Math.max(1, duration - 1)} Nights
                </span>
              </div>
            </motion.div>
          )}

          {/* STEP 4: TRAVELERS */}
          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-3">
                  Traveler Group Composition
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  {[
                    { type: 'Solo', icon: '🎒', desc: 'Single traveler' },
                    { type: 'Couple', icon: '💑', desc: 'Romantic escape' },
                    { type: 'Family', icon: '👨‍👩‍👧‍👦', desc: 'Family journey' },
                    { type: 'Friends', icon: '🎉', desc: 'Group travel' },
                    { type: 'Business', icon: '💼', desc: 'Bleisure & retreat' },
                  ].map((item) => (
                    <button
                      type="button"
                      key={item.type}
                      onClick={() => {
                        setTravelerType(item.type as any);
                        if (item.type === 'Solo') setTravelers(1);
                        if (item.type === 'Couple' && travelers < 2) setTravelers(2);
                      }}
                      className={`p-4 rounded-2xl border-2 text-center transition-all ${
                        travelerType === item.type
                          ? 'border-slate-900 bg-slate-100 shadow-xs'
                          : 'border-slate-200 hover:border-slate-400 bg-white'
                      }`}
                    >
                      <span className="text-2xl mb-1 block">{item.icon}</span>
                      <h4 className="font-medium text-slate-900 text-sm">{item.type}</h4>
                      <p className="text-[11px] text-slate-500 font-light">{item.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Number of Guests
                </label>
                <div className="flex items-center gap-4 bg-white p-4 rounded-2xl border border-slate-200 max-w-xs">
                  <button
                    type="button"
                    onClick={() => setTravelers((prev) => Math.max(1, prev - 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-medium text-slate-900 hover:bg-slate-200 transition-colors"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="font-serif-title font-medium text-2xl text-slate-900 flex-1 text-center">
                    {travelers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setTravelers((prev) => Math.min(20, prev + 1))}
                    className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center font-medium text-slate-900 hover:bg-slate-200 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: BUDGET */}
          {step === 5 && (
            <motion.div
              key="step5"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Total Estimated Investment
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      value={budget}
                      onChange={(e) => setBudget(Math.max(1000, Number(e.target.value)))}
                      className="w-full pl-4 pr-4 py-3.5 rounded-2xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 font-serif-title font-medium text-2xl text-slate-900 outline-none bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">Currency</label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value as any)}
                    className="w-full py-4 px-3 rounded-2xl border border-slate-200 font-medium text-slate-900 bg-white outline-none focus:border-slate-900"
                  >
                    <option value="INR">₹ INR (Indian Rupee)</option>
                    <option value="USD">$ USD (US Dollar)</option>
                    <option value="EUR">€ EUR (Euro)</option>
                    <option value="GBP">£ GBP (British Pound)</option>
                  </select>
                </div>
              </div>

              {/* Budget Presets */}
              <div>
                <label className="block text-xs font-medium uppercase tracking-widest text-slate-500 mb-2">
                  Reference Tiers:
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: 'Essential Comfort', val: 20000 },
                    { label: 'Refined Journey', val: 45000 },
                    { label: 'Luxury & Bespoke', val: 95000 },
                  ].map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setBudget(preset.val)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        budget === preset.val
                          ? 'border-slate-900 bg-slate-100 text-slate-900 font-medium'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs text-slate-500 font-light block">{preset.label}</span>
                      <span className="font-semibold text-sm text-slate-900">{formatCurrency(preset.val, currency)}</span>
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: TRAVEL STYLE */}
          {step === 6 && (
            <motion.div
              key="step6"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Select Your Preferred Travel Vibe (Pick one or more)
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {TRAVEL_STYLES.map((style) => {
                    const isSelected = travelStyle.includes(style);
                    return (
                      <button
                        type="button"
                        key={style}
                        onClick={() => toggleArrayItem(travelStyle, setTravelStyle, style)}
                        className={`p-3.5 rounded-2xl border-2 text-left text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-slate-900 bg-slate-100 text-slate-900 font-medium'
                            : 'border-slate-200 text-slate-600 bg-white hover:border-slate-400'
                        }`}
                      >
                        <span>{style}</span>
                        {isSelected && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 7: FOOD PREFERENCES */}
          {step === 7 && (
            <motion.div
              key="step7"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Culinary Preferences & Dietary Guidelines
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {FOOD_PREFERENCES.map((food) => {
                    const isSelected = foodPreferences.includes(food);
                    return (
                      <button
                        type="button"
                        key={food}
                        onClick={() => toggleArrayItem(foodPreferences, setFoodPreferences, food)}
                        className={`p-3.5 rounded-2xl border-2 text-left text-sm transition-all flex items-center justify-between ${
                          isSelected
                            ? 'border-slate-900 bg-slate-100 text-slate-900 font-medium'
                            : 'border-slate-200 text-slate-600 bg-white hover:border-slate-400'
                        }`}
                      >
                        <span>{food}</span>
                        {isSelected && <Check className="w-4 h-4 text-slate-900 shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 8: STAY, TRANSIT & INTERESTS */}
          {step === 8 && (
            <motion.div
              key="step8"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Accommodation Style
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {ACCOMMODATIONS.map((acc) => (
                    <button
                      type="button"
                      key={acc.id}
                      onClick={() => setAccommodation(acc.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        accommodation === acc.id
                          ? 'border-slate-900 bg-slate-100 text-slate-900 font-medium'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <h5 className="text-xs font-medium text-slate-900">{acc.label}</h5>
                      <p className="text-[11px] text-slate-500 font-light">{acc.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Transportation Preference
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {TRANSPORTATIONS.map((trans) => (
                    <button
                      type="button"
                      key={trans.id}
                      onClick={() => setTransportation(trans.id)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        transportation === trans.id
                          ? 'border-slate-900 bg-slate-100 text-slate-900 font-medium'
                          : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-xs font-medium text-slate-900">{trans.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Special Curations & Key Highlights
                </label>
                <div className="flex flex-wrap gap-2">
                  {INTERESTS_LIST.map((item) => {
                    const isSelected = interests.includes(item);
                    return (
                      <button
                        type="button"
                        key={item}
                        onClick={() => toggleArrayItem(interests, setInterests, item)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                          isSelected
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {item}
                      </button>
                    );
                  })}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 9: SUMMARY & GENERATE */}
          {step === 9 && (
            <motion.div
              key="step9"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="bg-white border border-slate-200 rounded-2xl p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <div>
                    <span className="text-xs uppercase tracking-widest font-medium text-slate-500">Destination</span>
                    <h3 className="font-serif-title text-2xl font-medium text-slate-900">{destination}</h3>
                  </div>
                  <div className="text-right">
                    <span className="text-xs uppercase tracking-widest font-medium text-slate-500">Duration</span>
                    <p className="font-serif-title text-base font-medium text-slate-900">
                      {duration} Days ({startDate} - {endDate})
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
                  <div>
                    <span className="text-xs text-slate-500 font-light block">Travelers</span>
                    <span className="font-medium text-slate-900">{travelers} ({travelerType})</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-light block">Investment</span>
                    <span className="font-medium text-slate-900">{formatCurrency(budget, currency)}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-light block">Accommodation</span>
                    <span className="font-medium text-slate-900">{accommodation}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 font-light block">Transit Mode</span>
                    <span className="font-medium text-slate-900 truncate block">{transportation}</span>
                  </div>
                </div>

                {/* Marked Places Summary */}
                {markedPlaces.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium text-slate-900 flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                        {markedPlaces.length} Curated Spots Included in Itinerary:
                      </span>
                      <button
                        type="button"
                        onClick={() => setStep(2)}
                        className="text-xs font-medium text-[#C59B27] hover:text-slate-900 transition-colors"
                      >
                        Edit Map Pins
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {markedPlaces.map((mp) => (
                        <span
                          key={mp.id}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 border border-[#C59B27]/40 text-slate-900 text-xs font-medium flex items-center gap-1.5"
                        >
                          📍 {mp.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-2 border-t border-slate-200">
                  <span className="text-xs text-slate-500 font-light block mb-1">Selected Vibe & Styles:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {travelStyle.map((s) => (
                      <span key={s} className="px-2.5 py-1 bg-slate-100 border border-slate-200 rounded-md text-xs font-medium text-slate-800">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Special instructions / notes textarea */}
              <div>
                <label className="block text-sm font-medium text-slate-900 mb-2">
                  Special Requests or Personal Preferences (Optional)
                </label>
                <textarea
                  value={specialNotes}
                  onChange={(e) => setSpecialNotes(e.target.value)}
                  placeholder="e.g. Prefer relaxed mornings, interested in boutique heritage tea estates, photography at golden hour..."
                  rows={3}
                  className="w-full p-3.5 rounded-2xl border border-slate-200 focus:border-slate-900 focus:ring-4 focus:ring-slate-900/10 text-sm text-slate-900 outline-none bg-white"
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Footer Controls */}
      <div className="bg-slate-50 border-t border-slate-200 px-6 sm:px-8 py-4 flex items-center justify-between">
        <button
          type="button"
          onClick={handleBack}
          disabled={step === 1 || isLoading}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${
            step === 1 || isLoading
              ? 'text-slate-400 cursor-not-allowed opacity-50'
              : 'text-slate-700 hover:bg-slate-200'
          }`}
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        {step < totalSteps ? (
          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm shadow-xs flex items-center gap-2 active:scale-98 transition-all"
          >
            {step === 1 ? 'Next: Explore Map & Places' : 'Continue'}
            <ArrowRight className="w-4 h-4 text-[#E5C365]" />
          </button>
        ) : (
          <button
            type="button"
            onClick={handleFinalSubmit}
            disabled={isLoading}
            className="px-8 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-base shadow-lg border border-[#C59B27]/40 flex items-center gap-2.5 active:scale-98 transition-all"
          >
            <TravelWiseLogo variant="emblem" size="xs" theme="dark" className="w-5 h-5" />
            {isLoading ? 'Curating Journey...' : 'Generate My TravelWise Itinerary'}
          </button>
        )}
      </div>
    </div>
  );
};
