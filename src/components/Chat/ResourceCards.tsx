import React from 'react';
import { ExternalLink, Vote, HelpCircle, Building, Users } from 'lucide-react';
import { ResourceCard } from '../../types';

const RESOURCE_CARDS: ResourceCard[] = [
  {
    title: 'Electoral Commission',
    description: 'Official guidance on voting and elections',
    url: 'https://www.electoralcommission.org.uk/',
    icon: 'vote'
  },
  {
    title: 'Citizens Advice',
    description: 'Free, confidential advice on legal and practical issues',
    url: 'https://www.citizensadvice.org.uk/',
    icon: 'help'
  },
  {
    title: 'GOV.UK',
    description: 'Official government services and information',
    url: 'https://www.gov.uk/',
    icon: 'building'
  },
  {
    title: 'Parliament.uk',
    description: 'Official UK Parliament website and resources',
    url: 'https://www.parliament.uk/',
    icon: 'users'
  }
];

const getIcon = (iconName?: string) => {
  switch (iconName) {
    case 'vote': return <Vote className="w-5 h-5" />;
    case 'help': return <HelpCircle className="w-5 h-5" />;
    case 'building': return <Building className="w-5 h-5" />;
    case 'users': return <Users className="w-5 h-5" />;
    default: return <ExternalLink className="w-5 h-5" />;
  }
};

export function ResourceCards() {
  return (
    <div className="mt-6">
      <p className="text-slate-300 mb-4">
        For legal advice or voting guidance, please visit these official resources:
      </p>
      <div className="grid sm:grid-cols-2 gap-3">
        {RESOURCE_CARDS.map((resource) => (
          <a
            key={resource.title}
            href={resource.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-start space-x-3 p-4 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px]"
          >
            <div className="text-blue-400 mt-0.5 flex-shrink-0">
              {getIcon(resource.icon)}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-slate-200 text-sm mb-1">
                {resource.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                {resource.description}
              </p>
            </div>
            <ExternalLink className="w-4 h-4 text-slate-500 flex-shrink-0 mt-0.5" />
          </a>
        ))}
      </div>
    </div>
  );
}