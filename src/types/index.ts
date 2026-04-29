export interface Artwork {
  id: string;
  title: string;
  artist: string;
  image_url: string | null;
  images: string[] | null;
  price: number | null;
  purchase_price: number | null;
  seller_name: string | null;
  buyer_name: string | null;
  purchase_date: string | null;
  sale_date: string | null;
  payment_received_date: string | null;
  status: string | null;
  on_consignment: boolean | null;
  commission_rate: number | null;
  location: string | null;
  description: string | null;
  tags: string[] | null;
  year: number | null;
  medium: string | null;
  dimensions: string | null;
  seller_contact: string | null;
  seller_document_type: string | null;
  buyer_contact: string | null;
  buyer_document_type: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
}

export interface ConsignedArtwork extends Artwork {
  consignment_start_date: string | null;
  consignment_end_date: string | null;
  consignment_fee: number | null;
  consignment_status: string;
}

export interface StockReport {
  totalArtworks: number;
  availableArtworks: number;
  soldArtworks: number;
  consignedArtworks: number;
  reservedArtworks: number;
  totalValue: number;
  availableValue: number;
  soldValue: number;
  consignmentValue: number;
  consignmentPercentage: number;
  topArtists: Array<{ name: string; count: number }>;
  topMediums: Array<{ name: string; count: number }>;
  recentAdditions: Array<{ title: string; artist: string; date: string }>;
}
