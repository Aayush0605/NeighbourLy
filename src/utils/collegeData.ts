export interface CollegeInfo {
  id: string;
  name: string;
  shortCode?: string;
  city: string;
  state: string;
  type?: 'Engineering' | 'Management' | 'Medical' | 'Arts & Science' | 'University';
}

export const COLLEGES_DATABASE: CollegeInfo[] = [
  // --- Ludhiana & Punjab ---
  {
    id: 'pcte-ludhiana',
    name: 'PCTE Group of Institutes, Ludhiana (PCTE Ludhiana)',
    shortCode: 'PCTE',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'Management',
  },
  {
    id: 'pcte-pharmacy',
    name: 'PCTE College of Pharmacy & Technology, Ludhiana',
    shortCode: 'PCTE',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'Medical',
  },
  {
    id: 'pau-ludhiana',
    name: 'Punjab Agricultural University (PAU), Ludhiana',
    shortCode: 'PAU',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'University',
  },
  {
    id: 'gndec-ludhiana',
    name: 'Guru Nanak Dev Engineering College (GNDEC), Ludhiana',
    shortCode: 'GNDEC',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'Engineering',
  },
  {
    id: 'cmc-ludhiana',
    name: 'Christian Medical College (CMC), Ludhiana',
    shortCode: 'CMC',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'Medical',
  },
  {
    id: 'dmch-ludhiana',
    name: 'Dayanand Medical College and Hospital (DMCH), Ludhiana',
    shortCode: 'DMCH',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'Medical',
  },
  {
    id: 'scd-govt-ludhiana',
    name: 'SCD Government College, Ludhiana',
    shortCode: 'SCD',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'Arts & Science',
  },
  {
    id: 'kcw-ludhiana',
    name: 'Khalsa College for Women, Ludhiana',
    shortCode: 'KCW',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'Arts & Science',
  },
  {
    id: 'arya-college-ludhiana',
    name: 'Arya College, Ludhiana',
    shortCode: 'ACL',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'Arts & Science',
  },
  {
    id: 'ct-university-ludhiana',
    name: 'CT University, Ludhiana',
    shortCode: 'CTU',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'University',
  },
  {
    id: 'ggi-ludhiana',
    name: 'Gulzar Group of Institutes, Ludhiana',
    shortCode: 'GGI',
    city: 'Ludhiana',
    state: 'Punjab',
    type: 'Engineering',
  },
  {
    id: 'thapar-patiala',
    name: 'Thapar Institute of Engineering & Technology, Patiala',
    shortCode: 'TIET',
    city: 'Patiala',
    state: 'Punjab',
    type: 'Engineering',
  },
  {
    id: 'iit-ropar',
    name: 'Indian Institute of Technology (IIT) Ropar',
    shortCode: 'IIT RPR',
    city: 'Ropar',
    state: 'Punjab',
    type: 'Engineering',
  },
  {
    id: 'nit-jalandhar',
    name: 'Dr. B R Ambedkar National Institute of Technology (NIT) Jalandhar',
    shortCode: 'NITJ',
    city: 'Jalandhar',
    state: 'Punjab',
    type: 'Engineering',
  },
  {
    id: 'lpu-phagwara',
    name: 'Lovely Professional University (LPU), Phagwara',
    shortCode: 'LPU',
    city: 'Phagwara',
    state: 'Punjab',
    type: 'University',
  },
  {
    id: 'pu-chandigarh',
    name: 'Panjab University (PU), Chandigarh',
    shortCode: 'PU',
    city: 'Chandigarh',
    state: 'Chandigarh',
    type: 'University',
  },
  {
    id: 'pec-chandigarh',
    name: 'Punjab Engineering College (PEC), Chandigarh',
    shortCode: 'PEC',
    city: 'Chandigarh',
    state: 'Chandigarh',
    type: 'Engineering',
  },

  // --- Delhi NCR ---
  {
    id: 'du-north',
    name: 'Delhi University (DU) - North Campus (SRCC, St. Stephens, Hindu, Hansraj)',
    shortCode: 'DU NC',
    city: 'Delhi',
    state: 'Delhi',
    type: 'University',
  },
  {
    id: 'du-south',
    name: 'Delhi University (DU) - South Campus (LSR, Venkateswara, Gargi)',
    shortCode: 'DU SC',
    city: 'Delhi',
    state: 'Delhi',
    type: 'University',
  },
  {
    id: 'iit-delhi',
    name: 'Indian Institute of Technology (IIT) Delhi',
    shortCode: 'IITD',
    city: 'Delhi',
    state: 'Delhi',
    type: 'Engineering',
  },
  {
    id: 'dtu-delhi',
    name: 'Delhi Technological University (DTU), Delhi',
    shortCode: 'DTU',
    city: 'Delhi',
    state: 'Delhi',
    type: 'Engineering',
  },
  {
    id: 'nsut-delhi',
    name: 'Netaji Subhas University of Technology (NSUT), Delhi',
    shortCode: 'NSUT',
    city: 'Delhi',
    state: 'Delhi',
    type: 'Engineering',
  },
  {
    id: 'iiit-delhi',
    name: 'Indraprastha Institute of Information Technology (IIIT) Delhi',
    shortCode: 'IIITD',
    city: 'Delhi',
    state: 'Delhi',
    type: 'Engineering',
  },
  {
    id: 'jnu-delhi',
    name: 'Jawaharlal Nehru University (JNU), New Delhi',
    shortCode: 'JNU',
    city: 'Delhi',
    state: 'Delhi',
    type: 'University',
  },
  {
    id: 'jmi-delhi',
    name: 'Jamia Millia Islamia, New Delhi',
    shortCode: 'JMI',
    city: 'Delhi',
    state: 'Delhi',
    type: 'University',
  },
  {
    id: 'amity-noida',
    name: 'Amity University, Noida',
    shortCode: 'AU',
    city: 'Noida',
    state: 'Uttar Pradesh',
    type: 'University',
  },
  {
    id: 'ashoka-sonipat',
    name: 'Ashoka University, Sonipat',
    shortCode: 'Ashoka',
    city: 'Sonipat',
    state: 'Haryana',
    type: 'University',
  },

  // --- Bengaluru / Karnataka ---
  {
    id: 'iisc-bengaluru',
    name: 'Indian Institute of Science (IISc), Bengaluru',
    shortCode: 'IISc',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'University',
  },
  {
    id: 'rvce-bengaluru',
    name: 'RV College of Engineering (RVCE), Bengaluru',
    shortCode: 'RVCE',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Engineering',
  },
  {
    id: 'bmsce-bengaluru',
    name: 'BMS College of Engineering (BMSCE), Bengaluru',
    shortCode: 'BMSCE',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Engineering',
  },
  {
    id: 'pes-bengaluru',
    name: 'PES University, Bengaluru',
    shortCode: 'PESU',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'University',
  },
  {
    id: 'msrit-bengaluru',
    name: 'Ramaiah Institute of Technology (MSRIT), Bengaluru',
    shortCode: 'MSRIT',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Engineering',
  },
  {
    id: 'christ-bengaluru',
    name: 'Christ (Deemed to be University), Bengaluru',
    shortCode: 'Christ',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'University',
  },
  {
    id: 'iiit-bengaluru',
    name: 'International Institute of Information Technology (IIIT) Bangalore',
    shortCode: 'IIITB',
    city: 'Bengaluru',
    state: 'Karnataka',
    type: 'Engineering',
  },

  // --- Mumbai & Maharashtra ---
  {
    id: 'iit-bombay',
    name: 'Indian Institute of Technology (IIT) Bombay, Powai',
    shortCode: 'IITB',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Engineering',
  },
  {
    id: 'vjti-mumbai',
    name: 'Veermata Jijabai Technological Institute (VJTI), Mumbai',
    shortCode: 'VJTI',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Engineering',
  },
  {
    id: 'st-xaviers-mumbai',
    name: "St. Xavier's College, Mumbai",
    shortCode: 'SXC',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'Arts & Science',
  },
  {
    id: 'nmims-mumbai',
    name: 'NMIMS University, Mumbai',
    shortCode: 'NMIMS',
    city: 'Mumbai',
    state: 'Maharashtra',
    type: 'University',
  },
  {
    id: 'coep-pune',
    name: 'COEP Technological University, Pune',
    shortCode: 'COEP',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'Engineering',
  },
  {
    id: 'symbiosis-pune',
    name: 'Symbiosis International University, Pune',
    shortCode: 'SIU',
    city: 'Pune',
    state: 'Maharashtra',
    type: 'University',
  },

  // --- Other Premier Institutes ---
  {
    id: 'iit-madras',
    name: 'Indian Institute of Technology (IIT) Madras, Chennai',
    shortCode: 'IITM',
    city: 'Chennai',
    state: 'Tamil Nadu',
    type: 'Engineering',
  },
  {
    id: 'vit-vellore',
    name: 'Vellore Institute of Technology (VIT), Vellore',
    shortCode: 'VIT',
    city: 'Vellore',
    state: 'Tamil Nadu',
    type: 'Engineering',
  },
  {
    id: 'bits-pilani',
    name: 'BITS Pilani (Birla Institute of Technology and Science)',
    shortCode: 'BITS',
    city: 'Pilani',
    state: 'Rajasthan',
    type: 'Engineering',
  },
  {
    id: 'iit-kanpur',
    name: 'Indian Institute of Technology (IIT) Kanpur',
    shortCode: 'IITK',
    city: 'Kanpur',
    state: 'Uttar Pradesh',
    type: 'Engineering',
  },
  {
    id: 'iit-kharagpur',
    name: 'Indian Institute of Technology (IIT) Kharagpur',
    shortCode: 'IITKGP',
    city: 'Kharagpur',
    state: 'West Bengal',
    type: 'Engineering',
  },
  {
    id: 'iit-hyderabad',
    name: 'Indian Institute of Technology (IIT) Hyderabad',
    shortCode: 'IITH',
    city: 'Hyderabad',
    state: 'Telangana',
    type: 'Engineering',
  },
];

/**
 * Returns colleges located in or closest to the given area/city
 */
export function getNearbyColleges(cityOrLocation?: string): CollegeInfo[] {
  if (!cityOrLocation) {
    return COLLEGES_DATABASE.slice(0, 8);
  }

  const query = cityOrLocation.toLowerCase().trim();
  
  // Check exact city or state match
  const matches = COLLEGES_DATABASE.filter(
    (c) =>
      c.city.toLowerCase().includes(query) ||
      c.state.toLowerCase().includes(query) ||
      query.includes(c.city.toLowerCase()) ||
      query.includes(c.state.toLowerCase())
  );

  if (matches.length > 0) {
    return matches;
  }

  return COLLEGES_DATABASE.slice(0, 8);
}

/**
 * Smart autocomplete for colleges:
 * 1. Prioritizes items where query starts with shortCode or name
 *    (e.g., 'pc' -> 'PCTE Group of Institutes, Ludhiana' appears first)
 * 2. Matches acronyms / initials
 * 3. Proximity bonus for current user area/city
 */
export function searchColleges(rawQuery: string, currentCity?: string): CollegeInfo[] {
  const q = rawQuery.trim().toLowerCase();
  if (!q) {
    return getNearbyColleges(currentCity);
  }

  const scores = COLLEGES_DATABASE.map((college) => {
    let score = 0;
    const nameLower = college.name.toLowerCase();
    const codeLower = (college.shortCode || '').toLowerCase();
    const cityLower = college.city.toLowerCase();

    // Highest Priority: startsWith short code (e.g. 'pc' -> 'pcte')
    if (codeLower.startsWith(q)) {
      score += 100;
      if (codeLower === q) score += 50;
    }

    // High Priority: name starts with query (e.g. 'pcte' -> 'pcte group...')
    if (nameLower.startsWith(q)) {
      score += 90;
    }

    // High Priority: any word in name starts with query (e.g. 'ludhiana' -> 'pcte group of institutes, ludhiana')
    const words = nameLower.split(/[\s,()\-]+/);
    if (words.some((w) => w.startsWith(q))) {
      score += 70;
    }

    // Medium Priority: substring match in code or name
    if (codeLower.includes(q)) {
      score += 50;
    }
    if (nameLower.includes(q)) {
      score += 40;
    }

    // Bonus for current user's city/area
    if (currentCity && (cityLower === currentCity.toLowerCase() || currentCity.toLowerCase().includes(cityLower))) {
      score += 25;
    }

    return { college, score };
  });

  return scores
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((s) => s.college);
}
