
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, ArrowLeft, MapPin, Filter } from "lucide-react";
import { OnboardingData } from "./OnboardingModal";
import { INDIAN_CITIES, getPopularCities, searchCities, getCitiesByState, INDIAN_STATES, City } from "@/data/cities";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface StepProps {
  onNext: () => void;
  onBack: () => void;
  onSkip: () => void;
  onboardingData: OnboardingData;
  updateOnboardingData: (data: Partial<OnboardingData>) => void;
}

const OnboardingStep3: React.FC<StepProps> = ({ 
  onNext, 
  onBack, 
  onSkip, 
  onboardingData, 
  updateOnboardingData 
}) => {
  const [selectedArea, setSelectedArea] = useState(onboardingData.area || "");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedState, setSelectedState] = useState<string>("all");

  const filteredCities = useMemo(() => {
    let cities = INDIAN_CITIES;

    // Filter by search term
    if (searchTerm.trim()) {
      cities = searchCities(searchTerm);
    }

    // Filter by state
    if (selectedState !== "all") {
      cities = cities.filter(city => city.state === selectedState);
    }

    // Show popular cities first if no filters applied
    if (!searchTerm.trim() && selectedState === "all") {
      const popular = getPopularCities();
      const others = cities.filter(c => !popular.find(p => p.id === c.id));
      return [...popular, ...others].slice(0, 50);
    }

    return cities.slice(0, 50);
  }, [searchTerm, selectedState]);

  const handleNext = () => {
    if (selectedArea.trim()) {
      updateOnboardingData({ area: selectedArea.trim() });
    }
    onNext();
  };

  const handleSkip = () => {
    onSkip();
  };

  const handleAreaSelect = (city: City) => {
    setSelectedArea(city.name);
  };

  return (
    <div className="flex flex-col p-4 sm:p-8 h-full min-h-[400px]">
      <div className="text-center mb-6 sm:mb-8">
        <div className="w-16 h-16 sm:w-20 sm:h-20 mx-auto mb-4 sm:mb-6 bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-center">
          <MapPin className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
        </div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 sm:mb-4">Set Your Location</h2>
        <p className="text-base sm:text-lg text-gray-300 max-w-md mx-auto mb-2 px-4">
          Want to connect locally? Set your city or area to view and post in location-based anonymous feeds.
        </p>
        <p className="text-sm text-purple-300">(Optional - You can skip this step)</p>
      </div>

      <div className="flex-1 max-w-lg mx-auto w-full px-4 sm:px-0">
        <div className="mb-6">
          {/* Search Input */}
          <div className="relative mb-4">
            <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-purple-400" />
            <Input
              placeholder="Search for your city..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-gray-900/60 border-purple-800/50 text-white h-12 text-base"
            />
          </div>

          {/* Manual Input */}
          <div className="mb-4">
            <Input
              placeholder="Or enter your city/area manually"
              value={selectedArea}
              onChange={(e) => setSelectedArea(e.target.value)}
              className="bg-gray-900/60 border-purple-800/50 text-white h-12 text-base"
            />
          </div>

          {/* State Filter */}
          <div className="mb-4">
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger className="bg-gray-900/60 border-purple-800/50 text-white h-12">
                <Filter className="w-4 h-4 mr-2 text-purple-400" />
                <SelectValue placeholder="Filter by state" />
              </SelectTrigger>
              <SelectContent className="bg-gray-900 border-purple-800/50 max-h-48 overflow-y-auto">
                <SelectItem value="all" className="text-white">All States</SelectItem>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state} className="text-white">
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cities Grid */}
          <div className="space-y-3">
            {!searchTerm.trim() && selectedState === "all" && (
              <p className="text-sm text-purple-300 mb-3 font-medium">Popular Cities:</p>
            )}
            
            <div className="grid grid-cols-2 gap-2 sm:gap-3 max-h-64 overflow-y-auto">
              {filteredCities.map((city) => (
                <button
                  key={city.id}
                  onClick={() => handleAreaSelect(city)}
                  className={`p-3 text-sm rounded-lg border transition-all hover:scale-105 ${
                    selectedArea === city.name
                      ? "bg-purple-600/50 border-purple-400 text-white shadow-lg"
                      : "bg-gray-900/30 border-gray-700 text-gray-300 hover:bg-gray-800/50 hover:border-purple-600/50"
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{city.name}</span>
                    <span className="text-xs text-gray-400">{city.state}</span>
                    {(city.isMetro || city.isCapital) && (
                      <div className="flex gap-1 mt-1">
                        {city.isMetro && (
                          <span className="text-xs bg-blue-600/20 text-blue-300 px-1 py-0.5 rounded">
                            Metro
                          </span>
                        )}
                        {city.isCapital && (
                          <span className="text-xs bg-yellow-600/20 text-yellow-300 px-1 py-0.5 rounded">
                            Capital
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {filteredCities.length === 0 && searchTerm.trim() && (
              <div className="text-center py-8 text-gray-400">
                <p className="text-sm mb-2">No cities found for "{searchTerm}"</p>
                <p className="text-xs">Try entering the city name in the manual input above</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-black/30 rounded-lg p-4 border border-purple-800/30 mb-6">
          <h3 className="text-white font-medium mb-2 text-sm sm:text-base">Why set location?</h3>
          <ul className="text-xs sm:text-sm text-gray-400 space-y-1">
            <li>• See posts from people in your area</li>
            <li>• Connect with locals anonymously</li>
            <li>• Discover events and activities nearby</li>
            <li>• Your exact location is never shared</li>
          </ul>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row justify-between gap-3 sm:gap-0 px-4 sm:px-0">
        <Button
          onClick={onBack}
          variant="outline"
          className="border-purple-800/50 text-purple-300 hover:bg-purple-900/30 h-12 w-full sm:w-auto"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back
        </Button>
        <div className="flex flex-col sm:flex-row gap-3 sm:space-x-3">
          <Button
            onClick={handleSkip}
            variant="outline"
            className="border-purple-800/50 text-purple-300 hover:bg-purple-900/30 h-12 w-full sm:w-auto"
          >
            Skip
          </Button>
          <Button
            onClick={handleNext}
            className="bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-700 hover:to-purple-600 h-12 w-full sm:w-auto"
          >
            Continue
            <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingStep3;
