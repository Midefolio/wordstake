import React, { useState, useRef } from 'react';
import { User, Camera, X, Check, Upload, Loader, ArrowLeft } from 'lucide-react';
import { makeRequest } from '../../../hook/useApi';
import { updateGamerApi } from '../../../api';
import { isSending, notifyError, notifySuccess } from '../../../utils/useutils';
import useUserAuthContext from '../../../hook/userUserAuthContext';
import { useDispatch } from 'react-redux';
import { setCurrentUser } from '../../../states/userSlice';
import { db } from '../../../dexieDB';
import { uploadSingleImageToCloudinary } from '../../../utils/clouds';

const ProfileSetupModal: React.FC<any> = ({ currentUser }) => {
  const { token, pubkey } = useUserAuthContext();
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [step, setStep] = useState<'username' | 'profile'>('username');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadPercentage, setUploadPercentage] = useState<any>(null);
  const [image, setImage] = useState<any>();

  // Function to validate username characters
  const isValidUsername = (value: string) => {
    // Only allow letters, numbers, and spaces - no special characters like _, ., etc.
    const regex = /^[a-zA-Z0-9\s]*$/;
    return regex.test(value);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isValidUsername(value)) {
      setUsername(value);
    }
  };

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setIsUploading(true);
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        notifyError('File size exceeds 5MB limit');
        setIsUploading(false);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        setProfileImage(e.target?.result as string);
        setIsUploading(false);
      };
      reader.readAsDataURL(file);

      setUploadPercentage(1);
      try {
        const image = await uploadSingleImageToCloudinary(file, (info) => {
          setUploadPercentage(info.progress)
        });
        if (image) {
          setImage(image);
          setUploadPercentage(null); // Reset progress after success
        }
      } catch (error) {
        setUploadPercentage(0); // Reset progress on error
        notifyError('Unable to upload image')
      } finally {
        setUploadPercentage(null); // Reset progress after success
      }
    }
  };

  const handleNext = () => {
    if (step === 'username' && username.trim() && username.trim().length >= 3) {
      setStep('profile');
    }
  };

  const handleBack = () => {
    if (step === 'profile') {
      setStep('username');
    }
  };

  const handleSave = async () => {
    if (username.trim() && !uploadPercentage) { // Prevent saving while uploading
      isSending(true, "Saving profile...");
      const { res, error } = await makeRequest("POST", updateGamerApi, { username: username.trim(), profilePicture: image || null }, null, token, null);
      if (res) {
        await db.cached_data.put(res.data, `gamer_${pubkey}`);
        dispatch(setCurrentUser(res?.data));
        isSending(false, "");
        notifySuccess("Profile updated successfully!");
        setUsername('');
        setProfileImage(null);
        setStep('username');
        return
      }
      if (error) {
        isSending(false, "");
        notifyError("There was an error updating your profile. Please try again.");
        console.log(error);
        return;
      }
    }
  };

  const handleSkipProfile = async () => {
    if (username.trim() && !uploadPercentage) { // Prevent saving while uploading
      isSending(true, "Saving profile...");
      const { res, error } = await makeRequest("POST", updateGamerApi, { username: username.trim(), profilePicture: null }, null, token, null);
      if (res) {
        await db.cached_data.put(res.data, `gamer_${pubkey}`);
        dispatch(setCurrentUser(res?.data));
        isSending(false, "");
        notifySuccess("Profile updated successfully!");
        setUsername('');
        setProfileImage(null);
        setStep('username');
        return
      }
      if (error) {
        isSending(false, "");
        notifyError("There was an error updating your profile. Please try again.");
        console.log(error);
        return;
      }
    }
  };

  if (currentUser?.username) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100 animate-fadeInScale">
        {/* Header */}
        <div className="relative p-6 border-b border-gray-700">
          {/* Back button for profile step */}
          {step === 'profile' && (
            <button
              onClick={handleBack}
              className="absolute top-4 left-4 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          
          <div className="text-center">
            <div className="w-16 h-16 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
              <User className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">
              {step === 'username' ? 'Choose Your Nickname' : 'Add Profile Picture'}
            </h2>
            <p className="text-gray-400 text-sm">
              {step === 'username'
                ? 'Pick a unique name that other players will see'
                : 'Make your profile stand out with a photo'
              }
            </p>
          </div>
          <button
            // onClick={}
            className="absolute top-4 right-4 p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {step === 'username' ? (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300">
                  Nickname
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={handleUsernameChange}
                  placeholder="Enter your gaming nickname"
                  className="w-full px-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 focus:outline-none transition-all"
                  maxLength={20}
                  autoFocus
                />
                <div className="flex justify-between text-xs text-gray-400">
                  <span>Choose something memorable!</span>
                  <span>{username.length}/20</span>
                </div>
              </div>

              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h4 className="font-medium text-white mb-2 flex items-center">
                  <Check className="w-4 h-4 text-green-400 mr-2" />
                  Nickname Guidelines
                </h4>
                <ul className="text-sm text-gray-400 space-y-1">
                  <li>• 3-20 characters long</li>
                  <li>• Unique to you</li>
                  <li>• No offensive language</li>
                  <li>• Letters, numbers, and spaces only</li>
                  <li>• No special characters (_ . @ # etc.)</li>
                </ul>
              </div>

              <button
                onClick={handleNext}
                disabled={!username.trim() || username.length < 3}
                className="w-full bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
              >
                Continue
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Profile Image Upload */}
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-700 border-4 border-gray-600 mx-auto mb-4 relative group cursor-pointer">
                    {profileImage ? (
                      <img
                        src={profileImage}
                        alt="Profile preview"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    {/* Upload Overlay */}
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {isUploading ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Camera className="w-8 h-8 text-white" />
                      )}
                    </div>
                  </div>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              
                {uploadPercentage !== null ? (
                  <button
                    disabled={true}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Loader className="w-4 h-4" />
                    <span>{uploadPercentage}%</span>
                  </button>
                ) : (
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isUploading}
                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 px-6 py-2 rounded-lg font-medium transition-colors flex items-center space-x-2 mx-auto"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{profileImage ? 'Change Photo' : 'Upload Photo'}</span>
                  </button>
                )}

                <p className="text-xs text-gray-400 mt-2">
                  JPG, PNG or GIF • Max 5MB
                </p>
              </div>

              {/* Preview Card */}
              <div className="bg-gray-700/50 rounded-lg p-4 border border-gray-600">
                <h4 className="font-medium text-white mb-3">Preview</h4>
                <div className="flex items-center space-x-3 p-3 bg-gray-700 rounded-lg">
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-600 flex-shrink-0">
                    {profileImage ? (
                      <img src={profileImage} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-5 h-5 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-white">{username}</p>
                    <p className="text-sm text-gray-400">Rank #--</p>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Conditional rendering based on image upload status */}
              <div className="flex space-x-3">
                {/* Always show Skip for Now button */}
                <button
                  onClick={handleSkipProfile}
                  disabled={uploadPercentage !== null}
                  className="flex-1 border border-gray-600 hover:border-gray-500 disabled:border-gray-700 disabled:text-gray-500 disabled:cursor-not-allowed py-3 rounded-lg font-semibold transition-colors"
                >
                  Skip for Now
                </button>
                
                {/* Only show Complete Setup when image is uploaded and not uploading */}
                {image && uploadPercentage === null && (
                  <button
                    onClick={handleSave}
                    className="flex-1 bg-purple-600 hover:bg-purple-700 py-3 rounded-lg font-semibold transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    Complete Setup
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="px-6 pb-4">
          <div className="flex items-center justify-center space-x-2">
            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'username' ? 'bg-purple-600' : 'bg-green-500'
              }`}></div>
            <div className={`w-8 h-1 rounded-full transition-colors ${step === 'profile' ? 'bg-purple-600' : 'bg-gray-600'
              }`}></div>
            <div className={`w-3 h-3 rounded-full transition-colors ${step === 'profile' ? 'bg-purple-600' : 'bg-gray-600'
              }`}></div>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Step {step === 'username' ? '1' : '2'} of 2
          </p>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-fadeInScale {
          animation: fadeInScale 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default ProfileSetupModal;