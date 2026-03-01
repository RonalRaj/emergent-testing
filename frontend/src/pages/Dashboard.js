import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Activity, Droplets, Moon, TrendingUp, Plus, LogOut, BarChart3 } from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { useAuth } from '../context/AuthContext';
import { healthAPI } from '../api';
import { getTodayDate } from '../lib/utils';
import LogEntryModal from '../components/LogEntryModal';
import AnalyticsView from '../components/AnalyticsView';
import { toast } from 'sonner';

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [stats, setStats] = useState(null);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [statsRes, entriesRes] = await Promise.all([
        healthAPI.getStats(),
        healthAPI.getEntries(7)
      ]);
      setStats(statsRes.data);
      setEntries(entriesRes.data);
    } catch (error) {
      console.error('Failed to load data:', error);
      toast.error('Failed to load health data');
    } finally {
      setLoading(false);
    }
  };

  const handleLogEntry = () => {
    setShowLogModal(false);
    loadData();
    toast.success('Health entry logged successfully!');
  };

  const metrics = [
    {
      key: 'weight',
      label: 'Weight',
      icon: TrendingUp,
      value: stats?.latest?.weight || stats?.averages?.weight || '-',
      unit: 'kg',
      color: 'text-chart-1',
      bgColor: 'bg-chart-1/10'
    },
    {
      key: 'steps',
      label: 'Steps',
      icon: Activity,
      value: stats?.latest?.steps || stats?.averages?.steps || '-',
      unit: '',
      color: 'text-chart-2',
      bgColor: 'bg-chart-2/10'
    },
    {
      key: 'water',
      label: 'Water',
      icon: Droplets,
      value: stats?.latest?.water || stats?.averages?.water || '-',
      unit: 'L',
      color: 'text-chart-3',
      bgColor: 'bg-chart-3/10'
    },
    {
      key: 'sleep',
      label: 'Sleep',
      icon: Moon,
      value: stats?.latest?.sleep || stats?.averages?.sleep || '-',
      unit: 'hrs',
      color: 'text-chart-4',
      bgColor: 'bg-chart-4/10'
    }
  ];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your health data...</p>
        </div>
      </div>
    );
  }

  if (showAnalytics) {
    return <AnalyticsView onBack={() => setShowAnalytics(false)} entries={entries} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-oat-100 via-sage-50 to-clay-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground font-heading" data-testid="dashboard-title">
              WellnessTracker
            </h1>
            <p className="text-sm text-muted-foreground">Welcome back, {user?.name}!</p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowAnalytics(true)}
              data-testid="view-analytics-btn"
              variant="outline"
              size="sm"
              className="rounded-full border-2"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </Button>
            <Button
              onClick={logout}
              data-testid="logout-btn"
              variant="outline"
              size="sm"
              className="rounded-full border-2"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8" data-testid="dashboard">
        {/* Quick Stats - Bento Grid */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">Your Health Today</h2>
              <p className="text-muted-foreground">Track your daily wellness metrics</p>
            </div>
            <Button
              onClick={() => setShowLogModal(true)}
              data-testid="log-entry-btn"
              size="lg"
              className="rounded-full px-6 shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all duration-300"
            >
              <Plus className="w-5 h-5 mr-2" />
              Log Entry
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => {
              const Icon = metric.icon;
              return (
                <motion.div
                  key={metric.key}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Card className="p-6 rounded-3xl border-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-12 h-12 rounded-2xl ${metric.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${metric.color}`} />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-muted-foreground mb-1">
                        {metric.label}
                      </p>
                      <p className="text-3xl font-bold text-foreground font-heading">
                        {metric.value}
                        {metric.value !== '-' && <span className="text-lg text-muted-foreground ml-1">{metric.unit}</span>}
                      </p>
                    </div>
                  </Card>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Recent Entries */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="bg-card rounded-3xl p-8 border border-border shadow-sm"
        >
          <h3 className="text-2xl font-bold text-foreground mb-6">Recent Entries</h3>
          
          {entries.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No entries yet. Start tracking your health!</p>
              <Button
                onClick={() => setShowLogModal(true)}
                data-testid="log-first-entry-btn"
                className="rounded-full"
              >
                Log Your First Entry
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <div
                  key={entry.id || index}
                  className="flex items-center justify-between p-4 rounded-2xl bg-secondary/30 hover:bg-secondary/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground mb-1">{entry.date}</p>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      {entry.weight && <span>Weight: {entry.weight}kg</span>}
                      {entry.steps && <span>Steps: {entry.steps}</span>}
                      {entry.water && <span>Water: {entry.water}L</span>}
                      {entry.sleep && <span>Sleep: {entry.sleep}hrs</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </main>

      {showLogModal && (
        <LogEntryModal
          onClose={() => setShowLogModal(false)}
          onSuccess={handleLogEntry}
        />
      )}
    </div>
  );
};

export default Dashboard;