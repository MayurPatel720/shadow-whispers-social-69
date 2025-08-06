
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
import { INDIAN_CITIES, getPopularCities, searchCities, INDIAN_STATES, City } from "@/data/cities";
import { ScrollArea } from "@/components/ui/scroll-area";

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
      return [...popular, ...others].slice(0, 50);
    }

    return cities.slice(0, 50);
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
      <DialogContent className="w-full max-w-lg mx-auto h-[85vh] max-h-[600px] flex flex-col p-0 gap-0">
        <DialogHeader className="px-6 pt-6 pb-4 flex-shrink-0 border-b">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <MapPin className="h-5 w-5" />
            Select Your Area
          </DialogTitle>
          <DialogDescription className="text-sm">
            Enter your area to see posts from your local community
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex-1 overflow-hidden flex flex-col px-6">
          {/* Manual Input */}
          <div className="py-4 border-b flex-shrink-0">
            <Label htmlFor="area-input" className="text-sm font-medium mb-2 block">
              Area/Location
            </Label>
            <Input
              id="area-input"
              placeholder="Enter or select your city/area"
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className="h-11"
            />
          </div>

          {/* Search and Filter */}
          <div className="py-4 space-y-4 border-b flex-shrink-0">
            {/* Search Input */}
            <div className="space-y-2">
              <Label htmlFor="city-search" className="text-sm font-medium">
                Search Cities
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="city-search"
                  placeholder="Search for your city..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 h-11"
                />
              </div>
            </div>

            {/* State Filter */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Filter by State</Label>
              <Select value={selectedState} onValueChange={setSelectedState}>
                <SelectTrigger className="h-11">
                  <Filter className="w-4 h-4 mr-2" />
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent className="max-h-48">
                  <SelectItem value="all">All States</SelectItem>
                  {INDIAN_STATES.map((state) => (
                    <SelectItem key={state} value={state}>
                      {state}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Cities List */}
          <div className="flex-1 py-4 overflow-hidden">
            <Label className="text-sm font-medium mb-3 block">
              {!searchTerm.trim() && selectedState === "all" ? "Popular Cities" : "Cities"}
            </Label>
            
            <ScrollArea className="h-full pr-4">
              <div className="space-y-2">
                {filteredCities.length > 0 ? (
                  <>
                    {!searchTerm.trim() && selectedState === "all" && (
                      <p className="text-xs text-muted-foreground mb-3 px-1">
                        Popular cities are shown first:
                      </p>
                    )}
                    
                    {filteredCities.map((city) => (
                      <button
                        key={city.id}
                        onClick={() => handleCitySelect(city)}
                        className={`w-full p-3 text-left rounded-lg border transition-all ${
                          area === city.name
                            ? "bg-primary/10 border-primary text-primary"
                            : "hover:bg-muted/50 border-border"
                        }`}
                      >
                        <div className="flex flex-col gap-1">
                          <span className="font-medium text-sm">{city.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {city.state}
                          </span>
                          {(city.isMetro || city.isCapital) && (
                            <div className="flex gap-1 mt-1">
                              {city.isMetro && (
                                <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                                  Metro
                                </span>
                              )}
                              {city.isCapital && (
                                <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">
                                  Capital
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </button>
                    ))}
                  </>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p className="text-sm mb-2">
                      {searchTerm.trim() 
                        ? `No cities found for "${searchTerm}"` 
                        : "No cities found"}
                    </p>
                    <p className="text-xs">
                      Try entering the city name in the input above
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="px-6 py-4 border-t flex-shrink-0">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 h-11"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!area.trim()}
              className="flex-1 h-11"
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
