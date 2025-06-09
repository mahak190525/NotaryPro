import React from 'react';
import { Bell, Mail, MessageSquare, Link } from 'lucide-react';

export default function AutomationCapabilities() {
  const automationFeatures = [
    {
      icon: Bell,
      title: "Automatic Reminders",
      description: "Never miss an appointment with smart notification systems"
    },
    {
      icon: Mail,
      title: "Email Templates",
      description: "Professional email templates for common notary communications"
    },
    {
      icon: MessageSquare,
      title: "SMS Integration",
      description: "Automated text message confirmations and updates"
    },
    {
      icon: Link,
      title: "Platform Integration",
      description: "Seamless connection with major signing platforms and services"
    }
  ];

  return (
    <section id="automation" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Powerful Automation Features
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Save time and reduce manual work with intelligent automation that handles 
            routine tasks so you can focus on serving your clients.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {automationFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg transition-all duration-200">
              <div className="bg-green-100 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {feature.title}
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}