// Request types for carousel operations
export interface CreateCarouselItemRequest {
  title: string;
  imageId: number;
  linkUrl: string;
  order?: number;
  isActive?: boolean;
}

export interface UpdateCarouselItemRequest {
  title?: string;
  imageId?: number;
  linkUrl?: string;
  order?: number;
  isActive?: boolean;
}

// Response transformed item
export interface TransformedCarouselItem {
  id: number;
  title: string;
  src: string;
  link: string;
}
