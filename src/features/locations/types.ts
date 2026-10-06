export interface Location {
  id: string;
  name: string;
  notes?: string;
  createdAt: string;
}

export interface CreateLocationInput {
  id: string;
  name: string;
  notes?: string;
}