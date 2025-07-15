export default function NewsFeedPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">News Feed</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors">
            All
          </button>
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
            Career
          </button>
          <button className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors">
            Wellness
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-blue-600 text-xl">📈</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-800">Career Growth Trends 2024</h3>
                <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full">Trending</span>
              </div>
              <p className="text-gray-600 mb-3">
                Discover the top skills and strategies that will drive career success in 2024. 
                Learn how to adapt to changing workplace dynamics and stay ahead of the curve.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">2 hours ago • 5 min read</span>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Read More
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-green-600 text-xl">🧘</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-800">Mindfulness in the Workplace</h3>
                <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">Wellness</span>
              </div>
              <p className="text-gray-600 mb-3">
                How practicing mindfulness can improve productivity, reduce stress, and enhance 
                workplace relationships. Simple techniques you can start using today.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">1 day ago • 3 min read</span>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Read More
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-purple-600 text-xl">🎯</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-800">Goal Setting Strategies</h3>
                <span className="px-2 py-1 text-xs bg-orange-100 text-orange-700 rounded-full">Featured</span>
              </div>
              <p className="text-gray-600 mb-3">
                Master the art of setting and achieving meaningful goals. Learn proven techniques 
                for breaking down large objectives into manageable, actionable steps.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">3 days ago • 7 min read</span>
                <button className="px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors">
                  Read More
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 