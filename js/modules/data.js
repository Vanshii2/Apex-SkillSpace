// EDS MIGRATION POINT: Replace getData/setData functions below
// with fetch calls to /.json endpoints. All consumers remain unchanged.

// --- MOCK INITIAL DATA ---
export const PROJECTS = [
    {
        id: 'proj_1',
        title: 'AI Face Recognition Project',
        description: 'This sophisticated software uses artificial intelligence algorithms to quickly and accurately detect and identify faces within photos or live video feeds.',
        seller: 'hyper_arch',
        price: 4999.00,
        tags: ['AI', 'Python', 'Security'],
        status: 'Featured',
        likes: 550,
        bookmarks: 200,
        views: 3200,
        image: 'assets/project1.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/ai-face-recognition'
    },
    {
        id: 'proj_2',
        title: 'Heart Disease Tracking',
        description: 'A helpful digital tool designed to let users easily log and track important heart health indicators like blood pressure and heart rate over time.',
        seller: 'nothing_core',
        price: 2499.00,
        tags: ['Health', 'Dashboard'],
        status: 'Trending',
        likes: 489,
        bookmarks: 128,
        views: 2310,
        image: 'assets/project7.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/heart-tracker'
    },
    {
        id: 'proj_3',
        title: 'Expense Tracker',
        description: 'This user-friendly application makes it simple to keep a close watch on your spending habits by easily logging every single purchase you make.',
        seller: 'linear_flow',
        price: 999.00,
        tags: ['Finance', 'Web App'],
        status: 'Active',
        likes: 245,
        bookmarks: 72,
        views: 980,
        image: 'assets/project6.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/expense-tracker'
    },
    {
        id: 'proj_4',
        title: 'Nutrition Website',
        description: 'An informative website created to assist you in planning healthy meals and learning important facts about nutrition and maintaining a balanced, well-rounded diet.',
        seller: 'hyper_arch',
        price: 1499.00,
        tags: ['Wellness', 'Website'],
        status: 'Active',
        likes: 198,
        bookmarks: 41,
        views: 740,
        image: 'assets/project4.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/nutrition-site'
    },
    {
        id: 'proj_5',
        title: 'Entertainment Website',
        description: 'A fun online destination that allows you to easily search for and discover a vast array of movies and TV shows to enjoy watching.',
        seller: 'linear_flow',
        price: 1999.00,
        tags: ['Cinematic', 'Movies'],
        status: 'Featured',
        likes: 310,
        bookmarks: 92,
        views: 1450,
        image: 'assets/project5.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/entertainment-hub'
    },
    {
        id: 'proj_6',
        title: 'Weekly Newsletter',
        description: 'This platform enables users to effortlessly create and host their own live video broadcasts or explore and watch live streams from other creators in real-time.',
        seller: 'hyper_arch',
        price: 3499.00,
        tags: ['News', 'Streaming'],
        status: 'Active',
        likes: 120,
        bookmarks: 45,
        views: 890,
        image: 'assets/right1.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/live-stream-platform'
    },
    {
        id: 'proj_7',
        title: 'Resume Building Website',
        description: 'A professional website offering multiple intuitive templates that guide you through the process of creating a high-quality resume to impress potential employers.',
        seller: 'linear_flow',
        price: 799.00,
        tags: ['Career', 'Design'],
        status: 'Trending',
        likes: 340,
        bookmarks: 110,
        views: 1560,
        image: 'assets/project8.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/resume-builder'
    },
    {
        id: 'proj_8',
        title: 'Shoe Mark Recognition',
        description: 'This innovative tool leverages advanced artificial intelligence technology to quickly analyze and identify specific patterns from shoe print marks in an efficient manner.',
        seller: 'nothing_core',
        price: 2999.00,
        tags: ['AI', 'Python'],
        status: 'Featured',
        likes: 420,
        bookmarks: 180,
        views: 2800,
        image: 'assets/project3.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/shoe-recognition'
    },
    {
        id: 'proj_9',
        title: 'Make Presentation AI Tool',
        description: 'An intelligent presentation tool that automatically generates complete slide shows and content, significantly reducing the time and effort needed to create professional presentations.',
        seller: 'hyper_arch',
        price: 1799.00,
        tags: ['AI', 'Presentations'],
        status: 'Featured',
        likes: 312,
        bookmarks: 84,
        views: 1240,
        image: 'assets/project9.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/ai-presentation'
    },
    {
        id: 'proj_10',
        title: 'Analytics Dashboard Pro',
        description: 'A sleek, data-rich analytics dashboard template with real-time chart components, KPI cards, and dark/light mode support. Perfect for SaaS and enterprise apps.',
        seller: 'nothing_core',
        price: 4499.00,
        tags: ['Dashboard', 'Analytics'],
        status: 'Featured',
        likes: 620,
        bookmarks: 240,
        views: 4100,
        image: 'assets/project2.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/analytics-dashboard'
    },
    {
        id: 'proj_11',
        title: 'Retro Car Rental Website',
        description: 'A full landing page design system with hero sections, testimonials, pricing grids, and CTAs. Optimized for conversion and built with clean semantic HTML.',
        seller: 'hyper_arch',
        price: 5999.00,
        tags: ['Car Rental', 'Retro'],
        status: 'Featured',
        likes: 710,
        bookmarks: 310,
        views: 5200,
        image: 'assets/project10.webp',
        demoUrl: 'https://www.behance.net/',
        liveDemo: 'https://www.behance.net/',
        github: 'https://github.com/apex-skillspace/landing-system'
    }
];
export const CREATORS = [
    {
        id: 'creator_1',
        username: 'hyper_arch',
        name: 'Aarav Sharma',
        location: 'Bengaluru, India',
        avatar: 'assets/aarav.png',
        banner: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        role: 'Full-Stack UI Engineer',
        bio: 'Crafting immersive digital experiences with modern web technologies. Specializing in high-performance web applications and interactive architectures for top-tier Indian startups.',
        skills: ['React', 'Next.js', 'Creative Direction', 'GSAP', 'CSS Grid'],
        experience: [
            { title: 'Senior Frontend Engineer', company: 'TechNova Solutions', startDate: '2024', endDate: 'Present' },
            { title: 'UI Developer', company: 'Bangalore Tech Lab', startDate: '2022', endDate: '2024' }
        ],
        projects: [
            {
                id: 'hyper_arch_case',
                title: 'Fintech Dashboard Architecture',
                description: 'A robust and scalable fintech dashboard built for real-time stock tracking and portfolio management, featuring seamless animations and micro-interactions.',
                tags: ['React', 'Next.js', 'Framer Motion'],
                status: 'Featured',
                image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80'
            }
        ],
        socialLinks: { github: 'hyper-arch', linkedin: 'aarav-sharma', twitter: 'hyper_arch' },
        selectedTemplate: 'custom',
        customTheme: {
            backgroundType: 'solid',
            backgroundSolid: '#f4f4f5',
            cardStyle: 'shadow',
            font: 'Outfit',
            accent: '#4f46e5',
            text: '#18181b',
            layout: 'centered',
            avatarShape: 'circle',
            dividerStyle: 'solid'
        },
        followers: 1240,
        following: 184,
        stats: { projects: 8, likes: 3410, sales: 142 }
    },
    {
        id: 'creator_2',
        username: 'linear_flow',
        name: 'Priya Patel',
        location: 'Mumbai, India',
        avatar: 'assets/priya.png',
        banner: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
        role: 'UX Designer & Developer',
        bio: 'Bridging the gap between beautiful design and robust engineering. Passionate about creating accessible, user-centric interfaces with clean, semantic code.',
        skills: ['Sass', 'Vue.js', 'Tailwind CSS', 'Figma', 'UI/UX'],
        experience: [
            { title: 'Design Systems Lead', company: 'Mumbai Design Co.', startDate: '2023', endDate: 'Present' },
            { title: 'Frontend Developer', company: 'Creative Web Studios', startDate: '2021', endDate: '2023' }
        ],
        projects: [
            {
                id: 'linear_flow_case',
                title: 'E-commerce UI Framework',
                description: 'A comprehensive UI component library designed specifically for modern e-commerce platforms, optimizing conversion rates through intuitive design.',
                tags: ['UI/UX', 'Tailwind', 'Vue.js'],
                status: 'Demo Project',
                image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'
            }
        ],
        socialLinks: { github: 'linear-flow', linkedin: 'priya-patel-design', twitter: 'linear_flow' },
        selectedTemplate: 'custom',
        customTheme: {
            backgroundType: 'solid',
            backgroundSolid: '#fdfbf7',
            cardStyle: 'flat',
            font: 'Playfair Display',
            accent: '#be185d',
            text: '#1c1917',
            layout: 'left-aligned',
            avatarShape: 'circle',
            dividerStyle: 'solid'
        },
        followers: 920,
        following: 245,
        stats: { projects: 5, likes: 2180, sales: 89 }
    },
    {
        id: 'creator_3',
        username: 'nothing_core',
        name: 'Vikram Singh',
        location: 'New Delhi, India',
        avatar: 'assets/vikram.png',
        banner: 'https://images.unsplash.com/photo-1614850523459-c2f4c699c52e?auto=format&fit=crop&w=800&q=80',
        role: 'AI & Web Solutions Architect',
        bio: 'Building intelligent web solutions that leverage AI to solve real-world problems. Focused on data-driven design, complex integrations, and scalable system architecture.',
        skills: ['Python', 'AI/ML Integration', 'Node.js', 'System Architecture'],
        experience: [
            { title: 'AI Solutions Architect', company: 'Delhi AI Labs', startDate: '2022', endDate: 'Present' },
            { title: 'Backend Developer', company: 'CloudData India', startDate: '2020', endDate: '2022' }
        ],
        projects: [
            {
                id: 'nothing_core_case',
                title: 'AI Healthcare Portal',
                description: 'An advanced healthcare platform that uses machine learning to predict patient needs, wrapped in a clean, accessible interface with real-time data.',
                tags: ['AI/ML', 'Python', 'React'],
                status: 'Case Study',
                image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80'
            }
        ],
        socialLinks: { github: 'nothing-core', linkedin: 'vikram-singh-dev', twitter: 'nothing_core' },
        selectedTemplate: 'custom',
        customTheme: {
            backgroundType: 'solid',
            backgroundSolid: '#ffffff',
            cardStyle: 'flat',
            font: 'Space Grotesk',
            accent: '#10b981',
            text: '#111111',
            layout: 'centered',
            avatarShape: 'square',
            dividerStyle: 'dotted'
        },
        followers: 1850,
        following: 92,
        stats: { projects: 12, likes: 5890, sales: 312 }
    }
];
export const NOTIFICATIONS = [
    { id: 'notif_1', text: 'Welcome to your futuristic dashboard. Get started by exploring the Shop.', time: 'Just now', unread: true },
    { id: 'notif_2', text: 'Your project Chronos has been added to Vikram\'s wishlist.', time: '2 hours ago', unread: true },
    { id: 'notif_3', text: 'Your streak is currently active! Visit daily to build your contribution heatmap.', time: '1 day ago', unread: false }
];
