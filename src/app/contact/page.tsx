'use client';

import Layout from '@/components/Layout';
import { Mail, MessageCircle, Send, Clock, Globe } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useState } from 'react';

export default function ContactPage() {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const { name, email, subject, message } = formData;
    const mailtoLink = `mailto:support@aiicg.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(
      `姓名: ${name}\n邮箱: ${email}\n\n消息内容:\n${message}`
    )}`;
    window.location.href = mailtoLink;
  };

  return (
    <Layout>
      {/* Header Section */}
      <section className="bg-gradient-to-br from-secondary-50 via-white to-accent-50 dark:from-neutral-900 dark:via-neutral-900 dark:to-neutral-800 py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-2xl flex items-center justify-center">
                <MessageCircle className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('contact.title')}
            </h1>
            <p className="text-xl text-neutral-600 dark:text-neutral-400 max-w-3xl mx-auto">
              {t('contact.subtitle')}
            </p>
          </div>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Email Contact */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-xl flex items-center justify-center mr-4">
                  <Mail className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {t('contact.email.title')}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t('contact.email.subtitle')}
                  </p>
                </div>
              </div>

              <form onSubmit={handleEmailSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      {t('contact.form.name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                      placeholder={t('contact.form.namePlaceholder')}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                      {t('contact.form.email')}
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                      placeholder={t('contact.form.emailPlaceholder')}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {t('contact.form.subject')}
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                    placeholder={t('contact.form.subjectPlaceholder')}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                    {t('contact.form.message')}
                  </label>
                  <textarea
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => handleInputChange('message', e.target.value)}
                    className="w-full px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white placeholder-neutral-500 dark:placeholder-neutral-400"
                    placeholder={t('contact.form.messagePlaceholder')}
                  />
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <Send className="h-4 w-4 mr-2" />
                  {t('contact.form.send')}
                </button>
              </form>

              <div className="mt-6 p-4 bg-neutral-50 dark:bg-neutral-700 rounded-lg">
                <p className="text-sm text-neutral-600 dark:text-neutral-400">
                  <strong>{t('contact.email.direct')}:</strong> 
                  <a href="mailto:support@aiicg.com" className="text-primary-600 dark:text-primary-400 hover:underline ml-1">
                    support@aiicg.com
                  </a>
                </p>
              </div>
            </div>

            {/* Telegram Contact */}
            <div className="bg-white dark:bg-neutral-800 rounded-2xl shadow-lg border border-neutral-200 dark:border-neutral-700 p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-secondary-500 to-accent-500 rounded-xl flex items-center justify-center mr-4">
                  <MessageCircle className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">
                    {t('contact.telegram.title')}
                  </h2>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t('contact.telegram.subtitle')}
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MessageCircle className="h-12 w-12 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-neutral-900 dark:text-white mb-2">
                    AIICG Bot
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400 mb-6">
                    {t('contact.telegram.description')}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <MessageCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                        {t('contact.telegram.fastResponse')}
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        {t('contact.telegram.responseTime')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Clock className="h-5 w-5 text-green-600 dark:text-green-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-green-900 dark:text-green-100">
                        {t('contact.telegram.available')}
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        {t('contact.telegram.timezone')}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <Globe className="h-5 w-5 text-purple-600 dark:text-purple-400 mr-3" />
                    <div>
                      <p className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        {t('contact.telegram.language')}
                      </p>
                      <p className="text-xs text-purple-700 dark:text-purple-300">
                        {t('contact.telegram.languages')}
                      </p>
                    </div>
                  </div>
                </div>

                <a
                  href="https://t.me/aiicgbot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center px-6 py-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors duration-200"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  {t('contact.telegram.startChat')}
                </a>

                <div className="text-center">
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {t('contact.telegram.botHandle')}: <span className="font-mono">@aiicgbot</span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-900">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              {t('contact.faq.title')}
            </h2>
            <p className="text-lg text-neutral-600 dark:text-neutral-400">
              {t('contact.faq.subtitle')}
            </p>
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                {t('contact.faq.q1')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('contact.faq.a1')}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                {t('contact.faq.q2')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('contact.faq.a2')}
              </p>
            </div>

            <div className="bg-white dark:bg-neutral-800 rounded-xl p-6 border border-neutral-200 dark:border-neutral-700">
              <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-3">
                {t('contact.faq.q3')}
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                {t('contact.faq.a3')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Support Hours */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-primary-900/20 dark:to-secondary-900/20 rounded-2xl p-8 border border-primary-200 dark:border-primary-800">
            <div className="text-center">
              <Clock className="h-12 w-12 text-primary-600 dark:text-primary-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white mb-4">
                {t('contact.support.title')}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    {t('contact.support.email')}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t('contact.support.emailHours')}
                  </p>
                </div>
                <div className="text-center">
                  <h3 className="font-semibold text-neutral-900 dark:text-white mb-2">
                    {t('contact.support.telegram')}
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    {t('contact.support.telegramHours')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
} 