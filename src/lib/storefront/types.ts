export interface HeroSectionContent {
  slides: {
    id: number;
    src: string;
    alt: string;
  }[];
}

export interface CategorySectionContent {
  categories: {
    id: number;
    title: string;
    image: string;
    href: string;
  }[];
}

export interface PromoSectionContent {
  title: string;
  subtitle: string;
  description: string;
  image: string;
  link: string;
  linkText: string;
  secondaryLink: string;
  secondaryLinkText: string;
}

export interface TrendingSectionContent {
  trendingItems: {
    id: number;
    title: string;
    image: string;
    alt: string;
    badge: string;
    description: string;
  }[];
  editItems: {
    id: number;
    title: string;
    video: string;
    alt: string;
    badge: string;
    description: string;
    products: {
      name: string;
      price: string;
      image: string;
    }[];
  }[];
  editorialItems: {
    id: number;
    images: string;
    alt: string;
  }[];
}

export interface TrendingNowSectionContent {
  trendingItems: {
    id: number;
    title: string;
    image: string;
    alt: string;
    badge: string;
    description: string;
  }[];
}

export interface TheEditSectionContent {
  editItems: {
    id: number;
    title: string;
    video: string;
    alt: string;
    badge: string;
    description: string;
    products: {
      name: string;
      price: string;
      image: string;
    }[];
  }[];
}

export interface EditorialSectionContent {
  editorialItems: {
    id: number;
    images: string;
    alt: string;
  }[];
}

export interface VideoSectionContent {
  videos: {
    id: number;
    title: string;
    description: string;
    video: string;
    alt: string;
    badge: string;
    products: {
      name: string;
      price: string;
      image: string;
    }[];
  }[];
}

export interface NewArrivalsSectionContent {
  items: {
    id: number;
    title: string;
    image: string;
    alt: string;
    badge: string;
    description: string;
  }[];
}

export interface CuratedSectionContent {
  curatedItems: {
    id: number;
    title: string;
    image: string;
    alt: string;
    badge: string;
    description: string;
  }[];
}
