import React, { useState, useEffect } from 'react';

export default function App() {
  // Initialize subjects from localStorage, defaulting to an empty array []
  const [subjects, setSubjects] = useState(() => {
    try {
      const savedSubjects = localStorage.getItem('clsu_gwa_subjects');
      return savedSubjects ? JSON.parse(savedSubjects) : [];
    } catch (error) {
      return [];
    }
  });

  // Initialize theme mode from localStorage (defaulting to dark mode = true)
  const [isDarkMode, setIsDarkMode] = useState(() => {
    try {
      const savedMode = localStorage.getItem('clsu_gwa_dark_mode');
      return savedMode !== null ? JSON.parse(savedMode) : true;
    } catch (error) {
      return true;
    }
  });

  const [subjectCode, setSubjectCode] = useState('');
  const [subjectName, setSubjectName] = useState('');
  const [grade, setGrade] = useState('');
  const [units, setUnits] = useState('');
  const [draggedIndex, setDraggedIndex] = useState(null);

  // Save subjects to localStorage whenever they change
  useEffect(() => {
    try {
      localStorage.setItem('clsu_gwa_subjects', JSON.stringify(subjects));
    } catch (error) {
      console.error('Failed to save to localStorage', error);
    }
  }, [subjects]);

  // Save theme mode to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem('clsu_gwa_dark_mode', JSON.stringify(isDarkMode));
    } catch (error) {
      console.error('Failed to save theme to localStorage', error);
    }
  }, [isDarkMode]);

  // Calculate GWA with 3 decimal places
  const totalUnits = subjects.reduce((acc, curr) => acc + (parseFloat(curr.units) || 0), 0);
  const totalPoints = subjects.reduce((acc, curr) => acc + (parseFloat(curr.grade) || 0) * (parseFloat(curr.units) || 0), 0);
  const gwa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(3) : '0.000';

  // Determine Honor Standing
  const getHonorStatus = (val) => {
    const num = parseFloat(val);
    if (num >= 1.00 && num <= 1.50) return { title: 'University Scholar', color: isDarkMode ? 'text-purple-400 border-purple-500/50 bg-purple-950/20' : 'text-purple-700 border-purple-300 bg-purple-50' };
    if (num >= 1.51 && num <= 1.75) return { title: 'College Scholar', color: isDarkMode ? 'text-amber-400 border-amber-500/50 bg-amber-950/20' : 'text-amber-700 border-amber-300 bg-amber-50' };
    if (num >= 1.76 && num <= 2.00) return { title: "Dean's Lister", color: isDarkMode ? 'text-blue-400 border-blue-500/50 bg-blue-950/20' : 'text-blue-700 border-blue-300 bg-blue-50' };
    return { title: 'Regular Student', color: isDarkMode ? 'text-slate-400 border-slate-700 bg-slate-900/50' : 'text-slate-600 border-slate-300 bg-slate-100' };
  };

  const currentHonor = getHonorStatus(gwa);

  const handleAddSubject = (e) => {
    e.preventDefault();
    if (!grade || !units) return;

    const newSub = {
      id: Date.now(),
      code: subjectCode || `SUBJ ${subjects.length + 1}`,
      name: subjectName,
      grade,
      units
    };

    setSubjects([...subjects, newSub]);
    setSubjectCode('');
    setSubjectName('');
    setGrade('');
    setUnits('');
  };

  const handleDelete = (id) => {
    setSubjects(subjects.filter((sub) => sub.id !== id));
  };

  const handleClearAll = () => {
    setSubjects([]);
  };

  // Reordering Handlers (Buttons & Drag-and-Drop)
  const handleMoveUp = (index) => {
    if (index === 0) return;
    const updated = [...subjects];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    setSubjects(updated);
  };

  const handleMoveDown = (index) => {
    if (index === subjects.length - 1) return;
    const updated = [...subjects];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    setSubjects(updated);
  };

  const handleDragStart = (index) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (targetIndex) => {
    if (draggedIndex === null || draggedIndex === targetIndex) return;
    const updatedSubjects = [...subjects];
    const [movedItem] = updatedSubjects.splice(draggedIndex, 1);
    updatedSubjects.splice(targetIndex, 0, movedItem);
    setSubjects(updatedSubjects);
    setDraggedIndex(null);
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${isDarkMode ? 'bg-[#090a0f] text-slate-100' : 'bg-slate-100 text-slate-900'} flex flex-col justify-between selection:bg-blue-600 selection:text-white`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Section */}
        <header className="mb-8">
          <span className="text-xs font-semibold tracking-wider text-blue-500 uppercase">
            Central Luzon State University
          </span>
          <h1 className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
            GWA Calculator
          </h1>
          <p className={`mt-2 max-w-2xl text-sm sm:text-base ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
            Add your subjects, grades, and units to get your General Weighted Average and see which academic honor it reaches.
          </p>
        </header>

        {/* Main Grid Layout with Responsive Ordering */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Right Column Top: Theme Switch & GWA Panel (Appears 1st on mobile, right column top on desktop) */}
          <div className="lg:col-span-1 lg:order-2 order-1 space-y-6">
            <div className="flex justify-end">
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className={`text-xs px-3.5 py-2 rounded-xl border ${isDarkMode ? 'border-slate-800 bg-[#121622] text-slate-200 hover:bg-[#1b2234]' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'} transition flex items-center gap-1.5 shadow-sm font-medium`}
                title="Toggle appearance mode"
              >
                {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
            </div>

            <div className={`${isDarkMode ? 'bg-[#121622] border-slate-800/80 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-6 relative overflow-hidden`}>
              <div className={`text-xs font-medium uppercase tracking-wider ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>Your GWA</div>
              
              <div className={`text-5xl font-black tracking-tight my-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{gwa}</div>
              
              <div className={`grid grid-cols-2 gap-4 pt-3 border-t ${isDarkMode ? 'border-slate-800/80' : 'border-slate-200'} mb-5`}>
                <div>
                  <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Subjects</div>
                  <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{subjects.length}</div>
                </div>
                <div>
                  <div className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Total units</div>
                  <div className={`text-base font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{totalUnits}</div>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border font-semibold text-center text-sm shadow-inner ${currentHonor.color}`}>
                {currentHonor.title}
              </div>
            </div>
          </div>

          {/* Left Column Top: Add Subject Card (Appears 2nd on mobile, left column top on desktop) */}
          <div className="lg:col-span-2 lg:order-1 order-2 space-y-6">
            <div className={`${isDarkMode ? 'bg-[#121622] border-slate-800/80 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-6`}>
              <h2 className={`text-lg font-semibold mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Add a subject</h2>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Subject code <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MATH 101"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-[#1b2234] border-slate-700/60 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                      Subject name <span className={isDarkMode ? 'text-slate-500' : 'text-slate-400'}>(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Calculus I"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className={`w-full ${isDarkMode ? 'bg-[#1b2234] border-slate-700/60 text-white placeholder-slate-500' : 'bg-slate-50 border-slate-300 text-slate-900 placeholder-slate-400'} border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Grade obtained</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                      className={`w-full ${isDarkMode ? 'bg-[#1b2234] border-slate-700/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="" disabled>Select grade</option>
                      <option value="1.00">1.00</option>
                      <option value="1.25">1.25</option>
                      <option value="1.50">1.50</option>
                      <option value="1.75">1.75</option>
                      <option value="2.00">2.00</option>
                      <option value="2.25">2.25</option>
                      <option value="2.50">2.50</option>
                      <option value="2.75">2.75</option>
                      <option value="3.00">3.00</option>
                      <option value="5.00">5.00 (Failed)</option>
                    </select>
                  </div>
                  <div>
                    <label className={`block text-xs font-medium mb-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>Units</label>
                    <select
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                      required
                      className={`w-full ${isDarkMode ? 'bg-[#1b2234] border-slate-700/60 text-white' : 'bg-slate-50 border-slate-300 text-slate-900'} border rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    >
                      <option value="" disabled>Select units</option>
                      <option value="1">1 unit</option>
                      <option value="1.5">1.5 units</option>
                      <option value="2">2 units</option>
                      <option value="3">3 units</option>
                      <option value="4">4 units</option>
                      <option value="5">5 units</option>
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  className="mt-2 bg-blue-600 hover:bg-blue-500 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition shadow-lg shadow-blue-600/25"
                >
                  Add subject
                </button>
              </form>
            </div>
          </div>

          {/* Left Column Bottom: Your Subjects Card (Appears 3rd on mobile, left column bottom on desktop) */}
          <div className="lg:col-span-2 lg:order-3 order-3 space-y-6">
            <div className={`${isDarkMode ? 'bg-[#121622] border-slate-800/80 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-6`}>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Your subjects</h2>
                  <p className={`text-xs ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>Use arrows or drag rows to reorder</p>
                </div>
                {subjects.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className={`text-xs font-medium ${isDarkMode ? 'text-slate-400 hover:text-red-400' : 'text-slate-500 hover:text-red-600'} transition`}
                  >
                    Clear all
                  </button>
                )}
              </div>

              {subjects.length === 0 ? (
                <div className={`text-center py-8 text-sm ${isDarkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                  No subjects added yet. Add a subject above to start computing.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className={`border-b ${isDarkMode ? 'border-slate-800 text-slate-400' : 'border-slate-200 text-slate-500'} text-xs font-medium uppercase tracking-wider`}>
                        <th className="pb-3 pr-4">Subject</th>
                        <th className="pb-3 px-4 text-center">Grade</th>
                        <th className="pb-3 px-4 text-center">Units</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className={`divide-y ${isDarkMode ? 'divide-slate-800/50' : 'divide-slate-200'}`}>
                      {subjects.map((sub, index) => (
                        <tr
                          key={sub.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(index)}
                          className={`group ${isDarkMode ? 'hover:bg-[#161c2e]/55 text-white' : 'hover:bg-slate-50 text-slate-900'} transition cursor-grab active:cursor-grabbing`}
                        >
                          <td className="py-3.5 pr-4 font-medium flex items-center gap-2">
                            <span className={`${isDarkMode ? 'text-slate-600 group-hover:text-slate-400' : 'text-slate-300 group-hover:text-slate-500'} select-none`} title="Drag to reorder">⠿</span>
                            {sub.code} {sub.name && <span className={`${isDarkMode ? 'text-slate-400' : 'text-slate-500'} font-normal`}>({sub.name})</span>}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-blue-500">{sub.grade}</td>
                          <td className={`py-3.5 px-4 text-center ${isDarkMode ? 'text-slate-300' : 'text-slate-700'}`}>{sub.units}</td>
                          <td className="py-3.5 pl-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={() => handleMoveUp(index)}
                                disabled={index === 0}
                                className={`p-1 rounded text-xs ${index === 0 ? 'opacity-30 cursor-not-allowed' : isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                                title="Move up"
                              >
                                ▲
                              </button>
                              <button
                                onClick={() => handleMoveDown(index)}
                                disabled={index === subjects.length - 1}
                                className={`p-1 rounded text-xs ${index === subjects.length - 1 ? 'opacity-30 cursor-not-allowed' : isDarkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-200 text-slate-600'}`}
                                title="Move down"
                              >
                                ▼
                              </button>
                              <button
                                onClick={() => handleDelete(sub.id)}
                                className={`${isDarkMode ? 'text-slate-500 hover:text-red-400' : 'text-slate-400 hover:text-red-600'} transition p-1`}
                                title="Remove subject"
                              >
                                🗑
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>

          {/* Right Column Bottom: Honor Tiers Guide (Appears 4th on mobile, right column bottom on desktop) */}
          <div className="lg:col-span-1 lg:order-4 order-4 space-y-6">
            <div className={`${isDarkMode ? 'bg-[#121622] border-slate-800/80 shadow-xl' : 'bg-white border-slate-200 shadow-sm'} border rounded-2xl p-5`}>
              <div className="space-y-2.5 text-sm">
                <div className={`flex justify-between items-center p-2.5 rounded-xl ${isDarkMode ? 'bg-[#161c2e]/60 border-slate-800/50' : 'bg-slate-50 border-slate-200'} border`}>
                  <span className="text-purple-500 font-medium">University Scholar</span>
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>1.00 – 1.50</span>
                </div>
                <div className={`flex justify-between items-center p-2.5 rounded-xl ${isDarkMode ? 'bg-[#161c2e]/60 border-slate-800/50' : 'bg-slate-50 border-slate-200'} border`}>
                  <span className="text-amber-500 font-medium">College Scholar</span>
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>1.51 – 1.75</span>
                </div>
                <div className={`flex justify-between items-center p-2.5 rounded-xl ${isDarkMode ? 'bg-[#161c2e]/60 border-slate-800/50' : 'bg-slate-50 border-slate-200'} border`}>
                  <span className="text-blue-500 font-medium">Dean's Lister</span>
                  <span className={`text-xs font-semibold ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>1.76 – 2.00</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className={`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full border-t ${isDarkMode ? 'border-slate-800/60 text-slate-500' : 'border-slate-200 text-slate-500'} mt-12 text-xs`}>
        GWA = sum of (grade × units) ÷ total units. This is an unofficial estimate. Final honors depend on CLSU's complete academic requirements, so confirm with your college registrar.
      </footer>
    </div>
  );
}
