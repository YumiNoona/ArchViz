// ═══════════════════════════════════════════════════════════════
//  PROJECTS CONFIG
//  ► Edit this file to add / edit / remove projects
//  ► Each project becomes one card on the website
//  ► streamURL: paste your Vagon Pixel Streaming link here
// ═══════════════════════════════════════════════════════════════

export type ProjectType =
  | "Residential"
  | "Commercial"
  | "Mixed-Use"
  | "Hospitality"
  | "Cultural";

export interface Project {
  id: string;           // unique slug, no spaces (used in URL + DB)
  title: string;        // card heading
  description: string;  // one-liner shown on card
  longDescription: string; // shown inside the launch modal
  image: string;        // path inside /public  e.g. "/projects/tower.jpg"
  streamURL: string;    // ← YOUR VAGON / pixel streaming URL
  type: ProjectType;    // filter category
  location: string;     // "City, Country"
  year: string;         // "2024"
  featured?: boolean;   // shows a "Featured" badge
}

// ──────────────────────────────────────────────────────────────
//  ADD YOUR PROJECTS BELOW
//  Duplicate one block, change the values, save — done.
// ──────────────────────────────────────────────────────────────
export const projects: Project[] = [
  {
    id: "luminara-tower",
    title: "Luminara Tower",
    description: "72-floor residential tower with sky gardens and panoramic city views",
    longDescription:
      "Experience the grandeur of this award-winning residential tower. Navigate through sky-high penthouses, explore rooftop infinity pools, and discover the vertical garden ecosystem.",
    image: "/projects/tower.jpg",
    streamURL: "https://vagon.io/stream/REPLACE_ME",
    type: "Residential",
    location: "Dubai, UAE",
    year: "2024",
    featured: true,
  },
  {
    id: "helix-pavilion",
    title: "Helix Pavilion",
    description: "Spiraling commercial complex where organic form meets urban density",
    longDescription:
      "A groundbreaking commercial development where organic form meets urban density. The double-helix structure creates dynamic interplay of public plazas and office environments.",
    image: "/projects/pavilion.jpg",
    streamURL: "https://vagon.io/stream/REPLACE_ME",
    type: "Commercial",
    location: "Singapore",
    year: "2024",
  },
  {
    id: "villa-solara",
    title: "Villa Solara",
    description: "Mediterranean private villa with integrated smart home systems",
    longDescription:
      "Wander through sun-drenched courtyards, explore seamless indoor-outdoor living, and see how passive solar design creates perfect climate comfort year-round.",
    image: "/projects/villa.jpg",
    streamURL: "https://vagon.io/stream/REPLACE_ME",
    type: "Residential",
    location: "Santorini, Greece",
    year: "2024",
  },
  {
    id: "nexus-district",
    title: "Nexus District",
    description: "Mixed-use urban development redefining city-centre living",
    longDescription:
      "A vertical city within a city. Nexus District integrates residential, commercial, and cultural spaces in a dynamic urban ecosystem.",
    image: "/projects/district.jpg",
    streamURL: "https://vagon.io/stream/REPLACE_ME",
    type: "Mixed-Use",
    location: "Amsterdam, Netherlands",
    year: "2025",
    featured: true,
  },
  {
    id: "aurora-resort",
    title: "Aurora Resort",
    description: "Luxury mountain resort designed to dissolve into the alpine landscape",
    longDescription:
      "A hospitality masterpiece that disappears into its natural setting. Explore heated pools with mountain vistas and a subterranean spa carved into bedrock.",
    image: "/projects/resort.jpg",
    streamURL: "https://vagon.io/stream/REPLACE_ME",
    type: "Hospitality",
    location: "Davos, Switzerland",
    year: "2025",
  },
  {
    id: "meridian-museum",
    title: "Meridian Museum",
    description: "Contemporary cultural institution with fully adaptive exhibition spaces",
    longDescription:
      "A museum designed to be as dynamic as the art it houses. Shifting walls, adjustable skylights, and programmable spatial sequences make every visit unique.",
    image: "/projects/museum.jpg",
    streamURL: "https://vagon.io/stream/REPLACE_ME",
    type: "Cultural",
    location: "Seoul, South Korea",
    year: "2025",
  },
];

// ──────────────────────────────────────────────────────────────
//  HOW TO ADD A NEW PROJECT
//
//  1. Copy the block below, paste it inside the array above
//  2. Fill in all fields
//  3. Save the file — the card appears automatically
//
//  {
//    id: "my-project",           ← unique, no spaces
//    title: "My Project Name",
//    description: "Short sentence for the card",
//    longDescription: "Longer text shown in the modal popup",
//    image: "/projects/my-image.jpg",   ← drop image in /public/projects/
//    streamURL: "https://vagon.io/stream/YOUR_ID",
//    type: "Residential",        ← one of the ProjectType values above
//    location: "City, Country",
//    year: "2025",
//    featured: false,
//  },
// ──────────────────────────────────────────────────────────────
