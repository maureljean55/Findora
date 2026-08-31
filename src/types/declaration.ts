export type DeclarationType = 'lost' | 'found';
export type DeclarationStatus = 'pending' | 'matched' | 'resolved' | 'archived';

export type Declaration = {
  id: string;
  type: DeclarationType;
  category: string;
  title: string;
  location: string | null;
  reward: string | null;
  status: DeclarationStatus;
  created_at: string;
};
