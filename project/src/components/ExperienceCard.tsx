import React from 'react';
import { MapPin, Clock, Star, Users } from 'lucide-react';
import { Experience } from '../types';

interface ExperienceCardProps {
  experience: Experience;
  onClick: () => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      <div className="relative h-64 overflow-hidden">
        <img
          src={experience.image_url}
          alt={experience.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-4 right-4 bg-white px-3 py-1.5 rounded-full shadow-lg">
          <span className="text-sm font-bold text-gray-800">${experience.price}</span>
        </div>
        <div className="absolute top-4 left-4 bg-gray-900 bg-opacity-75 px-3 py-1.5 rounded-full">
          <span className="text-xs font-medium text-white">{experience.category}</span>
        </div>
      </div>

      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{experience.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 leading-relaxed">
          {experience.description}
        </p>

        <div className="space-y-2.5">
          <div className="flex items-center text-gray-700">
            <MapPin className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
            <span className="text-sm line-clamp-1">{experience.location}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Clock className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
            <span className="text-sm">{experience.duration}</span>
          </div>
          <div className="flex items-center text-gray-700">
            <Users className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
            <span className="text-sm">Up to {experience.max_group_size} guests</span>
          </div>
        </div>

        <div className="flex items-center justify-between mt-5 pt-5 border-t border-gray-100">
          <div className="flex items-center">
            <Star className="w-5 h-5 text-yellow-500 fill-current mr-1.5" />
            <span className="text-base font-bold text-gray-900">{experience.rating.toFixed(1)}</span>
          </div>
          <button className="text-blue-600 font-semibold text-sm hover:text-blue-700 transition-colors">
            View Details →
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExperienceCard;
