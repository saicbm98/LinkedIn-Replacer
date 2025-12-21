import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store.tsx';
import { Save, Plus, Trash, X, Camera, RotateCcw, Lock, Database, Check, AlertTriangle, Zap } from 'lucide-react';
import { Experience, Project } from '../types.ts';

const Admin: React.FC = () => {
  const { profile, updateProfile, currentUser, changePassword, firebaseConfig, setFirebaseConfig, isFirebaseConnected } = useStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState('');
  
  // Password State
  const [newPassword, setNewPassword] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);

  // Firebase Config State
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
    // Clean up data before saving (trim whitespace from arrays)
    const cleanedProfile = {
        ...localProfile,
        experience: localProfile.experience.map(exp => ({
            ...exp,
            description: exp.description.map(d => d.trim()).filter(Boolean)
        })),
        projects: localProfile.projects.map(proj => ({
            ...proj,
            stack: proj.stack.map(s => s.trim()).filter(Boolean)
        })),
        collaborateBullets: localProfile.collaborateBullets.map(b => b.trim()).filter(Boolean)
    };
    updateProfile(cleanedProfile);
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
          input = input.replace(/\/\/.*$/gm, '').replace(/\/\*[\s\S]*?\*\//g, '');
          input = input.replace(/const\s+\w+\s*=\s*/, '').replace(/;$/, '');
          input = input.replace(/([{,]\s*)([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
          input = input.replace(/,(\s*})/g, '$1');
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
            className="bg-[#0A66C2] text-white px-6 py-2 rounded-full font-semibold flex items-center gap-2 hover:bg-[#004182] transition-all"
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
                <p className="mb-2">Connect <b>Google Firebase</b> to enable real-time messaging across different devices.</p>
                <div className="bg-gray-50 p-3 rounded text-xs mb-3 border border-gray-200">
                    <p className="font-semibold mb-1">How to connect:</p>
                    <ol className="list-decimal list-inside space-y-1">
                        <li>Go to <a href="https://console.firebase.google.com/" target="_blank" className="text-blue-600 hover:underline">Firebase Console</a>.</li>
                        <li>Find "Your apps" > "Config".</li>
                        <li>Paste the config object below.</li>
                    </ol>
                </div>
            </div>

            <textarea 
                className="w-full border font-mono text-xs p-3 h-32 rounded bg-gray-50 focus:ring-1 focus:ring-[#0A66C2] outline-none text-black"
                placeholder={`const firebaseConfig = {\n  apiKey: "...",\n  projectId: "..."\n};`}
                value={fbConfigInput}
                onChange={e => setFbConfigInput(e.target.value)}
            />
            
            <div className="flex gap-2">
                 <button onClick={handleFirebaseSave} className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-black transition-colors text-sm">
                    {fbSaved ? 'Saved!' : 'Save Connection'}
                </button>
                {isFirebaseConnected && (
                     <button onClick={() => { setFirebaseConfig(null); setFbConfigInput(''); }} className="text-red-600 hover:bg-red-50 px-4 py-2 rounded font-semibold transition-colors text-sm">
                        Disconnect
                    </button>
                )}
            </div>
        </section>
        
        {/* Images */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
           <h2 className="text-lg font-semibold border-b pb-2 mb-4">Profile Images</h2>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="flex flex-col items-center">
               <span className="text-sm font-medium mb-2 text-gray-700">Profile Picture</span>
               <div className="relative w-32 h-32 rounded-full overflow-hidden border border-gray-200 group">
                 <img src={localProfile.avatarUrl} className="w-full h-full object-cover" alt="avatar" />
                 <div onClick={() => avatarInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                   <Camera className="text-white w-8 h-8" />
                 </div>
               </div>
               <input type="file" ref={avatarInputRef} onChange={e => handleImageUpload(e, 'avatar')} className="hidden" accept="image/*" />
             </div>
             <div className="flex flex-col items-center">
               <span className="text-sm font-medium mb-2 text-gray-700">Cover Photo</span>
               <div className="relative w-full h-32 rounded overflow-hidden border border-gray-200 group">
                 <img src={localProfile.coverUrl} className="w-full h-full object-cover" alt="cover" />
                 <div onClick={() => coverInputRef.current?.click()} className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                   <Camera className="text-white w-8 h-8" />
                 </div>
               </div>
               <input type="file" ref={coverInputRef} onChange={e => handleImageUpload(e, 'cover')} className="hidden" accept="image/*" />
             </div>
           </div>
        </section>

        {/* Let's Collaborate Section Editor */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Zap className="w-4 h-4 text-amber-500" /> Collaboration Settings</h2>
             </div>
             <div className="space-y-3">
                <label className="block text-xs font-bold text-gray-500 uppercase">Subtitle / Intro Line</label>
                <textarea 
                    value={localProfile.collaborateSubtitle} 
                    onChange={e => handleChange('collaborateSubtitle', e.target.value)}
                    placeholder="Are you a founder hiring manager or recruiter looking for someone who"
                    className="w-full border rounded p-2 focus:ring-1 focus:ring-[#0A66C2] outline-none text-sm h-16"
                />
                
                <label className="block text-xs font-bold text-gray-500 uppercase">Value Points (one per line)</label>
                <textarea 
                    className="w-full border p-2 rounded text-sm h-32 focus:ring-1 focus:ring-[#0A66C2] outline-none" 
                    placeholder="Enter your key collaboration points..."
                    value={localProfile.collaborateBullets.join('\n')} 
                    onChange={(e) => {
                        // Split by newline but don't filter immediately so user can type new lines
                        handleChange('collaborateBullets', e.target.value.split('\n'));
                    }} 
                />
             </div>
        </section>

        {/* Security */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
             <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Lock className="w-4 h-4" /> Security</h2>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                <input 
                    type="password" 
                    value={newPassword} 
                    onChange={e => setNewPassword(e.target.value)}
                    placeholder="New password"
                    className="w-full border rounded p-2 focus:ring-1 focus:ring-[#0A66C2] outline-none"
                />
                <button onClick={handlePasswordUpdate} disabled={!newPassword.trim()} className="bg-gray-800 text-white px-4 py-2 rounded font-semibold hover:bg-black disabled:opacity-50 transition-colors">
                    Update Password
                </button>
             </div>
        </section>

        {/* Basic Info */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Basic Info</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={localProfile.name} onChange={e => handleChange('name', e.target.value)} className="w-full border rounded p-2 focus:ring-1 focus:ring-[#0A66C2] outline-none" placeholder="Name" />
                <input type="text" value={localProfile.location} onChange={e => handleChange('location', e.target.value)} className="w-full border rounded p-2 focus:ring-1 focus:ring-[#0A66C2] outline-none" placeholder="Location" />
            </div>
            <input type="text" value={localProfile.headline} onChange={e => handleChange('headline', e.target.value)} className="w-full border rounded p-2 focus:ring-1 focus:ring-[#0A66C2] outline-none" placeholder="Headline" />
            <textarea value={localProfile.aboutLong} onChange={e => handleChange('aboutLong', e.target.value)} className="w-full border rounded p-2 h-32 focus:ring-1 focus:ring-[#0A66C2] outline-none" placeholder="About" />
        </section>
        
        {/* Skills */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
            <h2 className="text-lg font-semibold border-b pb-2">Skills</h2>
            <div className="flex flex-wrap gap-2 mb-4">
              {localProfile.skills.map(skill => (
                <div key={skill} className="bg-[#EDF3F8] text-[#1A1A1A] px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
                  {skill}
                  <button onClick={() => handleRemoveSkill(skill)} className="text-gray-500 hover:text-red-600"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <input type="text" value={newSkill} onChange={e => setNewSkill(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAddSkill()} placeholder="Add skill" className="border rounded p-2 text-sm flex-1 focus:ring-1 focus:ring-[#0A66C2] outline-none" />
              <button onClick={handleAddSkill} className="bg-[#0A66C2] text-white px-4 py-2 rounded font-semibold hover:bg-[#004182]">Add</button>
            </div>
        </section>

        {/* Projects Editor */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold">Projects</h2>
                <button onClick={handleAddProject} className="text-[#0A66C2] text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                    <Plus className="w-3 h-3" /> Add Project
                </button>
            </div>
            {localProfile.projects.map((proj, idx) => (
                <div key={proj.id} className="border p-4 rounded bg-gray-50 relative mb-4">
                     <button onClick={() => handleChange('projects', localProfile.projects.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-400 hover:text-red-600 flex items-center gap-1 text-xs">
                        <Trash className="w-3 h-3" /> Remove
                     </button>
                     <div className="space-y-3">
                        <div className="grid grid-cols-2 gap-3">
                            <input value={proj.name} className="w-full border p-2 rounded text-sm font-semibold" placeholder="Project Name" onChange={(e) => {
                                const newProjs = [...localProfile.projects];
                                newProjs[idx].name = e.target.value;
                                handleChange('projects', newProjs);
                            }} />
                            <input value={proj.link || ''} className="w-full border p-2 rounded text-sm" placeholder="Link" onChange={(e) => {
                                const newProjs = [...localProfile.projects];
                                newProjs[idx].link = e.target.value;
                                handleChange('projects', newProjs);
                            }} />
                        </div>
                        <textarea className="w-full border p-2 rounded text-sm h-20" placeholder="Description" value={proj.description} onChange={(e) => {
                            const newProjs = [...localProfile.projects];
                            newProjs[idx].description = e.target.value;
                            handleChange('projects', newProjs);
                        }} />
                        <div>
                            <label className="block text-[10px] text-gray-500 uppercase font-bold mb-1">Tech Stack (comma separated)</label>
                            <input 
                                value={proj.stack.join(', ')} 
                                className="w-full border p-2 rounded text-sm" 
                                placeholder="React, TypeScript, Node" 
                                onChange={(e) => {
                                    const val = e.target.value;
                                    const newProjs = [...localProfile.projects];
                                    // Use raw split to allow typing commas and spaces without them being stripped immediately
                                    newProjs[idx].stack = val.split(',').map(s => s.trimStart());
                                    handleChange('projects', newProjs);
                                }} 
                            />
                        </div>
                     </div>
                </div>
            ))}
        </section>

        {/* Experience Editor */}
        <section className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm space-y-4">
            <div className="flex justify-between items-center border-b pb-2">
                <h2 className="text-lg font-semibold">Experience</h2>
                <button onClick={handleAddPosition} className="text-[#0A66C2] text-sm font-medium flex items-center gap-1 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                    <Plus className="w-3 h-3" /> Add Position
                </button>
            </div>
            {localProfile.experience.map((exp, idx) => (
                <div key={exp.id} className="border p-4 rounded bg-gray-50 relative mb-4">
                     <button onClick={() => handleChange('experience', localProfile.experience.filter((_, i) => i !== idx))} className="absolute top-2 right-2 text-red-400 hover:text-red-600 flex items-center gap-1 text-xs">
                        <Trash className="w-3 h-3" /> Remove
                     </button>
                     <div className="flex gap-4 items-start mt-4">
                        <div className="flex flex-col items-center gap-2">
                            {exp.logoUrl ? <img src={exp.logoUrl} className="w-12 h-12 object-contain bg-white rounded border" /> : <div className="w-12 h-12 bg-gray-200 rounded flex items-center justify-center text-[10px] text-gray-400">LOGO</div>}
                            <label className="cursor-pointer text-[#0A66C2] text-[10px] font-bold uppercase hover:underline">
                                Upload <input type="file" className="hidden" accept="image/*" onChange={(e) => handleExpLogoUpload(e, idx)} />
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
                            <textarea 
                                className="w-full border p-2 rounded text-sm h-24" 
                                placeholder="Achievements (one per line)"
                                value={exp.description.join('\n')} 
                                onChange={(e) => {
                                    const newExp = [...localProfile.experience];
                                    // Split by newline but don't filter so user can type new lines
                                    newExp[idx].description = e.target.value.split('\n');
                                    handleChange('experience', newExp);
                                }} 
                            />
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