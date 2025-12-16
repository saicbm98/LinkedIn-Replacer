import React, { useState, useRef } from 'react';
import { useStore } from '../store';
import { Save, Plus, Trash, X, Camera, RotateCcw } from 'lucide-react';
import { Experience } from '../types';

const Admin: React.FC = () => {
  const { profile, updateProfile, currentUser } = useStore();
  const [localProfile, setLocalProfile] = useState(profile);
  const [saved, setSaved] = useState(false);
  const [newSkill, setNewSkill] = useState('');

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