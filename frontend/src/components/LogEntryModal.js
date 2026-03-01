import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { healthAPI } from '../api';
import { getTodayDate } from '../lib/utils';
import { toast } from 'sonner';

const LogEntryModal = ({ onClose, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: getTodayDate(),
    weight: '',
    steps: '',
    water: '',
    sleep: '',
    calories: '',
    exercise: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const data = {
        date: formData.date,
        weight: formData.weight ? parseFloat(formData.weight) : null,
        steps: formData.steps ? parseInt(formData.steps) : null,
        water: formData.water ? parseFloat(formData.water) : null,
        sleep: formData.sleep ? parseFloat(formData.sleep) : null,
        calories: formData.calories ? parseInt(formData.calories) : null,
        exercise: formData.exercise ? parseInt(formData.exercise) : null,
        notes: formData.notes || null
      };

      await healthAPI.createEntry(data);
      onSuccess();
    } catch (error) {
      console.error('Failed to log entry:', error);
      toast.error('Failed to log entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-border">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground" data-testid="log-entry-modal-title">
            Log Health Entry
          </h2>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full hover:bg-secondary flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6" data-testid="log-entry-form">
          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Date
            </label>
            <Input
              type="date"
              name="date"
              data-testid="date-input"
              value={formData.date}
              onChange={handleChange}
              required
              max={getTodayDate()}
              className="h-12 rounded-xl border-2"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Weight (kg)
              </label>
              <Input
                type="number"
                name="weight"
                data-testid="weight-input"
                step="0.1"
                placeholder="70.5"
                value={formData.weight}
                onChange={handleChange}
                className="h-12 rounded-xl border-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Steps
              </label>
              <Input
                type="number"
                name="steps"
                data-testid="steps-input"
                placeholder="10000"
                value={formData.steps}
                onChange={handleChange}
                className="h-12 rounded-xl border-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Water (liters)
              </label>
              <Input
                type="number"
                name="water"
                data-testid="water-input"
                step="0.1"
                placeholder="2.5"
                value={formData.water}
                onChange={handleChange}
                className="h-12 rounded-xl border-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Sleep (hours)
              </label>
              <Input
                type="number"
                name="sleep"
                data-testid="sleep-input"
                step="0.5"
                placeholder="7.5"
                value={formData.sleep}
                onChange={handleChange}
                className="h-12 rounded-xl border-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Calories
              </label>
              <Input
                type="number"
                name="calories"
                data-testid="calories-input"
                placeholder="2000"
                value={formData.calories}
                onChange={handleChange}
                className="h-12 rounded-xl border-2"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-foreground mb-2 block">
                Exercise (minutes)
              </label>
              <Input
                type="number"
                name="exercise"
                data-testid="exercise-input"
                placeholder="30"
                value={formData.exercise}
                onChange={handleChange}
                className="h-12 rounded-xl border-2"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-foreground mb-2 block">
              Notes (optional)
            </label>
            <textarea
              name="notes"
              data-testid="notes-input"
              placeholder="Add any notes about your day..."
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-4 py-3 rounded-xl border-2 border-input bg-transparent focus:border-primary focus:outline-none transition-colors resize-none"
            />
          </div>

          <div className="flex gap-3">
            <Button
              type="button"
              onClick={onClose}
              variant="outline"
              className="flex-1 h-12 rounded-full border-2"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              data-testid="submit-entry-btn"
              disabled={loading}
              className="flex-1 h-12 rounded-full shadow-lg shadow-primary/20"
            >
              {loading ? 'Saving...' : 'Save Entry'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LogEntryModal;