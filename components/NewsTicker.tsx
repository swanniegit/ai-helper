import React from 'react';

interface NewsItem {
  id: string;
  headline: string;
  source: string;
}

interface NewsTickerProps {
  newsItems: NewsItem[];
}

const NewsTicker: React.FC<NewsTickerProps> = ({ newsItems }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 animate-fadeIn">
      <ul className="space-y-3">
        {newsItems.map((item, index) => (
          <li 
            key={item.id} 
            className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0 
                       transform transition-transform duration-300 hover:translate-x-1 hover:text-blue-700 
                       opacity-0" // Initial state for animation
            style={{ animation: `fadeIn 0.5s ease-out forwards ${index * 0.1}s` }} // Staggered animation
          >
            <p className="text-gray-800 font-medium">{item.headline}</p>
            <span className="text-sm text-gray-500">Source: {item.source}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 text-right">
        <a href="#" className="text-primary hover:underline text-sm hover:bg-primary/20 transition-colors duration-200 rounded-md p-1">View All News (Mock)</a>
      </div>
    </div>
  );
};

export default NewsTicker;