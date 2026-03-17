
'use client';

import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useEffect, useState } from 'react';

export function FloatingWhatsApp() {
  const [mounted, setMounted] = useState(false);
  const phoneNumber = '573054694239';
  const message = encodeURIComponent('Hola LearnStream, me gustaría recibir más información sobre los cursos y el plan Premium.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-[60] group">
      <div className="absolute -top-12 right-0 bg-white px-4 py-2 rounded-xl shadow-xl border border-slate-100 text-xs font-bold text-slate-600 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        ¿Necesitas ayuda? Chatea con nosotros
      </div>
      <a 
        href={whatsappUrl} 
        target="_blank" 
        rel="noopener noreferrer"
        className="block"
      >
        <Button 
          size="icon" 
          className="h-16 w-16 rounded-full bg-[#25D366] hover:bg-[#20ba56] shadow-2xl shadow-emerald-500/40 border-4 border-white transition-transform hover:scale-110 active:scale-95"
        >
          <MessageCircle className="h-8 w-8 text-white fill-current" />
        </Button>
      </a>
    </div>
  );
}
