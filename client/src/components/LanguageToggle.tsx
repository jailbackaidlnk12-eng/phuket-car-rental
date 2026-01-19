import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="flex items-center gap-2">
      <Globe className="w-4 h-4" />
      <Button
        variant={language === 'en' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('en')}
        className="min-w-10"
      >
        EN
      </Button>
      <Button
        variant={language === 'th' ? 'default' : 'outline'}
        size="sm"
        onClick={() => setLanguage('th')}
        className="min-w-10"
      >
        TH
      </Button>
    </div>
  );
}
