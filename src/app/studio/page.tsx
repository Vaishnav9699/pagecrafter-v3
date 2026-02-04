'use client';

import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import './studio.css';

export default function StudioPage() {
    const { theme } = useTheme();
    const [selectedElement, setSelectedElement] = useState<string | null>(null);
    const [activePanel, setActivePanel] = useState<'components' | 'pages' | 'layers' | 'assets' | 'ai'>('components');
    const [activeRightTab, setActiveRightTab] = useState<'style' | 'settings'>('style');
    const [aiInput, setAiInput] = useState('');
    const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
    const [isInspectMode, setIsInspectMode] = useState(false);
    const [isMagicBuilding, setIsMagicBuilding] = useState(false);
    const [messages, setMessages] = useState([
        { role: 'assistant', content: 'Hello! I am your AI Design Assistant. How can I help you build your website today?' }
    ]);

    // Website State
    const [activePageId, setActivePageId] = useState<string>('home');
    const [pages, setPages] = useState<Record<string, any[]>>({
        home: [
            {
                id: 'header-home',
                type: 'header',
                content: { logo: 'Brand', links: ['Home', 'Services', 'About', 'Dashboard'] },
                style: { padding: '20px 40px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }
            },
            {
                id: 'hero-1',
                type: 'hero',
                content: { title: 'Build Future-Ready Web Apps', description: 'The ultimate design intelligence platform for modern creators.' },
                style: { padding: '100px 40px', background: 'linear-gradient(135deg, #f9fafb 0%, #ffffff 100%)', color: '#1a1a1a', textAlign: 'center' }
            },
            {
                id: 'features-1',
                type: 'features',
                content: { title: 'Why Choose Us' },
                style: { padding: '80px 40px', background: '#ffffff' }
            },
            {
                id: 'footer-home',
                type: 'footer',
                content: { text: "© 2024 PageCrafter. All rights reserved." },
                style: { padding: '40px', background: '#111827', color: '#9ca3af', textAlign: 'center', fontSize: '14px' }
            }
        ],
        services: [
            {
                id: 'header-services',
                type: 'header',
                content: { logo: 'Brand', links: ['Home', 'Services', 'About', 'Dashboard'] },
                style: { padding: '20px 40px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }
            },
            {
                id: 'services-hero',
                type: 'hero',
                content: { title: 'Our Services', description: 'Professional solutions for your business needs.' },
                style: { padding: '60px 40px', background: '#f3f4f6', color: '#1a1a1a', textAlign: 'center' }
            },
            {
                id: 'shop-1',
                type: 'shop',
                content: { title: 'Service Packages' },
                style: { padding: '60px 40px', background: '#ffffff' }
            },
            {
                id: 'footer-services',
                type: 'footer',
                content: { text: "© 2024 PageCrafter. All rights reserved." },
                style: { padding: '40px', background: '#111827', color: '#9ca3af', textAlign: 'center', fontSize: '14px' }
            }
        ],
        about: [
            {
                id: 'header-about',
                type: 'header',
                content: { logo: 'Brand', links: ['Home', 'Services', 'About', 'Dashboard'] },
                style: { padding: '20px 40px', background: '#ffffff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6' }
            },
            {
                id: 'about-content',
                type: 'content',
                content: { title: 'About Us', text: 'We are a team of passionate developers and designers dedicated to building the best web experiences on the planet. Our mission is to empower creators.' },
                style: { padding: '80px 40px', background: '#ffffff', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }
            },
            {
                id: 'stats-about',
                type: 'stats',
                content: {
                    stats: [
                        { label: 'Happy Clients', value: '500+' },
                        { label: 'Projects Done', value: '120+' },
                        { label: 'Awards', value: '15' }
                    ]
                },
                style: { padding: '60px 40px', background: '#f8fafc' }
            },
            {
                id: 'footer-about',
                type: 'footer',
                content: { text: "© 2024 PageCrafter. All rights reserved." },
                style: { padding: '40px', background: '#111827', color: '#9ca3af', textAlign: 'center', fontSize: '14px' }
            }
        ],
        dashboard: [
            {
                id: 'dash-header',
                type: 'header',
                content: { logo: 'Brand', links: ['Home', 'Services', 'About', 'Dashboard'] },
                style: { padding: '20px 40px', background: '#1e293b', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }
            },
            {
                id: 'dash-stats',
                type: 'stats',
                content: {
                    stats: [
                        { label: 'Total Revenue', value: '$45,231.89' },
                        { label: 'Active Users', value: '2,345' },
                        { label: 'Bounce Rate', value: '24.5%' }
                    ]
                },
                style: { padding: '40px', background: '#f1f5f9' }
            },
            {
                id: 'dash-content',
                type: 'content',
                content: { title: 'Recent Activity', text: '• User John Doe purchased a subscription.\n• Ticket #4295 was resolved.\n• Server load normalized.' },
                style: { padding: '40px', background: '#ffffff', borderRadius: '8px', margin: '20px 40px', border: '1px solid #e2e8f0' }
            }
        ]
    });

    const updateSectionStyle = (id: string, newStyle: any) => {
        setPages(prev => ({
            ...prev,
            [activePageId]: prev[activePageId].map(s => s.id === id ? { ...s, style: { ...s.style, ...newStyle } } : s)
        }));
    };

    const handleAiResponse = (input: string) => {
        const lowerInput = input.toLowerCase();
        let response = "I'm working on that!";

        if (lowerInput.includes('shop') || lowerInput.includes('store')) {
            const newSection = {
                id: `shop-${Date.now()}`,
                type: 'shop',
                content: { title: 'Our Featured Products' },
                style: { padding: '40px', background: '#fff' }
            };
            setPages(prev => ({
                ...prev,
                [activePageId]: [...prev[activePageId], newSection]
            }));
            response = "I've added a premium Shop section to your current page.";
        } else if (lowerInput.includes('feature')) {
            const newSection = {
                id: `features-${Date.now()}`,
                type: 'features',
                content: { title: 'Amazing Features' },
                style: { padding: '40px', background: '#f9fafb' }
            };
            setPages(prev => ({
                ...prev,
                [activePageId]: [...prev[activePageId], newSection]
            }));
            response = "Added a Features section for you!";
        } else if (lowerInput.includes('contact')) {
            const newSection = {
                id: `contact-${Date.now()}`,
                type: 'content',
                content: { title: 'Contact Us', text: 'Get in touch at hello@example.com' },
                style: { padding: '40px', background: '#f0f9ff', textAlign: 'center' }
            };
            setPages(prev => ({
                ...prev,
                [activePageId]: [...prev[activePageId], newSection]
            }));
            response = "Added a Contact section.";
        }

        setTimeout(() => {
            setMessages(prev => [...prev, { role: 'assistant', content: response }]);
        }, 800);
    };

    const handleMagicBuild = async (prompt: string) => {
        setIsMagicBuilding(true);
        const userMsg = { role: 'user', content: `Magic Build: ${prompt}` };
        setMessages(prev => [...prev, userMsg, { role: 'assistant', content: '✨ Starting Magic Build... Generating a complete multi-page website structure (Home, About, Services, Dashboard)...' }]);

        setTimeout(() => {
            const lowerPrompt = prompt.toLowerCase();
            let newPages;

            if (lowerPrompt.includes('shop') || lowerPrompt.includes('store') || lowerPrompt.includes('commerce') || lowerPrompt.includes('sell')) {
                // E-COMMERCE TEMPLATE
                newPages = {
                    home: [
                        { id: 'h-head', type: 'header', content: { logo: 'LuxeStore', links: ['Home', 'Shop', 'About', 'Account'] }, style: { padding: '20px 40px', background: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' } },
                        { id: 'h-hero', type: 'hero', content: { title: 'Summer Collection 2024', description: 'Explore the new season arrivals with up to 40% off.' }, style: { padding: '140px 40px', background: 'linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80)', backgroundSize: 'cover', backgroundPosition: 'center', color: '#ffffff', textAlign: 'center', borderRadius: '0 0 20px 20px' } },
                        { id: 'h-feat', type: 'shop', content: { title: 'Trending Now' }, style: { padding: '80px 40px', background: '#ffffff' } },
                        { id: 'h-foot', type: 'footer', content: { text: "© 2024 LuxeStore Inc. All rights reserved." }, style: { padding: '60px 40px', background: '#111827', color: '#9ca3af', textAlign: 'center' } }
                    ],
                    shop: [
                        { id: 's-head', type: 'header', content: { logo: 'LuxeStore', links: ['Home', 'Shop', 'About', 'Account'] }, style: { padding: '20px 40px', background: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        { id: 's-hero', type: 'content', content: { title: 'Shop All', text: 'Filter by category, size, and color.' }, style: { padding: '60px 40px', background: '#f8fafc', textAlign: 'center' } },
                        { id: 's-grid', type: 'shop', content: { title: 'Full Catalog' }, style: { padding: '40px', background: '#ffffff' } },
                        { id: 's-foot', type: 'footer', content: { text: "© 2024 LuxeStore Inc." }, style: { padding: '40px', background: '#111827', color: '#9ca3af', textAlign: 'center' } }
                    ],
                    about: [
                        { id: 'a-head', type: 'header', content: { logo: 'LuxeStore', links: ['Home', 'Shop', 'About', 'Account'] }, style: { padding: '20px 40px', background: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        { id: 'a-hero', type: 'content', content: { title: 'Our Story', text: 'We believe in sustainable fashion and timeless design.' }, style: { padding: '100px 40px', background: '#fff', textAlign: 'center', maxWidth: '800px', margin: '0 auto' } },
                        { id: 'a-stats', type: 'stats', content: { stats: [{ label: 'Stores', value: '12' }, { label: 'Customers', value: '50k+' }, { label: 'Since', value: '2015' }] }, style: { padding: '60px', background: '#f8fafc' } },
                        { id: 'a-foot', type: 'footer', content: { text: "© 2024 LuxeStore Inc." }, style: { padding: '40px', background: '#111827', color: '#9ca3af', textAlign: 'center' } }
                    ],
                    account: [
                        { id: 'ac-head', type: 'header', content: { logo: 'LuxeStore', links: ['Home', 'Shop', 'About', 'Account'] }, style: { padding: '20px 40px', background: '#fff', borderBottom: '1px solid #eaeaea', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        { id: 'ac-dash', type: 'content', content: { title: 'My Account', text: 'Welcome back, Vaishnav.' }, style: { padding: '60px 40px', background: '#fff' } },
                        { id: 'ac-stats', type: 'stats', content: { stats: [{ label: 'Orders', value: '5' }, { label: 'Wishlist', value: '12' }, { label: 'Points', value: '450' }] }, style: { padding: '40px', background: '#f0fdf4', borderRadius: '12px', margin: '0 40px' } }
                    ]
                };
            } else if (lowerPrompt.includes('portfolio') || lowerPrompt.includes('resume') || lowerPrompt.includes('me')) {
                // PORTFOLIO TEMPLATE
                newPages = {
                    home: [
                        { id: 'p-head', type: 'header', content: { logo: 'AlexCreator', links: ['Home', 'Work', 'Contact'] }, style: { padding: '20px 40px', background: 'transparent', position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: '#fff' } },
                        { id: 'p-hero', type: 'hero', content: { title: 'I Create Digital Experiences', description: 'Product Designer & Developer based in San Francisco.' }, style: { padding: '180px 40px', background: '#111', color: '#fff', textAlign: 'center' } },
                        { id: 'p-work', type: 'features', content: { title: 'Selected Work' }, style: { padding: '100px 40px', background: '#111', color: '#fff' } },
                        { id: 'p-foot', type: 'footer', content: { text: "Start a project with me." }, style: { padding: '80px', background: '#000', color: '#fff', textAlign: 'center' } }
                    ],
                    work: [
                        { id: 'w-head', type: 'header', content: { logo: 'AlexCreator', links: ['Home', 'Work', 'Contact'] }, style: { padding: '20px 40px', background: '#111', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        { id: 'w-grid', type: 'shop', content: { title: 'My Projects' }, style: { padding: '80px 40px', background: '#111', color: '#fff' } },
                        { id: 'w-foot', type: 'footer', content: { text: "© 2024 AlexCreator" }, style: { padding: '40px', background: '#000', color: '#666', textAlign: 'center' } }
                    ],
                    contact: [
                        { id: 'c-head', type: 'header', content: { logo: 'AlexCreator', links: ['Home', 'Work', 'Contact'] }, style: { padding: '20px 40px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        { id: 'c-form', type: 'content', content: { title: 'Get In Touch', text: 'alex@example.com' }, style: { padding: '100px 40px', background: '#fff', textAlign: 'center' } }
                    ]
                };
            } else {
                // DEFAULT SAAS/CORPORATE (NEXUS)
                newPages = {
                    home: [
                        { id: 'h-head', type: 'header', content: { logo: 'Nexus', links: ['Home', 'Services', 'About', 'Dashboard'] }, style: { padding: '20px 40px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        { id: 'h-hero', type: 'hero', content: { title: 'Innovation Starts Here', description: 'Transform your digital presence with our cutting-edge solutions.' }, style: { padding: '120px 40px', background: 'linear-gradient(135deg, #4f46e5 0%, #06b6d4 100%)', color: '#ffffff', textAlign: 'center' } },
                        { id: 'h-feat', type: 'features', content: { title: 'Core Capabilities' }, style: { padding: '80px 40px', background: '#ffffff' } },
                        { id: 'h-foot', type: 'footer', content: { text: "© 2024 Nexus Inc." }, style: { padding: '40px', background: '#111827', color: '#9ca3af', textAlign: 'center' } }
                    ],
                    services: [
                        { id: 's-head', type: 'header', content: { logo: 'Nexus', links: ['Home', 'Services', 'About', 'Dashboard'] }, style: { padding: '20px 40px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        { id: 's-hero', type: 'content', content: { title: 'Our Expertise', text: 'From cloud computing to AI integration, we cover it all.' }, style: { padding: '80px 40px', background: '#f8fafc', textAlign: 'center' } },
                        { id: 's-shop', type: 'shop', content: { title: 'Service Plans' }, style: { padding: '60px 40px', background: '#ffffff' } },
                        { id: 's-foot', type: 'footer', content: { text: "© 2024 Nexus Inc." }, style: { padding: '40px', background: '#111827', color: '#9ca3af', textAlign: 'center' } }
                    ],
                    about: [
                        { id: 'a-head', type: 'header', content: { logo: 'Nexus', links: ['Home', 'Services', 'About', 'Dashboard'] }, style: { padding: '20px 40px', background: '#fff', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        { id: 'a-content', type: 'content', content: { title: 'Who We Are', text: 'Founded in 2024, Nexus is driven by a passion for technology and a commitment to excellence.' }, style: { padding: '100px 40px', background: '#ffffff', maxWidth: '800px', margin: '0 auto', textAlign: 'center' } },
                        { id: 'a-stats', type: 'stats', content: { stats: [{ label: 'Years', value: '10+' }, { label: 'Experts', value: '50+' }, { label: 'Global', value: 'Yes' }] }, style: { padding: '60px 40px', background: '#f8fafc' } },
                        { id: 'a-foot', type: 'footer', content: { text: "© 2024 Nexus Inc." }, style: { padding: '40px', background: '#111827', color: '#9ca3af', textAlign: 'center' } }
                    ],
                    dashboard: [
                        { id: 'd-head', type: 'header', content: { logo: 'Nexus Admin', links: [] }, style: { padding: '20px 40px', background: '#0f172a', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                        { id: 'd-stats', type: 'stats', content: { stats: [{ label: 'Users', value: '12.5k' }, { label: 'Sales', value: '$1.2M' }, { label: 'Growth', value: '+24%' }] }, style: { padding: '40px', background: '#f1f5f9' } },
                        { id: 'd-content', type: 'content', content: { title: 'System Status', text: 'All systems operational. No incidents reported in the last 24 hours.' }, style: { padding: '40px', background: '#ffffff', borderRadius: '12px', margin: '20px 40px', border: '1px solid #e2e8f0' } }
                    ]
                };
            }

            setPages(newPages);
            setActivePageId('home');
            setMessages(prev => [...prev, { role: 'assistant', content: `✅ Magic Build complete! I've generated a specific structure based on your request: "${prompt}". Explored the configured pages.` }]);
            setIsMagicBuilding(false);
        }, 2000);
    };

    const sections = pages[activePageId] || [];

    return (
        <div className="studio-container">
            {/* Top Toolbar */}
            <div className="studio-toolbar">
                <div className="toolbar-left">
                    <div className="studio-logo">
                        <svg className="logo-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M12 3L2 12l10 9 10-9-10-9z"></path>
                            <path d="M2 12h20"></path>
                            <path d="M12 3v18"></path>
                        </svg>
                        <span className="logo-text">PageCrafter Studio</span>
                    </div>
                </div>

                <div className="toolbar-center">
                    {/* Viewport controls removed */}
                </div>

                <div className="toolbar-right">
                    <button className="toolbar-action-btn secondary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                            <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                        Preview
                    </button>
                    <button className="toolbar-action-btn primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="17 8 12 3 7 8"></polyline>
                            <line x1="12" y1="3" x2="12" y2="15"></line>
                        </svg>
                        Export
                    </button>
                    <button className="toolbar-action-btn publish">
                        Publish
                    </button>
                </div>
            </div>

            {/* Main Studio Layout */}
            <div className="studio-layout">
                {/* Left Panel - Components with Sidebar */}
                <div className="studio-panel left-panel">
                    {/* Vertical Icon Sidebar */}
                    <div className="components-sidebar">
                        <button
                            className={`sidebar-icon-btn ${activePanel === 'components' ? 'active' : ''}`}
                            title="Add Components"
                            onClick={() => setActivePanel('components')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="12" y1="5" x2="12" y2="19"></line>
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                            </svg>
                        </button>
                        <button
                            className={`sidebar-icon-btn ${activePanel === 'pages' ? 'active' : ''}`}
                            title="Pages"
                            onClick={() => setActivePanel('pages')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
                                <polyline points="13 2 13 9 20 9"></polyline>
                            </svg>
                        </button>
                        <button
                            className={`sidebar-icon-btn ${activePanel === 'layers' ? 'active' : ''}`}
                            title="Layers"
                            onClick={() => setActivePanel('layers')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <line x1="3" y1="6" x2="21" y2="6"></line>
                                <line x1="3" y1="12" x2="21" y2="12"></line>
                                <line x1="3" y1="18" x2="21" y2="18"></line>
                            </svg>
                        </button>
                        <button
                            className={`sidebar-icon-btn ${activePanel === 'assets' ? 'active' : ''}`}
                            title="Assets"
                            onClick={() => setActivePanel('assets')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </button>
                        <button
                            className={`sidebar-icon-btn ${activePanel === 'ai' ? 'active' : ''}`}
                            title="AI Assistant"
                            onClick={() => setActivePanel('ai')}
                        >
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                            </svg>
                        </button>
                    </div>

                    {/* Conditional Panel Rendering */}
                    {activePanel === 'components' && (
                        <div className="components-panel">
                            {/* Sub-tabs for Marketplace/Sections/etc */}
                            <div className="marketplace-tabs">
                                <button className="marketplace-tab active">Marketplace</button>
                                <button className="marketplace-tab">Sections</button>
                                <button className="marketplace-tab">Pages</button>
                                <button className="marketplace-tab">Integrations</button>
                            </div>

                            {/* Scrollable Content */}
                            <div className="panel-content">
                                {/* Marketplace Libraries */}
                                <div className="marketplace-content">
                                    {/* Animation Engine Examples */}
                                    <div className="library-card">
                                        <div className="library-preview">
                                            <div className="library-image" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                    <div style={{ width: '30px', height: '40px', background: '#4ade80', borderRadius: '4px' }}></div>
                                                    <div style={{ width: '30px', height: '40px', background: '#60a5fa', borderRadius: '4px' }}></div>
                                                    <div style={{ width: '30px', height: '40px', background: '#f472b6', borderRadius: '4px' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="library-info">
                                            <div className="library-header">
                                                <svg className="library-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                                </svg>
                                                <h4 className="library-title">Animation engine examples</h4>
                                            </div>
                                            <button className="library-menu">⋯</button>
                                        </div>
                                    </div>

                                    {/* Onx Library */}
                                    <div className="library-card">
                                        <div className="library-preview">
                                            <div className="library-image" style={{ background: '#f3f4f6', padding: '20px' }}>
                                                <div style={{ background: 'white', border: '2px dashed #9ca3af', borderRadius: '8px', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                    <svg viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" width="32" height="32">
                                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                        <line x1="3" y1="9" x2="21" y2="9" />
                                                        <line x1="9" y1="21" x2="9" y2="9" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="library-info">
                                            <div className="library-header">
                                                <h4 className="library-title">Onx Library</h4>
                                            </div>
                                            <button className="library-menu">⋯</button>
                                        </div>
                                    </div>

                                    {/* Library with Tags */}
                                    <div className="library-card">
                                        <div className="library-header-large">
                                            <span className="library-badge">Library</span>
                                            <div className="library-tags">
                                                <span className="library-tag tag-articles">Articles</span>
                                                <span className="library-tag tag-footer">Footer</span>
                                                <span className="library-tag tag-pricing">Pricing</span>
                                                <span className="library-tag tag-nav">Nav</span>
                                                <span className="library-tag tag-hero">Hero</span>
                                            </div>
                                        </div>
                                        <div className="library-info">
                                            <div className="library-header">
                                                <h4 className="library-title">Craft Library</h4>
                                            </div>
                                            <button className="library-menu">⋯</button>
                                        </div>
                                    </div>

                                    {/* Lightweight Animations */}
                                    <div className="library-card">
                                        <div className="library-preview">
                                            <div className="library-image" style={{ background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '14px', fontWeight: '600' }}>
                                                Lightweight<br />Animations
                                            </div>
                                        </div>
                                        <div className="library-info">
                                            <button className="library-menu">⋯</button>
                                        </div>
                                    </div>

                                    {/* Ant Motion */}
                                    <div className="library-card">
                                        <div className="library-info">
                                            <div className="library-header">
                                                <h4 className="library-title">Ant Motion</h4>
                                            </div>
                                            <button className="library-menu">⋯</button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pages Panel */}
                    {activePanel === 'pages' && (
                        <div className="components-panel">
                            <div className="panel-header">
                                <h3>Pages</h3>
                                <div className="panel-header-actions">
                                    <button className="panel-header-btn" title="Copy Page">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                                        </svg>
                                    </button>
                                    <button className="panel-header-btn" title="Add Page">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                            <polyline points="14 2 14 8 20 8"></polyline>
                                            <line x1="12" y1="12" x2="12" y2="18"></line>
                                            <line x1="9" y1="15" x2="15" y2="15"></line>
                                        </svg>
                                    </button>
                                </div>
                            </div>

                            {/* Pages List */}
                            <div className="panel-content">
                                <div className="pages-list">
                                    {Object.keys(pages).map(pageId => (
                                        <button
                                            key={pageId}
                                            className={`page-item ${activePageId === pageId ? 'active' : ''}`}
                                            onClick={() => setActivePageId(pageId)}
                                        >
                                            <svg className="page-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                <line x1="3" y1="9" x2="21" y2="9"></line>
                                            </svg>
                                            <span className="page-name" style={{ textTransform: 'capitalize' }}>{pageId}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Layers/Navigator Panel */}
                    {activePanel === 'layers' && (
                        <div className="components-panel">
                            <div className="panel-header">
                                <h3>Navigator</h3>
                            </div>

                            {/* Navigator Tree */}
                            <div className="panel-content">
                                <div className="navigator-tree">
                                    {/* Global Root */}
                                    <div className="tree-item selected">
                                        <span className="tree-toggle"></span>
                                        <svg className="tree-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <circle cx="12" cy="12" r="10"></circle>
                                            <line x1="2" y1="12" x2="22" y2="12"></line>
                                            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
                                        </svg>
                                        <span className="tree-label">Global Root</span>
                                    </div>

                                    {/* Body */}
                                    <div className="tree-item indent-1">
                                        <span className="tree-toggle"></span>
                                        <svg className="tree-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                            <rect x="3" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="3" width="7" height="7"></rect>
                                            <rect x="14" y="14" width="7" height="7"></rect>
                                            <rect x="3" y="14" width="7" height="7"></rect>
                                        </svg>
                                        <span className="tree-label">Body</span>
                                    </div>

                                    {/* Page Wrapper */}
                                    <div className="tree-item indent-2">
                                        <button className="tree-toggle expanded">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="6 9 12 15 18 9"></polyline>
                                            </svg>
                                        </button>
                                        <input type="checkbox" className="tree-checkbox" />
                                        <span className="tree-label">Page Wrapper</span>
                                    </div>

                                    {/* Main */}
                                    <div className="tree-item indent-3">
                                        <button className="tree-toggle collapsed">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                                <polyline points="9 18 15 12 9 6"></polyline>
                                            </svg>
                                        </button>
                                        <input type="checkbox" className="tree-checkbox" />
                                        <span className="tree-label">Main</span>
                                    </div>
                                </div>
                            </div>

                            {/* CSS Preview Footer */}
                            <div className="css-preview">
                                <div className="css-preview-header">Css Preview</div>
                                <div className="css-preview-content">
                                    <div className="css-comment">/* Cascaded */</div>
                                    <div className="css-property">
                                        <span className="css-prop-name">--background-accent:</span>{' '}
                                        <span className="css-prop-value">var(--purple-5)</span>;
                                    </div>
                                    <div className="css-property">
                                        <span className="css-prop-name">--background-card:</span>{' '}
                                        <span className="css-prop-value">var(--background-primary, rgb(0 0 0 / 1))</span>;
                                    </div>
                                    <div className="css-property">
                                        <span className="css-prop-name">--background-primary:</span>{' '}
                                        <span className="css-prop-value">var(--gray-12)</span>;
                                    </div>
                                    <div className="css-property">
                                        <span className="css-prop-name">--background-secondary:</span>{' '}
                                        <span className="css-prop-value">var(--accent-12)</span>;
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Assets Panel */}
                    {activePanel === 'assets' && (
                        <div className="components-panel">
                            <div className="panel-header">
                                <h3>Assets</h3>
                                <button className="panel-header-btn" title="Upload Asset">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="17 8 12 3 7 8"></polyline>
                                        <line x1="12" y1="3" x2="12" y2="15"></line>
                                    </svg>
                                </button>
                            </div>

                            {/* Search */}
                            <div className="components-search">
                                <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <circle cx="11" cy="11" r="8"></circle>
                                    <path d="m21 21-4.35-4.35"></path>
                                </svg>
                                <input type="text" placeholder="Search" className="search-input" />
                            </div>

                            {/* Filters */}
                            <div className="assets-filters">
                                <select className="filter-select">
                                    <option>All (27)</option>
                                    <option>Images</option>
                                    <option>SVG</option>
                                    <option>Videos</option>
                                </select>
                                <button className="filter-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                        <line x1="16" y1="2" x2="16" y2="6"></line>
                                        <line x1="8" y1="2" x2="8" y2="6"></line>
                                        <line x1="3" y1="10" x2="21" y2="10"></line>
                                    </svg>
                                    Date created
                                </button>
                            </div>

                            {/* Assets Grid */}
                            <div className="panel-content">
                                <div className="assets-grid">
                                    <div className="asset-item">
                                        <div className="asset-thumbnail">
                                            <div className="asset-preview" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                <svg viewBox="0 0 24 24" fill="white" opacity="0.3">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                </svg>
                                            </div>
                                            <div className="asset-badge">CAN</div>
                                        </div>
                                        <div className="asset-name">ascend-c...png</div>
                                    </div>
                                    <div className="asset-item">
                                        <div className="asset-thumbnail">
                                            <div className="asset-preview" style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' }}>
                                                <svg viewBox="0 0 24 24" fill="white" opacity="0.3">
                                                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                                </svg>
                                            </div>
                                            <div className="asset-badge">CAN</div>
                                        </div>
                                        <div className="asset-name">ascend-d...png</div>
                                    </div>
                                    <div className="asset-item">
                                        <div className="asset-thumbnail">
                                            <div className="asset-preview" style={{ background: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)' }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                                    <circle cx="12" cy="7" r="4"></circle>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="asset-name">Property_...png</div>
                                    </div>
                                    <div className="asset-item">
                                        <div className="asset-thumbnail">
                                            <div className="asset-preview" style={{ background: 'linear-gradient(135deg, #000000 0%, #434343 100%)' }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="asset-name">Group_1_(1).svg</div>
                                    </div>
                                    <div className="asset-item">
                                        <div className="asset-thumbnail">
                                            <div className="asset-preview" style={{ background: '#ffffff' }}>
                                                <svg viewBox="0 0 24 24" fill="#333">
                                                    <circle cx="12" cy="12" r="10"></circle>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="asset-name">Icons.svg</div>
                                    </div>
                                    <div className="asset-item">
                                        <div className="asset-thumbnail">
                                            <div className="asset-preview" style={{ background: 'linear-gradient(to bottom, #ffffff 0%, #cccccc 100%)' }}>
                                            </div>
                                        </div>
                                        <div className="asset-name">Pattern.svg</div>
                                    </div>
                                    <div className="asset-item">
                                        <div className="asset-thumbnail">
                                            <div className="asset-preview" style={{ background: 'radial-gradient(circle, #6366f1 0%, #000000 70%)' }}>
                                            </div>
                                        </div>
                                        <div className="asset-name">Pricing.svg</div>
                                    </div>
                                    <div className="asset-item">
                                        <div className="asset-thumbnail">
                                            <div className="asset-preview" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"></path>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="asset-name">Propert...webp</div>
                                    </div>
                                    <div className="asset-item">
                                        <div className="asset-thumbnail">
                                            <div className="asset-preview" style={{ background: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)' }}>
                                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                                    <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                                    <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                                </svg>
                                            </div>
                                        </div>
                                        <div className="asset-name">App_Wid...png</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                    {/* AI Chat Panel */}
                    {activePanel === 'ai' && (
                        <div className="ai-panel">
                            <div className="panel-header">
                                <h3>AI Assistant</h3>
                                <button className="panel-header-btn" onClick={() => {
                                    setMessages([{ role: 'assistant', content: 'Design reset. Ready for a new project!' }]);
                                    setPages({
                                        home: [{
                                            id: 'hero-1',
                                            type: 'hero',
                                            content: { title: 'Build Your Dream Website', description: 'Ultimate design tool for modern creators.' },
                                            style: { padding: '80px 40px', background: 'linear-gradient(to bottom, #f9fafb, #fff)', color: '#1a1a1a', textAlign: 'center' }
                                        }]
                                    });
                                    setActivePageId('home');
                                    setSelectedElement(null);
                                }}>
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                        <path d="M3 6h18"></path>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>
                            <div className="ai-chat-messages">
                                {messages.map((msg, i) => (
                                    <div key={i} className={`ai-message ${msg.role}`}>
                                        {msg.content}
                                    </div>
                                ))}
                            </div>
                            <div className="ai-input-container">
                                <button
                                    className={`magic-build-btn ${isMagicBuilding ? 'loading' : ''}`}
                                    onClick={() => {
                                        if (aiInput.trim()) {
                                            handleMagicBuild(aiInput);
                                            setAiInput('');
                                        }
                                    }}
                                    disabled={isMagicBuilding}
                                >
                                    {isMagicBuilding ? 'Building...' : 'Magic Build (Full Site)'}
                                </button>
                                <div className="ai-input-wrapper">
                                    <input
                                        type="text"
                                        className="ai-input"
                                        placeholder="Ask AI to design something..."
                                        value={aiInput}
                                        onChange={(e) => setAiInput(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && aiInput.trim()) {
                                                const newMsg = { role: 'user', content: aiInput };
                                                setMessages(prev => [...prev, newMsg]);
                                                handleAiResponse(aiInput);
                                                setAiInput('');
                                            }
                                        }}
                                    />
                                    <button className="ai-send-btn" onClick={() => {
                                        if (aiInput.trim()) {
                                            const newMsg = { role: 'user', content: aiInput };
                                            setMessages(prev => [...prev, newMsg]);
                                            handleAiResponse(aiInput);
                                            setAiInput('');
                                        }
                                    }}>
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"></path>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Center Panel - Canvas */}
                <div className="studio-canvas">
                    <div className="canvas-header">
                        <div className="canvas-breadcrumb">
                            <span>Body</span>
                            <span className="breadcrumb-sep">›</span>
                            <span>Page Wrapper</span>
                        </div>
                        <div className="canvas-viewport-manager">
                            <div className="device-switcher">
                                <button
                                    className="device-btn"
                                    onClick={() => {
                                        if (viewport === 'desktop') setViewport('tablet');
                                        else if (viewport === 'tablet') setViewport('mobile');
                                    }}
                                    disabled={viewport === 'mobile'}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                                <span className="device-label">
                                    {viewport === 'desktop' && (
                                        <div className="device-label-content">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                                                <line x1="8" y1="21" x2="16" y2="21"></line>
                                                <line x1="12" y1="17" x2="12" y2="21"></line>
                                            </svg>
                                            Desktop
                                        </div>
                                    )}
                                    {viewport === 'tablet' && (
                                        <div className="device-label-content">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
                                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                            </svg>
                                            Tablet
                                        </div>
                                    )}
                                    {viewport === 'mobile' && (
                                        <div className="device-label-content">
                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                                <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                                                <line x1="12" y1="18" x2="12.01" y2="18"></line>
                                            </svg>
                                            Mobile
                                        </div>
                                    )}
                                </span>
                                <button
                                    className="device-btn"
                                    onClick={() => {
                                        if (viewport === 'mobile') setViewport('tablet');
                                        else if (viewport === 'tablet') setViewport('desktop');
                                    }}
                                    disabled={viewport === 'desktop'}
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="inspect-tool">
                                <button
                                    className={`inspect-btn ${isInspectMode ? 'active' : ''}`}
                                    onClick={() => setIsInspectMode(!isInspectMode)}
                                    title="Inspect Element"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                        <circle cx="11" cy="11" r="8"></circle>
                                        <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                                    </svg>
                                    <span className="inspect-text">Inspect</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="canvas-viewport" style={{ overflow: 'auto' }}>
                        <div className="canvas-content" style={{
                            width: viewport === 'mobile' ? '375px' : viewport === 'tablet' ? '768px' : '100%',
                            transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                            margin: '40px auto',
                            border: isInspectMode ? '2px dashed #6366f1' : '1px solid #2a2a2a'
                        }}>
                            {/* This is where the visual editing happens */}
                            <div className={`preview-browser ${isInspectMode ? 'inspect-active' : ''}`}>


                                <div className="sections-container" style={{ overflowY: 'auto', flex: 1 }}>
                                    {sections.map((section) => (
                                        <div
                                            key={section.id}
                                            className={`canvas-section ${selectedElement === section.id ? 'selected' : ''}`}
                                            style={{
                                                ...section.style,
                                                position: 'relative',
                                                cursor: 'pointer',
                                                border: selectedElement === section.id ? '2px solid #6366f1' : '1px transparent'
                                            }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedElement(section.id);
                                            }}
                                        >
                                            {section.type === 'hero' && (
                                                <div className="preview-hero" style={{ padding: 0, background: 'none' }}>
                                                    <h1>{section.content.title}</h1>
                                                    <p>{section.content.description}</p>
                                                    <div className="preview-cta">Start Free Trial</div>
                                                </div>
                                            )}
                                            {section.type === 'shop' && (
                                                <div className="preview-shop">
                                                    <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{section.content.title}</h2>
                                                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px' }}>
                                                        {[1, 2, 3].map(i => (
                                                            <div key={i} style={{ padding: '15px', border: '1px solid #eee', borderRadius: '8px' }}>
                                                                <div style={{ aspectRatio: '1', background: '#f3f4f6', borderRadius: '4px', marginBottom: '10px' }}></div>
                                                                <div style={{ fontWeight: 600 }}>Product Name {i}</div>
                                                                <div style={{ color: '#4f46e5', fontWeight: 700 }}>$99.00</div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                            {section.type === 'features' && (
                                                <div className="preview-features" style={{ padding: 0 }}>
                                                    {/* Existing cards but mapped */}
                                                    <div className="preview-feature-card">
                                                        <div className="feature-icon">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
                                                            </svg>
                                                        </div>
                                                        <div className="feature-title">Fast Performance</div>
                                                        <div className="feature-desc">Turbo-charged loading speeds.</div>
                                                    </div>
                                                    <div className="preview-feature-card">
                                                        <div className="feature-icon">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                                <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
                                                                <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
                                                                <path d="M2 2l7.586 7.586"></path>
                                                                <circle cx="11" cy="11" r="2"></circle>
                                                            </svg>
                                                        </div>
                                                        <div className="feature-title">Beautiful UI</div>
                                                        <div className="feature-desc">Premium components.</div>
                                                    </div>
                                                    <div className="preview-feature-card">
                                                        <div className="feature-icon">
                                                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                                                                <rect x="3" y="11" width="18" height="10" rx="2"></rect>
                                                                <circle cx="12" cy="5" r="2"></circle>
                                                                <path d="M12 7v4"></path>
                                                                <line x1="8" y1="16" x2="8.01" y2="16"></line>
                                                                <line x1="16" y1="16" x2="16.01" y2="16"></line>
                                                            </svg>
                                                        </div>
                                                        <div className="feature-title">AI Powered</div>
                                                        <div className="feature-desc">AI handles the heavy lifting.</div>
                                                    </div>
                                                </div>
                                            )}
                                            {section.type === 'footer' && (
                                                <div className="preview-footer">
                                                    <p>{section.content.text}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="canvas-footer">
                        <span className="footer-info">0 elements selected</span>
                        <span className="footer-info">1920 × 1080</span>
                    </div>
                </div>

                {/* Right Panel - Properties */}
                <div className="studio-panel right-panel">
                    {/* Tabs at top */}
                    <div className="panel-tabs-top">
                        <button
                            className={`panel-tab-top ${activeRightTab === 'style' ? 'active' : ''}`}
                            onClick={() => setActiveRightTab('style')}
                        >
                            Style
                        </button>
                        <button
                            className={`panel-tab-top ${activeRightTab === 'settings' ? 'active' : ''}`}
                            onClick={() => setActiveRightTab('settings')}
                        >
                            Settings
                        </button>
                    </div>

                    {/* Element Selector */}
                    <div className="element-selector">
                        <div className="element-selector-content">
                            <svg className="element-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
                                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
                            </svg>
                            <span className="element-name">Body</span>
                        </div>
                        <button className="element-menu-btn">⋯</button>
                    </div>

                    {/* Conditional Content Based on Active Tab */}
                    {activeRightTab === 'style' && (
                        <>
                            {/* Style Sources */}
                            <div className="style-sources-section">
                                <h4 className="section-label">Style Sources</h4>
                                <button className="add-style-source-btn">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" width="12" height="12">
                                        <line x1="12" y1="5" x2="12" y2="19" />
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Scrollable Properties Content */}
                            <div className="panel-content">
                                {!selectedElement ? (
                                    <div className="empty-state-properties">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32" style={{ marginBottom: '12px', opacity: 0.5 }}>
                                            <path d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5"></path>
                                        </svg>
                                        Select a section on the canvas to start editing its styles.
                                    </div>
                                ) : (
                                    <>
                                        {/* Layout Section */}
                                        <div className="property-section">
                                            <h4 className="section-title">Layout</h4>
                                            <div className="property-field">
                                                <label className="field-label">TextAlign</label>
                                                <select
                                                    className="field-select"
                                                    value={sections.find((s: any) => s.id === selectedElement)?.style.textAlign || 'left'}
                                                    onChange={(e) => updateSectionStyle(selectedElement!, { textAlign: e.target.value })}
                                                >
                                                    <option value="left">Left</option>
                                                    <option value="center">Center</option>
                                                    <option value="right">Right</option>
                                                </select>
                                            </div>
                                            <div className="property-field">
                                                <label className="field-label">Display</label>
                                                <select
                                                    className="field-select"
                                                    value={sections.find((s: any) => s.id === selectedElement)?.style.display || 'block'}
                                                    onChange={(e) => updateSectionStyle(selectedElement!, { display: e.target.value })}
                                                >
                                                    <option value="block">Block</option>
                                                    <option value="flex">Flex</option>
                                                    <option value="grid">Grid</option>
                                                    <option value="none">None</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Space Section */}
                                        <div className="property-section">
                                            <h4 className="section-title">Space</h4>
                                            <div className="property-field">
                                                <label className="field-label">Padding (Vertical)</label>
                                                <div className="field-with-unit">
                                                    <input
                                                        type="text"
                                                        className="field-input"
                                                        placeholder="40"
                                                        value={sections.find((s: any) => s.id === selectedElement)?.style.padding?.split(' ')[0].replace('px', '') || ''}
                                                        onChange={(e) => updateSectionStyle(selectedElement!, { padding: `${e.target.value}px 40px` })}
                                                    />
                                                    <span className="unit-indicator">px</span>
                                                </div>
                                            </div>
                                            <div className="property-field">
                                                <label className="field-label">Margin (Bottom)</label>
                                                <div className="field-with-unit">
                                                    <input
                                                        type="text"
                                                        className="field-input"
                                                        placeholder="0"
                                                        value={sections.find((s: any) => s.id === selectedElement)?.style.marginBottom?.replace('px', '') || '0'}
                                                        onChange={(e) => updateSectionStyle(selectedElement!, { marginBottom: `${e.target.value}px` })}
                                                    />
                                                    <span className="unit-indicator">px</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Typography Section */}
                                        <div className="property-section">
                                            <h4 className="section-title">Typography</h4>
                                            <div className="property-field">
                                                <label className="field-label">Font Size</label>
                                                <div className="field-with-unit">
                                                    <input
                                                        type="text"
                                                        className="field-input"
                                                        placeholder="16"
                                                        value={sections.find((s: any) => s.id === selectedElement)?.style.fontSize?.replace('px', '') || ''}
                                                        onChange={(e) => updateSectionStyle(selectedElement!, { fontSize: `${e.target.value}px` })}
                                                    />
                                                    <span className="unit-indicator">px</span>
                                                </div>
                                            </div>
                                            <div className="property-field">
                                                <label className="field-label">Font Weight</label>
                                                <select
                                                    className="field-select"
                                                    value={sections.find((s: any) => s.id === selectedElement)?.style.fontWeight || '400'}
                                                    onChange={(e) => updateSectionStyle(selectedElement!, { fontWeight: e.target.value })}
                                                >
                                                    <option value="300">Light</option>
                                                    <option value="400">Regular</option>
                                                    <option value="500">Medium</option>
                                                    <option value="600">Semibold</option>
                                                    <option value="700">Bold</option>
                                                </select>
                                            </div>
                                        </div>

                                        {/* Colors Section */}
                                        <div className="property-section">
                                            <h4 className="section-title">Colors</h4>
                                            <div className="property-field">
                                                <label className="field-label">Background</label>
                                                <div className="color-field">
                                                    <input
                                                        type="color"
                                                        className="color-picker"
                                                        value={sections.find(s => s.id === selectedElement)?.style.background?.startsWith('#') ? sections.find(s => s.id === selectedElement)?.style.background : '#ffffff'}
                                                        onChange={(e) => updateSectionStyle(selectedElement!, { background: e.target.value })}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="color-input"
                                                        value={sections.find(s => s.id === selectedElement)?.style.background || ''}
                                                        onChange={(e) => updateSectionStyle(selectedElement!, { background: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                            <div className="property-field">
                                                <label className="field-label">Text Color</label>
                                                <div className="color-field">
                                                    <input
                                                        type="color"
                                                        className="color-picker"
                                                        value={sections.find(s => s.id === selectedElement)?.style.color || '#000000'}
                                                        onChange={(e) => updateSectionStyle(selectedElement!, { color: e.target.value })}
                                                    />
                                                    <input
                                                        type="text"
                                                        className="color-input"
                                                        value={sections.find(s => s.id === selectedElement)?.style.color || ''}
                                                        onChange={(e) => updateSectionStyle(selectedElement!, { color: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* Borders Section */}
                                        <div className="property-section">
                                            <h4 className="section-title">Borders</h4>
                                            <div className="property-field">
                                                <label className="field-label">Radius</label>
                                                <div className="field-with-unit">
                                                    <input
                                                        type="text"
                                                        className="field-input"
                                                        placeholder="0"
                                                        value={sections.find(s => s.id === selectedElement)?.style.borderRadius?.replace('px', '') || '0'}
                                                        onChange={(e) => updateSectionStyle(selectedElement!, { borderRadius: `${e.target.value}px` })}
                                                    />
                                                    <span className="unit-indicator">px</span>
                                                </div>
                                            </div>
                                            <div className="property-field">
                                                <label className="field-label">Border Width</label>
                                                <div className="field-with-unit">
                                                    <input
                                                        type="text"
                                                        className="field-input"
                                                        placeholder="0"
                                                        value={sections.find(s => s.id === selectedElement)?.style.borderWidth?.replace('px', '') || '0'}
                                                        onChange={(e) => updateSectionStyle(selectedElement!, { borderWidth: `${e.target.value}px`, borderStyle: 'solid' })}
                                                    />
                                                    <span className="unit-indicator">px</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Effects Section */}
                                        <div className="property-section">
                                            <h4 className="section-title">Effects</h4>
                                            <div className="property-field">
                                                <label className="field-label">Opacity</label>
                                                <input
                                                    type="range"
                                                    min="0" max="1" step="0.1"
                                                    value={sections.find(s => s.id === selectedElement)?.style.opacity || '1'}
                                                    onChange={(e) => updateSectionStyle(selectedElement!, { opacity: e.target.value })}
                                                    style={{ width: '100%' }}
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </>
                    )}

                    {/* Settings Panel Content */}
                    {activeRightTab === 'settings' && (
                        <div className="panel-content">
                            {!selectedElement ? (
                                <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af' }}>
                                    Select a section to view its settings.
                                </div>
                            ) : (
                                <>
                                    <div className="settings-section">
                                        <h4 className="settings-section-title">Component Info</h4>
                                        <div className="settings-field">
                                            <label className="settings-label">ID</label>
                                            <input type="text" className="settings-input" value={selectedElement} readOnly />
                                        </div>
                                        <div className="settings-field">
                                            <label className="settings-label">Type</label>
                                            <input type="text" className="settings-input" value={sections.find(s => s.id === selectedElement)?.type || ''} readOnly />
                                        </div>
                                    </div>
                                    <div className="settings-section">
                                        <h4 className="settings-section-title">Visibility</h4>
                                        <div className="settings-field">
                                            <label className="settings-label">Show Component</label>
                                            <label className="toggle-switch">
                                                <input
                                                    type="checkbox"
                                                    checked={sections.find(s => s.id === selectedElement)?.style.display !== 'none'}
                                                    onChange={(e) => updateSectionStyle(selectedElement!, { display: e.target.checked ? 'block' : 'none' })}
                                                />
                                                <span className="toggle-slider"></span>
                                            </label>
                                        </div>
                                    </div>
                                    <div className="settings-section">
                                        <h4 className="settings-section-title">Metadata</h4>
                                        <div className="settings-field">
                                            <label className="settings-label">Last Edited</label>
                                            <input type="text" className="settings-input" value={new Date().toLocaleTimeString()} readOnly />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
