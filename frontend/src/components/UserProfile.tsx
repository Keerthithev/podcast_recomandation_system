import React, { useState, useEffect } from 'react'
import { userService, UserProfile as UserProfileType } from '../services/userService'

interface UserProfileProps {
  userId: string
  onClose: () => void
}

export default function UserProfile({ userId, onClose }: UserProfileProps) {
  const [profile, setProfile] = useState<UserProfileType | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    bio: '',
    profile_picture: ''
  })

  useEffect(() => {
    loadProfile()
  }, [userId])

  const loadProfile = async () => {
    try {
      setLoading(true)
      setError(null)
      const profileData = await userService.getProfile(userId)
      setProfile(profileData)
      setFormData({
        username: profileData.username || '',
        email: profileData.email || '',
        full_name: profileData.full_name || '',
        bio: profileData.bio || '',
        profile_picture: profileData.profile_picture || ''
      })
    } catch (err: any) {
      // If profile doesn't exist, we'll show create form
      if (err.message.includes('404')) {
        setProfile(null)
        setIsEditing(true)
      } else {
        setError(err.message || 'Failed to load profile')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      setError(null)

      if (profile) {
        // Update existing profile
        await userService.updateProfile(userId, formData)
        const updatedProfile = await userService.getProfile(userId)
        setProfile(updatedProfile)
      } else {
        // Create new profile
        const result = await userService.createProfile({
          user_id: userId,
          ...formData
        })
        setProfile(result.data)
      }
      
      setIsEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    if (profile) {
      setFormData({
        username: profile.username || '',
        email: profile.email || '',
        full_name: profile.full_name || '',
        bio: profile.bio || '',
        profile_picture: profile.profile_picture || ''
      })
      setIsEditing(false)
    } else {
      onClose()
    }
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            <span className="ml-2">Loading profile...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">
            {profile ? 'User Profile' : 'Create Profile'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="space-y-6">
          {/* Profile Picture Section */}
          <div className="text-center">
            <div className="w-24 h-24 mx-auto rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
              {formData.profile_picture ? (
                <img
                  src={formData.profile_picture}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              )}
            </div>
            {isEditing && (
              <div className="mt-2">
                <input
                  type="url"
                  placeholder="Profile picture URL"
                  value={formData.profile_picture}
                  onChange={(e) => setFormData(prev => ({ ...prev, profile_picture: e.target.value }))}
                  className="text-sm px-3 py-1 border rounded dark:bg-gray-700 dark:border-gray-600"
                />
              </div>
            )}
          </div>

          {/* Profile Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter username"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded">
                  {profile?.username || 'Not set'}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter email"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded">
                  {profile?.email || 'Not set'}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Enter full name"
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded">
                  {profile?.full_name || 'Not set'}
                </p>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Bio</label>
              {isEditing ? (
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                  placeholder="Tell us about yourself..."
                  rows={3}
                />
              ) : (
                <p className="px-3 py-2 bg-gray-50 dark:bg-gray-700 rounded min-h-[80px]">
                  {profile?.bio || 'No bio provided'}
                </p>
              )}
            </div>
          </div>

          {/* Profile Stats (only show if profile exists) */}
          {profile && !isEditing && (
            <div className="border-t pt-4">
              <h3 className="text-lg font-semibold mb-3">Profile Information</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Member since:</span>
                  <p className="font-medium">{formatDate(profile.date_joined)}</p>
                </div>
                <div>
                  <span className="text-gray-500">Last active:</span>
                  <p className="font-medium">{formatDate(profile.last_active)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            {isEditing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded"
                  disabled={saving}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                >
                  {saving ? 'Saving...' : (profile ? 'Save Changes' : 'Create Profile')}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                >
                  Edit Profile
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

