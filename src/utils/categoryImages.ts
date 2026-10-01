// High-resolution photography assets for student skills, categories, and campus services

export const CATEGORY_PHOTOS: Record<string, string> = {
  'PPT & Presentations': 'https://images.unsplash.com/photo-1557804506-669a67965ba0?w=800&auto=format&fit=crop&q=80',
  'Design & Graphics': 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&auto=format&fit=crop&q=80',
  'Video Editing': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&auto=format&fit=crop&q=80',
  'Web Development': 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=80',
  'Assignments & Academics': 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=800&auto=format&fit=crop&q=80',
  'Academic Support': 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&auto=format&fit=crop&q=80',
  'Resume & Career Help': 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=800&auto=format&fit=crop&q=80',
  'Data & Research': 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80',
  'Social Media': 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&auto=format&fit=crop&q=80',
  'Creative & Design': 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=800&auto=format&fit=crop&q=80',
  'Handmade & Crafts': 'https://images.unsplash.com/photo-1606744837616-56c9a5c6a6eb?w=800&auto=format&fit=crop&q=80',
  'Tech & Digital': 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=80',
  'Home Help': 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=800&auto=format&fit=crop&q=80',
  'Events': 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&auto=format&fit=crop&q=80',
  'Other': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&auto=format&fit=crop&q=80',
};

export const HERO_STUDENTS_BANNER = 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=1200&auto=format&fit=crop&q=85';

export const MASCOT_BANNER_IMAGE = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80';

export function getServicePhoto(category: string, index = 0): string {
  if (CATEGORY_PHOTOS[category]) return CATEGORY_PHOTOS[category];
  const list = Object.values(CATEGORY_PHOTOS);
  return list[index % list.length];
}
