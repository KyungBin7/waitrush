import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, ArrowRight, ExternalLink, Eye, LayoutDashboard, LogOut, Search, ChevronDown, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { waitlistService } from "@/services/waitlist.service";
import heroBackground from "@/assets/hero-bg.jpg";
import premiumAppImage from "@/assets/premium-app.jpg";
import betaTestingImage from "@/assets/beta-testing.jpg";
import courseImage from "@/assets/course.jpg";
import waitrushLogo from "@/assets/waitrush-logo.png";

interface WaitlistItem {
  id: string;
  slug: string;
  name: string;
  description: string;
  image: string;
  participantCount: number;
  category: string; // Legacy field
  categories?: string[]; // New field
}

interface CategoryConfig {
  id: string;
  name: string;
  icon: string;
  subcategories: string[];
}

const CATEGORY_CONFIG: CategoryConfig[] = [
  {
    id: 'technology',
    name: 'Technology & Software',
    icon: '',
    subcategories: ['Software/SaaS', 'Web/App Development', 'Hardware', 'Productivity Tools', 'Developer Tools', 'AI/Machine Learning']
  },
  {
    id: 'business',
    name: 'Business & Finance',
    icon: '',
    subcategories: ['E-commerce', 'Marketing/Advertising', 'Fintech', 'CRM', 'Payment Services', 'Investment']
  },
  {
    id: 'lifestyle',
    name: 'Lifestyle & Services',
    icon: '',
    subcategories: ['Health/Wellness', 'Food & Beverage', 'Fashion/Beauty', 'Fitness', 'Food Delivery', 'Personal Styling']
  },
  {
    id: 'culture',
    name: 'Culture & Entertainment',
    icon: '',
    subcategories: ['Art/Design', 'Gaming', 'Media/Content', 'Streaming', 'Comics/Novels', 'NFT']
  },
  {
    id: 'education',
    name: 'Education & Community',
    icon: '',
    subcategories: ['Education', 'Community', 'Events', 'Online Classes', 'Language Learning', 'Workshops']
  }
];

// Category utility functions
const findMainCategory = (categories: string[]): string | null => {
  // Find which main category this service belongs to
  for (const mainCat of CATEGORY_CONFIG) {
    if (categories.some(cat => mainCat.subcategories.includes(cat))) {
      return mainCat.name;
    }
  }
  return null;
};

const prioritizeCategories = (categories: string[], selectedMainCategory: string, selectedSubCategory: string) => {
  if (!categories?.length) return { display: [], remaining: 0, total: categories || [] };
  
  const uniqueCategories = Array.from(new Set(categories));
  
  // Priority scoring
  const scoredCategories = uniqueCategories.map(cat => {
    let score = 0;
    
    // 1. Boost if matches current filter
    if (selectedMainCategory !== 'all') {
      const mainCatConfig = CATEGORY_CONFIG.find(c => c.id === selectedMainCategory);
      if (mainCatConfig?.subcategories.includes(cat)) score += 100;
    }
    if (selectedSubCategory !== 'all' && cat === selectedSubCategory) score += 200;
    
    // 2. Boost main categories (find parent category names)
    const isMainCategory = CATEGORY_CONFIG.some(c => 
      c.name.toLowerCase().includes(cat.toLowerCase()) || 
      cat.toLowerCase().includes(c.name.toLowerCase())
    );
    if (isMainCategory) score += 50;
    
    // 3. Boost popular categories
    const popularCategories = ['SaaS', 'AI/Machine Learning', 'Mobile App', 'Web App', 'E-commerce', 'Productivity Tools'];
    if (popularCategories.includes(cat)) score += 30;
    
    // 4. Penalize very long names
    if (cat.length > 20) score -= 10;
    
    return { category: cat, score };
  });
  
  // Sort by score and get display categories
  scoredCategories.sort((a, b) => b.score - a.score);
  const mainCategory = findMainCategory(categories);
  
  let displayCategories = [];
  if (mainCategory && !uniqueCategories.includes(mainCategory)) {
    displayCategories.push(mainCategory);
  }
  
  // Add top scored category (that's not already the main category)
  const topSubCategory = scoredCategories.find(sc => sc.category !== mainCategory)?.category;
  if (topSubCategory) {
    displayCategories.push(topSubCategory);
  } else if (!mainCategory && scoredCategories.length > 0) {
    displayCategories.push(scoredCategories[0].category);
  }
  
  // Limit to 2 categories max
  displayCategories = displayCategories.slice(0, 2);
  
  return {
    display: displayCategories,
    remaining: Math.max(0, uniqueCategories.length - displayCategories.length),
    total: uniqueCategories
  };
};

const Index = () => {
  const { isAuthenticated, user, logout, isLoading: authLoading } = useAuth();
  const [waitlists, setWaitlists] = useState<WaitlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMainCategory, setSelectedMainCategory] = useState<string>("all");
  const [selectedSubCategory, setSelectedSubCategory] = useState<string>("all");
  const [isCategoryExpanded, setIsCategoryExpanded] = useState<boolean>(false);
  const categoryRef = useRef<HTMLDivElement>(null);
  const [searchInput, setSearchInput] = useState("");
  const [animationKey, setAnimationKey] = useState(0);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();
  const [isMobile, setIsMobile] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const services = await waitlistService.getAllPublicServices();
        const mappedServices: WaitlistItem[] = services.map(service => ({
          id: service.id,
          slug: service.slug,
          name: service.name,
          description: service.description || '',
          image: service.iconImage || premiumAppImage, // fallback to default image
          participantCount: service.participantCount,
          category: service.category || 'General',
          categories: service.categories // Add categories array mapping
        }));
        setWaitlists(mappedServices);
      } catch (error) {
        console.error('Error fetching services:', error);
        // Fallback to empty array on error
        setWaitlists([]);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  // Device detection for mobile/desktop interactions
  useEffect(() => {
    const checkDevice = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    
    checkDevice();
    window.addEventListener('resize', checkDevice);
    return () => window.removeEventListener('resize', checkDevice);
  }, []);

  // Get subcategories for selected main category
  const availableSubCategories = useMemo(() => {
    if (selectedMainCategory === 'all') {
      const allSubs = CATEGORY_CONFIG.flatMap(cat => cat.subcategories);
      const uniqueSubs = Array.from(new Set(allSubs));
      return ['all', ...uniqueSubs.sort()];
    }
    
    const selectedCategoryConfig = CATEGORY_CONFIG.find(cat => cat.id === selectedMainCategory);
    return selectedCategoryConfig 
      ? ['all', ...selectedCategoryConfig.subcategories]
      : ['all'];
  }, [selectedMainCategory]);

  // Filter waitlists based on search query and selected categories
  const filteredWaitlists = useMemo(() => {
    return waitlists.filter(waitlist => {
      // Search filter
      const matchesSearch = searchQuery === '' || 
        waitlist.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        waitlist.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Main category filter
      let matchesMainCategory = true;
      if (selectedMainCategory !== 'all') {
        const categoryConfig = CATEGORY_CONFIG.find(cat => cat.id === selectedMainCategory);
        if (categoryConfig) {
          // Check if any of the service categories matches the selected main category's subcategories
          const serviceCategories = waitlist.categories?.length 
            ? waitlist.categories 
            : (waitlist.category ? [waitlist.category] : []);
          matchesMainCategory = serviceCategories.some(cat => 
            categoryConfig.subcategories.includes(cat)
          );
        } else {
          matchesMainCategory = false;
        }
      }
      
      // Sub category filter
      let matchesSubCategory = selectedSubCategory === 'all';
      if (!matchesSubCategory) {
        const serviceCategories = waitlist.categories?.length 
          ? waitlist.categories 
          : (waitlist.category ? [waitlist.category] : []);
        matchesSubCategory = serviceCategories.includes(selectedSubCategory);
      }
      
      return matchesSearch && matchesMainCategory && matchesSubCategory;
    });
  }, [waitlists, selectedMainCategory, selectedSubCategory, searchQuery]);

  // Trigger animation when filters change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [selectedMainCategory, selectedSubCategory, searchQuery]);

  // Reset subcategory when main category changes
  useEffect(() => {
    setSelectedSubCategory('all');
  }, [selectedMainCategory]);

  // Handle click outside to close category filter
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (categoryRef.current && !categoryRef.current.contains(event.target as Node)) {
        setIsCategoryExpanded(false);
      }
    };

    if (isCategoryExpanded) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoryExpanded]);

  // Close expanded mobile categories when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is outside any expanded category
      const target = event.target as Element;
      if (expandedCard && !target.closest('[data-category-container]')) {
        setExpandedCard(null);
      }
    };

    if (expandedCard && isMobile) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [expandedCard, isMobile]);

  return (
    <div className="min-h-screen relative gaming-lightning-accents">
      {/* Gaming Background System */}
      <div className="gaming-bg-main gaming-bg-animated gaming-bg-lightning" />
      <div className="gaming-bg-grid fixed inset-0 z-0" />
      <div className="gaming-bg-particles fixed inset-0 z-0" />
      
      {/* Navigation */}
      <nav className="gaming-nav border-b border-border/50 fixed top-0 left-0 right-0 z-50">
        <div className="responsive-container">
          <div className="flex items-center justify-between h-14 sm:h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <img 
                  src={waitrushLogo} 
                  alt="WaitRush Gaming Queue" 
                  className="waitrush-logo h-40 sm:h-48 w-auto"
                />
              </Link>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              {authLoading ? (
                // Show loading state while checking auth
                <div className="h-9 w-32 bg-muted/50 rounded animate-pulse" />
              ) : isAuthenticated ? (
                // Show authenticated user options
                <>
                  <span className="hidden sm:inline text-sm text-muted-foreground">
                    Welcome, {user?.email?.split('@')[0]}
                  </span>
                  <Button variant="ghost" size="sm" className="touch-friendly-sm" asChild>
                    <Link to="/dashboard">
                      <LayoutDashboard className="h-4 w-4 sm:mr-2" />
                      <span className="hidden sm:inline">Dashboard</span>
                    </Link>
                  </Button>
                  <Button variant="ghost" size="sm" className="touch-friendly-sm" onClick={logout}>
                    <LogOut className="h-4 w-4 sm:mr-2" />
                    <span className="hidden sm:inline">Sign Out</span>
                  </Button>
                </>
              ) : (
                // Show login/signup options for unauthenticated users
                <>
                  <Button variant="ghost" size="sm" className="touch-friendly-sm" asChild>
                    <Link to="/login">
                      <span className="hidden sm:inline">Organizer </span>Login
                    </Link>
                  </Button>
                  <Button variant="waitrush" size="sm" className="touch-friendly-sm" asChild>
                    <Link to="/signup">
                      <span className="hidden sm:inline">Create Waitlist</span>
                      <span className="sm:hidden">Sign Up</span>
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="relative z-10 pt-14 sm:pt-16">
        <div className="responsive-container py-8 sm:py-12">
          {/* Header */}
          <div className="text-center mb-8 sm:mb-12 animate-fade-in">
            <h1 className="responsive-text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Discover Amazing
              <br />
              <span className="bg-gradient-primary bg-clip-text text-transparent text-glow-yellow">
                Upcoming Projects
              </span>
            </h1>
            <p className="responsive-text-lg text-muted-foreground max-w-2xl mx-auto px-4">
              Join the rush for the most exciting new products and services. Get priority access when they launch.
            </p>
          </div>

          {/* Enhanced Search Bar with Better Visibility */}
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in">
            <div className="relative group">
              <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-primary-glow rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500"></div>
              <div className="relative gaming-glass-enhanced rounded-2xl shadow-xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-primary h-5 w-5 z-10" />
                <Input
                  type="text"
                  placeholder="Search for amazing rushing opportunities..."
                  value={searchInput}
                  onChange={(e) => {
                    const value = e.target.value;
                    setSearchInput(value);
                    
                    // Clear previous timeout
                    if (debounceTimeoutRef.current) {
                      clearTimeout(debounceTimeoutRef.current);
                    }
                    
                    // Set new timeout for search query update
                    debounceTimeoutRef.current = setTimeout(() => {
                      setSearchQuery(value);
                    }, 300);
                  }}
                  className="w-full pl-12 pr-4 py-4 h-14 text-base bg-transparent border-0 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 placeholder:text-muted-foreground/60 font-medium"
                />
                {(searchQuery || searchInput) && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setSearchInput('');
                      if (debounceTimeoutRef.current) {
                        clearTimeout(debounceTimeoutRef.current);
                      }
                    }}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Hybrid Category Filter - Collapsible */}
          <div ref={categoryRef} className="mb-8 sm:mb-12 animate-fade-in">
            <div className="max-w-5xl mx-auto px-2 sm:px-0">
              <div className="gaming-container rounded-xl sm:rounded-2xl shadow-lg">
                {/* Header - Always Visible */}
                <div 
                  className="p-4 cursor-pointer select-none"
                  onClick={() => setIsCategoryExpanded(!isCategoryExpanded)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Filter className="h-5 w-5 text-primary" />
                      <span className="font-semibold text-base sm:text-lg text-foreground">
                        Filter by Category
                      </span>
                      {selectedMainCategory !== 'all' && (
                        <span className="text-sm text-muted-foreground">
                          - {CATEGORY_CONFIG.find(cat => cat.id === selectedMainCategory)?.name}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-3">
                      {/* Popular categories preview when collapsed */}
                      {!isCategoryExpanded && (
                        <div className="hidden sm:flex items-center gap-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedMainCategory('all');
                            }}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              selectedMainCategory === 'all'
                                ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-primary/10'
                            }`}
                          >
                            All
                          </button>
                          {CATEGORY_CONFIG.slice(0, 3).map((category) => (
                            <button
                              key={category.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedMainCategory(category.id);
                              }}
                              className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                                selectedMainCategory === category.id
                                  ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground'
                                  : 'bg-muted text-muted-foreground hover:bg-primary/10'
                              }`}
                            >
                              {category.name.split(' ')[0]}
                            </button>
                          ))}
                          <span className="text-xs text-muted-foreground font-medium">
                            +{CATEGORY_CONFIG.length - 3} more
                          </span>
                        </div>
                      )}
                      <ChevronDown 
                        className={`h-5 w-5 text-muted-foreground transition-transform duration-300 ${
                          isCategoryExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </div>
                  </div>
                  {/* Mobile preview when collapsed */}
                  {!isCategoryExpanded && (
                    <div className="flex sm:hidden items-center gap-2 mt-3 overflow-x-auto">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedMainCategory('all');
                        }}
                        className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                          selectedMainCategory === 'all'
                            ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground'
                            : 'bg-muted text-muted-foreground'
                        }`}
                      >
                        All
                      </button>
                      {CATEGORY_CONFIG.slice(0, 2).map((category) => (
                        <button
                          key={category.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedMainCategory(category.id);
                          }}
                          className={`px-3 py-1 rounded-full text-xs font-medium transition-all flex-shrink-0 ${
                            selectedMainCategory === category.id
                              ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {category.name.split(' ')[0]}
                        </button>
                      ))}
                      <span className="text-xs text-muted-foreground font-medium flex-shrink-0">
                        tap to expand
                      </span>
                    </div>
                  )}
                </div>

                {/* Expandable Content */}
                <div 
                  className={`overflow-hidden transition-all duration-300 ease-in-out ${
                    isCategoryExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
                  }`}
                >
                  <div className="px-4 pb-4 border-t border-border/20">
                    {/* Main Categories */}
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground font-medium mb-3">MAIN CATEGORIES</p>
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => setSelectedMainCategory('all')}
                          className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                            selectedMainCategory === 'all'
                              ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-md'
                              : 'bg-white/50 dark:bg-card/50 text-foreground hover:bg-white dark:hover:bg-card border border-border/30'
                          }`}
                        >
                          All Categories
                        </button>
                        {CATEGORY_CONFIG.map((category) => (
                          <button
                            key={category.id}
                            onClick={() => setSelectedMainCategory(category.id)}
                            className={`px-4 py-2 rounded-xl font-medium text-sm transition-all ${
                              selectedMainCategory === category.id
                                ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-md'
                                : 'bg-white/50 dark:bg-card/50 text-foreground hover:bg-white dark:hover:bg-card border border-border/30'
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Sub Categories */}
                    <div className="mt-4">
                      <p className="text-xs text-muted-foreground font-medium mb-3">
                        {selectedMainCategory === 'all' ? 'ALL SUBCATEGORIES' : 'SUBCATEGORIES'}
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {availableSubCategories.map((subcategory) => (
                          <button
                            key={subcategory}
                            onClick={() => setSelectedSubCategory(subcategory)}
                            className={`px-3 py-1.5 rounded-full font-medium text-xs transition-all ${
                              selectedSubCategory === subcategory 
                                ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground shadow-sm' 
                                : 'bg-muted/50 text-foreground hover:bg-muted border border-border/20'
                            }`}
                          >
                            {subcategory === 'all' ? 'All' : subcategory}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Results Count */}
          {(searchQuery || selectedMainCategory !== 'all' || selectedSubCategory !== 'all') && (
            <div className="text-center mb-6 text-muted-foreground">
              Found {filteredWaitlists.length} {filteredWaitlists.length === 1 ? 'rush' : 'rushes'}
              {selectedMainCategory !== 'all' && ` in ${CATEGORY_CONFIG.find(cat => cat.id === selectedMainCategory)?.name || selectedMainCategory}`}
              {selectedSubCategory !== 'all' && ` - ${selectedSubCategory}`}
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}

          {/* Fluid Grid with Morphing Transitions */}
          {filteredWaitlists.length > 0 ? (
            <div 
              key={animationKey}
              className="responsive-grid-cols-3 px-2 sm:px-0"
            >
              {filteredWaitlists.map((waitlist, index) => (
                <Card 
                  key={waitlist.id}
                  variant="interactive"
                  className="waitlist-card relative shadow-card-premium hover:shadow-2xl transition-all duration-500 group overflow-hidden"
                  style={{
                    animationDelay: `${index * 140}ms`,
                    animation: `cardElegantFade 0.7s cubic-bezier(0.4, 0, 0.2, 1) forwards`,
                    opacity: 0,
                    transform: 'scale(0.95)'
                  }}
                >
                  <Link to={`/service/${waitlist.slug}`} className="block">
                    <div className="relative h-48 overflow-hidden">
                      <img 
                        src={waitlist.image} 
                        alt={waitlist.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="absolute top-3 right-2 transform transition-all duration-300 group-hover:scale-110">
{waitlist.categories?.length ? (() => {
                          const mainCategory = findMainCategory(waitlist.categories);
                          const displayCategories = [];
                          
                          // Always show main category first if it exists
                          if (mainCategory) {
                            displayCategories.push({
                              name: mainCategory,
                              isMain: true
                            });
                          }
                          
                          // Add top subcategory if different from main  
                          const topSubcategory = waitlist.categories.find(cat => cat !== mainCategory);
                          if (topSubcategory && displayCategories.length < 2) {
                            displayCategories.push({
                              name: topSubcategory,
                              isMain: false
                            });
                          }
                          
                          // For display, we show only 1 category initially  
                          const totalCategories = waitlist.categories.length;
                          const displayedCount = 1; // We only show 1 category initially
                          const remainingCount = totalCategories - displayedCount;
                          const isExpanded = expandedCard === waitlist.id;
                          const hasMoreCategories = totalCategories >= 1;
                          
                          const handleCategoryInteraction = (e: React.MouseEvent) => {
                            e.preventDefault();
                            e.stopPropagation();
                            
                            if (isMobile && hasMoreCategories) {
                              // Mobile: Toggle expansion
                              setExpandedCard(isExpanded ? null : waitlist.id);
                            }
                          };
                          
                          const handleCategoryFilter = (categoryName: string, isMain: boolean) => {
                            if (isMain) {
                              // Find the category ID that contains this subcategory
                              const categoryConfig = CATEGORY_CONFIG.find(config => 
                                config.name === categoryName || 
                                config.subcategories.some(sub => 
                                  waitlist.categories?.includes(sub)
                                )
                              );
                              if (categoryConfig) {
                                setSelectedMainCategory(categoryConfig.id);
                              }
                              setSelectedSubCategory('all');
                            } else {
                              setSelectedSubCategory(categoryName);
                            }
                          };
                          
                          return (
                            <div className="relative" data-category-container>
                              {/* Main category display */}
                              <div 
                                className={`
                                  flex items-center gap-1 cursor-pointer justify-end
                                  ${isMobile ? 'touch-manipulation' : ''}
                                `}
                                onClick={handleCategoryInteraction}
                              >
                                {displayCategories.slice(0, 1).map((cat, idx) => (
                                  <span 
                                    key={idx}
                                    className={`px-2 py-1 text-xs font-semibold rounded-full backdrop-blur-md shadow-lg transition-all hover:brightness-110 ${
                                      cat.isMain 
                                        ? 'bg-gradient-to-r from-primary to-primary-glow text-primary-foreground border border-primary/20'
                                        : 'bg-white/90 dark:bg-gray-800/90 text-primary border border-primary/30'
                                    }`}
                                    onClick={(e) => {
                                      if (!isMobile || !hasMoreCategories) {
                                        e.stopPropagation();
                                        handleCategoryFilter(cat.name, cat.isMain);
                                      }
                                    }}
                                  >
                                    {cat.name}
                                  </span>
                                ))}
                                
                                {/* Mobile only indicators */}
                                {hasMoreCategories && isMobile && (
                                  <>
                                    <span className="text-white/80 text-xs ml-1 transition-transform duration-200">
                                      {isExpanded ? '×' : '⋯'}
                                    </span>
                                    {/* Mobile counter badge */}
                                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500/90 rounded-full text-xs text-white flex items-center justify-center font-bold backdrop-blur-sm">
                                      {totalCategories}
                                    </div>
                                  </>
                                )}
                              </div>
                              
                              {/* Expanded categories - Notification Center Style */}
                              {hasMoreCategories && (
                                <div className={`
                                  absolute z-30
                                  ${isMobile 
                                    ? `top-full mt-3 right-0 transform transition-all duration-300 ease-out ${
                                        isExpanded ? 'scale-100 opacity-100 translate-y-0' : 'scale-98 opacity-0 translate-y-2 pointer-events-none'
                                      }`
                                    : 'top-full mt-3 right-0 opacity-0 scale-98 translate-y-2 group-hover:opacity-100 group-hover:scale-100 group-hover:translate-y-0 transition-all duration-250 ease-out pointer-events-none group-hover:pointer-events-auto'
                                  }
                                `}>
                                  
                                  {/* Notification Card Container */}
                                  <div className="bg-background/95 dark:bg-card/95 rounded-lg shadow-lg border border-primary/20 backdrop-blur-sm overflow-hidden w-40">
                                    
                                    {/* Card Header */}
                                    <div className="px-2 py-1 bg-primary/5 dark:bg-primary/10 border-b border-primary/15">
                                      <div className="flex items-center gap-1.5">
                                        <div className="w-1 h-1 rounded-full bg-primary"></div>
                                        <span className="text-xs font-medium text-foreground">
                                          All Categories
                                        </span>
                                        <span className="ml-auto text-xs text-muted-foreground">
                                          {waitlist.categories.length}
                                        </span>
                                      </div>
                                    </div>
                                    
                                    {/* Categories List */}
                                    <div className="py-0.5">
                                      {waitlist.categories.map((categoryName, idx) => {
                                        const isMainCat = categoryName === mainCategory;
                                        return (
                                          <div
                                            key={idx}
                                            className={`
                                              px-2 py-1 cursor-pointer transition-all duration-150
                                              ${isMainCat 
                                                ? 'bg-primary/10 dark:bg-primary/20 border-l-2 border-primary text-primary dark:text-primary' 
                                                : 'hover:bg-primary/5 dark:hover:bg-primary/10 text-foreground'
                                              }
                                            `}
                                            onClick={(e) => {
                                              e.preventDefault();
                                              e.stopPropagation();
                                              handleCategoryFilter(categoryName, isMainCat);
                                              if (isMobile) {
                                                setExpandedCard(null);
                                              }
                                            }}
                                          >
                                            <div className="flex items-center justify-between">
                                              <span className="text-xs font-medium">
                                                {categoryName}
                                              </span>
                                              {isMainCat && (
                                                <div className="flex items-center gap-1">
                                                  <span className="text-xs text-primary dark:text-primary font-medium">Main</span>
                                                  <div className="w-1 h-1 rounded-full bg-primary"></div>
                                                </div>
                                              )}
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                    
                                    {/* Card Footer */}
                                    <div className="px-2 py-0.5 bg-primary/5 dark:bg-primary/10 border-t border-primary/15">
                                      <div className="text-xs text-muted-foreground text-center">
                                        Tap to filter
                                      </div>
                                    </div>
                                    
                                  </div>
                                </div>
                              )}
                            </div>
                          );
                        })() : waitlist.category ? (
                          <span 
                            className="px-3 py-1.5 bg-gradient-to-r from-primary to-primary-glow text-primary-foreground text-xs font-semibold rounded-full backdrop-blur-md shadow-lg cursor-pointer hover:brightness-110 transition-all"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              // Find the category ID that contains this category
                              const categoryConfig = CATEGORY_CONFIG.find(config => 
                                config.subcategories.includes(waitlist.category)
                              );
                              if (categoryConfig) {
                                setSelectedMainCategory(categoryConfig.id);
                              }
                              setSelectedSubCategory('all');
                            }}
                          >
                            {waitlist.category}
                          </span>
                        ) : null}
                      </div>
                    </div>
                    
                    <CardHeader>
                      <CardTitle className="text-xl group-hover:text-primary transition-colors">
                        {waitlist.name}
                      </CardTitle>
                      <CardDescription className="text-sm line-clamp-2">
                        {waitlist.description}
                      </CardDescription>
                    </CardHeader>
                    
                    <CardContent className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm font-medium">
                            {loading ? 'Loading...' : `${waitlist.participantCount.toLocaleString()} joined`}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Link>
                  
                  <CardContent className="pt-0 pb-6">
                    <Button 
                      className="w-full" 
                      size="lg"
                      asChild
                    >
                      <Link to={`/waitlist/${waitlist.slug}`}>
                        Join Rush
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Card className="gaming-layer-card shadow-glass inline-block">
                <CardContent className="py-8 px-12">
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No rushes found
                  </h3>
                  <p className="text-muted-foreground">
                    {searchQuery ? `No results for "${searchQuery}"` : 'No rushes in this category'}
                  </p>
                  {(searchQuery || selectedMainCategory !== 'all' || selectedSubCategory !== 'all') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-4 hover:scale-105 transition-transform duration-200"
                      onClick={() => {
                        setSearchQuery('');
                        setSearchInput('');
                        setSelectedMainCategory('all');
                        setSelectedSubCategory('all');
                        if (debounceTimeoutRef.current) {
                          clearTimeout(debounceTimeoutRef.current);
                        }
                      }}
                    >
                      Clear filters
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          )}

          {/* Call to Action for Organizers */}
          {!authLoading && (
            <div className="mt-16 text-center animate-slide-up">
              <Card className="gaming-glass shadow-glass inline-block">
                <CardContent className="py-8 px-12">
                  {isAuthenticated ? (
                    // Show dashboard CTA for authenticated users
                    <>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        Manage your rushes
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Go to your dashboard to create and manage your rush services
                      </p>
                      <Button variant="outline" size="lg" asChild>
                        <Link to="/dashboard">
                          <LayoutDashboard className="mr-2 h-4 w-4" />
                          Go to Dashboard
                        </Link>
                      </Button>
                    </>
                  ) : (
                    // Show signup CTA for unauthenticated users
                    <>
                      <h3 className="text-2xl font-bold text-foreground mb-3">
                        Want to create your own rush?
                      </h3>
                      <p className="text-muted-foreground mb-6">
                        Build anticipation for your product with beautiful rush pages
                      </p>
                      <Button variant="outline" size="lg" asChild>
                        <Link to="/signup">
                          <ExternalLink className="mr-2 h-4 w-4" />
                          Start Building
                        </Link>
                      </Button>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 gaming-nav border-t border-border/50 mt-12 sm:mt-16">
        <div className="responsive-container py-6 sm:py-8">
          <div className="text-center responsive-text-sm text-muted-foreground">
            © 2024 WaitRush Gaming Queue. Discover and join amazing upcoming projects.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
