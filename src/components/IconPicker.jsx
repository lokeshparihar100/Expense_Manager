import React, { useState, useMemo } from 'react';

// Emoji icons organized by category with searchable keywords
const ICON_DATA = {
  'Shopping': [
    { icon: '🛍️', keywords: ['shopping', 'bag', 'retail', 'store', 'buy'] },
    { icon: '🛒', keywords: ['cart', 'grocery', 'supermarket', 'shopping'] },
    { icon: '👗', keywords: ['dress', 'clothing', 'fashion', 'clothes'] },
    { icon: '👠', keywords: ['shoes', 'heels', 'footwear', 'fashion'] },
    { icon: '👜', keywords: ['bag', 'purse', 'handbag', 'fashion'] },
    { icon: '💄', keywords: ['makeup', 'cosmetics', 'beauty', 'lipstick'] },
    { icon: '🎁', keywords: ['gift', 'present', 'birthday', 'surprise'] },
    { icon: '📦', keywords: ['package', 'delivery', 'box', 'amazon', 'order'] },
    { icon: '🏪', keywords: ['store', 'shop', 'convenience', 'mart'] },
    { icon: '🏬', keywords: ['mall', 'department', 'store', 'shopping'] },
  ],
  'Food & Drink': [
    { icon: '🍔', keywords: ['burger', 'food', 'fast food', 'meal', 'mcdonalds'] },
    { icon: '🍕', keywords: ['pizza', 'food', 'italian', 'dominos'] },
    { icon: '🍜', keywords: ['noodles', 'ramen', 'asian', 'food', 'soup'] },
    { icon: '🍱', keywords: ['bento', 'japanese', 'lunch', 'food'] },
    { icon: '🍳', keywords: ['breakfast', 'eggs', 'cooking', 'food'] },
    { icon: '☕', keywords: ['coffee', 'cafe', 'starbucks', 'drink', 'tea'] },
    { icon: '🍺', keywords: ['beer', 'alcohol', 'bar', 'drink', 'pub'] },
    { icon: '🍷', keywords: ['wine', 'alcohol', 'drink', 'dinner'] },
    { icon: '🥗', keywords: ['salad', 'healthy', 'food', 'vegetable'] },
    { icon: '🍰', keywords: ['cake', 'dessert', 'sweet', 'bakery', 'birthday'] },
    { icon: '🍦', keywords: ['ice cream', 'dessert', 'sweet', 'cold'] },
    { icon: '🥤', keywords: ['drink', 'soda', 'juice', 'beverage'] },
  ],
  'Transport': [
    { icon: '🚗', keywords: ['car', 'drive', 'vehicle', 'auto', 'transport'] },
    { icon: '🚕', keywords: ['taxi', 'cab', 'uber', 'lyft', 'ride'] },
    { icon: '🚌', keywords: ['bus', 'public', 'transport', 'transit'] },
    { icon: '🚇', keywords: ['metro', 'subway', 'train', 'underground'] },
    { icon: '✈️', keywords: ['plane', 'flight', 'travel', 'airport', 'airline'] },
    { icon: '🚲', keywords: ['bike', 'bicycle', 'cycle', 'cycling'] },
    { icon: '⛽', keywords: ['gas', 'fuel', 'petrol', 'station'] },
    { icon: '🚁', keywords: ['helicopter', 'flight', 'air'] },
    { icon: '🛵', keywords: ['scooter', 'moped', 'bike', 'motorcycle'] },
    { icon: '🚂', keywords: ['train', 'railway', 'rail', 'transport'] },
    { icon: '🚢', keywords: ['ship', 'boat', 'cruise', 'ferry'] },
    { icon: '🅿️', keywords: ['parking', 'park', 'car'] },
  ],
  'Health': [
    { icon: '🏥', keywords: ['hospital', 'medical', 'health', 'doctor', 'healthcare'] },
    { icon: '💊', keywords: ['medicine', 'pills', 'pharmacy', 'drug', 'prescription'] },
    { icon: '💉', keywords: ['injection', 'vaccine', 'shot', 'medical'] },
    { icon: '🩺', keywords: ['doctor', 'checkup', 'medical', 'stethoscope'] },
    { icon: '🏋️', keywords: ['gym', 'fitness', 'exercise', 'workout', 'weights'] },
    { icon: '🧘', keywords: ['yoga', 'meditation', 'wellness', 'fitness'] },
    { icon: '❤️', keywords: ['heart', 'health', 'love', 'care'] },
    { icon: '🦷', keywords: ['dental', 'dentist', 'teeth', 'tooth'] },
    { icon: '👁️', keywords: ['eye', 'vision', 'optical', 'glasses'] },
    { icon: '🧠', keywords: ['brain', 'mental', 'psychology', 'therapy'] },
  ],
  'Entertainment': [
    { icon: '🎬', keywords: ['movie', 'film', 'cinema', 'theater', 'netflix'] },
    { icon: '🎮', keywords: ['game', 'gaming', 'video game', 'playstation', 'xbox'] },
    { icon: '🎵', keywords: ['music', 'spotify', 'concert', 'song'] },
    { icon: '🎭', keywords: ['theater', 'drama', 'show', 'performance'] },
    { icon: '🎨', keywords: ['art', 'painting', 'creative', 'museum'] },
    { icon: '📚', keywords: ['book', 'reading', 'library', 'education'] },
    { icon: '🎪', keywords: ['circus', 'carnival', 'fair', 'fun'] },
    { icon: '🎯', keywords: ['target', 'goal', 'game', 'darts'] },
    { icon: '🎲', keywords: ['dice', 'game', 'gambling', 'casino'] },
    { icon: '🎤', keywords: ['karaoke', 'singing', 'microphone', 'concert'] },
    { icon: '📺', keywords: ['tv', 'television', 'streaming', 'watch'] },
  ],
  'Finance': [
    { icon: '💰', keywords: ['money', 'cash', 'savings', 'wealth', 'loan'] },
    { icon: '💵', keywords: ['dollar', 'cash', 'money', 'salary', 'income'] },
    { icon: '💳', keywords: ['card', 'credit', 'debit', 'payment', 'visa', 'mastercard'] },
    { icon: '🏦', keywords: ['bank', 'banking', 'finance', 'transfer'] },
    { icon: '📈', keywords: ['investment', 'stocks', 'growth', 'trading'] },
    { icon: '💎', keywords: ['diamond', 'jewelry', 'luxury', 'valuable'] },
    { icon: '🪙', keywords: ['coin', 'money', 'currency', 'bitcoin'] },
    { icon: '💸', keywords: ['spending', 'expense', 'money', 'flying'] },
    { icon: '🧾', keywords: ['receipt', 'bill', 'invoice', 'payment'] },
    { icon: '📊', keywords: ['chart', 'report', 'statistics', 'analysis'] },
  ],
  'Home': [
    { icon: '🏠', keywords: ['home', 'house', 'rent', 'mortgage', 'property'] },
    { icon: '🏡', keywords: ['house', 'home', 'property', 'garden'] },
    { icon: '🛋️', keywords: ['furniture', 'sofa', 'living room', 'couch'] },
    { icon: '🛏️', keywords: ['bed', 'bedroom', 'furniture', 'sleep'] },
    { icon: '🚿', keywords: ['shower', 'bathroom', 'water', 'utilities'] },
    { icon: '💡', keywords: ['light', 'electricity', 'utilities', 'power', 'bulb'] },
    { icon: '🔧', keywords: ['repair', 'maintenance', 'tools', 'fix'] },
    { icon: '🧹', keywords: ['cleaning', 'housekeeping', 'maid', 'clean'] },
    { icon: '🌳', keywords: ['garden', 'yard', 'landscaping', 'tree'] },
    { icon: '🔑', keywords: ['key', 'rent', 'property', 'lock'] },
    { icon: '📺', keywords: ['tv', 'cable', 'entertainment', 'television'] },
    { icon: '📶', keywords: ['wifi', 'internet', 'network', 'broadband'] },
  ],
  'Work': [
    { icon: '💼', keywords: ['business', 'work', 'office', 'job', 'professional'] },
    { icon: '💻', keywords: ['computer', 'laptop', 'tech', 'work', 'software'] },
    { icon: '📱', keywords: ['phone', 'mobile', 'smartphone', 'cell'] },
    { icon: '✏️', keywords: ['pencil', 'writing', 'office', 'supplies'] },
    { icon: '📝', keywords: ['note', 'memo', 'document', 'writing'] },
    { icon: '📧', keywords: ['email', 'mail', 'communication', 'message'] },
    { icon: '🖨️', keywords: ['printer', 'print', 'office', 'paper'] },
    { icon: '📎', keywords: ['paperclip', 'office', 'supplies', 'attachment'] },
    { icon: '📅', keywords: ['calendar', 'schedule', 'date', 'planning'] },
    { icon: '🎓', keywords: ['education', 'graduation', 'school', 'college', 'university'] },
  ],
  'People': [
    { icon: '👤', keywords: ['person', 'user', 'individual', 'profile'] },
    { icon: '👥', keywords: ['people', 'group', 'team', 'users'] },
    { icon: '👨‍💼', keywords: ['businessman', 'office', 'professional', 'man'] },
    { icon: '👩‍💼', keywords: ['businesswoman', 'office', 'professional', 'woman'] },
    { icon: '🧑‍🔧', keywords: ['mechanic', 'technician', 'repair', 'worker'] },
    { icon: '👨‍⚕️', keywords: ['doctor', 'medical', 'physician', 'health'] },
    { icon: '👩‍🍳', keywords: ['chef', 'cook', 'restaurant', 'food'] },
    { icon: '🧑‍💻', keywords: ['developer', 'programmer', 'tech', 'computer'] },
    { icon: '👷', keywords: ['construction', 'worker', 'builder', 'labor'] },
    { icon: '🛎️', keywords: ['service', 'hotel', 'bell', 'concierge'] },
  ],
  'Insurance & Bills': [
    { icon: '🛡️', keywords: ['insurance', 'protection', 'shield', 'security', 'policy'] },
    { icon: '📋', keywords: ['policy', 'document', 'contract', 'insurance'] },
    { icon: '🏥', keywords: ['health insurance', 'medical', 'hospital'] },
    { icon: '🚗', keywords: ['car insurance', 'auto', 'vehicle'] },
    { icon: '🏠', keywords: ['home insurance', 'property', 'house'] },
    { icon: '📄', keywords: ['bill', 'invoice', 'statement', 'document'] },
    { icon: '💧', keywords: ['water', 'utility', 'bill', 'utilities'] },
    { icon: '🔥', keywords: ['gas', 'heating', 'utility', 'fire'] },
  ],
  'Other': [
    { icon: '⭐', keywords: ['star', 'favorite', 'special', 'rating'] },
    { icon: '❓', keywords: ['question', 'unknown', 'other', 'misc'] },
    { icon: '🔔', keywords: ['notification', 'alert', 'bell', 'reminder'] },
    { icon: '📌', keywords: ['pin', 'location', 'important', 'mark'] },
    { icon: '🏷️', keywords: ['tag', 'label', 'price', 'sale'] },
    { icon: '✅', keywords: ['done', 'complete', 'check', 'success'] },
    { icon: '❌', keywords: ['cancel', 'no', 'wrong', 'delete'] },
    { icon: '⚡', keywords: ['electricity', 'power', 'fast', 'energy'] },
    { icon: '🔥', keywords: ['fire', 'hot', 'trending', 'popular'] },
    { icon: '💯', keywords: ['hundred', 'perfect', 'score', 'complete'] },
    { icon: '📦', keywords: ['box', 'package', 'delivery', 'other'] },
  ]
};

// Flatten all icons with their keywords for search
const ALL_ICONS_WITH_KEYWORDS = Object.entries(ICON_DATA).flatMap(([category, icons]) =>
  icons.map(item => ({ ...item, category }))
);

// Get just the icon categories for display
const ICON_CATEGORIES = Object.fromEntries(
  Object.entries(ICON_DATA).map(([category, icons]) => [category, icons.map(i => i.icon)])
);

// Smart icon suggestion based on text
export const suggestIconForText = (text) => {
  if (!text) return '📦';
  
  const lowerText = text.toLowerCase();
  
  // Check for exact or partial matches in keywords
  for (const item of ALL_ICONS_WITH_KEYWORDS) {
    for (const keyword of item.keywords) {
      if (lowerText.includes(keyword) || keyword.includes(lowerText)) {
        return item.icon;
      }
    }
  }
  
  // Common word mappings
  const wordMap = {
    'amazon': '📦', 'flipkart': '📦', 'ebay': '📦',
    'uber': '🚕', 'lyft': '🚕', 'ola': '🚕',
    'swiggy': '🍔', 'zomato': '🍔', 'doordash': '🍔', 'ubereats': '🍔',
    'netflix': '🎬', 'prime': '🎬', 'disney': '🎬', 'hulu': '🎬',
    'spotify': '🎵', 'apple music': '🎵',
    'starbucks': '☕', 'coffee': '☕', 'cafe': '☕',
    'grocery': '🛒', 'walmart': '🛒', 'target': '🛒', 'costco': '🛒',
    'gas': '⛽', 'petrol': '⛽', 'fuel': '⛽',
    'electric': '💡', 'power': '💡', 'utility': '💡',
    'water': '💧', 'internet': '📶', 'wifi': '📶',
    'rent': '🏠', 'mortgage': '🏠',
    'salary': '💵', 'income': '💵', 'paycheck': '💵',
    'doctor': '🏥', 'hospital': '🏥', 'medical': '🏥', 'pharmacy': '💊',
    'gym': '🏋️', 'fitness': '🏋️',
    'insurance': '🛡️', 'policy': '🛡️',
    'loan': '💰', 'emi': '💰', 'credit': '💳',
    'shop': '🛍️', 'store': '🏪', 'mall': '🏬',
    'food': '🍔', 'restaurant': '🍽️', 'dinner': '🍽️', 'lunch': '🍱',
    'travel': '✈️', 'flight': '✈️', 'hotel': '🏨',
    'education': '🎓', 'school': '🎓', 'college': '🎓', 'tuition': '🎓',
    'book': '📚', 'subscription': '📱',
    'cash': '💵', 'atm': '🏦', 'bank': '🏦',
    'transfer': '🏦', 'upi': '📱',
    'other': '📦', 'misc': '📦', 'miscellaneous': '📦'
  };
  
  for (const [word, icon] of Object.entries(wordMap)) {
    if (lowerText.includes(word)) {
      return icon;
    }
  }
  
  return '📦';
};

const IconPicker = ({ selectedIcon, onSelect, onClose }) => {
  const [activeCategory, setActiveCategory] = useState('Shopping');
  const [searchQuery, setSearchQuery] = useState('');

  // Search icons by keywords
  const filteredIcons = useMemo(() => {
    if (!searchQuery.trim()) {
      return ICON_CATEGORIES[activeCategory] || [];
    }
    
    const query = searchQuery.toLowerCase().trim();
    const matches = ALL_ICONS_WITH_KEYWORDS.filter(item =>
      item.keywords.some(keyword => keyword.includes(query)) ||
      item.category.toLowerCase().includes(query)
    );
    
    // Return unique icons
    return [...new Set(matches.map(m => m.icon))];
  }, [searchQuery, activeCategory]);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search icons..."
          className="w-full px-4 py-2 pl-10 rounded-lg border border-gray-200 focus:border-primary-500 focus:ring-2 focus:ring-primary-200"
        />
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex overflow-x-auto gap-2 pb-2 -mx-2 px-2 scrollbar-hide">
          {Object.keys(ICON_CATEGORIES).map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-3 py-1.5 text-xs rounded-lg whitespace-nowrap transition-all ${
                activeCategory === category
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      )}

      {/* Icons Grid */}
      <div className="grid grid-cols-8 gap-2 max-h-48 overflow-y-auto">
        {filteredIcons.length === 0 ? (
          <div className="col-span-8 text-center py-4 text-gray-500 text-sm">
            No icons found for "{searchQuery}"
          </div>
        ) : (
          filteredIcons.map((icon, index) => (
            <button
              key={`${icon}-${index}`}
              onClick={() => onSelect(icon)}
              className={`w-10 h-10 flex items-center justify-center text-xl rounded-lg transition-all ${
                selectedIcon === icon
                  ? 'bg-primary-100 ring-2 ring-primary-500'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              {icon}
            </button>
          ))
        )}
      </div>

      {/* Selected Icon Preview */}
      {selectedIcon && (
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-sm text-gray-500">Selected:</span>
          <span className="text-2xl">{selectedIcon}</span>
        </div>
      )}
    </div>
  );
};

export const ICON_CATEGORIES_FLAT = Object.values(ICON_CATEGORIES).flat();

export default IconPicker;
