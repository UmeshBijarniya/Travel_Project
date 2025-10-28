import React, { useEffect, useState } from 'react';
import { Search, Filter } from 'lucide-react';
import { Experience } from '../types';
import { api } from '../api';
import ExperienceCard from '../components/ExperienceCard';

interface HomePageProps {
  onSelectExperience: (id: string) => void;
}

const HomePage: React.FC<HomePageProps> = ({ onSelectExperience }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [filteredExperiences, setFilteredExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  useEffect(() => {
    loadExperiences();
  }, []);

  useEffect(() => {
    filterExperiences();
  }, [searchTerm, selectedCategory, experiences]);

  const loadExperiences = async () => {
    try {
      setLoading(true);
      const data = await api.getExperiences();
      setExperiences(data);
      setFilteredExperiences(data);
      setError(null);
    } catch (err) {
      setError('Failed to load experiences. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filterExperiences = () => {
    let filtered = experiences;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(exp => exp.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(exp =>
        exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exp.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredExperiences(filtered);
  };

  const categories = ['All', ...Array.from(new Set(experiences.map(exp => exp.category)))];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 tracking-tight">
              BookIt
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Discover unforgettable experiences around the world
            </p>
          </div>

          <div className="mt-12 max-w-3xl mx-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search experiences, locations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-6 py-5 rounded-2xl text-gray-900 text-lg shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center gap-4 mb-10 overflow-x-auto pb-2">
          <Filter className="w-5 h-5 text-gray-600 flex-shrink-0" />
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-6 py-2.5 rounded-full font-medium transition-all whitespace-nowrap ${
                selectedCategory === category
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-100 shadow'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading && (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"></div>
            <p className="mt-6 text-gray-600 text-lg">Loading experiences...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {!loading && !error && filteredExperiences.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-500 text-lg">No experiences found. Try adjusting your filters.</p>
          </div>
        )}

        {!loading && !error && filteredExperiences.length > 0 && (
          <>
            <div className="mb-6">
              <p className="text-gray-600 text-lg">
                {filteredExperiences.length} {filteredExperiences.length === 1 ? 'experience' : 'experiences'} found
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredExperiences.map((experience) => (
                <ExperienceCard
                  key={experience.id}
                  experience={experience}
                  onClick={() => onSelectExperience(experience.id)}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default HomePage;
