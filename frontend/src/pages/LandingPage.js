import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, Droplets, Moon, Flame, TrendingUp } from 'lucide-react';
import { Button } from '../components/ui/button';

const LandingPage = ({ onGetStarted }) => {
  const features = [
    {
      icon: Activity,
      title: 'Track Activity',
      description: 'Monitor your daily steps and exercise minutes',
      image: 'https://images.unsplash.com/photo-1586919257548-66ec29b8c7ed?w=600'
    },
    {
      icon: Heart,
      title: 'Weight Goals',
      description: 'Set and achieve your weight management targets',
      image: 'https://images.unsplash.com/photo-1670607231914-605c7b94edd0?w=600'
    },
    {
      icon: Droplets,
      title: 'Hydration',
      description: 'Stay hydrated with water intake tracking',
      image: 'https://images.unsplash.com/photo-1707257969667-68804d47f5da?w=600'
    },
    {
      icon: Moon,
      title: 'Sleep Quality',
      description: 'Track your sleep patterns for better rest',
      image: 'https://images.unsplash.com/photo-1707257969667-68804d47f5da?w=600'
    },
    {
      icon: Flame,
      title: 'Calories',
      description: 'Monitor your daily calorie intake',
      image: 'https://images.unsplash.com/photo-1670607231914-605c7b94edd0?w=600'
    },
    {
      icon: TrendingUp,
      title: 'Analytics',
      description: 'Visualize your progress with detailed charts',
      image: 'https://images.unsplash.com/photo-1586919257548-66ec29b8c7ed?w=600'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-oat-100 via-sage-50 to-clay-100">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center px-6 py-20 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(90,125,90,0.1),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-foreground leading-tight">
              Your Journey to
              <span className="block text-primary mt-2">Better Health</span>
            </h1>
            <p className="text-lg sm:text-xl text-muted-foreground leading-relaxed max-w-xl">
              Track your wellness journey with intuitive tools designed to help you achieve your health goals naturally and sustainably.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button
                data-testid="get-started-btn"
                onClick={onGetStarted}
                size="lg"
                className="rounded-full px-8 py-6 text-base font-semibold shadow-lg shadow-primary/20 hover:shadow-xl hover:shadow-primary/30 transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Get Started Free
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="rounded-full px-8 py-6 text-base font-semibold border-2 hover:bg-secondary/50 transition-all duration-300"
              >
                Learn More
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative hidden lg:block"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="https://images.unsplash.com/photo-1707257969667-68804d47f5da?w=800"
                alt="Woman doing yoga"
                className="w-full h-[600px] object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-foreground mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Comprehensive health tracking tools to support your wellness journey
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -8, transition: { duration: 0.2 } }}
                  className="bg-card rounded-3xl p-8 border border-border shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto bg-gradient-to-br from-primary to-primary/80 rounded-[2.5rem] p-12 text-center shadow-2xl"
        >
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            Start Your Wellness Journey Today
          </h2>
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of people taking control of their health with our intuitive tracking platform.
          </p>
          <Button
            data-testid="cta-get-started-btn"
            onClick={onGetStarted}
            size="lg"
            variant="secondary"
            className="rounded-full px-10 py-6 text-lg font-semibold hover:scale-105 active:scale-95 transition-all duration-300"
          >
            Get Started Now
          </Button>
        </motion.div>
      </section>
    </div>
  );
};

export default LandingPage;