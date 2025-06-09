import React, { useState } from 'react';
import { Check, Star, ArrowRight, Shield, Zap, Users, Crown } from 'lucide-react';

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'Starter',
      description: 'Perfect for new notaries getting started',
      icon: Star,
      monthlyPrice: 19,
      yearlyPrice: 190,
      savings: 38,
      features: [
        'Up to 50 appointments per month',
        'Basic mileage tracking',
        'Receipt capture and storage',
        'Simple invoicing',
        'Email support',
        'Mobile app access',
        'Basic reporting'
      ],
      limitations: [
        'Limited automation features',
        'Basic templates only'
      ],
      popular: false,
      cta: 'Start Free Trial'
    },
    {
      name: 'Professional',
      description: 'Most popular for growing notary businesses',
      icon: Zap,
      monthlyPrice: 39,
      yearlyPrice: 390,
      savings: 78,
      features: [
        'Unlimited appointments',
        'Advanced mileage tracking with GPS',
        'Unlimited receipt storage',
        'Professional invoicing with branding',
        'Email and phone support',
        'Mobile app with offline sync',
        'Advanced reporting and analytics',
        'Automated reminders and follow-ups',
        'Custom email templates',
        'SMS notifications',
        'Electronic journal with signatures',
        'Tax optimization tools'
      ],
      limitations: [],
      popular: true,
      cta: 'Start Free Trial'
    },
    {
      name: 'Enterprise',
      description: 'For established notary businesses and teams',
      icon: Crown,
      monthlyPrice: 79,
      yearlyPrice: 790,
      savings: 158,
      features: [
        'Everything in Professional',
        'Multi-user accounts (up to 5 users)',
        'Advanced automation workflows',
        'Custom integrations',
        'Priority support with dedicated manager',
        'White-label mobile app',
        'Advanced security features',
        'Custom reporting and dashboards',
        'API access',
        'Training and onboarding',
        'Compliance assistance',
        'Data export and backup'
      ],
      limitations: [],
      popular: false,
      cta: 'Contact Sales'
    }
  ];

  const addOns = [
    {
      name: 'Additional Users',
      description: 'Add more team members to your account',
      price: 15,
      unit: 'per user/month'
    },
    {
      name: 'Premium Support',
      description: '24/7 phone support with 1-hour response time',
      price: 29,
      unit: 'per month'
    },
    {
      name: 'Custom Integration',
      description: 'Connect with your existing business tools',
      price: 199,
      unit: 'one-time setup'
    }
  ];

  const faqs = [
    {
      question: 'Is there a free trial?',
      answer: 'Yes! We offer a 30-day free trial with full access to all features. No credit card required to start.'
    },
    {
      question: 'Can I change plans anytime?',
      answer: 'Absolutely. You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. Enterprise customers can also pay by invoice.'
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes, we use bank-level encryption and are SOC 2 compliant. Your data is backed up daily and stored securely in the cloud.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'We offer a 30-day money-back guarantee. If you\'re not satisfied within the first 30 days, we\'ll provide a full refund.'
    },
    {
      question: 'Can I export my data?',
      answer: 'Yes, you can export all your data at any time in standard formats (CSV, PDF). Enterprise plans include additional export options.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Choose the perfect plan for your notary business. All plans include a 30-day free trial 
            and can be upgraded or downgraded at any time.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-8">
            <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly')}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                billingCycle === 'yearly' ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  billingCycle === 'yearly' ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`text-sm font-medium ${billingCycle === 'yearly' ? 'text-gray-900' : 'text-gray-500'}`}>
              Yearly
            </span>
            {billingCycle === 'yearly' && (
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                Save up to 20%
              </span>
            )}
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="grid lg:grid-cols-3 gap-8 mb-16">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-sm border-2 transition-all duration-200 hover:shadow-lg ${
                plan.popular 
                  ? 'border-blue-500 ring-2 ring-blue-200' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="p-8">
                <div className="flex items-center mb-4">
                  <plan.icon className={`h-8 w-8 mr-3 ${plan.popular ? 'text-blue-600' : 'text-gray-600'}`} />
                  <h3 className="text-2xl font-bold text-gray-900">{plan.name}</h3>
                </div>
                
                <p className="text-gray-600 mb-6">{plan.description}</p>
                
                <div className="mb-6">
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">
                      ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                    </span>
                    <span className="text-gray-500 ml-2">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  </div>
                  {billingCycle === 'yearly' && plan.savings > 0 && (
                    <p className="text-green-600 text-sm font-medium mt-1">
                      Save ${plan.savings} per year
                    </p>
                  )}
                </div>
                
                <button
                  className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors mb-6 ${
                    plan.popular
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                  }`}
                >
                  {plan.cta}
                </button>
                
                <div className="space-y-3">
                  {plan.features.map((feature, featureIndex) => (
                    <div key={featureIndex} className="flex items-start">
                      <Check className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-700 text-sm">{feature}</span>
                    </div>
                  ))}
                  {plan.limitations.map((limitation, limitIndex) => (
                    <div key={limitIndex} className="flex items-start opacity-60">
                      <span className="text-gray-400 mr-3 mt-0.5">×</span>
                      <span className="text-gray-500 text-sm">{limitation}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add-ons */}
        <div className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Add-ons & Extras</h2>
            <p className="text-gray-600">Enhance your plan with additional features and support</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6">
            {addOns.map((addon, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{addon.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{addon.description}</p>
                <div className="flex items-baseline">
                  <span className="text-2xl font-bold text-gray-900">${addon.price}</span>
                  <span className="text-gray-500 text-sm ml-2">{addon.unit}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Trust Indicators */}
        <div className="bg-white rounded-2xl p-8 mb-16 border border-gray-200">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Trusted by 10,000+ Notaries</h2>
            <p className="text-gray-600">Join thousands of notary professionals who trust NotaryPro</p>
          </div>
          
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <Shield className="h-8 w-8 text-blue-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">Bank-Level Security</h3>
              <p className="text-gray-600 text-sm">SOC 2 compliant with 256-bit encryption</p>
            </div>
            <div>
              <Users className="h-8 w-8 text-green-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">99.9% Uptime</h3>
              <p className="text-gray-600 text-sm">Reliable service you can count on</p>
            </div>
            <div>
              <Star className="h-8 w-8 text-yellow-500 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">4.9/5 Rating</h3>
              <p className="text-gray-600 text-sm">From 2,500+ verified reviews</p>
            </div>
            <div>
              <Zap className="h-8 w-8 text-purple-600 mx-auto mb-3" />
              <h3 className="font-semibold text-gray-900 mb-1">24/7 Support</h3>
              <p className="text-gray-600 text-sm">Get help whenever you need it</p>
            </div>
          </div>
        </div>

        {/* FAQ */}
        <div className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
            <p className="text-gray-600">Everything you need to know about our pricing and plans</p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of notary professionals who have streamlined their business with NotaryPro. 
            Start your free trial today—no credit card required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center">
              Start Free Trial
              <ArrowRight className="ml-2 h-5 w-5" />
            </button>
            <button className="border-2 border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 rounded-lg font-semibold transition-colors">
              Schedule Demo
            </button>
          </div>
          <p className="text-blue-200 text-sm mt-4">30-day free trial • No setup fees • Cancel anytime</p>
        </div>
      </div>
    </div>
  );
}