import {
  UtensilsCrossed,
  ShoppingCart,
  Wine,
  Cookie,
  Car,
  Fuel,
  Bus,
  Bike,
  Film,
  Gamepad2,
  Music,
  Dumbbell,
  PartyPopper,
  Home,
  Zap,
  Wifi,
  Droplets,
  Flame,
  Sofa,
  Shirt,
  Smartphone,
  Gift,
  ShoppingBag,
  HeartPulse,
  ShieldCheck,
  GraduationCap,
  Plane,
  Luggage,
  ClipboardList,
  type LucideIcon,
} from "lucide-react";

export interface Category {
  id: string;
  name: string;
  Icon: LucideIcon;
  colorClass: string;
  group: string;
  keywords: string[];
  broad: "food" | "transport" | "activity" | "accommodation" | "other";
}

export const CATEGORIES: Category[] = [
  // Food and drink
  { id: "dining_out", name: "Dining out", Icon: UtensilsCrossed, colorClass: "bg-orange-50 text-orange-600", group: "Food and drink", keywords: ["restaurant", "lunch", "dinner", "breakfast", "meal", "food", "eat", "cafe", "coffee", "tea", "brunch", "buffet", "takeout", "delivery", "zomato", "swiggy", "nasi", "mee", "roti", "rice"], broad: "food" },
  { id: "groceries", name: "Groceries", Icon: ShoppingCart, colorClass: "bg-green-50 text-green-600", group: "Food and drink", keywords: ["grocery", "groceries", "supermarket", "vegetable", "fruit", "milk", "bread", "market", "kirana", "mart"], broad: "food" },
  { id: "liquor", name: "Liquor", Icon: Wine, colorClass: "bg-rose-50 text-rose-600", group: "Food and drink", keywords: ["beer", "wine", "alcohol", "whiskey", "vodka", "drink", "bar", "pub", "cocktail", "bottle"], broad: "food" },
  { id: "other_food", name: "Other food", Icon: Cookie, colorClass: "bg-amber-50 text-amber-600", group: "Food and drink", keywords: ["snack", "water", "juice", "cold drink", "ice cream", "cake", "bakery"], broad: "food" },

  // Transportation
  { id: "taxi", name: "Taxi", Icon: Car, colorClass: "bg-blue-50 text-blue-600", group: "Transportation", keywords: ["taxi", "cab", "uber", "ola", "ride", "auto", "rickshaw", "grab"], broad: "transport" },
  { id: "fuel", name: "Fuel", Icon: Fuel, colorClass: "bg-amber-50 text-amber-600", group: "Transportation", keywords: ["fuel", "petrol", "diesel", "gas station", "petrol pump"], broad: "transport" },
  { id: "public_transport", name: "Public transport", Icon: Bus, colorClass: "bg-sky-50 text-sky-600", group: "Transportation", keywords: ["bus", "metro", "train", "flight", "airline", "airport", "station"], broad: "transport" },
  { id: "other_transport", name: "Other transport", Icon: Bike, colorClass: "bg-indigo-50 text-indigo-600", group: "Transportation", keywords: ["parking", "toll", "bike", "cycle", "scooter", "transport"], broad: "transport" },

  // Entertainment
  { id: "movies", name: "Movies", Icon: Film, colorClass: "bg-purple-50 text-purple-600", group: "Entertainment", keywords: ["movie", "cinema", "film", "netflix", "theater", "theatre", "popcorn", "prime"], broad: "activity" },
  { id: "games", name: "Games", Icon: Gamepad2, colorClass: "bg-violet-50 text-violet-600", group: "Entertainment", keywords: ["game", "gaming", "playstation", "xbox", "nintendo", "steam", "console"], broad: "activity" },
  { id: "music", name: "Music", Icon: Music, colorClass: "bg-fuchsia-50 text-fuchsia-600", group: "Entertainment", keywords: ["music", "concert", "spotify", "gig", "album"], broad: "activity" },
  { id: "sports", name: "Sports", Icon: Dumbbell, colorClass: "bg-emerald-50 text-emerald-600", group: "Entertainment", keywords: ["sport", "cricket", "football", "tennis", "match", "stadium", "gym", "fitness"], broad: "activity" },
  { id: "other_entertainment", name: "Other entertainment", Icon: PartyPopper, colorClass: "bg-pink-50 text-pink-600", group: "Entertainment", keywords: ["fun", "hangout", "party", "club", "event"], broad: "activity" },

  // Home
  { id: "rent", name: "Rent", Icon: Home, colorClass: "bg-green-50 text-green-600", group: "Home", keywords: ["rent", "house", "apartment", "flat", "pg", "mess", "lease"], broad: "accommodation" },
  { id: "electricity", name: "Electricity", Icon: Zap, colorClass: "bg-yellow-50 text-yellow-600", group: "Home", keywords: ["electricity", "electric", "power", "bill", "light", "current"], broad: "accommodation" },
  { id: "internet", name: "Internet", Icon: Wifi, colorClass: "bg-cyan-50 text-cyan-600", group: "Home", keywords: ["internet", "wifi", "broadband", "jio", "airtel", "fiber", "data"], broad: "accommodation" },
  { id: "water", name: "Water", Icon: Droplets, colorClass: "bg-blue-50 text-blue-600", group: "Home", keywords: ["water", "tanker"], broad: "accommodation" },
  { id: "gas", name: "Gas", Icon: Flame, colorClass: "bg-red-50 text-red-600", group: "Home", keywords: ["gas", "cylinder", "lpg"], broad: "accommodation" },
  { id: "other_home", name: "Other home", Icon: Sofa, colorClass: "bg-lime-50 text-lime-600", group: "Home", keywords: ["home", "maintenance", "repair", "furniture", "decor"], broad: "accommodation" },

  // Shopping
  { id: "clothing", name: "Clothing", Icon: Shirt, colorClass: "bg-fuchsia-50 text-fuchsia-600", group: "Shopping", keywords: ["clothes", "clothing", "shirt", "pants", "shoes", "fashion"], broad: "other" },
  { id: "electronics", name: "Electronics", Icon: Smartphone, colorClass: "bg-slate-50 text-slate-600", group: "Shopping", keywords: ["phone", "laptop", "charger", "cable", "headphones", "gadget"], broad: "other" },
  { id: "gifts", name: "Gifts", Icon: Gift, colorClass: "bg-red-50 text-red-600", group: "Shopping", keywords: ["gift", "present", "birthday", "anniversary", "wedding"], broad: "other" },
  { id: "other_shopping", name: "Other shopping", Icon: ShoppingBag, colorClass: "bg-teal-50 text-teal-600", group: "Shopping", keywords: ["shopping", "store", "mall", "shop"], broad: "other" },

  // Health
  { id: "health", name: "Health", Icon: HeartPulse, colorClass: "bg-rose-50 text-rose-600", group: "Health", keywords: ["doctor", "medicine", "pharmacy", "hospital", "health", "medical", "clinic", "dentist"], broad: "other" },
  { id: "insurance", name: "Insurance", Icon: ShieldCheck, colorClass: "bg-sky-50 text-sky-600", group: "Health", keywords: ["insurance", "premium", "claim"], broad: "other" },

  // Education
  { id: "education", name: "Education", Icon: GraduationCap, colorClass: "bg-blue-50 text-blue-600", group: "Education", keywords: ["education", "school", "college", "course", "book", "tuition", "class", "exam", "udemy", "coursera"], broad: "other" },

  // Trip
  { id: "trip", name: "Trip", Icon: Plane, colorClass: "bg-orange-50 text-orange-600", group: "Trip", keywords: ["trip", "travel", "hotel", "hostel", "airbnb", "vacation", "booking", "visa", "passport", "tour"], broad: "activity" },
  { id: "luggage", name: "Luggage", Icon: Luggage, colorClass: "bg-amber-50 text-amber-600", group: "Trip", keywords: ["luggage", "backpack", "souvenir"], broad: "activity" },

  // Other
  { id: "other", name: "Other", Icon: ClipboardList, colorClass: "bg-stone-50 text-stone-600", group: "Other", keywords: [], broad: "other" },
];

export function guessCategory(description: string): Category | null {
  const lower = description.toLowerCase().trim();
  if (!lower) return null;

  let bestMatch: Category | null = null;
  let bestScore = 0;

  for (const cat of CATEGORIES) {
    if (cat.id === "other") continue;
    for (const kw of cat.keywords) {
      if (lower.includes(kw)) {
        const score = kw.length;
        if (score > bestScore) {
          bestScore = score;
          bestMatch = cat;
        }
      }
    }
  }

  return bestMatch;
}

export const CATEGORY_GROUPS = [...new Set(CATEGORIES.map((c) => c.group))];
