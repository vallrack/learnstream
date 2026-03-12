'use client';

import React from 'react';
import Image from 'next/image';
import { Badge } from '@/components/ui/badge';
import { Crown, ShieldCheck, Award, Calendar, CheckCircle2 } from 'lucide-react';

interface CourseCertificateProps {
  studentName: string;
  courseTitle: string;
  technology: string;
  isPremium: boolean;
  completionDate: string;
  modulesCount: number;
}

export function CourseCertificate({
  studentName,
  courseTitle,
  technology,
  isPremium,
  completionDate,
  modulesCount,
}: CourseCertificateProps) {
  // Direct links as requested
  const logoUrl = "https://dprogramadores.com.co/img/logoD.png";
  const signatureUrl = "https://drive.google.com/uc?export=view&id=1w2nzR-tylvAKiHe02fzdTKpRD7icoJua";

  return (
    <div className="relative w-full max-w-4xl aspect-[1.414/1] bg-white border-[16px] border-slate-900 p-12 flex flex-col items-center justify-between text-center overflow-hidden shadow-2xl">
      {/* Decorative Background Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-full -translate-y-1/2 translate-x-1/2 opacity-50" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 opacity-30" />
      
      {/* Academic Border Inset */}
      <div className="absolute inset-4 border-2 border-slate-200 pointer-events-none" />

      {/* Header with Logo */}
      <header className="relative z-10 w-full flex flex-col items-center gap-4">
        <div className="relative w-24 h-24 mb-2">
          <Image 
            src={logoUrl} 
            alt="DProgramadores Logo" 
            fill 
            className="object-contain" 
          />
        </div>
        <div className="space-y-1">
          <h1 className="text-4xl font-headline font-bold tracking-tighter text-slate-900 uppercase">
            DProgramadores Academy
          </h1>
          <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">
            Excelencia en Desarrollo de Software y Tecnología
          </p>
        </div>
      </header>

      {/* Main Body */}
      <main className="relative z-10 flex flex-col items-center gap-8 py-10">
        <div className="space-y-2">
          <p className="text-lg italic font-serif text-slate-600">Este diploma certifica que</p>
          <h2 className="text-5xl font-headline font-bold text-primary px-8 border-b-2 border-slate-100 pb-2">
            {studentName}
          </h2>
        </div>

        <div className="max-w-2xl space-y-4">
          <p className="text-lg leading-relaxed text-slate-700">
            Ha completado satisfactoriamente el programa de formación profesional en:
          </p>
          <div className="space-y-2">
            <h3 className="text-3xl font-headline font-bold text-slate-900">
              {courseTitle}
            </h3>
            <div className="flex items-center justify-center gap-2">
              <Badge variant="secondary" className="bg-slate-100 text-slate-700 font-bold px-3">
                Tecnología: {technology}
              </Badge>
              {isPremium ? (
                <Badge className="bg-amber-100 text-amber-700 border-amber-200 font-bold px-3 gap-1">
                  <Crown className="h-3 w-3" /> Nivel Profesional Premium
                </Badge>
              ) : (
                <Badge variant="outline" className="border-slate-200 text-slate-500 font-bold px-3">
                  Nivel Fundamental
                </Badge>
              )}
            </div>
          </div>
        </div>

        <p className="text-sm text-slate-500 max-w-xl">
          {isPremium 
            ? `Certificación avanzada que incluye el dominio de conceptos fundamentales y arquitecturas premium, completando un total de ${modulesCount} módulos académicos evaluados.`
            : `Certificación de fundamentos que valida el conocimiento de los conceptos básicos y esenciales del programa de estudio.`
          }
        </p>
      </main>

      {/* Footer with Signature and Security */}
      <footer className="relative z-10 w-full grid grid-cols-3 items-end pt-8">
        <div className="flex flex-col items-start gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
            <Calendar className="h-4 w-4" />
            Fecha de Emisión: {completionDate}
          </div>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase">
            <Award className="h-4 w-4" />
            ID: DF-{Math.random().toString(36).substring(7).toUpperCase()}
          </div>
        </div>

        <div className="flex flex-col items-center gap-2 border-t border-slate-200 pt-4">
          <div className="relative w-48 h-16">
            <Image 
              src={signatureUrl} 
              alt="Firma Director" 
              fill 
              className="object-contain" 
            />
          </div>
          <div className="text-center">
            <p className="text-sm font-bold text-slate-900">Daniel Morales</p>
            <p className="text-[10px] font-medium text-slate-500 uppercase">Director Académico</p>
          </div>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="bg-slate-900 p-4 rounded-xl text-white flex items-center gap-3">
            <ShieldCheck className="h-8 w-8 text-emerald-400" />
            <div className="text-left">
              <p className="text-[10px] font-bold opacity-70 uppercase">Validación</p>
              <p className="text-xs font-bold">Autenticidad Verificada</p>
            </div>
          </div>
        </div>
      </footer>

      {/* Security Watermark */}
      <div className="absolute bottom-10 left-10 pointer-events-none opacity-[0.03] rotate-[-25deg]">
        <Award className="w-96 h-96" />
      </div>
    </div>
  );
}