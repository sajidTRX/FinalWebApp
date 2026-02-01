'use client';

import { useState, useEffect } from "react";
import { BackButton } from "@/components/ui/back-button";

export default function ProfilePage() {
  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [writingName, setWritingName] = useState("");

  useEffect(() => {
    // Load profile data from localStorage on mount
    const savedProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    if (savedProfile) {
      setUsername(savedProfile.username || "");
      setBio(savedProfile.bio || "");
      setWritingName(savedProfile.writingName || "");
    }
  }, []);

  const handleSave = () => {
    const profile = { username, bio, writingName };
    localStorage.setItem("userProfile", JSON.stringify(profile));
    alert("Profile saved successfully!");
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-[#c9b896] via-[#d4c4a8] to-[#bfae94]">
      <div className="flex-shrink-0 border-b border-[#a89880] bg-[#efe6d5] p-4">
        <div className="flex items-center">
          <BackButton className="mr-2" />
          <h1 className="font-serif text-xl font-medium text-[#3d3225]">User Profile Settings</h1>
        </div>
      </div>
      <div className="flex-1 flex flex-col items-center p-12">
      <h2 className="text-xl font-semibold mb-8 text-[#3d3225]">Edit Profile</h2>

      {/* Username */}
      <div className="w-full max-w-2xl mb-6">
        <label htmlFor="username" className="block text-base font-medium text-[#3d3225] mb-2">
          Username / Pen Name
        </label>
        <input
          id="username"
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your username"
          className="w-full rounded-lg border-[#a89880] bg-[#f5f0e8] shadow-md focus:border-[#6b5d4d] focus:ring-[#6b5d4d] text-sm p-3 text-[#3d3225] placeholder:text-[#8b7d6b]"
        />
      </div>

      {/* Bio */}
      <div className="w-full max-w-2xl mb-6">
        <label htmlFor="bio" className="block text-base font-medium text-[#3d3225] mb-2">
          Bio / About Me
        </label>
        <textarea
          id="bio"
          rows={4}
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          placeholder="Write a short bio about yourself"
          className="w-full rounded-lg border-[#a89880] bg-[#f5f0e8] shadow-md focus:border-[#6b5d4d] focus:ring-[#6b5d4d] text-sm p-3 text-[#3d3225] placeholder:text-[#8b7d6b]"
        ></textarea>
      </div>

      {/* Preferred Writing Name */}
      <div className="w-full max-w-2xl mb-6">
        <label htmlFor="writing-name" className="block text-base font-medium text-[#3d3225] mb-2">
          Preferred Writing Name
        </label>
        <input
          id="writing-name"
          type="text"
          value={writingName}
          onChange={(e) => setWritingName(e.target.value)}
          placeholder="Enter your author name for exports"
          className="w-full rounded-lg border-[#a89880] bg-[#f5f0e8] shadow-md focus:border-[#6b5d4d] focus:ring-[#6b5d4d] text-sm p-3 text-[#3d3225] placeholder:text-[#8b7d6b]"
        />
      </div>

      <button
        onClick={handleSave}
        className="mt-8 px-6 py-3 bg-[#4a3f32] text-[#efe6d5] rounded-lg shadow-md hover:bg-[#3d3225] focus:outline-none focus:ring-2 focus:ring-[#6b5d4d] focus:ring-offset-2 text-sm"
      >
        Save Changes
      </button>
      </div>
    </div>
  );
}