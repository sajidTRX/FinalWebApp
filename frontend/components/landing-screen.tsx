"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import {
  HistoryIcon,
  Settings,
  Bell,
  User,
  HelpCircle,
} from "lucide-react";
import { getAllNoteDocuments, createNoteDocument } from "@/lib/documents/note-service";
import { getAllNovelDocuments, createNovelDocument } from "@/lib/documents/novel-service";
import { NoteDocument, NovelDocument } from "@/lib/documents/types";
import { getLastUsedMode } from "@/lib/last-used-mode";

interface RecentDocument {
  id: string;
  title: string;
  type: "note" | "novel" | "journal";
  updatedAt: string;
  preview?: string;
  folder?: string; // Folder or category (e.g., "Physics", "Novels", "Journal - Monday")
  notebook?: string; // For backend notes (e.g., "Physics", "Chemistry")
  isBackendNote?: boolean; // To distinguish backend notes from localStorage notes
}

interface JournalEntry {
  id: string;
  title: string;
  content: string;
  date: string;
}

// Animated Star Component using React state - Blinking effect
const AnimatedStar = ({ 
  className, 
  style, 
  group = "a" 
}: { 
  className?: string; 
  style?: React.CSSProperties; 
  group?: "a" | "b" 
}) => {
  const [opacity, setOpacity] = useState(group === "a" ? 0.4 : 0.9);
  const [scale, setScale] = useState(1);
  
  useEffect(() => {
    const duration = 1800; // 1.8 seconds for animation cycle
    const steps = 60;
    const interval = duration / steps;
    let step = group === "a" ? 0 : steps / 2; // Group B starts opposite for alternating effect
    
    const timer = setInterval(() => {
      step = (step + 1) % steps;
      const progress = Math.sin((step / steps) * Math.PI * 2);
      setOpacity(0.3 + (progress + 1) * 0.35); // 0.3 to 1.0 for visible blink
      setScale(1 + (progress + 1) * 0.1); // 1.0 to 1.2 for noticeable pulse
    }, interval);
    
    return () => clearInterval(timer);
  }, [group]);
  
  return (
    <span 
      className={className} 
      style={{ 
        ...style, 
        opacity, 
        transform: `scale(${scale})`,
        transition: 'opacity 50ms linear, transform 50ms linear',
        display: 'inline-block',
        textShadow: '0 0 8px rgba(255,255,255,0.5), 0 0 4px rgba(0,0,0,0.3)'
      }}
    >
      ✦
    </span>
  );
};

export default function LandingScreen() {
  const [recentDocuments, setRecentDocuments] = useState<RecentDocument[]>([]);
  const router = useRouter();

  useEffect(() => {
    const fetchDocuments = async () => {
      let backendNotes: RecentDocument[] = [];

      // Fetch notes from backend API (only from notebook folders like Physics/, Chemistry/, etc.)
      try {
        const filesRes = await fetch("http://localhost:8000/api/files");
        if (filesRes.ok) {
          const filesData = await filesRes.json();
          const noteFiles = filesData.files || [];
          
          // Only include files that are in a notebook folder (contain '/')
          const notebookFiles = noteFiles.filter((filename: string) => filename.includes('/'));
          
          // Fetch content for each note file
          const noteDocs = await Promise.all(
            notebookFiles.map(async (filename: string) => {
              try {
                const noteRes = await fetch(`http://localhost:8000/api/file/${encodeURIComponent(filename)}`);
                if (noteRes.ok) {
                  const noteData = await noteRes.json();
                  // Extract notebook and note name from filename (e.g., "Physics/hello there.txt")
                  const parts = filename.split('/');
                  const notebook = parts[0] || 'Notes';
                  const noteName = parts[1]?.replace('.txt', '') || filename;
                  
                  return {
                    id: filename, // Use filename as id for routing
                    title: noteName,
                    type: "note" as const,
                    updatedAt: new Date().toISOString(), // Backend doesn't track dates, use current
                    preview: noteData.content?.substring(0, 80) || "",
                    folder: notebook,
                    notebook: notebook,
                    isBackendNote: true, // Mark as backend note for proper routing
                  };
                }
              } catch (e) {
                console.log("Error fetching note:", filename, e);
              }
              return null;
            })
          );
          
          backendNotes = noteDocs.filter(Boolean) as RecentDocument[];
          console.log("Fetched notes from backend notebooks:", backendNotes);
        }
      } catch (error) {
        console.log("Notes fetch error (backend may not be running):", error);
      }

      // localStorage documents (note-service) - user-created notes
      const localNotes = getAllNoteDocuments()
        .filter((doc: NoteDocument) => !doc.isArchived)
        .map((doc: NoteDocument) => ({
          id: doc.id,
          title: doc.title,
          type: "note" as const,
          updatedAt: doc.updatedAt,
          preview: doc.content?.substring(0, 80) || "",
          folder: "Local Notes",
          isBackendNote: false,
        }));
      console.log("Fetched local notes:", localNotes);

      const novels = getAllNovelDocuments()
        .filter((doc: NovelDocument) => !doc.isArchived)
        .map((doc: NovelDocument) => ({
          id: doc.id,
          title: doc.title,
          type: "novel" as const,
          updatedAt: doc.updatedAt,
          preview: doc.chapters?.[0]?.content?.substring(0, 80) || "",
          folder: "Novels",
        }));
      console.log("Fetched novels:", novels);

      // Try to fetch journal entries from all days
      let journalDocs: RecentDocument[] = [];
      const days = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
      
      try {
        for (const day of days) {
          const response = await fetch(`http://localhost:8000/api/journal/${day}`);
          if (response.ok) {
            const data = await response.json();
            if (data.entries && data.entries.length > 0) {
              const dayEntries = data.entries.map((entry: JournalEntry) => ({
                id: entry.id,
                title: entry.title || `${day} Entry`,
                type: "journal" as const,
                updatedAt: entry.date || new Date().toISOString(),
                preview: entry.content?.substring(0, 80) || "",
                folder: `Journal - ${day}`,
              }));
              journalDocs = [...journalDocs, ...dayEntries];
            }
          }
        }
      } catch (error) {
        console.log("Journal fetch error (backend may not be running):", error);
      }

      // Combine all user-created documents and sort by most recent, limit to 6
      // Sources: backend notebook notes, localStorage notes, localStorage novels, journal entries
      const combined = [...backendNotes, ...localNotes, ...novels, ...journalDocs]
        .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())
        .slice(0, 6);

      console.log("Combined documents:", combined);
      setRecentDocuments(combined);
    };

    fetchDocuments();

    // Refetch when user returns to the landing page so recent docs stay up to date
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") fetchDocuments();
    };
    
    // Also refetch on window focus (catches back navigation)
    const onFocus = () => fetchDocuments();
    
    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("focus", onFocus);
    
    return () => {
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }) + ", " + date.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const handleDocumentClick = (doc: RecentDocument) => {
    console.log("Opening document:", doc.id, doc.type, doc.isBackendNote);
    if (doc.type === "note") {
      if (doc.isBackendNote) {
        // Backend notes: navigate to /note with notebook and file info
        // The id is the filename like "Physics/hello there.txt"
        const notebook = doc.notebook || doc.id.split('/')[0];
        router.push(`/note?notebook=${encodeURIComponent(notebook)}&file=${encodeURIComponent(doc.id)}`);
      } else {
        // localStorage notes: use the documents route
        router.push(`/note/documents/${doc.id}`);
      }
    } else if (doc.type === "novel") {
      // localStorage novels: use the documents route
      router.push(`/novel/documents/${doc.id}`);
    } else if (doc.type === "journal") {
      router.push(`/journal`);
    }
  };

  const handleStartWriting = () => {
    const mode = getLastUsedMode();
    if (mode === "note") {
      const newDoc = createNoteDocument();
      router.push(`/note/documents/${newDoc.id}`);
    } else if (mode === "novel") {
      const newDoc = createNovelDocument();
      router.push(`/novel/documents/${newDoc.id}`);
    } else {
      router.push("/journal");
    }
  };

  const handleChooseMode = () => {
    router.push("/home");
  };

  return (
    <div 
      className="h-screen w-screen fixed inset-0"
      style={{
        width: '100vw',
        minHeight: '100vh',
        backgroundImage: 'url(/tagore-theme.jpg)',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
        backgroundSize: '100% 100%',
        overflowX: 'hidden',
      }}
    >
      
      {/* Animated Blinking Stars Overlay */}
      {/* Top area stars */}
      <AnimatedStar 
        className="absolute text-[#e8ddd0] z-20" 
        style={{ top: '8%', left: '8%', fontSize: '24px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#e8ddd0] z-20" 
        style={{ top: '8%', right: '8%', fontSize: '24px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#d4c4a8] z-20" 
        style={{ top: '15%', left: '18%', fontSize: '18px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#d4c4a8] z-20" 
        style={{ top: '15%', right: '18%', fontSize: '18px' }} 
        group="b" 
      />
      
      {/* Middle area stars - near the title */}
      <AnimatedStar 
        className="absolute text-[#c9b896] z-20" 
        style={{ top: '22%', left: '25%', fontSize: '20px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#c9b896] z-20" 
        style={{ top: '22%', right: '25%', fontSize: '20px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#e8ddd0] z-20" 
        style={{ top: '30%', left: '12%', fontSize: '16px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#e8ddd0] z-20" 
        style={{ top: '30%', right: '12%', fontSize: '16px' }} 
        group="b" 
      />
      
      {/* Side stars */}
      <AnimatedStar 
        className="absolute text-[#8b7d6b] z-20" 
        style={{ top: '45%', left: '5%', fontSize: '14px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#8b7d6b] z-20" 
        style={{ top: '45%', right: '5%', fontSize: '14px' }} 
        group="a" 
      />
      
      {/* Bottom area stars */}
      <AnimatedStar 
        className="absolute text-[#6b5d4d] z-20" 
        style={{ bottom: '15%', left: '10%', fontSize: '18px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#6b5d4d] z-20" 
        style={{ bottom: '15%', right: '10%', fontSize: '18px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#4a3f32] z-20" 
        style={{ bottom: '8%', left: '20%', fontSize: '22px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#4a3f32] z-20" 
        style={{ bottom: '8%', right: '20%', fontSize: '22px' }} 
        group="a" 
      />
      
      {/* Corner stars */}
      <AnimatedStar 
        className="absolute text-[#5a4a3a] z-20" 
        style={{ top: '4%', left: '4%', fontSize: '28px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#5a4a3a] z-20" 
        style={{ top: '4%', right: '4%', fontSize: '28px' }} 
        group="b" 
      />
      <AnimatedStar 
        className="absolute text-[#5a4a3a] z-20" 
        style={{ bottom: '4%', left: '4%', fontSize: '28px' }} 
        group="a" 
      />
      <AnimatedStar 
        className="absolute text-[#5a4a3a] z-20" 
        style={{ bottom: '4%', right: '4%', fontSize: '28px' }} 
        group="a" 
      />

      {/* Start Writing and Choose Mode buttons - centered round pills */}
      <div
        className="absolute z-30 flex flex-col items-center gap-2.5"
        style={{
          top: '33%',
          left: '50%',
          transform: 'translateX(-50%)',
        }}
      >
        <button
          onClick={handleStartWriting}
          className="
            w-[200px] py-3
            min-h-[48px]
            rounded-full
            bg-[#e8e2d8] hover:bg-[#f0ebe3]
            border-2 border-[#4a4540]
            text-[#2d2820]
            font-medium
            tracking-wide
            transition-all duration-150
            hover:scale-105
            active:scale-95 active:translate-y-[1px]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a4540] focus-visible:ring-offset-2
            shadow-md hover:shadow-lg
            cursor-pointer
          "
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '16px',
            letterSpacing: '0.05em',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          }}
          aria-label="Start Writing"
        >
          Start Writing
        </button>


        <button
  onClick={handleChooseMode}
  className="
    mt-8
    text-[#f5c86b] hover:text-[#ffdf8c]
    font-bold
    tracking-wide
    transition-all duration-150
    hover:underline
    focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a4540] focus-visible:ring-offset-2 rounded
    cursor-pointer
  "
  style={{
    fontFamily: "'Playfair Display', Georgia, serif",
    fontSize: '16px',
    letterSpacing: '0.06em',
    textShadow: '0 1px 3px rgba(0,0,0,0.6)',
  }}
  aria-label="Choose Mode"
>
  Choose Mode
</button>

        {/* <button
          onClick={handleChooseMode}
          className="
            w-[200px] py-3
            min-h-[48px]
            rounded-full
            bg-[#e8e2d8] hover:bg-[#f0ebe3]
            border-2 border-[#4a4540]
            text-[#2d2820]
            font-medium
            tracking-wide
            transition-all duration-150
            hover:scale-105
            active:scale-95 active:translate-y-[1px]
            focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a4540] focus-visible:ring-offset-2
            shadow-md hover:shadow-lg
            cursor-pointer
          "
          style={{
            fontFamily: "'Playfair Display', Georgia, serif",
            fontSize: '16px',
            letterSpacing: '0.05em',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
          }}
          aria-label="Choose Mode"
        > */}
          {/* Choose Mode */}
        {/* </button> */}
      </div>

      {/* Recent Files Cards - shows only real user files, up to 6 */}
      <div 
        className="absolute z-40 flex items-center justify-center gap-5 px-8 flex-wrap"
        style={{ 
          top: '56%',
          left: '50%', 
          transform: 'translateX(-50%)',
          width: '90%',
          maxWidth: '1100px',
        }}
      >
        {recentDocuments.length > 0 ? (
          // Show only as many cards as there are real files (max 6)
          recentDocuments.map((doc) => (
            <button
              key={doc.id}
              onClick={() => handleDocumentClick(doc)}
              className="flex-shrink-0 cursor-pointer group transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#4a4540] focus-visible:ring-offset-2 rounded-lg"
              style={{ width: '140px' }}
              aria-label={`Open ${doc.type}: ${doc.title}`}
            >
              {/* White file card */}
              <div 
                className="rounded-lg overflow-hidden border border-[#c8c4bc] shadow-md group-hover:shadow-lg transition-shadow relative"
                style={{
                  width: '140px',
                  height: '180px',
                  background: 'linear-gradient(135deg, #ffffff 0%, #f8f6f2 50%, #f0ece4 100%)',
                  boxShadow: '0 3px 10px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
                }}
              >
                {/* Type badge - top right corner */}
                <div 
                  className="absolute top-2 right-2 px-1.5 py-0.5 rounded text-[8px] font-medium uppercase"
                  style={{
                    background: doc.type === 'novel' ? '#8b5cf6' : doc.type === 'journal' ? '#f59e0b' : '#3b82f6',
                    color: '#fff',
                    letterSpacing: '0.05em',
                  }}
                >
                  {doc.type}
                </div>
                
                {/* Content preview */}
                <div className="p-3 pt-7 h-full overflow-hidden relative">
                  <p 
                    className="leading-tight opacity-60"
                    style={{ 
                      fontSize: '8px', 
                      fontFamily: 'Georgia, serif',
                      color: '#4a4540',
                      lineHeight: 1.6,
                      display: '-webkit-box',
                      WebkitLineClamp: 6,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {doc.preview || "Empty document..."}
                  </p>
                </div>

                {/* Folder/path indicator - bottom of card */}
                {doc.folder && (
                  <div 
                    className="absolute bottom-2 left-2 right-2 truncate"
                    style={{
                      fontSize: '7px',
                      fontFamily: 'Georgia, serif',
                      color: '#8b8070',
                      opacity: 0.8,
                    }}
                    title={doc.folder}
                  >
                    📁 {doc.folder}
                  </div>
                )}
              </div>
              
              {/* Document title and date below card */}
              <div className="mt-2 text-center">
                <h3 
                  className="truncate font-medium"
                  style={{ 
                    fontFamily: "'Playfair Display', Georgia, serif", 
                    fontSize: '12px',
                    color: '#e8ddd0',
                    textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                  }}
                  title={doc.title}
                >
                  {doc.title}
                </h3>
                <p 
                  className="truncate mt-0.5"
                  style={{ 
                    fontFamily: 'Georgia, serif', 
                    fontSize: '10px',
                    color: '#a89880',
                  }}
                >
                  {formatDate(doc.updatedAt)}
                </p>
              </div>
            </button>
          ))
        ) : (
          // Welcome message for new users when no files exist yet
          <div 
            className="text-center py-10 px-8 rounded-xl"
            style={{
              background: 'rgba(232, 226, 216, 0.12)',
              border: '2px dashed rgba(232, 226, 216, 0.25)',
              maxWidth: '400px',
            }}
          >
            <div 
              style={{
                fontSize: '32px',
                marginBottom: '12px',
              }}
            >
              ✨
            </div>
            <p 
              style={{
                fontFamily: "'Playfair Display', Georgia, serif",
                fontSize: '16px',
                color: '#e8ddd0',
                textShadow: '0 1px 2px rgba(0,0,0,0.5)',
                marginBottom: '8px',
              }}
            >
              Welcome to Tagore
            </p>
            <p 
              style={{
                fontFamily: 'Georgia, serif',
                fontSize: '13px',
                color: '#a89880',
                lineHeight: 1.5,
              }}
            >
              Your recent files will appear here.<br />
              Click "Start Writing" to create your first document.
            </p>
          </div>
        )}
      </div>

      {/* Bottom Center Settings Bar - Oval Style */}
      <div 
        className="absolute bottom-8 left-1/2 flex flex-row items-center justify-center space-x-3 rounded-full bg-[#e8e2d8] border-2 border-[#4a4540] px-6 py-3 shadow-md hover:shadow-lg transition-all duration-150"
        style={{ 
          zIndex: 9999,
          transform: 'translateX(-50%)',
          fontFamily: "'Playfair Display', Georgia, serif",
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.4)',
        }}
      >
        <button
          onClick={() => router.push("/history")}
          className="flex items-center justify-center hover:bg-[#f0ebe3] rounded-full p-2 transition-all duration-150 hover:scale-110 active:scale-95"
          title="History"
        >
          <HistoryIcon className="h-5 w-5 text-[#4a3f32]" />
        </button>
        <button
          onClick={() => router.push("/device-settings")}
          className="flex items-center justify-center hover:bg-[#f0ebe3] rounded-full p-2 transition-all duration-150 hover:scale-110 active:scale-95"
          title="Settings"
        >
          <Settings className="h-5 w-5 text-[#4a3f32]" />
        </button>
        <button
          onClick={() => router.push("/notifications")}
          className="flex items-center justify-center hover:bg-[#f0ebe3] rounded-full p-2 transition-all duration-150 hover:scale-110 active:scale-95"
          title="Notifications"
        >
          <Bell className="h-5 w-5 text-[#4a3f32]" />
        </button>
        <button
          onClick={() => router.push("/profile")}
          className="flex items-center justify-center hover:bg-[#f0ebe3] rounded-full p-2 transition-all duration-150 hover:scale-110 active:scale-95"
          title="Profile"
        >
          <User className="h-5 w-5 text-[#4a3f32]" />
        </button>
        <button
          onClick={() => router.push("/help")}
          className="flex items-center justify-center hover:bg-[#f0ebe3] rounded-full p-2 transition-all duration-150 hover:scale-110 active:scale-95"
          title="Help"
        >
          <HelpCircle className="h-5 w-5 text-[#4a3f32]" />
        </button>
      </div>
    </div>
  );
}
