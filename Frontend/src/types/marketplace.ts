export interface MarketplaceResponse {
  id_marketplace: number;
  nombre: string;
  descripcion?: string | null;
  precio?: number | null;
  imagen_url?: string | null;
  estado?: string | null;
  id_empresa: number;
  id_categoria?: number | null;
  fecha_publicacion: string;
}

export type MarketplaceList = MarketplaceResponse[];
