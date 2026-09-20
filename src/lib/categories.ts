export interface Category {
  id: string;
  name: string;
  svgPath: string;
  colorClass: string;
  group: string;
  keywords: string[];
  /** Maps back to the broad category used in Expense["category"] */
  broad: "food" | "transport" | "activity" | "accommodation" | "other";
}

export const CATEGORIES: Category[] = [
  // Food and drink
  { id: "dining_out", name: "Dining out", svgPath: "M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 11-6.9 0l-1.5-.75M3.75 15h.008v.008H3.75V15zm0 0h.008v.008H3.75V15z", colorClass: "bg-orange-50 text-orange-600", group: "Food and drink", keywords: ["restaurant", "lunch", "dinner", "breakfast", "meal", "food", "eat", "cafe", "coffee", "tea", "brunch", "buffet", "takeout", "delivery", "zomato", "swiggy", "nasi", "mee", "roti", "rice"], broad: "food" },
  { id: "groceries", name: "Groceries", svgPath: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z", colorClass: "bg-green-50 text-green-600", group: "Food and drink", keywords: ["grocery", "groceries", "supermarket", "vegetable", "fruit", "milk", "bread", "market", "kirana", "mart"], broad: "food" },
  { id: "liquor", name: "Liquor", svgPath: "M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z", colorClass: "bg-rose-50 text-rose-600", group: "Food and drink", keywords: ["beer", "wine", "alcohol", "whiskey", "vodka", "drink", "bar", "pub", "cocktail", "bottle"], broad: "food" },
  { id: "other_food", name: "Other food", svgPath: "M12 8.25v-1.5m0 1.5c-1.355 0-2.697.056-4.024.166C6.845 8.51 6 9.473 6 10.608v2.513m6-4.87c1.355 0 2.697.055 4.024.165C17.155 8.51 18 9.473 18 10.608v2.513m-3-4.87v-1.5m-6 1.5v-1.5m12 9.75l-1.5.75a3.354 3.354 0 11-6.9 0l-1.5-.75M3.75 15h.008v.008H3.75V15zm0 0h.008v.008H3.75V15z", colorClass: "bg-orange-50 text-orange-600", group: "Food and drink", keywords: ["snack", "water", "juice", "cold drink", "ice cream", "cake", "bakery"], broad: "food" },

  // Transportation
  { id: "taxi", name: "Taxi", svgPath: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12", colorClass: "bg-blue-50 text-blue-600", group: "Transportation", keywords: ["taxi", "cab", "uber", "ola", "ride", "auto", "rickshaw", "grab"], broad: "transport" },
  { id: "fuel", name: "Fuel", svgPath: "M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z", colorClass: "bg-amber-50 text-amber-600", group: "Transportation", keywords: ["fuel", "petrol", "diesel", "gas station", "petrol pump"], broad: "transport" },
  { id: "public_transport", name: "Public transport", svgPath: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12", colorClass: "bg-sky-50 text-sky-600", group: "Transportation", keywords: ["bus", "metro", "train", "flight", "airline", "airport", "station"], broad: "transport" },
  { id: "other_transport", name: "Other transport", svgPath: "M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 00-3.213-9.193 2.056 2.056 0 00-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 00-10.026 0 1.106 1.106 0 00-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12", colorClass: "bg-indigo-50 text-indigo-600", group: "Transportation", keywords: ["parking", "toll", "bike", "cycle", "scooter", "transport"], broad: "transport" },

  // Activity / Entertainment
  { id: "movies", name: "Movies", svgPath: "M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 01-1.125-1.125M3.375 19.5h1.5C5.496 19.5 6 18.996 6 18.375m-3.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-1.5A1.125 1.125 0 0118 18.375M20.625 4.5H3.375m17.25 0c.621 0 1.125.504 1.125 1.125M20.625 4.5h-1.5C18.504 4.5 18 5.004 18 5.625m3.75 0v1.5c0 .621-.504 1.125-1.125 1.125M3.375 4.5c-.621 0-1.125.504-1.125 1.125M3.375 4.5h1.5C5.496 4.5 6 5.004 6 5.625m-3.75 0v1.5c0 .621.504 1.125 1.125 1.125m0 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125m1.5-3.75C5.496 8.25 6 7.746 6 7.125v-1.5M4.875 8.25C5.496 8.25 6 8.754 6 9.375v1.5c0 .621.504 1.125 1.125 1.125m1.5 0h1.5m-1.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M6 7.125v-1.5c0-.621.504-1.125-1.125-1.125M6 7.125C6 6.504 5.496 6 4.875 6M17.25 9.375c0 .621-.504 1.125-1.125 1.125M17.25 9.375c0 .621.504 1.125 1.125 1.125m-2.25 0c.621 0 1.125.504 1.125 1.125m-12 5.25v-1.5c0-.621.504-1.125 1.125-1.125m10.5 3.75c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-10.5 0v-1.5c0-.621.504-1.125 1.125-1.125m10.5 0h1.5m-10.5 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125M19.125 12h1.5m0 0c.621 0 1.125.504 1.125 1.125v1.5c0 .621-.504 1.125-1.125 1.125m-17.25 0h1.5m14.25 0h1.5M4.875 12h1.5", colorClass: "bg-purple-50 text-purple-600", group: "Entertainment", keywords: ["movie", "cinema", "film", "netflix", "theater", "theatre", "popcorn", "prime"], broad: "activity" },
  { id: "games", name: "Games", svgPath: "M14.25 6.087c0-.355.186-.676.401-.959.221-.29.349-.634.349-1.003 0-1.036-1.007-1.875-2.25-1.875s-2.25.84-2.25 1.875c0 .369.128.713.349 1.003.215.283.401.604.401.959V6a.75.75 0 01-.75.75H4.875a1.125 1.125 0 00-1.125 1.125v9.75c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V7.125A1.125 1.125 0 0014.625 6h-.375z", colorClass: "bg-violet-50 text-violet-600", group: "Entertainment", keywords: ["game", "gaming", "playstation", "xbox", "nintendo", "steam", "console"], broad: "activity" },
  { id: "sports", name: "Sports", svgPath: "M21 12a9 9 0 11-18 0 9 9 0 0118 0z", colorClass: "bg-emerald-50 text-emerald-600", group: "Entertainment", keywords: ["sport", "cricket", "football", "tennis", "match", "stadium", "gym", "fitness"], broad: "activity" },
  { id: "other_entertainment", name: "Other entertainment", svgPath: "M15.182 15.182a4.5 4.5 0 01-6.364 0M21 12a9 9 0 11-18 0 9 9 0 0118 0zM9.75 9.75c0 .414-.168.75-.375.75S9 10.164 9 9.75 9.168 9 9.375 9s.375.336.375.75zm-.375 0h.008v.015h-.008V9.75zm5.625 0c0 .414-.168.75-.375.75s-.375-.336-.375-.75.168-.75.375-.75.375.336.375.75zm-.375 0h.008v.015h-.008V9.75z", colorClass: "bg-pink-50 text-pink-600", group: "Entertainment", keywords: ["fun", "hangout", "party", "club", "event"], broad: "activity" },

  // Home / Accommodation
  { id: "rent", name: "Rent", svgPath: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25", colorClass: "bg-green-50 text-green-600", group: "Home", keywords: ["rent", "house", "apartment", "flat", "pg", "mess", "lease"], broad: "accommodation" },
  { id: "electricity", name: "Electricity", svgPath: "M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z", colorClass: "bg-yellow-50 text-yellow-600", group: "Home", keywords: ["electricity", "electric", "power", "bill", "light", "current"], broad: "accommodation" },
  { id: "internet", name: "Internet", svgPath: "M12 21a8.966 8.966 0 01-5.982-2.275M12 21a8.966 8.966 0 005.982-2.275M12 21V3m0 18c-2.5 0-4.5-1.5-6-4m12 4c2.5 0 4.5-1.5 6-4M12 3c-2.5 0-4.5 1.5-6 4m12-4c2.5 0 4.5 1.5 6 4", colorClass: "bg-cyan-50 text-cyan-600", group: "Home", keywords: ["internet", "wifi", "broadband", "jio", "airtel", "fiber", "data"], broad: "accommodation" },
  { id: "other_home", name: "Other home", svgPath: "M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25", colorClass: "bg-lime-50 text-lime-600", group: "Home", keywords: ["home", "maintenance", "repair", "furniture", "water", "gas"], broad: "accommodation" },

  // Shopping
  { id: "clothing", name: "Clothing", svgPath: "M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z", colorClass: "bg-fuchsia-50 text-fuchsia-600", group: "Shopping", keywords: ["clothes", "clothing", "shirt", "pants", "shoes", "fashion"], broad: "other" },
  { id: "electronics", name: "Electronics", svgPath: "M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3", colorClass: "bg-slate-50 text-slate-600", group: "Shopping", keywords: ["phone", "laptop", "charger", "cable", "headphones", "gadget"], broad: "other" },
  { id: "gifts", name: "Gifts", svgPath: "M21 11.25v8.25a1.5 1.5 0 01-1.5 1.5H5.25a1.5 1.5 0 01-1.5-1.5v-8.25M12 4.875A2.625 2.625 0 109.375 7.5H12m0-2.625V7.5m0-2.625A2.625 2.625 0 1114.625 7.5H12m0 0V21m-8.625-9.75h18c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125h-18c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z", colorClass: "bg-red-50 text-red-600", group: "Shopping", keywords: ["gift", "present", "birthday", "anniversary", "wedding"], broad: "other" },
  { id: "other_shopping", name: "Other shopping", svgPath: "M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z", colorClass: "bg-teal-50 text-teal-600", group: "Shopping", keywords: ["shopping", "store", "mall", "shop"], broad: "other" },

  // Health
  { id: "health", name: "Health", svgPath: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z", colorClass: "bg-rose-50 text-rose-600", group: "Health", keywords: ["doctor", "medicine", "pharmacy", "hospital", "health", "medical", "clinic", "dentist"], broad: "other" },
  { id: "other_health", name: "Other health", svgPath: "M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z", colorClass: "bg-pink-50 text-pink-600", group: "Health", keywords: ["insurance", "premium", "supplement", "wellness"], broad: "other" },

  // Education
  { id: "education", name: "Education", svgPath: "M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5", colorClass: "bg-blue-50 text-blue-600", group: "Education", keywords: ["education", "school", "college", "course", "book", "tuition", "class", "exam"], broad: "other" },

  // Trip
  { id: "trip", name: "Trip", svgPath: "M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5", colorClass: "bg-orange-50 text-orange-600", group: "Trip", keywords: ["trip", "travel", "hotel", "hostel", "airbnb", "vacation", "booking", "visa", "passport", "tour"], broad: "activity" },
  { id: "other_trip", name: "Other trip", svgPath: "M9 6.75V15m6-6v8.25m.503 3.973l1.068-1.068m-3.354-.402l3.354.402m0 0l-3.354.402M6 12.75l3.354-.402m0 0l3.354.402", colorClass: "bg-amber-50 text-amber-600", group: "Trip", keywords: ["luggage", "backpack", "souvenir", "sightseeing"], broad: "activity" },

  // Other
  { id: "other", name: "Other", svgPath: "M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5m6 4.125l2.25 2.25m0 0l2.25 2.25M12 13.875l2.25-2.25M12 13.875l-2.25 2.25M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z", colorClass: "bg-stone-50 text-stone-600", group: "Other", keywords: [], broad: "other" },
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
