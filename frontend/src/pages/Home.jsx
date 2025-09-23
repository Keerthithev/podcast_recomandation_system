import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { 
  Brain, 
  Sparkles, 
  Search, 
  Heart, 
  ArrowRight,
  Play,
  Users,
  Zap
} from 'lucide-react'
import { useAuthStore } from '../stores/authStore'

const Home = () => {
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard')
    }
  }, [isAuthenticated, navigate])

  const features = [
    {
      icon: Brain,
      title: 'AI-Powered Recommendations',
      description: 'Advanced machine learning algorithms analyze your preferences to suggest the perfect podcasts.'
    },
    {
      icon: Sparkles,
      title: 'Multi-Agent System',
      description: 'Intelligent agents work together to provide personalized recommendations using NLP and LLM technologies.'
    },
    {
      icon: Search,
      title: 'Smart Search',
      description: 'Find podcasts using natural language queries powered by advanced information retrieval techniques.'
    },
    {
      icon: Heart,
      title: 'Personalized Experience',
      description: 'Learn from your listening habits to continuously improve recommendations and discover new content.'
    }
  ]

  const stats = [
    { label: 'Podcasts Analyzed', value: '10K+' },
    { label: 'AI Agents', value: '2' },
    { label: 'Users', value: '500+' },
    { label: 'Accuracy', value: '95%' }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">PodcastAI</span>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-600 hover:text-gray-900 transition-colors"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/register')}
                className="btn btn-primary px-6 py-2"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="text-5xl md:text-6xl font-bold text-gray-900 mb-6"
            >
              Discover Your Next
              <span className="gradient-text block">Favorite Podcast</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto"
            >
              Powered by advanced AI agents, our recommendation system uses natural language processing 
              and machine learning to find podcasts that match your interests and preferences.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <button
                onClick={() => navigate('/register')}
                className="btn btn-primary px-8 py-4 text-lg flex items-center space-x-2"
              >
                <span>Start Listening</span>
                <ArrowRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/login')}
                className="btn btn-outline px-8 py-4 text-lg flex items-center space-x-2"
              >
                <Play className="h-5 w-5" />
                <span>Watch Demo</span>
              </button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="text-center"
              >
                <div className="text-3xl font-bold text-primary-600 mb-2">{stat.value}</div>
                <div className="text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powered by Advanced AI Technology
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our multi-agent system combines the latest in artificial intelligence 
              to deliver personalized podcast recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
              >
                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                  <feature.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {feature.title}
                </h3>
                <p className="text-gray-600 text-sm">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-primary-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to Discover Amazing Podcasts?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Join thousands of users who have found their perfect podcast matches 
            with our AI-powered recommendation system.
          </p>
          <button
            onClick={() => navigate('/register')}
            className="bg-white text-primary-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 mx-auto"
          >
            <Zap className="h-5 w-5" />
            <span>Get Started Free</span>
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Brain className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold">PodcastAI</span>
            </div>
            <p className="text-gray-400 mb-4">
              AI-Powered Podcast Recommendations
            </p>
            <p className="text-sm text-gray-500">
              © 2024 PodcastAI. Built with React, FastAPI, and advanced AI technologies.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home
