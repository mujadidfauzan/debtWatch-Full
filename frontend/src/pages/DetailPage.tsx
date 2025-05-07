import React, { useState, useRef, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Camera, ArrowLeft, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile, UserProfileData } from "../lib/api";

const USER_ID = "user123"; // Cuma placeholder ini, nanti ganti pake data dari auth

//DetailFormData pake dari UserProfileData.
interface DetailFormData extends Partial<UserProfileData> {}

const DetailPage: React.FC = () => {
  // Modes: summary, detail, edit
  const [mode, setMode] = useState<"summary" | "detail" | "edit">("summary");

  // User data state
  const [userData, setUserData] = useState({
    username: "John Smith",
    phone: "+44 555 5555 55",
    email: "example@example.com",
    age: 30,
    gender: "Laki-Laki",
    job: "desain",
    dependents: 8,
    assets: "rumah, tanah",
    activeDebt: "8",
    pushNotifications: true,
    darkTheme: false,
  });

  
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);


  const [formData, setFormData] = useState<DetailFormData>({});

  const queryClient = useQueryClient();

  const { data: userDataFromQuery, isLoading: isLoadingProfile, isError: isErrorProfile, error: errorProfile, refetch } = useQuery<UserProfileData, Error>({
    queryKey: ['userProfile', USER_ID],
    queryFn: () => getUserProfile(USER_ID),
    enabled: !!USER_ID,
  });

  const mutation = useMutation<
    { message: string }, 
    Error, 
    DetailFormData
  >({
    mutationFn: (updatedData: DetailFormData) => updateUserProfile(USER_ID, updatedData as UserProfileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userProfile', USER_ID] });
      setMode("detail");
    },
    onError: (error: Error) => {
      console.error("Error updating profile:", error);
      
    }
  });

  useEffect(() => {
    if (userDataFromQuery) {
      setFormData(userDataFromQuery); 
    }
  }, [userDataFromQuery]);

  const handleInputChange = (field: keyof DetailFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleToggleChange = (field: keyof DetailFormData, value: boolean) => {
    setFormData(prev => ({ ...prev, [field]: value as any }));
  };

  const handleEditClick = () => {
    if (userDataFromQuery) {
      setFormData(userDataFromQuery); 
    }
    setMode("edit");
  };

  const handleUpdateClick = () => {
    mutation.mutate(formData);
  };

  const handleViewDetailClick = () => {
    setMode("detail");
  };

  // Handler untuk upload gambar profil
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  if (isLoadingProfile) {
    return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;
  }

  if (isErrorProfile) {
    return <div className="flex justify-center items-center min-h-screen">Error loading profile: {errorProfile.message}</div>;
  }

  // Account Settings View (Summary Mode - Yellow Background)
  if (mode === "summary") {
    return (
      <div className="flex flex-col h-screen bg-[#FFD600]">
        {/* Header */}
        <header className="p-4 flex items-center">
          <button className="text-white" onClick={() => window.history.back()}>
            <ArrowLeft className="h-6 w-6" />
          </button>
          <h1 className="text-white text-xl font-medium mx-auto pr-6">Account Settings</h1>
        </header>

        {/* Profile content */}
        <div className="flex flex-col items-center px-6 pb-4">
          {/* Profile image */}
          <div className="relative w-24 h-24">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-white border-2 border-white">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-white">
                  <Camera className="h-8 w-8 text-gray-300" />
                </div>
              )}
            </div>
            
            {/* Tombol upload dengan icon plus */}
            <button 
              onClick={handleImageClick}
              className="absolute bottom-0 right-8 bg-blue-500 rounded-full p-1.5 shadow-md border-2 border-white"
            >
              <Plus className="h-4 w-4 text-white" />
            </button>
            
            {/* File input yang tersembunyi */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageUpload}
              className="hidden"
              accept="image/*"
            />
            
            <div className="absolute bottom-0 right-0 bg-[#FFD600] text-white rounded-full p-1 border-2 border-white">
              <span className="text-xs font-bold">ID</span>
            </div>
          </div>
          
          <h2 className="font-medium text-lg mt-2">{userDataFromQuery?.full_name || "User Name"}</h2>
          <p className="text-sm text-gray-700">ID: {USER_ID}</p>
        </div>

        {/* White card for form */}
        <div className="w-full bg-white rounded-t-3xl p-6 flex-1">
          <h3 className="font-medium text-lg mb-4">Account Settings</h3>
          
          <form className="space-y-4">
            <div>
              <label className="block text-sm mb-1">Username</label>
              <Input 
                value={userDataFromQuery?.full_name || ""}
                className="bg-[#EFF3F8] border-none"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Phone</label>
              <Input 
                value={userDataFromQuery?.phone || ""}
                className="bg-[#EFF3F8] border-none"
                disabled
              />
            </div>
            
            <div>
              <label className="block text-sm mb-1">Email Address</label>
              <Input 
                value={userDataFromQuery?.email || ""}
                className="bg-[#EFF3F8] border-none"
                disabled
              />
            </div>
            
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Push Notifications</span>
              <Switch 
                checked={formData.pushNotifications || false}
                onCheckedChange={(checked) => handleToggleChange("pushNotifications", checked)}
                className="data-[state=checked]:bg-[#FFD600]"
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Turn Dark Theme</span>
              <Switch 
                checked={formData.darkTheme || false}
                onCheckedChange={(checked) => handleToggleChange("darkTheme", checked)}
                className="data-[state=checked]:bg-blue-500"
              />
            </div>
            
            <div className="mt-6">
              <Button 
                onClick={handleViewDetailClick}
                className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black rounded-full py-5"
              >
                Lihat Detail Profil
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Detail Profile View (Detail/Edit Mode - Blue Background)
  return (
    <div className="flex flex-col h-screen bg-[#2341DD]">
      {/* Header */}
      <header className="p-4 flex items-center">
        <button 
          className="text-white"
          onClick={() => setMode("summary")}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-white text-xl font-medium mx-auto pr-6">Detail Profil</h1>
      </header>

      {/* Form content */}
      <div className="flex-1 px-6 py-2 overflow-y-auto">
        <form className="space-y-4">
          <div>
            <label className="block text-white text-sm mb-1">Full Name</label>
            <Input 
              value={mode === "edit" ? formData.full_name || '' : userDataFromQuery?.full_name || ""}
              onChange={e => handleInputChange("full_name", e.target.value)}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-1">Phone</label>
            <Input 
              value={mode === "edit" ? formData.phone || '' : userDataFromQuery?.phone || ""}
              onChange={e => handleInputChange("phone", e.target.value)}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-1">Email Address</label>
            <Input 
              type="email"
              value={mode === "edit" ? formData.email || '' : userDataFromQuery?.email || ""}
              onChange={e => handleInputChange("email", e.target.value)}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-1">Age</label>
            <Input 
              type="number"
              value={mode === "edit" ? formData.age || 0 : userDataFromQuery?.age || 0}
              onChange={e => handleInputChange("age", Number(e.target.value))}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-1">Gender</label>
            <Input 
              value={mode === "edit" ? formData.gender || '' : userDataFromQuery?.gender || ""}
              onChange={e => handleInputChange("gender", e.target.value)}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-1">Occupation</label>
            <Input 
              value={mode === "edit" ? formData.occupation || '' : userDataFromQuery?.occupation || ""}
              onChange={e => handleInputChange("occupation", e.target.value)}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-1">Marital Status</label>
            <Input 
              value={mode === "edit" ? formData.marital_status || '' : userDataFromQuery?.marital_status || ""}
              onChange={e => handleInputChange("marital_status", e.target.value)}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-1">Location</label>
            <Input 
              value={mode === "edit" ? formData.location || '' : userDataFromQuery?.location || ""}
              onChange={e => handleInputChange("location", e.target.value)}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-1">Dependents</label>
            <Input 
              type="number"
              value={mode === "edit" ? formData.dependents || 0 : userDataFromQuery?.dependents || 0}
              onChange={e => handleInputChange("dependents", Number(e.target.value))}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-1">Assets</label>
            <Input 
              value={mode === "edit" ? formData.assets || '' : userDataFromQuery?.assets || ""}
              onChange={e => handleInputChange("assets", e.target.value)}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div>
            <label className="block text-white text-sm mb-1">Active Debt (Count)</label>
            <Input 
              value={mode === "edit" ? formData.activeDebt || '' : userDataFromQuery?.activeDebt || ""}
              onChange={e => handleInputChange("activeDebt", e.target.value)}
              disabled={mode !== "edit"}
              className="bg-white border-none rounded-md"
            />
          </div>
          
          <div className="mt-6 pb-4">
            {mode === "detail" ? (
              <Button 
                onClick={handleEditClick}
                className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black rounded-full py-5"
              >
                Edit Profil
              </Button>
            ) : (
              <Button 
                onClick={handleUpdateClick}
                className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black rounded-full py-5"
              >
                Update Profile
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default DetailPage;
