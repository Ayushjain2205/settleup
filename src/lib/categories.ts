export interface Category {
  id: string;
  name: string;
  icon: string;
  group: string;
  keywords: string[];
}

export const CATEGORIES: Category[] = [
  { id: "dining_out", name: "Dining out", icon: "🍽", group: "Food and drink", keywords: ["restaurant", "lunch", "dinner", "breakfast", "meal", "food", "eat", "cafe", "coffee", "tea", "brunch", "buffet", "takeout", "delivery", "zomato", "swiggy", "uber eats", "nasi", "mee", "roti", "rice"] },
  { id: "groceries", name: "Groceries", icon: "🛒", group: "Food and drink", keywords: ["grocery", "groceries", "supermarket", "vegetable", "fruit", "milk", "bread", "market", "kirana", "mart"] },
  { id: "liquor", name: "Liquor", icon: "🍷", group: "Food and drink", keywords: ["beer", "wine", "alcohol", "whiskey", "vodka", "drink", "bar", "pub", "cocktail", "bottle"] },
  { id: "other_food", name: "Other food", icon: "🍴", group: "Food and drink", keywords: ["snack", "water", "juice", "cold drink", "ice cream", "cake", "bakery"] },

  { id: "taxi", name: "Taxi", icon: "🚕", group: "Transportation", keywords: ["taxi", "cab", "uber", "ola", "ride", "auto", "rickshaw", " Grab"] },
  { id: "fuel", name: "Fuel", icon: "⛽", group: "Transportation", keywords: ["fuel", "petrol", "diesel", "gas station", "petrol pump", "petrol bunk"] },
  { id: "parking", name: "Parking", icon: "🅿", group: "Transportation", keywords: ["parking", "toll", "tollgate", "highway"] },
  { id: "public_transport", name: "Public transport", icon: "🚌", group: "Transportation", keywords: ["bus", "metro", "train", "flight", "airline", "ticket", "passenger", "airport", "station"] },
  { id: "car", name: "Car", icon: "🚗", group: "Transportation", keywords: ["car", "maintenance", "wash", "service", "insurance"] },
  { id: "other_transport", name: "Other transport", icon: "🚲", group: "Transportation", keywords: ["bike", "cycle", "scooter", "transport"] },

  { id: "rent", name: "Rent", icon: "🏠", group: "Home", keywords: ["rent", "house", "apartment", "flat", "pg", "mess", "lease"] },
  { id: "electricity", name: "Electricity", icon: "💡", group: "Home", keywords: ["electricity", "electric", "power", "bill", "light", "current"] },
  { id: "internet", name: "Internet", icon: "📶", group: "Home", keywords: ["internet", "wifi", "broadband", "jio", "airtel", "fiber", "data"] },
  { id: "water", name: "Water", icon: "💧", group: "Home", keywords: ["water", "tanker"] },
  { id: "gas", name: "Gas", icon: "🔥", group: "Home", keywords: ["gas", "cylinder", "lpg"] },
  { id: "other_home", name: "Other home", icon: "🏡", group: "Home", keywords: ["home", "maintenance", "repair", "furniture", "decor"] },

  { id: "movies", name: "Movies", icon: "🎬", group: "Entertainment", keywords: ["movie", "cinema", "film", "netflix", "theater", "theatre", "popcorn", "prime"] },
  { id: "games", name: "Games", icon: "🎮", group: "Entertainment", keywords: ["game", "gaming", "playstation", "xbox", "nintendo", "steam", "console"] },
  { id: "music", name: "Music", icon: "🎵", group: "Entertainment", keywords: ["music", "concert", "spotify", "gig", "album"] },
  { id: "sports", name: "Sports", icon: "⚽", group: "Entertainment", keywords: ["sport", "cricket", "football", "tennis", "match", "stadium", "gym", "fitness"] },
  { id: "other_entertainment", name: "Other entertainment", icon: "🎲", group: "Entertainment", keywords: ["fun", "hangout", "party", "club", "event"] },

  { id: "clothing", name: "Clothing", icon: "👕", group: "Shopping", keywords: ["clothes", "clothing", "shirt", "pants", "shoes", "fashion", "zara", "h&m", "nike", "adidas"] },
  { id: "electronics", name: "Electronics", icon: "📱", group: "Shopping", keywords: ["phone", "laptop", "charger", "cable", "headphones", "earbuds", "camera", "gadget"] },
  { id: "gifts", name: "Gifts", icon: "🎁", group: "Shopping", keywords: ["gift", "present", "birthday", "anniversary", "wedding"] },
  { id: "other_shopping", name: "Other shopping", icon: "🛍", group: "Shopping", keywords: ["shopping", "store", "mall", "shop"] },

  { id: "health", name: "Health", icon: "🏥", group: "Health", keywords: ["doctor", "medicine", "pharmacy", "hospital", "health", "medical", "clinic", "dentist"] },
  { id: "insurance", name: "Insurance", icon: "🛡", group: "Health", keywords: ["insurance", "policy", "premium", "claim"] },
  { id: "other_health", name: "Other health", icon: "💊", group: "Health", keywords: ["health", "wellness", "supplement"] },

  { id: "education", name: "Education", icon: "📚", group: "Education", keywords: ["education", "school", "college", "course", "book", "tuition", "class", "exam", "udemy", "coursera"] },
  { id: "other_education", name: "Other education", icon: "🎓", group: "Education", keywords: ["training", "workshop", "seminar"] },

  { id: "trip", name: "Trip", icon: "✈", group: "Trip", keywords: ["trip", "travel", "hotel", "hostel", "airbnb", "vacation", "booking", "visa", "passport", "tour"] },
  { id: "other_trip", name: "Other trip", icon: "🗺", group: "Trip", keywords: ["luggage", "backpack", "souvenir"] },

  { id: "other", name: "Other", icon: "📋", group: "Other", keywords: [] },
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
