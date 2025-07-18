export default function MentorLinkupPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">Mentor Linkup</h2>
        <button className="px-4 py-2 bg-gradient-to-r from-primary to-gray-700 text-white rounded-lg hover:from-primary/90 hover:to-gray-700/90 transition-colors">
          Find Mentor
        </button>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Available Mentors</h3>
          <div className="space-y-4">
            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  SM
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">Sarah Mitchell</h4>
                    <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">Available</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Senior Product Manager at TechCorp</p>
                  <p className="text-sm text-gray-500 mb-3">
                    Specializes in career transitions, leadership development, and work-life balance. 
                    8+ years of experience mentoring professionals.
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">⭐ 4.9 (127 reviews)</span>
                    <span className="text-xs text-gray-500">💬 45 min sessions</span>
                    <span className="text-xs text-gray-500">$75/hour</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="px-4 py-2 bg-gradient-to-r from-primary to-gray-700 text-white rounded-md hover:from-primary/90 hover:to-gray-700/90 transition-colors">
                  Book Session
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  View Profile
                </button>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  DJ
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">David Johnson</h4>
                    <span className="px-2 py-1 text-xs bg-primary/15 text-primary rounded-full">Busy</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Executive Coach & Leadership Consultant</p>
                  <p className="text-sm text-gray-500 mb-3">
                    Expert in executive leadership, strategic thinking, and organizational development. 
                    Former Fortune 500 executive with 15+ years of coaching experience.
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">⭐ 4.8 (89 reviews)</span>
                    <span className="text-xs text-gray-500">💬 60 min sessions</span>
                    <span className="text-xs text-gray-500">$120/hour</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="px-4 py-2 bg-gradient-to-r from-primary to-gray-700 text-white rounded-md hover:from-primary/90 hover:to-gray-700/90 transition-colors">
                  Book Session
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  View Profile
                </button>
              </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
              <div className="flex items-start space-x-4">
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-gray-700 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                  LW
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-800">Lisa Wang</h4>
                    <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">Available</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">Wellness Coach & Mindfulness Expert</p>
                  <p className="text-sm text-gray-500 mb-3">
                    Certified wellness coach specializing in stress management, mindfulness, 
                    and personal development. Helps clients achieve work-life harmony.
                  </p>
                  <div className="flex items-center space-x-4">
                    <span className="text-xs text-gray-500">⭐ 4.9 (156 reviews)</span>
                    <span className="text-xs text-gray-500">💬 30 min sessions</span>
                    <span className="text-xs text-gray-500">$60/hour</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex space-x-2">
                <button className="px-4 py-2 bg-gradient-to-r from-primary to-gray-700 text-white rounded-md hover:from-primary/90 hover:to-gray-700/90 transition-colors">
                  Book Session
                </button>
                <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors">
                  View Profile
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Mentorship</h3>
            <div className="space-y-4">
              <div className="p-4 bg-primary/10 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-primary mr-2">📅</span>
                  <span className="font-medium text-gray-800">Next Session</span>
                </div>
                <p className="text-sm text-gray-600">Tomorrow, 2:00 PM</p>
                <p className="text-sm text-gray-500">with Sarah Mitchell</p>
              </div>
              
              <div className="p-4 bg-primary/15 rounded-lg">
                <div className="flex items-center mb-2">
                  <span className="text-primary mr-2">📊</span>
                  <span className="font-medium text-gray-800">Progress</span>
                </div>
                <div className="mb-2">
                  <div className="flex justify-between text-sm mb-1">
                    <span>This Month</span>
                    <span>3/4 sessions</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-primary h-2 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full px-4 py-2 bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors text-left">
                📝 Schedule New Session
              </button>
              <button className="w-full px-4 py-2 bg-primary/15 text-primary rounded-md hover:bg-primary/25 transition-colors text-left">
                📚 View Resources
              </button>
              <button className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors text-left">
                💬 Message Mentors
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 