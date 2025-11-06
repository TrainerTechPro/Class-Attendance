'use client';

import { useState, useEffect } from 'react';
import { getCurrentLocation } from '@/lib/geolocation';

interface Session {
  id: string;
  date: string;
  startTime: string;
  isActive: boolean;
  class: {
    id: string;
    name: string;
    code: string;
  };
}

export default function StudentCheckIn() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [studentName, setStudentName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' }>({ text: '', type: 'info' });
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  useEffect(() => {
    fetchActiveSessions();
    checkLocationPermission();
  }, []);

  async function checkLocationPermission() {
    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({ name: 'geolocation' });
        setLocationPermission(result.state);
        result.addEventListener('change', () => {
          setLocationPermission(result.state);
        });
      } catch (error) {
        console.error('Error checking location permission:', error);
      }
    }
  }

  async function fetchActiveSessions() {
    try {
      const response = await fetch('/api/sessions');
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }

  async function handleCheckIn() {
    if (!selectedSession || !studentName.trim()) {
      setMessage({ text: 'Please select a class and enter your name', type: 'error' });
      return;
    }

    setLoading(true);
    setMessage({ text: 'Getting your location...', type: 'info' });

    try {
      // Get current location
      const location = await getCurrentLocation();

      setMessage({ text: 'Verifying location and recording attendance...', type: 'info' });

      // Submit attendance
      const response = await fetch('/api/attendance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: selectedSession,
          studentName: studentName.trim(),
          latitude: location.latitude,
          longitude: location.longitude,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ text: data.message, type: 'success' });
        setStudentName('');
        setSelectedSession('');
      } else {
        setMessage({ text: data.message || data.error, type: 'error' });
      }
    } catch (error: any) {
      if (error.code === 1) {
        setMessage({
          text: 'Location access denied. Please enable location services to check in.',
          type: 'error'
        });
      } else if (error.code === 2) {
        setMessage({
          text: 'Unable to determine your location. Please check your GPS.',
          type: 'error'
        });
      } else {
        setMessage({
          text: 'Failed to check in. Please try again.',
          type: 'error'
        });
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-center text-gray-800">
          Student Check-In
        </h2>

        {locationPermission === 'denied' && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 font-medium">Location Access Required</p>
            <p className="text-red-600 text-sm mt-1">
              Please enable location access in your browser settings to use attendance check-in.
            </p>
          </div>
        )}

        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-blue-800 text-sm">
            <strong>Note:</strong> You must be on the Cal State San Marcos campus to check in.
            Your location will be verified automatically.
          </p>
        </div>

        {sessions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-600 text-lg">No active attendance sessions at this time.</p>
            <p className="text-gray-500 text-sm mt-2">Check back when your instructor starts attendance.</p>
          </div>
        ) : (
          <div className="space-y-6">
            <div>
              <label htmlFor="class" className="block text-sm font-medium text-gray-700 mb-2">
                Select Class
              </label>
              <select
                id="class"
                value={selectedSession}
                onChange={(e) => setSelectedSession(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              >
                <option value="">Choose a class...</option>
                {sessions.map((session) => (
                  <option key={session.id} value={session.id}>
                    {session.class.code} - {session.class.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <input
                id="name"
                type="text"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={loading}
              />
            </div>

            <button
              onClick={handleCheckIn}
              disabled={loading || !selectedSession || !studentName.trim() || locationPermission === 'denied'}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Checking In...' : 'Check In'}
            </button>

            {message.text && (
              <div
                className={`p-4 rounded-lg ${
                  message.type === 'success'
                    ? 'bg-green-50 text-green-800 border border-green-200'
                    : message.type === 'error'
                    ? 'bg-red-50 text-red-800 border border-red-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}
              >
                {message.text}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
