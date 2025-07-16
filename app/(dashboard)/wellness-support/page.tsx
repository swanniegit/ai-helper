export default function WellnessSupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Wellness Support</h2>
        <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
          Start Session
        </button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-blue-600 text-xl">🧘</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Mindfulness Tools</h3>
              <p className="text-sm text-gray-500">Guided meditation and breathing exercises</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Access guided meditation sessions, breathing exercises, and mindfulness practices 
            designed to reduce stress and improve mental clarity.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Daily Meditation</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">10 min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Breathing Exercise</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">5 min</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Body Scan</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">15 min</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-green-600 text-xl">📊</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Mood Tracking</h3>
              <p className="text-sm text-gray-500">Monitor your emotional patterns</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Track your daily mood, energy levels, and emotional patterns to gain insights 
            into your mental wellness journey.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Today&apos;s Mood</span>
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full">Good</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Energy Level</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">High</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Stress Level</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Low</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-orange-600 text-xl">💪</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Stress Management</h3>
              <p className="text-sm text-gray-500">Techniques to manage daily stress</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Learn practical techniques for managing stress, including time management, 
            boundary setting, and relaxation strategies.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Time Management</span>
              <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded-full">New</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Boundary Setting</span>
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">Popular</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Relaxation Techniques</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Featured</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4">
              <span className="text-purple-600 text-xl">📚</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-800">Wellness Resources</h3>
              <p className="text-sm text-gray-500">Articles and tips for better well-being</p>
            </div>
          </div>
          <p className="text-gray-600 mb-4">
            Access a curated collection of articles, tips, and resources focused on 
            mental health, wellness, and personal development.
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Sleep Hygiene</span>
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded-full">Guide</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Nutrition & Mood</span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">Article</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
              <span className="text-sm font-medium">Exercise Benefits</span>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Research</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 