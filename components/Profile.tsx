import React, { useState, useRef, useEffect } from 'react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { MapPin, Link as LinkIcon, Send, Plus, Camera, Pencil, Briefcase, ChevronDown, Printer, Github, Mail, Zap, Bot, Rocket, ArrowRight, X } from 'lucide-react';
import AIChatWidget from './AIChatWidget';

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
  const { profile, updateProfile, sendMessage, visitorToken, conversations, currentUser } = useStore();
  const [msgModalOpen, setMsgModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  
  // Message form state
  const [msgBody, setMsgBody] = useState('');
  const [msgName, setMsgName] = useState('');
  const [msgEmail, setMsgEmail] = useState('');
  
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

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
    await sendMessage(
        activeConversation?.id || null, 
        msgBody, 
        'visitor',
        { name: msgName, email: msgEmail }
    );
    setSending(false);
    setSentSuccess(true);
    setTimeout(() => {
        setSentSuccess(false);
        setMsgModalOpen(false);
        setMsgBody('');
    }, 3000);
  };

  const handlePrint = () => {
    setMoreMenuOpen(false);
    // Timeout ensures the menu closes visually before the browser opens the print dialog
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
        <div className="bg-white rounded-lg border border-[#E6E6E6] relative pb-4 shadow-sm group">
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
          </div>
          
          <div className="px-6 relative">
            {/* Avatar */}
            <div className="absolute -top-16 md:-top-24 left-6">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white overflow-hidden bg-white shadow-sm relative group/avatar">
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

            {/* Actions Top Right */}
            <div className="absolute top-4 right-4 flex gap-2 print:hidden">
                {currentUser === 'owner' && (
                  <Link to="/admin" className="p-2 text-gray-500 hover:text-black hover:bg-gray-100 rounded-full transition-colors" title="Edit Profile">
                    <Pencil className="w-5 h-5" />
                  </Link>
                )}
            </div>

            {/* Basic Info */}
            <div className="pt-20 md:pt-20">
              <h1 className="text-2xl font-bold text-[#1A1A1A]">{profile.name}</h1>
              <p className="text-base text-[#1A1A1A] mt-1">{profile.headline}</p>
              
              <div className="flex items-center text-sm text-[#666666] mt-2 gap-2">
                <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {profile.location}</span>
                <button 
                  onClick={() => setContactModalOpen(true)}
                  className="text-[#0A66C2] font-semibold cursor-pointer hover:underline outline-none print:hidden"
                >
                  Contact Info
                </button>
                <span className="hidden print:inline-block ml-2 text-gray-500">{profile.contact.email}</span>
              </div>

              <div className="mt-4 flex flex-wrap gap-2 relative z-20 print:hidden">
                <button 
                  onClick={() => setMsgModalOpen(true)}
                  className="bg-[#0A66C2] text-white px-6 py-1.5 rounded-full font-semibold hover:bg-[#004182] transition-colors flex items-center gap-2"
                >
                  <Send className="w-4 h-4" /> Message
                </button>
                
                {/* More Button */}
                <div className="relative" ref={moreMenuRef}>
                    <button 
                        onClick={() => setMoreMenuOpen(!moreMenuOpen)}
                        className={`border border-[#666666] text-[#666666] px-6 py-1.5 rounded-full font-semibold hover:bg-gray-50 transition-colors ${moreMenuOpen ? 'bg-gray-100' : ''}`}
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

                {/* Email & GitHub Icons */}
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

                {activeConversation && (
                  <span className="text-xs text-green-600 self-center font-medium bg-green-50 px-2 py-1 rounded">Conversation Active</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Combined About & What I'm Looking For Card */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm relative group">
          <div className="flex justify-between items-start mb-3">
             <h2 className="text-xl font-bold text-[#1A1A1A]">About</h2>
             {currentUser === 'owner' && (
               <Link to="/admin" className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded print:hidden">
                 <Pencil className="w-4 h-4 text-gray-500" />
               </Link>
             )}
          </div>
          <p className="text-sm text-[#1A1A1A] leading-relaxed whitespace-pre-wrap">{profile.aboutLong}</p>
          
          {/* Integrated What I'm Looking For Section */}
          <div className="mt-6 pt-6 border-t border-gray-100">
             <h3 className="text-lg font-bold text-[#1A1A1A] mb-3 flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-[#0A66C2]" />
                What I'm Looking For
             </h3>
             <ul className="space-y-2">
                 {profile.whatLookingFor?.map((item, idx) => (
                     <li key={idx} className="text-sm text-[#1A1A1A] flex items-start gap-2">
                        <span className="text-[#0A66C2] mt-1">•</span>
                        {item}
                     </li>
                 ))}
             </ul>
          </div>
        </div>

        {/* Experience Card */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm relative group">
          <div className="flex justify-between items-start mb-4">
             <h2 className="text-xl font-bold text-[#1A1A1A]">Experience</h2>
             {currentUser === 'owner' && (
               <Link to="/admin" className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded print:hidden">
                 <Pencil className="w-4 h-4 text-gray-500" />
               </Link>
             )}
          </div>
          <div className="space-y-6">
            {profile.experience.map((exp) => (
              <div key={exp.id} className="flex gap-4 items-start">
                 {/* Logo Logic */}
                 <LogoImage logoUrl={exp.logoUrl} name={exp.company} />

                 <div className="flex-1 flex flex-col pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <h3 className="font-bold text-lg text-[#1A1A1A] leading-tight">{exp.title}</h3>
                    <div className="text-base font-medium text-[#1A1A1A] mt-1">
                        {exp.company}
                        {exp.employmentType && (
                            <span className="font-normal text-gray-500"> · {exp.employmentType}</span>
                        )}
                    </div>
                    <div className="text-sm text-[#666666] mt-1 mb-2">{exp.dates} • {exp.location}</div>
                    <ul className="list-disc list-outside ml-4 text-sm text-[#1A1A1A] space-y-1.5 leading-relaxed">
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
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm relative group">
          <div className="flex justify-between items-start mb-4">
             <h2 className="text-xl font-bold text-[#1A1A1A]">Projects</h2>
             {currentUser === 'owner' && (
               <Link to="/admin" className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded print:hidden">
                 <Pencil className="w-4 h-4 text-gray-500" />
               </Link>
             )}
          </div>
          <div className="space-y-4">
            {profile.projects.map((proj) => (
                <div key={proj.id} className="border border-[#E6E6E6] rounded p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start">
                        <h3 className="font-semibold text-base text-[#1A1A1A]">{proj.name}</h3>
                        {proj.link && proj.link !== '#' && (
                             <a href={proj.link} target="_blank" rel="noreferrer" className="text-[#0A66C2] hover:underline">
                                <LinkIcon className="w-4 h-4" />
                            </a>
                        )}
                    </div>
                    <p className="text-sm text-[#1A1A1A] mt-2">{proj.description}</p>
                    <div className="flex flex-wrap gap-2 mt-3">
                        {proj.stack.map(tech => (
                            <span key={tech} className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-medium">{tech}</span>
                        ))}
                    </div>
                </div>
            ))}
          </div>
        </div>
        
        {/* Education Card */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-6 shadow-sm relative group">
          <div className="flex justify-between items-start mb-4">
             <h2 className="text-xl font-bold text-[#1A1A1A]">Education</h2>
             {currentUser === 'owner' && (
               <Link to="/admin" className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded print:hidden">
                 <Pencil className="w-4 h-4 text-gray-500" />
               </Link>
             )}
          </div>
          <div className="space-y-6">
            {profile.education.map((edu) => (
              <div key={edu.id} className="flex gap-4 items-start">
                 <LogoImage logoUrl={edu.logoUrl} name={edu.school} />
                 <div className="flex-1 flex flex-col pb-6 border-b border-gray-100 last:border-0 last:pb-0">
                    <h3 className="font-semibold text-base text-[#1A1A1A]">{edu.school}</h3>
                    <div className="text-sm text-[#1A1A1A]">{edu.degree}</div>
                    <div className="text-xs text-[#666666] mt-1">{edu.dates}</div>
                 </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sidebar Right */}
      <div className="md:col-span-1 space-y-4">
        
        {/* Relocated Let's Collaborate Section - STYLE MATCHED TO SCREENSHOT - HIDDEN IN PRINT */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-5 shadow-sm relative overflow-hidden print:hidden">
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-blue-100/50 rounded-full blur-2xl pointer-events-none"></div>
            
            <h2 className="text-lg font-bold text-[#1A1A1A] mb-3 relative z-10 flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-500" /> Let's Collaborate
            </h2>
            <p className="text-sm text-gray-900 mb-3 font-semibold relative z-10 leading-relaxed">
                Are you a founder hiring manager or recruiter looking for someone who
            </p>
            
            <ul className="space-y-2 relative z-10 mb-4">
                <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 mt-1.5"></div>
                    <p className="text-sm text-gray-700">Is obsessed with improving how things work and learns fast from setbacks</p>
                </li>
                <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-purple-500 shrink-0 mt-1.5"></div>
                    <p className="text-sm text-gray-700">Uses AI and no code tools to make operations faster and more efficient</p>
                </li>
                 <li className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0 mt-1.5"></div>
                    <p className="text-sm text-gray-700">Brings whatever it takes to help you hit mission critical goals</p>
                </li>
            </ul>

            <p className="text-sm text-gray-900 font-medium mb-2 relative z-10">
                I would love to have a chat
            </p>

            <div className="text-right mt-2">
                 <button 
                    onClick={() => setMsgModalOpen(true)} 
                    className="text-[#0A66C2] font-bold text-sm flex items-center justify-end gap-1 hover:underline hover:text-[#004182]"
                >
                    Message me <ArrowRight className="w-4 h-4" />
                 </button>
            </div>
        </div>

        {/* Skills Card */}
        <div className="bg-white rounded-lg border border-[#E6E6E6] p-4 shadow-sm relative group">
             <div className="flex justify-between items-center mb-2">
                <h2 className="font-semibold text-base text-[#1A1A1A]">Skills</h2>
                {currentUser === 'owner' && (
                   <Link to="/admin" className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded print:hidden">
                     <Pencil className="w-4 h-4 text-gray-500" />
                   </Link>
                )}
            </div>
            <div className="flex flex-wrap gap-2">
                {profile.skills.map((skill, i) => (
                    <div key={i} className="w-full border-b border-gray-100 py-2 last:border-0 flex justify-between items-center group">
                        <span className="text-sm font-semibold text-[#1A1A1A]">{skill}</span>
                        <Plus className="w-4 h-4 text-gray-400 opacity-0 group-hover:opacity-100 cursor-pointer print:hidden" />
                    </div>
                ))}
            </div>
            <div className="mt-4 pt-2 border-t text-center print:hidden">
                 <button className="text-[#666666] font-semibold text-sm hover:text-[#1A1A1A] hover:bg-gray-50 w-full py-1 rounded">Show all skills</button>
            </div>
        </div>

        {/* AI Assistant Widget - HIDDEN IN PRINT */}
        <div className="print:hidden">
            <AIChatWidget />
        </div>

        {/* Ad Placeholder - HIDDEN IN PRINT */}
        <div className="bg-[#F4F4F4] rounded-lg p-4 text-center print:hidden">
             <p className="text-xs text-gray-500">Promoted</p>
             <div className="mt-2 h-20 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs">
                Recruiters Love This App
             </div>
        </div>

        <div className="text-xs text-center text-gray-500 print:hidden">
            LinkedIn Replacer © {new Date().getFullYear()}
        </div>
      </div>

      {/* Message Modal */}
      {msgModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-end md:items-center justify-center p-4 animate-fade-in print:hidden">
            <div className="bg-white w-full max-w-lg rounded-t-xl md:rounded-xl shadow-2xl flex flex-col max-h-[90vh]">
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-[#F3F2EF] rounded-t-xl">
                    <h3 className="font-semibold text-gray-800">New Message to {profile.name}</h3>
                    <button onClick={() => setMsgModalOpen(false)} className="text-gray-500 hover:text-gray-800 text-xl">&times;</button>
                </div>
                <div className="p-4 overflow-y-auto">
                    {sentSuccess ? (
                        <div className="text-center py-8 text-green-600">
                            <div className="text-4xl mb-2">✓</div>
                            <p className="font-medium text-lg">Message sent!</p>
                            <p className="text-sm text-gray-500 mt-2">
                                Your message has been delivered to {profile.name}'s inbox.
                                <br/>
                                (Log in as owner to view it)
                            </p>
                        </div>
                    ) : (
                        <>
                             <div className="mb-4 bg-blue-50 p-3 rounded text-xs text-blue-800">
                                This message will be sent to <b>{profile.name}</b>'s inbox. Replies will appear here when you return using this browser.
                            </div>
                            
                            {/* Visitor Details Inputs */}
                            {!activeConversation && (
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <input 
                                        className="border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#0A66C2] outline-none"
                                        placeholder="Your Name (Optional)"
                                        value={msgName}
                                        onChange={(e) => setMsgName(e.target.value)}
                                    />
                                    <input 
                                        className="border border-gray-300 rounded-md p-2 text-sm focus:ring-1 focus:ring-[#0A66C2] outline-none"
                                        placeholder="Your Email (Optional)"
                                        value={msgEmail}
                                        onChange={(e) => setMsgEmail(e.target.value)}
                                    />
                                </div>
                            )}

                            <textarea 
                                className="w-full border border-gray-300 rounded-md p-3 h-40 focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent outline-none resize-none"
                                placeholder="Hi Alex, I came across your profile and..."
                                value={msgBody}
                                onChange={(e) => setMsgBody(e.target.value)}
                            />
                        </>
                    )}
                </div>
                {!sentSuccess && (
                     <div className="p-4 border-t border-gray-200 flex justify-end">
                        <button 
                            onClick={handleSendMessage}
                            disabled={sending || !msgBody.trim()}
                            className="bg-[#0A66C2] text-white px-6 py-1.5 rounded-full font-semibold hover:bg-[#004182] disabled:opacity-50 transition-colors"
                        >
                            {sending ? 'Sending...' : 'Send'}
                        </button>
                    </div>
                )}
            </div>
        </div>
      )}

      {/* Contact Info Modal */}
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
                      
                      <div className="flex items-start gap-3">
                          <LinkIcon className="w-5 h-5 text-gray-600 mt-0.5" />
                          <div>
                              <p className="font-semibold text-gray-900 text-sm">Profile Link</p>
                              <a href={window.location.href} className="text-[#0A66C2] text-sm hover:underline break-all">
                                  {window.location.href}
                              </a>
                          </div>
                      </div>

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