'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';

interface Class {
  id: string;
  name: string;
  code: string;
  createdAt: string;
}

interface Session {
  id: string;
  date: string;
  startTime: string;
  endTime: string | null;
  isActive: boolean;
  class: Class;
  records: AttendanceRecord[];
}

interface AttendanceRecord {
  id: string;
  studentName: string;
  timestamp: string;
  latitude: number;
  longitude: number;
  isValid: boolean;
}

export default function InstructorDashboard() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'sessions' | 'classes'>('sessions');

  // New class form
  const [newClassName, setNewClassName] = useState('');
  const [newClassCode, setNewClassCode] = useState('');

  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' }>({ text: '', type: 'success' });

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    if (selectedClass) {
      fetchSessions(selectedClass);
    }
  }, [selectedClass]);

  async function fetchClasses() {
    try {
      const response = await fetch('/api/classes');
      if (response.ok) {
        const data = await response.json();
        setClasses(data);
        if (data.length > 0 && !selectedClass) {
          setSelectedClass(data[0].id);
        }
      }
    } catch (error) {
      console.error('Error fetching classes:', error);
    }
  }

  async function fetchSessions(classId: string) {
    try {
      const response = await fetch(`/api/sessions?classId=${classId}`);
      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      }
    } catch (error) {
      console.error('Error fetching sessions:', error);
    }
  }

  async function createClass() {
    if (!newClassName.trim() || !newClassCode.trim()) {
      setMessage({ text: 'Please fill in all fields', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newClassName.trim(),
          code: newClassCode.trim(),
        }),
      });

      if (response.ok) {
        setMessage({ text: 'Class created successfully!', type: 'success' });
        setNewClassName('');
        setNewClassCode('');
        fetchClasses();
      } else {
        const data = await response.json();
        setMessage({ text: data.error || 'Failed to create class', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to create class', type: 'error' });
    }
  }

  async function startSession() {
    if (!selectedClass) {
      setMessage({ text: 'Please select a class', type: 'error' });
      return;
    }

    try {
      const response = await fetch('/api/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ classId: selectedClass }),
      });

      if (response.ok) {
        setMessage({ text: 'Attendance session started!', type: 'success' });
        fetchSessions(selectedClass);
      } else {
        setMessage({ text: 'Failed to start session', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to start session', type: 'error' });
    }
  }

  async function endSession(sessionId: string) {
    try {
      const response = await fetch('/api/sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId, isActive: false }),
      });

      if (response.ok) {
        setMessage({ text: 'Attendance session ended', type: 'success' });
        fetchSessions(selectedClass);
      } else {
        setMessage({ text: 'Failed to end session', type: 'error' });
      }
    } catch (error) {
      setMessage({ text: 'Failed to end session', type: 'error' });
    }
  }

  return (
    <div className="max-w-6xl mx-auto mt-8">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold mb-6 text-gray-800">
          Instructor Dashboard
        </h2>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg ${
              message.type === 'success'
                ? 'bg-green-50 text-green-800 border border-green-200'
                : 'bg-red-50 text-red-800 border border-red-200'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6 border-b border-gray-200">
          <nav className="flex gap-4">
            <button
              onClick={() => setActiveTab('sessions')}
              className={`py-2 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'sessions'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Attendance Sessions
            </button>
            <button
              onClick={() => setActiveTab('classes')}
              className={`py-2 px-4 font-medium border-b-2 transition-colors ${
                activeTab === 'classes'
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Manage Classes
            </button>
          </nav>
        </div>

        {/* Sessions Tab */}
        {activeTab === 'sessions' && (
          <div className="space-y-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <label htmlFor="classSelect" className="block text-sm font-medium text-gray-700 mb-2">
                  Select Class
                </label>
                <select
                  id="classSelect"
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {classes.map((cls) => (
                    <option key={cls.id} value={cls.id}>
                      {cls.code} - {cls.name}
                    </option>
                  ))}
                </select>
              </div>
              <button
                onClick={startSession}
                disabled={!selectedClass}
                className="bg-green-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Start Attendance
              </button>
            </div>

            {/* Sessions List */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">Recent Sessions</h3>
              {sessions.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No sessions yet. Start an attendance session above.</p>
              ) : (
                sessions.map((session) => (
                  <div
                    key={session.id}
                    className={`border rounded-lg p-4 ${
                      session.isActive ? 'border-green-500 bg-green-50' : 'border-gray-300'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-semibold text-lg text-gray-800">
                          {session.class.code} - {session.class.name}
                        </h4>
                        <p className="text-sm text-gray-600">
                          Started: {format(new Date(session.startTime), 'MMM dd, yyyy h:mm a')}
                        </p>
                        {session.endTime && (
                          <p className="text-sm text-gray-600">
                            Ended: {format(new Date(session.endTime), 'MMM dd, yyyy h:mm a')}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-3">
                        {session.isActive ? (
                          <>
                            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                              Active
                            </span>
                            <button
                              onClick={() => endSession(session.id)}
                              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
                            >
                              End Session
                            </button>
                          </>
                        ) : (
                          <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-sm font-medium">
                            Closed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Attendance Records */}
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">
                        Attendance ({session.records.length} students)
                      </h5>
                      {session.records.length === 0 ? (
                        <p className="text-sm text-gray-500">No check-ins yet</p>
                      ) : (
                        <div className="bg-white rounded border border-gray-200 overflow-hidden">
                          <table className="w-full">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Student Name</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Time</th>
                                <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">Status</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                              {session.records.map((record) => (
                                <tr key={record.id}>
                                  <td className="px-4 py-2 text-sm text-gray-800">{record.studentName}</td>
                                  <td className="px-4 py-2 text-sm text-gray-600">
                                    {format(new Date(record.timestamp), 'h:mm a')}
                                  </td>
                                  <td className="px-4 py-2 text-sm">
                                    {record.isValid ? (
                                      <span className="text-green-600 font-medium">✓ Verified</span>
                                    ) : (
                                      <span className="text-red-600 font-medium">✗ Off Campus</span>
                                    )}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Classes Tab */}
        {activeTab === 'classes' && (
          <div className="space-y-6">
            {/* Create New Class Form */}
            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Create New Class</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="className" className="block text-sm font-medium text-gray-700 mb-2">
                    Class Name
                  </label>
                  <input
                    id="className"
                    type="text"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    placeholder="e.g., Introduction to Computer Science"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="classCode" className="block text-sm font-medium text-gray-700 mb-2">
                    Class Code
                  </label>
                  <input
                    id="classCode"
                    type="text"
                    value={newClassCode}
                    onChange={(e) => setNewClassCode(e.target.value)}
                    placeholder="e.g., CS101"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>
              <button
                onClick={createClass}
                className="mt-4 bg-blue-600 text-white py-2 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Create Class
              </button>
            </div>

            {/* Classes List */}
            <div>
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Your Classes</h3>
              {classes.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No classes yet. Create your first class above.</p>
              ) : (
                <div className="grid gap-4">
                  {classes.map((cls) => (
                    <div key={cls.id} className="border border-gray-300 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <h4 className="font-semibold text-lg text-gray-800">{cls.name}</h4>
                      <p className="text-sm text-gray-600">Code: {cls.code}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Created: {format(new Date(cls.createdAt), 'MMM dd, yyyy')}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
