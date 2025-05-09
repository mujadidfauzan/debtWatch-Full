import React, { useState, useRef, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Switch } from "../components/ui/switch";
import { Button } from "../components/ui/button";
import { Camera, ArrowLeft, Plus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile, UserProfileData } from "../lib/api";
import { auth } from "@/firebase"; // Import auth

// Remove placeholder USER_ID
// const USER_ID = "user123";

// DetailFormData pake dari UserProfileData.
interface DetailFormData extends Partial<UserProfileData> {}

const DetailPage: React.FC = () => {
  // Modes: summary, detail, edit
  const [mode, setMode] = useState<"summary" | "detail" | "edit">("summary");

  // Remove hardcoded initial state if it's fetched
  // const [userData, setUserData] = useState({...}); 

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<DetailFormData>({});

  const queryClient = useQueryClient();
  
  // Get dynamic userId
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  const { data: userDataFromQuery, isLoading: isLoadingProfile, isError: isErrorProfile, error: errorProfile, refetch } = useQuery<UserProfileData, Error>({
    queryKey: ['userProfile', userId], // Use dynamic userId
    queryFn: () => getUserProfile(userId!), // Use dynamic userId
    enabled: !!userId, // Enable only if userId exists
  });

  const mutation = useMutation<
    { message: string }, 
    Error, 
    DetailFormData
  >({
    // Use dynamic userId in mutation
    mutationFn: (updatedData: DetailFormData) => updateUserProfile(userId!, updatedData as UserProfileData),
    onSuccess: () => {
      // Use dynamic userId for invalidation
      queryClient.invalidateQueries({ queryKey: ['userProfile', userId] });
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

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      // TODO: Add logic to upload image to storage and update profile URL in Firestore/backend
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  // Use isLoadingProfile from useQuery
  if (isLoadingProfile && userId) { // Check userId as well
    return <div className="flex justify-center items-center min-h-screen">Loading profile...</div>;
  }

  // Handle user not logged in 
  if (!userId) {
     return <div className="flex justify-center items-center min-h-screen">User not logged in. Please refresh or log in.</div>;
  }

  // Use isErrorProfile from useQuery
  if (isErrorProfile) {
    return <div className="flex justify-center items-center min-h-screen">Error loading profile: {errorProfile.message}</div>;
  }

  // --- Render logic using `userDataFromQuery` and `formData` ---

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
                // TODO: Fetch profile image URL from userDataFromQuery if available
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
            
            {/* This ID badge seems decorative, keeping it */}
            <div className="absolute bottom-0 right-0 bg-[#FFD600] text-white rounded-full p-1 border-2 border-white">
              <span className="text-xs font-bold">ID</span>
            </div>
          </div>
          
          {/* Use fetched data */}
          <h2 className="font-medium text-lg mt-2">{userDataFromQuery?.full_name || "User Name"}</h2> 
          {/* Display actual UID (optional, maybe remove for user) */}
          {/* <p className="text-sm text-gray-700">ID: {userId}</p> */}
        </div>

        {/* White card for form - Use fetched data */}
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
            
            {/* Switches use formData which is populated by useEffect from userDataFromQuery */}
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm">Push Notifications</span>
              <Switch 
                checked={formData.pushNotifications || false}
                onCheckedChange={(checked) => handleToggleChange("pushNotifications", checked)}
                className="data-[state=checked]:bg-[#FFD600]"
                disabled // Disable in summary mode
              />
            </div>
            
            <div className="flex items-center justify-between py-2">
              <span className="text-sm">Turn Dark Theme</span>
              <Switch 
                checked={formData.darkTheme || false}
                onCheckedChange={(checked) => handleToggleChange("darkTheme", checked)}
                className="data-[state=checked]:bg-blue-500"
                disabled // Disable in summary mode
              />
            </div>
            
            <div className="mt-6">
              <Button 
                type="button" // Prevent form submission
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

  // --- Detail/Edit Mode --- 
  // This part needs refinement to use `formData` for inputs when editing
  // and potentially display more fields from `userDataFromQuery` in detail mode.
  // The existing code seems complex with multiple modes, focusing on fixing the data fetching first.

  // Detail Profile View (Detail/Edit Mode - Blue Background)
  // Placeholder for Detail/Edit mode - Adapt this part based on your needs
  return (
    <div className="flex flex-col h-screen bg-[#2341DD]">
      <header className="p-4 flex items-center">
        <button 
          className="text-white"
          onClick={() => setMode("summary")}
        >
          <ArrowLeft className="h-6 w-6" />
        </button>
        <h1 className="text-white text-xl font-medium mx-auto pr-6">
          {mode === 'edit' ? 'Edit Detail Profil' : 'Detail Profil'}
        </h1>
         {mode === 'detail' && (
            <Button onClick={handleEditClick} variant="outline" className="text-white border-white hover:bg-white hover:text-blue-700 text-sm">Edit</Button>
          )}
      </header>
      <div className="flex-1 px-6 py-2 overflow-y-auto text-white">
         <h3 className="font-medium text-lg mb-4">User Information</h3>
         {/* Display more user data here from formData or userDataFromQuery */} 
         <p>Full Name: {formData.full_name || 'N/A'}</p>
         <p>Email: {formData.email || 'N/A'}</p>
         <p>Phone: {formData.phone || 'N/A'}</p>
         <p>Age: {formData.age || 'N/A'}</p>
         <p>Gender: {formData.gender || 'N/A'}</p>
         <p>Occupation: {formData.occupation || 'N/A'}</p>
         <p>Dependents: {formData.dependents ?? 'N/A'}</p> {/* Use ?? for number/0 */}
         <p>Assets: {Array.isArray(formData.assets) ? formData.assets.join(', ') : formData.assets || 'N/A'}</p>
         {/* Add other fields: dateOfBirth, activeDebt, debtAmount, location, marital_status etc. */}

         {/* Example: Show input fields only in edit mode */}
         {mode === 'edit' && (
           <form className="space-y-4 mt-4" onSubmit={(e) => { e.preventDefault(); handleUpdateClick(); }}>
             {/* Example Input Field */}
             <div>
               <label className="block text-sm mb-1">Phone Number</label>
               <Input 
                 type="tel"
                 value={formData.phone || ''}
                 onChange={(e) => handleInputChange('phone', e.target.value)}
                 className="bg-white/20 border-white/50 text-white placeholder-white/70"
               />
             </div>
             {/* Add other input fields for editable data here */}
             
             {/* Switches for Notifications/Theme */}
             <div className="flex items-center justify-between py-2 border-b border-white/50">
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
                 className="data-[state=checked]:bg-white/50"
               />
             </div>

             <Button 
               type="submit" 
               className="w-full bg-[#FFD600] hover:bg-[#FFD600]/90 text-black rounded-full py-3 mt-4"
               disabled={mutation.isPending} // Use isPending from useMutation
             >
               {mutation.isPending ? 'Saving...' : 'Save Changes'}
             </Button>
             {mutation.isError && <p className="text-red-300 text-sm mt-2">Error saving: {mutation.error.message}</p>}
           </form>
         )}
      </div>
    </div>
  );
};

export default DetailPage;
