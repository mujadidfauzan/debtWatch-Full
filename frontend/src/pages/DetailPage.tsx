import React, { useState, useRef, useEffect } from "react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { Camera, ArrowLeft, Plus, Save, XCircle } from "lucide-react";
import { useQuery, useMutation, useQueryClient, QueryKey } from "@tanstack/react-query";
import { getUserProfile, updateUserProfile, UserProfileData } from "../lib/api";
import { auth } from "@/firebase";

// Remove placeholder USER_ID
// const USER_ID = "user123";

// DetailFormData pake dari UserProfileData.
interface DetailFormData extends Partial<UserProfileData> {}

const DetailPage: React.FC = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [formData, setFormData] = useState<DetailFormData>({});

  const queryClient = useQueryClient();
  
  // Get dynamic userId
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid;

  const { data: userDataFromQuery, isLoading: isLoadingProfile, isError: isErrorProfile, error: errorProfile, refetch } = useQuery<UserProfileData, Error, UserProfileData, QueryKey>({
    queryKey: ['userProfile', userId as string], // Ensure userId is treated as part of the query key
    queryFn: () => getUserProfile(userId!),
    enabled: !!userId,
  });

  // Populate formData when userDataFromQuery changes (e.g., on initial load or after refetch)
  useEffect(() => {
    if (userDataFromQuery) {
      setFormData(userDataFromQuery);
      // If UserProfileData had profileImageUrl, you would set it here:
      // if (userDataFromQuery.profileImageUrl) setProfileImage(userDataFromQuery.profileImageUrl);
    }
  }, [userDataFromQuery]);

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
      setIsEditing(false); // Exit edit mode after successful save
      // No need to refetch here as invalidateQueries will trigger onSuccess of useQuery which updates formData
    },
    onError: (error: Error) => {
      console.error("Error updating profile:", error);
      // Optionally, show a toast message to the user
    }
  });

  const handleInputChange = (field: keyof DetailFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEditClick = () => {
    // Ensure formData is up-to-date with the latest fetched data before editing
    if (userDataFromQuery) {
      setFormData(userDataFromQuery);
    }
    setIsEditing(true);
  };

  const handleSaveClick = () => {
    mutation.mutate(formData);
  };

  const handleCancelClick = () => {
    setIsEditing(false);
    // Reset formData to the original fetched data
    if (userDataFromQuery) {
      setFormData(userDataFromQuery);
    }
    // Or, could do a refetch() if preferred, though onSuccess of useQuery should handle resetting formData.
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setProfileImage(imageUrl);
      // TODO: Add logic to upload image to storage and update profile URL in Firestore/backend
      // This should probably also update formData.profileImageUrl and then call mutation.mutate
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
    return <div className="flex justify-center items-center min-h-screen">Error loading profile: {errorProfile?.message}</div>;
  }

  // Simplified as profileImageUrl is not in UserProfileData type for now
  const userProfileImageToDisplay = profileImage; 

  // --- Combined Single View --- 
  return (
    <div className="flex flex-col min-h-screen bg-[#2341DD]">
      {/* Header */}
      <header className="p-4 flex items-center justify-between sticky top-0 z-10 bg-[#2341DD]">
        <div className="flex-1 flex justify-start">
          <button 
            className="text-white p-2 rounded-full hover:bg-white/10"
            onClick={() => window.history.back()} // Or use navigate(-1) if using react-router-dom for navigation
          >
            <ArrowLeft className="h-6 w-6" />
          </button>
        </div>
        <h1 className="text-white text-xl font-semibold whitespace-nowrap">
          Profil Saya
        </h1>
        <div className="flex-1 flex justify-end"> {/* This div will ensure buttons are pushed to the right but have space */}
          {!isEditing ? (
            <Button onClick={handleEditClick} variant="outline" className="text-black border-white hover:bg-white hover:text-blue-700 text-sm px-3 py-1.5">
              Edit
            </Button>
          ) : (
            <div className="flex items-center space-x-1 sm:space-x-2"> {/* Reduced space-x for smaller screens */}
              <Button onClick={handleSaveClick} variant="ghost" className="p-1.5 sm:p-2 text-green-400 hover:bg-white/10 hover:text-green-300" disabled={mutation.isPending}>
                {mutation.isPending ? <Save className="h-5 w-5 animate-spin"/> : <Save className="h-5 w-5" />}
              </Button>
              <Button onClick={handleCancelClick} variant="ghost" className="p-1.5 sm:p-2 text-red-400 hover:bg-white/10 hover:text-red-300" disabled={mutation.isPending}>
                <XCircle className="h-5 w-5" />
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Profile Content */}
      <div className="flex-1 px-6 py-8 overflow-y-auto text-white">
        {/* Profile Image Section - Centered */}
        <div className="flex flex-col items-center mb-8">
          <div className="relative w-28 h-28 mb-2">
            <div className="w-28 h-28 rounded-full overflow-hidden bg-white border-2 border-white shadow-lg">
              {userProfileImageToDisplay ? (
                <img src={userProfileImageToDisplay} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <Camera className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            <button 
              onClick={handleImageClick}
              className="absolute bottom-1 right-1 bg-blue-500 hover:bg-blue-600 rounded-full p-2 shadow-md border-2 border-white"
              aria-label="Change profile picture"
            >
              <Plus className="h-4 w-4 text-white" />
            </button>
            <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*" />
          </div>
        </div>

        {/* User Information Form/Display */}
        <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); if(isEditing) handleSaveClick(); }}>
          
          {(isEditing ? [
            { label: 'Nama Lengkap', field: 'full_name', type: 'text' },
            { label: 'Email', field: 'email', type: 'email' }, // Email might not be editable depending on auth
            { label: 'Telepon', field: 'phone', type: 'tel' },
            { label: 'Usia', field: 'age', type: 'number' },
            { label: 'Jenis Kelamin', field: 'gender', type: 'select', options: ['Laki-laki', 'Perempuan', 'Lainnya'] },
            { label: 'Pekerjaan', field: 'occupation', type: 'text' },
            { label: 'Jumlah Tanggungan', field: 'dependents', type: 'number' },
            // { label: 'Aset', field: 'assets', type: 'text' }, // Asset handling might be more complex than simple text
          ] : [
            { label: 'Nama Lengkap', field: 'full_name' },
            { label: 'Email', field: 'email' },
            { label: 'Telepon', field: 'phone' },
            { label: 'Usia', field: 'age' },
            { label: 'Jenis Kelamin', field: 'gender' },
            { label: 'Pekerjaan', field: 'occupation' },
            { label: 'Jumlah Tanggungan', field: 'dependents' },
            // { label: 'Aset', field: 'assets' },
          ]).map(item => (
            <div key={item.field} className="py-2 border-b border-white/20">
              <label className="block text-sm font-light text-white/80 mb-1">{item.label}</label>
              {isEditing ? (
                item.type === 'select' && item.options ? (
                  <select 
                    value={(formData[item.field as keyof DetailFormData] as string) || ''}
                    onChange={(e) => handleInputChange(item.field as keyof DetailFormData, e.target.value)}
                    className="w-full p-2.5 rounded bg-white/10 text-black placeholder-gray-500 border border-white/30 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                  >
                    <option value="" disabled className="text-gray-500">Pilih {item.label}</option>
                    {item.options.map(opt => <option key={opt} value={opt} className="text-black bg-white">{opt}</option>)}
                  </select>
                ) : (
                  <Input 
                    type={item.type || 'text'}
                    value={(formData[item.field as keyof DetailFormData] as string | number) || ''}
                    onChange={(e) => handleInputChange(item.field as keyof DetailFormData, e.target.value)}
                    className="w-full p-2.5 rounded bg-white/10 text-black placeholder-gray-500 border border-white/30 focus:ring-indigo-500 focus:border-indigo-500 text-base"
                    disabled={item.field === 'email'} // Example: make email non-editable
                  />
                )
              ) : (
                <p className="text-base text-white min-h-[2.5rem] flex items-center">
                  {(item.field === 'assets' && Array.isArray(formData.assets)) 
                    ? formData.assets.join(', ') 
                    : (formData[item.field as keyof DetailFormData] as string | number | undefined)
                  } 
                  {(!formData[item.field as keyof DetailFormData] && formData[item.field as keyof DetailFormData] !==0 ) && <span className="text-white/60 italic">Belum diisi</span>}
                </p>
              )}
            </div>
          ))}

       
        
          {mutation.isError && <p className="text-red-300 text-sm mt-2 text-center">Gagal menyimpan: {mutation.error?.message}</p>}
        </form>
      </div>
    </div>
  );
};

export default DetailPage;