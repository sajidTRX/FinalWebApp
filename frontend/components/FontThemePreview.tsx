'use client';

import { useFontTheme } from '@/hooks/useFontTheme';
import { fontThemes } from '@/lib/font-themes';

/**
 * Font Theme Preview Component
 * Shows preview of current font with sample text in different languages
 * Useful for testing font rendering
 */
export function FontThemePreview() {
  const { currentTheme, themeConfig } = useFontTheme();

  if (!currentTheme) return null;

  // Sample text in multiple languages to test font rendering
  const sampleTexts = [
    {
      lang: 'English',
      text: 'The quick brown fox jumps over the lazy dog. Pack my box with five dozen liquor jugs.',
    },
    {
      lang: 'Spanish',
      text: 'El rápido zorro marrón salta sobre el perro perezoso.',
    },
    {
      lang: 'French',
      text: 'Le renard brun rapide saute par-dessus le chien paresseux.',
    },
    {
      lang: 'German',
      text: 'Der schnelle braune Fuchs springt über den faulen Hund.',
    },
    {
      lang: 'Japanese',
      text: 'すばやい茶色のキツネが怠け者の犬を飛び越えます。',
    },
    {
      lang: 'Arabic',
      text: 'الثعلب البني السريع يقفز فوق الكلب الكسول.',
    },
    {
      lang: 'Chinese (Simplified)',
      text: '敏捷的棕色狐狸跳过懒狗。',
    },
    {
      lang: 'Hindi',
      text: 'तेज भूरी लोमड़ी आलसी कुत्ते के ऊपर कूदती है।',
    },
  ];

  return (
    <div className="space-y-6 rounded-lg border border-gray-200 bg-white p-6">
      <div className="space-y-2">
        <h3 className="text-lg font-semibold text-gray-900">Font Preview</h3>
        <p className="text-sm text-gray-600">
          Current Font: <span className="font-semibold">{themeConfig.name}</span>
        </p>
        <p className="text-sm text-gray-500">{themeConfig.fontStack}</p>
      </div>

      <div className="space-y-6">
        {/* Heading sizes */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Heading Sizes</h4>
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              Heading Level 1 - 3xl Bold
            </h1>
            <h2 className="text-2xl font-semibold">
              Heading Level 2 - 2xl Semibold
            </h2>
            <h3 className="text-xl font-medium">
              Heading Level 3 - xl Medium
            </h3>
          </div>
        </div>

        {/* Body text */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Body Text</h4>
          <div className="space-y-2">
            <p className="text-lg font-normal">
              This is regular text at large size (18px)
            </p>
            <p className="text-base font-normal">
              This is regular text at base size (16px). Lorem ipsum dolor sit
              amet, consectetur adipiscing elit. Sed do eiusmod tempor
              incididunt ut labore et dolore magna aliqua.
            </p>
            <p className="text-sm font-normal">
              This is small text (14px) with normal weight. The quick brown fox
              jumps over the lazy dog.
            </p>
          </div>
        </div>

        {/* Font weights */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Font Weights</h4>
          <div className="space-y-1">
            <p style={{ fontWeight: 300 }}>Light (300) - Excellent readability</p>
            <p style={{ fontWeight: 400 }}>Normal (400) - Standard text</p>
            <p style={{ fontWeight: 500 }}>Medium (500) - Slightly emphasized</p>
            <p style={{ fontWeight: 600 }}>Semibold (600) - More emphasis</p>
            <p style={{ fontWeight: 700 }}>Bold (700) - Strong emphasis</p>
          </div>
        </div>

        {/* Multilingual test */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">
            Multilingual Text Rendering
          </h4>
          <div className="space-y-3 rounded-md bg-gray-50 p-4">
            {sampleTexts.map((sample, index) => (
              <div key={index} className="space-y-1">
                <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
                  {sample.lang}
                </p>
                <p className="text-base">{sample.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Long text test */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-gray-700">Long Text Rendering</h4>
          <div className="rounded-md bg-gray-50 p-4 text-base leading-relaxed">
            <p>
              The journey of a thousand miles begins with a single step. In a world filled
              with endless possibilities and challenges, we often find ourselves standing at
              crossroads, uncertain about which path to take. But what truly matters is not
              the destination, but the experiences we gather along the way, the people we
              meet, and the lessons we learn. Every moment is an opportunity to grow, to
              understand ourselves better, and to make a positive impact on the world around
              us. Whether we choose the road less traveled or the well-worn path, what counts
              is that we move forward with purpose, compassion, and determination. Life is
              not about reaching perfection; it&apos;s about embracing our imperfections,
              learning from our mistakes, and continuing to strive for excellence in all that
              we do.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
