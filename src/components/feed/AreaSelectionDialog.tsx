
import React, { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MapPin, Search, Filter } from "lucide-react";
import { INDIAN_CITIES, getPopularCities, searchCities, getCitiesByState, INDIAN_STATES, City } from "@/data/cities";

interface AreaSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAreaSelect: (area: string) => void;
  currentArea: string;
}

const AreaSelectionDialog: React.FC<AreaSelectionDialogProps> = ({
  open,
  onOpenChange,
  onAreaSelect,
  currentArea,
}) => {
  const [area, setArea] = useState(currentArea || "");
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
      return [...popular, ...others].slice(0, 30);
    }

    return cities.slice(0, 30);
  }, [searchTerm, selectedState]);

  const handleSubmit = () => {
    if (area.trim()) {
      onAreaSelect(area.trim());
      onOpenChange(false);
    }
  };

  const handleCitySelect = (city: City) => {
    setArea(city.name);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[80vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Select Your Area
          </DialogTitle>
          <DialogDescription>
            Enter your area to see posts from your local community
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 overflow-y-auto flex-1">
          {/* Manual Input */}
          <div className="space-y-2">
            <Label htmlFor="area-input">Area/Location</Label>
            <Input
              id="area-input"
              placeholder="Enter or select your city/area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>

          {/* Search Input */}
          <div className="space-y-2">
            <Label htmlFor="city-search">Search Cities</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="city-search"
                placeholder="Search for your city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* State Filter */}
          <div className="space-y-2">
            <Label>Filter by State</Label>
            <Select value={selectedState} onValueChange={setSelectedState}>
              <SelectTrigger>
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="All States" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                <SelectItem value="all">All States</SelectItem>
                {INDIAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Cities Grid */}
          <div className="space-y-2">
            <Label>Popular Cities</Label>
            <div className="max-h-64 overflow-y-auto border rounded-md p-2">
              {!searchTerm.trim() && selectedState === "all" && (
                <div className="mb-2">
                  <p className="text-xs text-muted-foreground font-medium">Popular Cities:</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-2">
                {filteredCities.map((city) => (
                  <button
                    key={city.id}
                    onClick={() => handleCitySelect(city)}
                    className={`p-2 text-sm rounded border transition-all text-left ${
                      area === city.name
                        ? "bg-primary/10 border-primary text-primary"
                        : "hover:bg-muted/50"
                    }`}
                  >
                    <div className="flex flex-col">
                      <span className="font-medium">{city.name}</span>
                      <span className="text-xs text-muted-foreground">{city.state}</span>
                      {(city.isMetro || city.isCapital) && (
                        <div className="flex gap-1 mt-1">
                          {city.isMetro && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-1 py-0.5 rounded">
                              Metro
                            </span>
                          )}
                          {city.isCapital && (
                            <span className="text-xs bg-yellow-100 text-yellow-800 px-1 py-0.5 rounded">
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
                <div className="text-center py-8 text-muted-foreground">
                  <p className="text-sm mb-2">No cities found for "{searchTerm}"</p>
                  <p className="text-xs">Try entering the city name in the input above</p>
                </div>
              )}
            </div>
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!area.trim()}
              className="flex-1"
            >
              Select Area
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AreaSelectionDialog;
