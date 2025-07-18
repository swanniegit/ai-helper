export default function NewsFeedPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">News Feed</h2>
        <div className="flex space-x-2">
          <button className="px-3 py-1 text-sm bg-primary/20 text-primary rounded-md hover:bg-primary/30 transition-colors">
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
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xl">📈</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-800">Career Growth Trends 2024</h3>
                <span className="px-2 py-1 text-xs bg-primary/20 text-primary rounded-full">Trending</span>
              </div>
              <p className="text-gray-600 mb-3">
                Discover the top skills and strategies that will drive career success in 2024. 
                Learn how to adapt to changing workplace dynamics and stay ahead of the curve.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">2 hours ago • 5 min read</span>
                <button className="px-3 py-1 text-sm bg-gradient-to-r from-primary to-gray-700 text-white rounded-md hover:from-primary/90 hover:to-gray-700/90 transition-colors">
                  Read More
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xl">🧘</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-800">Mindfulness in the Workplace</h3>
                <span className="px-2 py-1 text-xs bg-primary/15 text-primary rounded-full">Wellness</span>
              </div>
              <p className="text-gray-600 mb-3">
                How practicing mindfulness can improve productivity, reduce stress, and enhance 
                workplace relationships. Simple techniques you can start using today.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">1 day ago • 3 min read</span>
                <button className="px-3 py-1 text-sm bg-gradient-to-r from-primary to-gray-700 text-white rounded-md hover:from-primary/90 hover:to-gray-700/90 transition-colors">
                  Read More
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border border-gray-200">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-primary text-xl">🎯</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <h3 className="font-semibold text-gray-800">Goal Setting Strategies</h3>
                <span className="px-2 py-1 text-xs bg-primary/25 text-primary rounded-full">Featured</span>
              </div>
              <p className="text-gray-600 mb-3">
                Master the art of setting and achieving meaningful goals. Learn proven techniques 
                for breaking down large objectives into manageable, actionable steps.
              </p>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">3 days ago • 7 min read</span>
                <button className="px-3 py-1 text-sm bg-gradient-to-r from-primary to-gray-700 text-white rounded-md hover:from-primary/90 hover:to-gray-700/90 transition-colors">
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