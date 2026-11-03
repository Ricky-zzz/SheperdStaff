/** Slug id of an animal type (see features/animalTypes). Free string for forward-compat. */
export type LivestockCategory = string;

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
  /** Inventory link (stock-backed feeding). */
  inventoryId?: string;
  /** Quantity consumed in the inventory item's unit (e.g. kg). */
  quantity?: number;
  unit?: string;
  unitCost?: number;
  /** Monetary cost of this feeding (quantity × unitCost at time of feeding). */
  cost?: number;
  notes?: string;
}

export interface Livestock {
  id: string;
  /** Human-readable unique code: Animal ID (individual) or Batch ID (group). Stable once created. */
  code: string;
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
