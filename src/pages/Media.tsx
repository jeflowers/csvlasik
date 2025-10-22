import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Calendar, User, ArrowRight, Eye, Globe, Lightbulb, BookOpen } from 'lucide-react';
import { usePublicArticles, usePublicVideos } from '../hooks/useApi';
import YouTubeEmbed from '../components/YouTubeEmbed';
import { apiService } from '../services/api';

const Media = () => {
  const { t } = useTranslation(['media', 'common']);
  const [displayLimit, setDisplayLimit] = React.useState(6);
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null);
  const { articles, total, loading: articlesLoading } = usePublicArticles({
    limit: displayLimit,
    category: selectedCategory
  });
  const { videos, loading: videosLoading } = usePublicVideos({ featured: true });

  const featuredPost = {
    title: t('featured.title'),
    excerpt: t('featured.excerpt'),
    author: 'Dr. Charles Flowers',
    date: 'March 15, 2024',
    readTime: '8 min read',
    image: 'https://images.pexels.com/photos/1032650/pexels-photo-1032650.jpeg',
    category: 'Innovation'
  };

  const defaultPosts = [
    {
      title: t('posts.telemedicine.title'),
      excerpt: t('posts.telemedicine.excerpt'),
      author: 'Dr. Charles Flowers',
      date: 'March 10, 2024',
      readTime: '6 min read',
      image: '/assets/images/blogs/jsb-co-VFkksKfrsvM-unsplash.jpg',
      category: 'Technology'
    },
    {
      title: t('posts.recovery.title'),
      excerpt: t('posts.recovery.excerpt'),
      author: 'Dr. Charles Flowers',
      date: 'March 5, 2024',
      readTime: '5 min read',
      image: '/assets/images/misc/mainimage-lasik.jpg',
      category: 'Patient Care'
    },
    {
      title: t('posts.icl.title'),
      excerpt: t('posts.icl.excerpt'),
      author: 'Dr. Charles Flowers',
      date: 'February 28, 2024',
      readTime: '7 min read',
      image: '/assets/images/misc/iCare-DRSplus-with-screen.png',
      category: 'Procedures'
    },
    {
      title: t('posts.infrastructure.title'),
      excerpt: t('posts.infrastructure.excerpt'),
      author: 'Dr. Charles Flowers',
      date: 'February 20, 2024',
      readTime: '9 min read',
      image: '/assets/images/ads/black_biri_illustrationImage.png',
      category: 'Mission'
    }
  ];

  // Use dynamic articles if available, otherwise use default posts
  const displayPosts = articles.length > 0 ? articles : defaultPosts;

  // Get unique categories from articles with counts
  const [categoryCounts, setCategoryCounts] = React.useState<Record<string, number>>({});

  React.useEffect(() => {
    const fetchCategoryCounts = async () => {
      const counts: Record<string, number> = {};
      const allArticles = await apiService.getPublicArticles({});

      allArticles.articles.forEach((article: any) => {
        const cat = article.category || 'Uncategorized';
        counts[cat] = (counts[cat] || 0) + 1;
      });

      setCategoryCounts(counts);
    };

    fetchCategoryCounts();
  }, []);

  const categories = [
    { name: t('categories.all'), value: null, count: total, icon: <BookOpen className="h-5 w-5" /> },
    { name: t('categories.innovation'), value: 'Innovation', count: categoryCounts['Innovation'] || 0, icon: <Lightbulb className="h-5 w-5" /> },
    { name: t('categories.procedures'), value: 'Procedures', count: categoryCounts['Procedures'] || 0, icon: <Eye className="h-5 w-5" /> },
    { name: t('categories.technology'), value: 'Technology', count: categoryCounts['Technology'] || 0, icon: <Globe className="h-5 w-5" /> },
    { name: t('categories.patientCare'), value: 'Patient Care', count: categoryCounts['Patient Care'] || 0, icon: <User className="h-5 w-5" /> },
    { name: t('categories.mission'), value: 'Mission', count: categoryCounts['Mission'] || 0, icon: <Globe className="h-5 w-5" /> }
  ];

  const handleCategoryClick = (categoryValue: string | null) => {
    setSelectedCategory(categoryValue);
    setDisplayLimit(6);
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="chopard-hero py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl lg:text-5xl font-serif chopard-text-primary mb-6 leading-tight">
              <span className="chopard-text-accent">ClearSight</span> {t('hero.title')}
            </h1>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto mb-6 leading-relaxed font-light">
              {t('hero.description')}
            </p>
            <div className="inline-flex items-center chopard-glass px-6 py-3 rounded-full text-base font-medium chopard-text-accent border-2 chopard-border">
              <BookOpen className="h-5 w-5 mr-3 chopard-text-accent" />
              {t('hero.badge')}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Article */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12">
            <h2 className="text-3xl font-serif chopard-text-primary mb-4">{t('featured.sectionTitle')}</h2>
          </div>

          <div className="chopard-card rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
              <div className="relative">
                <img
                  src={featuredPost.image}
                  alt={featuredPost.title}
                  className="w-full h-64 lg:h-full object-cover"
                />
                <div className="absolute top-6 left-6">
                  <span className="chopard-glass px-4 py-2 rounded-full text-sm font-light chopard-text-primary border chopard-border">
                    {featuredPost.category}
                  </span>
                </div>
              </div>
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <h3 className="text-2xl lg:text-3xl font-serif chopard-text-primary mb-4 leading-tight">
                  {featuredPost.title}
                </h3>
                <p className="chopard-text-secondary mb-6 leading-relaxed font-light text-lg">
                  {featuredPost.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <User className="h-5 w-5 chopard-text-secondary mr-2" />
                    <span className="text-sm chopard-text-secondary mr-4 font-light">{featuredPost.author}</span>
                    <Calendar className="h-5 w-5 chopard-text-secondary mr-2" />
                    <span className="text-sm chopard-text-secondary font-light">{featuredPost.date}</span>
                  </div>
                  <button className="inline-flex items-center chopard-text-accent font-light hover:chopard-text-primary transition-colors">
                    {t('featured.readMore')}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Blog Posts Grid */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Categories Sidebar */}
            <div className="lg:col-span-1">
              <div className="chopard-card p-6 rounded-xl sticky top-8">
                <h3 className="text-xl font-serif chopard-text-primary mb-6">{t('sidebar.categories')}</h3>
                <ul className="space-y-3">
                  {categories.map((category, index) => (
                    <li key={index}>
                      <button
                        onClick={() => handleCategoryClick(category.value)}
                        className={`flex items-center justify-between w-full text-left p-3 rounded-lg transition-colors ${
                          selectedCategory === category.value
                            ? 'chopard-glass border-2 chopard-border'
                            : 'hover:chopard-glass'
                        }`}
                      >
                        <div className="flex items-center">
                          {category.icon}
                          <span className="ml-3 font-light chopard-text-primary">{category.name}</span>
                        </div>
                        <span className="text-sm chopard-text-secondary font-light">({category.count})</span>
                      </button>
                    </li>
                  ))}
                </ul>

                {/* Newsletter Signup */}
                <div className="mt-8 p-4 chopard-glass rounded-lg border chopard-border">
                  <h4 className="font-light chopard-text-primary mb-2">{t('sidebar.newsletter.title')}</h4>
                  <p className="text-sm chopard-text-secondary mb-4 font-light">
                    {t('sidebar.newsletter.description')}
                  </p>
                  <div className="space-y-2">
                    <input
                      type="email"
                      placeholder={t('sidebar.newsletter.placeholder')}
                      className="w-full px-3 py-2 border chopard-border rounded-lg text-sm focus:ring-2 focus:ring-gray-400 focus:border-transparent font-light"
                    />
                    <button className="w-full chopard-button py-2 rounded-lg text-sm transition-all duration-300">
                      {t('sidebar.newsletter.subscribe')}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Blog Posts */}
            <div className="lg:col-span-3">
              {articlesLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="chopard-card rounded-xl overflow-hidden animate-pulse">
                      <div className="h-48 bg-gray-200"></div>
                      <div className="p-6">
                        <div className="h-6 bg-gray-200 rounded mb-3"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {displayPosts.map((post, index) => (
                    <article key={index} className="chopard-card rounded-xl overflow-hidden hover:chopard-shadow transition-shadow">
                      <div className="relative">
                        <img
                          src={post.featured_image || post.image}
                          alt={post.title}
                          className="w-full h-48 object-contain bg-gray-100"
                        />
                        <div className="absolute top-4 left-4">
                          <span className="chopard-glass px-3 py-1 rounded-full text-sm font-light chopard-text-primary border chopard-border">
                            {post.category || 'Innovation'}
                          </span>
                        </div>
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-serif chopard-text-primary mb-3 leading-tight hover:chopard-text-accent transition-colors cursor-pointer">
                          {post.title}
                        </h3>
                        <p className="chopard-text-secondary mb-4 leading-relaxed font-light">
                          {post.excerpt || post.content?.substring(0, 150) + '...'}
                        </p>
                        <div className="flex items-center justify-between text-sm chopard-text-secondary font-light">
                          <div className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            <span>{post.published_at ? new Date(post.published_at).toLocaleDateString() : post.date}</span>
                          </div>
                          <span>{post.read_time ? `${post.read_time} min read` : post.readTime}</span>
                        </div>
                        <div className="mt-4 pt-4 border-t chopard-border">
                          <button className="inline-flex items-center chopard-text-accent font-light hover:chopard-text-primary transition-colors">
                            {t('posts.readMore')}
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </article>
                  ))}
                </div>
              )}

              {/* Load More */}
              {articles.length < total && (
                <div className="text-center mt-12">
                  <button
                    onClick={() => setDisplayLimit(prev => prev + 6)}
                    disabled={articlesLoading}
                    className="inline-flex items-center chopard-button px-8 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {articlesLoading ? t('common:loading') || 'Loading...' : t('posts.loadMore')}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </button>
                  <p className="text-sm chopard-text-secondary mt-3 font-light">
                    {t('posts.showing') || 'Showing'} {articles.length} {t('common:of') || 'of'} {total} {t('posts.articles') || 'articles'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Video Library */}
      <section className="py-16 chopard-hero">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              Video Library
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              Watch educational videos about vision correction procedures and patient success stories
            </p>
          </div>

          {videosLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {[...Array(2)].map((_, i) => (
                <div key={i} className="chopard-card rounded-xl overflow-hidden animate-pulse">
                  <div className="aspect-video bg-gray-200"></div>
                  <div className="p-6">
                    <div className="h-6 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
              {videos.map((video: any) => (
                <div key={video.id} className="chopard-card rounded-xl overflow-hidden">
                  <div className="aspect-video">
                    {video.video_type === 'youtube' && (
                      <YouTubeEmbed
                        videoId={video.video_url}
                        title={video.title}
                        className="w-full h-full"
                      />
                    )}
                    {video.video_type === 'vimeo' && (
                      <iframe
                        src={`https://player.vimeo.com/video/${video.video_url}`}
                        className="w-full h-full"
                        frameBorder="0"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                        title={video.title}
                      />
                    )}
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-serif chopard-text-primary mb-2">
                      {video.title}
                    </h3>
                    <p className="chopard-text-secondary font-light">
                      {video.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Educational Resources */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-serif chopard-text-primary mb-4">
              {t('resources.title')}
            </h2>
            <p className="text-xl chopard-text-secondary max-w-3xl mx-auto font-light">
              {t('resources.description')}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: t('resources.items.lasik.title'),
                description: t('resources.items.lasik.description'),
                icon: <Eye className="h-8 w-8 chopard-text-accent" />,
                link: '/procedures/lasik'
              },
              {
                title: t('resources.items.comparison.title'),
                description: t('resources.items.comparison.description'),
                icon: <Lightbulb className="h-8 w-8 chopard-text-accent" />,
                link: '/procedures'
              },
              {
                title: t('resources.items.pacific.title'),
                description: t('resources.items.pacific.description'),
                icon: <Globe className="h-8 w-8 chopard-text-accent" />,
                link: '/pacific-story'
              }
            ].map((resource, index) => (
              <Link
                key={index}
                to={resource.link}
                className="chopard-card p-8 rounded-xl text-center hover:chopard-shadow transition-all duration-300 group"
              >
                <div className="mb-6 flex justify-center">
                  {resource.icon}
                </div>
                <h3 className="text-xl font-serif chopard-text-primary mb-4 group-hover:chopard-text-accent transition-colors">
                  {resource.title}
                </h3>
                <p className="chopard-text-secondary mb-4 font-light">{resource.description}</p>
                <span className={`inline-flex items-center chopard-text-accent font-light`}>
                  {t('resources.learnMore')}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 chopard-gradient text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl lg:text-4xl font-serif mb-6">
            {t('cta.title')}
          </h2>
          <p className="text-xl text-white/70 mb-8 font-light">
            {t('cta.description')}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/contact"
              className="inline-flex items-center bg-white chopard-text-primary px-8 py-4 rounded-lg text-lg font-light hover:bg-gray-100 transition-all duration-300"
            >
              {t('cta.schedule')}
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/procedures"
              className="inline-flex items-center border border-white text-white px-8 py-4 rounded-lg text-lg font-light hover:bg-white hover:text-gray-900 transition-all duration-300"
            >
              {t('cta.explore')}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Media;