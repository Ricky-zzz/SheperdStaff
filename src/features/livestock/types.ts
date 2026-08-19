export type LivestockCategory = 'cattle' | 'pig' | 'chicken' | 'goat' | 'sheep' | 'duck' | 'other';

export type LivestockStatus = 'growing' | 'breeding' | 'for_sale' | 'sold' | 'deceased' | 'active';

export type LivestockType = 'individual' | 'group';

export type HealthNoteType = 'illness' | 'treatment' | 'vaccination' | 'observation';

export interface HealthNote {
  id: string;
  date: string;
  note: string;
  type: HealthNoteType;
}

export interface FeedingRecord {
  id: string;
  date: string;
  feedType: string;
  amount: string;
  notes?: string;
}

export interface Livestock {
  id: string;
  name: string;
  category: LivestockCategory;
  type: LivestockType;
  quantity: number;
  breed?: string;
  sex?: 'male' | 'female' | 'mixed';
  startDate: string;
  location: string;
  purpose: string;
  status: LivestockStatus;
  healthNotes: HealthNote[];
  feedings: FeedingRecord[];
  expenseIds: string[];
  notes?: string;
  imageUrl?: string;
}

export interface Pen {
  id: string;
  name: string;
  location: string;
  capacity: number;
  livestockIds: string[];
  notes?: string;
}
