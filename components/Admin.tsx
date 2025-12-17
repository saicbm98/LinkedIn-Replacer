
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Save, Plus, Trash, X, Camera, RotateCcw, Lock, Database, Check, AlertTriangle } from 'lucide-react';
import { Experience, Project } from '../types';

const Admin: React.FC = () => {
  const { profile, updateProfile, currentUser, changePassword, firebaseConfig, setFirebaseConfig, isFirebaseConnected } = useStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Firebase Config State - Initialize from store, but don't auto-sync via useEffect to prevent input locking
  const [fbConfigInput, setFbConfigInput] = useState(() => {
      if (firebaseConfig) {
          return JSON.stringify(firebaseConfig, null, 2);
      }
      return '';
  });
  const [fbSaved, setFbSaved] = useState(false);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  if (currentUser !== 'owner') {
    return <div className="p-10 text-center text-red-500">Access Denied</div>;
  }

  const handleSave = () => {
    updateProfile(localProfile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handlePasswordUpdate = () => {
      if (!newPassword.trim()) return;
      changePassword(newPassword);
      setNewPassword('');
      setPasswordSaved(true);
      setTimeout(() => setPasswordSaved(false), 3000);
  };

  const handleFirebaseSave = () => {
      try {
          let input = fbConfigInput.trim();
          
          if (!input) {
              setFirebaseConfig(null);
              setFbSaved(true);
              setTimeout(() => setFbSaved(false), 2000);
              return;
          }

          // Smart Parsing: Handle raw JS copy-paste from Firebase Console
          
          // 1. Remove comments (// ... and /* ... */)
          input = input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');

          // 2. Remove "const firebaseConfig =" and ";"
          input = input.replace(/const\s+\w+\s*=\s*/, '').replace(/;$/, '');
          
          // 3. Quote keys if they aren't quoted (e.g. apiKey: -> "apiKey":)
          // This regex finds keys at start of object or after comma/newline
          input = input.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          
          // 4. Remove trailing commas (JSON doesn't allow them)
          input = input.replace(/,(\s*})/g, '$1');

          // 5. Try parsing
          const config = JSON.parse(input);

          if (!config.apiKey || !config.projectId) {
              throw new Error("Missing required fields (apiKey, projectId)");
          }

          setFirebaseConfig(config);
          setFbSaved(true);
          setTimeout(() => setFbSaved(false), 2000);
      } catch (e) {
          console.error(e);
          alert("Invalid configuration format. Please copy the entire 'const firebaseConfig = { ... }' block directly from the Firebase Console.");
      }
  };

  const handleChange = (field: string, value: any) => {
    setLocalProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = () => {
    if (newSkill.trim() && !localProfile.skills.includes(newSkill.trim())) {
      handleChange('skills', [...localProfile.skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleRemoveSkill = (skillToRemove: string) => {
    handleChange('skills', localProfile.skills.filter(s => s !== skillToRemove));
  };

  const handleAddPosition = () => {
    const newExp: Experience = {
        id: Date.now().toString(),
        company: '',
        title: '',
        dates: '',
        location: '',
        description: [''],
        logoUrl: '',
        employmentType: 'Full-time'
    };
    handleChange('experience', [newExp, ...localProfile.experience]);
  };

  const handleAddProject = () => {
    const newProj: Project = {
      id: Date.now().toString(),
      name: '',
      description: '',
      stack: [],
      link: ''
    };
    handleChange('projects', [newProj, ...localProfile.projects]);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'avatar' | 'cover') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert("Image is too large. Please choose an image under 2MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      if (type === 'avatar') {
        handleChange('avatarUrl', base64String);
      } else {
        handleChange('coverUrl', base64String);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleExpLogoUpload = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
      const file = e.target.files?.[0];
      if (!file) return;

      if (file.size > 2 * 1024 * 1024) {
        alert("Image is too large. Please choose an image under 2MB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newExp = [...localProfile.experience];
        newExp[index].logoUrl = base64String;
        handleChange('experience', newExp);
      };
      reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-20">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#1A1A1A]">Edit Profile</h1>
        <button 
            onClick={handleSave}
            className="bg-[#0A66C2] text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-[#004182]"
        >
            <Save className="w-4 h-4" /> {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Real-time DB Connection */}
        <section className={`bg-white rounded-lg border p-6 shadow-sm space-y-4 ${isFirebaseConnected ? 'border-green-200' : 'border-orange-200'}`}>
            <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                    <Database className="w-4 h-4" /> 
                    Real-time Database Connection
                </h2>
                {isFirebaseConnected ? (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full font-bold flex items-center gap-1">
                        <Check className="w-3 h-3" /> Connected
                    </span>
                ) : (
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full font-bold">Demo Mode</span>
                )}
            </div>
            
            <div className="text-sm text-gray-600">
                <p className="mb-2">
                    Connect <b>Google Firebase</b> to enable real-time messaging across different devices.
                </p>
                <div className="bg-gray-50 p-3 rounded text-xs mb-3 border border-gray-200">
                    <p className="font-semibold mb-1">How to connect:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Go to <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 hover:underline">Firebase Console</a> > Project Settings (Gear Icon).</li>
                        <li>Scroll down to <b>"Your apps"</b>.</li>
                        <li>Under <b>SDK setup and configuration</b>, select <b>Config</b> (not npm).</li>
                        <li>Copy the entire code block starting with <code>const firebaseConfig = ...</code>.</li>
                        <li>Paste it below.</li>
                    </ol>
                </div>
            </div>

            <textarea 
                className="w-full border font-mono text-xs p-3 h-32 rounded bg-gray-50 focus:ring-1 focus:ring-[#0A66C2] outline-none text-black"
                placeholder={`const firebaseConfig = {\n  apiKey: "AIzaSy...",\n  authDomain: "...",\n  projectId: "..."\n};`}
                value={fbConfigInput}
                onChange={e => setFbConfigInput(e.target.value)}
            />
            
            <div className="flex gap-2">
                 <button 
                    onClick={handleFirebaseSave}
                    className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-black transition-colors text-sm"
                >
                    {fbSaved ? 'Saved!' : 'Save Connection'}
                </button>
                {isFirebaseConnected && (
                     <button 
                        onClick={() => { setFirebaseConfig(null); setFbConfigInput(''); }}
                        className="text-red-600 hover:bg-red-50 px-4 py-2 rounded font-semibold transition-colors text-sm"
                    >
                        Disconnect
                    </button>
                )}
            </div>
            {isFirebaseConnected && (
                <div className="text-[10px] text-gray-400">
                    Note: Ensure your Firestore Database rules are set to <b>Test Mode</b> (allow read/write) for this demo to work immediately.
                </div>
            )}
        </section>
        
        {/* Images */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
           <h2 className="text-lg font-semibold border-b pb-2 mb-4">Profile Images</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Avatar */}
             <div className="flex flex-col items-center">
               <span className="text-sm font-medium mb-2 text-gray-700">Profile Picture</span>
               <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200 group">
                 <img src={localProfile.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                 <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                 >
                   <Camera className="text-white w-8 h-8" />
                 </div>
               </div>
               <input type="file" ref={avatarInputRef} onChange={e => handleImageUpload(e, 'avatar')} className="hidden" accept="image/*" />
               <button onClick={() => avatarInputRef.current?.click()} className="text-[#0A66C2] text-sm font-semibold mt-2">Change Photo</button>
             </div>

             {/* Cover */}
             <div className="flex flex-col items-center">
               <span className="text-sm font-medium mb-2 text-gray-700">Cover Photo</span>
               <div className="relative w-full h-32 rounded overflow-hidden border border-gray-200 group">
                 <img src={localProfile.coverUrl} className="w-full h-full object-cover" alt="cover" />
                 <div 
                    onClick={() => coverInputRef.current?.click()}
                    className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity"
                 >
                   <Camera className="text-white w-8 h-8" />
                 </div>
               </div>
               <input type="file" ref={coverInputRef} onChange={e => handleImageUpload(e, 'cover')} className="hidden" accept="image/*" />
               <button onClick={() => coverInputRef.current?.click()} className="text-[#0A66C2] text-sm font-semibold mt-2">Change Cover</button>
             </div>
           </div>
        </section>

        {/* Security / Password */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Lock className="w-4 h-4" /> Security</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">New Password</label>
                    <input 
                        type="password" 
                        value={newPassword} 
                        onChange={e => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="w-full border rounded p-2 focus:ring-1 focus:ring-[#0A66C2] outline-none"
                    />
                </div>
                <button 
                    onClick={handlePasswordUpdate}
                    disabled={!newPassword.trim()}
                    className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-black disabled:opacity-50 transition-colors"
                >
                    Update Password
                </button>
             </div>
             {passwordSaved && <p className="text-xs text-green-600 font-bold">Password updated successfully! Don't forget it.</p>}
        </section>

        {/* Basic Info */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Name</label>
                    <input 
                        type="text" 
                        value={localProfile.name} 
                        onChange={e => handleChange('name', e.target.value)}
                        className="w-full border rounded p-2 focus:ring-1 focus:ring-[#0A66C2] outline-none"
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Location</label>
                    <input 
                        type="text" 
                        value={localProfile.location} 
                        onChange={e => handleChange('location', e.target.value)}
                        className="w-full border rounded p-2 focus:ring-1 focus:ring-[#0A66C2] outline-none"
                    />
                </div>
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Headline</label>
                <input 
                    type="text" 
                    value={localProfile.headline} 
                    onChange={e => handleChange('headline', e.target.value)}
                    className="w-full border rounded p-2 focus:ring-1 focus:ring-[#0A66C2] outline-none"
                />
            </div>
            <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">About (Long)</label>
                <textarea 
                    value={localProfile.aboutLong} 
                    onChange={e => handleChange('aboutLong', e.target.value)}
                    className="w-full border rounded p-2 h-32 focus:ring-1 focus:ring-[#0A66C2] outline-none"
                />
            </div>
        </section>
        
        {/* What I'm Looking For */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">What I'm Looking For</h2>
            <textarea 
                className="w-full border rounded p-2 h-32 text-sm focus:ring-1 focus:ring-[#0A66C2] outline-none"
                value={(localProfile.whatLookingFor || []).join('\n')}
                onChange={(e) => {
                    handleChange('whatLookingFor', e.target.value.split('\n'));
                }}
                placeholder="Enter each point on a new line"
            />
            <p className="text-xs text-gray-500">Enter each requirement on a new line.</p>
        </section>

        {/* Skills */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {localProfile.skills.map(skill => (
                <div key={skill} className="bg-[#EDF3F8] text-[#1A1A1A] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="text-gray-500 hover:text-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={newSkill}
                onChange={e => setNewSkill(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddSkill()}
                placeholder="Add a new skill"
                className="border rounded p-2 text-sm flex-1 focus:ring-1 focus:ring-[#0A66C2] outline-none"
              />
              <button 
                onClick={handleAddSkill}
                className="bg-[#0A66C2] text-white px-4 py-2 rounded font-semibold hover:bg-[#004182]"
              >
                Add
              </button>
            </div>
        </section>

        {/* Projects Editor */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold">Projects</h2>
                <button 
                    onClick={handleAddProject}
                    className="text-[#0A66C2] text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                    <Plus className="w-3 h-3" /> Add Project
                </button>
            </div>
            {localProfile.projects.map((proj, idx) => (
                <div key={proj.id} className="border p-4 rounded bg-gray-50 relative group mb-4">
                     <div className="absolute top-2 right-2 flex gap-2">
                        <button 
                            onClick={() => {
                              const newProjs = localProfile.projects.filter((_, i) => i !== idx);
                              handleChange('projects', newProjs);
                            }}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded flex items-center gap-1 text-xs"
                            title="Remove Project"
                        >
                            <Trash className="w-3 h-3" /> Remove
                        </button>
                     </div>
                     <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Project Name</label>
                                <input 
                                    value={proj.name} 
                                    className="w-full border p-2 rounded text-sm font-semibold" 
                                    placeholder="e.g. Portfolio Site" 
                                    onChange={(e) => {
                                        const newProjs = [...localProfile.projects];
                                        newProjs[idx].name = e.target.value;
                                        handleChange('projects', newProjs);
                                    }} 
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">Link URL</label>
                                <input 
                                    value={proj.link || ''} 
                                    className="w-full border p-2 rounded text-sm" 
                                    placeholder="https://..." 
                                    onChange={(e) => {
                                        const newProjs = [...localProfile.projects];
                                        newProjs[idx].link = e.target.value;
                                        handleChange('projects', newProjs);
                                    }} 
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Description</label>
                            <textarea 
                                className="w-full border p-2 rounded text-sm h-20" 
                                value={proj.description} 
                                onChange={(e) => {
                                    const newProjs = [...localProfile.projects];
                                    newProjs[idx].description = e.target.value;
                                    handleChange('projects', newProjs);
                                }} 
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Tech Stack (comma separated)</label>
                            <input 
                                value={proj.stack.join(', ')} 
                                className="w-full border p-2 rounded text-sm" 
                                placeholder="React, TypeScript, Tailwind" 
                                onChange={(e) => {
                                    const newProjs = [...localProfile.projects];
                                    newProjs[idx].stack = e.target.value.split(',').map(s => s.trim()).filter(Boolean);
                                    handleChange('projects', newProjs);
                                }} 
                            />
                        </div>
                     </div>
                </div>
            ))}
        </section>

        {/* Experience - simplified editor */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold">Experience</h2>
                <button 
                    onClick={handleAddPosition}
                    className="text-[#0A66C2] text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors"
                >
                    <Plus className="w-3 h-3" /> Add Position
                </button>
            </div>
            {localProfile.experience.map((exp, idx) => (
                <div key={exp.id} className="border p-4 rounded bg-gray-50 relative group mb-4">
                     <div className="absolute top-2 right-2 flex gap-2">
                        <button 
                            onClick={() => {
                              const newExp = [...localProfile.experience];
                              newExp[idx] = { ...newExp[idx], company: '', title: '', dates: '', location: '', description: [''], logoUrl: '', employmentType: '' };
                              handleChange('experience', newExp);
                            }}
                            className="text-gray-400 hover:text-orange-600 hover:bg-orange-50 p-1 rounded flex items-center gap-1 text-xs"
                            title="Clear fields"
                        >
                            <RotateCcw className="w-3 h-3" /> Clear
                        </button>
                        <button 
                            onClick={() => {
                              const newExp = localProfile.experience.filter((_, i) => i !== idx);
                              handleChange('experience', newExp);
                            }}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1 rounded flex items-center gap-1 text-xs"
                            title="Remove Position"
                        >
                            <Trash className="w-3 h-3" /> Remove
                        </button>
                     </div>
                     <div className="flex gap-4 items-start mt-4">
                        <div className="flex flex-col items-center gap-2">
                            {exp.logoUrl ? (
                                <img src={exp.logoUrl} alt="Logo" className="w-12 h-12 object-contain bg-white rounded border" />
                            ) : (
                                <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">
                                    No Logo
                                </div>
                            )}
                            <label className="cursor-pointer text-[#0A66C2] text-xs font-semibold hover:underline">
                                Upload Logo
                                <input type="file" className="hidden" accept="image/*" onChange={(e) => handleExpLogoUpload(e, idx)} />
                            </label>
                        </div>
                        <div className="flex-1 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                                <input value={exp.title} className="border p-2 rounded text-sm font-semibold" placeholder="Title" onChange={(e) => {
                                    const newExp = [...localProfile.experience];
                                    newExp[idx].title = e.target.value;
                                    handleChange('experience', newExp);
                                }} />
                                <input value={exp.company} className="border p-2 rounded text-sm" placeholder="Company" onChange={(e) => {
                                    const newExp = [...localProfile.experience];
                                    newExp[idx].company = e.target.value;
                                    handleChange('experience', newExp);
                                }} />
                            </div>
                             <div className="grid grid-cols-2 gap-2">
                                <select 
                                    value={exp.employmentType || ''}
                                    onChange={(e) => {
                                        const newExp = [...localProfile.experience];
                                        newExp[idx].employmentType = e.target.value;
                                        handleChange('experience', newExp);
                                    }}
                                    className="border p-2 rounded text-sm bg-white"
                                >
                                    <option value="">Select Type</option>
                                    <option value="Full-time">Full-time</option>
                                    <option value="Part-time">Part-time</option>
                                    <option value="Freelance">Freelance</option>
                                    <option value="Temporary">Temporary</option>
                                    <option value="Contract">Contract</option>
                                </select>
                                <div className="hidden"></div> 
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                <input value={exp.dates} className="border p-2 rounded text-xs" placeholder="Dates" onChange={(e) => {
                                    const newExp = [...localProfile.experience];
                                    newExp[idx].dates = e.target.value;
                                    handleChange('experience', newExp);
                                }} />
                                <input value={exp.location} className="border p-2 rounded text-xs" placeholder="Location" onChange={(e) => {
                                    const newExp = [...localProfile.experience];
                                    newExp[idx].location = e.target.value;
                                    handleChange('experience', newExp);
                                }} />
                            </div>
                            <textarea className="w-full border p-2 rounded text-sm h-24" value={exp.description.join('\n')} onChange={(e) => {
                                    const newExp = [...localProfile.experience];
                                    newExp[idx].description = e.target.value.split('\n');
                                    handleChange('experience', newExp);
                            }} />
                        </div>
                     </div>
                </div>
            ))}
        </section>
      </div>
    </div>
  );
};

export default Admin;