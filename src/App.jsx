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

  // Calculate GWA
  const totalUnits = subjects.reduce((acc, curr) => acc + (parseFloat(curr.units) || 0), 0);
  const totalPoints = subjects.reduce((acc, curr) => acc + (parseFloat(curr.grade) || 0) * (parseFloat(curr.units) || 0), 0);
  const gwa = totalUnits > 0 ? (totalPoints / totalUnits).toFixed(2) : '0.00';

  // Determine Honor Standing
  const getHonorStatus = (val) => {
    const num = parseFloat(val);
    if (num >= 1.00 && num <= 1.50) return { title: 'University Scholar', color: 'text-purple-400 border-purple-500/50 bg-purple-950/20' };
    if (num >= 1.51 && num <= 1.75) return { title: 'College Scholar', color: 'text-amber-400 border-amber-500/50 bg-amber-950/20' };
    if (num >= 1.76 && num <= 2.00) return { title: "Dean's Lister", color: 'text-blue-400 border-blue-500/50 bg-blue-950/20' };
    return { title: 'Regular Student', color: 'text-slate-400 border-slate-700 bg-slate-900/50' };
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

  // Drag and Drop Handlers
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
    <div className="min-h-screen bg-[#090a0f] text-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Header Section */}
        <header className="mb-8">
          <span className="text-xs font-semibold tracking-wider text-blue-400 uppercase">
            Central Luzon State University
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white mt-1">
            GWA Calculator
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
            Add your subjects, grades, and units to get your General Weighted Average and see which academic honor it reaches.
          </p>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          
          {/* Left Column (2 spans): Add Subject & Subject Table */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Add Subject Card */}
            <div className="bg-[#121622] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <h2 className="text-lg font-semibold text-white mb-4">Add a subject</h2>
              <form onSubmit={handleAddSubject} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Subject code <span className="text-slate-500">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. MATH 101"
                      value={subjectCode}
                      onChange={(e) => setSubjectCode(e.target.value)}
                      className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Subject name <span className="text-slate-500">(optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Calculus I"
                      value={subjectName}
                      onChange={(e) => setSubjectName(e.target.value)}
                      className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Grade obtained</label>
                    <select
                      value={grade}
                      onChange={(e) => setGrade(e.target.value)}
                      required
                      className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    <label className="block text-xs font-medium text-slate-400 mb-1">Units</label>
                    <select
                      value={units}
                      onChange={(e) => setUnits(e.target.value)}
                      required
                      className="w-full bg-[#1b2234] border border-slate-700/60 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
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

            {/* Your Subjects Card */}
            <div className="bg-[#121622] border border-slate-800/80 rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-semibold text-white">Your subjects</h2>
                  <p className="text-xs text-slate-500">Drag and drop rows to reorder</p>
                </div>
                {subjects.length > 0 && (
                  <button
                    onClick={handleClearAll}
                    className="text-xs font-medium text-slate-400 hover:text-red-400 transition"
                  >
                    Clear all
                  </button>
                )}
              </div>

              {subjects.length === 0 ? (
                <div className="text-center py-8 text-slate-500 text-sm">
                  No subjects added yet. Add a subject above to start computing.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-xs font-medium uppercase tracking-wider">
                        <th className="pb-3 pr-4">Subject</th>
                        <th className="pb-3 px-4 text-center">Grade</th>
                        <th className="pb-3 px-4 text-center">Units</th>
                        <th className="pb-3 pl-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50">
                      {subjects.map((sub, index) => (
                        <tr
                          key={sub.id}
                          draggable
                          onDragStart={() => handleDragStart(index)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(index)}
                          className="group hover:bg-[#161c2e]/55 transition cursor-grab active:cursor-grabbing"
                        >
                          <td className="py-3.5 pr-4 font-medium text-white flex items-center gap-2">
                            <span className="text-slate-600 group-hover:text-slate-400 select-none" title="Drag to reorder">⠿</span>
                            {sub.code} {sub.name && <span className="text-slate-400 font-normal">({sub.name})</span>}
                          </td>
                          <td className="py-3.5 px-4 text-center font-semibold text-blue-400">{sub.grade}</td>
                          <td className="py-3.5 px-4 text-center text-slate-300">{sub.units}</td>
                          <td className="py-3.5 pl-4 text-right">
                            <button
                              onClick={() => handleDelete(sub.id)}
                              className="text-slate-500 hover:text-red-400 transition p-1"
                              title="Remove subject"
                            >
                              🗑
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

          </div>

          {/* Right Column (1 span): GWA Summary & Honor Tiers */}
          <div className="space-y-6">
            
            {/* Your GWA Display Card */}
            <div className="bg-[#121622] border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="text-xs font-medium text-slate-400 uppercase tracking-wider">Your GWA</div>
              <div className="text-5xl font-black text-white tracking-tight my-3">{gwa}</div>
              
              <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800/80 mb-5">
                <div>
                  <div className="text-xs text-slate-500">Subjects</div>
                  <div className="text-base font-semibold text-white">{subjects.length}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500">Total units</div>
                  <div className="text-base font-semibold text-white">{totalUnits}</div>
                </div>
              </div>

              <div className={`p-3.5 rounded-xl border font-semibold text-center text-sm shadow-inner ${currentHonor.color}`}>
                {currentHonor.title}
              </div>
            </div>

            {/* Honor Tiers Guide */}
            <div className="bg-[#121622] border border-slate-800/80 rounded-2xl p-5 shadow-xl">
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#161c2e]/60 border border-slate-800/50">
                  <span className="text-purple-400 font-medium">University Scholar</span>
                  <span className="text-slate-400 text-xs font-semibold">1.00 – 1.50</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#161c2e]/60 border border-slate-800/50">
                  <span className="text-amber-400 font-medium">College Scholar</span>
                  <span className="text-slate-400 text-xs font-semibold">1.51 – 1.75</span>
                </div>
                <div className="flex justify-between items-center p-2.5 rounded-xl bg-[#161c2e]/60 border border-slate-800/50">
                  <span className="text-blue-400 font-medium">Dean's Lister</span>
                  <span className="text-slate-400 text-xs font-semibold">1.76 – 2.00</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full border-t border-slate-800/60 mt-12 text-xs text-slate-500">
        GWA = sum of (grade × units) ÷ total units. This is an unofficial estimate. Final honors depend on CLSU's complete academic requirements, so confirm with your college registrar.
      </footer>
    </div>
  );
}
