import { useState, useEffect, useMemo, useRef, useLayoutEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Users, ArrowRight, ExternalLink, Eye, LayoutDashboard, LogOut, Search, ChevronDown, Filter } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";
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
              <div className="relative group">
                {/* Gaming glow effect */}
                <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-yellow-400 rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300" />
                <Card className="glass shadow-card-premium relative overflow-hidden">
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5"
                  animate={{
                    x: ['-100%', '100%']
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    repeatDelay: 6,
                    ease: "easeInOut"
                  }}
                />
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
                </Card>
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
              className="space-y-6"
            >
              {/* Gaming Leaderboard Layout */}
              {(() => {
                // Sort by participant count for leaderboard
                const sortedWaitlists = [...filteredWaitlists].sort((a, b) => b.participantCount - a.participantCount);
                const topThree = sortedWaitlists.slice(0, 3);
                const remaining = sortedWaitlists.slice(3);
                
                return (
                  <>
                    {/* Podium Section - Top 3 */}
                    {topThree.length > 0 && (
                      <div className="mb-8">
                        <motion.div
                          initial={{ opacity: 0, y: 30 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.6 }}
                          className="text-center mb-6"
                        >
                          <h2 className="text-2xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
                            <span className="text-primary">⚡</span>
                            RUSH LEADERBOARD
                            <span className="text-primary">⚡</span>
                          </h2>
                          <p className="text-muted-foreground text-sm">Top gaming queues ranked by rush power</p>
                        </motion.div>
                        
                        <div className="grid md:grid-cols-3 gap-4 md:gap-6">
                          {topThree.map((waitlist, index) => {
                            const rank = index + 1;
                            const medals = ['🥇', '🥈', '🥉'];
                            const rankColors = ['text-yellow-400', 'text-gray-400', 'text-amber-600'];
                            const glowColors = ['shadow-yellow-400/20', 'shadow-gray-400/20', 'shadow-amber-600/20'];
                            
                            return (
                              <motion.div
                                key={waitlist.id}
                                initial={{ opacity: 0, scale: 0.8, y: 50 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                transition={{ 
                                  duration: 0.8, 
                                  delay: index * 0.2,
                                  type: "spring",
                                  bounce: 0.4 
                                }}
                                className={cn(
                                  "relative group cursor-pointer transform transition-all duration-500",
                                  index === 0 ? "md:scale-110" : "md:scale-100 md:hover:scale-105"
                                )}
                              >
                                <Link to={`/service/${waitlist.slug}`} className="block">
                                  <Card className={cn(
                                    "relative overflow-hidden border-2 transition-all duration-500",
                                    "bg-gradient-to-br from-card/80 to-card/40 backdrop-blur-md",
                                    "hover:shadow-2xl hover:shadow-primary/30 hover:border-primary/60",
                                    glowColors[index],
                                    index === 0 ? "border-primary/50" : "border-border/30 hover:border-primary/40"
                                  )}>
                                    {/* Rank Badge */}
                                    <div className={cn(
                                      "absolute -top-3 -left-3 w-12 h-12 rounded-full flex items-center justify-center text-2xl font-bold z-10",
                                      "bg-gradient-to-br from-background to-card border-2",
                                      index === 0 ? "border-primary" : "border-muted-foreground/30"
                                    )}>
                                      {medals[index]}
                                    </div>
                                    
                                    {/* Lightning Effect Corner */}
                                    <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden">
                                      <div className={cn(
                                        "absolute -top-8 -right-8 w-16 h-16 rotate-45",
                                        "bg-gradient-to-br from-primary/20 to-transparent",
                                        "transition-all duration-300 group-hover:from-primary/40"
                                      )} />
                                    </div>
                                    
                                    <CardContent className="p-6">
                                      {/* Service Icon */}
                                      <div className="flex items-center mb-4">
                                        <div className="relative">
                                          <img 
                                            src={waitlist.image} 
                                            alt={waitlist.name}
                                            className="w-16 h-16 rounded-xl object-cover ring-2 ring-primary/20 transition-all duration-300 group-hover:ring-primary/40"
                                          />
                                          <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/20 rounded-xl transition-all duration-300 group-hover:from-primary/10 group-hover:to-primary/30" />
                                        </div>
                                        <div className="ml-4 flex-1 min-w-0">
                                          <h3 className="text-lg font-bold text-foreground truncate group-hover:text-primary transition-colors duration-300">
                                            {waitlist.name}
                                          </h3>
                                          <div className={cn("text-sm font-medium", rankColors[index])}>
                                            #{rank} RUSH CHAMPION
                                          </div>
                                        </div>
                                      </div>
                                      
                                      {/* Rush Counter */}
                                      <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                          <Users className="h-5 w-5 text-primary" />
                                          <span className="text-sm text-muted-foreground">RUSH POWER</span>
                                        </div>
                                        <motion.div
                                          className="flex items-center gap-1"
                                          whileHover={{ scale: 1.1 }}
                                          transition={{ type: "spring", bounce: 0.5 }}
                                        >
                                          <span className="text-2xl font-black text-primary">
                                            {waitlist.participantCount.toLocaleString()}
                                          </span>
                                          <span className="text-primary text-xl">⚡</span>
                                        </motion.div>
                                      </div>
                                      
                                      {/* Description */}
                                      <p className="text-sm text-muted-foreground line-clamp-2 mb-4">
                                        {waitlist.description}
                                      </p>
                                      
                                      {/* Categories */}
                                      <div className="flex flex-wrap gap-2">
                                        {(() => {
                                          const { display, remaining } = prioritizeCategories(
                                            waitlist.categories || [waitlist.category], 
                                            selectedMainCategory, 
                                            selectedSubCategory
                                          );
                                          return (
                                            <>
                                              {display.map((category, idx) => (
                                                <motion.div
                                                  key={category}
                                                  initial={{ opacity: 0, scale: 0.8 }}
                                                  animate={{ opacity: 1, scale: 1 }}
                                                  transition={{ delay: 0.1 * idx }}
                                                  className="px-3 py-1 text-xs font-medium rounded-full bg-primary/20 text-primary border border-primary/30 hover:bg-primary/30 transition-colors"
                                                >
                                                  {category}
                                                </motion.div>
                                              ))}
                                              {remaining > 0 && (
                                                <span className="px-2 py-1 text-xs text-muted-foreground">
                                                  +{remaining}
                                                </span>
                                              )}
                                            </>
                                          );
                                        })()}
                                      </div>
                                    </CardContent>
                                  </Card>
                                </Link>
                              </motion.div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                    
                    {/* Leaderboard Section - Remaining Services */}
                    {remaining.length > 0 && (
                      <div className="space-y-3">
                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.8 }}
                          className="flex items-center gap-3 mb-4"
                        >
                          <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent flex-1" />
                          <span className="text-sm font-medium text-primary uppercase tracking-wider">
                            RISING CHAMPIONS
                          </span>
                          <div className="h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent flex-1" />
                        </motion.div>
                        
                        {remaining.map((waitlist, index) => {
                          const rank = index + 4; // Starting from rank 4
                          
                          return (
                            <motion.div
                              key={waitlist.id}
                              initial={{ opacity: 0, x: -50 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ 
                                duration: 0.5, 
                                delay: 0.9 + (index * 0.1),
                                type: "spring",
                                damping: 20
                              }}
                              className="group"
                            >
                              <Link to={`/service/${waitlist.slug}`} className="block">
                                <Card className="relative overflow-hidden border transition-all duration-300 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 bg-gradient-to-r from-card/60 to-card/30 backdrop-blur-sm">
                                  <CardContent className="p-4">
                                    <div className="flex items-center gap-4">
                                      {/* Rank Number */}
                                      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gradient-to-br from-muted to-muted/50 border border-border/30 flex items-center justify-center group-hover:border-primary/40 transition-colors">
                                        <span className="text-lg font-bold text-muted-foreground group-hover:text-primary transition-colors">
                                          #{rank}
                                        </span>
                                      </div>
                                      
                                      {/* Service Icon */}
                                      <div className="flex-shrink-0">
                                        <img 
                                          src={waitlist.image} 
                                          alt={waitlist.name}
                                          className="w-12 h-12 rounded-lg object-cover ring-1 ring-border/20 group-hover:ring-primary/30 transition-all duration-300"
                                        />
                                      </div>
                                      
                                      {/* Service Info */}
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                                          {waitlist.name}
                                        </h3>
                                        <p className="text-sm text-muted-foreground line-clamp-1">
                                          {waitlist.description}
                                        </p>
                                        
                                        {/* Categories - Compact */}
                                        <div className="flex gap-1 mt-1">
                                          {(() => {
                                            const { display } = prioritizeCategories(
                                              waitlist.categories || [waitlist.category], 
                                              selectedMainCategory, 
                                              selectedSubCategory
                                            );
                                            return display.slice(0, 1).map((category, idx) => (
                                              <span
                                                key={category}
                                                className="px-2 py-0.5 text-xs font-medium rounded-md bg-primary/15 text-primary border border-primary/20"
                                              >
                                                {category}
                                              </span>
                                            ));
                                          })()}
                                        </div>
                                      </div>
                                      
                                      {/* Rush Power */}
                                      <div className="flex-shrink-0 text-right">
                                        <div className="flex items-center gap-1 mb-1">
                                          <Users className="h-4 w-4 text-primary" />
                                          <motion.span 
                                            className="text-lg font-black text-primary"
                                            whileHover={{ scale: 1.05 }}
                                          >
                                            {waitlist.participantCount.toLocaleString()}
                                          </motion.span>
                                          <span className="text-primary">⚡</span>
                                        </div>
                                        <div className="text-xs text-muted-foreground uppercase tracking-wider">
                                          RUSH POWER
                                        </div>
                                      </div>
                                      
                                      {/* Action Arrow */}
                                      <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ArrowRight className="h-5 w-5 text-primary" />
                                      </div>
                                    </div>
                                    
                                    {/* Progress Bar Effect */}
                                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-primary/0 via-primary/50 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                  </CardContent>
                                </Card>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </div>
                    )}
                  </>
                );
              })()}
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
