import React from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, TrendingUp, Activity, Droplets, Moon, Flame, Dumbbell } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AnalyticsView = ({ onBack, entries }) => {
  // Prepare chart data (reverse to show oldest first)
  const chartData = [...entries].reverse().map(entry => ({
    date: entry.date.substring(5), // MM-DD format
    weight: entry.weight || null,
    steps: entry.steps || null,
    water: entry.water || null,
    sleep: entry.sleep || null,
    calories: entry.calories || null,
    exercise: entry.exercise || null
  }));

  const metrics = [
    { key: 'weight', label: 'Weight', icon: TrendingUp, color: '#5A7D5A', unit: 'kg' },
    { key: 'steps', label: 'Steps', icon: Activity, color: '#C27E68', unit: '' },
    { key: 'water', label: 'Water', icon: Droplets, color: '#8FB3AD', unit: 'L' },
    { key: 'sleep', label: 'Sleep', icon: Moon, color: '#A89D8F', unit: 'hrs' },
    { key: 'calories', label: 'Calories', icon: Flame, color: '#E6B89C', unit: '' },
    { key: 'exercise', label: 'Exercise', icon: Dumbbell, color: '#5A7D5A', unit: 'min' }
  ];

  // Calculate averages
  const calculateAverage = (key) => {
    const values = chartData.filter(d => d[key] !== null).map(d => d[key]);
    if (values.length === 0) return 0;
    return (values.reduce((a, b) => a + b, 0) / values.length).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-oat-100 via-sage-50 to-clay-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <Button
            onClick={onBack}
            data-testid="back-to-dashboard-btn"
            variant="outline"
            size="sm"
            className="rounded-full border-2"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground font-heading" data-testid="analytics-title">
              Health Analytics
            </h1>
            <p className="text-sm text-muted-foreground">Your progress over time</p>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8" data-testid="analytics-view">
        {entries.length === 0 ? (
          <Card className="p-12 text-center rounded-3xl">
            <Activity className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">No data available yet. Start logging entries to see your analytics.</p>
          </Card>
        ) : (
          <div className="space-y-8">
            {/* Average Stats */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {metrics.map((metric, index) => {
                const Icon = metric.icon;
                const avg = calculateAverage(metric.key);
                return (
                  <motion.div
                    key={metric.key}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.05 }}
                  >
                    <Card className="p-4 rounded-2xl hover:shadow-lg transition-all duration-300">
                      <Icon className="w-6 h-6 mb-2" style={{ color: metric.color }} />
                      <p className="text-xs text-muted-foreground mb-1">{metric.label} Avg</p>
                      <p className="text-xl font-bold text-foreground font-heading">
                        {avg}
                        <span className="text-sm text-muted-foreground ml-1">{metric.unit}</span>
                      </p>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Weight Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Card className="p-6 rounded-3xl">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-chart-1" />
                    Weight Trend
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="weight" stroke="#5A7D5A" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Steps Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Card className="p-6 rounded-3xl">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-chart-2" />
                    Daily Steps
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      />
                      <Bar dataKey="steps" fill="#C27E68" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Water Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <Card className="p-6 rounded-3xl">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Droplets className="w-5 h-5 text-chart-3" />
                    Water Intake
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      />
                      <Line type="monotone" dataKey="water" stroke="#8FB3AD" strokeWidth={3} dot={{ r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>

              {/* Sleep Chart */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
              >
                <Card className="p-6 rounded-3xl">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Moon className="w-5 h-5 text-chart-4" />
                    Sleep Hours
                  </h3>
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" opacity={0.3} />
                      <XAxis dataKey="date" stroke="#888" style={{ fontSize: '12px' }} />
                      <YAxis stroke="#888" style={{ fontSize: '12px' }} />
                      <Tooltip
                        contentStyle={{ background: '#fff', border: '1px solid #e0e0e0', borderRadius: '8px' }}
                      />
                      <Bar dataKey="sleep" fill="#A89D8F" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Card>
              </motion.div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalyticsView;