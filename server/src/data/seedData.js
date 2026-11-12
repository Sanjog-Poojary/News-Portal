const seedUsers = [];

const seedBreakingNews = [
  {
    id: 'brk_01',
    headline: 'ITER Tokamak achieves sustained 320-second plasma fusion milestone at 150MÂ°C',
    category: 'Tech',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    urgency: 'critical',
    sourceUrl: 'https://www.iter.org/newsline'
  },
  {
    id: 'brk_02',
    headline: 'Global semiconductor consortium announces 1.4nm ribbonFET production node breakthrough',
    category: 'Tech',
    timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(),
    urgency: 'high',
    sourceUrl: 'https://www.ieee.org/spec-1.4nm'
  },
  {
    id: 'brk_03',
    headline: 'UN Climate Council confirms Atlantic meridional overturning circulation data reconciliation',
    category: 'World',
    timestamp: new Date(Date.now() - 1000 * 60 * 58).toISOString(),
    urgency: 'medium',
    sourceUrl: 'https://unfccc.int/amoc-data'
  }
];

const seedArticles = [
  {
    _id: 'art_001',
    title: 'Autonomous Orbital Grids: The Next Frontier of Decentralized Compute',
    slug: 'autonomous-orbital-grids-decentralized-compute',
    summary: 'Low-Earth orbit satellite mesh networks equipped with optical cross-links and radiation-hardened TPUs are unlocking real-time inference without terrestrial fiber bottlenecks.',
    body: `<p>As high-throughput satellite constellations mature, aerospace research labs are deploying radiation-tolerant tensor processor clusters into 550km low-Earth orbits. By interconnecting satellites via 100Gbps inter-satellite optical laser links, ground stations bypass terrestrial undersea fiber cables with speed-of-light advantages in vacuum.</p>
    <p><mark class="claim-highlight" data-claim-id="claim_001_1">Optical laser cross-links operate with approximately 31% lower latency compared to trans-oceanic fiber-optic conduits</mark> due to the refractive index disparity between silica core glass and deep-space vacuum.</p>
    <p>Furthermore, orbital solar density allows 94% uptime without terrestrial grid load shedding, enabling continuous training of distributed climate and telemetry models.</p>`,
    author: {
      _id: 'usr_author_01',
      name: 'Elena Rostova',
      avatar: '',
      role: 'author'
    },
    category: 'Tech',
    tags: ['SpaceTech', 'AI Compute', 'Photonics', 'Infrastructure'],
    coverImage: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=1200&auto=format&fit=crop&q=80',
    status: 'published',
    isFeatured: true,
    readTime: '4 min read',
    trustScore: {
      rollup: 'Mostly Verified',
      confidence: 94,
      status: 'verified'
    },
    claims: [
      {
        claimId: 'claim_001_1',
        claimText: 'Optical laser cross-links operate with approximately 31% lower latency compared to trans-oceanic fiber-optic conduits.',
        status: 'Verified',
        confidence: 96,
        sources: [
          { name: 'Nature Photonics (Vol 18)', url: 'https://nature.com/articles/photonics-orbital-transit' },
          { name: 'IEEE Aerospace & Electronic Systems', url: 'https://ieeexplore.ieee.org/document/9482103' }
        ]
      },
      {
        claimId: 'claim_001_2',
        claimText: 'Orbital solar arrays in 550km sun-synchronous orbits achieve continuous >90% irradiation uptime.',
        status: 'Verified',
        confidence: 92,
        sources: [
          { name: 'ESA Solar Dynamics Report', url: 'https://esa.int/solar-efficiency-leo' }
        ]
      }
    ],
    viewCount: 14280,
    likeCount: 642,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString()
  },
  {
    _id: 'art_002',
    title: 'Synthetic Biology Synthesizers Reach Terawatt Scalability in Bio-Hydrogen',
    slug: 'synthetic-biology-synthesizers-bio-hydrogen',
    summary: 'Engineered cyanobacterial strains coupled with microfluidic bioreactors achieve a record 18.2% photosynthetic solar-to-hydrogen conversion efficiency.',
    body: `<p>A cross-institutional European research consortium has published benchmark data revealing a breakthrough in biological photolysis. Utilizing CRISPR-Cas12f engineered photosynthetic pathways, the modified enzymes mitigate oxygen-sensitivity poisoning, historically the principal limiting factor in bacterial hydrogen generation.</p>
    <p><mark class="claim-highlight" data-claim-id="claim_002_1">The engineered enzymatic pathway achieved sustained solar-to-hydrogen conversion at 18.2% under simulated terrestrial flux</mark>, surpassing previous inorganic photovoltaic-coupled electrolyzer benchmarks.</p>`,
    author: {
      _id: 'usr_author_02',
      name: 'Marcus Vance',
      avatar: '',
      role: 'author'
    },
    category: 'Tech',
    tags: ['CleanTech', 'SynBio', 'Hydrogen', 'Renewables'],
    coverImage: 'https://images.unsplash.com/photo-1507413245164-6160d8298b31?w=1200&auto=format&fit=crop&q=80',
    status: 'published',
    isFeatured: true,
    readTime: '6 min read',
    trustScore: {
      rollup: 'Highly Verified',
      confidence: 98,
      status: 'verified'
    },
    claims: [
      {
        claimId: 'claim_002_1',
        claimText: 'Engineered enzymatic pathway achieved sustained solar-to-hydrogen conversion at 18.2%.',
        status: 'Verified',
        confidence: 98,
        sources: [
          { name: 'Science Advances / Vol 12', url: 'https://science.org/doi/10.1126/sciadv.bio-h2-peak' },
          { name: 'National Renewable Energy Lab (NREL)', url: 'https://nrel.gov/research/photolysis-benchmarks' }
        ]
      }
    ],
    viewCount: 9830,
    likeCount: 418,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 7).toISOString()
  },
  {
    _id: 'art_003',
    title: 'Geopolitical AI Treaties: The G20 Digital Non-Proliferation Accord',
    slug: 'geopolitical-ai-treaties-g20-accord',
    summary: 'Diplomatic envoys finalize the framework for autonomous defensive kill-switch verification and frontier model export restrictions across 24 sovereign territories.',
    body: `<p>Following nine months of closed-door bilateral negotiations in Geneva, signatories have initialized the Draft Accord on Sovereign Algorithmic Integrity. The treaty mandates cryptographically signed model weights for multi-modal systems exceeding 10^26 floating-point training operations.</p>
    <p><mark class="claim-highlight" data-claim-id="claim_003_1">All signatory states agree to deploy independent hardware-security-module (HSM) telemetry monitors on domestic gigawatt data hubs by 2028</mark>.</p>`,
    author: {
      _id: 'usr_author_01',
      name: 'Elena Rostova',
      avatar: '',
      role: 'author'
    },
    category: 'Politics',
    tags: ['Policy', 'Governance', 'Global Affairs', 'AI Safety'],
    coverImage: 'https://images.unsplash.com/photo-1541872703-74c5e44368f9?w=1200&auto=format&fit=crop&q=80',
    status: 'published',
    isFeatured: true,
    readTime: '5 min read',
    trustScore: {
      rollup: 'Needs Context',
      confidence: 68,
      status: 'needs_context'
    },
    claims: [
      {
        claimId: 'claim_003_1',
        claimText: 'All signatory states agree to deploy independent hardware-security-module telemetry monitors on domestic hubs by 2028.',
        status: 'Needs Context',
        confidence: 68,
        sources: [
          { name: 'Geneva Diplomatic Protocol Archive', url: 'https://geneva-accord.int/draft-treaty-2026' }
        ]
      }
    ],
    viewCount: 16500,
    likeCount: 890,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 14).toISOString()
  },
  {
    _id: 'art_004',
    title: 'High-Altitude Aerodynamic Architecture Revolutionizes High-Speed Rail',
    slug: 'high-altitude-aerodynamic-rail-architecture',
    summary: 'A new low-drag maglev configuration completes sub-atmospheric tube trials at 720 km/h with 40% reduction in acoustic cavitation.',
    body: `<p>High-speed transportation engineers have completed vacuum-tube test runs demonstrating passive electromagnetic suspension at speeds exceeding 700 kilometers per hour. The carbon-nanotube aerodynamic nose cone drastically attenuates tunnel piston effects.</p>`,
    author: {
      _id: 'usr_author_02',
      name: 'Marcus Vance',
      avatar: '',
      role: 'author'
    },
    category: 'World',
    tags: ['Transit', 'Engineering', 'Maglev', 'Physics'],
    coverImage: 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1200&auto=format&fit=crop&q=80',
    status: 'published',
    isFeatured: false,
    readTime: '3 min read',
    trustScore: {
      rollup: 'Verified',
      confidence: 91,
      status: 'verified'
    },
    claims: [
      {
        claimId: 'claim_004_1',
        claimText: 'Vehicle prototype attained 720 km/h velocity inside low-pressure test tube facility.',
        status: 'Verified',
        confidence: 91,
        sources: [
          { name: 'International Railway Gazette', url: 'https://railwaygazette.com/maglev-vacuum-trial' }
        ]
      }
    ],
    viewCount: 7120,
    likeCount: 304,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString()
  },
  {
    _id: 'art_005',
    title: 'Biometric Telemetry in Formula Racing: Real-Time Cognitive Load Telemetry',
    slug: 'biometric-telemetry-formula-racing',
    summary: 'FIA ratifies in-helmet optical EEG sensor bands, feeding neural latency metrics straight into live race strategy analytics.',
    body: `<p>Precision telemetry teams are integrating subdermal-grade micro-EEG bands into pilot helmets, relaying neural arousal and micro-fatigue indicators in 20-millisecond packets.</p>`,
    author: {
      _id: 'usr_author_01',
      name: 'Elena Rostova',
      avatar: '',
      role: 'author'
    },
    category: 'Sports',
    tags: ['Motorsports', 'NeuroTech', 'Telemetry', 'Wearables'],
    coverImage: 'https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80',
    status: 'published',
    isFeatured: false,
    readTime: '4 min read',
    trustScore: {
      rollup: 'Mostly Verified',
      confidence: 86,
      status: 'verified'
    },
    claims: [
      {
        claimId: 'claim_005_1',
        claimText: 'FIA homologation committee certified neural latency telemetry for 2027 technical regulations.',
        status: 'Verified',
        confidence: 86,
        sources: [
          { name: 'FIA Technical Bulletin #42', url: 'https://fia.com/regulations/telemetry-2027' }
        ]
      }
    ],
    viewCount: 5410,
    likeCount: 260,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString()
  },
  {
    _id: 'art_006',
    title: 'Quantum Key Distribution Extends Across Intercontinental Free-Space Link',
    slug: 'quantum-key-distribution-intercontinental-link',
    summary: 'Entangled photon emitter aboard microsatellite establishes unhackable optical cryptography channel across 4,200 kilometers.',
    body: `<p>Quantum communications researchers have achieved continuous secret key generation rates of 1.2 megabits per second between optical ground terminals separated by continental distances.</p>`,
    author: {
      _id: 'usr_author_02',
      name: 'Marcus Vance',
      avatar: '',
      role: 'author'
    },
    category: 'Tech',
    tags: ['Quantum', 'Cybersecurity', 'Encryption', 'Satellites'],
    coverImage: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=1200&auto=format&fit=crop&q=80',
    status: 'published',
    isFeatured: false,
    readTime: '5 min read',
    trustScore: {
      rollup: 'Mostly Verified',
      confidence: 89,
      status: 'verified'
    },
    claims: [
      {
        claimId: 'claim_006_1',
        claimText: 'Secret key rate reached 1.2 Mbps over 4,200 km atmospheric path.',
        status: 'Verified',
        confidence: 89,
        sources: [
          { name: 'Physical Review Letters', url: 'https://journals.aps.org/prl/abstract/qkd-free-space' }
        ]
      }
    ],
    viewCount: 8340,
    likeCount: 512,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString(),
    updatedAt: new Date(Date.now() - 1000 * 60 * 60 * 36).toISOString()
  }
];

const seedComments = [
  {
    _id: 'cmt_001',
    articleId: 'art_001',
    author: {
      _id: 'usr_reader_01',
      name: 'Aria Chen',
      avatar: ''
    },
    content: 'The reduction in laser link latency matches the vacuum light speed theorem. What is the degradation profile during solar storm events?',
    flagCount: 0,
    flagged: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString()
  },
  {
    _id: 'cmt_002',
    articleId: 'art_001',
    author: {
      _id: 'usr_author_02',
      name: 'Marcus Vance',
      avatar: ''
    },
    content: 'Radiation shielding utilizes boron nitride nanotubes for secondary neutron scattering. Testing has shown negligible BER drift under Carrington-scale simulations.',
    flagCount: 0,
    flagged: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
  }
];

const seedForumThreads = [
  {
    _id: 'thr_001',
    board: 'technology',
    title: 'Photonics vs Sub-terahertz wireless for inter-datacenter links',
    content: 'With the latest orbital benchmarks showing optical cross-links beating undersea silica fiber by ~31%, what are the prospects of ground-to-space free-space optics replacing terrestrial backbones?',
    author: {
      _id: 'usr_reader_01',
      name: 'Aria Chen',
      avatar: '',
      role: 'reader'
    },
    upvotes: ['usr_author_01', 'usr_admin_01'],
    downvotes: [],
    replies: [
      {
        _id: 'rep_001_1',
        author: {
          _id: 'usr_author_01',
          name: 'Elena Rostova',
          avatar: '',
          role: 'author'
        },
        content: 'Cloud absorption remains the primary hurdle for ground-to-space links. Optical ground stations need geographic diversity across high-altitude desert plateaus to achieve 99.999% availability.',
        createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString()
      }
    ],
    flagCount: 0,
    flagged: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString()
  },
  {
    _id: 'thr_002',
    board: 'politics',
    title: 'Verification frameworks for Sovereign AI model weight governance',
    content: 'Under the proposed G20 Digital Accord, independent Hardware Security Modules will audit cluster training. How will open-source research compute clusters comply without onerous surveillance overhead?',
    author: {
      _id: 'usr_author_02',
      name: 'Marcus Vance',
      avatar: '',
      role: 'author'
    },
    upvotes: ['usr_reader_01'],
    downvotes: [],
    replies: [],
    flagCount: 0,
    flagged: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 240).toISOString()
  },
  {
    _id: 'thr_003',
    board: 'general',
    title: 'How our AI Fact-Checking confidence floor mitigates synthetic hallucinations',
    content: 'A transparent review of why claims below 50% confidence default to "Needs Context" or "Unverified", and why human editorial overrides require a minimum 15-character rationale trail.',
    author: {
      _id: 'usr_admin_01',
      name: 'Kaelen Thorne (Editor-in-Chief)',
      avatar: '',
      role: 'admin'
    },
    upvotes: ['usr_reader_01', 'usr_author_01', 'usr_author_02'],
    downvotes: [],
    replies: [
      {
        _id: 'rep_003_1',
        author: {
          _id: 'usr_reader_01',
          name: 'Aria Chen',
          avatar: '',
          role: 'reader'
        },
        content: 'This transparency is the reason I rely on NEWS.PORTAL over standard aggregator feeds. Please keep the citation URLs visible directly in the reading view.',
        createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString()
      }
    ],
    flagCount: 0,
    flagged: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString()
  }
];

const seedFactCheckLogs = [
  {
    _id: 'fcl_001',
    articleId: 'art_003',
    articleTitle: 'Geopolitical AI Treaties: The G20 Digital Non-Proliferation Accord',
    editorId: 'usr_admin_01',
    editorName: 'Kaelen Thorne',
    claimIndex: 0,
    originalStatus: 'Disputed',
    overriddenStatus: 'Needs Context',
    reason: 'Ratification timeline confirmed via official Geneva diplomatic communiquÃ© released at 09:00 UTC.',
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString()
  }
];

module.exports = {
  seedUsers,
  seedBreakingNews,
  seedArticles,
  seedComments,
  seedForumThreads,
  seedFactCheckLogs
};
