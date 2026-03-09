export type ProjectType = "Residential" | "Commercial" | "Mixed-Use" | "Hospitality" | "Cultural";

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription: string;
  image: string;
  streamURL: string;
  type: ProjectType;
  location: string;
  year: string;
  featured?: boolean;
}

export const projects: Project[] = [
  {
    id: "luminara-tower",
    title: "Luminara Tower",
    description: "A 72-floor residential tower with panoramic city views and sky gardens",
    longDescription: "Experience the grandeur of this award-winning residential tower. Navigate through sky-high penthouses, explore rooftop infinity pools, and discover the vertical garden ecosystem that defines modern luxury living.",
    image: "/projects/tower.jpg",
    streamURL: "https://vagon.io/stream/YOUR_STREAM_ID_1",
    type: "Residential",
    location: "Dubai, UAE",
    year: "2024",
    featured: true,
  },
  {
    id: "helix-pavilion",
    title: "Helix Pavilion",
    description: "A spiraling commercial complex merging nature and urban architecture",
    longDescription: "A groundbreaking commercial development where organic form meets urban density. The double-helix structure creates a dynamic interplay of public plazas, retail terraces, and office environments.",
    image: "/projects/pavilion.jpg",
    streamURL: "https://vagon.io/stream/YOUR_STREAM_ID_2",
    type: "Commercial",
    location: "Singapore",
    year: "2024",
  },
  {
    id: "villa-solara",
    title: "Villa Solara",
    description: "Mediterranean-inspired private villa with integrated smart home systems",
    longDescription: "Wander through sun-drenched courtyards, explore the seamless indoor-outdoor living spaces, and experience how passive solar design creates perfect climate comfort throughout the seasons.",
    image: "/projects/villa.jpg",
    streamURL: "https://vagon.io/stream/YOUR_STREAM_ID_3",
    type: "Residential",
    location: "Santorini, Greece",
    year: "2024",
  },
  {
    id: "nexus-district",
    title: "Nexus District",
    description: "A mixed-use urban development redefining city-center living",
    longDescription: "A vertical city within a city. Nexus District integrates residential, commercial, and cultural spaces in a dynamic urban ecosystem designed for the way people actually live, work, and connect.",
    image: "/projects/district.jpg",
    streamURL: "https://vagon.io/stream/YOUR_STREAM_ID_4",
    type: "Mixed-Use",
    location: "Amsterdam, Netherlands",
    year: "2025",
    featured: true,
  },
  {
    id: "aurora-resort",
    title: "Aurora Resort",
    description: "Luxury mountain resort designed to vanish into the alpine landscape",
    longDescription: "A hospitality masterpiece that dissolves into its natural setting. Explore the heated outdoor pools with mountain vistas, the subterranean spa carved into bedrock, and 200 individually crafted suites.",
    image: "/projects/resort.jpg",
    streamURL: "https://vagon.io/stream/YOUR_STREAM_ID_5",
    type: "Hospitality",
    location: "Davos, Switzerland",
    year: "2025",
  },
  {
    id: "meridian-museum",
    title: "Meridian Museum",
    description: "Contemporary cultural institution with adaptive exhibition spaces",
    longDescription: "A museum designed to be as dynamic as the art it houses. The flexible interior system allows the building itself to transform — shifting walls, adjustable skylights, and programmable spatial sequences.",
    image: "/projects/museum.jpg",
    streamURL: "https://vagon.io/stream/YOUR_STREAM_ID_6",
    type: "Cultural",
    location: "Seoul, South Korea",
    year: "2025",
  },
];
