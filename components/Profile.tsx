import { CustomCrispChat } from './CustomCrispChat.tsx';
import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store.tsx';
import { Link } from 'react-router-dom';
import { MapPin, Link as LinkIcon, Send, Plus, Camera, Pencil, Briefcase, ChevronDown, Printer, Github, Mail, Zap, Bot, Rocket, ArrowRight, X, AlertTriangle } from 'lucide-react';
import AIChatWidget from './AIChatWidget.tsx';

const LogoImage = ({ logoUrl, name }: { logoUrl?: string, name: string }) => {
  const [error, setError] = useState(false);

  if (logoUrl && !error) {
    return (
      <img 
        src={logoUrl} 
        alt={name} 
        className="w-12 h-12 rounded object-contain bg-white border border-gray-100 flex-shrink-0"
        onError={() => setError(true)}
      />
    );
  }

  return (
    <div className="w-12 h-12 bg-gray-100 rounded flex-shrink-0 flex items-center justify-center text-gray-400 font-bold text-xs border border-gray-200 uppercase">
      {name.substring(0,2)}
    </div>
  );
};

const Profile: React.FC = () => {
  const { profile, updateProfile, sendMessage, visitorToken, conversations, currentUser, simulateOwnerReply } = useStore();
  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  
  // Message form state
  const [msgBody, setMsgBody] = useState('');
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [lastConvId, setLastConvId] = useState<string | null>(null);

  // More menu state
  const [moreMenuOpen, setMoreMenuOpen] = useState(false);
  const moreMenuRef = useRef<HTMLDivElement>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);

  const activeConversation = conversations.find(c => c.visitorToken === visitorToken);

  // Close more menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
        if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
            setMoreMenuOpen(false);
        }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSendMessage = async () => {
    if (!msgBody.trim()) return;
    setSending(true);
    const convId = await sendMessage(
        activeConversation?.id || null, 
        msgBody, 
        'visitor',
        { name: msgName, email: msgEmail }
    );
    setLastConvId(convId);
    setSending(false);
    setSentSuccess(true);
  };

  const handlePrint = () => {
    setMoreMenuOpen(false);
    setTimeout(() => {
        window.print();
    }, 100);
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
        updateProfile({ ...profile, avatarUrl: base64String });
      } else {
        updateProfile({ ...profile, coverUrl: base64String });
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-0 md:px-4 py-6 grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* Hidden File Inputs */}
      <input 
        type="file" 
        ref={avatarInputRef} 
        onChange={(e) => handleImageUpload(e, 'avatar')} 
        className="hidden" 
        accept="image/*"
      />
      <input 
        type="file" 
        ref={coverInputRef} 
        onChange={(e) => handleImageUpload(e, 'cover')} 
        className="hidden" 
        accept="image/*"
      />

      {/* Main Column */}
      <div className="md:col-span-2 space-y-4">
        
        {/* Profile Header Card */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] relative pb-6 shadow-sm group">
          {/* Cover Image */}
          <div className="h-32 md:h-48 bg-gray-300 w-full rounded-t-lg overflow-hidden relative group/cover">
            <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
            {currentUser === 'owner' && (
              <button 
                onClick={() => coverInputRef.current?.click()}
                className="absolute top-4 right-4 bg-white/90 p-2 rounded-full shadow-md text-[#0A66C2] hover:bg-white transition-all opacity-0 group-hover/cover:opacity-100 z-10 print:hidden"
                title="Change Cover Photo"
              >
                <Camera className="w-5 h-5" />
              </button>
            )}
            <button className="absolute bottom-4 right-4 bg-white/90 p-1.5 rounded-full shadow text-gray-600 opacity-0 group-hover/cover:opacity-100 transition-opacity">
              <Pencil className="w-4 h-4" />
            </button>
          </div>
          
          <div className="px-6 relative">
            {/* Avatar */}
            <div className="absolute -top-16 md:-top-24 left-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] border-white overflow-hidden bg-white shadow-sm relative group/avatar">
                <img src={profile.avatarUrl} alt={profile.name} className="w-full h-full object-cover" />
                {currentUser === 'owner' && (
                  <div 
                    onClick={() => avatarInputRef.current?.click()}
                    className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 cursor-pointer transition-all z-10 print:hidden"
                    title="Change Profile Photo"
                  >
                    <Camera className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
            </div>

            {/* Basic Info */}
            <div className="pt-20 md:pt-20">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">{profile.name}</h1>
              <p className="text-[15px] text-[#1A1A1A] mt-1 leading-snug">{profile.headline}</p>
              
              <div className="flex items-center text-sm text-[#666666] mt-2 gap-1 flex-wrap">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                <span className="mx-1">·</span>
                <button 
                  onClick={() => setContactModalOpen(true)}
                  className="text-[#0A66C2] font-semibold cursor-pointer hover:underline outline-none print:hidden"
                >
                  Contact Info
                </button>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 relative z-20 print:hidden">
                <button 
                  onClick={() => setMsgModalOpen(true)}
                  className="bg-[#0A66C2] text-white px-5 py-1.5 rounded-full font-semibold hover:bg-[#004182] transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4 rotate-[45deg] mb-0.5" /> Message
                </button>
                
                <div className="relative" ref={moreMenuRef}>
                    <button 
                        onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                        className={`border border-[#666666] text-[#666666] px-5 py-1.5 rounded-full font-semibold hover:bg-gray-50 transition-colors ${moreMenuOpen ? 'bg-gray-100' : ''}`}
                    >
                        More
                    </button>
                    {moreMenuOpen && (
                        <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-100 py-1 z-30 animate-fade-in">
                            <button 
                                onClick={handlePrint}
                                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                            >
                                <Printer className="w-4 h-4" /> Save as PDF
                            </button>
                        </div>
                    )}
                </div>

                {profile.contact.email && (
                    <a href={`mailto:${profile.contact.email}`} className="border border-[#666666] text-[#666666] p-1.5 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center w-9 h-9" title="Email">
                        <Mail className="w-5 h-5" />
                    </a>
                )}
                {profile.contact.githubUrl && (
                    <a href={profile.contact.githubUrl} target="_blank" rel="noreferrer" className="border border-[#666666] text-[#666666] p-1.5 rounded-full hover:bg-gray-50 transition-colors flex items-center justify-center w-9 h-9" title="GitHub">
                        <Github className="w-5 h-5" />
                    </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* About Card */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-4">About</h2>
          <div className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap space-y-4">
            {profile.aboutLong.split('\n\n').map((paragraph, i) => (
              <p key={i}>{paragraph}</p>
            ))}
          </div>
          
          {/* Integrated What I'm Looking For Section */}
          <div className="mt-8 pt-6 border-t border-gray-100">
             <h3 className="text-lg font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0A66C2]" />
                What I'm Looking For
             </h3>
             <ul className="space-y-3">
                 {profile.whatLookingFor?.map((item, idx) => (
                     <li key={idx} className="text-sm text-[#1A1A1A] flex items-start gap-2">
                        <span className="text-[#0A66C2] mt-1.5 w-1 h-1 bg-[#0A66C2] rounded-full shrink-0"></span>
                        {item}
                     </li>
                 ))}
             </ul>
          </div>
        </div>

        {/* Experience Card */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Experience</h2>
          <div className="space-y-8">
            {profile.experience.map((exp) => (
              <div key={exp.id} className="flex gap-4 items-start">
                 <LogoImage logoUrl={exp.logoUrl} name={exp.company} />
                 <div className="flex-1">
                    <h3 className="font-bold text-[16px] text-[#1A1A1A]">{exp.title}</h3>
                    <div className="text-sm text-[#1A1A1A] mt-0.5">
                        <span className="font-medium">{exp.company}</span>
                        {exp.employmentType && (
                            <span className="font-normal text-gray-500"> · {exp.employmentType}</span>
                        )}
                    </div>
                    <div className="text-sm text-[#666666] mt-0.5">{exp.dates} · {exp.location}</div>
                    <ul className="list-disc list-outside ml-4 mt-3 text-sm text-[#1A1A1A] space-y-2 leading-relaxed">
                        {exp.description.map((line, i) => (
                            <li key={i}>{line}</li>
                        ))}
                    </ul>
                 </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects Card */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Projects</h2>
          <div className="space-y-4">
            {profile.projects.map((proj) => (
                <div key={proj.id} className="bg-gray-50 border border-[#E6E6E6] rounded-lg p-5 group transition-all">
                    <div className="flex justify-between items-start">
                        <h3 className="font-bold text-[16px] text-[#1A1A1A] group-hover:text-[#0A66C2] transition-colors">{proj.name}</h3>
                        {proj.link && proj.link !== '#' && (
                             <a href={proj.link} target="_blank" rel="noreferrer" className="text-[#0A66C2] hover:underline">
                                <LinkIcon className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mt-2 leading-relaxed">{proj.description}</p>
                    <div className="flex flex-wrap gap-2 mt-4">
                        {proj.stack.map(tech => (
                            <span key={tech} className="bg-white border border-gray-200 text-gray-500 px-2.5 py-1 rounded text-[11px] font-medium">{tech}</span>
                        ))}
                    </div>
                </div>
            ))}
          </div>
        </div>
        
        {/* Education Card */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#1A1A1A] mb-6">Education</h2>
          <div className="space-y-8">
            {profile.education.map((edu) => (
              <div key={edu.id} className="flex gap-4 items-start">
                 <LogoImage logoUrl={edu.logoUrl} name={edu.school} />
                 <div className="flex-1">
                    <h3 className="font-bold text-[16px] text-[#1A1A1A]">{edu.school}</h3>
                    <div className="text-sm text-[#1A1A1A] mt-0.5">{edu.degree}</div>
                    <div className="text-sm text-[#666666] mt-0.5">{edu.dates}</div>
                 </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sidebar Right */}
      <div className="md:col-span-1 space-y-4">
        
        {/* Let's Collaborate Section */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-5 shadow-sm relative overflow-hidden print:hidden">
            <h2 className="text-[17px] font-bold text-[#1A1A1A] mb-3">
                {profile.collaborateSubtitle || "for someone who"}
            </h2>

            <ul className="space-y-4 mb-4">
                {profile.collaborateBullets.map((bullet, idx) => {
                    const colors = ['bg-blue-500', 'bg-emerald-500', 'bg-amber-500'];
                    return (
                        <li key={idx} className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full ${colors[idx % colors.length]} shrink-0 mt-1.5`}></div>
                            <p className="text-[14px] text-gray-700 leading-snug">{bullet}</p>
                        </li>
                    );
                })}
            </ul>

            <div className="mt-6">
                <p className="text-[14px] text-gray-900 font-bold mb-1">
                    I would love to have a chat
                </p>
                <button 
                    onClick={() => setMsgModalOpen(true)} 
                    className="text-[#0A66C2] font-bold text-[14px] flex items-center gap-1 hover:underline"
                >
                    Message me <ArrowRight className="w-4 h-4" />
                </button>
            </div>
        </div>

        {/* Skills Card */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-5 shadow-sm">
            <h2 className="font-bold text-[17px] text-[#1A1A1A] mb-4">Skills</h2>
            <div className="space-y-4">
                {profile.skills.slice(0, 10).map((skill, i) => (
                    <div key={i} className="border-b border-gray-100 pb-3 last:border-0 last:pb-0">
                        <span className="text-[15px] font-bold text-gray-700">{skill}</span>
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 text-center">
                 <button className="text-[#666666] font-bold text-[14px] hover:text-[#1A1A1A] w-full">Show all skills</button>
            </div>
        </div>

        {/* AI Assistant Widget */}
        <div className="print:hidden">
            <AIChatWidget />
        </div>

        {/* Ad Placeholder */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-5 shadow-sm text-center print:hidden">
             <p className="text-[11px] text-gray-400 mb-4 uppercase tracking-wider font-semibold">Promoted</p>
             <div className="mt-2 h-24 bg-[#EDF3F8] rounded flex items-center justify-center text-gray-400 text-sm font-medium">
                Recruiters Love This App
             </div>
        </div>

        <div className="text-[12px] text-center text-gray-500 py-4 print:hidden">
            LinkedIn Replacer © {new Date().getFullYear()}
        </div>
      </div>

      <CustomCrispChat 
        isOpen={msgModalOpen}
        onClose={() => setMsgModalOpen(false)}
        profileName={profile.name}
      />

      {contactModalOpen && (
          <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 animate-fade-in print:hidden">
              <div className="bg-white w-full max-w-sm rounded-xl shadow-2xl overflow-hidden">
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#F3F2EF]">
                      <h3 className="font-semibold text-gray-800 text-lg">Contact {profile.name}</h3>
                      <button onClick={() => setContactModalOpen(false)} className="text-gray-500 hover:text-black">
                          <X className="w-6 h-6" />
                      </button>
                  </div>
                  <div className="p-6 space-y-4">
                      {profile.contact.email && (
                          <div className="flex items-start gap-3">
                              <Mail className="w-5 h-5 text-gray-600 mt-0.5" />
                              <div>
                                  <p className="font-semibold text-gray-900 text-sm">Email</p>
                                  <a href={`mailto:${profile.contact.email}`} className="text-[#0A66C2] text-sm hover:underline break-all">
                                      {profile.contact.email}
                                  </a>
                              </div>
                          </div>
                      )}

                      {profile.contact.githubUrl && (
                           <div className="flex items-start gap-3">
                              <Github className="w-5 h-5 text-gray-600 mt-0.5" />
                              <div>
                                  <p className="font-semibold text-gray-900 text-sm">GitHub</p>
                                  <a href={profile.contact.githubUrl} target="_blank" rel="noreferrer" className="text-[#0A66C2] text-sm hover:underline break-all">
                                      {profile.contact.githubUrl}
                                  </a>
                              </div>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      )}

    </div>
  );
};

export default Profile;